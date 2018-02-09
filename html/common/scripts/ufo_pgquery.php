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

date_default_timezone_set('UTC');

//Recupero alcune info dall'URL del popup.js:
$id_bacino = '0';
if(isset($_GET['bacino'])) $id_bacino = $_GET['bacino'];
$gid = $_GET['gid'];
$layer = $_GET['layer'];
$jquery_tab = '0';
if(isset($_GET['jquery_tab'])){
        $jquery_tab = $_GET['jquery_tab'];
}
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>

<title>Scheda dettagli <?php echo $layer;?> </title>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
//Proviamo Highcharts:
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/highcharts.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/modules/exporting.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/js_functions.js"></script>';
echo $script_js1st;
?>

<script>

//Abilito la funzione per i TAB di jQuery:
$(function() {
        $("#tabs").tabs();
});
</script>

<style>
p, table {font-size: 0.75em;}
#tab_generale {font-size: 0.85em;}
body {font-family: Verdana,Arial,sans-serif;}
#generale {height:21%;}
#tabs {height:70%;}
.ui-widget-content {border:none;}
#tabs-1, #tabs-2, #tabs-1b {overflow-y:scroll; height:98%;}
/*Aggiungo una modifica per Mozilla perche' non fa vedere la scroll bar in quanto vuole i "px" e non le "%":*/
/*Fonte: http://perishablepress.com/css-hacks-for-different-versions-of-firefox/ */
@-moz-document url-prefix() { #tabs-1, #tabs-1b, #tabs-2 {overflow-y:scroll; height:500px;} } 
.ui-tabs .ui-tabs-hide {
     position: absolute;
     top: -10000px;
     display: block !important;
}
</style>


<?php

$data_array10m = array(); //variabile array dove stoccare i dati per la costruzione del grafico
$data_array20m = array();
$data_array30m = array();
$data_array60m = array();

$dati_generali = "";
$data_table = "<div id='tabs-1'>";
$data2_table = "<div id='tabs-1b'>";
$staz_table = "<div id='tabs-2'>";

$tab_title = "<ul><li><a href='#tabs-1'>Tabella superamenti 10m/20m</a></li><li><a href='#tabs-1b'>Tabella superamenti 30m/1h</a></li><li><a href='#tabs-2'>Stazioni vicine</a></li></ul>";

$conn = pg_connect($conn_string);

if (!$conn) { // Check if valid connection
	$dati_generali .= "Error Connecting to database <br>";
	exit;
}
else {
        // Valid connection, we can go on to retrieve some data
	if ($layer == "celle") {
		$query = "SELECT id_cella_ufo, data, comune, p10m, d10mt2, d10mt10, p20m, d20mt2, d20mt10, p30m, d30mt2, d30mt10, p60m, d1ht2, d1ht10, sup10, sup20, sup30, sup60, superamento FROM realtime.v_ufo_superamenti WHERE data > (now() - '6 days'::interval) AND id_cella_ufo = $gid ORDER BY data ASC;";
	}
	else {
		//$query = "SELECT data,valore,round(10*media)/10.,comune,regione,provincia,pop_2001,warning_class,soglia1,soglia2,soglia3 FROM realtime.v_cumulata_comuni WHERE data >= (SELECT (data - '48 hours'::interval) FROM realtime.v_comuni_last WHERE gid = $gid) AND gid_comune = $id_bacino ORDER BY data DESC;";
		$query = "SELECT gid, id_area, data, nome, p10m, min_d10mt2, min_d10mt10, p20m, min_d20mt2, min_d20mt10, p30m, min_d30mt2, min_d30mt10, p60m, min_d1ht2, min_d1ht10, sup10min, sup20min, sup30min, sup60min, superamento FROM realtime.v_ufo_superamenti_aree, dati_di_base.ufo_areametropolitana_soglie b WHERE data > (now() - '6 days'::interval) AND id_area = $gid AND id_area=b.gid_areemetropolitane ORDER BY data ASC;";
	}

        $result = pg_query($conn,$query);
        if (!$result) {
                $data_table .= "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result);

		if ($layer == "celle") {

		//$data_table .= '<div id="container" style="width:100%; height:400px;"></div>';
		//$data_table .= "<iframe width='100%' height=450px src='/common/scripts/plot_defense.php?bacino=$id_bacino' seamless></iframe>";
                //$data_table .= "<p><font style='background-color:yellow;'>Soglia di avvicinamento:</font> media probabilita' di occorrenza del fenomeno<br/>";
                //$data_table .= "<font style='background-color:#FF4500;'>Soglia di superamento:</font> alta probabilita' di occorrenza del fenomeno</p>";

		//Recupero tutti i dati in un array da passare poi per costruire il grafico:
		while($row = pg_fetch_array($result)) {
                        $data_array10m[] = array(strtotime($row['data'])*1000, floatval($row['p10m']));
			$data_array20m[] = array(strtotime($row['data'])*1000, floatval($row['p20m']));
			$data_array30m[] = array(strtotime($row['data'])*1000, floatval($row['p30m']));
			$data_array60m[] = array(strtotime($row['data'])*1000, floatval($row['p60m']));
                }
		//Alcune caratteristiche comuni - SOGLIE:
		$bacino = pg_fetch_array($result, 0); //prendo il primo record
		$comune = $bacino['comune'];
		$sogliad10mt2 = $bacino['d10mt2'];
                $sogliad10mt10 = $bacino['d10mt10'];
		$sogliad20mt2 = $bacino['d20mt2'];
                $sogliad20mt10 = $bacino['d20mt10'];
		$sogliad30mt2 = $bacino['d30mt2'];
                $sogliad40mt10 = $bacino['d30mt10'];
		$sogliad1ht2 = $bacino['d1ht2'];
                $sogliad1ht10 = $bacino['d1ht10'];

		} //if layer == celle

		else {
		//Recupero tutti i dati in un array da passare poi per costruire il grafico:
                while($row = pg_fetch_array($result)) {
                        $data_array10m[] = array(strtotime($row['data'])*1000, floatval($row['p10m']));
                        $data_array20m[] = array(strtotime($row['data'])*1000, floatval($row['p20m']));
                        $data_array30m[] = array(strtotime($row['data'])*1000, floatval($row['p30m']));
                        $data_array60m[] = array(strtotime($row['data'])*1000, floatval($row['p60m']));
                }
		//ELENCHIAMO ALCUNE CARATTERISTICHE COMUNI DEL COMUNE:
		$bacino = pg_fetch_array($result, 0); //prendo il primo record
                $comune = $bacino['nome'];
                $sogliad10mt2 = $bacino['min_d10mt2'];
                $sogliad10mt10 = $bacino['min_d10mt10'];
                $sogliad20mt2 = $bacino['min_d20mt2'];
                $sogliad20mt10 = $bacino['min_d20mt10'];
                $sogliad30mt2 = $bacino['min_d30mt2'];
                $sogliad40mt10 = $bacino['min_d30mt10'];
                $sogliad1ht2 = $bacino['min_d1ht2'];
                $sogliad1ht10 = $bacino['min_d1ht10'];
		} //if layer <> celle

        } // Query	

	//$data_table .= "<hr />";

	//Adesso estrapolo le stazioni piu' vicine all'elemento che interessa:
	if ($layer == "celle") {
		$staz_table .= "<p><b>Elenco delle prime 20 stazioni meteorologiche entro un raggio di 25km dalla cella:</b></p>";
		$query2 = "SELECT a.codice_stazione, round(a.quota_stazione) as quota, a.denominazione, round((ST_Distance(ST_Transform(a.the_geom,32632), b.the_geom)/1000)::numeric,1) as dist from dati_di_base.rete_meteoidrografica a, dati_di_base.ufo_soglie b WHERE ST_Distance(ST_Transform(a.the_geom,32632), b.the_geom) <= 25000 AND b.id = $gid AND a.tipo_staz LIKE '%P%' ORDER BY dist ASC LIMIT 20;";
        }
	else {
		$staz_table .= "<p><b>Elenco delle prime 20 stazioni meteorologiche entro un raggio di 25km dall'area:</b></p>";
		$query2 = "SELECT a.codice_stazione, round(a.quota_stazione) as quota, a.denominazione, round((ST_Distance(a.the_geom, b.the_geom)/1000)::numeric,1) as dist from dati_di_base.rete_meteoidrografica a, dati_di_base.areametropolitana b WHERE ST_Distance(a.the_geom, b.the_geom) <= 25000 AND b.gid = $gid AND a.tipo_staz LIKE '%P%' ORDER BY dist ASC LIMIT 20;";
	}

	$result2 = pg_query($conn,$query2);
	if (!$result2) {
		$staz_table .= "Error on the query <br>";
        }
        else {
		$numrows2 = pg_numrows($result2);
			
		$staz_table .= "<table border='1' cellspacing='0' cellpadding='5'>";
		$staz_table .= "<tr><th align=center>Nome stazione meteo:</th><th align=center>Quota:<br/>[m slm]</th><th align=center>Distanza:<br/>[km]</th></tr>";
			
		for ($j=0; $j < $numrows2 ; $j++) {
			$DataArr2 = pg_fetch_row($result2, $j);
			
			$staz_table .= "<tr><td><a href='".$root_dir_html."/common/scripts/plot_rete.php?root_dir_html=".$root_dir_html."&id_parametro=PLUV&cod_staz=$DataArr2[0]' target='_blank' onclick='window.open(this.href, 'Pluviometro', 'width=645,height=485,top=10,left=200');return false;'>";
			//Vecchi grafici statici:
			//$staz_table .= "<tr><td><a href='http://webgis.arpa.piemonte.it/grafici/PLUV/PLUV$DataArr2[0].png' target='_blank' onclick='window.open(this.href, 'Pluviometro', 'width=645,height=485,top=10,left=200');return false;'>";
			$staz_table .= "<b>$DataArr2[2]</b></td><td align=center>$DataArr2[1]</td><td align=center>$DataArr2[3]</td></tr>";

		} // For
        $staz_table .= "</table>";
		
        } // Query2

} // Connection
pg_close($conn);

$data_table .= "</div>";
$data2_table .= "</div>";
$staz_table .= "</div>";

?>

<script>

//Inizializzo alcune varibaili per i grafici:
var graph_data10m, graph_data20m, graph_data30m, graph_data60m; //inizializzazione data array per i grafici
var min_range_y, tick_interval_y, min_y, max_y, plot_subtitle;

$(function() {

graph_data10m = <?php echo json_encode($data_array10m); ?>;
graph_data20m = <?php echo json_encode($data_array20m); ?>;
graph_data30m = <?php echo json_encode($data_array30m); ?>;
graph_data60m = <?php echo json_encode($data_array60m); ?>;
var comune = '<?php echo $comune; ?>';
var sogliad10mt2 = '<?php echo $sogliad10mt2; ?>';
var sogliad10mt10 = '<?php echo $sogliad10mt10; ?>';
var sogliad20mt2 = '<?php echo $sogliad20mt2; ?>';
var sogliad20mt10 = '<?php echo $sogliad20mt10; ?>';
var sogliad30mt2 = '<?php echo $sogliad30mt2; ?>';
var sogliad30mt10 = '<?php echo $sogliad30mt10; ?>';
var sogliad1ht2 = '<?php echo $sogliad1ht2; ?>';
var sogliad1ht10 = '<?php echo $sogliad1ht10; ?>';
var max_y = sogliad1ht10;

var serie10m = [];
serie10m['array'] = <?php echo json_encode($data_array10m); ?>;
serie10m['soglia2y'] = '<?php echo $sogliad10mt2; ?>';
serie10m['soglia10y'] = '<?php echo $sogliad10mt10; ?>';
serie10m['soglia2y_label'] = 'Soglia pioggia 10min-Tr 2anni';
serie10m['soglia10y_label'] = 'Soglia pioggia 10min-Tr 10anni';
console.log(serie10m['array']);
var serie20m = [];
serie20m['array'] = <?php echo json_encode($data_array20m); ?>;
serie20m['soglia2y'] = '<?php echo $sogliad20mt2; ?>';
serie20m['soglia10y'] = '<?php echo $sogliad20mt10; ?>';
serie20m['soglia2y_label'] = 'Soglia pioggia 20min-Tr 2anni';
serie20m['soglia10y_label'] = 'Soglia pioggia 20min-Tr 10anni';
var serie30m = [];
serie30m['array'] = <?php echo json_encode($data_array30m); ?>;
serie30m['soglia2y'] = '<?php echo $sogliad30mt2; ?>';
serie30m['soglia10y'] = '<?php echo $sogliad30mt10; ?>';
serie30m['soglia2y_label'] = 'Soglia pioggia 30min-Tr 2anni';
serie30m['soglia10y_label'] = 'Soglia pioggia 30min-Tr 10anni';
var serie60m = [];
serie60m['array'] = <?php echo json_encode($data_array60m); ?>;
serie60m['soglia2y'] = '<?php echo $sogliad1ht2; ?>';
serie60m['soglia10y'] = '<?php echo $sogliad1ht10; ?>';
serie60m['soglia2y_label'] = 'Soglia pioggia 1h-Tr 2anni';
serie60m['soglia10y_label'] = 'Soglia pioggia 1h-Tr 10anni';

//Grafico Highcharts costruito sfruttando una funzione che richiama TABS e array da plottare:
//$('#tabs-1').highcharts({
function build_graph(nome_tab, prima_serie, legend1, seconda_serie, legend2) {
console.log(prima_serie['array']);
    $(nome_tab).highcharts({
        chart: {
	    width: $(nome_tab).width(),
            type: 'line',
                plotBackgroundColor: {
                        linearGradient: { x1: 1, y1: 0, x2: 1, y2: 1 },
                        stops: [
                        [0, 'rgb(255, 255, 255)'],
                        [1, 'rgb(200, 200, 255)']
                        ]
                }
        },
	credits: {text: 'Arpa Piemonte', href: 'http://webgis.arpa.piemonte.it'},
        title: {text: 'Eventi precipitativi significativi ultimi 5 giorni'},
	subtitle: {text: 'Comune di '+comune},
	legend: {
                enabled: true,
                align: 'center',
                //backgroundColor: '#FCFFC5',
		borderColor: 'black',
                borderWidth: 1,
                layout: 'vertical',
                verticalAlign: 'top',
                y: 240, x: -270,
                floating: true,
                shadow: true
        },
        xAxis: {
                type: 'datetime',
                gridLineWidth: 1
                ,title: {
                        text: 'Data e ora del superamento (UTC)'
                }
                ,labels: {
                        formatter: function() {
                        return Highcharts.dateFormat('%d/%m/%y', this.value) + '<br />' + Highcharts.dateFormat('%H:%M', this.value);
                        }
                }
        },
        yAxis: {
		minRange: min_range_y,
                tickInterval: tick_interval_y,
                min: min_y,
                //max: max_y,
		max: seconda_serie['soglia10y'],
            title: {
                text: 'Precipitazione stimata [mm]*'
            },
            lineWidth: 2,
            plotLines: [
                {
                color: 'blue', // Color value
                //value: sogliad10mt2,
                //,label: {text: 'Soglia pioggia 10min-Tr 2anni'}
		value: prima_serie['soglia2y']
		,label: {text: prima_serie['soglia2y_label']}
                ,dashStyle: 'Dot', width: 3, zIndex: 2
                },
                {
                color: 'blue', // Color value
                //value: sogliad10mt10,
                //,label: {text: 'Soglia pioggia 10min-Tr 10anni'}
		value: prima_serie['soglia10y']
		,label: {text: prima_serie['soglia10y_label']}
                ,dashStyle: 'Dash', width: 3, zIndex: 2
                },
	/*
		{
                color: 'aqua', // Color value
                value: sogliad20mt2, width: 3, zIndex: 2
                ,label: {text: 'Soglia pioggia 10min-Tr 10anni'}
                },
                {
                color: 'aqua', // Color value
                value: sogliad20mt10, width: 3, zIndex: 2
                ,label: {text: 'Soglia pioggia 10min-Tr 10anni'}
                },
                {
                color: 'green', // Color value
                value: sogliad30mt2, width: 3, zIndex: 2
                ,label: {text: 'Soglia pioggia 10min-Tr 10anni'}
                },
                {
                color: 'green', // Color value
                value: sogliad30mt10, width: 3, zIndex: 2
                ,label: {text: 'Soglia pioggia 10min-Tr 10anni'}
                },
	*/
                {
                color: 'lime', // Color value
                //value: sogliad1ht2,
                //,label: {text: 'Soglia pioggia 1h-Tr 2anni'}
		value: seconda_serie['soglia2y']
                ,label: {text: seconda_serie['soglia2y_label']}
		,dashStyle: 'Dot', width: 3, zIndex: 2
                },
                {
                color: 'lime', // Color value
                //value: sogliad1ht10,
                //,label: {text: 'Soglia pioggia 1h-Tr 10anni'}
		value: seconda_serie['soglia10y']
                ,label: {text: seconda_serie['soglia10y_label']}
		,dashStyle: 'Dash', width: 3, zIndex: 2
                },
            ]
        },
        series: [
          {name: legend1,
            showInLegend: true,
            data: prima_serie['array'],
            color: 'blue',
	    step: 'right',
            shadow : true
		//,threshold: sogliad10mt2
		//,negativeColor: 'blue'
        }
	, {name: legend2,
            showInLegend: true,
            data: seconda_serie['array'],
	    step: 'right',
            color: 'aqua',
            shadow : true
        }
	/*, {name: '30m',
            showInLegend: true,
            data: graph_data30m,
            color: 'green',
	    step: 'right',
            shadow : true
        }
	, {name: '1h',
            showInLegend: true,
            data: graph_data60m,
	    step: 'right',
            color: 'lime',
            shadow : true
        }*/
        ],
        tooltip: {
		shared: true,
                formatter: function() {
                        return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + 'mm';
                }
        }
    });

//Reference for timelabel: http://stackoverflow.com/questions/7101464/how-to-get-highcharts-dates-in-the-x-axis

} //fine funzione build_graph

//Creo i grafici per i TAB:
$(document).ready(function() {

//Creiamo subito il primo grafico:
build_graph('#tabs-1', graph_data10m, '10m', graph_data20m, '20m');
    // Tab initialization
    $('#tabs').tabs({
        activate: function(event, ui){
            var tabNumber = ui.newTab.index();
            var tabName = $(ui.newTab).text();
            //console.log('Tab number ' + tabNumber + ' - ' + tabName + ' - clicked');
	    var tabID = ui.newPanel.attr('id');
	    //if (tabID=='tabs-1') build_graph('#tabs-1', graph_data10m, '10m', graph_data20m, '20m');
	    //else if (tabID=='tabs-1b') build_graph('#tabs-1b', graph_data30m, '30m', graph_data60m, '1h');
	    if (tabID=='tabs-1') {console.log(serie10m['array']); build_graph('#tabs-1', serie10m, '10m', serie20m, '20m');}
            else if (tabID=='tabs-1b') build_graph('#tabs-1b', serie30m, '30m', serie60m, '1h');
        }
    });

});

//fine della pova con Highcharts
});

</script>

</head>

<body>

<?php
  print "<div id='generale'>";
  print $dati_generali;
  print "</div><div id='tabs'>";
  print $tab_title;
  print $data_table;
  print $data2_table;
  print $staz_table;

?>

</body>
</html>
