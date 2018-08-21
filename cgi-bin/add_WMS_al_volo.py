#!/usr/bin/python

"""
script per creare il form di inserimento URL WMS da aggiungere al volo su una mappa OL

Lanciarlo ad esempio:
http://10.127.152.10/devel/cgi-bin/add_WMS_al_volo.py?root_dir_html=/devel

Un esempio di GetCapabilities:
http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimslimammwms/wms_limitiAmm?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities


OTTIMIZZAZIONI:

"""

import cgi
import cgitb; cgitb.enable()
from owslib.wms import WebMapService


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

var wms_utente;
function openStep3() {
  //Recupero gli elementi inseriti e li aggiungo alla mappa della parent_w:
  var p_tag = $( "input" ); //recupero le varie righe della tabella dei layer definiti
  $('#toInsert').find(p_tag).each(function(index) {
    var input = $(this);
    if (input.is(':checked')) {
	data_name = input[0].dataset.name;
	data_title = input[0].dataset.title;
	data_url = input[0].dataset.url;

	parent_w.add_wms_from_url(data_title, data_url, data_name);

    }
  });
  window.close(); //se chiudo la finestra si incanta il webgis!!!
}

</script>
<style>
body {font-family: Verdana,Arial,sans-serif;background-image:url(%(root_dir_html)s/common/background_img/sketch.jpg);} h1 {font-size:1em;}
#main_table { font-size: small; }
.legendName {font-weight: bold;}
#chiama_url {
  background-image:url(%(root_dir_html)s/common/icons/loupe_blanc.png);
  width: 22px;
  height: 22px;
  border-radius: 2px;
  padding: 1px;
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
  frase_intro = "URL del servizio WMS:<br/><small>(il servizio si suppone renda disponibile la proiezione Google)</small>"

  dropdown = """<form id="lookforwms_form" action="%s/cgi-bin/add_WMS_al_volo.py" method="post" >
<input id="urlwms" type="url" pattern="https?://.+" required="" name="urlwms" placeholder="http://..." size="50">
<input id="root_dir_html" name='root_dir_html' value='%s' type='hidden'>
<input id="step" value=2 name='step' type='hidden'>
<input id="chiama_url" type="submit" value="" ></form>""" % (root_dir_html, root_dir_html)

  input_value = ""
  insert_value = ""
  toInsert_value = ""

  btns = """<button type="submit" id="addlayers_button" title="Aggiungi gli elementi selezionati">Aggiungi</button>"""

  print page_template % {'root_dir_html':root_dir_html, 'title':titolo, 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'form_insert':insert_value, 'toInsert': toInsert_value, 'buttons':btns}


#STEP 2
def query_url(url_wms):
  toInsert_value = ""
  try:
    wms = WebMapService(url_wms, version='1.1.1', timeout=5)
  except:
    toinsert_value = '<br/><small>URL inserita:<br/> %s</small>' % (url_wms)
    btns = """<button type="button" id="comeback_button" onClick='window.history.go(-1); return false;' title="Ritorna alla maschera di inserimento dell'url">Torna indietro</button>"""
    print page_template % {'root_dir_html':root_dir_html, 'title':'Errore!', 'variables_from_py':'', 'frase_intro':"Non e' stato possibile contattare il server WMS indicato!", 'choose_stab':"<small>assicurarsi che l'indirizzo inserito sia corretto e di aver aggiunto il segno '?' alla fine dell'url</small>", 'form_insert':'', 'toInsert':toinsert_value, 'buttons':btns}
    return 0

  wms_title = wms.identification.title
  toInsert_value += """<ul><li><label>%s</label><ul style='-webkit-padding-start: 0px;'>""" % (wms_title)

  wms_contents = list(wms.contents)
  #ciclo dentro il contenuto del servizio. Salto il primo elemento perche' pare restituirmi anche il primo layer NON queryable
  #for wms_content in wms_contents[1:]:
  #oppure in un altro modo recupero solo quelli queryable
  for wms_content in wms_contents:
    if (wms[wms_content].queryable==0):
	#potrebbe trattarsi di un layer di base?
	continue
    wms_name = wms[wms_content].title
    #toInsert_value += """<li class="leaf"><label><input type="checkbox" name="layers" data-name="%s" data-title="%s" data-url="%s" data-srs="3857">%s</label></li>""" % (wms_content, wms_name, url_wms, wms_name)
    #Senza il pallino dell'elenco ma subito il checkbox:
    toInsert_value += """<label><input type="checkbox" name="layers" data-name="%s" data-title="%s" data-url="%s" data-srs="3857">%s</label><br/>""" % (wms_content, wms_name, url_wms, wms_name)

  #variabili create in Python e da riportare in javascript
  variabili = ""

  titolo = "Aggiunta di un servizio WMS in mappa"
  frase_intro = "URL del servizio WMS:<br/><small>(il servizio si suppone renda disponibile la proiezione Google)</small>"

  dropdown = """<form id="lookforwms_form" action="%s/cgi-bin/add_WMS_al_volo.py" method="post" >
<input id="urlwms" type="url" pattern="https?://.+" required="" name="urlwms" placeholder="http://..." value="%s" size="50">
<input id="root_dir_html" name='root_dir_html' value='%s' type='hidden'>
<input id="step" value=2 name='step' type='hidden'>
<input id="chiama_url" type="submit" value="" ></form>""" % (root_dir_html, url_wms, root_dir_html)

  insert_value = ""
  input_value = ""

  btns = """<button type="button" id="addlayers_button" onClick='openStep3();' title="Aggiungi gli elementi selezionati">Aggiungi</button>"""

  print page_template % {'root_dir_html':root_dir_html, 'title':titolo, 'variables_from_py':variabili, 'frase_intro':frase_intro, 'choose_stab':dropdown, 'form_insert':insert_value, 'toInsert': toInsert_value, 'buttons':btns}



if step==1:
  choose_stab()

if step==2:
  #Recupero i dati passati con metodo GET ma anche POST:
  url_wms = str(fs["urlwms"].value)
  query_url(url_wms)

