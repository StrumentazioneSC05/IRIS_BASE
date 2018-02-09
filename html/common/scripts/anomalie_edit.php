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

?>

<!DOCTYPE html>
  <head>
    <title>Inserisci anomalie del sistema radar-meteo </title>
	
<script language="JavaScript" src="js_functions.js"></script>
<script language="JavaScript" src="datepick/ts_picker.js"></script>

<script language="Javascript">

var mm, dd, hh, min, sec;

<?php

//database access information
$conn = pg_connect($conn_string);
if (!$conn) // Check if valid connection
{
        echo "Error Connecting to database " . pg_last_error();
        exit;
}

?>

function AddToOptionList(OptionList, OptionValue, OptionText) {
// Add option to the bottom of the list
OptionList[OptionList.length] = new Option(OptionText, OptionValue);
}

function pop_sistemi() {

<?php
$query = "SELECT id_sistema, descrizione FROM config.anomalie_sistemi;";
$result = pg_query($conn,$query);
        if (!$result) {
                echo "Error on the query.";
        }
$rows = pg_num_rows($result);

while ($myrow = pg_fetch_row($result)) {

?>

AddToOptionList(document.anomalia.id_sistema, "<?php echo $myrow[0]; ?>", "<?php echo $myrow[1]; ?>");

<?php

} //fine del while

// free memory
pg_free_result($result);
pg_close($conn);


?>

} //fine della funzione pop_sistemi


</script>


  </head>

	<body onload="pop_sistemi();">

<form name=anomalia action="anomalie_edit2.php" method="POST">

	<div style="text-align:center; font-family:arial; font-size:12px;">

	<p><b><font size=+1>Segnalazione di un'anomalia sui sistemi radar-meteo:</font></b><br/>
	
	<center>
	<table style="text-align:center;align:center;">

	<tr>
        <th> Data inizio:<br/>(yyyy-mm-dd hh24:mi:ss)</th>
        <th>   </th>
        <th> Data fine:<br/>(yyyy-mm-dd hh24:mi:ss)</th>
	<th>   </th>
        </tr>
        <tr>
        <td> <input type="text" size="15" value="" name=data_start /> </td>
	<td>
        <a href="javascript:show_calendar('document.anomalia.data_start', document.anomalia.data_start.value);"><img src="datepick/cal.gif" width="16" height="16" border="0" alt="Click Here to Pick up the timestamp"></a>
        </td>
        <td> <input type="text" size="15" value="" name=data_end /> </td>
	<td>
        <a href="javascript:show_calendar('document.anomalia.data_end', document.anomalia.data_end.value);"><img src="datepick/cal.gif" width="16" height="16" border="0" alt="Click Here to Pick up the timestamp"></a>
        </td>
	</tr>

        <tr>
        <th> Autore:<br/>(nomecogn)</th>
	<th>   </th>
        <th> Sistema affetto da anomalia: </th>
	</tr>
        <tr>
	<td> <input type="text" size="10" value="" name=autore /> </td>
	<td style="color:white;"> -----------  </td>
	<td>
        <select name="id_sistema">
                <option> </option>
        </select>
	</td>

	</tr>
        </table>
	</center>


	<p><b>Descrizione anomalia:</b><br/>
	(max 250 caratteri - non superare la dimensione dell'area!)<br/>
	(EVITARE apici, doppi apici, caratteri particolari e le lettere accentate)<br/>
	<textarea type="text" rows="5" cols="50" value="" name=richiesta wrap=virtual></textarea>
	</p>

	<br/>

	<p> Clicca su "OK" per inserire l'anomalia nel sistema, oppure su "Cancella" per resettare tutto.<br/>

	<center>
	<table>
	<tr>
		<td><input type="button" onClick="history.go(0)" VALUE="Cancella" /> </td>
		<td><input type="submit" value="OK" name="B1" /> </td>
	</tr>
	</table>
	</center>

	</p>

	</div>
	
</form>

	
	</body>  
</html>

