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
    <title>Inserisci report di evento severe</title>
	
<script language="JavaScript" src="js_functions.js"></script>
<script type="text/javascript" src="../proj4js-combined.js"></script>

<script language="Javascript">

var mm, dd, hh, min, sec, lat, lon;

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

// Gestione coordinate

$x = $_GET['x'];
$y = $_GET['y'];

// Conversion from WGS84 to UTM33
//$proj4 = new Proj4php();
//$projWGS84 = new Proj4phpProj('EPSG:4326');
//$projGOOGLE = new Proj4phpProj('EPSG:3857');

//$result = $proj4->transform($projGOOGLE, $projWGS84, new proj4phpPoint($x, $y));


// Popup

$query = "SELECT id_tipo_evento, nome_tipo_evento FROM config.tab_tipo_evento;";
$result = pg_query($conn,$query);
        if (!$result) {
                echo "Error on the query.";
        }
$rows = pg_num_rows($result);

while ($myrow = pg_fetch_row($result)) {

?>

AddToOptionList(document.report.tipo_evento, "<?php echo $myrow[0]; ?>", "<?php echo $myrow[1]; ?>");

<?php

} //fine del while

// free memory
pg_free_result($result);
pg_close($conn);


?>

Proj4js.defs["epsg:900913"]= "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
var proj4326 = new Proj4js.Proj("epsg:4326"); //LatLon WGS84
var proj900913 = new Proj4js.Proj("epsg:900913"); //LatLon WGS84

var p1 = new Proj4js.Point(<?php echo $x; ?>, <?php echo $y; ?>);
var pp1 = Proj4js.transform(proj900913, proj4326, p1);

document.getElementById("lon").value  = pp1.x.toFixed(4);
document.getElementById("lat").value  = pp1.y.toFixed(4);


} //fine della funzione pop_sistemi


</script>


  </head>

	<body onload="pop_sistemi();">

<form name=report action="insert_report_evento.php" method="POST">

	<div style="text-align:center; font-family:arial; font-size:12px;">

	<table border="1">
  <tr>
    <th colspan="5">Report evento meteoidrologico su nordovest Italia</th>
  </tr>
  <tr>
    <td>Data ora (UTC)</td>
    <td>Localita'</td>
    <td>Raggio (km)</td>
    <td>Lat</td>
    <td>Lon</td>
  </tr>
  <tr>
    <td><input type="datetime-local" size="18" value="" name="data_evento" /></td>
    <td><textarea type="text" rows="1" cols="80" value="" name="localita" wrap=virtual></textarea></td>
    <td><input type="number" name="raggio" min="0" max="20"></td>
    <td><input id="lat" type="number" name="lat" step="0.0001" placeholder="0.0000" ></td>
    <td><input id="lon" type="number" name="lon" step="0.0001" placeholder="0.0000" ></td>
  </tr>
  <tr>
    <td>tipo evento</td>
    <td colspan="5">note</td>
  </tr>
  <tr>
    <td>
    <select name="tipo_evento">
                <option> </option>
        </select>
    </td>
    <td colspan="4"><textarea type="text" rows="5" cols="120" value="" name="note" wrap=virtual></textarea></td>
  </tr>
  <tr>
    <td>autore</td>
    <td>link alla notizia</td>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <td><textarea type="text" rows="1" cols="20" value="" name="autore"></textarea></td>
    <td><textarea type="url" rows="1" cols="80" value="" name="link_news" placeholder="http://www.example.com"></textarea></td>
    <td></td>
    <td><input type="button" onClick="history.go(0)" VALUE="Cancella" /></td>
    <td><input type="submit" value="OK" name="B1" /></td>
  </tr>
</table>
	</div>
	
</form>

	
	</body>  

<script> console.log(lon,lat);</script>


</html>


