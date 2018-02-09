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
Pannello per linkare a tutti i servizi WebGIS e alla nuova interfaccia di configurazione dei layers

DA FARE:
- ridimensionare i pulsanti in modo che sia accessibile tramite tablet-smartphone
*/

//Carico le configurazioni di base da un file esterno:
include_once('config_iris.php');

//Recupero dati per i servizi WebGIS disponibili:
$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	$query_webgis = "SELECT * FROM config.webgis_indici ORDER BY webgis_idx;";
    $result_webgis = pg_query($conn, $query_webgis);
    if (!$result_webgis) {
        echo "Error on the query area<br>" . $query_webgis;
        exit;
    }
    else {
		$build_table = '';
		$build_table_deactivate = '';
		$script_admin = '/add_layer_from_db.py';
		$script_service = '/manage_webgis_service_from_db.py';
		//Prendo tutti i risultati della query:
        	$fetch_all_webgis = pg_fetch_all($result_webgis);
		foreach ($fetch_all_webgis as $fetch_webgis) {
		    if ($fetch_webgis['attivo']==1) {
			$build_table .= "<tr><td><a title='" . $fetch_webgis['webgis_description'] .  "'href='" . $root_dir_html . $root_dir_script . '?TYPE=' . $fetch_webgis['webgis_name'] . "' target='_blank' class='classname'>" . $fetch_webgis['webgis_name'] . "</a></br></td>";
			//Elencherei di fianco il pulsante per gestire i layer del servizio:
//devo rimandare subito a questo:
//http://www.arpa.piemonte.gov.it/radar/cgi-bin/add_layer_from_db.py?root_dir_html=/radar&step=2&id_stab=13&nome=%20idrologia%20%20#13
			$build_table .= '<td><a href="' . $root_dir_html . $root_dir_cgi . $script_admin . '?root_dir_html=' . $root_dir_html . '&step=2&id_stab='.$fetch_webgis['webgis_idx'].'&nome='.$fetch_webgis['webgis_name'].'" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;" title="Gestisci i layer da caricare sul servizio">Gestisci layers</a></td>';
			$build_table .= '<td><a href="' . $root_dir_html . '/goaccess_reports/'.$fetch_webgis['webgis_name'].'-report.html" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;" title="Visualizza le statistiche di accesso al servizio">Access Log Stat</a></br></td>';
			$build_table .= '<td style="width:3%;">&nbsp;</td>';
			$build_table .= '<td><a href="' . $root_dir_html . $root_dir_cgi . $script_service . '?root_dir_html=' . $root_dir_html . '&step=2&id_stab='.$fetch_webgis['webgis_idx'].'&nome='.$fetch_webgis['webgis_name'].'" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;border-color:#d71414;" title="Gestisci la toolbar del servizio - IN SVILUPPO!">Gestisci servizio</a></td></tr>';
		    }
		    //Al momento non visualizzo i webgis disattivati, ma posso sempre elencarli a fianco...
		    else $build_table_deactivate .= "<tr><td><a title='" . $fetch_webgis['webgis_description'] .  "'href='" . $root_dir_html . $root_dir_script . '?TYPE=' . $fetch_webgis['webgis_name'] . "' target='_blank' class='classname'>" . $fetch_webgis['webgis_name'] . "</a></br></td></tr>";
		}
	}
}
pg_close($conn);

?>

<html>

<head>
  <link href='button-style.css' rel='stylesheet' type='text/css' >
  
<!-- <link rel="stylesheet" type="text/css" href="desktop.css" media="screen and (min-width: 481px)" /> -->
<!--[if IE]>
<link rel="stylesheet" type="text/css" href="explorer.css" media="all" />
<![endif]-->

<meta name="viewport" content="user-scalable=no, width=device-width" />

<?php
$script_js = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.min.js"></script>';
echo $script_js;
?>

<script language="Javascript">

function get_stagione() {
    //Recupero la stagione attiva richiamando il Python con Ajax così da poter sfruttare il webhosting NetSons:
    /*
	$.ajax({
    type: "GET",
    url: "/cgi-bin/get_stagione.py",
    success: function(response){
        var stagione = response;
        document.getElementById("stagione_attuale").innerHTML = stagione;
    },
    error:function() {console.log("ciccia");}
    });
	*/
}

</script>

<style>
html {
  background: url(<?php echo $root_dir_html; ?>/sfondo_webgis.png) no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: 100% 100%;
}
body {
  background-color:rgba(85, 85, 85, 0.4);
  /*height: 100%;*/
  margin: 0;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
</style>

</head>
        
        
  <body onload="get_stagione();">
        
    <h1 style='font-size: 1em;'>
	</br>
	<!-- PANNELLO GESTIONE SERVIZI WEBGIS IRIS -->
    </h1>

<div style="text-align:center;">
    
          <table class="nav" style="margin: 0px auto;text-align:center;">

	<!-- per il moneto commento questa parte perche' pongo il pulsante di finaco al nome del servizio -->
	  <!--
          <tr><td class='stagione'>
          Configurazione layers: <span id='stagione_attuale'> </span>

		<?php
		//$script_admin = '/add_layer_from_db.py';
		//echo '<a href="' . $root_dir_html . $root_dir_cgi . $script_admin . '?root_dir_html=' . $root_dir_html . '&step=1" class="classname" target="_blank" style="font-size:1em; width:25%;padding:2px 3px;" title="Gestisci i layer da caricare sui servizi">Gestione layers</a></br>';

		?>

             </td></tr>
	  -->

	<!-- per il moneto commento questa parte perche' pongo il pulsante di finaco al nome del servizio -->
	  <!--
          <tr><td class='stagione' style="vertical-align:middle;">
          Configurazione servizi: <span id='stagione_attuale'> </span>

          <?php
                //$script_admin = '/manage_webgis_service_from_db.py';
                //echo '<a href="' . $root_dir_html . $root_dir_cgi . $script_admin . '?root_dir_html=' . $root_dir_html . '&step=1" class="classname" target="_blank" style="font-size:1em; width:25%;padding:2px 3px; border-color:#d71414;" title="IN SVILUPPO!">Gestione servizi</a></br>';
          ?>
	  -->
             
	<!--Elenco servizi disponibili per link al Webgis-->
	  <?php
		echo $build_table;
	  ?>
			 
          </table>
          
</div>
        
    </body>
</html>
