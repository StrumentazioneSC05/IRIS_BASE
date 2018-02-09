#!/usr/bin/python

"""
script per associare un comportamento alla selezione su un layer.
Pagina che andrebbe richiamata dal form di inserimento layer su un servizio WebGIS gia' esistente usando le configurazioni da DB

OTTIMIZZAZIONI:
- controllare inserimento stringhe complesse su DB

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
  id_stab = str(fs["id_stab"].value) #id del webgis
  id_layer = str(fs["id_layer"].value) #id del layer
  ol_layer = str(fs["ol_layer"].value) #nome della variabile Ol del layer
except AssertionError, e:
  print e.args
  exit()
except Exception as e:
  print "Error parsing parameters: need 'step', 'id_stab', 'id_layer', 'ol_layer' and 'root_dir_html' variable"
  print ': missing ' + str(e)
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
<meta name="Subject" content="WebGIS IRIS">
<meta name="Description" content="Gestione del sistema IRIS - WebGIS">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script src="%(root_dir_html)s/jQuery/jquery-1.10.2.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery-ui.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery.dataTables.min.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery.dataTables.columnFilter.js"></script>
<script>
var root_dir_html="%(root_dir_html)s";

$( document ).ready(function() {
    //design_checkboxes();
    //elenco tutti i div e li spengo:
    $('.form_insert > div').map(function() {
          $("div#"+this.id).hide();
    });
    //accendo solo il div interessato:
    funzione_selezionata = $('input[name=optradio]:checked').val();
    $("div#"+funzione_selezionata).fadeIn();
    if (funzione_selezionata) $('#confirm_insert').prop("disabled", false);
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

function change_radio(object_radio) {
  var funzione_selezionata = object_radio.id;
  //la cosa piu' logica e' spegnere tutto e riaccendere solo quello che interessa:
  $('.form_insert > div').map(function() {
          $("div#"+this.id).hide();
  });
  $("div#"+funzione_selezionata).fadeIn();
  $('#confirm_insert').prop("disabled", false);
}

function activeBtn(value) {
    $('#addValue').prop("disabled", value);
}

var oggetto;
function openStep3() {
    //Recupero gli elementi inseriti, richiedo una verifica utente e una conferma finale
    oggetto = [layer_idx, layer_name];
    var jsonArg1 = new Object();
    //Recupero un elemento alla volta:
    jsonArg1['funzione_associata'] = $('input[name=optradio]:checked').val();
    jsonArg1['url_link'] = $('#url_link').val();
    jsonArg1['url_name'] = $('#url_name').val();
    jsonArg1['url_options'] = $('#url_options').val();	
    jsonArg1['pop_title'] = $('#pop_title').val();
    jsonArg1['pop_html'] = $('#pop_html').val();
    jsonArg1['grafici_stazione'] = $('#grafici_stazione').val();
    jsonArg1['grafici_tab_attivo'] = $('#grafici_tab_attivo').val();
    jsonArg1['grafici_valore'] = $('#grafici_valore').val();
    jsonArg1['grafici_codice'] = $('#grafici_codice').val();
    jsonArg1['grafici_progr'] = $('#grafici_progr').val();
    jsonArg1['grafici_tipostaz'] = $('#grafici_tipostaz').val();
    jsonArg1['grafici_tiporete'] = $('#grafici_tiporete').val();
    grafici_composito = Array();
    for (i=1; i<=4; i++) {
      if ( $('#'+i+' input').is(':checked')) grafici_composito.push(i);
    }
    jsonArg1['grafici_composito'] = grafici_composito;

    //Costruisco il contenuto della finestra di conferma:
    var title_confirm = "Conferma dati per "+layer_name+":";
    var html_confirm = "";
    for (var key in jsonArg1) {
      html_confirm += key + ": " + jsonArg1[key] + "<br/>";
    }

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
  .attr({'action':'%(root_dir_html)s/cgi-bin/add_popup_on_layer.py', 'method':'post', 'id':'replacer'})
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
    .attr({'type':'hidden', 'name':'id_stab', 'value':webgis_idx})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'id_layer', 'value':layer_idx})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'ol_layer', 'value':layer_name})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'dest_table', 'value':dest_table})
  )
  .append($('<input/>')
    .attr({'type':'hidden', 'name':'updateOrInsert', 'value':updateOrInsert})
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
def choose_popup():
    global engine
    source_table = "config.webgis_ol_layers"
    popup_table= "config.webgis_popups"
    radio_options = ""
    #dns = 'postgresql://webgis:webgis$2013%@localhost:5432/radar'
    engine = create_engine(dns)
    Base.metadata.bind = engine
    meta = MetaData()
    #Inzializzo variabili:
    updateOrInsert = ''
    funzione_associata = ''
    url_link = ''
    url_name = ''
    url_options = ''
    grafici_stazione = ''
    grafici_tab_attivo = ''
    pop_html = ''
    pop_title = ''
    grafici_valore = ''
    grafici_codice = ''
    grafici_progr = ''
    grafici_tipostaz = ''
    grafici_tiporete = ''
    grafici_composito = ''
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO config, public;")
        meta = MetaData()
        sql = """SELECT ol_layer_idx, webgis_idx, funzione_associata, url_link, url_name, 
       url_options, grafici_stazione, grafici_tab_attivo, pop_html, 
       pop_title, grafici_valore, grafici_codice, grafici_progr, grafici_tipostaz, 
       grafici_tiporete, array_to_string(grafici_composito, ',') AS grafici_composito FROM {0} WHERE ol_layer_idx={1} AND webgis_idx={2};""".format(popup_table, id_layer, id_stab)
        result = conn.execute(text(sql))
	#il layer e' gia' presente o e' da inserire?
	updateOrInsert='U'
	if (result.rowcount<=0):
	  updateOrInsert='I'

	#Recupero le info su funzioni gia' attive sul layer:
        for row in result:
	  funzione_associata = row['funzione_associata'] or ''
          url_link = row['url_link'] or ''
          url_name = row['url_name'] or ''
          url_options = row['url_options'] or ''
          grafici_stazione = row['grafici_stazione'] or ''
          grafici_tab_attivo = row['grafici_tab_attivo'] or ''
          pop_html = row['pop_html'] or ''
          pop_title = row['pop_title'] or ''
          grafici_valore = row['grafici_valore'] or ''
          grafici_codice = row['grafici_codice'] or ''
          grafici_progr = row['grafici_progr'] or ''
          grafici_tipostaz = row['grafici_tipostaz'] or ''
          grafici_tiporete = row['grafici_tiporete'] or ''
          grafici_composito = row['grafici_composito'] or ''
	
	#Estraggo i campi dalla tabella/vista di provenienza del layer:
	sql_field = """WITH eccoqua AS (SELECT (string_to_array(db_table_view_name, '.'))[1] AS dbname, (string_to_array(db_table_view_name, '.'))[2] AS schemaname, (string_to_array(db_table_view_name, '.'))[3] AS tablename FROM {0} WHERE layer_idx={1})
SELECT column_name, data_type, indisprimary, indisunique
FROM information_schema.columns
LEFT OUTER JOIN
(SELECT a.attname, max(indisprimary::text) AS indisprimary, max(indisunique::text) AS indisunique
FROM   pg_index i
JOIN   pg_attribute a ON a.attrelid = i.indrelid
       AND a.attnum = ANY(i.indkey)
WHERE  i.indrelid=(SELECT schemaname||'.'||tablename FROM eccoqua)::regclass GROUP BY a.attname) AS foo ON foo.attname = column_name
WHERE table_name=(SELECT tablename FROM eccoqua) ORDER BY ordinal_position;""".format(source_table, id_layer)

	result_field = conn.execute(text(sql_field))
	dropdown_campi = ""
	if (result_field.rowcount<=0):
	  print """<script>alert('Errore nel recuperare i campi dalla tabella riferita al layer: potrebbe non esistere o ritrovarsi su un altro DB non gestito. Controllarne la definizione sul DB, tabella "config.webgis_ol_layers"');</script>"""
	for row_field in result_field:
	    dropdown_campi += """<option title="%s" value="%s" """ % (row_field['column_name'], row_field['column_name'])
	    if (row_field['indisprimary']=='true' or row_field['indisunique']=='true'):
		dropdown_campi += """style='background-color:bisque;'"""
	    dropdown_campi += """> %s </option>""" % (row_field['column_name'])

    ### OPEN POPUP ###
    input_link = """<input id='url_link' list='link' size=80 maxlength=512 value="%s"/> url_link: url da aprire, puo' essere un indirizzo http o locale e contenere riferimenti al layer o all'elemento selezionato (nel menu a tendina alcuni esempi)
<datalist id='link'>
  <option value='"https://www.arpa.piemonte.gov.it/bollettini/bollettino_allerta.pdf"'>
  <option value='root_dir_html+"/cgi-bin/storm_db.py?id="+e.feature.attributes.id'>
</datalist>
    <br/>""" % ( url_link.replace('"', '&quot;') )

    input_name = """<input id='url_name' size=80 maxlength=64 /> url_name: nome della nuova pagina html da aprire (non usare apici o lettere accentate)<br/>"""
    input_name += """<script>$("#url_name").val("%s");</script>""" % (url_name)

    input_options = """<input id='url_options' list='options' size=80 maxlength=250 /> url_options: opzioni html della nuova apgina da aprire (nel menu a tendina alcuni esempi: non usare apici o lettere accentate)
<datalist id='options'>
  <option value='location=0,width=500,height=800,toolbar=0,resizable=0,left=100,top=100'>
</datalist>
    <br/>"""
    input_options += """<script>$("#url_options").val("%s");</script>""" % (url_options)


    #compongo il div:
    div_url = """<div id=open_popup>"""
    div_url += input_link + input_name + input_options
    div_url += "</div>"


    ### CREATE POPUP ###
    input_quotes = """"<a target='_blank' href='http://" + e.feature.attributes.link_url + "'><img title='Clicca per aprire il sito di provenienza' src='" + root_dir_html + "/common/DATA/nivo/CAM/" + e.feature.attributes.link_img + "' width='210'></a><br/><i>Ultimo agg.:</i> " + ((e.feature.attributes.data_agg || " - - ").substring(0,16))"""
    input_html = """<input id='pop_html' list='htmls' size=80 maxlength=1250 value="%s"/> pop_html: contenuto html della popup, puo' essere un indirizzo http o locale e contenere riferimenti al layer o all'elemento selezionato (nel menu a tendina alcuni esempi)
<datalist id='htmls'>
  <option value='"Data: " + e.feature.attributes.data + "<br/>" + "Ora UTC: " + e.feature.attributes.ora + "<br/>" + "Tipo: " + e.feature.attributes.tipo + "<br/>" + "Corrente (kA): " + e.feature.attributes.valore'>
  <option value="%s">
</datalist>
    <br/>""" % ( pop_html.replace('"', '&quot;'), input_quotes.replace('"', '&quot;') )

    input_title = """<input id='pop_title' list='titles' size=80 maxlength=125 value="%s"/> pop_title: titolo della popup, puo' contenere riferimenti al layer o all'elemento selezionato (nel menu a tendina alcuni esempi)
<datalist id='titles'>
  <option value='e.feature.layer.name'>
  <option value='e.feature.attributes.nome + " [" + e.feature.attributes.quota + "m]"'>
</datalist>
    <br/>""" % ( pop_title.replace('"', '&quot;') )

    #compongo il div:
    div_pop = """<div id=createPopup>"""
    div_pop += input_title + input_html
    div_pop += "</div>"


    ### GRAFICI RETE ###
    #Costruisco la serie degli input e dropdown nel caso specifico della funzione grafici_rete:
    input_stazione = """<input id='grafici_stazione' list='stazione'/> grafici_stazione: tipo di grafico da aprire, da gestire poi sotto js_functions.js
<datalist id='stazione'>
  <option value="meteoidro">
  <option value="meteoidro_lm">
  <option value='idrometri_bis'>
  <option value='bacini_spi'>
  <option value='bacini_pal'>
  <option value='smart_slops'>
  <option value='bilancioidro'>
  <option value='previdro'>
  <option value='previpo'>
  <option value='estero'>
  <option value='idrometri'>
  <option value="test_lm">
  <option value="fews">
</datalist>
    <br/>"""
    input_stazione += """<script>$("#grafici_stazione").val("%s");</script>""" % (grafici_stazione)
    input_tab_attivo = """<input id='grafici_tab_attivo' list='tab_attivo'> grafici_tab_attivo: tab da attivare all'apertura dei grafici
<datalist id='tab_attivo'>
  <option value="TERMA">
  <option value="PLUV">
  <option value="VELV">
  <option value="NIVO">
  <option value="T">
  <option value="I">
  <option value="FEWS">
</datalist>
    <br/>"""
    input_tab_attivo += """<script>$("#grafici_tab_attivo").val("%s");</script>""" % (grafici_tab_attivo)

    dropdown_valore = """<select name="drop" id="grafici_valore" >"""
    dropdown_valore += """<option value=""> --Seleziona il campo--</option>"""
    dropdown_valore += dropdown_campi
    dropdown_valore += """</select> valore: indicare campo valore ***forse non piu' necessario per i grafici ma occorre VALORIZZARLO comunque***<br/>"""
    dropdown_valore += """<script>$("#grafici_valore option[value=%s]").prop('selected', true);</script>""" % (grafici_valore)

    dropdown_codice = """<select name="drop" id="grafici_codice" >"""
    dropdown_codice += """<option value=""> --Seleziona il campo--</option>"""
    dropdown_codice += dropdown_campi
    dropdown_codice += """</select> codice: identificativo dell'elemento<br/>"""
    dropdown_codice += """<script>$("#grafici_codice option[value=%s]").prop('selected', true);</script>""" % (grafici_codice)

    dropdown_progr = """<select name="drop" id="grafici_progr" >"""
    dropdown_progr += """<option value=""> --Seleziona il campo--</option>"""
    dropdown_progr += dropdown_campi
    dropdown_progr += """</select> progr: eventuale progressivo che insieme al 'codice' identifica univocamente l'elemento. Se non presente porlo uguale all'id<br/>"""
    dropdown_progr += """<script>$("#grafici_progr option[value=%s]").prop('selected', true);</script>""" % (grafici_progr)

    dropdown_tipostaz = """<select name="drop" id="grafici_tipostaz" >"""
    dropdown_tipostaz += """<option value=""> --Seleziona il campo--</option>"""
    dropdown_tipostaz += dropdown_campi
    dropdown_tipostaz += """</select> tipostaz: campo per discernere i parametri da graficare<br/>"""
    dropdown_tipostaz += """<script>$("#grafici_tipostaz option[value=%s]").prop('selected', true);</script>""" % (grafici_tipostaz)

    dropdown_tiporete = """<select name="drop" id="grafici_tiporete" >"""
    dropdown_tiporete += """<option value=""> --Seleziona il campo--</option>"""
    drop_tr = """<option title="grafici_stazione" value="grafici_stazione" style="background-color:#CBFFC4;"> **grafici_stazione** </option>"""
    dropdown_tiporete += drop_tr+dropdown_campi
    dropdown_tiporete += """</select> tiporete: per richiamare correttamente le query per la costruzione dei grafici. Normalmente indicare il "campo grafici_stazione"<br/>"""
    dropdown_tiporete += """<script>$("#grafici_tiporete option[value=%s]").prop('selected', true);</script>""" % (grafici_tiporete)

    select_composito = """<table class='layer_tb' id='grafici_composito'><tr class='tablerow'>
<td class='select' style='text-align:center;'><span class='button-checkbox' id='1'> <button name='select_btn' type='button' class='btn' data-color='info'>Intestazione</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>
<td class='highlight' style='text-align:center;'><span class='button-checkbox' id='2'> <button name='hover_btn' type='button' class='btn' data-color='primary'>TABS grafici</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>
<td class='visible' style='text-align:center;'><span class='button-checkbox' id='3'> <button type='button' class='btn' data-color='success'>TAB meteogramma</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td> 
<td class='visible' style='text-align:center;'><span class='button-checkbox' id='4'> <button type='button' class='btn' data-color='warning'>TAB libero</button> <input type='checkbox' style='display:none;' class='hidden' unchecked /> </span> </td>
    </tr></table>"""
    select_composito += """composito: come comporre la finestra per il layer in esame. Per modificare il comportamento modificare il file jquery_tab.php --> ATTENZIONE! le modifiche su jquery_tab.php riguarderanno tutti i servizi WeGIS<br/>Per definire invece il "TAB libero" modificare in maniera opportuna grafici_composito_url.php<br/>"""
    if (len(grafici_composito)>0):
      composito_arr = grafici_composito.split(',')
      for comp in composito_arr:
        select_composito += """<script>$('#%s input').prop('checked', true);</script>""" % (comp)
    select_composito += """<script>console.log('%s');design_checkboxes(); //rilancio la funzione per i checkbox</script>""" % (grafici_composito)

    #Compongo tutti i vari div per la compilazione dei campi:
    div_grafici = """<div id=grafici_rete>"""
    div_grafici += input_stazione + input_tab_attivo
    div_grafici += dropdown_valore
    div_grafici += dropdown_codice
    div_grafici += dropdown_progr
    div_grafici += dropdown_tipostaz
    div_grafici += dropdown_tiporete
    div_grafici += """<p style="font-size:0.8em;">(i campi evidenziati sono PK o UNIQUE)</p>"""
    div_grafici += select_composito
    div_grafici += "</div>"


    #Scelta della funziona da associare:
    radio_popup = """<div class="radio"><label><input type="radio" name="optradio" id="createPopup" onChange="change_radio(this);" value="createPopup">
	<a href="%s/common/icons/createpopup.png" target="_blank"><b>createPopup</b></a>: apre una popup OpenLayers con contenuto html</label></div>
		<div class="radio"><label><input type="radio" name="optradio" id="open_popup" onChange="change_radio(this);" value="open_popup">
	<a href="%s/common/icons/open_popup.png" target="_blank"><b>open_popup</b></a>: apre una nuova finestra con link ad un unico script/url</label></div>
		<div class="radio"><label><input type="radio" name="optradio" id="grafici_rete" onChange="change_radio(this);" value="grafici_rete">
	<a href="%s/common/icons/grafici_rete.png" target="_blank"><b>grafici_rete</b></a>: apre nuova finestra con TAB e generazione complessa di grafici, meteogrammi, etc</label>
		<div class="radio"><label><input type="radio" name="optradio" id="su_codice" onChange="change_radio(this);" value="su_codice">
	<b>su_codice</b>: nel caso di comportamento complesso modificare il codice popup.js all'interno di ogni singolo servizio su cui si vuole attivare una funzione sulla selezione degli elementi di questo layer</label>
    </div><p style="font-size:0.8em;font-style:italic;">(cliccare sulla funzione per visualizzare uno screenshot di esempio)</p>""" % (root_dir_html, root_dir_html, root_dir_html)
    radio_popup += """<script>$("#%s").attr('checked',true);</script>""" % (funzione_associata)


    #div nel caso in cui la funzione sia da scrivere su codice:
    div_sucodice = """<div id=su_codice><p>--> funzione da scrivere sul codice popup.js all'interno del servizio</p></div>"""

    #compongo il div definitivo:
    div_form_insert = div_url + div_pop + div_grafici + div_sucodice

    variabili = """var layer_name = '%s'; var layer_idx = %s; var webgis_idx = %s; var table_insert = '%s'; var updateOrInsert = '%s';""" % (ol_layer, id_layer, id_stab, popup_table, updateOrInsert)
    frase_intro = "Associa al layer '%s' la funzione da attivare in caso di selezione di un suo elemento" % (ol_layer)
    btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    btn_ok = "<button type='button' id='confirm_insert' disabled onClick='openStep3();' >Conferma inserimento/modifiche</button>"
    btns = btn_esc + "&nbsp;" + btn_ok

    #print page_template % ('Scelta servizio WebGIS', '', frase_intro, dropdown, radio_options, '', btns)
    print page_template % {'root_dir_html':root_dir_html, 'title':'Seleziona funzione popup', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':radio_popup, 'cat_sost':radio_options, 'form_insert': div_form_insert, 'buttons':btns}



#STEP 3
def insert_data():
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

        try:
	    db_updateOrInsert = updateOrInsert
	    #costruisco l'ARRAY-DICTIONARY da caricare direttamente sul DB in tabella
	    oggetto = {}
            for key in data_json:
              oggetto[key] = data_json[key]
	    #print oggetto

	    if db_updateOrInsert=='U':
                 stmt = table_insert_alchemy.update().\
                     where(table_insert_alchemy.c.webgis_idx==id_stab).\
                     where(table_insert_alchemy.c.ol_layer_idx==id_layer).\
                     values(**oggetto)
	    elif db_updateOrInsert=='I':
		 oggetto['webgis_idx'] = id_stab
		 oggetto['ol_layer_idx'] = id_layer
		 stmt = table_insert_alchemy.insert().values(**oggetto)
	    #l'opzione Remove non e' al momento abilitata
	    elif db_updateOrInsert=='R':
                 stmt = table_insert_alchemy.delete().\
                     where(table_insert_alchemy.c.webgis_idx==id_stab).\
                     where(table_insert_alchemy.c.ol_layer_idx==id_layer)
            result = conn.execute(stmt)
        except sqlalchemy.exc.IntegrityError, exc:
            reason = exc.message 
	    if 'duplicate key value violates' in reason:
              print "Elemento gia' presente sul DB!! Provare a ripetere l'operazione dall'inizio, scegliendo un altro elemento"
              print '''<br/><button type='button' id='closeThis' onClick='closeThis();' > Chiudi </button>'''
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
    btns = btn_chiudi
    print page_template % {'root_dir_html':root_dir_html, 'title':'Organizzazione dei layer', 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'cat_sost':input_value, 'form_insert':insert_value, 'buttons':btns}



#STEP di chiamate dello script per inserire i dati:

#Scelgo l'elemento principale:
if step==1:
  choose_popup()


#Inserisco i valori su DB:
if step==3:
  try:
    import simplejson as json
    import logging
    logging.basicConfig(filename='/tmp/add_popup_on_layer.log')
    logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

    #Recupero i dati passati con metodo GET ma anche POST:
    data_array = str(fs["data"].value)
    dest_schema_table = str(fs["dest_table"].value)
    id_stab = str(fs["id_stab"].value)
    id_layer = str(fs["id_layer"].value)
    print id_stab, id_layer
    ol_layer = str(fs["ol_layer"].value)
    updateOrInsert = str(fs["updateOrInsert"].value)

    dest_table = dest_schema_table.split('.')[1]
    dest_schema = dest_schema_table.split('.')[0]
    assert updateOrInsert in ['I', 'U'], "valore variabile 'updateOrInsert' non corretta"
  except AssertionError, e:
    print e.args
    exit()
  except Exception as e:
    print "Error parsing parameters: need 'table','id_stab' variable"
    print ': missing ' + str(e)
    exit()

  data_json = json.loads(data_array)
  insert_data()
