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
Plotto dei grafici per visualizzare i superamenti dei bacini defense.
Richiama con $.ajax uno script php che scarica i dati da DB e li fornisce nella forma:
[date, values]
In modo da poter essere plottati.
Lo script e' pensato in maniera tale da poter essere richiamato da altre pagine.

*/

date_default_timezone_set('UTC');

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

//Recupero alcune info dall'URL del popup.js:
$id_bacino = $_GET['bacino'];
//$gid = $_GET['gid'];
$data_array = array(); //variabile array dove stoccare i dati per la costruzione del grafico

//Queste 3 query danno gli stessi risultati, ma quale sara' la piu' efficiente?
//$query = "SELECT id_conoide,data,valore,media,nome,gruppo,prov,comune,mesobacino,macrobacino,area,processo_principale,soglia1,soglia2,soglia3,gruppo_sigla,gruppo_descr FROM realtime.v_cumulata_bacini WHERE data >= (SELECT (dataora - '48 hours'::interval) FROM realtime.v_defense_last WHERE gid = $gid) AND id_conoide = $id_bacino ORDER BY data ASC;";
//$query = "select data, media, soglia2, soglia3 from realtime.v_cumulata_bacini where id_conoide = $id_bacino AND data >= (now() - '7 days'::interval) ORDER BY data ASC;";
$query = "SELECT a.data, a.media, b.soglia2, b.soglia3 FROM realtime.cumulata_bacini a, dati_di_base.bacini_defense_soglie b, dati_di_base.bacini_defense c WHERE a.id_conoide = $id_bacino AND a.id_conoide = c.id_bacino AND a.data >= (now() - '7 days'::interval) AND c.gruppo = b.gruppo AND attivo=1 ORDER BY a.data ASC;";

$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	$result = pg_query($conn,$query);
        if (!$result) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result);
		$bacino = pg_fetch_row($result, 0); //prendo il primo record
                $soglia2 = $bacino[2]; //valore di soglia 2
                $soglia3 = $bacino[3]; //valore di soglia 3
		//Recupero tutti i dati in un array da passare poi per costruire il grafico:
                while($row = pg_fetch_array($result)) {
                        $data_array[] = array(strtotime($row[0])*1000, floatval($row[1]));
                }
	} //ok query
} //ok connection
pg_close($conn);

if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>

<title>Plot grafico </title>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
//Proviamo Highcharts:
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/highcharts.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/modules/exporting.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/js_functions.js"></script>';
echo $script_js1st;
?>

<script>

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
var id_bacino = parseInt(gup("bacino"));
var graph_data; //inizializzazione data array per i grafici

/*
//in realta' questa chiamata ajax non la farei essendo gia' in un php...
//Recupero i dati connettendomi al DB:
$.ajax({
        url: '/common/scripts/extract_dbdata_plot.php',
        type: "post",
        async: false, //cosi' le variabili espresse qui posso usarle anche fuori
//Regole query: campo data deve essere di tipo date o timestamp; il campo valori deve essere numerico.
//La posizione deve essere per prima la data, per secondo i valori:
        data: {inputs: id_bacino, query: "select data, media, valore from realtime.cumulata_bacini_2012 where id_conoide = $$$ AND data >= (now() - '14 days'::interval) ORDER BY data ASC;" },
      dataType: 'json',
      success: function(data)
      {
            graph_data = data;
            //alert(JSON.stringify(graph_data));
      }
});
*/


$(function() {

graph_data = <?php echo json_encode($data_array); ?>;
var soglia2 = '<?php echo $soglia2; ?>';
var soglia3 = '<?php echo $soglia3; ?>';
var lowest  = Math.min.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
if (soglia2) min_y = Math.min(lowest, soglia2);
else if (soglia3) min_y = Math.min(lowest, soglia3);
else min_y = lowest;
console.log("Soglia 2="+soglia2);

//proviamo Highcharts:
$('#container').highcharts({
        chart: {
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
        title: {
            text: 'Eventi precipitativi significativi ultimi 7 giorni - ultime 48 ore'
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
            title: {
                text: 'Precipitazione stimata [mm]*'
            },
	    min: min_y,
            lineWidth: 2,
            plotLines: [
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
            ]
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
            {name: 'Bacini',
            showInLegend: false,
            data: graph_data,
            color: 'blue',
            shadow : true
        }
        ],
        tooltip: {
                formatter: function() {
                        return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + 'mm';
                }
        }
    });

//Reference for timelabel: http://stackoverflow.com/questions/7101464/how-to-get-highcharts-dates-in-the-x-axis
//fine della pova con Highcharts
});

</script>

</head>

<body>

<div id="container" style="width:100%; height:400px;"></div>

</body>
</html>

