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
$conn = pg_connect($conn_string);

echo "<div style='font-family:arial;'>";

if (!$conn) { // Check if valid connection
	echo "Error Connecting to database <br>";
	exit;
}
else {
        // Valid connection, we can go on to retrieve some data
        $query_aperte = "SELECT * FROM realtime.webgis_tickets WHERE data_chiusura IS NULL ORDER BY data_apertura DESC;";

	// Analizziamo i ticket ancora aperti:
        $result_aperte = pg_query($conn,$query_aperte);
        if (!$result_aperte) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result_aperte);

                echo "<p><b>Ticket aperti:</b></p>";

		if ($numrows < 1) {
		    echo "<p><i>Nessun ticket risulta essere aperto al momento</i></p>";
		} 
		else {
                  echo "<table style='font-size:12px;' border='1' cellspacing='1' cellpadding='1'>";
                  echo "<tr><th align=center>Data ticket:<br/>(UTC)</th><th align=center>Autore:</th><th align=center>Richiesta:</th><th align=center>Tipo della richiesta:</th><th align=center>WebGIS:</th></tr>";

		  for ($i=0; $i < $numrows ; $i++) {
                        $DataArr = pg_fetch_row($result_aperte, $i);

			echo "<tr><td align=center>$DataArr[1]</td><td align=center>$DataArr[2]</td><td align=center>$DataArr[3]</td><td align=center>$DataArr[4]</td><td align=center>$DataArr[8]</td></tr>";

                  } // For
       
		  echo "</table>";
		}

        } // Query sui tickets aperti

	echo "<hr />";


	//Inseriamo un capitolo sugli ultimi Tickets CHIUSI:
	$query_chiuse = "SELECT * FROM realtime.webgis_tickets WHERE data_chiusura IS NOT NULL ORDER BY data_chiusura DESC LIMIT 7;";
	$result_chiuse = pg_query($conn,$query_chiuse);
        if (!$result_chiuse) {
                echo "Error on the query <br>";
        }
        else {
            echo "<p><b>Ultimi ticket chiusi:</b></p>";
            echo "<table style='font-size:12px;' border='1' cellspacing='1' cellpadding='1'>";
            echo "<tr><th align=center>Chiusura ticket:<br/>(UTC)</th><th align=center>Autore:</th><th align=center>Richiesta:</th><th align=center>Nota chiusura:</th></tr>";

	    while($DataArr = pg_fetch_array($result_chiuse)) {
	    //posso cosi' riferirmi ai risultati sia con l'indice che con il nome del campo!
                echo "<tr><td align=center>".$DataArr['data_chiusura']."</td><td align=center>".$DataArr['autore']."</td><td align=center>".$DataArr['richiesta']."</td><td align=center>".$DataArr['note_chiusura']."</td></tr>";
            } // fine While

        echo "</table>";

	} // Query sui tickets chiusi

} // Connection
pg_close($conn);

?>
