#!/usr/bin/python

"""
script per creare il form di inserimento layer su un servizio WebGIS gia' esistente usando le configurazioni da DB

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
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/bootstrap-theme.min.css" />
<!-- <link rel="stylesheet" href="%(root_dir_html)s/jQuery/bootstrap.min.css" /> -->
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/jquery-ui.css" />
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/jquery.dataTables.min.css" />

<title>%(title)s</title>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="WebGIS portable">
<meta name="Description" content="Gestione semplice di un WebGIS portatile">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script src="%(root_dir_html)s/jQuery/jquery-1.10.2.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery-ui.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery.dataTables.min.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery.dataTables.columnFilter.js"></script>
<script>
var root_dir_html="%(root_dir_html)s";

$( document ).ready(function() {
    //design_checkboxes();
})

//Funzione da Internet per stile checkbox, parte al caricamento della pagina:
//Cerca su google "Code Snippet jQuery Checkbox Buttons using HTML jQuery"
//$(function () { design_checkboxes(); });
function design_checkboxes() {
    $('.button-checkbox').each(function () {
        // Settings
        var $widget = $(this),
            $button = $widget.find('button'),
            $checkbox = $widget.find('input:checkbox'),
            color = $button.data('color')
	    ,settings = { 
		on: { icon: 'glyphicon' },
                off: { icon: 'glyphicon' }
	    }
            /*,settings = {
                on: { icon: 'glyphicon glyphicon-check' },
                off: { icon: 'glyphicon glyphicon-unchecked' }
            }*/
	    ;
        // Event Handlers
        $button.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });
        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');
            // Set the button's state
            $button.data('state', (isChecked) ? "on" : "off");
            // Set the button's icon
            $button.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$button.data('state')].icon);
            // Update the button's color
            if (isChecked) {
                $button
                    .removeClass('btn-default')
                    .addClass('btn-' + color + ' active');
            }
            else {
                $button
                    .removeClass('btn-' + color + ' active')
                    .addClass('btn-default');
            }
        }
        // Initialization
        function init() {
            updateDisplay();
            // Inject the icon if applicable
            if ($button.find('.state-icon').length === 0) {
                $button.prepend('<i class="state-icon ' + settings[$button.data('state')].icon + '"></i>');
            }
        }
        init();
    });
};

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
function addlayer2layertb(layer_name) {
        geometria = $('#'+selected+'').find('#geom_type').html();
        geom_img(geometria);
	//Creo l'elemento select per il gruppo:
	select_group = '<select name="select_group' + selected + '" id="select_group' + selected + '" >';
	select_group += options_group;
	select_group += "</select>";
        //Aggiungo l'elemento selezionato alla tabella "layer_tb"
        var new_element = "<tr id=p_" + selected + " class='tablerow'><td class='order_in_webgis'></td><td class='legendName'>" + layer_name + "</td> <td>" + $('#'+selected+'').find('#layer_description').html() + "</td> " +
          "<td class='updateOrInsert' style='display:none;'>I</td>" +
          "<td class='group_index' style='text-align:center;'>" + select_group + "</td>" +
	  "<td class='select' style='text-align:center;'><span class='button-checkbox'> <button  name='select_btn' type='button' class='btn' data-color='info'>select</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>" +
          "<td class='highlight' style='text-align:center;'><span class='button-checkbox'> <button  name='hover_btn' type='button' class='btn' data-color='primary'>hover</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>" +
	  "<td class='multiselect' style='text-align:center;'><span class='button-checkbox'> <button  name='multiselect_btn' type='button' class='btn' data-color='warning'>multi</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>" +
          "<td class='visible' style='text-align:center;'><span class='button-checkbox'> <button type='button' class='btn' data-color='success'>visible</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>" +
          "<td style='text-align:center;'><img src='"+root_dir_html+"/common/icons/"+geometria_img+"' title='"+geometria+"' width='30' class='geom_img' /></td>" +
          "<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/up_button.png' title='Sposta avanti' width='20' class='up_button' /></td>" +
          "<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/down_button.png' title='Sposta dietro' width='20' class='down_button' /></td>" +
	  "<td> &nbsp; </td>" +
	  "<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/remove.png' title='Rimuovi layer' width='16' class='remove_button' /></td></tr>";

        //APpendo i layer del webgis alla tabella:
        $( ".layer_tb" ).append(new_element);
        give_row_number(); //ricalcolo il numero riga
	//Sgancio le precedenti azioni altrimenti si "raddoppiano":
	$(".down_button").unbind( "click" );
	$(".up_button").unbind( "click" );
	$(".remove_button").unbind( "click" );
	moveORremove(); //rilancio la funzione per abilitare spostamento e rimozione
	$('.button-checkbox').each(function () {
	  var $widget = $(this);
	  var $button = $widget.find('button');
          var $checkbox = $widget.find('input:checkbox');
	  $button.unbind( "click" );
	  $checkbox.unbind( "change" );
	});
	design_checkboxes(); //rilancio la funzione per i checkbox
        //Abilito il pulsante per l'inserimento su DB e disabilito quello per aggiungere altri layer:
	$('#addValue').prop("disabled", true);
        $('#confirm_insert').prop("disabled", false);

        //Disattivo i pulsanti "select" e "hover" e "multi" per i raster e i wms:
        if ( geometria == 'RASTER' || geometria == 'WMS') {
              $('#p_'+selected+' button[name=select_btn]').prop('disabled', true);
              $('#p_'+selected+' button[name=hover_btn]').prop('disabled', true);
              $('#p_'+selected+' button[name=multiselect_btn]').prop('disabled', true);
	}


        //Rimuovo l'elemento dalla tabella:
        oTable.api().row('.selected').remove().draw( false );
        //Svuoto la variabile che altrimenti si porterebbe sempre dietro gli altri valori:
        selected = [];
}
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
    uri_ok = "%(root_dir_html)s/cgi-bin/add_layer_from_db.py?root_dir_html=%(root_dir_html)s&step=2&id_stab="+id_stab_IN+"&nome="+nome_stab;
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
	multisel = $(this).find(".multiselect");
	var selection = 0;
	if (sel.find(".active").length > 0) selection = 1;
	if (hover.find(".active").length > 0) selection = 2;
	if (multisel.find(".active").length > 0) selection = 3;
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
    //uri_final = "%(root_dir_html)s/cgi-bin/add_layer_from_db.py?step=3&data="+data_array+"&id_stab="+oggetto[0]+"&nome="+escape(oggetto[1])+"&dest_table="+dest_table+"&update="+update+"&root_dir_html=%(root_dir_html)s";
    //window.open(uri_final,'_self');
    //Pass parameter with POST:
    $('body').append($('<form/>')
  .attr({'action':'%(root_dir_html)s/cgi-bin/add_layer_from_db.py', 'method':'post', 'id':'replacer'})
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

//Costruire una tabella da un array con DataTable:
function design_columns(props, table) {
	//Popolo le colonne intestazione:
	var tbody = $('#'+table+' thead');
	var tr = $('<tr>');
	$.each(props, function(i, prop) {
		//Non voglio la colonna "ID" ma mi serve per il link:
		//if (prop!='id_elemento') $('<th>').html(prop).appendTo(tr);
		if (prop=='default_legend_variable') $('<th>').html('legend').appendTo(tr);
		else if (prop=='openlayer_name') $('<th>').html('OL name').appendTo(tr);
		else if (prop=='mobile_friendly') $('<th>').html('mobile').appendTo(tr);
		else if (prop=='layer_idx') $('<th style="display:none;">').html(prop).appendTo(tr);
		else if (prop=='db') $('<th style="display:none;">').html(prop).appendTo(tr);
		else if (prop=='schema') $('<th style="display:none;">').html(prop).appendTo(tr);
		else $('<th>').html(prop).appendTo(tr);
	});
	tbody.append(tr);
	//Popolo il footer per un filtro su colonna:
	/*var tbody = $('#'+table+' tfoot');
	var tr = $('<tr>');
	$.each(props, function(i, prop) {
		if (prop=='label') $('<th>').html('Nome teatro').appendTo(tr);
		else if (prop=='id_elemento') {}
		else $('<th>').html(prop).appendTo(tr);
	});
	tbody.append(tr);*/
}	
function design_table(rows, props, table) {
	var tbody = $('#'+table+' tbody');
	var tr = $('<tr>');
	$.each(props, function(i, prop) {
		if (prop=='label') {
			$('<td>').html('<a href="load_detail_sqlite_table.html?id_elemento='+rows['id_elemento']+'" target="_blank" >'+rows[prop]+'</a>').appendTo(tr);
		}
		else if (prop=='main_link' && rows[prop]!='') $('<td>').html('<a href="../'+rows[prop]+'">Link scheda teatro</a>').appendTo(tr);
		else if (rows[prop]=='') $('<td>').html('&nbsp;').appendTo(tr); //altrimenti le righe vuote non mette il bordo
		else if (prop=='layer_idx') $('<td style="display:none;">').html(rows[prop]).appendTo(tr);
		else if (prop=='db') $('<td style="display:none;">').html(rows[prop]).appendTo(tr);
		else if (prop=='schema') $('<td style="display:none;">').html(rows[prop]).appendTo(tr);
		else $('<td id='+prop+'>').html(rows[prop]).appendTo(tr);  
	});
	tbody.append(tr);
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
		case 'WMS': geometria_img = 'wms.png'; break;
		case 'GEOMETRY': geometria_img = 'geometry.png'; break;
                default: geometria_img = '';
        }
	return geometria_img;
}
function selectORhighlight(value) {
    switch (value) {
	case 1: select_str='checked'; highlight_str='unchecked'; multiselect_str='unchecked'; break;
	case 2: select_str='checked'; highlight_str='checked'; multiselect_str='unchecked'; break;
	case 3: select_str='checked'; highlight_str='checked'; multiselect_str='checked'; break;
	default: select_str='unchecked'; highlight_str='unchecked'; multiselect_str='unchecked'; 
    }
    return select_str, highlight_str, multiselect_str;
}

//Variabili importate da PYTHON:
%(variables_from_py)s
</script>
<style>
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);} h1 {font-size:1em;}
#main_table { font-size: small; }
.legendName {font-weight: bold;}
</style>
</head>
<body>
<div class="frase_intro">
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
<div class="buttons">
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
        conn.execute("SET search_path TO config, public;")
        meta = MetaData()
        sql = "SELECT webgis_idx AS column_name, webgis_name || '  #' || webgis_idx AS label, webgis_description, attivo FROM {0} ORDER BY webgis_name;".format(source_table)
        result = conn.execute(text(sql))
        dropdown = """<select name="drop" id="drop" onChange="allowValue(this);">"""
        dropdown += """<option value="000"> --Seleziona il webgis--</option>"""
        for row in result:
	    if (row['attivo']==0):
		dropdown += """<option title="%s" value="%s" style="background-color:bisque;"> %s </option>""" % (row['webgis_description'], row['column_name'], row['label'])
	    else:
	        dropdown += """<option title="%s" value="%s"> %s </option>""" % (row['webgis_description'], row['column_name'], row['label'])
        
    dropdown += """</select>"""
    ##radio_options += """</br> Tipo di dati da inserire: <br> <label for="sostanze">Sostanze</label> <input type="radio" name="table" id="sostanze" value="v_maskdataentry_sostanze" checked> <br> <label for="categorie">Categorie</label> <input type="radio" name="table" id="categorie" value="v_maskdataentry_categorie">"""
    frase_intro = "Scegli il servizio WebGis per il quale configurare i layer:<br/>(i servizi evidenziati non sono attivi)"
    btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    #btn_annulla = "<button type='button'>Annulla e torna indietro</button>"
    btn_ok = "<button type='button' id='value' disabled onClick='openStep2();' >Conferma e procedi</button>"
    btns = btn_esc + "&nbsp;" + btn_ok
    form_insert = """<p style="font-size:0.8em;">(i servizi evidenziati non sono attivi)</p>"""

    #print page_template % ('Scelta servizio WebGIS', '', frase_intro, dropdown, radio_options, '', btns)
    print page_template % {'root_dir_html':root_dir_html, 'title':'Scelta servizio WebGIS', 'variables_from_py':'', 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':radio_options, 'form_insert':form_insert, 'buttons':btns}

    #Se la finestra viene aperta a partire da uno stabilimento lo seleziono:
    if id_stab:
        print '<script>$("#drop").val(%s);</script>' % (id_stab)
        print '<script>document.getElementById("value").disabled = false;</script>'
    conn.close()


#STEP 2
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
	print '''var table_str = "<table class='layer_tb' id='layer_tb'><th>#</th><th>Layer<br/>(clicca per gestire popup)</th><th>Descrizione</th><th style='display:none;'>Ins/Upd</th><th>Gruppo</th><th colspan='3'>&nbsp;</th><th>Geometria</th><th colspan='2'>Ordine</th><th>&nbsp;</th><th>&nbsp;</th></table>";'''
	print '''$( ".toInsert" ).append(table_str);'''
        for first_row in result:
            #print '''var element_label = $("#drop option[value='%s']").text();''' % (first_row['layer_idx'])
            #perche' prendevo questo ID dal dropdown? Ora commento perche' nn voglio piu' vederlo...
            print '''var element_id = '%s';''' % (first_row['layer_idx'])
            print '''var value_toinsert = '%s';''' % (first_row['legend_name'])
            print '''var value_ol_variable = '%s';''' % (first_row['openlayer_name'])
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
            select_group += options_group
            select_group += """</select>"""
	    #print '''var options_group = '%s';''' % (options_group)  #creo questa variabile anche su JS perche' mi potra' servire
            print '''var select_group = '%s';''' % (select_group)
            #Adesso costruisco le varie righe che contengono i layer:
	    print '''var new_element = "<tr id=p_" + element_id + " class='tablerow'><td class='order_in_webgis'></td><td class='legendName'title='variabile OL="+value_ol_variable+"'>" +
		"<a href='"+root_dir_html+"/cgi-bin/add_popup_on_layer.py?root_dir_html="+root_dir_html+"&step=1&id_stab={0}&id_layer="+element_id+"&ol_layer="+value_ol_variable+"&nome="+value_toinsert+"' target='_blank'>" +
		value_toinsert + "</a></td> <td>" +value_description + "</td> " +
		"<td class='updateOrInsert' style='display:none;'>U</td>" +
                "<td class='group_index' style='text-align:center;'>" + select_group + "</td>" +
		"<td class='select' style='text-align:center;'><span class='button-checkbox'> <button name='select_btn' type='button' class='btn' data-color='info' >select</button> <input type='checkbox' style='display:none;' class='hidden' " + select_str + " /> </span> </td>" +
		"<td class='highlight' style='text-align:center;'><span class='button-checkbox'> <button name='hover_btn' type='button' class='btn' data-color='primary'>hover</button> <input type='checkbox' style='display:none;' class='hidden' " + highlight_str + " /> </span> </td>" +
		"<td class='multiselect' style='text-align:center;'><span class='button-checkbox'> <button name='multiselect_btn' type='button' class='btn' data-color='warning'>multi</button> <input type='checkbox' style='display:none;' class='hidden' " + multiselect_str + " /> </span> </td>" +
		"<td class='visible' style='text-align:center;'><span class='button-checkbox'> <button type='button' class='btn' data-color='success'>visible</button> <input type='checkbox' style='display:none;' class='hidden' " + visible_str + " /> </span> </td>" +
		"<td style='text-align:center;'><img src='"+root_dir_html+"/common/icons/"+geometria_img+"' title='"+geometria+"' width='30' class='geom_img' /></td>" +
		"<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/up_button.png' title='Sposta avanti' width='20' class='up_button' /></td>" +
		"<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/down_button.png' title='Sposta dietro' width='20' class='down_button' /></td>" +
		"<td> &nbsp; </td>" +
		"<td style='text-align:center;cursor:pointer;'><img src='"+root_dir_html+"/common/icons/remove.png' title='Rimuovi layer' width='16' class='remove_button' /></td></tr>";
	    '''.format(id_stab)

	    #APpendo i layer del webgis alla tabella:
	    print '''$( ".layer_tb" ).append(new_element);'''
	    #Queste opzioni che seguono temo facciano riferimento al vecchio codice:
            #print '''$("#drop option[value='"+element_id+"']").remove();
            #$('#value').prop("disabled", true);
            #$('#value').val('');
            #$('#addValue').prop("disabled", true);
            print '''$('#confirm_insert').prop("disabled", false);'''

            #Disattivo i pulsanti "select" e "hover" e "multi" per i raster e i wms:
            if (first_row['geom_type'] == 'RASTER' or first_row['geom_type'] == 'WMS'):
              print "$('#p_%s button[name=select_btn]').prop('disabled', true);" % (first_row['layer_idx'])
	      print "$('#p_%s button[name=hover_btn]').prop('disabled', true);" % (first_row['layer_idx'])
	      print "$('#p_%s button[name=multiselect_btn]').prop('disabled', true);" % (first_row['layer_idx'])

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
	print '''design_checkboxes();''' #rilancio la funzione per i checkbox
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
        #ATTENZIONE! Se specifichi "aoColumns" questi filtri non vengono piu' riconosciuti poiche' hai disabilitato queste colonne dai filtri!
        dropdown = ""
        #dropdown = """<p id='dbFilter_p'>Scegli una sorgente dati/DB: <span id='dbFilter'>"""
        #dropdown += """<select name="drop" id="drop" >"""
        #dropdown += """</span></p></select>"""
	#Costruisco il select per lo SCHEMA:
	#dropdown += """<p id='schemaFilter_p'>Scegli uno schema del DB: <span id='schemaFilter'>"""
        #dropdown += """<select name="drop2" id="drop2" >"""
        #dropdown += """</span></p></select>"""

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
		//In questo modo escludo la ricerca ai primi 3 campi layer_idx, db e schema, pero' rendo INUTILE il search da select dbFilter e schemaFiltter!!
		,"aoColumns" : [ { "bSearchable": false }, { "bSearchable": false }, { "bSearchable": false }, null, null, null, null, null, null, null, null, null
		] //devi elencare il numero esatto di colonne altrimenti impazzisce
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
    btn_annulla = '''<button type='button' id='backToStart' onClick="location.href='%s/cgi-bin/add_layer_from_db.py?step=1&root_dir_html=%s&origine=1&id_stab=%s';">Annulla e torna indietro</button>''' % (root_dir_html, root_dir_html, id_stab)
    btn_ok = "<button type='button' id='confirm_insert' disabled onClick='openStep3();' >Conferma inserimento/modifiche</button>"
    btns = btn_esc + "&nbsp;" + btn_annulla + "&nbsp;" + btn_ok
    insert_value = """<input type="button" id="addValue" value="Inserisci il layer" disabled onClick="checkValue();" />"""

    print page_template % {'root_dir_html':root_dir_html, 'title':'Organizzazione dei layer', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':layer_table, 'form_insert':insert_value, 'buttons':btns}

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
              print '''<br/><button type='button' id='again' onClick="location.href = '%s/cgi-bin/add_layer_from_db.py?step=1&root_dir_html=%s';" > Ricomincia </button>''' % (root_dir_html, root_dir_html)
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
    btn_ancora = '''<button type='button' id='again' onClick="location.href='%s/cgi-bin/add_layer_from_db.py?step=1&root_dir_html=%s&origine=1&id_stab=%s';" > Inserisci ancora </button>''' % (root_dir_html, root_dir_html, id_stab)
    btns = btn_ancora + "&nbsp;" + btn_chiudi
    print page_template % {'root_dir_html':root_dir_html, 'title':'Organizzazione dei layer', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':input_value, 'form_insert':insert_value, 'buttons':btns}



#STEP di chiamate dello script per inserire i dati:

#Scelgo l'elemento principale:
if step==1:
  id_stab=None
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
    table_insert = 'config.webgis_layers'
    table_from = 'config.v_webgis_custom_settings'
    table_group = 'config.webgis_groups'
    columns_table = 'v_webgis_custom_settings'
    columns_schema = 'config'

  except AssertionError, e:
    print e.args
    exit()
  except:
    print "Error parsing parameters: need 'id_stab','nome' variable"
    exit()

  global engine, columns, options_group
  #dns = 'postgresql://webgis:webgis$2013%@localhost:5432/radar'
  engine = create_engine(dns)
  columns = []
  options_group = ""
  Base.metadata.bind = engine
  #Verifichiamo se esistono gia' dei dati:
  with engine.connect() as conn:
    conn.execute("SET search_path TO {0}, public".format(columns_schema))
    meta = MetaData()
    sql = "SELECT count(*) AS conta FROM {0} WHERE webgis_idx={1};".format(table_from, id_stab)
    result = conn.execute(text(sql))
    first_row = result.fetchone()
    occorrenze = first_row['conta']

    #In ogni caso mi serve scaricare tutti i gruppi definiti su DB:
    sql_group = "SELECT * FROM {0} ORDER BY legend_group_name;".format(table_group)
    result_group = conn.execute(text(sql_group))
    #Creo la variabile che contiene tutti i gruppi a disposizione:
    for group in result_group:
      options_group += """<option title="%s" value="%s"> %s </option>""" % (group['description'], group['group_idx'], group['legend_group_name'])
  
  print '''<script>'''
  print '''var options_group = '%s';''' % (options_group)  #creo questa variabile anche su JS perche' mi potra' servire
  print "update = 1;" #con la nuova struttura del codice questa variabile e' ininfluente la definisco a monte uguale per tutti
  print '''</script>'''

  conn.close()
  if occorrenze>0:
    insert_new_data()
    update_data()
  else:
    insert_new_data()
    update_data()

  #Definisco funzioni JS di base che mi serviranno in ogni caso:
  define_js_function()


#Inserisco i valori su DB:
if step==3:
  try:
    import simplejson as json
    import logging
    logging.basicConfig(filename='/tmp/add_layer_from_db.log')
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
