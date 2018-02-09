#!/usr/bin/python

"""
script per creare il form di gestione dei servizi WebGIS gia' esistente usando le configurazioni da DB

OTTIMIZZAZIONI:

"""

from config import *

import re,os,sys
import cgi
import cgitb; cgitb.enable()
import commands
import json
#import pg
#import urllib
#import simplejson
#from unicodedata import normalize
reload(sys)
sys.setdefaultencoding('UTF-8')
#print sys.getdefaultencoding()

#from pyproj import Proj, transform
#import psycopg2
#import pyproj
#from datetime import datetime, timedelta
import sqlalchemy
from sqlalchemy import Column, ForeignKey
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import Integer, Unicode, String, Float
from sqlalchemy.sql import text
import warnings
import logging
#from sys import argv
Base = declarative_base()
global schema
schema = 'public'
warnings.filterwarnings('ignore') #cosi' dovrei evitare sul log i warnings

print "Content-type:text/html\r\n\r\n"

fs = cgi.FieldStorage()
try:
  root_dir_html = str(fs["root_dir_html"].value)
except:
  root_dir_html = ""

try:
  step = int(fs["step"].value)
  assert step in [1,2,3], "valore variabile 'step' non consentita"
  if "id_stab" in fs:
    id_stab = str(fs["id_stab"].value)
except AssertionError, e:
  print e.args
  exit()
except:
  print "Error parsing parameters: need 'step' and 'root_dir_html' variable"
  exit()


page_template = '''
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" href="%(root_dir_html)s/ol_v3.14.2-dist/ol.css" />
<!-- <link rel="stylesheet" href="%(root_dir_html)s/jQuery/bootstrap-theme.min.css" />
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/jquery-ui.css" /> -->
<!-- <link rel="stylesheet" href="%(root_dir_html)s/jQuery/jquery.dataTables.min.css" /> -->
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/jquery.mobile-1.4.5.css" />
<link rel="stylesheet" href="%(root_dir_html)s/ol_v3.14.2-dist/ol3-layerswitcher.css" />

<title>%(title)s</title>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="WebGIS portable">
<meta name="Description" content="Gestione semplice di un WebGIS portatile">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script src="%(root_dir_html)s/ol_v3.14.2-dist/ol.js"></script>
<script src="%(root_dir_html)s/ol_v3.14.2-dist/ol3-layerswitcher.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery-1.10.2.js"></script>
<!-- <script src="%(root_dir_html)s/jQuery/jquery-ui.js"></script> -->
<script src="%(root_dir_html)s/jQuery/jquery.mobile-1.4.5.js"></script>
<!-- <script src="%(root_dir_html)s/jQuery/jquery.dataTables.min.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery.dataTables.columnFilter.js"></script> -->
<script>
var root_dir_html="%(root_dir_html)s";

var screen_h = parseInt(screen.height);
var screen_w = parseInt(screen.width);
var percent = 0.4;

/*var lon_center = 12;
var lat_center = 43;
var x_center = 950000;
var y_center = 5600000;
var zoom_center = 6;*/

document.namespaces; //altrimenti IE da errore...

$( document ).ready(function() {
    %(document_ready_fn)s;
    //Proviamo ad allineare alcuni div - poi sarebbe da portare nel python se funziona:
    /*$("#map2").position({
            my: "center",
            at: "left bottom",
            of: "#choose_stab"
        });*/
})

function allowValue(objectDrop) {
    var selectedVal = objectDrop.value;
    if (selectedVal != "000") {
	$('#value').prop("disabled", false);
	var title2 = $('#drop option:selected').attr('title');
	$('.cat_sost').html('<i>'+title2+'</i>');
    }
    else  {
	$('#value').prop("disabled", true);
	$('#value').val('');
	$('#addValue').prop("disabled", true);
    }
}
function activeBtn(value) {
    $('#addValue').prop("disabled", value);
}

$(function() {
    $("#get_map_info").click(function() {
	new_zoom = map.getView().getZoom();
        $("#zoom_center").val(new_zoom);
        new_center = map.getView().getCenter();
        new_center_ll = ol.proj.transform(new_center, 'EPSG:3857', 'EPSG:4326');
	$("#lon_center").val(new_center_ll[0].toFixed(2));
	$("#lat_center").val(new_center_ll[1].toFixed(2));
    });
});

function checkValue() {
    if (selected.length == 0) {
	alert("Devi selezionare almeno un elemento dalla tabella!");
        return false;
    }
    else if (selected.length > 0) {
	//Prima di tutto chiedo conferma e faccio definire il nome del layer da far apparire in legenda:
	//Costruisco il contenuto della finestra di conferma:
        var title_addlayer = "Conferma dati per la tabella "+ $('#'+selected+'').find('#tablename').html() +":";
        var html_addlayer = "<p> Inserisci il nome da dare in legenda per questo layer <br/>"+
		"<input type='text' id='layer_name'> </input>" +
		"</p>";
        /*$.each( jsonArg1, function( key_obj, value_obj ) {
            html_addlayer += key_obj + ": <br/>";
            $.each( value_obj, function( key_obj2, value_obj2 ) {
                html_addlayer += key_obj2 + ": " + value_obj2 + "<br/>";
            });
        });*/
        $("#dialog-addlayer").html(html_addlayer);
        // Define the Dialog and its properties.
        $("#dialog-addlayer").dialog({
            resizable: false,
            modal: true,
            title: title_addlayer,
            height: 250,
            width: 500,
            buttons: {
                "Aggiungi layer": function () {
		    layer_name = $('#layer_name').val();
                    $(this).dialog('close');
		    addlayer2layertb(layer_name);
                },
                "Aspe'...": function () {
                    $(this).dialog('close');
                }
            }
        });
	//L'inserimento dei dati nella tabella successiva deve avvenire tramite una funzione a parte...
    }
}

function remove_inserted(row_id) {
    //alert(row_id);
    riga = $('#layer_tb').find($('#'+row_id))
    //Altero l'informazione su UpdateOrInsert aggiungendo Remove:
    riga.find(".updateOrInsert").html('R')
    $("#"+row_id).css("display", "none");  // hides the row
    //NON lo rimetto nella griglia soprastante per non creare pasticci...!
    //Se il DIV resta vuoto, spengo il pulsante di conferma inserimento:
    if(!$.trim($(".toInsert").html())) {
        //Il DIV e' vuoto, spengo il pulsante:
        $('#confirm_insert').prop("disabled", true);
    }
    give_row_number(); //ricalcolo il numero riga
}

var id_stab_IN;
function openStep2() {
    id_stab_IN = $("#drop").val();
    nome_stab = $("#drop option:selected").text();
    console.log(id_stab_IN);
    uri_ok = "%(root_dir_html)s/cgi-bin/manage_webgis_service_from_db.py?root_dir_html=%(root_dir_html)s&step=2&id_stab="+id_stab_IN+"&nome="+nome_stab;
    window.open(uri_ok,'_self');
}

var oggetto;
function openStep3() {
    //Recupero gli elementi inseriti, richiedo una verifica utente e una conferma finale
    var nome_oggetto = $("#nome_oggetto").first().text();
    var id_oggetto = $($("#id_oggetto")[0]).text();
    oggetto = [id_oggetto, nome_oggetto];
    var jsonArg1 = new Object();
    //var pluginArrayArg = new Array();
    var p_tag = $( "tr" ); //recupero le varie righe della tabella dei layer definiti
    $('#toInsert').find(p_tag).each(function(index) {
      if (index>0) { //salto la prima riga che contiene la intestazione della tabella
        var input = $(this);
	input_id = (input.attr('id')).replace('p_','');
	var order_in_webgis = $(this).find(".order_in_webgis").html();
	//var group_index2pass = $(this).find(".group_index").html();
        var group_index2pass = $('#select_group'+input_id).val();
	var updateOrInsert = $(this).find(".updateOrInsert").html();
	var legendName = $(this).find(".legendName").html();
	sel = $(this).find(".select");
	hover = $(this).find(".highlight");
	var selection = 0;
	if (sel.find(".active").length > 0) selection = 1;
	if (hover.find(".active").length > 0) selection = 2;
	vis = $(this).find(".visible");
	if (vis.find(".active").length > 0) visible = 1;
	else visible = 0;
	jsonArg1[input_id] = new Object();
        jsonArg1[input_id]['order_in_webgis'] = order_in_webgis;
        jsonArg1[input_id]['legend_group_idx'] = group_index2pass;
	jsonArg1[input_id]['updateOrInsert'] = updateOrInsert;
	jsonArg1[input_id]['legendName'] = legendName;
	jsonArg1[input_id]['select_highlight'] = selection;
	jsonArg1[input_id]['visible'] = visible;
	//pluginArrayArg.push(jsonArg1);
        //alert('ID: ' + input.attr('id') + 'Name: ' + input.attr('name') + 'Value: ' + input.val());
      }
    });
    //Costruisco il contenuto della finestra di conferma:
    var title_confirm = "Conferma dati per "+nome_oggetto+":";
    var html_confirm = "";
    $.each( jsonArg1, function( key_obj, value_obj ) {
        html_confirm += key_obj + ": <br/>";
        $.each( value_obj, function( key_obj2, value_obj2 ) {
	    html_confirm += key_obj2 + ": " + value_obj2 + "<br/>";
        });
    });
    $("#dialog-confirm").html(html_confirm);
    // Define the Dialog and its properties.
    $("#dialog-confirm").dialog({
        resizable: false,
        modal: true,
        title: title_confirm,
        height: 550,
        width: 500,
        buttons: {
            "Sono convinto!": function () {
                $(this).dialog('close');
                callback(true, jsonArg1, table_insert);
            },
                "Ci ripenso...": function () {
                $(this).dialog('close');
                //callback(false);
            }
        }
    });
}
function callback(valide, data, dest_table) {
    var data_array = JSON.stringify(data);
    //Pass parameter with GET:
    //uri_final = "%(root_dir_html)s/cgi-bin/manage_webgis_service_from_db.py?step=3&data="+data_array+"&id_stab="+oggetto[0]+"&nome="+escape(oggetto[1])+"&dest_table="+dest_table+"&update="+update+"&root_dir_html=%(root_dir_html)s";
    //window.open(uri_final,'_self');
    //Pass parameter with POST:
    $('body').append($('<form/>')
  .attr({'action':'%(root_dir_html)s/cgi-bin/manage_webgis_service_from_db.py', 'method':'post', 'id':'replacer'})
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'root_dir_html', 'value':'%(root_dir_html)s'})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'step', 'value':3})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'data', 'value':data_array})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'id_stab', 'value':oggetto[0]})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'nome', 'value':escape(oggetto[1])})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'dest_table', 'value':dest_table})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'update', 'value':update})
  )
    ).find('#replacer').submit();
}

function closeThis()
{
//A quanto pare cmq non si puo aprire qlcosa che non e stato aperto da questo script
  //window.open('','_self');
  //window.close();
  window.top.close();
}

function geom_img(geometria) {
	switch (geometria) {
                case 'POLYGON': geometria_img = 'polygons.png'; break;
                case 'MULTIPOLYGON': geometria_img = 'polygons.png'; break;
                case 'LINESTRING': geometria_img = 'line.png'; break;
                case 'MULTILINESTRING': geometria_img = 'line.png'; break;
                case 'POINT': geometria_img = 'points.png'; break;
                case 'POINT': geometria_img = 'points.png'; break;
                case 'RASTER': geometria_img = 'raster.png'; break;
                default: geometria_img = '';
        }
	return geometria_img;
}
function selectORhighlight(value) {
    switch (value) {
	case 1: select_str='checked'; highlight_str='unchecked'; break;
	case 2: select_str='checked'; highlight_str='checked'; break;
	default: select_str='unchecked'; highlight_str='unchecked'; 
    }
    return select_str, highlight_str;
}

//Variabili importate da PYTHON:
%(variables_from_py)s
</script>
<style>
/*Usando jquery mobile devo definire gli stili in modo diverso*/
.ui-page, .ui-body-c, .ui-page-active, .ui-overlay-c, .ui-mobile-viewport
{
    background: transparent !important;
}
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);} h1 {font-size:1em;}
body, .ui-overlay-a
{
    background: url(%(root_dir_html)s/common/background_img/sketch.jpg) !important;
    /*background-repeat:repeat-y !important;
    background-position:center center !important;
    background-attachment:scroll !important;
    background-size:100% 100% !important;*/
}
#main_table { font-size: small; }
.legendName {font-weight: bold;}

#opzioni_mappa {
    float: left;
    clear:both;
    /*position: relative;*/
    display: inline-block;
    padding: 10;
}
#map {
    /*float: right;
    position: relative;*/
    display: inline-block;
    padding: 10;
}
div.centerDiv{
    margin-left:auto;
    margin-right:auto;
}
.buttons{
    max-width: 320;
}
label.centerInput{
    margin-left:auto;
    margin-right:auto;
}
div.centerText, input.centerText{
    text-align: center;
}
</style>
</head>
<body>
<div class="frase_intro centerText" data-role="header" >
<p id="frase_intro"> %(frase_intro)s
<br/>
</p>
</div>
</br>
<div class="choose_stab">
%(choose_stab)s
</div>
</br>
<div class="cat_sost">
%(cat_sost)s
</div>
</br>
<div class="form_insert">
%(form_insert)s
</div>
</br>
<div class="toInsert" id="toInsert">
</div>
</br>
<div class="buttons centerDiv">
%(buttons)s
</div>
<div id="dialog-confirm">
</div>
<div id="dialog-addlayer">
<form action="" method="post">
</form>
</div>
</body>
</html>
'''

#STEP 1
def choose_stab():
    global engine
    source_table = "config.webgis_indici"
    radio_options = ""
    #dns = 'postgresql://webgis:webgis$2013%@localhost:5432/radar'
    engine = create_engine(dns)
    Base.metadata.bind = engine
    meta = MetaData()
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO config, public")
        meta = MetaData()
        sql = "SELECT webgis_idx AS column_name, webgis_name || '  #' || webgis_idx AS label, webgis_description FROM {0} ORDER BY webgis_name;".format(source_table)
        result = conn.execute(text(sql))
        dropdown = """<select name="drop" id="drop" onChange="allowValue(this);">"""
        dropdown += """<option value="000"> --Seleziona il webgis--</option>"""
        for row in result:
            dropdown += """<option title="%s" value="%s"> %s </option>""" % (row['webgis_description'], row['column_name'], row['label'])
        
    dropdown += """</select>"""
    ##radio_options += """</br> Tipo di dati da inserire: <br> <label for="sostanze">Sostanze</label> <input type="radio" name="table" id="sostanze" value="v_maskdataentry_sostanze" checked> <br> <label for="categorie">Categorie</label> <input type="radio" name="table" id="categorie" value="v_maskdataentry_categorie">"""
    frase_intro = "Scegli il servizio WebGis da configurare:"
    btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    #btn_annulla = "<button type='button'>Annulla e torna indietro</button>"
    btn_ok = "<button type='button' id='value' disabled onClick='openStep2();' >Conferma e procedi</button>"
    btns = btn_esc + "&nbsp;" + btn_ok

    #print page_template % ('Scelta servizio WebGIS', '', frase_intro, dropdown, radio_options, '', btns)
    print page_template % {'root_dir_html':root_dir_html, 'title':'Scelta servizio WebGIS', 'variables_from_py':'', 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':radio_options, 'form_insert':'', 'buttons':btns, 'document_ready_fn':''}

    #Se la finestra viene aperta a partire da uno stabilimento lo seleziono:
    if id_stab:
        print '<script>$("#drop").val(%s);</script>' % (id_stab)
        print '<script>document.getElementById("value").disabled = false;</script>'
    conn.close()


#STEP 2
def manage_service():
    #Scarico le configurazioni gia' definite per questo webgis:
    Base.metadata.bind = engine
    meta = MetaData()
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(columns_schema))
        meta = MetaData()
        sql = "SELECT * FROM {0} WHERE webgis_idx={1} ORDER BY tools_idx;".format(table_from, id_stab)
        result = conn.execute(text(sql))

        print "<script>"
        checked_from_db = ''

        #Inizio a costruire l'elenco delle checkbox con i TOOLS disponibili:
        for first_row in result:
            print '''var lat_center = %s;''' % (first_row['lat_center'])
            print '''var lon_center = %s;''' % (first_row['lon_center'])
            print '''var zoom_center = %s;''' % (first_row['zoom_center'])
            #Costruisco l'istruzione per checkare i tools attivi da DB:
            checked_from_db += "$('#%s').prop('checked', true).checkboxradio('refresh');" % (first_row['tools_idx'])
            #print '''var checked_from_db = $('#14').prop('checked', true).checkboxradio('refresh');'''

        print "</script>"

        result.close()

    conn.close()

    #Costruisco il form per le info sulla mappa:
    options_map = "<div id='opzioni_mappa'> Definizione mappa: <br/>"
    options_map += "<label class='centerInput' style='max-width:100px;'><input type='text' class='centerText' title='latitudine' id='lat_center'></label>"
    options_map += "<label class='centerInput' style='max-width:100px;'><input type='text' class='centerText' title='longitudine' id='lon_center'></label>"
    options_map += "<label class='centerInput' style='max-width:100px;'><input type='text' class='centerText' title='zoom' id='zoom_center'></label>" 
    options_map += "<button id='get_map_info'> get from map </button>"
    options_map += "</div>"
    #provo a metterci dentro il div della mappa:
    options_map += "<div id='map'>"
    #Costruisco la mappa OL 3:
    map_div = '''<script type="text/javascript">
      $('#map').width("600px");
      $('#map').height("400px");
      $('#map').css('border','1px solid black');
      //Definisco alcuni layer di base:
	var layerMQ = new ol.layer.Tile({title:'OSM MapQuest', type: 'base', visible: false, source: new ol.source.MapQuest({ layer: 'osm' }), name: 'OSM MapQuest' });
	var layerOSM = new ol.layer.Tile({title:'OpenStreetMap', type: 'base', visible: true, source: new ol.source.OSM(), name: 'OpenStreetMap' });
	var satellite = new ol.layer.Tile({title:'OSM Satellite', type: 'base', visible: false, source: new ol.source.MapQuest({layer: 'sat'}), name: 'OSM Satellite' });
	var osmGray = new ol.layer.Tile({title:'OSM Gray', type: 'base', visible: false, source: new ol.source.Stamen({layer: 'toner'}) });
	var wms_regione_raster = new ol.layer.Image({ title:'WMS Regione - raster',
	  type: 'base', visible: false,
      	  source: new ol.source.ImageWMS({
	    url: 'http://geomap.reteunitaria.piemonte.it/mapproxy/service?',
            params: {
	      'LAYERS': 'regp_basecarto10bn_2015'
            }
      	  })
	});
	var wms_regione_bn = new ol.layer.Tile({ title:'WMS Regione BN',
	  type: 'base', visible: false,
	  source: new ol.source.TileWMS({
          url: 'http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimsbasewms/wms_sfondo_cart_rif_bn?',
            params: { 'FORMAT': 'image/png', 'TILED': true,
              'LAYERS': 'SfondoCartRifBN'
            }
	  })
	});
	var wms_regione_colore = new ol.layer.Tile({ title:'WMS Regione',
          type: 'base', visible: false,
          source: new ol.source.TileWMS({
          url: 'http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimsbasewms/wms_sfondo_cart_rif?',
            params: { 'FORMAT': 'image/png', 'TILED': true,
              'LAYERS': 'SfondoCartRif'
            }
          })
        });
	var base_groups = new ol.layer.Group({ 'title': 'Base maps', layers: [
	  layerOSM, layerMQ, satellite, osmGray, wms_regione_colore, wms_regione_bn, wms_regione_raster
	]});
	var layerSwitcher = new ol.control.LayerSwitcher({
            tipLabel: 'Legenda' // Optional label for button
	});
      var map = new ol.Map({
        target: 'map',
        layers: [
	  base_groups
        ],
        controls: ol.control.defaults({
          attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
          })
        }),
        view: new ol.View({
          center: ol.proj.fromLonLat([lon_center, lat_center]),
          zoom: zoom_center
        })
      });
      map.addControl(layerSwitcher);
    </script>
    '''
    options_map += map_div
    options_map += "</div>"

    variabili = """var table_insert = '%s';""" % (table_insert)
    frase_intro = "Servizio WebGis \"<span id='nome_oggetto'>%s</span>\" (id. <span id='id_oggetto'>%s</span>)" % (nome_stab, id_stab)
    #btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    btn_esc = "<a data-role='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</a>"
    btn_annulla = '''<button type='button' id='backToStart' onClick="location.href='%s/cgi-bin/manage_webgis_service_from_db.py?step=1&root_dir_html=%s&origine=1&id_stab=%s';">Annulla e torna indietro</button>''' % (root_dir_html, root_dir_html, id_stab)
    btn_ok = "<button type='button' id='confirm_insert' disabled onClick='openStep3();' >Conferma inserimento/modifiche</button>"
    btns = btn_esc + "" + btn_annulla + "" + btn_ok
    insert_value = """<input type="button" id="addValue" value="Inserisci il layer" disabled onClick="checkValue();" />"""

    print page_template % {'root_dir_html':root_dir_html, 'title':'Gestione servizi WebGIS', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':options_map, 'cat_sost':options_tools, 'form_insert':insert_value, 'buttons':btns, 'document_ready_fn':checked_from_db}

    #Precompilo i campi della mappa:
    print ''''<script>
      $("#lon_center").val(lon_center);
      $("#lat_center").val(lat_center);
      $("#zoom_center").val(zoom_center);
    </script>
    '''

    #A quanto pare devo aggiornare l'elemento jquery mobile per organizzare le checkbox come si deve - INUTILE
    #print '''<script> $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh"); </script>'''

    return


def update_data():
    Base.metadata.bind = engine
    meta = MetaData()
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(columns_schema))
        meta = MetaData()
        #Scarico i layer gia' definiti per questo servizio WebGis:
        sql = "SELECT * FROM {0} WHERE webgis_idx={1} ORDER BY order_in_webgis;".format(table_from, id_stab)
        result = conn.execute(text(sql))
        print "<script>"

	#Inizio a costruire la tabella contenente i layer gia' definiti:
	print '''var table_str = "<table class='layer_tb' id='layer_tb'><th>#</th><th>Layer</th><th>Descrizione</th><th style='display:none;'>Ins/Upd</th><th>Gruppo</th><th colspan='3'>&nbsp;</th><th>Geometria</th><th colspan='2'>Ordine</th><th>&nbsp;</th><th>&nbsp;</th></table>";'''
	print '''$( ".toInsert" ).append(table_str);'''
        for first_row in result:
            #print '''var element_label = $("#drop option[value='%s']").text();''' % (first_row['layer_idx'])
            #perche' prendevo questo ID dal dropdown? Ora commento perche' nn voglio piu' vederlo...
            print '''var element_id = '%s';''' % (first_row['layer_idx'])
            print '''var value_toinsert = '%s';''' % (first_row['legend_name'])
	    print '''var value_description = "%s";''' % (first_row['layer_description'])
	    print '''var value_group = '%s';''' % (first_row['legend_group_name'])
            print '''var group_index = '%s';''' % (first_row['legend_group_idx'])
	    print '''var select_highlight = %i;''' % (first_row['select_highlight'])
	    print '''selectORhighlight(select_highlight);'''
	    print '''var visible = %i;''' % (first_row['visible'])
	    print '''if (visible==1) visible_str='checked'; else visible_str='unchecked';'''
	    print '''var geometria = '%s';''' % (first_row['geom_type'])
	    print '''geom_img(geometria);'''
            #Prima di recuperare gli elementi creo il select apposito per questo layer per selezionare il gruppo:
            select_group = """<select name="select_group%s" id="select_group%s" >""" % (first_row['layer_idx'], first_row['layer_idx'])
            select_group += options_tools
            select_group += """</select>"""
            print '''var select_group = '%s';''' % (select_group)
            #Adesso costruisco le varie righe che contengono i layer:
	    print '''var new_element = "<tr id=p_" + element_id + " class='tablerow'><td class='order_in_webgis'></td><td class='legendName'>" + value_toinsert + "</td> <td>" +value_description + "</td> " +
		"<td class='updateOrInsert' style='display:none;'>U</td>" +
                "<td class='group_index' style='text-align:center;'>" + select_group + "</td>" +
		"<td class='select' style='text-align:center;'><span class='button-checkbox'> <button type='button' class='btn' data-color='info'>select</button> <input type='checkbox' style='display:none;' class='hidden' " + select_str + " /> </span> </td>" +
		"<td class='highlight' style='text-align:center;'><span class='button-checkbox'> <button type='button' class='btn' data-color='primary'>hover</button> <input type='checkbox' style='display:none;' class='hidden' " + highlight_str + " /> </span> </td>" +
		"<td class='visible' style='text-align:center;'><span class='button-checkbox'> <button type='button' class='btn' data-color='success'>visible</button> <input type='checkbox' style='display:none;' class='hidden' " + visible_str + " /> </span> </td>" +
		"<td style='text-align:center;'><img src='"+root_dir_html+"/common/icons/"+geometria_img+"' title='"+geometria+"' width='30' class='geom_img' /></td>" +
		"<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/up_button.png' title='Sposta avanti' width='20' class='up_button' /></td>" +
		"<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/down_button.png' title='Sposta dietro' width='20' class='down_button' /></td>" +
		"<td> &nbsp; </td>" +
		"<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/remove.png' title='Rimuovi layer' width='16' class='remove_button' /></td></tr>";
	    '''

	    #APpendo i layer del webgis alla tabella:
	    print '''$( ".layer_tb" ).append(new_element);'''
	    #Queste opzioni che seguono temo facciano riferimento al vecchio codice:
            #print '''$("#drop option[value='"+element_id+"']").remove();
            #$('#value').prop("disabled", true);
            #$('#value').val('');
            #$('#addValue').prop("disabled", true);
            print '''$('#confirm_insert').prop("disabled", false);'''
        
            #Seleziono il gruppo di appartenenza gia' impostato:
            print '$("#select_group%s").val(group_index);' % (first_row['layer_idx'])

        print "</script>"

    conn.close()
    return


def define_js_function():
        print "<script>"
	#Realizzata la tabella-griglia con i layer gia' caricati per il webgis, ne calcolo il numero riga cioe' l'ordine di visualzizazione sul WebGIS:
	print '''function give_row_number() {
	  var j = 0;
	  $('.tablerow').each(function (i) {
	   //Dovrei cercare di escludere da questo conteggio le righe nascoste poiche' rimosse:
	   ida=$(this).css('display');
	   if (ida == 'none') j=j-1;
	   $("td:first", this).html(j);
	   j++;
	  });
	}
	give_row_number();'''
	#Creo la funzione per spostare le righe dunque i layer dentro la tabella o rimuoverli:
	print '''function moveORremove() {
	    $('.up_button').click(function() {
	    var row = $(this).closest('tr');
	    var row_before = row.prev();
	    //Se e' la seconda riga glielo evito:
	    if ( row_before.prev().length === 0) {
	        // no element before this row, so it's the first one.
	    }
	    else row.prev().insertAfter(row);
	    give_row_number();
	    });
	    $('.down_button').click(function() {
            var row = $(this).closest('tr');
            //row.prev().insertBefore(row);
	    row.insertAfter( row.next() );
            give_row_number();
            });
	    $('.remove_button').click(function() {
	    var row_idp = $(this).closest('tr').attr('id');
	    remove_inserted(row_idp);
	    });
	  };
	moveORremove();'''

        print "</script>"


#STEP 2
def insert_new_data():
    global udm
    ###Definisco il DB:
    Base.metadata.bind = engine
    meta = MetaData()
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(columns_schema))
        meta = MetaData()
        #sql = "SELECT * FROM config.v_webgis_ol_layers;"
	#Recupero solo quei layer non gia' caricati per questo dato servizio:
        sql ="""SELECT a.* FROM config.v_webgis_ol_layers a WHERE a.layer_idx NOT IN (\
	    SELECT b.layer_idx FROM config.v_webgis_custom_settings b WHERE b.webgis_idx = {0}\
	);""".format(id_stab)
        result = conn.execute(text(sql))

        #Provo a creare la tabella con DataTable plugin:
        layer_table = """<table id="main_table" border class="display" cellspacing="0" width="100%"><thead></thead><tbody></tbody><tfoot></tfoot></table>"""
        layer_table += """<script>"""
        layer_table += """columns = %s;""" % (json.dumps(result.keys())) #lista delle colonne
	columns_number = len(result.keys())
        layer_table += """design_columns(columns, 'main_table');"""
	#Creo un contenitore con tutti i valori univoci di SCHEMA e DB
	schema_set = set([])
	db_set = set([])
        for row in result:
          #print dict(row) #per trasformarlo in oggetto python
          #print json.dumps(dict(row))
	  schema_set.add(row['schema'])
	  db_set.add(row['db'])
          layer_table += """design_table(%s, columns, 'main_table');""" % (json.dumps(dict(row)))

	#Costruisco il select per il DB:
        dropdown = """<p id='dbFilter_p'>Scegli una sorgente dati/DB: <span id='dbFilter'>"""
        dropdown += """<select name="drop" id="drop" >"""
	#Difatto creandolo in automatico con columnFilter questi cicli for non hanno piu' utilita:
        #for row_db in db_set:
        #   dropdown += """<option title="%s" value="%s"> %s </option>""" % (row_db, row_db, row_db)
        dropdown += """</span></p></select>"""
	#Costruisco il select per lo SCHEMA:
	dropdown += """<p id='schemaFilter_p'>Scegli uno schema del DB: <span id='schemaFilter'>"""
        dropdown += """<select name="drop2" id="drop2" >"""
	#for row_schema in schema_set:
        #   dropdown += """<option title="%s" value="%s"> %s </option>""" % (row_schema, row_schema, row_schema)
        dropdown += """</span></p></select>"""

        #Uso il plugin di gestione delle tabelle "DataTables Table plug-in for jQuery" nascondendo alcune colonne:
        layer_table += """var selected = [];"""
	#Ci sono 2 metodi per oscurare delle colonne: "columnDefs" e "aoColumns", ma entrambi fanno pasticci sul filtro da dropdown menu
	#Dunque alla fine il metodo migliore e' oscurare queste colonne dalla funzione "design_columns":
	layer_table += """var oTable = $('#main_table').dataTable( {
		rowId: [ 0 ] //do come ID della riga l'ID del layer
                /*,"columnDefs": [ 
		  { "targets": [ 0 ], "visible": false, "searchable": true},
		  { "targets": [ 4 ], "visible": false},
		  { "targets": [ 2 ], "visible": false}
                ]*/
		//,"bFilter" : true,
	        //"bInfo": false, //mostra "Showing 1 to 10 of 99 entries"
    	        ,"bLengthChange": false
                ,"sDom": 'fitp' //aggiungendo "f" mostra la barra del "Search"
	        //,"bPaginate": false //accende o spegne i numeri di pagina della tabella
		,"oLanguage": {"sSearch": "Search all columns:"}
		,"select": {"info": true}
		/*,"aoColumns" : [ { "bVisible" : false }, //devi elencare numero esatto di colonne dela tabella
                    { "bVisible" : true }, { "bVisible" : true }, { "bVisible" : true }, { "bVisible" : true },{ "bVisible" : false }, { "bVisible" : false }, { "bVisible" : false }, { "bVisible" : false }, { "bVisible" : false }
		    ,{ "bVisible" : false },{ "bVisible" : false }
                ]*/
		//In questo modo escludo la ricerca ai primi 3 campi layer_idx, db e schema:
		,"aoColumns" : [ { "bSearchable": false }, { "bSearchable": false }, { "bSearchable": false }, null, null, null, null, null, null, null, null, null
		] //devi eleencare il numero esatto di colonne altrimenti impazzisce
		} )
		.columnFilter({
		    sPlaceHolder: "head:before",
		    aoColumns:[
		      null, { sSelector: "#dbFilter", type:"select" }, { sSelector: "#schemaFilter", type:"select" } ]}
		);"""
        #Per continuare a definire la selezione sulle righe della DataTable:
	layer_table += """$('#main_table tbody').on('click', 'tr', function () {
          var id = this.id;
          var index = $.inArray(id, selected);
	/*Per una multiselezione:
          if ( index === -1 ) { selected.push( id ); }
	  else { selected.splice( index, 1 ); }
	  $(this).toggleClass('selected');
	*/
	/*Per una selezione singola:*/
	  if ( index === -1 ) selected = [id];
	  else selected = [];
	  if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
          }
          else {
            oTable.api().$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
          }
	  //Se ho selezionato qualcosa attivo il bottone per inserire il layer:
	  if (selected.length > 0) activeBtn(false);
	  else activeBtn(true);
        } );"""
        layer_table += """</script>"""

        result.close()


    variabili = """var table_insert = '%s';""" % (table_insert)
    frase_intro = "Servizio WebGis \"<span id='nome_oggetto'>%s</span>\" (id. <span id='id_oggetto'>%s</span>)" % (nome_stab, id_stab)
    btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    btn_annulla = '''<button type='button' id='backToStart' onClick="location.href='%s/cgi-bin/manage_webgis_service_from_db.py?step=1&root_dir_html=%s&origine=1&id_stab=%s';">Annulla e torna indietro</button>''' % (root_dir_html, root_dir_html, id_stab)
    btn_ok = "<button type='button' id='confirm_insert' disabled onClick='openStep3();' >Conferma inserimento/modifiche</button>"
    btns = btn_esc + "&nbsp;" + btn_annulla + "&nbsp;" + btn_ok
    insert_value = """<input type="button" id="addValue" value="Inserisci il layer" disabled onClick="checkValue();" />"""

    print page_template % {'root_dir_html':root_dir_html, 'title':'Gestione servizi WebGIS', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':layer_table, 'form_insert':insert_value, 'buttons':btns, 'document_ready_fn':''}

    conn.close()


#STEP 3
def insert_data():
    print id_stab
    ###Definisco il DB:
    global engine, table_insert, dati, oggetto
    frase_intro = ""
    #dns = 'postgresql://radar:dirac0@localhost:5432/radar'
    #engine = create_engine(dns, echo=True) #per avere i LOG stampati a video invece che in un file con Logging
    engine = create_engine(dns)
    Base.metadata.bind = engine
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(dest_schema))
        meta = MetaData()
        table_insert_alchemy = Table(dest_table, meta, autoload=True, autoload_with=conn)
        ################CARICHIAMO I DATI DAL FILE NELL'ARRAY-DICTIONARY dati_sismi
        #dati = {} #questa variabile ti serve se devi inserire piu righe in una volta, ma nn e' questo il caso
        #dati['table_insert'] = {}

        if update==1:
          #print 'Invece devo fare un UPDATE!'
          try:
            #la key sarebbe l'ID del layer
            for key in data_json:
	      oggetto = {}
              value = data_json[key]['order_in_webgis'] 
              oggetto['order_in_webgis'] = int(value)
              oggetto['legend_group_idx'] = data_json[key]['legend_group_idx']
	      oggetto['select_highlight'] = data_json[key]['select_highlight']
	      oggetto['visible'] = data_json[key]['visible']
	      db_updateOrInsert = data_json[key]['updateOrInsert']
	      if db_updateOrInsert=='U':
                 stmt = table_insert_alchemy.update().\
                     where(table_insert_alchemy.c.webgis_idx==id_stab).\
                     where(table_insert_alchemy.c.ol_layer_idx==key).\
                     values(**oggetto)
	      elif db_updateOrInsert=='I':
		 oggetto['legend_name'] = data_json[key]['legendName']
		 oggetto['webgis_idx'] = id_stab
		 oggetto['ol_layer_idx'] = key
		 stmt = table_insert_alchemy.insert().values(**oggetto)
	      elif db_updateOrInsert=='R':
                 stmt = table_insert_alchemy.delete().\
                     where(table_insert_alchemy.c.webgis_idx==id_stab).\
                     where(table_insert_alchemy.c.ol_layer_idx==key)
              result = conn.execute(stmt)
          except sqlalchemy.exc.IntegrityError, exc:
            reason = exc.message 
	    if 'duplicate key value violates' in reason:
              print "Elemento gia' presente sul DB!! Provare a ripetere l'operazione dall'inizio, scegliendo un altro elemento"
              print '''<br/><button type='button' id='again' onClick="location.href = '%s/cgi-bin/manage_webgis_service_from_db.py?step=1&root_dir_html=%s';" > Ricomincia </button>''' % (root_dir_html, root_dir_html)
            return false
          except:
            print 'Errore sconosciuto - probabile che qualche o nessun dato non sia stato aggiornato'
            print oggetto
            return false
          else:
            frase_intro = 'Dati aggiornati con successo!'

    conn.close()
    variabili = ""
    dropdown = ""
    input_value = ""
    insert_value = ""
    btn_chiudi = "<button type='button' id='closeThis' onClick='closeThis();' > Chiudi </button>"
    btn_ancora = '''<button type='button' id='again' onClick="location.href='%s/cgi-bin/manage_webgis_service_from_db.py?step=1&root_dir_html=%s&origine=1&id_stab=%s';" > Inserisci ancora </button>''' % (root_dir_html, root_dir_html, id_stab)
    btns = btn_ancora + "&nbsp;" + btn_chiudi
    print page_template % {'root_dir_html':root_dir_html, 'title':'Gestione servizi WebGIS', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':input_value, 'form_insert':insert_value, 'buttons':btns, 'document_ready_fn':''}



#STEP di chiamate dello script per inserire i dati:

#Scelgo l'elemento principale:
if step==1:
  choose_stab()

#Inserisco i valori sul FORM HTML:
if step==2:
  '''try:
    root_dir_html = str(fs["root_dir_html"].value)
  except:
    root_dir_html = ""'''
  try:
    #table_columns = str(fs["table"].value)
    id_stab = int(fs["id_stab"].value)
    nome_stab = str(fs["nome"].value)
    table_insert = 'config.webgis_indici'
    table_from = 'config.v_webgis_general_config'
    table_tools = 'config.webgis_toolbar_tools' #ex table_group
    columns_table = 'v_webgis_custom_settings'
    columns_schema = 'config'

  except AssertionError, e:
    print e.args
    exit()
  except:
    print "Error parsing parameters: need 'id_stab','nome' variable"
    exit()

  global engine, columns, options_tools
  #dns = 'postgresql://webgis:webgis$2013%@localhost:5432/radar'
  engine = create_engine(dns)
  columns = []
  options_tools = "" #ex options_group
  Base.metadata.bind = engine
  #Verifichiamo se esistono gia' dei dati:
  with engine.connect() as conn:
    conn.execute("SET search_path TO {0}, public".format(columns_schema))
    meta = MetaData()
    #Mi scarico tutti i tools definiti su DB:
    sql_group = "SELECT * FROM {0} ORDER BY tool_idx;".format(table_tools)
    result_group = conn.execute(text(sql_group))
    #Creo la variabile che contiene tutti i gruppi a disposizione:
    for group in result_group:
      #options_tools += """<option title="%s" value="%s"> %s </option>""" % (group['tool_description'], group['tool_idx'], group['tool_name'])
      #se l'icona del tool non esiste la pongo ad un valore che non mi sballa la pagina:
      if (group['tool_icon'] is None):
        tool_icon = '//:0'
      else:
        tool_icon = root_dir_html+group['tool_icon']
      options_tools += """<label style="max-width:480px;"><input type="checkbox" data-mini="true" title="%s" id="%s"> %s <img width="24" style="vertical-align:middle;" src="%s"/> </label>""" % (group['tool_description'], group['tool_idx'], group['tool_description'], tool_icon)
  
  print '''<script>'''
  print '''var options_tools = '<p>Scegli i tools da attivare:</p><fieldset data-role="controlgroup"><legend>Scegli i tools da attivare:</legend> %s </fieldset>';''' % (options_tools)  #creo questa variabile anche su JS perche' mi potra' servire
  print "update = 1;" #con la nuova struttura del codice questa variabile e' ininfluente la definisco a monte uguale per tutti
  print '''</script>'''

  conn.close()

  manage_service()

  #Definisco funzioni JS di base che mi serviranno in ogni caso:
  define_js_function()


#Inserisco i valori su DB:
if step==3:
  try:
    import simplejson as json
    import logging
    logging.basicConfig(filename='/tmp/sqlalchemy_rir.log')
    logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

    #Recupero i dati passati con metodo GET ma anche POST:
    data_array = str(fs["data"].value)
    dest_schema_table = str(fs["dest_table"].value)
    id_stab = str(fs["id_stab"].value)
    print id_stab
    nome_stab = str(fs["nome"].value)
    update = int(fs["update"].value)

    dest_table = dest_schema_table.split('.')[1]
    dest_schema = dest_schema_table.split('.')[0]
    assert update in [0,1], "valore variabile 'update' non corretta"
  except AssertionError, e:
    print e.args
    exit()
  except:
    print "Error parsing parameters: need 'table','id_stab' variable"
    exit()

  data_json = json.loads(data_array)
  insert_data()
