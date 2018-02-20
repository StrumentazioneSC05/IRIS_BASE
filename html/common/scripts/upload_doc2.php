<?php
//Carico le configurazioni di base da un file esterno:
include_once('config_iris.php');

$conn = pg_connect($conn_string_edit);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        die();
}
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
else $root_dir_html = '';

//Se richiamo questo script con l'opzione download, scarico un csv con i dati degli stabilimenti:
if ($_POST['type']=='download') {
	$table = $_POST["table"];
	$separatore = $_POST["separatore"];
	$output = $_POST["output"];

	if ($output=='txt') {
	$cmd = "psql -h localhost -d radar -U rischioindustriale -c ";
	exec($cmd . "\"\copy ri0307." . $table . " to '/var/www/html/common/DATA/rir/scambio/" . $table . ".csv' with delimiter as '". $separatore . "' csv header\"");
	echo "OK csv";
	}
	else if ($output=='shape') {
	//echo "OK shp";
	$cmd = "pgsql2shp -f /var/www/html/common/DATA/rir/scambio/".$table."_g -h localhost -u rischioindustriale radar 'SELECT * FROM ri0307." . $table . "'";
	exec($cmd);
	$cmd_zip = "zip -j /var/www/html/common/DATA/rir/scambio/".$table.".zip /var/www/html/common/DATA/rir/scambio/".$table."_g.*";
	exec($cmd_zip);
	$cmd_rm = "rm /var/www/html/common/DATA/rir/scambio/".$table."_g.*";
	exec($cmd_rm);
	}
	die();
}
//Se richiamo lo script con l'opzione "update_pie" invece rilancio semplicemente la funzione r_plotpie_stab per ricreare un pdf:
if ($_POST['type']=='update_pie') {
echo "<script>console.log('UPDATE PIE')</script>";
	//$cmd = "psql -h localhost -d radar -U rischioindustriale -c \"select ri0307.r_plotpie_stab();\"";
	//exec($cmd);
	$query_grafico = "SELECT ri0307.r_plotpie_stab_dlg105();";
	$result_grafico = pg_query($conn, $query_grafico);
    if (!$result_grafico) {
        $error_message = "Error on the query grafico";
        pg_close($conn);
        die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."'</script>");
        //echo "<script>console.log('". $error_message ."')</script>";
        //exit;
    }
    else {
	echo "OK grafico aggiornato";
	die();
    }
}

$allowedExts = array("jpg", "jpeg", "gif", "png");


/*
if (
(($_FILES["file"]["type"] == "image/gif")
|| ($_FILES["file"]["type"] == "image/jpeg")
|| ($_FILES["file"]["type"] == "image/png")
|| ($_FILES["file"]["type"] == "image/pjpeg"))
&& ($_FILES["file"]["size"] < 2000000)
&& in_array($extension, $allowedExts)
)

  {
*/

//Per accedere a questo script anche da altre pagine, e riotrnare alla pagina d'origine, inserisco questa variabile solo nel caso in cui questo upload non venga eseguito dalla barra di default del webgis:
if (isset($_GET['origine'])) $origine = 'history.go(-2);'; //cosi ritorno alla pagina che ha lanciato lo script
else $origine = 'document.form1.submit();';

if ( isset($_POST['stabilimento']) && isset($_POST['title']) && ($_POST['title']!='') && ($_FILES["file"]["error"]<=0) ) {
        $title = $_POST['title'];
        $id_stabilimento = $_POST["stabilimento"];
        $extension = end(explode(".", $_FILES["file"]["name"]));

	$filename = basename($_FILES['file']['name']);
    echo "Upload: " . $_FILES["file"]["name"] . "<br>";
    echo "Size: " . round(($_FILES["file"]["size"] / 1024), 0) . " kB<br>";
    //echo "Stored in: " . $_FILES["file"]["tmp_name"];
	
	//Carico il file sul server:
	$target_path = "/var/www/html/common/DATA/rir/";
	//$new_name = date('YmdHis') . "." . $extension;
	$target_path = $target_path . $filename;
	
	//prima controlliamo che il file non esista già sul server e sul DB:
	$query_check = "SELECT count(*) FROM ri0307.documentazione_rir WHERE id_stabilimento=".$id_stabilimento." AND filename='".$filename."';";
	$result_check = pg_query($conn, $query_check);
	$DataArr = pg_fetch_row($result_check, 0);
	if (file_exists($target_path)) {
		echo "<br/><img src='".$root_dir_html."/common/icons/toolbar_icons/warning_yellow-3.png'> Il file esiste gia' sul server! <br/> Rinominare il nuovo file da caricare se si tratta di un nuovo documento, oppure contattare l'amministratore se si vuole rimpiazzare un vecchio file.";
		//die();
	}
	else if ($DataArr[0] > 0) {
		echo "<br/><img src='warning.ico'> La combinazione <i>'id_stabilimento + nome del file'</i> esiste gia' sul database! <br/> Rinominare il nuovo file da caricare se si tratta di un nuovo documento, oppure contattare l'amministratore se si vuole rimpiazzare un vecchio record nella tabella.";
	}
	else {
	if(move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {	
		if (!$conn) { // Check if valid connection
			echo "</br>Error Connecting to database <br>";
			exit;
		}
		else {
			//$query = "INSERT INTO ri0307.documentazione_rir(id_stabilimento, titolo, filename) VALUES (". $id_stabilimento . ", " . $title . ", " . $filename . ");";
			//$result = pg_query($conn, $query);
			//Col metodo "pg_query_params":
			$result = pg_query_params($conn, "INSERT INTO ri0307.documentazione_rir(id_stabilimento, titolo, filename) VALUES ($1, $2, $3)", array($id_stabilimento, $title, $filename));
			if (!$result) {
				echo "</br>Error on the query <br>";
			}
			else {
				echo "</br>The file ".  basename( $_FILES['file']['name']). " has been uploaded";
			}
		} //fine del caricamento del file sul server e sul DB
	}
	else{
		echo "There was an error uploading the file, please try again!";
	}
	} //fine dell'IF-ELSE nel caso il file sia gia' caricato sul server o sul DB	
    } //Fine del controllo sul file stesso

else {
        echo "Errore nel caricamento del file, controllare di aver compilato tutti i campi del form precedente!";
}


/*
  } //IF sul controllo del TYPE di file
else
  {
  echo $_FILES["file"]["type"];
  echo "Invalid file";
  }
*/

?>


<html>
<head>

<title>Upload documentazione su RS</title>

<script language="Javascript">

</script>

</head>
<body>

<form name='form1' action="upload_doc.php?root_dir_html=<?php echo $root_dir_html; ?>">
<input value="OK" type="button" onClick="<?php echo $origine; ?>">
<!-- <input value="OK" type="submit"> -->
</form>

</body>
</html>

