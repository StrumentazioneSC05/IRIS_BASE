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
Testiamo una finestra per gestire le animazioni di alcuni layer sulla mappa.
I layer e relative informazioni sull'animazione verranno prelevati da una tabella
compilata appositamente su DB PostgreSQL.
*/

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

if (isset($_GET['webgis'])) $webgis = $_GET['webgis'];
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
$data_table = array();
$layers_list = array();

$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
    //Faccio una prima query per recuperare l'indice del webgis:
    $query_indice = "SELECT webgis_idx,default_raster FROM config.webgis_indici WHERE webgis_name = '$webgis'";
    $result_indice = pg_query($conn,$query_indice);
    if (!$result_indice) {
        echo "Error on the query indice<br>";
	exit;
    }
    else {
        //$indice_webgis = pg_fetch_result($result_indice, 0); //prendo il primo record
	$fetch_webgis = pg_fetch_array($result_indice, 0); //prendo il primo record
	$indice_webgis = $fetch_webgis['webgis_idx'];
	$default_raster = $fetch_webgis['default_raster'];
    }
    if (!isset($indice_webgis)) {
        echo "Tipologia webgis non riconosciuta <br/> Operazione non permessa";
        exit;
    }
    else {
        //Adesso a seconda del tipo di webgis mi carico quei layer abilitati all'animazione:
        //$query_layers = "SELECT gid FROM config.animazione_webgis WHERE webgis_idx LIKE '%$indice_webgis%'";
	$query_layers = "SELECT gid FROM config.animazione_webgis WHERE webgis_idx_arr @> array[$indice_webgis]";
        $result_layers = pg_query($conn,$query_layers);
        if (!$result_layers) {
            echo "Error on the query layers<br>";
	    exit;
        }
        else {
            $gid_layers = array();
            while($gid = pg_fetch_array($result_layers)) { //prendo i gid dei layers che posso animare
		$gid_layers[] = $gid['gid'];
	    }
	    $list_gid = implode(",",$gid_layers);
        }
    }

        // Valid connection, we can go on to retrieve some data
	$query = "SELECT label, nome_file, tipo_dato, formato_data, campo_data, gid, note, delta_min, delta_max, delta_udm, path, data_index, bounds3857, size, delta_inizio, delta_passo, frame_offset FROM config.animazione_webgis WHERE attivo=1 AND gid IN ($list_gid) ORDER BY label ASC;";
	$result = pg_query($conn,$query);
        if (!$result) {
                echo "Errore nell'elaborazione oppure <br/> servizio non abilitato all'animazione";
		//echo $query;
		echo "<script>console.log('$query')</script>";
		exit;
        }
        else {
                $numrows = pg_numrows($result);
				
		//Recupero tutti i dati in un array da passare poi per costruire il grafico:
                while($row = pg_fetch_array($result)) {
                        $layers_list[] = array($row['gid'], $row['label']);
			$data_table[] = $row['gid'];
			$data_table[$row['gid']] = array(
				'label'=>$row['label'],
				'nome_file'=>$row['nome_file'],
				'tipo_dato'=>$row['tipo_dato'],
				'formato_data'=>$row['formato_data'],
				'campo_data'=>$row['campo_data'],
				'delta_min'=>$row['delta_min'],
				'delta_max'=>$row['delta_max'],
				'delta_udm'=>$row['delta_udm'],
				'path'=>$row['path'],
				'data_index'=>$row['data_index'],
				'bounds3857'=>$row['bounds3857'],
				'size'=>$row['size'],
				'delta_inizio'=>$row['delta_inizio'],
				'delta_passo'=>$row['delta_passo'],
				'frame_offset'=>$row['frame_offset']
			);
                }
                //Alcune caratteristiche comuni - SOGLIE:
                $bacino = pg_fetch_array($result, 0); //prendo il primo record
                //$comune = $bacino['comune'];
		} //fine query
} // Connection
pg_close($conn);

?>


<html>
<head>
<title> Pannello animazione layer </title>

<script>
var webgis = "<?php echo $webgis_type; ?>";
var root_dir_html = "<?php echo $root_dir_html; ?>";
</script>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/OpenLayers-2.13.1/OpenLayers.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/proj4js-combined.js"></script>';
echo $script_js1st;
?>

<script>
//Definendo queste proiezioni qui evita questo primo fallito-tentativo.
//In realta pare che legga le definizioni sotto common/defs...ma potrebbe essere un problema relativo alla cache del browser...
Proj4js.defs["epsg:23032"] = "+proj=utm +zone=32 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs"; //da QGis
Proj4js.defs["epsg:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
Proj4js.defs["epsg:3785"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["epsg:900913"]= "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
//Proj4js.defs["epsg:3857"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["epsg:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"; //da QGis

//creating source and destination Proj4js objects
var proj4326 = new Proj4js.Proj("epsg:4326"); //LatLon WGS84
var proj3785 = new Proj4js.Proj("epsg:3785"); //UTM Google 900913

var OL_4326 = new OpenLayers.Projection("epsg:4326");
var OL_900913 = new OpenLayers.Projection("epsg:900913");
var OL_23032 = new OpenLayers.Projection("epsg:23032");
var OL_32632 = new OpenLayers.Projection("epsg:32632");
var OL_3857 = new OpenLayers.Projection("epsg:3857");
var OL_3785 = OL_3857;
</script>

<?php
$script_js = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.min.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
$script_js .= '<script src="https://maps.googleapis.com/maps/api/js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/js_functions.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/tematismi/base_layers.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/tematismi/theme_rasters.js"></script>';
echo $script_js;
?>

<script>

//Reinizializzo alcune variabile perse dagli script precedenti:
var now = new Date();
var currentTimeUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
var last3h = new Date(currentTimeUTC.getTime() - 10800000); //recupero 3 ore fa
var last15min = new Date(currentTimeUTC.getTime()); //recupero l'ultimo disponibile
//Variabili per costruire il filtro filterStrategyStorm:
var last3h_string = get_dateString(last3h); //recupero il primo ellipse di 3 ore fa
var lastStorm_string = get_dateString(last15min); //recupero l'ultimo ellipse disponibile

var interval = 1.125; //numero di secondi tra unanimazionwe e laltra..ma dove viene definito normalmente?
var parent_w = window.parent;
//var test = parent_w.document.getElementById('ore');

//Proviamo ad importare su javascript il mega array creato in php con tutti i dati sui layer animabili:
var data_table = <?php echo json_encode($data_table); ?>;

/* SEZIONE FUNZIONI DI ANIMAZIONE */
// Associo adesso lanimazione di ELLIPSE_3h e dei fulmini:
//In queste funzioni in base ai checkbox attivati accoppio all'animazione raster un layer vettoriale:
function attiva_fulmini(checkbox_value, d) {
  nome_check = checkbox_value.value;
  if ( $('#'+nome_check).is(':checked') ) {
    //parent_w.map.addLayer(parent_w.ellipse_24h);
    //parent_w.map.setLayerIndex(parent_w.ellipse_24h, 1);
    //parent_w.ellipse_24h.setVisibility(true);
    parent_w.map.addLayer(parent_w.fulmini24h);
    parent_w.map.setLayerIndex(parent_w.fulmini24h, 2);
    //Filtro gia' i dati per non impiantare il sistema:
    var lowerMinus = new Date(d.getTime() - 60000); //tolgo un minuto per il filtro
    var lowerStorm = get_dateString(lowerMinus);
    var upperPlus = new Date(d.getTime() + 60000); //aggiungo un minuto altrimenti il filtro escluderebbe tutto
    var upperStorm = get_dateString(upperPlus);
    parent_w.filterFulmini24.lowerBoundary = lowerStorm;
    parent_w.filterFulmini24.upperBoundary = upperStorm;
    parent_w.filterStrategyFulmini24.setFilter(parent_w.filterFulmini24);
    //infine accendo il layer:
    parent_w.fulmini24h.setVisibility(true);
    // Associo adesso l'animazione di ELLIPSE_3h e dei fulmini e aggiorno la data corrente:
    //anime_storm(d);
  }
  else parent_w.fulmini24h.setVisibility(false);
}
function attiva_temporali(checkbox_value, d) {
  nome_check = checkbox_value.value;
console.log(nome_check);
  if ( $('#'+nome_check).is(':checked') ) {
    parent_w.map.addLayer(parent_w.ellipse_24h);
    parent_w.map.setLayerIndex(parent_w.ellipse_24h, 1);
    //Filtro gia' i dati per non impiantare il sistema:
    var lowerMinus = new Date(d.getTime() - 60000); //tolgo un minuto per il filtro
    var lowerStorm = get_dateString(lowerMinus);
    var upperPlus = new Date(d.getTime() + 60000); //aggiungo un minuto altrimenti il filtro escluderebbe tutto
    var upperStorm = get_dateString(upperPlus);
console.log(lowerStorm + ' - ' + upperStorm); //201608101234 - 201608101236
    parent_w.filterStorm24.lowerBoundary = lowerStorm;
    parent_w.filterStorm24.upperBoundary = upperStorm;
    parent_w.filterStrategyStorm24.setFilter(parent_w.filterStorm24);
    //infine accendo il layer:
    parent_w.ellipse_24h.setVisibility(true);
console.log("visibilita ellipse: "+parent_w.ellipse_24h.getVisibility());
    //anime_storm(d);
  }
  else parent_w.ellipse_24h.setVisibility(false);
}
var geop_checked=false;
function attiva_geop(checkbox_value, d) {
  nome_check = checkbox_value.value;
  if ( $('#'+nome_check).is(':checked') ) {
    parent_w.map.addLayer(parent_w.hg700);
    //Filtro gia' i dati per non impiantare il sistema:
    var dataoraEsatta = new Date(d.getTime()); //prendo la data esatta
    var valueGeop = get_dateString(dataoraEsatta).substring(0,10);
    parent_w.filterGeop.value = valueGeop;
    parent_w.filterStrategyGeop.setFilter(parent_w.filterGeop);
    //infine accendo il layer:
    parent_w.hg700.setVisibility(true);
    geop_checked=true;
  }
  else {
	parent_w.hg700.setVisibility(false);
	geop_checked=false;
  }
}
function anime_storm(d) {
    //Disattivo la animazione dei temporali e fulmini nel caso di animazione dei modelli:
    if (raster_label.indexOf("COSMO")>=0) {
	var dataoraEsatta = new Date(d.getTime()); //prendo la data esatta
	var valueGeop = get_dateString(dataoraEsatta).substring(0,10);
	//Attivo il geopotenziale se e' spuntato:
	if ( geop_checked==true ) {
          parent_w.filterGeop.value = valueGeop;
          parent_w.filterStrategyGeop.setFilter(parent_w.filterGeop);
        }
        else console.log("chupa");
	return false;
    }
    var lowerMinus = new Date(d.getTime() - 60000); //tolgo un minuto per il filtro
    var lowerStorm = get_dateString(lowerMinus);
    var upperPlus = new Date(d.getTime() + 60000); //aggiungo un minuto altrimenti il filtro escluderebbe tutto
    var upperStorm = get_dateString(upperPlus);

    if (webgis != 'rischioindustriale') {
        parent_w.filterStorm24.lowerBoundary = lowerStorm;
        parent_w.filterStorm24.upperBoundary = upperStorm;
        parent_w.filterStrategyStorm24.setFilter(parent_w.filterStorm24);
        parent_w.filterFulmini24.lowerBoundary = lowerStorm;
        parent_w.filterFulmini24.upperBoundary = upperStorm;
        parent_w.filterStrategyFulmini24.setFilter(parent_w.filterFulmini24);
	//parent_w.ellipse_24h.refresh({ force: true });
        //parent_w.ellipse_24h.redraw(true);
//console.log("lowerB= "+lowerStorm);
//console.log("upperB= "+upperStorm);
    }
}

/* ANIMAZIONE RASTER */
//percorso dei raster meteo per lanimazione:
var url_raster_anim = root_dir_html+"/common/DATA/raster/animation/googlemap_ist_T"; //default
//var raster_label = "Pioggia istantanea: animazione2"+group_radar; //default
var raster_label = "Pioggia istantanea: animazione2"; //default
var bounds = new OpenLayers.Bounds(673811.859, 5310564.071, 1254923.782, 5881520.640); //coord dal tiff gia' in 900913
var size = new OpenLayers.Size(515, 506);
var delta_max, delta_passo, delta, delta_inizio, udm, spanRaster, formato_data, index, raster_gid, raster_file, path_raster, frame_offset;
function set_raster_url(layer_selected) {
	if (layer_selected != 'none') {
	$("#timing").val('');
	raster_gid = $("#layer_choice").val();
	raster_file = data_table[raster_gid]['nome_file'];
	path_raster = root_dir_html+data_table[raster_gid]['path'];
	formato_data = data_table[raster_gid]['formato_data'];
	index = data_table[raster_gid]['data_index'].split('@@');
	url_raster_anim = path_raster + raster_file.substring(0, index[0]);
	//raster_label = $("#layer_choice option:selected").text() + ": animazione2" + group_radar;
	raster_label = $("#layer_choice option:selected").text() + ": animazione2";
	bounds_str = "new OpenLayers.Bounds("+(data_table[raster_gid]['bounds3857']).replace(/@@/g, ',')+")";
	bounds = eval(bounds_str);
	size_str = "new OpenLayers.Size("+(data_table[raster_gid]['size']).replace(/@@/g, ',')+")";
	size = eval(size_str);
	//Recupero alcune variabili che mi serviranno successivamente:
	delta = parseInt(data_table[raster_gid]['delta_min']);
        delta_inizio = parseInt(data_table[raster_gid]['delta_inizio']);
	delta_max = parseInt(data_table[raster_gid]['delta_max']);
	udm = data_table[raster_gid]['delta_udm'];
	//udm_easy = readable_udm(udm);
	delta_passo = parseInt(data_table[raster_gid]['delta_passo']);
	frame_offset = parseInt(data_table[raster_gid]['frame_offset']);
	passi = delta_max / delta_passo;
	flashback_array = [delta_passo];
	for (var i=2; i <= passi; i++) {
		flashback_array.push(delta_passo*i);
	}
	document.getElementById("flashback").options.length = 0;
	$.each(flashback_array, function (index_arr, value) {
	     $('#flashback').append($('<option>', {
	        value: value,
        	text : readable_udm(udm,value).value_easy + readable_udm(udm,value).label
	     }));
	});
	set_flashback($('#flashback').val());
	}
	else {
		document.getElementById("flashback").options.length = 0;
		$('#flashback').append($('<option value="none">------</option>'));
		$("#timing").val('');
		document.getElementById("start").disabled = true;
                document.getElementById("pause").disabled = true;
                document.getElementById("stop").disabled = true;
                document.getElementById("prev").disabled = true;
                document.getElementById("next").disabled = true;
	}
}
function convert_incremento_to_seconds(incremento_udm, udm) {
	switch (udm) {
	  case 'DD':
	    return incremento_udm * 86400;
	    break;
	  case 'HH':
	    return incremento_udm * 3600;
	    break;
    	  case 'MI':
	    return incremento_udm * 60;
            break;
    	  case 'SS':
	    return incremento_udm;
            break;
	}
}
//per settare come verranno visualizzati valori e unita di misura nel menu a tendina:
function readable_udm(udm, value) {
        switch (udm) {
          case 'DD':
            return {
                'label': 'd',
                'value_easy': value
            };
            break;
          case 'HH':
            return {
                'label': 'h',
                'value_easy': value
            };
            break;
          case 'MI':
            return {
		'label': 'h',
		'value_easy': value/60
	    };
            break;
          case 'SS':
            return {
                'label': 's',
                'value_easy': value
            };
            break;
        }
}
function extract_string_time(last_time_rounded, formato_data) {
	date_rounded = new Date(last_time_rounded);
	var second = date_rounded.getUTCSeconds();
	var minute = date_rounded.getUTCMinutes();
	var hour = date_rounded.getUTCHours();
	var day = date_rounded.getUTCDate();
	var month = date_rounded.getUTCMonth()+1;
	var year = date_rounded.getUTCFullYear();
	months = (month < 10) ? "0" + month : month;
	days = (day < 10) ? "0" + day : day;
	hours = (hour < 10) ? "0" + hour : hour;
        minutes = (minute < 10) ? "0" + minute : minute;
        seconds = (second < 10) ? "0" + second : second;
	//alert(days + '-'+months+'-'+year+ ' '+hours+':'+minutes+':'+seconds);
	switch (formato_data) {
	  case 'HH:MI':
	    return hours+':'+minutes;
	    break;
	  case 'HHMI':
            return hours+''+minutes;
            break;
	  case 'HH':
            return hours;
            break;
	  case 'YYYYMMDDYYHH':
            return ""+year+months+days+hours;
            break;
	  case 'YYYYMMDDHHMI':
            return ""+year+months+days+hours+''+minutes;
            break;
	  default:
	    console.log("ATTENZIONE! Corrispondenza non trovata tra formato data definito su DB e quello su codice");
	    return "99";
	}
}

var currentDate, animationTimer, date00, last_time_rounded00, end_time_raster;
var hh, mms, minutes, anime_rain, endDateRaster, trim_url, url_new, d;
var new_string_time;
var last_time_rounded; //CONTATORE
function set_contatore() {
	//Prima tutta questa parte era dentro la funzione "startAnimationRaster".
	//Ogni volta che avvio la funzione reinizializzo il contatore "last_time_rounded":
	var now = new Date();
        var today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	var today_UTC_time = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        //var spanRaster = numberField.getValue();
        var flash_time = spanRaster * 1000; //e' il tempo passato da cui far partire l'animazione in ms

        //Creo il contatore di partenza di tipo TIME arrotondandolo come di dovuto:
	if (frame_offset < 0) {
	  //Attivo la modalita FUTURO per gestire animazione dei modelli:
	  //var last_time = today.getTime(); //tempo in millisecondi dal 1970 da cui far partire l'animazione
	  var last_time = today_UTC_time;
	}
        else {
	  //var last_time = today.getTime() - flash_time; //tempo in millisecondi dal 1970 da cui far partire l'animazione
	  var last_time = today_UTC_time - flash_time;
	}
        var delta_min_ms = convert_incremento_to_seconds(delta, udm) * 1000; //converto il passo in ms
        var delta_inizio_ms = convert_incremento_to_seconds(delta_inizio, udm) * 1000; //converto eventuale offset in ms

        //var offset_ms = -delta_min_ms + delta_inizio_ms - (2*delta_min_ms); //calcolo offset partenza img. se ZERO si va indietro di un ulteriore delta_min e comunque vado indietro di altri 2 istanti per non rischiare l'assenza dell'img
        var offset_ms = delta_inizio_ms - (frame_offset*delta_min_ms); //calcolo offset partenza img.-lo definisco da DB
        last_time_rounded = (Math.floor(last_time / delta_min_ms) * delta_min_ms) + offset_ms;//QUESTO SARA IL TUO CONTATORE
	last_time_rounded00 = last_time_rounded; //questo e' il valore iniziale del contatore per il loop

        if (frame_offset < 0) {
	//Nel caso dei modelli previsionali, ritolgo l'offset messo per ritardare di 1g in modo tale da finire nel periodo giusto:
	  end_time_raster = last_time_rounded + (spanRaster * 1000) + (frame_offset*delta_min_ms);
	}
	else end_time_raster = last_time_rounded + (spanRaster * 1000); //ultimo valore di tempo recuperabile per il loop
        new_string_time = extract_string_time(last_time_rounded, formato_data); //da cui cerco di estrapolare dal TIME le informazioni che mi servono per comporre la stringa del raster da caricare

	//Scrivo il time di partenza nella maschera di input:
        $("#timing").val(new_string_time);

	//Inizializzo alcune variabili utili per le animazioni successive:
	//endDateRaster = new Date(last_time_rounded + (spanRaster * 1000));
	//d = new Date(last_time_rounded); //trasformo l'oggetto time in data
	//Per ragionare tutto in UTC e mantenere coerenza:
	//endDateRaster_local = new Date(last_time_rounded + (spanRaster * 1000));
	endDateRaster_local = new Date(end_time_raster);
        d_local = new Date(last_time_rounded); //trasformo l'oggetto time in data
	var userOffset = -(d_local.getTimezoneOffset())*60*1000;
	endDateRaster = new Date(endDateRaster_local - userOffset);
	d = new Date(d_local - userOffset);
	
	max_spanRaster = convert_incremento_to_seconds(delta_max, udm);
	//maxDateRaster = new Date(today.getTime() - (max_spanRaster * 1000)); //tempo massimo dal quale partire nel passato
	maxDateRaster = new Date(today_UTC_time - (max_spanRaster * 1000));

	//Ripulisco la mappa dall'ultima immagine se c'e':
        if (anime_rain) {parent_w.map.removeLayer(anime_rain);}
	//La pulizia degli altri layer_raster accesi la faccio a monte su toolbar_tools.js

	//A questo punto inizializzo l'immagine:
	anime_rain = new OpenLayers.Layer.Image(
            raster_label,
            //url_raster_anim + hh + ":" + mms + "Z.png", //?rand=", +d.getTime(),
            path_raster + raster_file.substring(0, index[0]) + new_string_time + raster_file.substring(index[1])+"?rand="+now.getTime(),
            bounds, size, raster_options //variabili definite in theme_raster.js
        );
console.log(path_raster + ' - ' + new_string_time);
        parent_w.map.addLayer(anime_rain);
	parent_w.map.setLayerIndex(anime_rain, 0);

	//OPZIONE ZERO: attivo i layer con ellissi e fulmini delle ultime 24h:
	//di default faccio in modo di non caricare nulla
	/*  parent_w.map.addLayer(parent_w.ellipse_24h);
          parent_w.map.setLayerIndex(parent_w.ellipse_24h, 1);
	  parent_w.ellipse_24h.setVisibility(true);
  	  parent_w.map.addLayer(parent_w.fulmini24h);
          parent_w.map.setLayerIndex(parent_w.fulmini24h, 2);
          parent_w.fulmini24h.setVisibility(true);
console.log("visibilita ellipse: "+parent_w.ellipse_24h.getVisibility());
//console.log("srsCode="+srsCode);
	*/
	// Associo adesso l'animazione di ELLIPSE_3h e dei fulmini e aggiorno la data corrente:
        //anime_storm(d);

        currentDate = d;
	date00 = d;
}
function set_flashback(flashback_udm) {
	if (flashback_udm != 'none') {
		spanRaster = convert_incremento_to_seconds(flashback_udm, udm);
		document.getElementById("start").disabled = false;
		document.getElementById("pause").disabled = false;
		document.getElementById("stop").disabled = false;
		document.getElementById("prev").disabled = false;
		document.getElementById("next").disabled = false;
		//Appena si modifica l'informazione di flashback creo il nuovo contatore TIME su cui basare il resto delle animazioni:
		set_contatore();
	}
	else {
		document.getElementById("start").disabled = true;
                document.getElementById("pause").disabled = true;
                document.getElementById("stop").disabled = true;
		document.getElementById("prev").disabled = true;
                document.getElementById("next").disabled = true;
	}
}
function nextAnimationRaster() {
	if (!currentDate) set_contatore();
	if (currentDate < endDateRaster) {
                //NUOVO METODO USANDO UN CONTATORE UNIVOCO:
                //ricarico l'img del delta_tempo successivo:
                var layer_to_remove = anime_rain;
                //incremento_udm = data_table[raster_gid]['delta_min'];
                incremento = convert_incremento_to_seconds(delta, udm);
                last_time_rounded = last_time_rounded + (incremento * 1000);
                //d = new Date(last_time_rounded); //trasformo l'oggetto time in data
		//Per ragionare tutto in UTC e mantenere coerenza:
        	d_local = new Date(last_time_rounded); //trasformo l'oggetto time in data
        	var userOffset = -(d_local.getTimezoneOffset())*60*1000;
        	d = new Date(d_local - userOffset);
                var new_string_time = extract_string_time(last_time_rounded, formato_data);
                var new_url = path_raster + raster_file.substring(0, index[0]) + new_string_time + raster_file.substring(index[1]) + "?rand="+now.getTime();
                var image_visibility = layer_to_remove.getVisibility();
                layer_to_remove.setVisibility(true);
                layer_to_remove.setUrl(new_url);
                if (image_visibility==false) {layer_to_remove.setVisibility(false);}
                layer_to_remove.redraw(true);
                $("#timing").val(new_string_time);

            // Associo adesso l'animazione di ELLIPSE_3h e dei fulmini e aggiorno la data corrente:
            anime_storm(d);
            currentDate = d;
        }
	else {
	   //Faccio ripartire l'animazione in loop
           currentDate = date00;
	   //Per non far ripartire da un istante succesivo a quello iniziale, riporto il contatore indietro di 1 istante tanto poi verra' incrementato all'interno dell'IF di questa funzione:
	   incremento = convert_incremento_to_seconds(delta, udm);
           //last_time_rounded = last_time_rounded00;
	   last_time_rounded = last_time_rounded00 - (incremento * 1000);
           nextAnimationRaster();
	   //alert("tempo massimo raggiunto");
	}
}
function prevAnimationRaster() {
	if (!currentDate) set_contatore();
        //if (currentDate > maxDateRaster) {
	if (currentDate > date00) { //se voglio farlo ripartire dall'inizio
                //NUOVO METODO USANDO UN CONTATORE UNIVOCO:
                //ricarico l'img del delta_tempo successivo:
                var layer_to_remove = anime_rain;
                //incremento_udm = data_table[raster_gid]['delta_min'];
                incremento = convert_incremento_to_seconds(delta, udm);
                last_time_rounded = last_time_rounded - (incremento * 1000);
                //d = new Date(last_time_rounded); //trasformo l'oggetto time in data
		//Per ragionare tutto in UTC e mantenere coerenza:
	        d_local = new Date(last_time_rounded); //trasformo l'oggetto time in data
        	var userOffset = -(d_local.getTimezoneOffset())*60*1000;
        	d = new Date(d_local - userOffset);
                var new_string_time = extract_string_time(last_time_rounded, formato_data);
                var new_url = path_raster + raster_file.substring(0, index[0]) + new_string_time + raster_file.substring(index[1]) + "?rand="+now.getTime();
                var image_visibility = layer_to_remove.getVisibility();
                layer_to_remove.setVisibility(true);
                layer_to_remove.setUrl(new_url);
                if (image_visibility==false) {layer_to_remove.setVisibility(false);}
                layer_to_remove.redraw(true);
                $("#timing").val(new_string_time);

            // Associo adesso l'animazione di ELLIPSE_3h e dei fulmini e aggiorno la data corrente:
            anime_storm(d);
            currentDate = d;
        }
	else {
	   //Faccio ripartire l'animazione in loop
           currentDate = endDateRaster;
	   //Per non perdermi l'ultimo istante, riporto il contatore avanti di 1 istante tanto poi verra' decrementato all'interno dell'IF di questa funzione:
           //last_time_rounded = end_time_raster;
	   incremento = convert_incremento_to_seconds(delta, udm);
	   last_time_rounded = end_time_raster + (incremento * 1000);
           prevAnimationRaster();
	   //alert("tempo minimo raggiunto");
	}
}
function startAnimationRaster() {
    if (animationTimer) {
        stopAnimationRaster(true);
    }
    if (!currentDate) {

	//Appena parto con l'animazione creo il nuovo contatore TIME su cui basare il resto delle animazioni:
	set_contatore();

    } //Fine dell'IF sulla presenza o meno del currentDate

    var next = function() {
        //var span = parseInt(spanEl.value, 10);
        if (currentDate < endDateRaster) {

		//NUOVO METODO USANDO UN CONTATORE UNIVOCO:
		//ricarico l'img del delta_tempo successivo:
		var layer_to_remove = anime_rain;
		//incremento_udm = data_table[raster_gid]['delta_min'];
		incremento = convert_incremento_to_seconds(delta, udm);
		last_time_rounded = last_time_rounded + (incremento * 1000);
		//d = new Date(last_time_rounded); //trasformo l'oggetto time in data
		//Per ragionare tutto in UTC e mantenere coerenza:
	        d_local = new Date(last_time_rounded); //trasformo l'oggetto time in data
        	var userOffset = -(d_local.getTimezoneOffset())*60*1000;
	        d = new Date(d_local - userOffset);
		var new_string_time = extract_string_time(last_time_rounded, formato_data);
		var new_url = path_raster + raster_file.substring(0, index[0]) + new_string_time + raster_file.substring(index[1]) + "?rand="+now.getTime();
		var image_visibility = layer_to_remove.getVisibility();
		//Come fare per non far "lampeggiare" l'imnmnagine durante l'animazione???
		layer_to_remove.setVisibility(true);
		layer_to_remove.setUrl(new_url);
		if (image_visibility==false) {layer_to_remove.setVisibility(false);}
		layer_to_remove.redraw(true);
		$("#timing").val(new_string_time);

            // Associo adesso l'animazione di ELLIPSE_3h e dei fulmini e aggiorno la data corrente:
	    anime_storm(d);
            currentDate = d;

        } else {
            stopAnimationRaster('loop');
        }
    }
    animationTimer = window.setInterval(next, interval * 1000);
}

function stopAnimationRaster(reset) {
    window.clearInterval(animationTimer);
    animationTimer = null;

    //Si resta fermi all'ultima immagine caricata
    /*
    if (reset === true) {
        currentDate = null;
    }
    */
    currentDate = null;

    if (reset==="loop") {
           //Faccio ripartire l'animazione in loop
           currentDate = date00;
	   //Per non far ripartire da un istante succesivo a quello iniziale, riporto il contatore indietro di 1 istante tanto poi verra' incrementato all'interno dell'IF di questa funzione:
           incremento = convert_incremento_to_seconds(delta, udm);
	   //last_time_rounded = last_time_rounded00;
	   last_time_rounded = last_time_rounded00 - (incremento * 1000);
           startAnimationRaster();
    }
    else {
    //Resetto e visualizzo tutti i temporali e i fulmini:
    if (webgis != 'rischioindustriale') {
        parent_w.filterStorm24.lowerBoundary = last3h_string;
        parent_w.filterStorm24.upperBoundary = lastStorm_string;
        parent_w.filterStrategyStorm24.setFilter(parent_w.filterStorm24);
        parent_w.filterFulmini24.lowerBoundary = last3h_string;
        parent_w.filterFulmini24.upperBoundary = lastStorm_string;
        parent_w.filterStrategyFulmini24.setFilter(parent_w.filterFulmini24);
    }

    bboxStrategy = new OpenLayers.Strategy.BBOX();
    bboxStrategy.setLayer(parent_w.ellipse);
    bboxStrategy.activate();
    refreshStrategy = new OpenLayers.Strategy.Refresh({interval: 150000, force: true});
    refreshStrategy.setLayer(parent_w.ellipse);
    refreshStrategy.activate();
    refreshStrategy.refresh();
    parent_w.ellipse.refresh({ force: true });
    }
}

function pauseAnimationRaster() {
    window.clearInterval(animationTimer);
    animationTimer = null;
}
//In questo modo setto come layer di default il mosaico piemontese istantaneo che ha gid=3 sul DB:
function set_deafult_layer() {
	var default_raster = '<?php echo $default_raster; ?>'
	$("#layer_choice option[value="+default_raster+"]").prop("selected", true);
	set_raster_url(default_raster);
}

//Visto che quando riapro la finestra dell'animazione il contatore non si aggiorna, provo ad aggiornarlo automaticamente ogni 3 minuti:
//window.setInterval(set_contatore(), 150 * 1000);
</script>

</head>

<body onLoad='set_deafult_layer();'>

<!-- <script type="text/javascript">document.write(test.value);</script> -->

<center>
<p> 
<select name="layer_choice" id="layer_choice" title='scegli il layer da animare' style="width:155px;" onchange="set_raster_url(this.value);" >
  <option value="none">---Scegli il layer---</option>

<?php
for ($i = 0; $i < count($layers_list); $i++)
{
?>

<option value="<?php echo $layers_list[$i][0]; ?>" > <?php echo $layers_list[$i][1]; ?> </option>

<?php
} //fine del ciclo dentro i nomi dei layer disponibili per lanimazione
?>

</select>

&nbsp;

<select name="flashback" id="flashback" title='scegli di quanto andare avanti-indietro' style="width:90px;" onchange="set_flashback(this.value);" >
  <option value="none">------</option>
</select>
</p>

<?php
if ($webgis != 'rischioindustriale' AND $webgis != 'fews') {
?>
<fieldset>
 <legend>Associare con:</legend>
 <input type="checkbox" name="temporali" id='temporali' value="temporali" onChange='attiva_temporali(this, d);' /> temporali
 <br /> 
 <input type="checkbox" name="fulmini" id='fulmini' value="fulmini" onChange='attiva_fulmini(this, d);' /> fulmini
 <br />
 <input type="checkbox" name="geopotenziale" id='geopotenziale' value="geopotenziale" onChange='attiva_geop(this, d);' /> geopotenziale
</fieldset>
<?php
}
?>

<p>
<button style='vertical-align:middle;' disabled id='prev' onclick="prevAnimationRaster()" title="precedente"><img src="<?php echo $root_dir_html; ?>/common/icons/toolbar_icons/rewind-26.png" align="middle" alt="precedente" border=0 vspace=1 hspace=0 width=16> </button><!--
--><button style='vertical-align:middle;' disabled id='start' onclick="startAnimationRaster()" title="avvia l'animazione"><img src="<?php echo $root_dir_html; ?>/common/icons/toolbar_icons/play-dav.png" align="middle" alt="start" border=0 vspace=1 hspace=0 width=16> </button><!--
--><button style='vertical-align:middle;' disabled id='pause' onclick="pauseAnimationRaster()" title="pausa l'animazione"><img src="<?php echo $root_dir_html; ?>/common/icons/toolbar_icons/pausa-dav.png" align="middle" alt="pause" border=0 vspace=1 hspace=0 width=16> </button><!--
--><button style='vertical-align:middle;' disabled id='stop' onclick="stopAnimationRaster()" title="ferma l'animazione"><img src="<?php echo $root_dir_html; ?>/common/icons/toolbar_icons/stop-dav.png" align="middle" alt="stop" border=0 vspace=1 hspace=0 width=16> </button><!--
--><button style='vertical-align:middle;' disabled id='next' onclick="nextAnimationRaster()" title="successivo"><img src="<?php echo $root_dir_html; ?>/common/icons/toolbar_icons/fast_forward-26.png" align="middle" alt="successivo" border=0 vspace=1 hspace=0 width=16> </button><!--
--><input style='vertical-align:middle;text-align:center;' type="text" size=10 id="timing" title="UTC" disabled >
</p>

</center>


</body>

</html>

