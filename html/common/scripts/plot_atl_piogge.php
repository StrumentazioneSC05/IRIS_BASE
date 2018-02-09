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

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>

<title>Atlante delle piogge</title>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
//Proviamo Highcharts:
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/highcharts.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/modules/exporting.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/js_functions.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/browser_detect.js"></script>';
echo $script_js1st;
?>

<?php

/*
Plotto dei grafici per visualizzare le curve dell'atlante delle piogge.
Scarica i dati da DB e li fornisce nella forma: [date, values] in modo da poter essere plottati.
Lo script e' pensato in maniera tale da poter essere richiamato da altre pagine.

TO DEVEL:
- rendere piu' flessibile il vettore che definisce le categorie sull'asse X in modo da essere in linea con le durate effettivamente plottate e estratte dal DB
- rendere flessibile il numero di serie da plottare, al momento predefinito, anche in termini di colore

*/


//Imposto la variabile se voglio l'asse X con i valori reali oppure equidistanti:
$asse_x_reale = 1; //valore 0=equidistante, 1=valori reali

//Get datetime of server:
date_default_timezone_set('UTC');
$timezone = date_default_timezone_get();
$datetime = date('d/m/Y H:i T', time());
//echo $datetime;

//Lo stesso script lo riutilizzo per estrarre le curve segnalatrici delle stazioni.
//Per far questo inizializzo alcune variabili:
$plot_type;
$query_table;
$query_values;
$id_atl;
$tr_arr;
$durata_arr;
$data_agg;
if ( (isset($_GET['codice_istat'])) && (isset($_GET['progr_punto'])) ) {
    $plot_type = 'stazioni';
    $query_table = 'dati_di_base.atlante_piogge_lspp';
    $codice_istat = $_GET['codice_istat'];
    $progr_punto_com = $_GET['progr_punto'];
    $denominazione = addslashes(urldecode($_GET['denominazione']));
    $quota = $_GET['quota'];
    $datetime = $_GET['time_agg']; //sostituisco il valore time odierno con quello del dato
    //Recupero i dati misurati dalla stazione:
    if (!isset($_GET['rete_prec'])) $rete_prec = "60,0@@180,0@@360,0@@720,0@@1440,0";
    else {
        $rete_prec = $_GET['rete_prec'];
    }
    $rete_point = explode("@@", $rete_prec);
    $query_values = "SELECT tr, array_to_string(durata,','), array_to_string(pioggia,','), data_agg FROM $query_table WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;";
}

else { //se queste informazioni non sono definite allora plotto le curve segnalatrici per tutta la regione
    $plot_type = 'regione';
    $query_table = 'dati_di_base.atlante_piogge_values';
    //Recupero alcune info dall'URL del popup.js:
    if (isset($_GET['x'])) $x = $_GET['x'];
    if (isset($_GET['y'])) $y = $_GET['y'];
    if (isset($_GET['srid'])) $srid = $_GET['srid'];
    if (isset($_GET['webgis'])) $webgis = $_GET['webgis'];
    //Recupero i dati stimati da radar:
    if (!isset($_GET['radar_prec'])) $radar_prec = "60,8.2@@180,11.4@@360,11.4@@720,11.9";
    else {
        $radar_prec = $_GET['radar_prec'];
    }
    $radar_point = explode("@@", $radar_prec);
    //Recupero i dati misurati da rete a terra e interpolati sul territorio:
    if (!isset($_GET['rete_prec'])) $rete_prec = "60,11.2@@180,15.4@@360,11.4@@720,21.9@@1440,35";
    else {
        $rete_prec = $_GET['rete_prec'];
    }
    $rete_point = explode("@@", $rete_prec);
    //print $radar_prec; //60,8.2@@180,11.4@@360,11.4@@720,11.94

    //Recupero prima l'id della cella dell'atlante di pioggia tramite intersezione col pto cliccato dal mouse:
    $query_id = "SELECT id FROM dati_di_base.atlante_piogge_geom WHERE ST_Intersects(the_geom, ST_Transform(ST_SetSRID(ST_MakePoint($x, $y), $srid), 32632));"; 
    $conn = pg_connect($conn_string);
    if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
    }
    else {
        $result = pg_query($conn, $query_id);
        if (!$result) {
            echo "Error on the query <br>";
        }
	else if (pg_numrows($result) <= 0) {echo "Punto fuori dominio <br>"; exit();}
        else {
            $numrows = pg_numrows($result);
            $bacino = pg_fetch_row($result, 0); //prendo il primo record
            $id_atl = $bacino[0]; //id della cella dell'atlante delle piogge tramnite la quale recuperare i valori associati
        } //ok query
    } //ok connection
    pg_close($conn);

    if(!$id_atl) {echo "Punto fuori dominio <br>"; exit();}

    $query_values = "SELECT tr, array_to_string(durata, ','), array_to_string(pioggia, ','), '$datetime' AS data_agg FROM $query_table WHERE id_atl = $id_atl;";

} //fine ELSE per plot atlante piogge regionale


//Righe ed istruzioni comuni per i vari plot:
//$query_values = "SELECT tr, array_to_string(durata, ','), array_to_string(pioggia, ',') FROM $query_table WHERE id_atl = $id_atl;";
$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	$result = pg_query($conn, $query_values);
        if (!$result) {
                echo "Error on the query <br>";
        }
        else {
		$tr_arr = array();
		//Prelevo i dati per costruire le curve segnalatrici atlante piogge:
		while($row_atl = pg_fetch_array($result)) {
		//variabili array dove stoccare i dati per il grafico sulle varie serie in base ai Tempi di Ritorno Tr
			$tr_arr[] = $row_atl[0];
			${"serie_tr".$row_atl[0]} = array();
			//Recupero tutti i dati in un array da passare poi per costruire il grafico:
			$durata_arr = explode( ',', $row_atl[1]);
			$value_arr = explode( ',', $row_atl[2]);
			//Ciclo dentro l'array durata e recupero i valori:
			foreach ($durata_arr as $key=>$durata_number) {
				if ($asse_x_reale == 1) {
					//Per l'asse X con i valori reali:
					${"serie_tr".$row_atl[0]}[] = array(intval($durata_number)/60, intval($value_arr[$key]));
				}
				else { //asse x equispaziato
					//$durata_key = array_search($durata_number, $durata_arr);
					//${"serie_tr".$row_atl[0]}[] = array(intval($durata_key), intval($value_arr[$key]));
					${"serie_tr".$row_atl[0]}[] = array($key, intval($value_arr[$key]));
				}
			} //fine del foreach dentro array con le durate
			//Creo dinamicamente anche le variabili javascript assegnando loro il valore:
			echo "<SCRIPT LANGUAGE='javascript'>graph_tr".$row_atl[0]."=".json_encode(${"serie_tr".$row_atl[0]}).";</SCRIPT>";
		}
	} //ok query

} //ok connection
pg_close($conn);


//Per plottare i punti dalla rete e dal radar, al momento li escludo ne caso il plot sia sulle stazioni:
if ($plot_type == 'regione') {
//A questo punto ho recuperato tutti i miei dati da DB, analizzo quelli prelevati dal radar:
//Trasformo l'array sulle durate in un dizionario:
$radar_dict =  array();
foreach ($radar_point as $pair) {
    list($key,$value) = explode(',',$pair);
    $radar_dict[$key]=$value;
}
//print implode('-', $durata_dict) . '<br/>'; //8.2-11.4-11.4-11.9
$serie_point_radar =  array();
foreach ($radar_dict as $key=>$durata_number) {
	//Cerco la chiave del dizionario nell'array delle durate per ordinare l'array per il plot:
	$durata_key = array_search($key, $durata_arr);
	if ($asse_x_reale == 1) {
            //Per l'asse X con i valori reali:
	    $serie_point_radar[] = array(intval($key)/60, floatval($durata_number));
	}
	else { //per asse x equispaziato:
	    $serie_point_radar[] = array(intval($durata_key), floatval($durata_number));
	}
}

//Elaboro i dati della rete a terra:
$rete_dict =  array();
foreach ($rete_point as $pair) {
    list($key,$value) = explode(',',$pair);
    $rete_dict[$key]=$value;
}
//print implode('-', $durata_dict) . '<br/>'; //8.2-11.4-11.4-11.9
$serie_point_rete =  array();
foreach ($rete_dict as $key=>$durata_number) {
        //Cerco la chiave del dizionario nell'array delle durate per ordinare l'array per il plot:
        $durata_key = array_search($key, $durata_arr);
        if ($asse_x_reale == 1) {
            //Per l'asse X con i valori reali:
            $serie_point_rete[] = array(intval($key)/60, floatval($durata_number));
        }
        else { //per asse x equispaziato:
            $serie_point_rete[] = array(intval($durata_key), floatval($durata_number));
        }
}

//Definisco qui le variabili javascript:
echo "<script language='javascript'>radar_data = " . json_encode($serie_point_radar) . ";</script>";

} //fine dell IF che esclude questa parte per il plot sulle stazioni

else if ($plot_type == 'stazioni') {
    echo "<script language='javascript'> var radar_data, rete_data; </script>";
}


//Elaboro i dati della rete a terra:
$rete_dict =  array();
foreach ($rete_point as $pair) {
    list($key,$value) = explode(',',$pair);
    $rete_dict[$key]=$value;
}
//print implode('-', $durata_dict) . '<br/>'; //8.2-11.4-11.4-11.9
$serie_point_rete =  array();
foreach ($rete_dict as $key=>$durata_number) {
        //Cerco la chiave del dizionario nell'array delle durate per ordinare l'array per il plot:
        $durata_key = array_search($key, $durata_arr);
        if ($asse_x_reale == 1) {
            //Per l'asse X con i valori reali:
            $serie_point_rete[] = array(intval($key)/60, floatval($durata_number));
        }
        else { //per asse x equispaziato:
            $serie_point_rete[] = array(intval($durata_key), floatval($durata_number));
        }
}
echo "<script language='javascript'>rete_data = " . json_encode($serie_point_rete) . ";</script>";


?>


<script>

//Recupero altezza del parent window:
//alert(parent.document.body.clientHeight);
//alert($("#tabs-2", parent.document).height());

//Recupero info dall'url:
function gup(name)
{
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );
        if( results == null )
                return "";
        else
                return results[1];
}
//var id_bacino = parseInt(gup("bacino"));
//var graph_data, graph_tr2, graph_tr5, graph_tr10, graph_tr20, graph_tr50, graph_tr100, graph_tr200, radar_data; //inizializzazione data array per i grafici fatta dentro al codice PHP

$(function() {

var tr_array = <?php echo json_encode($tr_arr); ?>;
var asse_x_reale = <?php echo $asse_x_reale; ?>;
var datetime = '<?php echo $datetime; ?>';
if (asse_x_reale == 1) {
        var x_categories;
	var x_tick=3;
}
else {
        x_categories = array('10m', '20m', '30m', '1h', '3h', '6h', '12h', '24h');
        x_tick = 1;
}

var plot_type = '<?php echo $plot_type; ?>';
if (plot_type == 'regione') {
var plot_title = 'Tempi di ritorno per diverse durate di pioggia e precipitazioni radar';
var sub_title = 'Precipitazioni cumulate nelle ultime 24 ore';
}
else if (plot_type == 'stazioni') {
var plot_title = 'Curve segnalatrici per la stazione <?php echo $denominazione; ?> - quota <?php echo $quota;?> slm';
var sub_title = 'Precipitazioni massime nelle ultime 24 ore';
}

//var soglia2 = '<?php //echo $soglia2; ?>';
//var soglia3 = '<?php //echo $soglia3; ?>';

//proviamo Highcharts:
$('#container').highcharts({
        chart: {
	    //height: 300, //fisso l'altezza per firefox
            type: 'line',
                plotBackgroundColor: {
                        linearGradient: { x1: 1, y1: 0, x2: 1, y2: 1 },
                        stops: [
                        [0, 'rgb(255, 255, 255)'],
                        [1, 'rgb(200, 200, 255)']
                        //[0, '#FFF'], [1, '#DDD']
                        ]
                }
        },
        title: {text: plot_title},
	subtitle: {text: sub_title},
	credits: {
                text: 'Arpa Piemonte ' + datetime,
                href: 'http://www.arpa.piemonte.it/'
	},
	exporting: {
            //width: 200
	    //scale: 4
        },
        xAxis: {
                //type: 'datetime',
                gridLineWidth: 1
                ,title: {
                        text: 'Durata evento di pioggia'
                },
		categories: x_categories,
		//min: 3,
		tickInterval: x_tick
                ,labels: {
                        formatter: function() {
                            //return Highcharts.dateFormat('%d/%m/%y', this.value) + '<br />' + Highcharts.dateFormat('%H:%M', this.value);
			    return this.value + 'h';
                        }
                }
        },
        yAxis: {
            title: {
                text: 'Precipitazione [mm]'
            },
	    //minRange: min_range_y,
            //tickInterval: tick_interval_y,
            min: 0,
            //max: max_y,
            lineWidth: 2,
            /*plotLines: [
                {
                color: 'yellow', // Color value
                value: soglia2,
                width: 3,
                zIndex: 2
                ,label: {
                    text: 'Soglia di avvicinamento'
                }
                },
                {
                color: 'red', // Color value
                value: soglia3,
                width: 3,
                zIndex: 2
                ,label: {
                    text: 'Soglia di superamento'
                }
                }
            ]*/
        /*
           plotBands: {
                color: 'yellow', // Color value
                from: '15', // Start of the plot band
                to: '20' // End of the plot band
                ,label: {
                    text: 'Soglia 1',
                }
                }
        */
        },
        series: [
        //Aggiungo la serie con i punti dalla rete:
            {
            name: 'Rete',
            //type: 'scatter',
            type: 'line',
            lineWidth: 0,
            showInLegend: true,
            data: rete_data,
            color: 'cyan',
            shadow : true,
            marker: {enabled: true, symbol:"square", radius:6}
            },
	//Aggiungo la serie con i punti del radar-la visualizzo solo se il plot_type=regione:
            {
            name: 'Radar',
            type: 'line',
            lineWidth: 0,
            showInLegend: false,
            //data: radar_data,
            color: 'black',
            shadow : true,
            marker: {enabled: true}
            },
            {name: 'Tr 2',
            showInLegend: true,
            //data: graph_data,
	    data: graph_tr2,
            color: 'orange',
            shadow : true,
	    marker: {enabled: false}
	    ,visible: false
            }
	    ,{
	    name: 'Tr 5',
            showInLegend: true,
            data: graph_tr5,
            color: 'gray',
            shadow : true,
            marker: {enabled: false}
            ,visible: true
	    }
            ,{
            name: 'Tr 10',
            showInLegend: true,
            data: graph_tr10,
            color: 'cyan',
            shadow : true,
            marker: {enabled: false}
            ,visible: true
            }
            ,{
            name: 'Tr 20',
            showInLegend: true,
            data: graph_tr20,
            color: 'black',
            shadow : true,
            marker: {enabled: false}
	    ,visible: true
            }
            ,{
            name: 'Tr 50',
            showInLegend: true,
            data: graph_tr50,
            color: 'blue',
            shadow : true,
            marker: {enabled: false}
            ,visible: true
            }
            ,{
            name: 'Tr 100',
            showInLegend: true,
            data: graph_tr100,
            color: 'red',
            shadow : true,
            marker: {enabled: false}
	    ,visible: false
            }
            ,{
            name: 'Tr 200',
            showInLegend: true,
            data: graph_tr200,
            color: 'purple',
            shadow : true,
            marker: {enabled: false}
	    ,visible: false
            }
        ],
        tooltip: {
	    shared: true,
	    //crosshairs: true,
	    crosshairs: [{width: 3}],
	    /*
	    headerFormat: '<span style="font-weight:bold;text-align:center;">{point.key}h</span><br/>',
	    pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <span style="font-weight:bold;text-align:right;">{point.y}</span><br/>'
	    */
	    useHTML: true,
	    headerFormat: '<span style="font-weight:bold;text-align:center;left:0;right:0;">{point.key}h</span><table>',
	    pointFormat: '<tr><td style="color:{series.color}">\u25CF</td><td> {series.name}:</td> <td style="font-weight:bold;text-align:right;">{point.y}</td></tr>',
	    footerFormat: '</table>',
	    valueDecimals: 0
                /*formatter: function() {
                        //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + 'mm';
		    if (this.x <1) return this.x.toFixed(1) + 'h  <b> ' + this.y + 'mm';
		    else return this.x + 'h  <b> ' + this.y + 'mm';
                }*/
		//Per multi-tooltip:
		/*formatter: function() {
                    //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                    var s = [];
        	    $.each(this.points, function(i, point) {
	                //s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+ point.series.name +': '+
                	s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+ point.x + 'h ' +
        	        point.y + 'mm' + '<span>');
	            });
            	    return s.join('<br />');
        	}*/
        }
    });

//Aggiungo la serie di dati se i dati per l'atlante vengono dalla regione cioe' se ho cliccato 1 punto qualsiasi nello spazio e non una stazione:
if (plot_type=='regione') {
        var chart = $('#container').highcharts();
        var seconda_serie = chart.series[1];
        seconda_serie.update({
                data: radar_data,
                showInLegend: true
        }, false);
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
	chart.redraw();
}

//Reference for timelabel: http://stackoverflow.com/questions/7101464/how-to-get-highcharts-dates-in-the-x-axis
//fine della pova con Highcharts

//Provo a settare una altezza fissa del plot per evitare che Mozilla rompa i coglioni
if (BrowserDetect.browser == "Firefox") {
	$("#container").height(400);
}
//height_plot = chart.height;
//alert(height_plot);

});

</script>

</head>

<body>

<div id="container" style="width:100%; height:98%;"></div>

</body>
</html>

