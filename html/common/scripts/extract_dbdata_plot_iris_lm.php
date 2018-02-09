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

//Recupero i sensori della stazione:
if (isset($_GET['params'])) $id_parametro_sensore = explode( ',', $_GET['params'] );
else $id_parametro_sensore = '';
$params_arr = array();

//creo un array-dictionary con alcune variabili per costruire i grafici in bae ai parametri da plottare:
//il valore 999 equivale ad un null per i campi numerici
$plot_var = array(
  'T' => array(
	'udm' => '°C',
	'type' => 'line',
	'maxy' => 40,
	'miny' => 999,
	'decimal' => 1,
	'step' => false
  ),
  'PP' => array(
        'udm' => 'mm/h',
        'type' => 'line',
        'maxy' => 999,
        'miny' => 999,
        'decimal' => 1,
        'step' => 'right'
  ),
  'UR' => array(
        'udm' => '%',
        'type' => 'line',
        'maxy' => 100,
        'miny' => 0,
        'decimal' => 0,
        'step' => false
  ),
  'I' => array(
        'udm' => 'cm',
        'type' => 'line',
        'maxy' => 999,
        'miny' => 999,
        'decimal' => 1,
        'step' => false
  ),
  'VV' => array(
        'udm' => 'm/s',
        'type' => 'line',
        'maxy' => 999,
        'miny' => 0,
        'decimal' => 0,
        'step' => false
  ),
  'DV' => array(
        'udm' => '°',
        'type' => 'scatter',
        'maxy' => 360,
        'miny' => 0,
        'decimal' => 0,
        'step' => false
  )
);


if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];

$realtimetable_from = 'expo2015.v_meteo_real_time_lm';
$basetable_from = 'expo2015.v_anagraficasensori_lm';
$timezone_data = 'CET';
$codice_istat = $_GET['codice_istat']; //in questo caso non serve
$progr_punto_com = $_GET['progr_punto']; //in questo caso non serve

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

  $pass_time = 60;

  //nel caso dei dati lombardi, ciclo dentro le coppie sensore-parametro:
  $queries = array(); //creo un array con tutte le query da eseguire
  foreach ($id_parametro_sensore as $coppia) {
    $coppia_arr = explode( '_',  $coppia);
    $id_parametro = $coppia_arr[0];
    $id_sensore = $coppia_arr[1]; 
    if (empty($plot_var[$id_parametro])) continue; //se un parametro non e' definito nell'array lo salto
    $udm = $plot_var[$id_parametro]["udm"];
    $type = $plot_var[$id_parametro]["type"];
    $decimal = $plot_var[$id_parametro]["decimal"];
    $step = $plot_var[$id_parametro]["step"];
    $maxy = $plot_var[$id_parametro]["maxy"];
    $miny = $plot_var[$id_parametro]["miny"];

    //l'unica query che rompe lo schema e' la pioggia
    if ($id_parametro=='PP') {
	$query = <<<EOT
WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, '$id_parametro' AS name, '$udm' AS unit, '$type' AS type, $decimal AS decimal, '$step' AS step, NULLIF($maxy, 999) AS maxy, NULLIF($miny, 999) AS miny FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd 
LEFT OUTER JOIN (SELECT 
to_char(data_e_ora - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '$pass_time minute'::interval AS data,
sum(valore_originale) AS valore_originale, max(tipologia_validaz) AS tipologia_validaz, max(data_agg) AS data_agg FROM $realtimetable_from a WHERE a.id_sensore = $id_sensore AND data_e_ora >= (SELECT dataora FROM daysago) 
GROUP BY to_char(data_e_ora - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '$pass_time minute'::interval
) AS dati_staz ON (dd=data) ORDER BY data ASC;
EOT;
    }
    else {
      $query = <<<EOT
WITH daysago AS (SELECT date_trunc('day', now() at time zone '$timezone_data'-'5 days'::interval) AS dataora) SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, '$id_parametro' AS name, '$udm' AS unit, '$type' AS type, $decimal AS decimal, '$step' AS step, NULLIF($maxy, 999) AS maxy, NULLIF($miny, 999) AS miny FROM generate_series ( (SELECT dataora FROM daysago) , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from  a WHERE a.id_sensore = $id_sensore AND data_e_ora >= (SELECT dataora FROM daysago)) AS dati_staz ON (dd=data_e_ora) ORDER BY data ASC;
EOT;
    }
    array_push($queries, $query);
    array_push($params_arr, $id_parametro);
  }

//TEST:
/*
APPUNTI
- devi prendere un pass_time che sia minimo comune multiplo tra quelli dei sensori presenti. Perlomeno la prima query, che tira fuori il set temporale, dovrebbe essere quella con maggiore dettaglio temporale. le altre serie di dati sembrano adattarvisi
- sarebbe meglio riuscire a scrivere UNA sola query
- occorre ovviametne rendere il codice piu' flessibile nel caso in cui si vogliano richiedere piu' o meno sensori
*/

	if ($tipo_json=='multiple_graphs') {
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
	}

	else {
	  $result = pg_query($conn, $query);
          if (!$result) {
                echo "Error on the query <br>";
          }
	  else {
		/* Risultato come ARRAY JSON secco:*/
		while($row = pg_fetch_array($result)) {
		    $data_array[] = array(strtotime($row[0])*1000, floatval($row[1]));
		}
	  }
	} // Query

} // Connection
pg_close($conn);

echo json_encode($data_array);

?>
