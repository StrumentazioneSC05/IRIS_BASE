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

if (isset($_GET["type"])) {$type = $_GET["type"];}
else $type = "upload";
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];

//Per accedere a questo script anche da altre pagine, e riotrnare alla pagina d'origine, inserisco questa variabile solo nel caso in cui questo upload non venga eseguito dalla barra di default del webgis:
if (isset($_POST['origine'])) $origine = 1;

$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        die();
}

$tables = array();

if ($type == 'upload') {

$stabilimento = array();
	$query = "SELECT id_stabilimento, nome_stabilimento || '  #' || id_stabilimento FROM ri0307.v_stabilimenti_rir_piemonte_completo ORDER BY nome_stabilimento;";
	$result = pg_query($conn,$query);
	if (!$result) {
		echo "Error on the query <br>";
	}
	else {
		$numrows = pg_numrows($result);
		for ($j=0; $j < $numrows ; $j++) {
			$DataArr = pg_fetch_row($result, $j);
			$stabilimento[$DataArr[0]] = $DataArr[1];
		}
	} //fine dell'else della query

} //fine dell'IF se la finestra e' di UPLOAD

else if ($type == 'download') {
	//$query = "SELECT table_name FROM information_schema.tables WHERE table_schema='ri0307' AND table_type='BASE TABLE' ORDER BY table_name;";
	//VENGONO ELENCATE SOLO LE TABELLE CHE L'UTENTE WEBGIS PUO' VEDERE!
	$query = "SELECT a.table_name, coalesce(b.f_geometry_column, '0') FROM information_schema.tables a LEFT JOIN public.geometry_columns b ON a.table_name = b.f_table_name WHERE a.table_schema='ri0307' ORDER BY a.table_name;";
	$result = pg_query($conn,$query);
        if (!$result) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result);
                for ($j=0; $j < $numrows ; $j++) {
                        $DataArr = pg_fetch_row($result, $j);
                        $tables[$DataArr[0]] = $DataArr[1];
                }
        } //fine dell'else della query per i nomi delle tabelle

} //fine dell'ELSEIF se la finestra e' di DOWNLOAD

pg_close($conn);

?>

<html>
<head>

<title>Upload documentazione su RS</title>

<?php
$jquery_js = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.min.js"></script>';
echo $jquery_js;
?>

<script language="Javascript">
var root_dir_html = "<?php echo $root_dir_html; ?>";

function checkFileSize() {
	var max =  4.288; // 4MB
	var node = document.getElementById('file');
	var dim = node.files[0].size / 1000000;
	//alert('fileSize = '+ node.files[0].size + 'oppure ' + dim);
	if (node.files && dim > max) {
		alert("File troppo grande (" + Math.round(dim) + "MB) .La misura max consentita e' " + max + "MB"); // Do your thing to handle the error.
		node.value = null; // Clear the field.
	}
}

function checkValueStab(id_stab) {
	if (id_stab == 0) document.getElementById("B1").disabled = true;
	else document.getElementById("B1").disabled = false; 
}

function table_choice(table_name) {
	var jArray= <?php echo json_encode($tables); ?>;
	if (jArray[table_name]=='the_geom') {
	document.getElementById("shp").disabled=false;
	document.getElementById("txt").disabled=true;
	document.getElementById("shp").checked=true;
	document.getElementById("btn_dwl").disabled=false;
	}
	else {
	document.getElementById("shp").disabled=true;
	document.getElementById("txt").disabled=false;
	document.getElementById("txt").checked=true;
	document.getElementById("btn_dwl").disabled=false;
	}
}

function download_csv() {
	var table = document.getElementById('table').value;
	var separatore = document.getElementById('separatore').value;

	var output = document.getElementsByName('output');
	var output_value;
	for(var i = 0; i < output.length; i++){
		if(output[i].checked){
        	output_value = output[i].value;
    		}
	}

	//var output = document.getElementById('output').value;

        $.ajax ({
        type: "POST",
        url: "upload_doc2.php",
        data: {type:"download", table:table, separatore:separatore, output:output_value, root_dir_html:root_dir_html}, //optional
        success: function( result ) {
            //do something after you receive the result
                //alert(result);
		if (output_value=='txt') var file2download = table+".csv";
		else if (output_value=='shape') var file2download = table+".zip";
		window.open(root_dir_html+"/common/DATA/rir/scambio/"+file2download);
        }
});
}

function update_pie() {
        $.ajax ({
        type: "POST",
        url: "upload_doc2.php",
        data: {type:"update_pie", root_dir_html:root_dir_html}, //optional
        success: function( result ) {
            //do something after you receive the result
                //alert(result);
                window.open(root_dir_html+"/common/DATA/rir/plot_pie-rir.png");
        }
	//,error: alert("qualcosa non ha funzionato: riprovare o contattare l'amministratore del sistema")
	});
}

</script>

</head>
<body>

<?php

if ($type == 'download') {

?>

<div style='font-family: Helvetica;'>
        <center>

        <p style='font-weight:bold;font-size:20px;text-decoration:underline;'> Download dati dal server:</p>

	<table><tr>
        <th>Tablename:</th> <th>Separatore:</th> <th>Output:</th>
        </tr>
        <tr>
        <td>
        <select name="table" id="table" onchange="table_choice(this.value)">
	<option value=''> Scegli una tabella </option>
<?php
foreach ($tables as $key => $value) {
?>
<option value='<?php echo $key;?>'> <?php echo $key;?> </option>
<?php
}
?>
        </select>
        </td>
	<td style='text-align:center;'>
	<select name="separatore" id="separatore">
	<option value=';'> ; </option>
	<option value=','> , </option>
	<option value='|'> | </option>
	</select></td>
	<td><input type="radio" name="output" value="txt" id='txt' disabled >.csv<input type="radio" name="output" value="shape" id='shp' disabled >.shp</td>
        </tr>
        </table>

<br />
<input type="button" onClick="download_csv()" id="btn_dwl" VALUE="Download csv shp" disabled />
<br />

<?php
//Recuperiamo informazioni sul grafico pdf creato tramite la funzione plr su DB 'r_plotpie_stab':
$file_pie = "/var/www/html/common/DATA/rir/plot_pie-rir.png";
$file_pie_html = $root_dir_html."/common/DATA/rir/plot_pie-rir.png";
$date_pie = date("d/m/Y H:i", filectime($file_pie));
?>
<p>
<a href='<?php echo $file_pie_html; ?>' target='_blank'> Grafico Stato Ambiente - ultimo aggiornamento <?php echo $date_pie; ?> - download </a>
<br/>
<input type="button" onClick="update_pie()" id="btn_upd" VALUE="Aggiorna il grafico" />
<br/><span style='font-size:12px;font-style:italic;'> ATTENZIONE! L'aggiornamento del grafico potrebbe richiere qualche minuto </span>
</p>

<?php
} //fine dell'IF se la finestra e' di tipo DOWNLOAD

else { //inizio del body html se la finestra e' di UPLOAD:

//Per accedere a questo script anche da altre pagine, e riotrnare alla pagina d'origine, inserisco questa variabile solo nel caso in cui questo upload non venga eseguito dalla barra di default del webgis:
if (isset($_GET['origine'])) {
?>

<form enctype="multipart/form-data" name="report" action="upload_doc2.php?origine=1&root_dir_html=<?php echo $root_dir_html; ?>" method="POST">

<?php
}
else { //se si lancia la finestra di upload dall'icona di default sulla barra:
?>

<form enctype="multipart/form-data" name="report" action="upload_doc2.php?root_dir_html=<?php echo $root_dir_html; ?>" method="POST">

<?php
}
?>

<input type="hidden" size="20" name="type" id="type" value="upload" />

<div style='font-family: Helvetica;'>
	<center>
	
	<p style='font-weight:bold;font-size:20px;text-decoration:underline;'> Upload documentazione sul server:</p>
	
	<table><tr>
	<th>Stabilimento:</th> <th>Titolo documento (max 64 caratteri):</th>
	</tr>
	<tr>
	<td>
	<select name="stabilimento" id="stabilimento" onchange="checkValueStab(this.value);">
	<option value='0'> -- Scegli uno stabilimento -- </option>
<?php
foreach ($stabilimento as $key => $value) {
?>
<option value='<?php echo $key;?>'> <?php echo $value;?> </option>
<?php
}
?>
	</select>
	</td>
	<td><input type="text" size="45" name="title" id="title" /></td>
	</tr>
	</table>
	
	</br>
	<b><font size=+1>Carica documento (max 4MB):</font></b></br>
	<label for="file">Filename:</label>
	<input type="file" name="file" id="file" onchange="checkFileSize();" ><br>
	
	</br>
	<input type="reset" value="Cancella" />
	<input type="submit" value="OK" name="B1" id="B1" disabled />

	</center>
</div>
</form>

<?php
if (isset($_GET['id_stab'])) {
    $id_stab = $_GET['id_stab'];
?>
<script>
$("#stabilimento").val(<?php echo $id_stab; ?>);
document.getElementById("B1").disabled = false;
</script>
<?php
} //fine dell'IF se passo l'ID-STAB proveniendo magari da un'altra finestra

} //fine dell'ELSE se la finestra e' di tipo UPLOAD
?>
</body>
</html>
