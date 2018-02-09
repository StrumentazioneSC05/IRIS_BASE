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
elseif (!$_POST[richiesta] or $_POST[richiesta]=="") {
        echo "Richiesta obbligatoria!";}
elseif (!$_POST[data_start] or $_POST[data_start]=="") {
        echo "Data di inizio anomalia obbligatoria!";}
else {

$tipo = pg_escape_string($_POST['tipo']);

$data_start = pg_escape_string($_POST['data_start']);
$data_end = pg_escape_string($_POST['data_end']);
$autore = pg_escape_string($_POST['autore']);
$richiesta = pg_escape_string($_POST['richiesta']);
$id_sistema = pg_escape_string($_POST['id_sistema']);

$so = pg_escape_string($_POST['so']);
$webgis = pg_escape_string($_POST['webgis']);

if (!$data_end or $data_end=="") {
	$query = "INSERT INTO realtime.anomalie (data_inizio, id_sistema, autore, descrizione) VALUES ('$data_start', $id_sistema, '$autore', '$richiesta');";
}
else {
	$query = "INSERT INTO realtime.anomalie (data_inizio, data_fine, id_sistema, autore, descrizione) VALUES ('$data_start', '$data_end', $id_sistema, '$autore', '$richiesta');";
}
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
		<input type="button" onClick="location.href='anomalie_edit.php'" value="CHIUDI" />

</body>
</html>
