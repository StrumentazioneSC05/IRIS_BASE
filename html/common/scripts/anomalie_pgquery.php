<?php

$webgis = $_GET['webgis'];

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

$conn = pg_connect($conn_string);

if (!$conn) { // Check if valid connection
	echo "Error Connecting to database <br>";
	exit;
}
else {
        // Valid connection, we can go on to retrieve some data
        $query_aperte = "SELECT * FROM realtime.v_anomalie WHERE data_fine IS NULL;";
	//$query_risolte = "SELECT * FROM realtime.v_anomalie WHERE data_fine >= (now() - '30 days'::interval);";

	// Analizziamo prima le anomalie ancora aperte:
        $result_aperte = pg_query($conn,$query_aperte);
        if (!$result_aperte) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result_aperte);

                echo "<p><b>Anomalie ancora aperte:</b></p>";
                echo "<center><table border='1' cellspacing='1' cellpadding='1'>";
		//Modifico i risultati in base al tipo di webgis:
		if ($webgis == 'pubblico') {
			echo "<tr><th align=center>Data inizio:<br/>(UTC)</th><th align=center>Sistema interessato:</th><th align=center>Descrizione anomalia:</th><th align=center>Data inserimento<br/>(UTC):</th></tr>";
		}
		else {
                	echo "<tr><th align=center>Data inizio:<br/>(UTC)</th><th align=center>Sistema interessato:</th><th align=center>Descrizione anomalia:</th><th align=center>Autore inserimento:</th><th align=center>Data inserimento<br/>(UTC):</th></tr>";
		}
				
                for ($i=0; $i < $numrows ; $i++) {
                        $DataArr = pg_fetch_row($result_aperte, $i);

			//Modifico i risultati in base al tipo di webgis:
			if ($webgis == 'pubblico') {
			echo "<tr><td align=center>$DataArr[2]</td><td align=center>$DataArr[1]</td><td align=center>$DataArr[4]</td><td align=center>$DataArr[6]</td></tr>";
			}
			else {
			//echo "<tr style='background:$col;'><td align=center>$DataArr[2] $DataArr[7] </td><td align=center>$DataArr[1]</td><td align=center>$DataArr[4]</td><td align=center>$DataArr[5]</td><td align=center>$DataArr[6]</td></tr>";
			echo "<tr style='background:$DataArr[10];'><td align=center>$DataArr[2] </td><td align=center>$DataArr[1]</td><td align=center>$DataArr[4]</td><td align=center>$DataArr[5]</td><td align=center>$DataArr[6]</td></tr>";
			}

                } // For
       
	echo "</table></center>";

        } // Query sulle anomalie aperte


	//query per tabella legenda:
	$query_legenda = "SELECT impatto_operativo, array_agg(severita_idx), array_agg(severita_colore) AS colore, array_agg(severita_descr) FROM config.anomalie_severita WHERE severita_idx > 0 GROUP BY impatto_operativo ORDER BY impatto_operativo DESC;";
        $result_legenda = pg_query($conn, $query_legenda);
        if (!$result_legenda) {
                echo "Error on the query <br>";
        }
        else {
	  $numrows_leg = pg_numrows($result_legenda);
	  echo "<br/><center><table style='font-size: 0.8em; font-style: italic;'>";
          echo "<tr><th>Severita</th><th>Lieve</th><th>Moderata</th><th>Grave</th></tr>";
	  
	  while($DataLeg = pg_fetch_array($result_legenda)) {

	    if ($DataLeg['impatto_operativo']=='t') {
		$colore_stringa = str_replace(array( '{', '}' ), '', $DataLeg['colore']);
		$colore_stringa = str_replace(' ', '', $colore_stringa);
		$colore_arr = explode(',', $colore_stringa);
		echo "<tr><td>Anomalie con impatti operativi</td><td style='background:$colore_arr[0];'></td><td style='background:$colore_arr[1];'></td><td style='background:$colore_arr[2];'></td></tr>";
	    }
	    if ($DataLeg['impatto_operativo']=='f') {
                $colore_stringa = str_replace(array( '{', '}' ), '', $DataLeg['colore']);
                $colore_stringa = str_replace(' ', '', $colore_stringa);
                $colore_arr = explode(',', $colore_stringa);
                echo "<tr><td>Anomalie senza impatti operativi</td><td style='background:$colore_arr[0];'></td><td style='background:$colore_arr[1];'></td><td style='background:$colore_arr[2];'></td></tr>";
            }
	  }
	  echo "</table></center>";
	}

	echo "<hr />";


	$query_recenti = "SELECT * FROM realtime.v_anomalie WHERE data_fine >= (now() - '7 days'::interval);";
	$result_recenti = pg_query($conn,$query_recenti);
        if (!$result_recenti) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result_recenti);

                echo "<p><b>Anomalie recenti (risolte negli ultimi 7 giorni):</b></p>";


                echo "<center><table border='1' cellspacing='1' cellpadding='1'>";

                //Modifico i risultati in base al tipo di webgis:
                if ($webgis == 'pubblico') {
                        echo "<tr><th align=center>Data inizio:<br/>(UTC)</th><th align=center>Sistema interessato:</th><th align=center>Descrizione anomalia:</th><th align=center>Data chiusura<br/>(UTC):</th></tr>";
                }
                else {
                        echo "<tr><th align=center>Data inizio:<br/>(UTC)</th><th align=center>Sistema interessato:</th><th align=center>Descrizione anomalia:</th><th align=center>Autore inserimento:</th><th align=center>Data chiusura<br/>(UTC):</th></tr>";
                }

                for ($i=0; $i < $numrows ; $i++) {
                        $DataArr = pg_fetch_row($result_recenti, $i);

                        //Modifico i risultati in base al tipo di webgis:
                        if ($webgis == 'pubblico') {
                        echo "<tr><td align=center>$DataArr[2]</td><td align=center>$DataArr[1]</td><td align=center>$DataArr[4]</td><td align=center>$DataArr[3]</td></tr>";
                        }
                        else {
                        echo "<tr><td align=center>$DataArr[2]</td><td align=center>$DataArr[1]</td><td align=center>$DataArr[4]</td><td align=center>$DataArr[5]</td><td align=center>$DataArr[3]</td></tr>";
                        }

                } // For

        echo "</table></center>";

        } // Query sulle anomalie recenti


} // Connection
pg_close($conn);

?>
