<?php

$gid = $_GET['id'];

$conn_string = "host=localhost port=5432 dbname=sismica user=webgis password=webgis$2013%";
$conn = pg_connect($conn_string);

if (!$conn) { // Check if valid connection
	echo "Error Connecting to database <br>";
	exit;
}
else {
        // Valid connection, we can go on to retrieve some data
        $query_aperte = "SELECT full_date, magnitudo, profondita, regione_geografica, localita, rms, erh, erz  FROM v_catalogo_sismico_last15 WHERE gid = $gid;";

	// Analizziamo prima le anomalie ancora aperte:
        $result_aperte = pg_query($conn,$query_aperte);
        if (!$result_aperte) {
                echo "Error on query <br>";
        }
        else {

		echo "<html>";
		echo "<head>";
		// echo "<link href='table-style.css' rel='stylesheet' type='text/css' >";
		echo "<link href='table-style2.css' rel='stylesheet' type='text/css' >";
		echo "</head>";
		echo "<body>";

		echo "<div class='CSSTableGenerator' >";

/*TABELLA orizzontale:
                $numrows = pg_numrows($result_aperte);
                echo "<table id='table-2'>";
                echo "<tr><td>Ora</br>UTC</td><td>M</td><td>P</br>[km]</td><td>Regione</td><td>Localita'</td><td>rms</td><td>erh</td><td>erz</td></tr>";
                for ($i=0; $i < $numrows ; $i++) {
                        $DataArr = pg_fetch_row($result_aperte, $i);
			echo "<tr><td>$DataArr[0]</td><td>$DataArr[1]</td><td>$DataArr[2]</td><td style='font-size:90%;'>$DataArr[3]</td><td style='font-size:90%;'>$DataArr[4]</td><td>$DataArr[5]</td><td>$DataArr[6]</td><td>$DataArr[7]</td></tr>";

                } // For
	echo "</table>";
*/

//Tabella in verticale:
		echo "<table id='table-2'>";
		$sisma = pg_fetch_array($result_aperte); //posso cosi' riferirmi ai risultati sia con l'indice che con il nome del campo!
		echo "<tr><td>Ora UTC: </td><td>" . $sisma['full_date'] . "</td></tr>";
		echo "<tr><td>Magnitudo: </td><td>" . $sisma['magnitudo'] . "</td></tr>";
		echo "<tr><td>Profondita: </td><td>" . $sisma['profondita'] . " km</td></tr>";
		echo "<tr><td>RMS: </td><td>" . $sisma['rms'] . " ML</td></tr>";
		echo "<tr><td>ERH: </td><td>" . $sisma['erh'] . " km</td></tr>";
                echo "<tr><td>ERZ: </td><td>" . $sisma['erz'] . " km</td></tr>";
                //echo "<tr><td>Regione:</td><td>" . $sisma['regione_geografica'] . "</td></tr>";
                echo "<tr><td>Localita':</td><td>" . $sisma['localita'] . "</td></tr>";
		echo "</table>";

        } // Query sulle anomalie aperte

	echo "<hr />";
	echo "</div>";
	echo "</body>";


} // Connection
pg_close($conn);

?>
