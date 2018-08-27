#!/usr/bin/python

"""
script per caricare la scheda xml con il metadato del tematismo selezionato su menu dei layer in IRIS

OTTIMIZZAZIONI:
- gestire il tutto da DB?

"""

from config import *

import re,os,sys
import cgi
import cgitb; cgitb.enable()
reload(sys)
sys.setdefaultencoding('UTF-8')

import sqlalchemy
from sqlalchemy import Column, ForeignKey
from sqlalchemy import create_engine, Table, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.types import Integer, Unicode, String, Float
from sqlalchemy.sql import text

Base = declarative_base()
global schema
schema = 'public'

from lxml import etree
from lxml import html

fs = cgi.FieldStorage()
try:
  root_dir_html = str(fs["root_dir_html"].value)
except:
  root_dir_html = ""

try:
  webgis_idx = int(fs["webgis_idx"].value)
  legend_name = str(fs["legend_name"].value)
except:
  print "Error parsing parameters: need 'webgis_idx' and 'legend_name' variable"
  exit()


page_template_empty = '''
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<title>Scheda layer</title>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="Scheda layer">
<meta name="Description" content="Descrizione origine e tematizzazione layer">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script>
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
var root_dir_html = getUrlParameter('root_dir_html');
var layername = getUrlParameter('legend_name');
function caricamento_completato() {
  document.getElementById('layername').innerHTML = layername;
};
</script>

<style>
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);}
h4, h5 {
    display: inline;
}
</style>
</head>

<body onload="caricamento_completato()">

<h4> %(messaggio)s
<span id='layername'> </span>
</h4>

</body>

</html>
'''

page_template_nodoc = '''
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<title>Scheda layer</title>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="Scheda layer">
<meta name="Description" content="Descrizione origine e tematizzazione layer">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script>
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
var root_dir_html = getUrlParameter('root_dir_html');
var layername = getUrlParameter('legend_name');
function caricamento_completato() {
  document.getElementById('layername').innerHTML = layername;
};
</script>

<style>
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);}
h4, h5 {
    display: inline;
}
#seconde_info {font-size:0.85em;}
h5 {font-size:0.9em;}
</style>
</head>

<body onload="caricamento_completato()">

<h4> %(messaggio)s
<span id='layername'> </span>
</h4>

<div id='seconde_info'>
<br>
<h5> Tematizzazione: </h5> %(theme_desc)s
<br>
<h5> Azione su click: </h5> %(azione_popup)s
<br>
<br>
<h5> Origine del dato: </h5> %(db_table_view_name)s
<br>
<h5> Nome variabile OL e PK: </h5> %(ol_name)s
<br>
</div>

</body>

</html>
'''

page_template = '''
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<title>Scheda layer</title>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="Scheda layer">
<meta name="Description" content="Descrizione origine e tematizzazione layer">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script>
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
var root_dir_html = getUrlParameter('root_dir_html');
var layername = getUrlParameter('legend_name');
function caricamento_completato() {
  document.getElementById('layername').innerHTML = layername;
};

</script>

<style>
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);}
h1 {font-size:1em;}
h4, h5 {
    display: inline;
}
#seconde_info {font-size:0.85em;}
h5 {font-size:0.9em;}
</style>

</head>


<body onload="caricamento_completato()">

<h4> Nome del layer:
<span id='layername'> </span>
</h4>
<br>

<p>
<h4> Descrizione: </h4>
<br>
%(description_tag)s
</p>

<h4> Proprietario: </h4>
<br>
%(org_tag)s
<br>

<br>
<h4> Contatti: </h4>
<br>
%(mail_tag)s
<br><br>

<div id='seconde_info'>
<br>
<h5> Tematizzazione: </h5> %(theme_desc)s
<br>
<h5> Azione su click: </h5> %(azione_popup)s
<br>
<br>
<h5> Origine del dato: </h5> %(db_table_view_name)s
<br>
<h5> Nome variabile OL e PK: </h5> %(ol_name)s
<br>
</div>

</body>

</html>
'''

#Interrogo il DB per sapere se la risorsa metadato e' disponibile:
global engine
engine = create_engine(dns)
Base.metadata.bind = engine
meta = MetaData()
try:
  with engine.connect() as conn:
    conn.execute("SET search_path TO config, public;")
    meta = MetaData()
    sql = "SELECT a.webgis_idx, legend_name, select_highlight, a.ol_layer_idx, openlayer_name, db_table_view_name, theme_description, COALESCE(c.funzione_associata, 'none') AS azione_popup, upper(geom_type) AS geom_type, COALESCE(grid_title, 'none') AS grid_title \
FROM config.webgis_layers a \
JOIN \
config.webgis_ol_layers b ON a.ol_layer_idx=b.layer_idx \
LEFT JOIN \
config.webgis_popups c ON a.ol_layer_idx=c.ol_layer_idx AND a.webgis_idx=c.webgis_idx \
	WHERE a.webgis_idx=%i AND rtrim(legend_name)='%s';" % (webgis_idx, legend_name)
    result = conn.execute(text(sql))
    rows_amount = 0
    for row in result:
      rows_amount += 1
      ol_name = row['openlayer_name']
      ol_layer_idx = row['ol_layer_idx']
      name_and_id = "%s (%s)" % (ol_name, ol_layer_idx)
      db_table_view_name = row['db_table_view_name']
      select_highlight = row['select_highlight']
      theme_description = row['theme_description']
      azione_popup = row['azione_popup']
      if (azione_popup == 'none'):
	azione_popup = 'nessuna o non definita su DB'
      if (row['geom_type'] == 'RASTER'):
        grid_title = row['grid_title']
      else:
	grid_title = 'none'
      #prelevo l'xml con il metadato INSPIRE:
      sql_xml = "SELECT ol_layer_idx, metadata FROM config.webgis_metadata_xml WHERE ol_layer_idx=%s;" % (ol_layer_idx)
      result_xml = conn.execute(text(sql_xml))
      one_row = result_xml.fetchone()
      if one_row:
        xml_metadata = one_row['metadata']
        root_get = etree.fromstring(xml_metadata)
      else:
	print page_template_nodoc % {'root_dir_html':root_dir_html, 'messaggio': 'Nessuna documentazione disponibile per la risorsa:', 'db_table_view_name':db_table_view_name, 'theme_desc':theme_description, 'ol_name':name_and_id, 'azione_popup':azione_popup}
	sys.exit(0)
    if not rows_amount:
      print page_template_empty % {'root_dir_html':root_dir_html, 'messaggio': 'Risorsa non presente su DB o nessuna documentazione disponibile per:'}
      sys.exit(0)

    conn.close()
except Exception as e:
  err = str(e)
  print err



try:
  #Prelevare direttamente l'xml da un file:
  #get_report_xml = '../html/common/docs/help_layers_fiches/' + ol_name + '.xml'
  #tree_get = etree.parse(get_report_xml) #leggere il file
  #root_get = tree_get.getroot()

  descrizione_tag = root_get.find(".//{http://www.isotc211.org/2005/gmd}abstract")
  organizzazione_tag = root_get.find(".//{http://www.isotc211.org/2005/gmd}organisationName")
  #prendo alcuni tag solo da questo tag per evitare doppioni:
  core_tag = root_get.find(".//{http://www.isotc211.org/2005/srv}SV_ServiceIdentification")
  contact_mail_tag = core_tag.find(".//{http://www.isotc211.org/2005/gmd}CI_Address")
  ol_title_tag = core_tag.find(".//{http://www.isotc211.org/2005/gmd}title")

  descrizione = descrizione_tag.getchildren()[0].text
  descrizione = descrizione.replace("\n","<br />\n")
  organizzazione = organizzazione_tag.getchildren()[0].text
  ol_title = ol_title_tag.getchildren()[0].text

  mails_tag = []
  for mails in contact_mail_tag.getchildren():
    mails_tag.append(mails.getchildren()[0].text)

  mails_txt = "\n".join(mails_tag)
  mails_txt = mails_txt.replace("\n","<br />\n")

  print page_template % {'root_dir_html':root_dir_html, 'description_tag':descrizione, 'org_tag':organizzazione, 'mail_tag':str(mails_txt), 'db_table_view_name':db_table_view_name, 'theme_desc':theme_description, 'ol_name':name_and_id, 'azione_popup':azione_popup }

except Exception as e:
  err = str(e)
  print "Content-Type: text/html"
  print ""
  print err


