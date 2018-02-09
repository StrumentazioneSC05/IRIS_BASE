<?php
/***************************************************************
* Name:        IRIS - Integrated Radar Information System
* Purpose:     WebGis System for Meteorological Monitoring
*
* Author:      Roberto Cremonini, Armando Gaeta, Rocco Pispico
* Email:       sistemi.previsionali@arpa.piemonte.it
*
* Created:     01/04/2016
* Licence:     EUPL 1.1 Arpa Piemonte 2016
***************************************************************/

/*
In questo codice creo le finestre da mostrare come ExtTab sul WebGIS in cui l'utente puo' modificare alcune impostazioni di visualizzazione del webgis.
Si compone di alcune parti:

- scelta impostazione mappa
- sceta visualizzazione layer

*/

if (isset($_GET["code"])) {$code = $_GET["code"];}
else die();
if (isset($_GET["root_dir_html"])) {$root_dir_html = $_GET["root_dir_html"];}
else die();
if (isset($_GET["TYPE"])) {$webgis_type = $_GET["TYPE"];}
else die();
if (isset($_GET["devel"])) {$devel = $_GET["devel"];}

if(isset($_COOKIE[$webgis_type])) {
    //$cookie_info = explode("&" , $_COOKIE["cookie_uid"]);
    //$user_uid = $cookie_info[0];
    //$visits = $cookie_info[1];
    //$webgis_type = $cookie_info[2];;
    //$cookie_string = $_COOKIE["cookie_uid"];
    $cookie_string = $_COOKIE[$webgis_type];
}
else die();

?>

<html>
<head>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.min.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/proj4js-combined.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/docCookies.js"></script>';
echo $script_js;
?>

<script>
/*************************
PARTE INIZIALE IN COMUNE
*************************/
var root_dir_html = '<?php echo $root_dir_html; ?>';
var cookie_string = $.parseJSON('<?php echo $cookie_string; ?>'); //dovrebbe essere in formato JSON
var webgis = '<?php echo $webgis_type; ?>';
console.log(cookie_string);
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    //document.cookie = cname + "=" + cvalue + "; " + expires + "; '/'";
    docCookies.setItem(cname, cvalue, 2592e3, '/'); // this cookie will expire in one MONTH (30 days)
}
function distinctVal(arr){
    var newArray = [];
    for(var i=0, j=arr.length; i<j; i++){
        if(newArray.indexOf(arr[i]) == -1)
              newArray.push(arr[i]);
    }
    return newArray;
}
//Stile dei BUTTON secondo jQuery
$(function() {
    //$( "input[type=submit], a, button" )
    $( ".button" )
      .button()
      .click(function( event ) {
        event.preventDefault();
      });
});


/*************************
PARTE GENERALE - MAPPA
*************************/
function set_starting_cookie() {
  var zoom = document.getElementById("zoom_center").value;
  var lat = document.getElementById("lat_center").value;
  var lon = document.getElementById("lon_center").value;
  var start_condition = new Object;
  start_condition.zoom = parseInt(zoom);
  start_condition.lat = parseFloat(lat);
  start_condition.lon = parseFloat(lon);
  var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['start_condition'] = start_condition;
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_zoom').text('Settati valori di zoom iniziale su ' + start_condition.lon + ', ' + start_condition.lat + ' con zoom ' + start_condition.zoom);
}
function reset_map_cookie() {
    //docCookies.removeItem('start_condition', '/');
    var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
    retake_cookie['start_condition'] = null;
    setCookie(webgis, JSON.stringify(retake_cookie), 30);
    $('#feedback_zoom').text('Settati valori di zoom di default per il servizio WebGIS "' + webgis + '"');
}
function take_map_coord() {
  var proj4326 = new Proj4js.Proj("epsg:4326"); //LatLon WGS84
  var proj3785 = new Proj4js.Proj("epsg:3785"); //UTM Google 900913

  //Carico il centro e il livello di zoom della vista attuale:
  var parent_w = window.parent;
  var zoom_view = parent_w.map.getZoom();
  var x_center = parseInt(parent_w.map.getCenter().lon);
  var y_center = parseInt(parent_w.map.getCenter().lat)
  //console.log(parseInt(parent_w.map.getCenter().lon));

  p_view = new Proj4js.Point(x_center, y_center);
  pp_view = Proj4js.transform(proj3785, proj4326, p_view);
  var lon_view = pp_view.x;
  var lat_view = pp_view.y;
  document.getElementById("lon_center").value = lon_view.toFixed(4);
  document.getElementById("lat_center").value = lat_view.toFixed(4);
  if (zoom_view>12) document.getElementById("zoom_center").value = 12;
  else if (zoom_view<6) document.getElementById("zoom_center").value = 6;
  else document.getElementById("zoom_center").value = zoom_view;
}

function init_map() {
  //Prelevo i valori attuali impostati nei cookies:
  if (cookie_string['start_condition'] && cookie_string['start_condition'] != 0) {
    var zoom_actual = cookie_string['start_condition']['zoom'];
    var lon_actual = cookie_string['start_condition']['lon'];
    var lat_actual = cookie_string['start_condition']['lat'];
    $('#zoom_actual').val(zoom_actual);
    $('#lon_actual').val(lon_actual);
    $('#lat_actual').val(lat_actual);
  }
}


/*************************
PARTE LAYERS
*************************/
function set_layers_cookie() {
  var layers_checked_arr = new Array();
  $('#layers_div input[type=checkbox]:checked').each(function() {
    layers_checked_arr.push(this.value);
  });
  var layers_checked = layers_checked_arr.join(',');
  //console.log(layers_checked);
  var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['layers'] = layers_checked;
//console.log(retake_cookie);
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_layers').text('Aggiornati i layers da visualizzare all\'apertura del servizio WebGIS "' + webgis + '"');
}

function reset_layers_cookie() {
  var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['layers'] = "";
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_layers').text('Settati layers di default per il servizio WebGIS "' + webgis + '"');
}

function set_baselayers_cookie() {
  var layers_checked_arr = new Array();
  $('#baselayers_div input[type=radio]:checked').each(function() {
    layers_checked_arr.push(this.value);
  });
  var layers_checked = layers_checked_arr.join(',');
  //console.log(layers_checked);
  var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['baselayers'] = layers_checked;
//console.log(retake_cookie);
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_layers').text('Aggiornati i baselayers da visualizzare all\'apertura del servizio WebGIS "' + webgis + '"');
}

function reset_baselayers_cookie() {
  var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['baselayers'] = "";
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_layers').text('Settati i baselayers di default per il servizio WebGIS "' + webgis + '"');
}

function init_baselayers() {
  //Recupero i layers dalla mappa:
  var parent_w = window.parent;
  var mLayers = parent_w.map.layers;
  var actual_baselayer = parent_w.map.baseLayer; //baselayer attualmente attivo
  var baseLayers_arr = new Array();
  //Recupero i vari baselayers caricati su mappa:
  for (var a=0; a<mLayers.length; a++ ) {
    if (mLayers[a].isBaseLayer) baseLayers_arr.push(mLayers[a].name);
  }
  //Provo ad ordinarli:
  baseLayers_arr.sort(function(a,b) { //non ordina proprio una minchia...
    return a.val > b.val;
  });
  //Recupero le info dai cookie:
  var custom_list_cookie = "";
  var custom_baselayers_cookie = "";
  if (cookie_string['baselayers']) var custom_list_cookie = cookie_string['baselayers'];
  if (custom_list_cookie != "") custom_baselayers_cookie = custom_list_cookie.split(",");

  var nw = "";
  for (var j=0; j<baseLayers_arr.length; j++ ) {
    //Creo un elenco di radiobutton con i nomi dei vari baselayers disponibili:
    baseLayers_name = baseLayers_arr[j];
    //Cerco se il layer compare nei cookie come layer da accendere:
    if ($.inArray(baseLayers_name, custom_baselayers_cookie) > -1) {
	nw += "<input type='radio' class='radioClass' name='base' checked='checked' value='" + baseLayers_name + "'>" + baseLayers_name + "<i> - baselayer da cookie</i><br>";
    }
    //Altrimenti cerco quale e' il layer base corrente:
    else if (baseLayers_name==actual_baselayer.name) {
	nw += "<input type='radio' class='radioClass' name='base' checked='checked' value='" + baseLayers_name + "'>" + baseLayers_name + "<i> - baselayer corrente</i><br>";
    }
    else nw += "<input type='radio' class='radioClass' name='base' value='" + baseLayers_name + "'>" + baseLayers_name + "<br>";
  }

  $("#baselayers_div").append(nw);
}

var header_accesi = new Array();
function init_layers() {
  var parent_w = window.parent;
  var mLayers = parent_w.map.layers;
  var mLayers_arr = new Array();
  var mCatgeories_arr = new Array();

  //Recupero le info dai cookie:
  //console.log(cookie_string['layers']);
  var custom_list_cookie = "";
  var custom_layers_cookie = "";
  if (cookie_string['layers']) var custom_list_cookie = cookie_string['layers'];
  if (custom_list_cookie != "") custom_layers_cookie = custom_list_cookie.split(",");

  //Recupero le categorie dei vari layer caricati su mappa:
  for (var a = 0; a < mLayers.length; a++ ) {
    mLayers_name_a = mLayers[a].name;
    if (mLayers_name_a.indexOf('<!--') >= 0) {
      mLayers_arr.push(mLayers[a].name);
      mCatgeories_arr.push(mLayers_name_a.substring(mLayers_name_a.lastIndexOf("<!--")+4, mLayers_name_a.lastIndexOf("-->")));
      }
    //console.log(mLayers[a].name);
  }
  var mCatgeories_unique_sort_pedice = distinctVal(mCatgeories_arr.sort());

  //Ordino queste categorie in modo alfabetico rispetto alla loro descrizione/label:
  var status = new Array();
  for (var jx=0; jx<mCatgeories_unique_sort_pedice.length; jx++ ) {
    var status_value = parent_w.groups_labels['<!--'+ mCatgeories_unique_sort_pedice[jx] +'-->'];
    status.push({name: mCatgeories_unique_sort_pedice[jx], val: status_value});
  }
  status.sort(function(a,b) { //non ordina proprio bene...
    return a.val > b.val;
  });
  mCatgeories_unique = []; //sorted_by_label
  for(var key in status) {
    mCatgeories_unique.push(status[key].name);
  }

  var nw = "";
  for (var j=0; j<mCatgeories_unique.length; j++ ) {
    //Prelevo le etichette associate ai gruppi di layer creati:
    var label_group = parent_w.groups_labels['<!--'+ mCatgeories_unique[j] +'-->'];
console.log(label_group);
    nw += "<h3 id='" + mCatgeories_unique[j] + "'>" + label_group + "</h3><div>";

    for (var i=0; i<mLayers_arr.length; i++ ) {
      mLayers_name = mLayers_arr[i];
      //Vedo in quale cartella/categoria sta il layer:
      if (mLayers_name.indexOf(mCatgeories_unique[j]) >= 0 ) {
	mLayers_name_clean = mLayers_name.substring(0, mLayers_name.lastIndexOf("<!--"));
        //Cerco se il layer compare nei cookie come layer da accendere:
        if ($.inArray(mLayers_name, custom_layers_cookie) > -1) {
	  nw += "<input type='checkbox' class='radioClass' checked='checked' name='options"+(i+1)+"' value='" + mLayers_name +"'/>" + mLayers_name_clean +"<br/>";
          //Salvo il nome dell'header che contiene dei layer selezxionati come accesi:
          header_accesi.push(mCatgeories_unique[j]);
        }
	else { //non compare allora non spunto il radiobox:
	   nw += "<input type='checkbox' class='radioClass' name='options"+(i+1)+"' value='" + mLayers_name +"'/>" + mLayers_name_clean +"<br/>";
	}
      }
    }
    nw += "</div>";
    //console.log(mCatgeories_unique[j]);
  }

  $("#layers_div").append(nw);

  //Funzione jQuery to expand/collapse content:
  $(function() {
    $( "#layers_div" ).accordion({
      collapsible: true
      ,active: false 
      //,autoHeight: true
      ,heightStyle: "content"
    });
  });

$(document).ready(function($){
  //Modifico il colore di sfondo delle categorie contenenti layer accesi dai cookies:
  if (header_accesi.length>0) {
    for (var jj=0; jj<header_accesi.length; jj++ ) {
      var attr_attuale = $('#'+header_accesi[jj]+'').css('background');
      //$('#'+header_accesi[jj]+'').removeAttr('style').css("background", attr_attuale);
      //$('#'+header_accesi[jj]+'').css('background-color', 'red');
      $('#'+header_accesi[jj]+'').css('background', 'url('+root_dir_html+'common/icons/bg_download_btn.png) 50% 50% repeat-x rgb(230, 230, 230)');
    }
  }
});

} //fine inizializzazione pagina per la sezione LAYERS


/*************************
PARTE WARNING
*************************/
function take_map_coord_warning() {
  var proj4326 = new Proj4js.Proj("epsg:4326"); //LatLon WGS84
  var proj3785 = new Proj4js.Proj("epsg:3785"); //UTM Google 900913

  //Carico le coordinate  della vista attuale:
  var parent_w = window.parent;
  var x_center = parseInt(parent_w.map.getCenter().lon);
  var y_center = parseInt(parent_w.map.getCenter().lat)
  //console.log(parseInt(parent_w.map.getCenter().lon));

  p_view = new Proj4js.Point(x_center, y_center);
  pp_view = Proj4js.transform(proj3785, proj4326, p_view);
  var lon_view = pp_view.x;
  var lat_view = pp_view.y;
  document.getElementById("warning_lon").value = lon_view.toFixed(3);
  document.getElementById("warning_lat").value = lat_view.toFixed(3);
}

function set_warning_history() {
//Prima di salvare il nuovo warning immagazzino l'ultimo:
  var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['warning_history'] = retake_cookie['warning'];
  return retake_cookie;
}
function set_warning_cookie() {
  //Prima controllo che i campi obbligatori siano stati compilati:
  if ($('#warning_nome').val().length === 0) {
	$("input#warning_nome").focus(); //Focus on field
	$('#warning_text').text('Impostare nome localita per poter continare!');
	$('#warning_text').css("color", "red");
	return false;
  }
  else if ( !$.isNumeric($("input#warning_lon").val()) ) {
        $("input#warning_lon").focus(); //Focus on field
        $('#warning_text').text('Impostare la longitudine corretta per poter continare!');
        $('#warning_text').css("color", "red");
        return false;
  }
  else if ( !$.isNumeric($("input#warning_lat").val()) ) {
	$("input#warning_lat").focus(); //Focus on field
        $('#warning_text').text('Impostare la latitudine per poter continare!');
        $('#warning_text').css("color", "red");
	return false;
  }
  else {
//Prima di salvare il nuovo warning lo immagazzino:
  var retake_cookie = set_warning_history();
  var warning_obj = new Object;
  warning_obj.nome = $('#warning_nome').val();
  warning_obj.lon = $('#warning_lon').val();
  warning_obj.lat = $('#warning_lat').val();
  warning_obj.radius = $('#warning_radius').val();
  warning_obj.si = $('#warning_si').val();
  //var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['warning'] = warning_obj;
//console.log(retake_cookie);
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_warning').text('Impostato warning su ' + warning_obj.nome + ', distanza ' + warning_obj.radius + ' km. Soglia di Severity Index (SI) di allerta >= ' + warning_obj.si + '. Per rendere attive le modifiche ricaricare la pagina.');
  $('#warning_text').text('OK!');
  $('#warning_text').css("color", "green");
  }
}

function reset_warning_cookie() {
//Ripristino sulla maschera il warning eventualmente attivo:
  if (cookie_string['warning'] && cookie_string['warning'] != 0) {
        //console.log(cookie_string['warning']);
        var active_area_nome = cookie_string['warning']['nome'];
        var active_area_lat = cookie_string['warning']['lat'];
        var active_area_lon = cookie_string['warning']['lon'];
        var active_area_radius = cookie_string['warning']['radius'];
        var active_area_si = cookie_string['warning']['si'];
        $('#warning_nome').val(active_area_nome);
        $('#warning_lat').val(active_area_lat);
        $('#warning_lon').val(active_area_lon);
        $('#warning_radius').val(active_area_radius);
        $('#warning_si').val(active_area_si);
  }
  else {
    $('#warning_text').text('');
    $('#warning_nome').val('');
    $('#warning_lon').val('');
    $('#warning_lat').val('');
  }
$('#feedback_warning').text('** Il sistema di allerta temporali e\' in fase sperimentale e i dati sono disponibili solo per il territorio della Regione Piemonte. L\'impostazione dell\'area di allerta si basa su cookies tecnici e resta valida solo sul computer attualmente in uso. **');
}

function deactivate_warning_cookie() {
//Prima di disattivare il warning attivo lo immagazzino:
  var retake_cookie = set_warning_history();
  //Disattivo il sistema di warning:
  //var retake_cookie = $.parseJSON(docCookies.getItem(webgis)); //riprendo il cookie perche' magari si e modificato nel frattempo
  retake_cookie['warning'] = 0;
//console.log(retake_cookie);
  setCookie(webgis, JSON.stringify(retake_cookie), 30);
  $('#feedback_warning').text('Disattivato il sistema di allerta temporali per il servizio webgis ' + webgis + '. Per rendere attive le modifiche ricaricare la pagina.');
}

function init_warning() {
//Carico se esistente il warning attivo:
  reset_warning_cookie();
}

</script>

<style>
/*Personalizzazione dei BUTTON*/
/*.button {
    font-family: 'Verdana,Arial,sans-serif';
    font-size: 1.1em;
    padding: 0.3em 0.3em;
    background-color: #b3bec4;
}*/
/*Alcune personalizzazioni per l'elenco dei layers*/
#layers_div .ui-accordion-header {
    font-size: 1em;
    margin: 0;
    padding-top: 0.3em;
    padding-bottom: 0.3em;
}
#layers_div .ui-accordion-content{
    font-size: 0.8em;
}
#layers_div .ui-accordion-content > * {
    margin: 0;
    padding: 20px;
}

</style>

</head>


<?php
//MAP
if ($code=='map') {

//echo $cookie_string;
//echo '<br/>';
//echo $webgis_type . '<br/>';

?>

<body onLoad="init_map();">

<p style='font-size:1.2em; text-align:center;'>Impostare la vista iniziale </p>
<div style='font-size:1em'>

<center>
<table style='text-align:center;'>
<thead>
  <tr>
<th colspan=2>Valori attuali</th>
<th colspan=2>Valori da impostare</th>
</tr>
</thead>
<tr><td>
<input size='9' type='text' id='zoom_actual' disabled> </input>
</td>
<td colspan=2> ZOOM </td>
<td>
<select id='zoom_center'>
  <option value="6">6 (piccolo)</option>
  <option value="7">7</option>
  <option value="8">8</option>
  <option value="9">9</option>
  <option value="10">10</option>
  <option value="11">11</option>
  <option value="12">12 (grande)</option>
</select>
</td></tr>

<tr><td>
<input size='9' type='text' id='lat_actual' disabled> </input>
<td colspan=2> LAT </td>
<td>
<input size='9' type='text' id='lat_center'> </input>
</td></tr>

<tr><td>
<input size='9' type='text' id='lon_actual' disabled> </input>
<td colspan=2> LON </td>
<td>
<input size='9' type='text' id='lon_center'> </input>
</td></tr>

<tr>
<td colspan=4 style='text-align: right;'><button type="button" onClick='take_map_coord();'> Preleva da vista corrente </button>
</td></tr>
</table>
</center>

</div>

</br>

<center>
<div id='feedback_zoom' style='font-style: italic;'>
</div>

<button class='button' type="button" onClick='set_starting_cookie();'>SALVA</button>
<!-- <button type="button" onClick='this.close();'>ANNULLA e CHIUDI</button> -->
<button class='button' type="button" onClick='reset_map_cookie();'>RIPRISTINA default</button>
</center>

<hr />

<?php
} //fine IF su MAP

//LAYERS
else if ($code=='layers') {

?>

<body id='layers' onLoad='init_layers();'>

<p style='font-size:1.2em; text-align:center;'>Impostare i layers da visualizzare all'apertura della mappa
<br/><i> (le categorie colorate contengono dei layer accesi)</i>
</p>


<div id='layers_div'>
</div>
<br />

<center>
<div id='feedback_layers' style='font-style: italic;'>
</div>

<button class='button' type="button" onClick='set_layers_cookie();'>SALVA</button>
<button class='button' type="button" onClick='reset_layers_cookie();'>RIPRISTINA default</button>
</center>


<?php
} //fine IF su LAYERS


//BASELAYERS
else if ($code=='baselayers') {
?>

<body id='baselayers' onLoad='init_baselayers();'>

<p style='font-size:1.2em; text-align:center;'>Impostare il layer di base da visualizzare all'apertura della mappa
<br/>
</p>


<div id='baselayers_div'>
</div>
<br />

<center>
<div id='feedback_layers' style='font-style: italic;'>
</div>

<button class='button' type="button" onClick='set_baselayers_cookie();'>SALVA</button>
<button class='button' type="button" onClick='reset_baselayers_cookie();'>RIPRISTINA default</button>
</center>

<?php
} //fine IF su BASELAYERS


//WARNING
else if ($code=='warning' && ($devel==1 || $devel==0) ) {

?>

<body id='warning' onLoad='init_warning();'>

<p style='font-size:1.2em; text-align:center;'>Definire la localita su cui impostare il sistema di allerta temporali da webgis.</p>
<p style='font-size:1.2em; text-align:center;' id='warning_text'><i>
La localita' attualmente impostata e':
</i></p>


<center>
<table style='text-align:center;'>

<tr><td colspan=2>
<input size='9' type='text' id='warning_nome' placeholder='nome localita'> </input> <i>localita</i>
</td></tr>

<tr><td>
<i>lon</i> <input size='9' type='text' id='warning_lon' placeholder='longitudine'> </input>
</td><td>
<input size='9' type='text' id='warning_lat' placeholder='latitudine'> </input> <i>lat</i>
</td></tr>

<tr><td colspan=2>
<button type="button" onClick='take_map_coord_warning();'> Preleva da vista corrente </button>
</td></tr>
<tr> <td> &nbsp; </td>  </tr>
<tr><td colspan=2>
<select id='warning_radius'>
  <option value="5">5 km</option>
  <option value="10">10 km</option>
  <option value="20">20 km</option>
  <option value="30">30 km</option>
  <option value="40">40 km</option>
  <option value="50">50 km</option>
  <option value="60">60 km</option>
  <option value="70">70 km</option>
  <option value="80">80 km</option>
</select>
Raggio
</td></tr>

<tr><td colspan=2>
<select id='warning_si'>
  <option value="1"> Tutti gli eventi (SSI>=1) </option>
  <option value="2"> Eventi deboli (SSI>=2) </option>
  <option value="3"> Eventi moderati (SSI>=3) </option>
  <option value="4"> Eventi intensi (SSI>=4) </option>
  <option value="5"> Solo eventi molto intensi (SSI>=5) </option>
</select>
Soglia SSI (Storm Severity Index)
</td></tr>

</table>
</center>
<br />

<center>
<div id='feedback_warning' style='font-style: italic;'>
</div>

<button class='button' type="button" onClick='set_warning_cookie();'>SALVA area allerta</button>
<button class='button' type="button" onClick='reset_warning_cookie();'>RIPRISTINA</button>
<button class='button' type="button" onClick='deactivate_warning_cookie();'>DISATTIVA allerta</button>
</center>


<?php
} //fine IF su WARNING


//WARING
else if ($code=='warning' && $devel==3) {
//ho messo un numero a caso nel caso si voglia disabilitarlo in produzione, porre questa condizione pari a 0
?>

<body>

...questo servizio e' ancora in fase di sviluppo...

<?php
} //fine IF su WARNING per occultare ancora il servizio mentre e' in sviluppo

?>

</body>
</html>

