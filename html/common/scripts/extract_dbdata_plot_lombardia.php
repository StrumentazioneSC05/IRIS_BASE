<?php
/*
Script pensato per essere generico, in realta' al momento non serve richiamarlo.
Doveva fare da ponte tra gli script javascript per la genrazione dei grafici e il DB.
Ma essendo che anche i grafici li faccio all'interno di un php, mi connetto al DB da la'.

Lo tengo per casi futuri...

OTTIMIZZAZIONI:
- creare un'unica query per tutti i parametri modificando solo l'id_parametro?
- passare anche il colore della riga che si vuole graficare?
*/

date_default_timezone_set('UTC');

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

if (isset($_GET['tipo_json'])) $tipo_json = $_GET['tipo_json'];
else $tipo_json = "multiple_graphs";

//Variabile che contiene i parametri da plottare nel caso di multiple_graphs
if (isset($_GET['params'])) $params = $_GET['params'];
else $params = '';
$params_arr = explode(",", $params);

if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];

$realtimetable_from = 'expo2015.v_meteo_real_time_lombardia';
$basetable_from = 'expo2015.elencostazionisensori';
$timezone_data = 'CET';
//$codice_istat = '006159';
//$progr_punto_com = '900';
$codice_istat = $_GET['codice_istat'];
$progr_punto_com = $_GET['progr_punto'];

$inputs = htmlspecialchars($_POST["inputs"]);
$inputs_array = explode(",", $inputs);
$n_inputs = sizeof($inputs_array);

$query = $_POST['query'];
//query = select id_conoide, data, media, valore from realtime.cumulata_bacini_2012 where id_conoide = $$$ AND data >= (now() - '14 days'::interval) ORDER BY data ASC;

for ($i=0; $i < $n_inputs ; $i++) {
	$query = str_replace('$$$', $inputs_array[$i], $query);
}
//echo $query;

$conn = pg_connect($conn_string);

$data_array = array();
$xData = array();
$first_dataset = array();
$datasets = array();
$datasets2 = array();
$datasets3 = array();

if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	//$query = "select id_conoide, data, media, valore from realtime.cumulata_bacini_2012 where id_conoide = $id_bacino AND data >= (now() - '14 days'::interval) ORDER BY data ASC;";
//TEST:
/*
APPUNTI
- devi prendere un pass_time che sia minimo comune multiplo tra quelli dei sensori presenti. Perlomeno la prima query, che tira fuori il set temporale, dovrebbe essere quella con maggiore dettaglio temporale. le altre serie di dati sembrano adattarvisi
- sarebbe meglio riuscire a scrivere UNA sola query
- occorre ovviametne rendere il codice piu' flessibile nel caso in cui si vogliano richiedere piu' o meno sensori
*/
$pass_time = 60;
$id_parametro = 'TERMA';
$query_temp = "WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, 'TERMA' AS name, '°C' AS unit, 'line' AS type, 1 AS decimal, false AS step, 40 AS maxy, null AS miny FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $codice_istat AND id_parametro = '$id_parametro' AND data >= (SELECT dataora FROM daysago)) AS dati_staz ON (dd=data) ORDER BY data ASC;";

$id_parametro = 'IGRO';
$query_igro = "WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, umidita.valore_originale, max(umidita.data_agg) OVER () AS data_agg, 'IGRO' AS name, '%' AS unit, 'line' AS type, 0 AS decimal, false AS step, 100 AS maxy, 0 AS miny FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $codice_istat AND id_parametro = '$id_parametro' AND data >= (SELECT dataora FROM daysago)) AS umidita ON (dd=umidita.data) ORDER BY data ASC;";

$id_parametro = 'PLUV';
//dati puntuali:
//$query_pluv = "WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, 'PLUV' AS name, 'mm' AS unit, 'line' AS type, 1 AS decimal, 'right' AS step FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $codice_istat AND id_parametro = '$id_parametro' AND data >= (SELECT dataora FROM daysago)) AS dati_staz ON (dd=data) ORDER BY data ASC;";
//dati cumulati ogni pass_time:
$query_pluv = "WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, 'PLUV' AS name, 'mm/h' AS unit, 'line' AS type, 1 AS decimal, 'right' AS step, null AS maxy, null AS miny FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '$pass_time minute'::interval AS data, sum(valore_originale) AS valore_originale, max(tipologia_validaz) AS tipologia_validaz, max(data_agg) AS data_agg FROM $realtimetable_from a WHERE a.id_stazione = $codice_istat AND id_parametro = '$id_parametro' AND data >= (SELECT dataora FROM daysago) GROUP BY to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '$pass_time minute'::interval) AS dati_staz ON (dd=data) ORDER BY data ASC;";

$id_parametro = 'NIVO';
$query_nivo = "WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, 'NIVO' AS name, 'cm' AS unit, 'line' AS type, 1 AS decimal, false AS step, null AS maxy, 0 AS miny FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $codice_istat AND id_parametro = '$id_parametro' AND data >= (SELECT dataora FROM daysago)) AS dati_staz ON (dd=data) ORDER BY data ASC;";

	if ($tipo_json=='multiple_graphs') {
	  //$result = pg_query($conn, $query);
	  //$result_pluv = pg_query($conn, $query_pluv);
	  //creo un array con tutte le query da eseguire:
	  $queries = array($query_temp, $query_igro, $query_pluv, $query_nivo);
	  $data_array['datasets'] = array();
	  //Ciclo dentro questo gruppo di query e recupero i dataset:
	  for( $i=0; $i<count($queries); $i++ ) {
		$result = pg_query($conn, $queries[$i]);
		if (!$result) {
                  echo "Error on the query <br> " . $queries[$i];
          	}
		else {
		  $datasets = array(); //riazzero l'array
		  $xData = array(); //riazzero l'array
		  while($row = pg_fetch_array($result)) {
                    $xData[] = strtotime($row[0])*1000;
                    $datasets['name'] = $row['name'];
                    $datasets['unit'] = $row['unit'];
                    $datasets['type'] = $row['type'];
                    $datasets['valueDecimals'] = $row['decimal'];
		    $datasets['step'] = $row['step'];
		    $datasets['maxY'] = $row['maxy'];
		    $datasets['minY'] = $row['miny'];
		    $datasets['timezone'] = $timezone_data;
                    $datasets['data'][] = is_null($row[1]) ? null : floatval($row[1]); //ternary operation altrimenti il floatval riporta a zero i valori nul
		  }
                $data_array['xData'] = $xData;
		//Se voglio comandare la costruzione dei grafici da qui allora:
		if (in_array($datasets['name'], $params_arr)) {
                  array_push($data_array['datasets'], $datasets);
		}
		}
	  }
	  /*if (!$result or !$result_pluv) {
		echo "Error on the query <br>";
	  }
	  else {
	  //PRIMO PARAM:
	    while($row = pg_fetch_array($result)) {
                 $xData[] = strtotime($row[0])*1000;
                 $datasets['name'] = 'TERMA';
                 $datasets['unit'] = 'C';
                 $datasets['type'] = 'line';
                 $datasets['valueDecimals'] = 1;
                 $datasets['data'][] = floatval($row[1]);
	  //SECONDO PARAM:
		 $datasets2['name'] = 'IGRO';
                 $datasets2['unit'] = '%';
                 $datasets2['type'] = 'line';
                 $datasets2['valueDecimals'] = 1;
                 $datasets2['data'][] = floatval($row[4]);
            }
	  //TERZO PARAM:
	    $data_array['datasets'] = array();
	    while($row = pg_fetch_array($result_pluv)) {
                 $datasets3['name'] = 'PLUV';
                 $datasets3['unit'] = 'mm';
                 $datasets3['type'] = 'area';
                 $datasets3['valueDecimals'] = 1;
                 $datasets3['data'][] = floatval($row[1]);
            }
            $first_datasets[] = array($datasets, $datasets2);
            $data_array['xData'] = $xData;
	    if (in_array("TERMA", $params_arr)) {
		array_push($data_array['datasets'], $datasets);
	    }
	    if (in_array("IGRO", $params_arr)) {
                array_push($data_array['datasets'], $datasets2);
            }
	    if (in_array("PLUV", $params_arr)) {
                array_push($data_array['datasets'], $datasets3);
            }
	    //$data_array['datasets'] = array($datasets, $datasets2, $datasets3);
	    }
	    */
	}

	else {
	  $result = pg_query($conn, $query);
          if (!$result) {
                echo "Error on the query <br>";
          }
	  else {
		/*
		$numrows = pg_numrows($result);	
		//$bacino = pg_fetch_row($result, 0); //prendo il primo record
		for ($i=0; $i < $numrows ; $i++) {
			$DataArr = pg_fetch_row($result, $i);
		} // For
		*/

		/* Risultato come ARRAY JSON secco:*/
		while($row = pg_fetch_array($result)) {
		    $data_array[] = array(strtotime($row[0])*1000, floatval($row[1]));
		}
		

		/*encode each row as a JSON Object
		$data_array = pg_fetch_all($result);
		*/

		/*Altra prova, come il primo metodo ma il contenuto e' tra doppi apici e la data e' testuale...
		while ($row = pg_fetch_assoc($result)) {
		    extract($row);
		    $data_array[] = "[$data,$valore_originale]";
		}
		*/
	  }
	} // Query

} // Connection
pg_close($conn);

echo json_encode($data_array);

?>
