<?php
/***************************************************************
* Name:        IRIS - Integrated Radar Information System
* Purpose:     WebGis System for Meteorological Monitoring
*
* Author:      Roberto Cremonini, Armando Gaeta, Rocco Pispico
* Email:       sistemi.previsionali@arpa.piemonte.it
*
* Created:     08/02/2018
* Licence:     EUPL 1.1 Arpa Piemonte 2018
***************************************************************/

/*CONFIGURAZIONE PER DISTRIBUZIONE PACCHETTO IRIS*/

/*
Provo a recuperare alcune personalizzazioni da DB, in particolare tutto  lo script "local_script" in cui indico i layer da caricare nel webgis, e le cartelle secondo le quali ordinari.
*/

date_default_timezone_set('UTC');

if (isset($_GET["TYPE"])) {$webgis_type = $_GET["TYPE"];}
else die();

//setto variabile per eventuali versioni di sviluppo ponendo devel=1
if (isset($_GET["devel"])) {$devel = $_GET["devel"];}
else $devel = 0;

//Carico le configurazioni di base da un file esterno:
include_once('config_iris.php');

//Tengo traccia degli accessi autenticati
$indicesServer = array('PHP_SELF', 
'argv', 
'argc', 
'GATEWAY_INTERFACE', 
'SERVER_ADDR', 
'SERVER_NAME', 
'SERVER_SOFTWARE', 
'SERVER_PROTOCOL', 
'REQUEST_METHOD', 
'REQUEST_TIME', 
'REQUEST_TIME_FLOAT', 
'QUERY_STRING', 
'DOCUMENT_ROOT', 
'HTTP_ACCEPT', 
'HTTP_ACCEPT_CHARSET', 
'HTTP_ACCEPT_ENCODING', 
'HTTP_ACCEPT_LANGUAGE', 
'HTTP_CONNECTION', 
'HTTP_HOST', 
'HTTP_REFERER', 
'HTTP_USER_AGENT', 
'HTTPS', 
'REMOTE_ADDR', 
'REMOTE_HOST', 
'REMOTE_PORT', 
'REMOTE_USER', 
'REDIRECT_REMOTE_USER', 
'SCRIPT_FILENAME', 
'SERVER_ADMIN', 
'SERVER_PORT', 
'SERVER_SIGNATURE', 
'PATH_TRANSLATED', 
'SCRIPT_NAME', 
'REQUEST_URI', 
'PHP_AUTH_DIGEST', 
'PHP_AUTH_USER', 
'PHP_AUTH_PW', 
'AUTH_TYPE', 
'PATH_INFO', 
'ORIG_PATH_INFO') ; 
//per vedere il contenuto delle varie informazioni estraibili dal server/client:
/*echo '<table cellpadding="10">' ; 
foreach ($indicesServer as $arg) { 
    if (isset($_SERVER[$arg])) { echo '<tr><td>'.$arg.'</td><td>' . $_SERVER[$arg] . '</td></tr>' ; } 
    else { echo '<tr><td>'.$arg.'</td><td>-</td></tr>'; } 
}
echo '</table>' ;*/
//Su DB salvo solo alcune informazioni di accesso:
$conn_httpd = pg_connect($conn_string_edit);
if (!$conn_httpd) { // Check if valid connection
  echo "Error Connecting to database " . pg_last_error();
  exit;
}
if (!isset($_SERVER['REMOTE_USER'])) {
  $query_httpd = "INSERT INTO config.httpd_access (username, webgis_type, remote_addr, php_self) VALUES ('anonym', '" . $webgis_type . "', '" . $_SERVER['REMOTE_ADDR'] . "', '" . $_SERVER['PHP_SELF'] . "');";
} else {
  $query_httpd = "INSERT INTO config.httpd_access (username, webgis_type, remote_addr, php_self) VALUES ('" . $_SERVER['REMOTE_USER'] . "', '" . $webgis_type . "', '" . $_SERVER['REMOTE_ADDR'] . "', '" . $_SERVER['PHP_SELF'] . "');";
}
$result_httpd = pg_query($query_httpd);
// free memory
pg_free_result($result_httpd);
pg_close($conn_httpd);


/*
 * PROVO A SETTARE DEI COOKIES!!!!
*/
$user_uid; //variabile globale dell'ID dell'utente
$time = time();
//Creo un COOKIE con un array JSON:
$cookie_info = array();
$start_condition='';
$news_message='';
//$start_map_arr = array('zoom' => 6, 'lat' => 12, 'lon' => 42);
//$cookie_string ['start_condition'] = $start_map_arr;
//$user_arr = array('uid' => $user_uid);
//setcookie ($webgis_type, json_encode($cookie_string), $time+(86400 * 30), "/");
//$cookie_message = json_encode($cookie_string);
if(isset($_COOKIE[$webgis_type])) {
    $cookie_info = json_decode($_COOKIE[$webgis_type], TRUE); //cookie come array
    $cookie_string = $_COOKIE[$webgis_type]; //cookie come stringa
    $visits = $cookie_info['user']['visits'];
    $cookie_info['user']['visits'] ++;

    //RECUPERO la personalizzazione sui LAYER da caricare di default:
    if (isset($cookie_info['layers'])) {
      $custom_list_cookie = $cookie_info['layers'];
    }
    else $custom_list_cookie = '';

    //RECUPERO la personalizzazione sui BASELAYER da caricare di default:
    if (isset($cookie_info['baselayers'])) {
      $custom_baselist_cookie = $cookie_info['baselayers'];
    }
    else $custom_baselist_cookie = '';

    setcookie ($webgis_type, json_encode($cookie_info), $time+(86400 * 30), "/");
    $cookie_message = "Welcome back " . $cookie_info['user']['uid'] . ", this is visit number: " . $visits; //messaggio per la console
    if (isset($cookie_info['start_condition'])) {
	$zoom = $cookie_info['start_condition']['zoom'];
	$lat = $cookie_info['start_condition']['lat'];
	$lon = $cookie_info['start_condition']['lon'];
	$start_condition = json_encode($cookie_info['start_condition']);
    }
    else { //definisco cmq vuote queste variabili in modo da non avere troppi errori nel log di http
	$zoom = '';
	$lat = '';
	$lon = '';
    }
    if (isset($cookie_info['news_message'])) {
	$news_message = str_replace("&", ",", $cookie_info['news_message']);
    }
    $alert_system = 0;
    if (isset($cookie_info['warning'])) {
      if ($cookie_info['warning'] && $cookie_info['warning'] != 0) {
	$alert_system = 1;
        $area_nome = $cookie_info['warning']['nome'];
	$area_lon = $cookie_info['warning']['lon'];
	$area_lat = $cookie_info['warning']['lat'];
	$area_radius = $cookie_info['warning']['radius'];
	$area_alert = $cookie_info['warning']['si'];
	$area_time = 15; //in minuti
      }
    }
} else {
    $user_uid = uniqid();
    $visits = 1;
    $user_arr = array('uid' => $user_uid, 'visits' => $visits);
    $cookie_info ['user'] = $user_arr;
    setcookie ($webgis_type, json_encode($cookie_info), $time+(86400 * 30), "/");
    $cookie_string = '{"user":{"uid":"'.$user_uid.'","visits":'.$visits.'}}'; //recupero anche in questo caso il cookie come stringa
    $cookie_message = "Your cookie has been set with ID " . $user_uid; //messaggio per la console
    $alert_system = 0;
}

/* *********** FINE COOKIE ************/

?>

<!DOCTYPE html>
<html>
<head>

<script>
var webgis = "<?php echo $webgis_type; ?>";
var root_dir_html = "<?php echo $root_dir_html; ?>";
var custom_list_cookie = "<?php echo $custom_list_cookie; ?>";
var custom_baselist_cookie = "<?php echo $custom_baselist_cookie; ?>";
//Recupero se la versione e' di sviluppo:
var devel = <?php echo $devel; ?>;
if (webgis == "") {webgis = "meteo";}
document.write("<title> IRIS " + webgis.toUpperCase() + " </title>");
document.write("<link rel='icon' href='"+root_dir_html+"/common/icons/" + webgis.toLowerCase() + ".png' type='image/png' />");

var map_path = "<?php echo $map_path; ?>"; //percorso dei file .map di mapserver
var url_tinyows = "<?php echo $url_tinyows; ?>"; //percorso eseguibile tinyows
var url_tinyows_sigeo = "<?php echo $url_tinyows_sigeo; ?>"; //percorso eseguibile tinyows
</script>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-32171991-7', 'auto');
  ga('send', 'pageview');

</script>

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="WebGIS">
<meta name="Description" content="Pagina dei WebGIS ARPA">

<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$extall_css = '<link rel="stylesheet" href="'.$root_dir_html.'/ext-3.4.0/resources/css/ext-all.css">';
echo $extall_css;

$geoext_css = '<link rel="stylesheet" href="'.$root_dir_html.'/GeoExt/resources/css/geoext-all.css">';
echo $geoext_css;

//Recupero alcuni fogli di stile con Minify:
//$open_css = '<link rel="stylesheet" type="text/css" href="../minify-2.1.7/min/?f=';
$open_css = '<link rel="stylesheet" type="text/css" href="../min/?f=';
//$open_css .= $root_dir_html_ext.'/ext-3.4.0/resources/css/ext-all.css,'; //LO TOLGO DAL MINIFY onde evitare problemi di proxy o versioni di sviluppo
//$open_css .= '/GeoExt/resources/css/geoext-all.css,'; //LO TOLGO DAL MINIFY onde evitare problemi di proxy o versioni di sviluppo
$open_css .= '/OpenLayers-2.13.1/theme/default/style.css,';
$open_css .= '/OpenLayers-2.13.1/theme/default/scalebar-thin.css,';
$open_css .= '/common/webgis_style.css';
$open_css .= '">';
echo $open_css;

//Apro alcuni script che potrebbero avere indirizzi diversi con un eventuale ReverseProxy:
$script_js = '<script type="text/javascript" src="'.$root_dir_html.'/ext-3.4.0/adapter/ext/ext-base.js"></script>';
//$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/ext-3.4.0/ext-all-debug-w-comments.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/ext-3.4.0/ext-all.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/OpenLayers-2.13.1/OpenLayers.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/GeoExt/script/GeoExt.js"></script>';
$script_js .= '<script src="https://maps.googleapis.com/maps/api/js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/proj4js-combined.js"></script>';
echo $script_js;
?>

<?php
//Recupero alcuni script con Minify:
$first_script = '<script type="text/javascript" src="../min/?f=';
$first_script .= '/OpenLayers-2.13.1/lib/OpenLayers/Control/LoadingPanel_2.js,';
$first_script .= '/OpenLayers-2.13.1/lib/OpenLayers/Control/TooltTips.js,';
$first_script .= '/GeoExt/olExtToolTips.js,';
//$first_script .= '/common/proj4js-combined.js,';
$first_script .= '/common/OpenStreetMap.js';
$first_script .= '"></script>';
echo $first_script;

//Apro alcuni script che potrebbero avere indirizzi diversi con un eventuale ReverseProxy:
$script_js_2nd = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.min.js"></script>';
$script_js_2nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
$script_js_2nd .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/docCookies.js"></script>';
$script_js_2nd .= '<script type="text/javascript" src="'.$root_dir_html.'/ol2_exportmap/ExportMap.js"></script>';
echo $script_js_2nd;

//SVILUPPO: carico alcune librerie per esportare delle tabelle costruite con DataTable, nel caso in particolare del multiselect:
$script_js_3nd = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery.dataTables.min.css">';
$script_js_3nd .= '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/buttons.dataTables.min.css">';
//$script_js_3nd .= '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/font-awesome.min.css">';
$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery.dataTables.min.js"></script>';
$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/dataTables.buttons.min.js"></script>';
$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/buttons.html5.min.js"></script>';
//jquery extendeddialog per aggiungere icone minimize maximize non funziona:
//$script_js_3nd .= '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/fq-ui.extendeddialog.css">';
//$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/fq-ui.extendeddialog.js"></script>';
//Per attivare classi Bootsdtrap e glyphicon - ma mancano i glyphicon e i riferimenti col ReverseProxy!
//$script_js_3nd .= '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/bootstrap.min.css">';
//$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/bootstrap.min.js"></script>';

//troppo pesanti, ma servono per abilitare l'export della tabella in pdf:
//$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jszip.min.js"></script>';
//$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/pdfmake.min.js"></script>';
//$script_js_3nd .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/vfs_fonts.js"></script>';
echo $script_js_3nd;

?>

<?php
//Carico l'html di base:
$preliminar_script = '<script type="text/javascript" src="../min/?f=';
$preliminar_script .= '/common/webgis_js_base.js,';
$preliminar_script .= $scripts_path . '/browser_detect.js,';
$preliminar_script .= $scripts_path . '/js_functions.js';
$preliminar_script .= '"></script>';
echo $preliminar_script;

$project_scripts = '<script type="text/javascript" src="../min/?f=';

//THEMES to LOAD --> $lista_js2load defined under common/config_iris.php

//adding other custom libraries:
array_push($lista_js2load, $scripts_path . "/credit_tab.js");
array_push($lista_js2load, $scripts_path . "/help_tab.js");

$project_scripts .= implode(",", $lista_js2load);

$project_scripts .= '">';
$project_scripts .= ' </script>';
echo $project_scripts;

//A questo punto carico le variabili personalizzate del DB sostituendo la chiamata al JS di progetto:
require('local_script_db.php');

//Carico i javascript della toolbar. Li carico dopo il local_script_db in modo tale da avere le cartelle dei cookie_settings per i layer definitie in maniera dinamica secondo il DB.
$project_scripts3 = '<script type="text/javascript" src="../min/?f=';
$lista_js3load = array();
array_push($lista_js3load, $scripts_path . "/toolbar_panels.js");
array_push($lista_js3load, $scripts_path . "/toolbar_tools.js");
$project_scripts3 .= implode(",", $lista_js3load);
$project_scripts3 .= '">';
$project_scripts3 .= ' </script>';
echo $project_scripts3;
$launch_toolbar = '<script type="text/javascript">toolbar_tools_default();  toolbar_tools_extension(); </script>';
echo $launch_toolbar;

//Visto che i parametri di zoom li voglio prelevare da DB, ma potrebbero venir modifcati dai cookie, devo caricarmi i cookie qui:
?>

<script>
//Riprendo i valori eventualmente definiti da DB in modo tale da trasormarli sfruttando la libreria projs che magari non voglio caricarmi anche da local_script_db.php o che da esso non viene riconosciuta:
p1 = new Proj4js.Point(Math.round(lon_center*1000)/1000, Math.round(lat_center*1000)/1000);
pp1 = Proj4js.transform(proj4326, proj3785, p1);
var x_center = pp1.x;
var y_center = pp1.y;
//poi passo a recuperare eventuali cookie:

//SEZIONE COOKIE:
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    //document.cookie = cname + "=" + cvalue + "; " + expires + "; '/'";
    docCookies.setItem(cname, cvalue, 2592e3, '/'); // this cookie will expire in one MONTH (30 days)
}
var cookie_message = '<?php echo $cookie_message; ?>'; //eventuale messaggio di controllo da far passare in console
console.log(cookie_message);
var cookie_string = '<?php echo $cookie_string; ?>'; //intero contenuto del cookie come stringa
var start_condition  = '<?php echo $start_condition; ?>';
if (!start_condition || 0 === start_condition.length) console.log('startcondition NON esiste');
else if (start_condition && start_condition.length > 0) {
  console.log('startcondition esiste');
  var zoom_center = '<?php echo $zoom; ?>';
  var lat_center = '<?php echo $lat; ?>';
  var lon_center = '<?php echo $lon; ?>';
  p1 = new Proj4js.Point(Math.round(lon_center*1000)/1000, Math.round(lat_center*1000)/1000);
  pp1 = Proj4js.transform(proj4326, proj3785, p1);
  var x_center = pp1.x;
  var y_center = pp1.y;
}
else console.log('startcondition NON ben codificata');
</script>


<?php

//Carico i JS restanti:
$project_scripts3 = '<script type="text/javascript" src="../min/?f=';
$lista_js3load = array();
//JS PRINCIPALE:
array_push($lista_js3load, $scripts_path . "/geoext_general_produzione.js");
//JS POPUP di PROGETTO:
array_push($lista_js3load, $local_path . "popup.js");
$project_scripts3 .= implode(",", $lista_js3load);
$project_scripts3 .= '">';
$project_scripts3 .= ' </script>';
echo $project_scripts3;

//echo '<script> console.log("' . implode(",", $lista_js2load) . '"); </script>';

?>

<script>
//Riporto alcune variabili da PHP a JS:
var themes_path = "<?php echo $themes_path; ?>";//percorso dei tematismi
var scripts_path = "<?php echo $scripts_path; ?>";//percorso di altri script js

//Alcune variabili nel CSS devo passarle da qui per considerare eventuali ReverseProxy:
document.write('<style> .olControlLoadingPanelold {background-image:url('+ root_dir_html +'/common/icons/loading.gif);}</style>');
document.write('<style> .olControlLoadingPanel {background-image:url('+ root_dir_html +'/common/icons/loading_ext.gif);}</style>');
</script>

<style>
<?php
//if ($webgis_type == 'expo2015') {
if (strpos($webgis_type, 'expo2015') !== false) {
	echo ".x-panel-header, .x-toolbar, .x-toolbar-layout-ct {  background-image: url('".$root_dir_html."/expo2015/bg4.jpg'), url('".$root_dir_html."/ext-3.4.0/resources/images/default/toolbar/bg.gif');  background-color: #ce3474; }";
	echo ".x-layout-collapsed, .x-layout-collapsed-east { background-color: #e79aba; }";
}
if (strpos($webgis_type, 'thefloatingpiers') !== false) {
        echo ".x-panel-header, .x-toolbar, .x-toolbar-layout-ct {  background-image: url('".$root_dir_html."/thefloatingpiers/bg_floatingpiers-gimp1.png'), url('".$root_dir_html."/ext-3.4.0/resources/images/default/toolbar/bg.gif');  background-color: #be7932; }";
        echo ".x-layout-collapsed, .x-layout-collapsed-east { background-color: #e6bb15; }";
}
?>

/*Setto trasparenza leggera per le finestre di jQuery-solo che lo fa per tutte e non si puo' fare qui leggera!*/
/*.ui-widget-content {
  background: transparent;
}
.ui-widget-header {
  border: none;
  background: transparent;
  background-color:rgba(205,205,205,0.3);
}*/
.ui-dialog-list{
    background-color: rgba(255, 255, 255, 0.8);
}
.raster_data {
    background: rgba(230, 230, 230, 0.8);
    font-weight: bold;
    font-size: 12px;
    font-style: italic;
}

/*stile per le immagini della toolbar invece di ridimensionarle*/
.toolbar_icon {
    background-size: contain;
    /*width:24px!important;
    height:24px!important;
    background-image: url(../images/calendar80.png) !important;
    margin-right: auto !important;
    margin-left: auto !important;*/
}

/*stili per i pulsanti multiselect */
.ui-widget{font-size:1em;}
a.copybtn {
    width: 25px;
    height: 25px;
    background-image: url("../common/icons/copy2clipboard.png") !important ;
    background-position: center;
    background-repeat: no-repeat;
    border: 0px;
}
a.csvbtn {
    width: 25px;
    height: 25px;
    background-image: url("../common/icons/csv_export.png") !important ;
    background-position: center;
    background-repeat: no-repeat;
    border: 0px;
}
a.pdfbtn {
    width: 25px;
    height: 25px;
    background-image: url("../common/icons/pdf_export.png") !important ;
    background-position: center;
    background-repeat: no-repeat;
    border: 0px;
}
</style>

<?php
/*
 * SISTEMA DI ALLERTA METEO-STORM - DA DATABASE!!!
*/
/*
 * Sistema al momento sostituito dall'allerta trmaite cookies tecnici
*/
?>

<script type="text/javascript">
var alert_system = <?php echo $alert_system; ?>;
<?php
if ($alert_system==1) {
?>
  var area_nome = '<?php echo $area_nome; ?>';
  var area_lon = <?php echo $area_lon; ?>;
  var area_lat = <?php echo $area_lat; ?>;
  var area_radius = <?php echo $area_radius; ?>;
  var area_alert = <?php echo $area_alert; ?>;
  var area_time = <?php echo $area_time; ?>;
<?php
}
else if ($devel==1) {
?>
  var area_nome = 'AREA TEST';
  var area_lon = 7.7;
  var area_lat = 45;
  var area_radius = 30;
  var area_alert = 2;
  var area_time = 20;
<?php
}
?>
</script>

<?php
//Carico le varie funzione per attivare l'allerta STORM-METEO:
$alert_js = '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/alertSystem.js"></script>';
echo $alert_js;

$multiselection = '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/multiSelect.js"></script>';
echo $multiselection;
?>


<script type="text/javascript">
/*
 * ANIMAZIONE raster radar con FLANIS
*/
$(function () {
    $( "#flanis_animation" ).dialog({
      modal: false,
      width: 420,
      maxHeight: 500,
      autoOpen: false,
      dialogClass: 'ui-dialog-list', //per personalzizare tramite css la finestra
      draggable: true,
      resizable: false,
      position: ['left', 'center-20%'],
      show: { effect: "fade", duration: 1500 },
      hide: 'blind',
      close: function( event, ui ) { closed_from_user=1;}
    });
});
function flanis_animation() {
    var url_flanis = root_dir_html+"/flanis/flanis_small.php?root_dir_html="+root_dir_html;
    $("#flanis_animation").load(url_flanis);
    //Provo a nascondere la titlebar:ma come si chiude e come si sposta???
    //$( "#flanis_animation" ).dialog().siblings('.ui-dialog-titlebar').remove();
    //Provo a rendere "draggable" tutta la finestra: ma come cliccare dentro il suo contenuto??
    //$("#flanis_animation").dialog({draggable: false}).parent().draggable();
    if ( $("#flanis_animation").dialog("isOpen")) $("#flanis_animation").dialog('close');
    else $("#flanis_animation").dialog('open');
}
if (devel==1) {
    //setTimeout("flanis_animation();", 7000);
}
</script>


<?php
/*
 * MESSAGGI DI NOVITA SU WEBGIS
*/
$news_active = 0; //stato di default che si modifica leggendo i cookie e il DB insieme
//Recupero dati per eventuale finestra di allerta meteo:
$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
	$error_message = "Error Connecting to database";
        die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
        //echo "Error Connecting to database <br>";
        //exit;
}
else {
    //Faccio una prima query per recuperare l'indice del webgis:
    if ($news_message) $query_news = "SELECT messaggio, icona_iniziale, gid FROM config.news_message a LEFT JOIN config.webgis_indici b ON b.webgis_idx=ANY(a.webgis_idx) WHERE (a.webgis_idx IS NULL OR '$webgis_type'=b.webgis_name) AND (data_scadenza IS NULL OR data_scadenza >= current_date) AND gid NOT IN ($news_message) ORDER BY gid;";
    else $query_news = "SELECT messaggio, icona_iniziale, gid FROM config.news_message a LEFT JOIN config.webgis_indici b ON b.webgis_idx=ANY(a.webgis_idx) WHERE (a.webgis_idx IS NULL OR '$webgis_type'=b.webgis_name) AND (data_scadenza IS NULL OR data_scadenza >= current_date) ORDER BY gid;";
    $result_news = pg_query($conn,$query_news);
    if (!$result_news) {
        //echo "console.log('Error on the query news <br>".$query_news."')";
        //exit;
    }
    else {
    //Attenzione che entra nell'else anche se il risultato della query e' vuoto!!
	$gids_list=''; //listo i gid delle news per poi salvarli eventualmente nel cookie
        $news_text = '<p><ul>';
        while($news = pg_fetch_array($result_news)) {
	    $gids_list .= $news['gid'] . '&';
	    //Costruisco il messaggio della news:
            $news_text .= '<li>';
            $icona = $root_dir_html . '/'  . $news['icona_iniziale'];
            $news_text .= "<img src='" . $icona . "' height='24'>";
            $news_text .= "&nbsp;";
	    $messaggio = $news['messaggio'];
	    $news_text .= $messaggio;
            $news_text .= "</li>";
	    //Supponendo che se entra nel ciclo allora il mio contenuto non e' vuoto, abilito la visualizzazione del messaggio:
            $news_active = 1;
	}
	$gids_list = rtrim($gids_list, "&"); //elimino l'ultimo '&'
        $news_text .= '</ul></p>';
	$news_text .= "<br/><p style='font-style: italic;font-size: 0.875em;'><br/><input type='checkbox' id='stop_news' value='1'> Ho capito non ricordarmelo di nuovo <br/></p>";
    }
}
pg_close($conn);
?>
<script>
var news_active = <?php echo $news_active; ?>;
var gids_list = '<?php echo $gids_list; ?>';
var cookie_JSON = $.parseJSON(cookie_string); //dovrebbe essere in formato JSON
$(function () {
    $( "#news-message" ).dialog({
      modal: false,
      width: 420,
      maxHeight: 500,
      autoOpen: false,
      dialogClass: 'ui-dialog-list', //per personalzizare tramite css la finestra
      draggable: true,
      resizable: false,
      position: ['center', 'center-20%'],
      show: { effect: "fold", duration: 1500 },
      hide: 'explode',
      close: function( event, ui ) {
	/*funzione nel caso di chiusura della finestra*/
	var stop_news = $("#stop_news").is(':checked') ? 1 : 0;
    //console.log(stop_news);
	if (stop_news == 1) {
	    if (cookie_JSON['news_message']) var news_message = cookie_JSON['news_message'] + '&' + gids_list;
	    else var news_message = gids_list;
    console.log(news_message);
	    cookie_JSON['news_message'] = news_message;
	    setCookie(webgis, JSON.stringify(cookie_JSON), 30);
	    news_active = 0; //rimetto questa variabile a 0 in modo da non rimostrare piu' questa novita
	}
	$("#news_ext_btn :input").prop("disabled", false); //riabilito il pulsante sulla barra
	$("#news_ext_btn :input").css("background-image", "url("+root_dir_html+"/common/icons/toolbar_icons/news.png)");
      }
    });
});
function news_message() {
    var news_text = "<?php echo $news_text; ?>";
    if (news_active == 0) news_text = "Al momento non ci sono novita', ci dispiace  :(";
    $("#news-message").html(news_text);
    //Provo a nascondere la titlebar:ma come si chiude e come si sposta???
    //$( "#flanis_animation" ).dialog().siblings('.ui-dialog-titlebar').remove();
    //Provo a rendere "draggable" tutta la finestra: ma come cliccare dentro il suo contenuto??
    //$("#flanis_animation").dialog({draggable: false}).parent().draggable();
    if ( $("#news-message").dialog("isOpen")) $("#news-message").dialog('close');
    else {
	$("#news-message").dialog('open'); //apro la finestra modale
	$("#news_ext_btn :input").prop("disabled", true); //disabilito il pulsante sulla barra
	$("#news_ext_btn :input").css("background-image", "url("+root_dir_html+"/common/icons/toolbar_icons/news_disabled.png)");
    }
}
if (news_active == 1) {
    setTimeout("news_message();", 2000);
}


/////////////////////////////// PROVA EXPORT MAPPA ////////////////////////////////
/*
//Troppo delirio troppi cambiamenti, dovrei aggiungere ad ogni layer FORSE la opzione "renderers" e "useCanvas" insomma un delirio lascio perdere in attesa di un tool piu' diretto
//Link: http://dev.openlayers.org/sandbox/camptocamp/canvas/openlayers/examples/exportMapCanvas.html
$(function () {
    $( "#export_map" ).dialog({
      modal: false,
      width: 420,
      maxHeight: 500,
      autoOpen: false,
      dialogClass: 'ui-dialog-list', //per personalzizare tramite css la finestra
      draggable: true,
      resizable: false,
      position: ['center', 'center-20%'],
      show: { effect: "fold", duration: 1500 },
      hide: 'explode',
      close: function( event, ui ) {
        //funzione nel caso di chiusura della finestra
      }
    });
});

function exportMap() {
   var canvas = OpenLayers.Util.getElement("exportedImage");
   exportMapControl.trigger(canvas);   
   $("#export_map").dialog('open'); //apro la finestra modale
   // set download url (toDataURL() requires the use of a proxy)
   //OpenLayers.Util.getElement("downloadLink").href = canvas.toDataURL();
}
*/
///////////////////////////////////////////////////////////////


/*
 * CARICAMENTO LAYERS SCELTI DA COOKIE
*/
console.log(custom_list_cookie);
//var mLayers = mapPanel.map.layers;
//console.log(mLayers[22]);
custom_layers_cookie = custom_list_cookie.split(",");
for (var a=0; a<custom_layers_cookie.length; a++ ) {
  for (var i=0; i<layers_to_load.length; i++ ) {
      if (layers_to_load[i].name == custom_layers_cookie[a]) {
        layers_to_load[i].setVisibility(true);
      }
    }
}
/*
 * CARICAMENTO LAYERS BASE SCELTI DA COOKIE
*/
//Inserisco come default un layer di base specificato nei cookie:
function getIndexByName(arr, name) {
    for(var i = 0; i < arr.length; i++) {
        if (arr[i].name == name) {
            return i;
        }
    }
}
custom_baselayers_cookie = custom_baselist_cookie.split(","); //in teoria dovrebbe essercene solo uno, e difatto prenderei il primo
var pos = getIndexByName(baselayer_to_load, custom_baselayers_cookie[0]);
baselayer_to_load.splice(0, 0, baselayer_to_load[pos++]) // Insert Sarah at `arr` first position
baselayer_to_load.splice(pos, 1); // Remove old Sarah
/**************/

</script>

</head>
<body>

<div id="mainpanel">
<div id="<?php echo $id_logo_div; ?>" class="logo_div">
<?php
echo '<a href="' . $urllogo . '" target="_blank" title="' . $titlelogo . '"><img style="background: rgba(230, 230, 230, 0.8);" height="60" src="' . $nomelogo . '" /></a>';
?>
<p id='localtime' title="Server TIME" style='background: rgba(230, 230, 230, 0.8);'></p>
</div>
</div>

<script>
<?php
//Get datetime of server:
//date_default_timezone_set('UTC');
$timezone = date_default_timezone_get();
//$datetime = date('d/m/Y H:i:s T', time());
?>

var datetime = new Date(<?php echo time() * 1000; ?>);
var nowMS = datetime.getTime();
var refreshIntervalId;
function timedMsg()
{
    refreshIntervalId=setInterval("servertime();", 1000);
}
function servertime() {
    nowMS += 1100; //aggiungo 100ms in piu' perche' ritarda!! MA E' UNA PEZZA TROVARE UN MODO PIU' PULITO!
    now.setTime(nowMS);
    document.getElementById('localtime').innerHTML = now.todayUTC() + " " + now.timeNowUTC() + " UTC";
    //document.getElementById('localtime').innerHTML = now.toTimeString();
}
//timedMsg();
window.onload = timedMsg();
//Ogni 15 minuti devo sincronizzare il clock altrimenti il javascript ritarda: come fare???

//Proviamo anche a passare un indirizzo da ricercare subito in mappa?
function goto_address() {
  if (address!="") {
    //Provo allora a richiamare la funzione propria da toolbar_tools
    doBasicClick(address);
  }
}
window.onload = goto_address();

</script>

<!-- Finestra popup modale usando JQuery invece della Alert per warning storm -->
<div id="dialog-message" title="AVVISO  (versione BETA)" style="background-color:rgba(255,255,255,0.8);">
  <p>
    <span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>
    Some warning information.
  </p>
  <p>
    Some <b>other information</b>.
  </p>
</div>

<?php
//if ($devel==1) {
?>
<!-- Finestra popup modale usando JQuery per informare su eventuali NOVITA' del WebGIS -->
<div id="news-message" title="NOVITA IRIS" style="background-color:rgba(255,255,255,0.8);">
  <p>
    <span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>
    Some news information.
  </p>
  <p>
    Some <b>other information</b>.
  </p>
</div>
<?php
//}
?>

<?php
if ($devel==1) {
?>
<!-- Finestra popup modale usando JQuery per provare export della MAPPA come png o pdf -->
<div id="export_map" title="Mappa esportata" style="background-color:rgba(255,255,255,0.8);">
  <p>
    <span class="ui-icon ui-icon-circle-check" style="float:left; margin:0 7px 50px 0;"></span>
    Prova export della mappa con metodo Canvas
  </p>
	<canvas id="exportedImage" class="smallmap"></canvas> <br />
  <p>
    Some <b>other information</b>.
  </p>
</div>
<?php
}
?>


<?php
//if ($devel==1) {
?>
<!-- Finestra popup NON-modale usando JQuery per animazione RADAR con FLANIS per EXPO -->
<div id="flanis_animation" title="Animazione radar Lema-Milano" style="background-color:rgba(205,205,205,0.5);">
<div style="margin-left: 1px;">
   <p>
    <span class="ui-state-default"><span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 0 0;"></span></span>
    Some radar-flanis information.
  </p>
</div>
</div>
<!-- Finestra popup NON-modale usando JQuery per elenco storm tipo ANSA -->
<div id="ansa-message" title="Temporali" style="background-color:rgba(205,205,205,0.5);">
<div style="margin-left: 1px;">
   <p>
    <span class="ui-state-default"><span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 0 0;"></span></span>
    Some storm information.
  </p>
</div>
</div>
<!-- Finestra popup NON-modale usando JQuery per tabella multiselect -->
<div id="multiselect_table" title="Risultato selezione multipla" style="background-color:rgba(205,205,205,0.5);">
<div style="margin-left: 1px;">
   <p>
    <span class="ui-state-default"><span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 0 0;"></span></span>
    Some multi-selection information.
  </p>
</div>
</div>
<?php
//}
?>

</body>
</html>

