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

$conn = pg_connect($conn_string_edit);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database " . pg_last_error();
        exit;
}

if (!$_POST[autore] or $_POST[autore]=="") {
        echo "Autore obbligatorio!";}
elseif (!$_POST[richiesta] or $_POST[richiesta]=="") {
        echo "Richiesta obbligatoria!";}

else {

$tipo = pg_escape_string($_POST['tipo']);
$autore = pg_escape_string($_POST['autore']);
$richiesta = pg_escape_string($_POST['richiesta']);
$browser = pg_escape_string($_POST['browser']);
$so = pg_escape_string($_POST['so']);
$webgis = pg_escape_string($_POST['webgis']);


$query = "INSERT INTO realtime.webgis_tickets (autore, richiesta, tipo, browser_client, so_client, webgis) VALUES ('$autore','$richiesta','$tipo','$browser','$so', '$webgis')";
$result = pg_query($query);

if (!$result) {
         die("Error in SQL query: " . pg_last_error());
     }

echo "Data successfully inserted!";

} //Fine dell'else che si avvia se i dati obbligatori sono stati inseriti

// free memory
pg_free_result($result);

pg_close($conn);


?>

<html>
<head>
</head>
<body>
		<input type="button" onClick="history.go(-1)" VALUE="Indietro" />
		<input type="button" onClick="location.href='tickets_edit.html'" value="CHIUDI" />

</body>
</html>
