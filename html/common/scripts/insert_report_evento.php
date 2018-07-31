<?php
//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

$conn = pg_connect($conn_string_edit);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database " . pg_last_error();
        exit;
}

if (!$_POST[autore] or $_POST[autore]=="") {
        echo "Autore obbligatorio!";}
elseif (!$_POST[data_evento] or $_POST[data_evento]=="") {
        echo "Data evento obbligatoria!";}
elseif (!$_POST[tipo_evento] or $_POST[tipo_evento]=="") {
        echo "Tipo evento obbligatorio!";}
else {


$data_evento = pg_escape_string($_POST['data_evento']);
$localita = pg_escape_string($_POST['localita']);
$raggio = pg_escape_string($_POST['raggio']);
$lat = pg_escape_string($_POST['lat']);
$lon = pg_escape_string($_POST['lon']);
$tipo = pg_escape_string($_POST['tipo_evento']);
$link_news = pg_escape_string($_POST['link_news']);
$note = pg_escape_string($_POST['note']);
$autore = pg_escape_string($_POST['autore']);

$query = "INSERT INTO realtime.report_evento (dataevento, tipo_evento, localita, raggio, lat, lon,  link_news, autore, note) VALUES ('$data_evento', $tipo, '$localita', $raggio, $lat, $lon, '$link_news', '$autore','$note');";

print $query;

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
		<input type="button" value="CHIUDI" onclick="window.close()" />

</body>
</html>
