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
$id_bacino = $_GET['bacino'];
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
/*
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
*/

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
#tabs-1, #tabs-2 {overflow-y:scroll; height:98%;}
/*Aggiungo una modifica per Mozilla perche' non fa vedere la scroll bar in quanto vuole i "px" e non le "%":*/
/*Fonte: http://perishablepress.com/css-hacks-for-different-versions-of-firefox/ */
@-moz-document url-prefix() { #tabs-1, #tabs-2 {overflow-y:scroll; height:500px;} } 
</style>

</head>

<body>


<?php

$data_array = array(); //variabile array dove stoccare i dati per la costruzione del grafico

$dati_generali = "";
$data_table = "<div id='tabs-1'>";
$staz_table = "<div id='tabs-2'>";

$tab_title = "<ul><li><a href='#tabs-1'>Tabella superamenti</a></li><li><a href='#tabs-2'>Stazioni vicine</a></li></ul>";

$conn = pg_connect($conn_string);

if (!$conn) { // Check if valid connection
	$dati_generali .= "Error Connecting to database <br>";
	exit;
}
else {
        // Valid connection, we can go on to retrieve some data
	if ($layer == "bacini") {
	        $query = "SELECT id_conoide,data,valore,media,nome,gruppo,prov,comune,mesobacino,macrobacino,area,processo_principale,soglia1,soglia2,soglia3,gruppo_sigla,gruppo_descr FROM realtime.v_cumulata_bacini WHERE data >= (SELECT (dataora - '48 hours'::interval) FROM realtime.v_defense_last WHERE gid = $gid) AND id_conoide = $id_bacino ORDER BY data ASC;";
	}
	else {
		$query = "SELECT data,valore,round(10*media)/10.,comune,regione,provincia,pop_2001,warning_class,soglia1,soglia2,soglia3 FROM realtime.v_cumulata_comuni WHERE data >= (SELECT (data - '48 hours'::interval) FROM realtime.v_comuni_last WHERE gid = $gid) AND gid_comune = $id_bacino ORDER BY data DESC;";
	}

        $result = pg_query($conn,$query);
        if (!$result) {
                $data_table .= "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result);

		$bacino = pg_fetch_row($result, 0); //prendo il primo record

		if ($layer == "bacini") {
                //ELENCHIAMO ALCUNE CARATTERISTICHE COMUNI DEL BACINO:
                $soglia2 = $bacino[13]; //valore di soglia 2
                $soglia3 = $bacino[14]; //valore di soglia 3

                $dati_generali .= "<table id='tab_generale'>";
                $dati_generali .= "<tr><td><b>Nome del bacino (Id):</b></td><td><b>$bacino[4] ($bacino[0])</b></td></tr>";
                $dati_generali .= "<tr><td><b>Gruppo del bacino:</b></td><td>$bacino[5] - $bacino[15] ($bacino[16])</td></tr>";
                $dati_generali .= "<tr><td><b>Comune e provincia:</b></td><td>$bacino[7] - $bacino[6]</td></tr>";
                $dati_generali .= "<tr><td><b>Processo atteso:</b></td><td><b>$bacino[11]</b></td></tr>";
                $dati_generali .= "<tr><td><b>Area [km2]:</td></b><td>$bacino[10]</td></tr>";
                $dati_generali .= "<tr><td><b>Mesobacino di appartenenza:</b></td><td>$bacino[8]</td></tr>";
                $dati_generali .= "<tr><td><b>Macrobacino di appartenenza:</b></td><td>$bacino[9]</td></tr>";
                $dati_generali .= "</table>";

		//$data_table .= '<div id="container" style="width:100%; height:400px;"></div>';
		$data_table .= "<iframe width='100%' height=450px src='".$root_dir_html."/common/scripts/plot_defense.php?bacino=$id_bacino&root_dir_html=$root_dir_html' seamless></iframe>";

                $data_table .= "<p><font style='background-color:yellow;'>Soglia di avvicinamento:</font> media probabilita' di occorrenza del fenomeno<br/>";
                $data_table .= "<font style='background-color:#FF4500;'>Soglia di superamento:</font> alta probabilita' di occorrenza del fenomeno</p>";

		//Recupero tutti i dati in un array da passare poi per costruire il grafico:
		while($row = pg_fetch_array($result)) {
                        $data_array[] = array(strtotime($row[1])*1000, floatval($row[3]));
                }

		} //if layer == bacini

		else {
		//ELENCHIAMO ALCUNE CARATTERISTICHE COMUNI DEL COMUNE:
		$soglia2 = $bacino[9]; //valore di soglia 2
                $soglia3 = $bacino[10]; //valore di soglia 3

		$dati_generali .= "<table>";
                $dati_generali .= "<tr><td><b>Comune:</b></td><td><b>$bacino[3]</b></td></tr>";
                $dati_generali .= "<tr><td><b>Provincia:</b></td><td>$bacino[5]</td></tr>";
                $dati_generali .= "<tr><td><b>Regione:</b></td><td>$bacino[4]</td></tr>";
                $dati_generali .= "<tr><td><b>Popolazione (ISTAT 2001):</b></td><td>$bacino[6]</td></tr>";
                $dati_generali .= "</table>";

		$data_table .= "<p><b>Superamenti dei valori di <font style='background-color:yellow;'>PRE-SOGLIA</font> e di <font style='background-color:#FF4500;'>SOGLIA</font> nelle 48 ore precedenti, in ordine dal piu' recente:</b></p>";

                $data_table .= "<table border='1' cellspacing='1' cellpadding='1'>";
                $data_table .= "<tr><th align=center>Data-ora ultimo superamento:<br/>(UTC)</th><th align=center>Precipitazione stimata*<br/>[mm/h]:</th><th align=center>Superamento di pre-soglia:<br/>[mm/h]</th><th align=center>Superamento di soglia:<br/>[mm/h]</th></tr>";
		} //if layer == comuni

	
                for ($i=0; $i < $numrows ; $i++) {
                        $DataArr = pg_fetch_row($result, $i);

                        //Cambio il colore di background della riga in base al valore di pioggia:
                        $color = 'yellow';

			if ($layer == "bacini") {
			}
			else {
			//Cambio il colore di background della riga in base al valore di pioggia:
                        if ($DataArr[2] >= $soglia3) {$color = '#FF4500';}
			$data_table .= "<tr style='background-color:$color;'><td align=center>$DataArr[0]</td><td align=center>$DataArr[2]</td><td align=center>$DataArr[9]</td><td align=center>$DataArr[10]</td></tr>";
			}
                } // For
       
	$data_table .= "</table>";
        $data_table .= "<p>* Pioggia cumulata sull'ora precedente.</p>";

        } // Query	

	//$data_table .= "<hr />";

	//Adesso estrapolo le stazioni piu' vicine all'elemento che interessa:
	if ($layer == "bacini") {
		$staz_table .= "<p><b>Elenco delle stazioni meteorologiche entro un raggio di 25km dal bacino:</b></p>";
		$query2 = "SELECT a.codice_stazione, round(a.quota_stazione) as quota, a.denominazione, round((ST_Distance(ST_Transform(a.the_geom,32632), b.the_geom)/1000)::numeric,1) as dist from dati_di_base.rete_meteoidrografica a, dati_di_base.bacini_defense b WHERE ST_Distance(ST_Transform(a.the_geom,32632), b.the_geom) <= 25000 AND b.id_bacino = $id_bacino AND a.tipo_staz LIKE '%P%' ORDER BY dist;";
        }
	else {
		$staz_table .= "<p><b>Elenco delle stazioni meteorologiche entro un raggio di 25km dal comune:</b></p>";
		$query2 = "SELECT a.codice_stazione, round(a.quota_stazione) as quota, a.denominazione, round((ST_Distance(ST_Transform(a.the_geom, 32632), b.the_geom)/1000)::numeric,1) as dist from dati_di_base.rete_meteoidrografica a, dati_di_base.limiti_amministrativi b WHERE ST_Distance(ST_Transform(a.the_geom, 32632), b.the_geom) <= 25000 AND b.gid = $id_bacino AND a.tipo_staz LIKE '%P%' ORDER BY dist;";
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
			
			$staz_table .= "<tr><td><a href='".$root_dir_html."/common/scripts/plot_rete.php?id_parametro=PLUV&cod_staz=$DataArr2[0]&root_dir_html=$root_dir_html' target='_blank' onclick='window.open(this.href, 'Pluviometro', 'width=645,height=485,top=10,left=200');return false;'>";
			//Vecchi grafici statici:
			//$staz_table .= "<tr><td><a href='http://webgis.arpa.piemonte.it/grafici/PLUV/PLUV$DataArr2[0].png' target='_blank' onclick='window.open(this.href, 'Pluviometro', 'width=645,height=485,top=10,left=200');return false;'>";
			$staz_table .= "<b>$DataArr2[2]</b></td><td align=center>$DataArr2[1]</td><td align=center>$DataArr2[3]</td></tr>";

		} // For
        $staz_table .= "</table>";
		
        } // Query2

} // Connection
pg_close($conn);

$data_table .= "</div>";
$staz_table .= "</div>";

  print "<div id='generale'>";
  print $dati_generali;
  print "</div><div id='tabs'>";
  print $tab_title;
  print $data_table;
  print $staz_table;

?>


</body>
</html>
