#!/usr/bin/python

"""
script per creare il form di inserimento dati per RIR

OTTIMIZZAZIONI:
- passare il tipo di campo (double, text) in tutti i passaggi per controllare meglio l'iter
- passare il nome della colonna contenenente l'ID dell'oggetto per l'inserimento finale
"""

import re,os,sys
import cgi
import cgitb; cgitb.enable()
import commands
#import pg
#import urllib
#import simplejson
from unicodedata import normalize
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
  step = int(fs["step"].value)
  assert step in [1,2,3], "valore variabile 'step' non consentita"
  if "id_stab" in fs:
    id_stab = str(fs["id_stab"].value)
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
<link rel="stylesheet" href="/radar/jQuery/jquery-ui.css" />
<title>%s</title>
<script src="/radar/jQuery/jquery-1.10.2.js"></script>
<script src="/radar/jQuery/jquery-ui.js"></script>
<script>
$( document ).ready(function() {

//NON CAPISCO PERCHE' NON MI FACCIA INSERIRE IL PUNTO ANCHE SE HO DETTO CHE PUO ESSERE INSERITO.
//Per farlo funzionare ho dovuto mettere il keyCode il codice e' 46: ma come limitare ad UN SOLO PUNTO??
//SERVE UNA VALIDAZIONE IN OGNI CASO PER OVVIARE ANCHE A DIFFERENTI LAYOUT DI TASTIERA!!
  $(".allownumericwithdecimal").on("keypress",function (event) {
	//Attenzione che su Opera il keyCode 46 dovrebbe essere il DEL
	var controlKeys = [8, 9, 13, 35, 36, 37, 39, 46];
	var isControlKey = controlKeys.join(",").match(new RegExp(event.which));
	if (!event.which || // Control keys in most browsers. e.g. Firefox tab is 0
	   (48 <= event.which && event.which <= 57) || // Always 0 through 9
	   //($(this).val().indexOf('.') == -1) //provo a permettere il punto decimale,pero su IE non funziona,pare
	   //|| (48 == event.which && ($(this).val() > 0 )) || // No 0 first digit-per tipo INTEGER
	   isControlKey // Opera assigns values for control keys.
	){
	    previousValue = $(this).val();
	    return;
	} else {
	    event.preventDefault();
	}
  });
  $(".allownumericwithdecimal").on("input keyup blur",function (event) {
            //Faccio un ulteriore validazione se il contenuto e' numerico o no:
            valueInserted = $(this).val();
            console.log(valueInserted);
            if ($.isNumeric(valueInserted) === false)
            {
                alert("Must input numbers");
		$(this).val(previousValue);
                event.preventDefault();
            } else {
               return;
            }
  });
  $(".allownumericwithoutdecimal").on("keypress keyup blur",function (event) {
           $(this).val($(this).val().replace(/[^\d].+/, ""));
            if ((event.which < 48 || event.which > 57)) {
                event.preventDefault();
            }
  });
})

function allowValue(objectDrop) {
    var selectedVal = objectDrop.value;
    if (selectedVal != "000") $('#value').prop("disabled", false);
    else  {
	$('#value').prop("disabled", true);
	$('#value').val('');
	$('#addValue').prop("disabled", true);
    }
}
function activeBtn() {
    $('#addValue').prop("disabled", false);
}
function checkValue() {
    valueInserted = $("#value").val();
    //Controllo il valore: questo andrebbe fatto sull'effettivo TIPO del CAMPO
    //if (isNaN(valueInserted)) // this is the code I need to change
    if ($.isNumeric(valueInserted) === false)
    {
        alert("Must input numbers");
        return false;
    }
    else {
	//Se il valore e' valido, lo tengo da parte e resetto tutto il form:
	var element_label = $( "#drop option:selected" ).text();
	var element_id = $( "#drop" ).val();
	//var value_toinsert = $("#value").val();
        var value_toinsert = valueInserted;
	var new_element = "<p id=p_" + element_id + "> <label for='"+element_id+"'>"+element_label+"</label> <input type='text' name='"+escape(element_label)+"' id=" + element_id + " title='consente numeri decimali' class='allownumericwithdecimal' value=" + value_toinsert + " /> <input id=img_" + element_id + " type='image' src='/radar/common/icons/trash_remove.png' style='width:15px;' title='rimuovi' onClick='remove_inserted("+element_id+");' /> </p>";
	$( ".toInsert" ).append(new_element);
	$("#drop option[value='"+element_id+"']").remove();
	$('#value').prop("disabled", true);
        $('#value').val('');
        $('#addValue').prop("disabled", true);
        $('#confirm_insert').prop("disabled", false);
    }
}

function remove_inserted(element_id) {
    ids = element_id.id;
    names = unescape(element_id.name);
    var myOptions = [ids, names];
    //Appendo l'elemento scartato di nuovo nel selectTag:
    var mySelect = $('#drop');
    mySelect.append(
            $('<option></option>').val(myOptions[0]).html(myOptions[1])
    );
    $("#p_"+myOptions[0]).remove();
    //Se il DIV resta vuoto, spengo il pulsante di conferma inserimento:
    if(!$.trim($(".toInsert").html())) {
	//Il DIV e' vuoto, spengo il pulsante:
	$('#confirm_insert').prop("disabled", true);
    }
}

var id_stab_IN;
function openStep2() {
    id_stab_IN = $("#drop").val();
    nome_stab = $("#drop option:selected").text();
    console.log(id_stab_IN);
    table_type = $("input[name='table']:checked").val();
    uri_ok = "/radar/cgi-bin/mask_dataentry_rir.py?step=2&table=ri0307."+table_type+"&id_stab="+id_stab_IN+"&nome="+nome_stab;
    window.open(uri_ok,'_self');
}

var oggetto;
function openStep3() {
    //Recupero gli elementi inseriti, richiedo una verifica all'utente e una conferma finale
    var nome_oggetto = $("#nome_oggetto").first().text();
    var id_oggetto = $($("#id_oggetto")[0]).text();
    oggetto = [id_oggetto, nome_oggetto];
    var jsonArg1 = new Object();
    var pluginArrayArg = new Array();
    var p_tag = $( "p" );
    $('#toInsert').find(p_tag).each(function(index) {
        var input = $(this);
	input_id = (input.attr('id')).replace('p_','');
	jsonArg1[input_id] = $("#"+input_id).val();
	pluginArrayArg.push(jsonArg1);
        //alert('ID: ' + input.attr('id') + 'Name: ' + input.attr('name') + 'Value: ' + input.val());
    });
    //Costruisco il contenuto della finestra di conferma:
    var title_confirm = "Conferma dati per "+nome_oggetto+":";
    var html_confirm = "";
    $.each( jsonArg1, function( key_obj, value_obj ) {
        html_confirm += key_obj + ": " + value_obj + "<br/>";
    });
    $("#dialog-confirm").html(html_confirm);
    // Define the Dialog and its properties.
    $("#dialog-confirm").dialog({
        resizable: false,
        modal: true,
        title: title_confirm,
        height: 250,
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
    uri_final = "/radar/cgi-bin/mask_dataentry_rir.py?step=3&data="+data_array+"&id_stab="+oggetto[0]+"&nome="+escape(oggetto[1])+"&dest_table="+dest_table+"&update="+update;
    window.open(uri_final,'_self');
}

function closeThis()
{
//A quanto pare cmq non si puo aprire qlcosa che non e stato aperto da questo script
  //window.open('','_self');
  //window.close();
  window.top.close();
}

//Variabili importate da PYTHON:
%s
</script>
<style>body {font-family: Verdana,Arial,sans-serif;background-image:url(/radar/common/background_img/sketch.jpg);} h1 {font-size:1em;}</style>
</head>
<body>
<div class="frase_intro">
<p id="frase_intro"> %s
<br/>
</p>
</div>
</br>
<div class="choose_stab">
%s
</div>
</br>
<div class="cat_sost">
%s
</div>
</br>
<div class="form_insert">
%s
</div>
</br>
<div class="toInsert" id="toInsert">
</div>
</br>
<div class="buttons">
%s
</div>
<div id="dialog-confirm">
</div>
</body>
</html>'''


def choose_stab():
    global engine
    source_table = "ri0307.v_stabilimenti_rir_piemonte_completo"
    radio_options = ""
    dns = 'postgresql://webgis:webgis$2013%@localhost:5432/radar'
    engine = create_engine(dns)
    Base.metadata.bind = engine
    meta = MetaData()
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO ri0307, public")
        meta = MetaData()
        sql = "SELECT id_stabilimento AS column_name, nome_stabilimento || '  #' || id_stabilimento AS label FROM {0} ORDER BY nome_stabilimento;".format(source_table)
        result = conn.execute(text(sql))
        dropdown = """<select name="drop" id="drop" onChange="allowValue(this);">"""
        dropdown += """<option value="000"> --Seleziona lo stabilimento--</option>"""
        for row in result:
            dropdown += """<option value="%s"> %s </option>""" % (row['column_name'], row['label'])
        
    dropdown += """</select>"""
    radio_options += """</br> Tipo di dati da inserire: <br> <label for="sostanze">Sostanze</label> <input type="radio" name="table" id="sostanze" value="v_maskdataentry_sostanze" checked> <br> <label for="categorie">Categorie</label> <input type="radio" name="table" id="categorie" value="v_maskdataentry_categorie">"""
    frase_intro = "Scegli lo stabilimento e i dati da inserire:"
    btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    #btn_annulla = "<button type='button'>Annulla e torna indietro</button>"
    btn_ok = "<button type='button' id='value' disabled onClick='openStep2();' >Conferma e procedi</button>"
    btns = btn_esc + "&nbsp;" + btn_ok
    print page_template % ('Scelta stabilimento RIR', '', frase_intro, dropdown, radio_options, '', btns)
    #Se la finestra viene aperta a partire da uno stabilimento lo seleziono:
    if id_stab:
        print '<script>$("#drop").val(%s);</script>' % (id_stab)
        print '<script>document.getElementById("value").disabled = false;</script>'
    conn.close()


def update_data():
    Base.metadata.bind = engine
    meta = MetaData()
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(columns_schema))
        meta = MetaData()
        sql = "SELECT * FROM {0} WHERE id_stabilimento={1};".format(table_insert, id_stab)
        result = conn.execute(text(sql))
        first_row = result.fetchone()
        print "<script>"
        for column in columns:
            #if first_row[column] is None:
            #  print "{0} e' nulla".format(column)
            if first_row[column] is not None:
               #print first_row[column]
               print "update = 1;"
               print '''var element_label = $("#drop option[value='%s']").text();''' % (column)
               print '''var element_id = '%s';''' % (column)
               print '''var value_toinsert = '%s';''' % (first_row[column])
               #print '''var new_element = "<p id=p_%s> <label for='%s'>"+element_label+"</label> <input type='text' name='"+escape(element_label)+"' id=%s value=%s disabled/> <input id=img_%s type='image' src='/common/icons/trash_remove.png' style='width:15px;' title='rimuovi' onClick='remove_inserted(%s);' /> </p>";''' % (column, column, column, first_row[column], column, column)
               print '''var new_element = "<p id=p_" + element_id + "> <label for='"+element_id+"'>"+element_label+"</label> <input type='text' name='"+escape(element_label)+"' id=" + element_id + " title='consente numeri decimali' class='allownumericwithdecimal' value=" + value_toinsert + " /> %s <input id=img_" + element_id + " type='image' src='/radar/common/icons/trash_remove.png' style='width:15px;' title='rimuovi' onClick='remove_inserted("+element_id+");' /> </p>";''' % (udm)
               print '''$( ".toInsert" ).append(new_element);'''
               print '''$("#drop option[value='"+element_id+"']").remove();
                    $('#value').prop("disabled", true);
                    $('#value').val('');
                    $('#addValue').prop("disabled", true);
                    $('#confirm_insert').prop("disabled", false);'''

        print "</script>"

    return

def insert_new_data():
    global udm
    ###Definisco il DB:
    Base.metadata.bind = engine
    meta = MetaData()
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(columns_schema))
        meta = MetaData()
        #inf_schema = Table('columns', meta, autoload=True, autoload_with=conn)
        #sql = text("SELECT column_name, column_default, is_nullable, data_type, character_maximum_length, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_schema = 'ri0307' AND table_name = 'sostanze_clp';")
        sql = "SELECT column_name, label, column_default, is_nullable, data_type, character_maximum_length, numeric_precision, numeric_scale, udm FROM {0};".format(columns_table)
        result = conn.execute(text(sql))
	dropdown = """<select name="drop" id="drop" onChange="allowValue(this);">"""
	dropdown += """<option value="000"> --Seleziona un elemento--</option>"""
	insert_value = """<input type="button" id="addValue" value="Inserisci il valore" disabled onClick="checkValue();" />"""
        for row in result:
            columns.append(row['column_name'])
	    dropdown += """<option value="%s"> %s </option>""" % (row['column_name'], row['label'])
	udm = '{0}'.format(row['udm'])
	input_value = "<input type='text' id='value' placeholder='Inserire un valore' title='solo valori decimali' class='allownumericwithdecimal' disabled onFocus='activeBtn();' />&nbsp;{0}".format(udm)
        #print columns

    dropdown += """</select>"""
    variabili = """var table_insert = '%s';""" % (table_insert)
    variabili += "var update = 0;"
    frase_intro = "Stabilimento <span id='nome_oggetto'>%s</span> (id. <span id='id_oggetto'>%s</span>)" % (nome_stab, id_stab)
    btn_esc = "<button type='button' id='closeThis' onClick='closeThis();'>Annulla ed esci</button>"
    btn_annulla = '''<button type='button' id='backToStart' onClick="location.href='/radar/cgi-bin/mask_dataentry_rir.py?step=1&root_dir_html=/radar&origine=1&id_stab=%s';">Annulla e torna indietro</button>''' % (id_stab) 
    btn_ok = "<button type='button' id='confirm_insert' disabled onClick='openStep3();' >Conferma inserimento</button>"
    btns = btn_esc + "&nbsp;" + btn_annulla + "&nbsp;" + btn_ok
    print page_template % ("Inserimento sostanze RIR", variabili, frase_intro, dropdown, input_value, insert_value, btns)
    conn.close()

def insert_data():
    ###Definisco il DB:
    global engine, table_insert, dati, oggetto
    dns = 'postgresql://radar:dirac0@localhost:5432/radar'
    #engine = create_engine(dns, echo=True) #per avere i LOG stampati a video invece che in un file con Logging
    engine = create_engine(dns)
    Base.metadata.bind = engine
    #Definiamo le tabelle di destinazione:
    with engine.connect() as conn:
        conn.execute("SET search_path TO {0}, public".format(dest_schema))
        meta = MetaData()
        table_insert = Table(dest_table, meta, autoload=True, autoload_with=conn)
        ################CARICHIAMO I DATI DAL FILE NELL'ARRAY-DICTIONARY dati_sismi
        #dati = {} #questa variabile ti serve se devi inserire piu righe in una volta, ma nn e' questo il caso
        #dati['table_insert'] = {}
        oggetto = {}
        oggetto['id_stabilimento'] = int(id_stab)
        for key in data_json:
            value = data_json[key]
            oggetto[key] = float(value)
            #print("The key and value are ({0}) = ({1})".format(key, value))
        #dati['table_insert'].update(oggetto)

        #Verifico se effettuare una insert o un update:
        if update==0:
          try:
            stmt = table_insert.insert().values(**oggetto)
            result = conn.execute(stmt)
            frase_intro = 'Dati inseriti con successo!'
          except sqlalchemy.exc.IntegrityError, exc:
            reason = exc.message
            #print reason
            if 'duplicate key value violates' in reason:
              #print exc.params
              print "Elemento gia' presente sul DB!! Provare a ripetere l'operazione dall'inizio, scegliendo un altro elemento"
              print '''<br/><button type='button' id='again' onClick="location.href = '/radar/cgi-bin/mask_dataentry_rir.py?step=1';" > Ricomincia </button>'''
              return false
          except:
            print 'Errore sconosciuto'
            #sys.exit(1)
            return false

        elif update==1:
          #print 'Invece devo fare un UPDATE!'
          try:
            stmt = table_insert.update().where(table_insert.c.id_stabilimento==id_stab).values(**oggetto)
            result = conn.execute(stmt)
            frase_intro = 'Dati aggiornati con successo!'
          except sqlalchemy.exc.IntegrityError, exc:
            reason = exc.message 
            return false

    conn.close()
    variabili = ""
    dropdown = ""
    input_value = ""
    insert_value = ""
    btn_chiudi = "<button type='button' id='closeThis' onClick='closeThis();' > Chiudi </button>"
    btn_ancora = '''<button type='button' id='again' onClick="location.href='/radar/cgi-bin/mask_dataentry_rir.py?step=1&root_dir_html=/radar&origine=1&id_stab=%s';" > Inserisci ancora </button>''' % (id_stab)
    btns = btn_ancora + "&nbsp;" + btn_chiudi
    print page_template % ("Inserimento sostanze RIR", variabili, frase_intro, dropdown, input_value, insert_value, btns)


#STEP di chiamate dello script per inserire i dati:

#Scelgo l'elemento principale:
if step==1:
  choose_stab()

#Inserisco i valori sul FORM HTML:
if step==2:
  try:
    table_columns = str(fs["table"].value)
    id_stab = int(fs["id_stab"].value)
    nome_stab = str(fs["nome"].value)
    #if "progetto" in fs:
    #    progetto = fs["progetto"].value
    assert table_columns in ['ri0307.v_maskdataentry_categorie', 'ri0307.v_maskdataentry_sostanze'], "valore variabile 'table' non consentita"
    if table_columns=='ri0307.v_maskdataentry_categorie':
        table_insert = 'ri0307.categorie_clp'
    elif table_columns=='ri0307.v_maskdataentry_sostanze':
        table_insert = 'ri0307.sostanze_clp'
    columns_table = table_columns.split('.')[1]
    columns_schema = table_insert.split('.')[0]

  except AssertionError, e:
    print e.args
    exit()
  except:
    print "Error parsing parameters: need 'table','id_stab','nome' variable"
    exit()

  global engine, dns, columns
  dns = 'postgresql://webgis:webgis$2013%@localhost:5432/radar'
  engine = create_engine(dns)
  columns = []
  Base.metadata.bind = engine
  #Verifichiamo se esistono gia' dei dati:
  with engine.connect() as conn:
    conn.execute("SET search_path TO {0}, public".format(columns_schema))
    meta = MetaData()
    sql = "SELECT count(*) AS conta FROM {0} WHERE id_stabilimento={1};".format(table_insert, id_stab)
    result = conn.execute(text(sql))
    first_row = result.fetchone()
    occorrenze = first_row['conta']

  conn.close()
  if occorrenze>0:
    #print 'Elemento gia esistente'
    insert_new_data()
    update_data()
  else:
    insert_new_data()


#Inserisco i valori su DB:
if step==3:
  try:
    import simplejson as json
    import logging
    logging.basicConfig(filename='/tmp/sqlalchemy_rir.log')
    logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)

    data_array = str(fs["data"].value)
    dest_schema_table = str(fs["dest_table"].value)
    dest_table = dest_schema_table.split('.')[1]
    dest_schema = dest_schema_table.split('.')[0]
    id_stab = str(fs["id_stab"].value)
    nome_stab = str(fs["nome"].value)
    update = int(fs["update"].value)
    assert update in [0,1], "valore variabile 'update' non corretta"
  except AssertionError, e:
    print e.args
    exit()
  except:
    print "Error parsing parameters: need 'table','id_stab' variable"
    exit()

  data_json = json.loads(data_array)
  insert_data()
