#!/usr/bin/python

"""
script per creare il form di inserimento URL WMS da aggiungere al volo su una mappa OL

Lanciarlo ad esempio:
http://10.127.152.10/devel/cgi-bin/add_WMS_al_volo.py?root_dir_html=/devel

Un esempio di GetCapabilities:
http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimslimammwms/wms_limitiAmm?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities


OTTIMIZZAZIONI:

"""

from config import *

import cgi
import cgitb; cgitb.enable()
from owslib.wms import WebMapService

import sys
reload(sys)
sys.setdefaultencoding('UTF-8')

#WMS CONSIGLIATI:
wms_consigliati = """<option value="http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimslimammwms/wms_limitiAmm?"> Regione Piemonte - Unita amm.ve </option>
<option value="http://webgis.arpa.piemonte.it/ags101free/services/geologia_e_dissesto/SIVA/MapServer/WMSServer?"> SIVA Arpa </option>
<option value="http://geomap.reteunitaria.piemonte.it/ws/vtmonfor/rp-01/incendiwms/wms_vtmonfor_incendi_boschivi?"> Incendi boschivi </option>
<option value="http://osgis2.csi.it/qgs/qgis_cloud/direttiva_alluvioni?"> Regione Piemonte - Direttiva Alluvioni </option>"""

link_geop = "http://www.geoportale.piemonte.it/geocatalogorp/"


print "Content-type:text/html\r\n\r\n"

fs = cgi.FieldStorage()
try:
  root_dir_html = str(fs["root_dir_html"].value)
except:
  root_dir_html = ""

try:
  step = int(fs["step"].value)
  assert step in [1,2,3], "valore variabile 'step' non consentita"
except AssertionError, e:
  print e.args
  exit()
except:
  print "Error parsing parameters: need 'step' variable"
  exit()


page_template = '''
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/bootstrap-theme.min.css" />
<link rel="stylesheet" href="%(root_dir_html)s/jQuery/jquery-ui.css" />

<title>%(title)s</title>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="WMS al volo">
<meta name="Description" content="Aggiungere un WMS specificando l'url">
<meta name="viewport" content="user-scalable=no, width=device-width" />

<script src="%(root_dir_html)s/jQuery/jquery-1.10.2.js"></script>
<script src="%(root_dir_html)s/jQuery/jquery-ui.js"></script>
<script>

//Variabili importate da PYTHON:
%(variables_from_py)s

//Se apro lo script come popup dalla mappa principale ne prendo il riferimento:
var parent_w = window.opener;

var layer_num = 0;
var wms_utente;
var wms_names = [];
function openStep3() {
  //Recupero gli elementi inseriti e li aggiungo alla mappa della parent_w:
  var p_tag = $( "input" ); //recupero le varie righe della tabella dei layer definiti
  $('#toInsert').find(p_tag).each(function(index) {
    layer_num++;
    var input = $(this);
    if (input.is(':checked')) {
	data_name = input[0].dataset.name;
	data_title = input[0].dataset.title;
	data_url = input[0].dataset.url;
	wms_names.push(data_title);
	parent_w.add_wms_from_url(data_title, data_url, data_name, layer_num);

    }
  });
  //per gli sliders provo a farli apparire nella maniera corretta anche su firefox:
  //parent_w.add_wms_slider(wms_names); //ma anche per Firefox non funziona!
  window.close(); //se chiudo la finestra si incanta il webgis!!!
}

function vedi_capabilities() {
  //wmsurl = $('#urlwms')[0].value; //ma se faccio in modo che questo input possa essere svuotato e' rischioso recuperare l'url da qui
  wmsurl = $('#wms_label').attr('data-url');;
  wmsurl_getCap = (wmsurl + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities").replace("??", "?");
  window.open(wmsurl_getCap, "_blank");
}

</script>
<style>
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);}
h1 {font-size:1em;}
#main_table { font-size: small; }
.legendName {font-weight: bold;}
#chiama_url {
  background-image:url(%(root_dir_html)s/common/icons/loupe_blanc.png);
  width: 22px;
  height: 22px;
  border-radius: 2px;
  padding: 1px;
}
.toInsert {
  font-size: small;
}
.label_disabled {
    color:#ccc;
}
</style>
</head>
<body>
<div class="frase_intro">
<p id="frase_intro"> %(frase_intro)s
<br/>
</p>
</div>
<div class="choose_stab">
%(choose_stab)s
</div>
<!-- <div class="form_insert">
%(form_insert)s
</div> -->
<div class="toInsert" id="toInsert">
%(toInsert)s
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

  #variabili create in Python e da riportare in javascript
  variabili = ""

  titolo = "Aggiunta di un servizio WMS in mappa"
  frase_intro = "URL del servizio WMS:<br/><small>Inserire l'URL del servizio WMS. Si avverte che su Firefox la trasparenza dei layer WMS aggiunti potrebbe causare qualche anomalia.</small>"

  dropdown = """<form id="lookforwms_form" action="%s/cgi-bin/add_WMS_al_volo.py" method="post" >
<input list="wms_consigliati" onfocus="this.value=''" id="urlwms" type="url" pattern="https?://.+" required="" name="urlwms" placeholder="http://..." size="54">

  <datalist id="wms_consigliati">
	%s
  </datalist>

<input id="root_dir_html" name='root_dir_html' value='%s' type='hidden'>
<input id="step" value=2 name='step' type='hidden'>
<input id="chiama_url" type="submit" value="" title="interroga l'url" ></form>""" % (root_dir_html, wms_consigliati, root_dir_html)

  input_value = ""
  insert_value = ""
  toInsert_value = ""

  btns = """<button type="button" id="vedi_capabilities" onClick='window.open("%s");' title="cerca servizi WMS dal geoportale della regione Piemonte"><i>geoportale Regione Piemonte</i></button>""" % (link_geop)
  btns += """<button type="button" style="position:absolute; right:45;" id="addlayers_button" onClick='window.close();' title="chiudi questa finestra">Chiudi</button>"""

  print page_template % {'root_dir_html':root_dir_html, 'title':titolo, 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'form_insert':insert_value, 'toInsert': toInsert_value, 'buttons':btns}


#STEP 2
def query_url(url_wms):
  toInsert_value = ""
  try:
    wms = WebMapService(url_wms, version='1.1.1', timeout=5)
  except Exception as e:
    toinsert_value = '<br/><small>URL inserita:<br/> %s</small>' % (url_wms)
    toinsert_value += '<br/><small>Errore:<br/> %s</small>' % (str(e))
    btns = """<button type="button" id="comeback_button" onClick='window.history.go(-1); return false;' title="Ritorna alla maschera di inserimento dell'url">Torna indietro</button>"""
    print page_template % {'root_dir_html':root_dir_html, 'title':'Errore!', 'variables_from_py':'', 'frase_intro':"Non e' stato possibile contattare il server WMS indicato!", 'choose_stab':"<small>assicurarsi che l'indirizzo inserito sia corretto e di aver aggiunto il segno '?' alla fine dell'url</small>", 'form_insert':'', 'toInsert':toinsert_value, 'buttons':btns}
    return 0

  wms_title = wms.identification.title
  toInsert_value += """<ul><li><label id="wms_label" data-url="%s"> %s </label><ul style='-webkit-padding-start: 0px;'>""" % (url_wms, wms_title)

  wms_contents = list(wms.contents)
  #ciclo dentro il contenuto del servizio. Salto il primo elemento perche' pare restituirmi anche il primo layer NON queryable
  #for wms_content in wms_contents[1:]:
  #oppure in un altro modo recupero solo quelli queryable
  for wms_content in wms_contents:
    if (wms[wms_content].queryable==0):
	#potrebbe trattarsi di un layer di base?
	continue
    wms_name = wms[wms_content].title
    wms_srs = wms[wms_content].crsOptions
    wms_abstract = wms[wms_content].abstract
    if ('EPSG:3857' in wms_srs) or ('EPSG:3785' in wms_srs) or ('EPSG:900913' in wms_srs):
	toInsert_value += """<label><input title="%s" type="checkbox" name="layers" data-name="%s" data-title="%s" data-url="%s" data-srs="3857">%s</label><br/>""" % ( wms_abstract, wms_content, wms_name, url_wms, wms_name )
    else:
	toInsert_value += """<label class='label_disabled'><input type="checkbox" name="layers" data-name="%s" data-title="%s" data-url="%s" data-srs="3857" disabled>%s - Proiezione Google non disponibile</label><br/>""" % (wms_content, wms_name, url_wms, wms_name )
    #toInsert_value += """<li class="leaf"><label><input type="checkbox" name="layers" data-name="%s" data-title="%s" data-url="%s" data-srs="3857">%s</label></li>""" % (wms_content, wms_name, url_wms, wms_name)
    #Senza il pallino dell'elenco ma subito il checkbox:
    #toInsert_value += """<label><input type="checkbox" name="layers" data-name="%s" data-title="%s" data-url="%s" data-srs="3857">%s</label><br/>""" % (wms_content, wms_name, url_wms, wms_name )

  #variabili create in Python e da riportare in javascript
  variabili = ""

  titolo = "Aggiunta di un servizio WMS in mappa"
  frase_intro = "URL del servizio WMS:<br/><small>(i layer non disponibili nella proiezione Google saranno disabilitati dalla scelta)</small>"

  dropdown = """<form id="lookforwms_form" action="%s/cgi-bin/add_WMS_al_volo.py" method="post" >
<input list="wms_consigliati" onfocus="this.value=''" id="urlwms" type="url" pattern="https?://.+" required="" name="urlwms" placeholder="http://..." value="%s" size="54">

  <datalist id="wms_consigliati">
	%s
  </datalist>

<input id="root_dir_html" name='root_dir_html' value='%s' type='hidden'>
<input id="step" value=2 name='step' type='hidden'>
<input id="chiama_url" type="submit" value="" title="interroga l'url" ></form>""" % (root_dir_html, url_wms, wms_consigliati, root_dir_html)

  insert_value = ""
  input_value = ""

  btns = """<button type="button" id="vedi_capabilities" onClick='vedi_capabilities();' title="apre in un'altra pagina la risposta della GetCapabilities per il servizio WMS scelto"><i>vedi GetCapabilities</i></button>"""
  btns += """<button type="button" style="position:absolute; right:45;" id="addlayers_button" onClick='openStep3();' title="Aggiungi gli elementi selezionati sulla mappa o chiudi questa finestra">Aggiungi / Chiudi</button>"""

  print page_template % {'root_dir_html':root_dir_html, 'title':titolo, 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'form_insert':insert_value, 'toInsert': toInsert_value, 'buttons':btns}



if step==1:
  choose_stab()

if step==2:
  #Recupero i dati passati con metodo GET ma anche POST:
  url_wms = str(fs["urlwms"].value)
  query_url(url_wms)

