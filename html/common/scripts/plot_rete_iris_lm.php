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

/*
Plotto dei grafici per visualizzare l'andamento delle temperature.
Richiama con $.ajax uno script php che scarica i dati da DB e li fornisce nella forma:
[date, values]
In modo da poter essere plottati.
Lo script e' pensato in maniera tale da poter essere richiamato da altre pagine.

VERSIONE PER IRIS LOMBARDIA IN MODO DA GESTIRE LA LORO LOGICA STAZIONE-SENSORI
*/

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

date_default_timezone_set('UTC');

$realtimetable_from = 'expo2015.v_meteo_real_time_lm';
$basetable_from = 'expo2015.elencostazionisensori';
$timezone_data = 'CET';

//Recupero alcune info dall'URL del popup.js:
if(isset($_GET['codice_istat'])){ //Nel caso si voglia richiamare la stazione tramite il codice stazione:
	$cod_staz = $_GET['codice_istat'];
}
//Se il cod_staz non e' nell'url la stazione NON puoì venir richiamata:
else {
	echo "Fornire un codice stazione!";
	die();
}
//Recupero i sensori della stazione:
$id_parametro_sensore = explode( '|', $_GET['id_parametro'] );
$id_parametro = $id_parametro_sensore[0];
$idsensore = $id_parametro_sensore[1];

if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];

$data_array = array(); //variabile array dove stoccare i dati per la costruzione del grafico
$data_array_cum = array(); //variabile array dove stoccare i dati per la costruzione del grafico - PIOGGIA CUMULATA
$data_array_raf = array(); //variabile array dove stoccare i dati per la costruzione del grafico - RAFFICHE DI VENTO
$data_array_alert = array(); //variabile array dove stoccare i dati con tipologia di validazione "A-Alert"
$data_array_warning = array(); //variabile array dove stoccare i dati con tipologia di validazione "W-Warning"
$data_array_validate = array(); //variabile array dove stoccare i dati con tipologia di validazione "V-Verify"
$data_array_atl = array(); //variabile array stocca dati per curve segnalatrici atlante piogge
$data_array_dew = array(); //variabile array stocca dati temperatura di rugiada
$data_array_mslp = array(); //variabile array stocca dati temperatura di rugiada
$data_array_temp = array(); //variabile array stocca dati temperatura per validazione dati NIVO

//Per la stazione EXPO-Scalo Fiorenza imposto un passo diverso:
$pass_time = 10;
if ($cod_staz==1644 or $cod_staz==1645 or $cod_staz==1646 or $cod_staz==1648 or $cod_staz==1649) $pass_time = 1;

if($id_parametro=='PP') {
	//Problema questa query: accorpa come dato orario dei dati anche se il ciclo orario non e' completo
	$query = "SELECT to_char(data_e_ora - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval AS data, sum(valore_originale) AS valore_originale, max(tipologia_validaz), max(data_agg) FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro = '$id_parametro' GROUP BY to_char(data_e_ora - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval ORDER BY data ASC;";
	//Con questa query invece il passo temporale e' di 1 ora:
	$query_cumulata = "SELECT data, sum(valore_originale) OVER (ORDER BY data ASC) FROM (SELECT to_char(data_e_ora - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval AS data, sum(valore_originale) AS valore_originale FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro = '$id_parametro' GROUP BY to_char(data_e_ora - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval) AS foo;";
	//Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
	$id_parametro='PLUV';
}
else if($id_parametro=='NIVO') {
	//query che crea serie temporale costante passo 30minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale*100 as valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati cumulata pioggia per validazione con lo stesso step temporale dei dati nivo:
	$query_cumulata = "SELECT dd::timestamp without time zone as data, valore_originale FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data+ora::time AS data, sum(valore_originale) OVER (ORDER BY data+ora::time) as valore_originale FROM $realtimetable_from WHERE id_stazione = $cod_staz AND id_parametro ='PLUV') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati temperatura per validazione:
	$query_temp = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'TERMA%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'TERMA%') AS dati_staz ON (dd=data) ORDER BY data ASC;"; 
}
else if($id_parametro=='I') {
        $query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore= $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore= $idsensore AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%' ORDER BY id_parametro LIMIT 1) ) AS dati_staz ON (dd=data) ORDER BY data ASC;";
        //Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        $id_parametro='IDRO';
}
else if($id_parametro=='DEFLUSSO') {
	//Recupero tutti i dati e parametri che mi servono per costruire la curva della scala di deflusso:
	$query = "SELECT a.valore_originale, to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone, b.* FROM realtime.meteo_real_time a LEFT JOIN dati_di_base.calcolo_portate b ON (b.id_stazione=a.id_stazione) WHERE a.id_stazione = $cod_staz AND a.id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND a.id_parametro like 'IDRO%' ORDER BY id_parametro LIMIT 1)  AND b.data_fine_validita IS NULL order by to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone DESC LIMIT 1;";
}
else if($id_parametro=='MAX_IDRO') {
	//Recupero le informazioni per costruire il grafico a colonne per i max storici idrologici:
	$query = "SELECT data, valore, note FROM dati_di_base.massimi_storici_idrologici WHERE a.id_stazione = $cod_staz AND a.id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND a.id_parametro like 'IDRO%' ORDER BY id_parametro LIMIT 1);";

}
else if($id_parametro=='PORTATA') {
	//Nel caso della PORTATA esiste solo il valore_validato. Alcune stazioni, avendo piu' idrometri, hanno anche piu' valori di portata. A noi pero' al momento interessa solo PORTATA:
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro' ORDER BY data ASC;";
	//provo query che crea serie temporale costante passo 30minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_validato, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like '$id_parametro') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like '$id_parametro') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='DEW') {
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, zradar_humidex(dati_staz.valore_originale, umidita.igro) FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'TERMA%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'TERMA%') AS dati_staz ON (dd=dati_staz.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS igro FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'IGRO%') AS umidita ON (dd=umidita.data) ORDER BY data ASC;";
}
else if($id_parametro=='T') {
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro LIKE '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=dati_staz.data) ORDER BY data ASC;";
	//Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        $id_parametro='TERMA';
}
else if($id_parametro=='BARO') {
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, zradar_mslp(dati_staz.valore_originale, temp.terma, umidita.igro, staz.quota) FROM  generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'BARO%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'BARO%') AS dati_staz ON (dd=dati_staz.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS igro FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'IGRO%') AS umidita ON (dd=umidita.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS terma FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'TERMA%') AS temp ON (dd=temp.data) LEFT OUTER JOIN (SELECT quota FROM $basetable_from a WHERE a.idstazione = $cod_staz) AS staz ON (dd=temp.data) ORDER BY data ASC;";
}
else if($id_parametro=='PA') {
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        $id_parametro='BARO';
}
else if($id_parametro=='RG') {
	//query che crea serie temporale costante passo 10minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
        //Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        $id_parametro='RADD';
}
else if($id_parametro=='UR') {
        //query che crea serie temporale costante passo 10minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
        //Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        $id_parametro='IGRO';
}
else if($id_parametro=='TPV') {
        //query che crea serie temporale costante passo 10minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_originale/100 AS km, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
        //Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        $id_parametro='VIS';
}
else if($id_parametro=='VV' or $id_parametro=='DV') {
        $query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Riconverto il parametro secondo quelli classici per mantenere le impostazioni sui grafici:
        if ($id_parametro=='VV') $id_parametro='VELV';
	if ($id_parametro=='DV') $id_parametro='DIRV';
}
else if($id_parametro=='ROSE') {
//$realtimetable_from = 'expo2015.meteo_real_time_lombardia';
/*
	$query = <<<EOT
	SELECT realtime.cardinal2degree(dirv.direction), round((count(velv.*) * 100 / max(dirv.total))) AS big_freq0, round((count(velv1.*) * 100 / max(dirv.total))) AS big_freq1, round((count(velv2.*) * 100 / max(dirv.total))) AS big_freq2, round((count(velv3.*) * 100 / max(dirv.total))) AS big_freq3, max(dirv.total) AS big_total, max(data_agg) as data_agg FROM (
	SELECT id_stazione, data_e_ora, data_agg, count(*) OVER () AS total, realtime.degree2cardinal(valore_originale) AS direction FROM $realtimetable_from WHERE valore_originale IS NOT NULL AND id_stazione=$cod_staz AND data_e_ora::date = current_date
	) AS dirv LEFT JOIN (
	SELECT valore_originale AS speed0, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale < 0.5 AND data_e_ora::date = current_date
	) AS velv ON (velv.id_stazione= dirv.id_stazione AND velv.data_e_ora = dirv.data_e_ora) LEFT JOIN (
	SELECT valore_originale AS speed1, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale BETWEEN 0.5 AND 5 AND data_e_ora::date = current_date
	) AS velv1 ON (velv1.id_stazione= dirv.id_stazione AND velv1.data_e_ora = dirv.data_e_ora) LEFT JOIN (
	SELECT valore_originale AS speed2, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale BETWEEN 5 AND 10 AND data_e_ora::date = current_date
	) AS velv2 ON (velv2.id_stazione= dirv.id_stazione AND velv2.data_e_ora = dirv.data_e_ora) LEFT JOIN (
	SELECT valore_originale AS speed3, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale > 10 AND data_e_ora::date = current_date
	) AS velv3 ON (velv3.id_stazione= dirv.id_stazione AND velv3.data_e_ora = dirv.data_e_ora)
	WHERE dirv.id_stazione = $cod_staz GROUP BY dirv.id_stazione, dirv.direction ORDER BY dirv.id_stazione, realtime.cardinal2degree(dirv.direction);
EOT;
*/
	//PER FAR VEDERE QUALCOSA FINCHE' I DATI NON SONO ALIMENATTI USA QUESTA QUERY CHE PRENDE TUTTI O DATI:
	$query = <<<EOT
        SELECT realtime.cardinal2degree(dirv.direction), round((count(velv.*) * 100 / max(dirv.total))) AS big_freq0, round((count(velv1.*) * 100 / max(dirv.total))) AS big_freq1, round((count(velv2.*) * 100 / max(dirv.total))) AS big_freq2, round((count(velv3.*) * 100 / max(dirv.total))) AS big_freq3, max(dirv.total) AS big_total, max(data_agg) as data_agg FROM (
        SELECT id_stazione, data_e_ora, data_agg, count(*) OVER () AS total, realtime.degree2cardinal(valore_originale) AS direction FROM $realtimetable_from WHERE valore_originale IS NOT NULL AND id_stazione=$cod_staz
        ) AS dirv LEFT JOIN (
        SELECT valore_originale AS speed0, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale < 0.5
        ) AS velv ON (velv.id_stazione= dirv.id_stazione AND velv.data_e_ora = dirv.data_e_ora) LEFT JOIN (
        SELECT valore_originale AS speed1, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale BETWEEN 0.5 AND 5
        ) AS velv1 ON (velv1.id_stazione= dirv.id_stazione AND velv1.data_e_ora = dirv.data_e_ora) LEFT JOIN (
        SELECT valore_originale AS speed2, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale BETWEEN 5 AND 10
        ) AS velv2 ON (velv2.id_stazione= dirv.id_stazione AND velv2.data_e_ora = dirv.data_e_ora) LEFT JOIN (
        SELECT valore_originale AS speed3, id_stazione, data_e_ora FROM $realtimetable_from WHERE id_sensore=$idsensore AND valore_originale IS NOT NULL AND valore_originale > 10
        ) AS velv3 ON (velv3.id_stazione= dirv.id_stazione AND velv3.data_e_ora = dirv.data_e_ora)
        WHERE dirv.id_stazione = $cod_staz GROUP BY dirv.id_stazione, dirv.direction ORDER BY dirv.id_stazione, realtime.cardinal2degree(dirv.direction);
EOT;
}
else {
	//query che crea serie temporale costante passo 10minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data_e_ora) from $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') , now() at time zone '$timezone_data', '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT data_e_ora AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_sensore = $idsensore AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}

// Recupero quota e soglie idrometriche per la stazione:
$query_datigenerali = "SELECT nome, quota, NULL as codice1, NULL as codice2, NULL as codice3, NULL as codice1, NULL as codice2, NULL as codice3, NULL as codice2, NULL as codice3 FROM $basetable_from a  WHERE a.idstazione = $cod_staz;";

$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	$result = pg_query($conn,$query);
	$result_generale = pg_query($conn,$query_datigenerali);
        if (!$result || !$result_generale) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result);
		//$primariga = pg_fetch_row($result, 0); //prendo il primo record
		//$tipo_validaz = $primariga[2];
		//$data_agg = $primariga[3];
		//Prendo la prima riga per estrarre alcuni dati generali sulla stazione:
		$primariga = pg_fetch_row($result_generale, 0);
		//Genero una primariga fittizia per EXPO:
		//$primariga=array(0,0,0,0,0,0,0,0,0,0);
		$denominazione = addslashes($primariga[0]);
		$quota = $primariga[1];

		//Recupero le soglie IDROmetriche:
		$soglia1 = $primariga[2];
		$soglia2 = $primariga[3];
		$soglia3 = $primariga[4];
		//Recupero le soglie per la PORTATA:
		$sogliaP1 = $primariga[5];
                $sogliaP2 = $primariga[6];
                $sogliaP3 = $primariga[7];
		//Recupero le soglie per GAMMA:
		$sogliaG2 = $primariga[8];
                $sogliaG3 = $primariga[9];
		

		//Recupero tutti i dati in un array da passare poi per costruire il grafico:
		if($id_parametro=='ATL') {
                        //Prelevo i dati per costruire le curve segnalatrici atlante piogge:
                        while($row_atl = pg_fetch_array($result)) {
                        //variabili array dove stoccare i dati per il grafico sulle varie serie in base ai Tempi di Ritorno Tr
                            ${"serie_tr".$row_atl[0]} = array();
                            //Recupero tutti i dati in un array da passare poi per costruire il grafico:
                            $durata_arr = explode( ',', $row_atl[1]);
                            $value_arr = explode( ',', $row_atl[2]);
                            //Ciclo dentro l'array durata e recupero i valori:
                            foreach ($durata_arr as $key=>$durata_number) {
                                ${"serie_tr".$row_atl[0]}[] = array(intval($durata_number)/60, intval($value_arr[$key]));
                            } //fine del foreach dentro array con le durate
                            //Creo dinamicamente anche le variabili javascript assegnando loro il valore:
                            //echo "<SCRIPT LANGUAGE='javascript'>graph_tr".$row_atl[0]."=".json_encode(${"serie_tr".$row_atl[0]}).";</SCRIPT>";
                        }
                }
		//Nel caso della temperatura calcolo anche la temperatura percepita:
		else if ($id_parametro=='DEW') {
		    while($row = pg_fetch_array($result)) {
			//Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                        $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
                        //Recupero l'array per la tipologia di validazione:
                        $data_array_alert[] = array(strtotime($row[0])*1000, ($row[2][0]=='A') ? floatval($row[1]) : null);
                        $data_array_warning[] = array(strtotime($row[0])*1000, ($row[2][0]=='W') ? floatval($row[1]) : null);
                        $data_array_validate[] = array(strtotime($row[0])*1000, ($row[2][0]=='V') ? floatval($row[1]) : null);
                        //La data_aggiornamento del dato la prendo una per tutti:
                        $data_agg = $row[3];
			$data_array_dew[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),1));
                    }
		}
		//Nel caso della pressione recupero la pressione ridotta al livello del mare:
		else if ($id_parametro=='BARO') {
		    while($row = pg_fetch_array($result)) {
			//Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                        $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
                        //Recupero l'array per la tipologia di validazione:
                        $data_array_alert[] = array(strtotime($row[0])*1000, ($row[2][0]=='A') ? floatval($row[1]) : null);
                        $data_array_warning[] = array(strtotime($row[0])*1000, ($row[2][0]=='W') ? floatval($row[1]) : null);
                        $data_array_validate[] = array(strtotime($row[0])*1000, ($row[2][0]=='V') ? floatval($row[1]) : null);
                        //La data_aggiornamento del dato la prendo una per tutti:
                        $data_agg = $row[3];
			$data_array_mslp[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),1));
                    }
		}
                else if ($id_parametro=='DEFLUSSO') {
			//prendo solo il primo record:
			$calcolo_portate = pg_fetch_assoc($result, 0);
		    //MANCA UN CONTROLLO SE C'E' O MENO IL DATO!!!!
			//$H = $calcolo_portate['valore_originale'];
		    //In realta penso ch'io debba dare in input un vetore di H:
			$Hi = round(floatval($calcolo_portate['lim_inf']), 2);
			$Hmin = round(floatval($calcolo_portate['hmin']), 2);
			$Hmax = round(floatval($calcolo_portate['hmax']), 2);
			$Hs = round(floatval($calcolo_portate['lim_sup']), 2);
			$h_test = range($Hi, $Hs, 0.01); // da -3 a 10mt con passo 0.1
		//echo $Hmin . ' <br/> ' . $Hmax . '<br/>';
		    foreach ($h_test as $Hlong) {
			$H = round(floatval($Hlong),2);
			if ($H<$Hi) $Q=-10000;
			else {
			    if ($H<$Hmin) $Q=( $calcolo_portate['a1'] * pow( ($H - $calcolo_portate['b1']), $calcolo_portate['n1']) ) + ( $calcolo_portate['a2'] * pow( ($H - $calcolo_portate['b2']), $calcolo_portate['n2']) );
		            else {
				if ($H<=$Hmax)  {
				    //$Q=(1 - (($H - $Hmin) / ($Hmax - $Hmin))) * ( ($calcolo_portate['a1'] * pow( ($H - $calcolo_portate['b1']), $calcolo_portate['n1']) + ( $calcolo_portate['a2'] * pow( ($H - $calcolo_portate['b2']), $calcolo_portate['n2'])) ) + ( (($H - $Hmin) / ($Hmax - $Hmin)) * ( $calcolo_portate['a3'] * pow( ($H - $calcolo_portate['b3']), $calcolo_portate['n3']) + ( $calcolo_portate['a4'] * pow( ($H - $calcolo_portate['b4']), $calcolo_portate['n4'])) ) ) );
				    $step1 = (1 - (($H - $Hmin) / ($Hmax - $Hmin))) ;
                		    $step2 = ($calcolo_portate['a1'] * pow( ($H - $calcolo_portate['b1']), $calcolo_portate['n1']) + ( $calcolo_portate['a2'] * pow( ($H - $calcolo_portate['b2']), $calcolo_portate['n2'])) );
		                    $step3 = (($H - $Hmin) / ($Hmax - $Hmin));
				    $step4 = ( $calcolo_portate['a3'] * pow( ($H - $calcolo_portate['b3']), $calcolo_portate['n3']) + ( $calcolo_portate['a4'] * pow( ($H - $calcolo_portate['b4']), $calcolo_portate['n4'])) );
				    $Q=$step1*$step2 + $step3*$step4;
				}
		                else {
				    if ($H<=$Hs) {
					//$Q=( $calcolo_portate['a3'] * pow( ($H - $calcolo_portate['b3']), $calcolo_portate['n3']) ) + ( $calcolo_portate['a4'] * pow( ($H - $calcolo_portate['b4']), $calcolo_portate['n4']) );
					$passo1 = ( $calcolo_portate['a3'] * pow( ($H - $calcolo_portate['b3']), $calcolo_portate['n3']) );
					$passo2 = ( $calcolo_portate['a4'] * pow( ($H - $calcolo_portate['b4']), $calcolo_portate['n4']) );
					$Q = $passo1 + $passo2;
				    }
				    else $Q=-10000;
				}
			    }
			}
			$data_array[] = array($Q, $H);
		//echo $step1 . ';' . $step2 . ';' . $step3 . '<br/>';
		//echo $Q . ' - ' . $H . '<br/>';
		    } //fine del FOREACH
		    //arsort($data_array); //come fare per ORDINARE l'array secondo la Q???
		}
		//Provo a recuperare i dati per costruire una rosa dei venti:
                else if ($id_parametro=='ROSE') {
                    while($row = pg_fetch_array($result)) {
                        $windDataJSON[] = array(floatval($row[0]), floatval($row[1]));
                        $data_array = $windDataJSON;
                        //Sfrutto la tipologia di validazione per plottare le altre classi di velocita:
                        $data_array_alert[] = array(floatval($row[0]), floatval($row[2]));
                        $data_array_warning[] = array(floatval($row[0]), floatval($row[3]));
                        $data_array_validate[] = array(floatval($row[0]), floatval($row[4]));
                        //La data_aggiornamento del dato la prendo una per tutti:
                        $data_agg = $row[6];
                    }
                }
		else {
                while($row = pg_fetch_array($result)) {
			//Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
			$data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
			//Recupero l'array per la tipologia di validazione:
			$data_array_alert[] = array(strtotime($row[0])*1000, ($row[2][0]=='A') ? floatval($row[1]) : null);
			$data_array_warning[] = array(strtotime($row[0])*1000, ($row[2][0]=='W') ? floatval($row[1]) : null);
			$data_array_validate[] = array(strtotime($row[0])*1000, ($row[2][0]=='V') ? floatval($row[1]) : null);
			//La data_aggiornamento del dato la prendo una per tutti:
	                $data_agg = $row[3];
                }

		//Nel caso della pioggia faccio un'altra query per recuperare i dati della cumulata:
		if($id_parametro=='PLUV' || $id_parametro=='NIVO') {
			$result_cumulata = pg_query($conn,$query_cumulata);
			while($row_cum = pg_fetch_array($result_cumulata)) {
                 	       $data_array_cum[] = array(strtotime($row_cum[0])*1000, is_null($row_cum[1]) ? null : round(floatval($row_cum[1]),0));
                	}
		}
		if($id_parametro=='NIVO') {
                        $result_temp = pg_query($conn,$query_temp);
                        while($row_temp = pg_fetch_array($result_temp)) {
                               $data_array_temp[] = array(strtotime($row_temp[0])*1000, is_null($row_temp[1]) ? null : round(floatval($row_temp[1]),1));
                        }
                }

		//Nel caso del vento recupero i dati sulla raffica:
		/*if($id_parametro=='VELV') {
			$query_raffica = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.id_stazione = $cod_staz AND id_parametro like 'VELR' ORDER BY data ASC;";
                        $result_raffica = pg_query($conn,$query_raffica);
                        while($row_raf = pg_fetch_array($result_raffica)) {
                               $data_array_raf[] = array(strtotime($row_raf[0])*1000, round(floatval($row_raf[1]),1));
                	}
		}*/
		} //fine dell'else che esclude il caso di atlante piogge
	} //ok query
} //ok connection
pg_close($conn);

//Piu in generale se la data_aggiornamento del dato non esiste prendo la data di oggi e via:
if (empty($data_agg)) $data_agg = date('Y/m/d H:i');

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>

<title>Plot grafico </title>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
//Proviamo Highcharts:
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highstock-1.3.9/js/highstock.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/highcharts-more.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/modules/exporting.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/suncalc-master/suncalc.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/js_functions.js"></script>';
echo $script_js1st;
?>

<script>

var today = new Date();

//Recupero info dall'url:
function gup(name)
{
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );
        if( results == null )
                return "";
        else
                return results[1];
}
//var id_bacino = parseInt(gup("bacino"));
var graph_data; //inizializzazione data array per i grafici
var graph_data_cum; //inizializzazione data array per i grafici - PIOGGIA CUMULATA
var graph_data_alert; //inizializzazione data array per i grafici in base alla tipologia di validazione del dato
var graph_data_warning; //inizializzazione data array per i grafici in base alla tipologia di validazione del dato
var graph_data_dew; //inizializzazione data array per i grafici - temperatura di percepita
var graph_data_mslp; //inizializzazione data array per i grafici - pressione al livello del mare
var graph_data_temp; //inizializzazione data array per i grafici - temperatura per validazione NIVO

/*
//in realta' questa chiamata ajax non la farei essendo gia' in un php...
//Recupero i dati connettendomi al DB:
$.ajax({
        url: '/common/scripts/extract_dbdata_plot.php',
        type: "post",
        async: false, //cosi' le variabili espresse qui posso usarle anche fuori
//Regole query: campo data deve essere di tipo date o timestamp; il campo valori deve essere numerico.
//La posizione deve essere per prima la data, per secondo i valori:
        data: {inputs: id_bacino, query: "select data, media, valore from realtime.cumulata_bacini_2012 where id_conoide = $$$ AND data >= (now() - '14 days'::interval) ORDER BY data ASC;" },
      dataType: 'json',
      success: function(data)
      {
            graph_data = data;
            //alert(JSON.stringify(graph_data));
      }
});
*/

var plot_title, udm, soglia, soglia1, soglia2, soglia3, soglia4, label_soglia1, label_soglia2, label_soglia3, label_soglia4, min_y, max_y, min_x, max_x, marker_fillcolor, markerline_color;
var sogliaP1, sogliaP2, sogliaP3;
var sogliaG1, sogliaG2;
var series_negativecolor, min_range_y, tick_interval_y, tick_interval_x, suffix_series, xaxis_tickposition;
var plotOptions_stacking, plotOptions_shadow, plotOptions_groupPadding, plotOptions_pointPlacement;
var name_series = 'parametro';
var name_alert_serie = 'alert';
var name_warning_serie = 'warning';
var name_verify_serie = 'verify';
var enabled_marker_alertwarningverify = true;
var serie_type_alertwarningverify = 'scatter';
var shadow_line = true;
var series_treshold = 0;
var series_color = 'blue';
var step_line = false;
var polar_chart = false;
var markers_on_line = true;
var type_chart = 'line';
var type_series = 'line';
var point_symbol = 'circle';
var markerline_width = 0;
var xaxys_type = 'datetime';
var xaxys_title = 'Data e ora (CET)';
var yaxys_type = 'linear';
var rangeselector_enabled = true;
var navigator_enabled = true;
var scrollbar_enabled = true;
var legend_enabled = false;
var enable_label_y = true;
var showInLegend_serie1 = false;
var showInLegend_serie2 = false;
var showInLegend_serie3 = false;
var wind_dir = { //per decodificare la direzione del vento sull'asse Y
    0: 'N',
    45: 'NE',
    90: 'E',
    135: 'SE',
    180: 'S',
    225: 'SW',
    270: 'W',
    315: 'NW',
    360: 'N'
};
//per le label su grafico polare dei venti:
var wind_categories = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

//inseriamo la decodifica del tempo presente - synop code:
//da: http://weather.unisys.com/wxp/Appendices/Formats/SYNOP.html
var synop_code = {
00: 'No significant weather observed',
01: 'Clouds generally dissolving or becoming less developed during the past hour',
02: 'State of sky on the whole unchanged during the past hour',
03: 'Clouds generally forming or developing during the past hour',
04: 'Haze or smoke, or dust in suspension in the air, visibility equal to, or greater than, 1 km',
05: 'Haze or smoke, or dust in suspension in the air, visibility less than 1 km',
//06-09 - Reserved
10: 'Mist',
11: 'Diamond dust',
12: 'Distant lightning',
//13-17 - Reserved
18: 'Squalls',
//19 - Reserved

// Code figures 20-26 are used to report precipitation, fog (or ice fog) or thunderstorm at the station 
// during the preceding hour but not at the time of observation.

20: 'Fog',
21: 'PRECIPITATION',
22: 'Drizzle (not freezing) or snow grains',
23: 'Rain (not freezing)',
24: 'Snow',
25: 'Freezing drizzle or freezing rain',
26: 'Thunderstorm (with or without precipitation)',
27: 'BLOWING OR DRIFTING SNOW OR SAND',
28: 'Blowing or drifting snow or sand, visibility equal to, or greater than, 1 km',
29: 'Blowing or drifting snow or sand, visibility less than 1 km',
30: 'FOG',
31: 'Fog or ice fog in patches',
32: 'Fog or ice fog, has become thinner during the past hour',
33: 'Fog or ice fog, no appreciable change during the past hour',
34: 'Fog or ice fog, has begun or become thicker during the past hour',
35: 'Fog, depositing rime',
//36-39 - Reserved
40: 'PRECIPITATION',
41: 'Precipitation, slight or moderate',
42: 'Precipitation, heavy',
43: 'Liquid precipitation, slight or moderate',
44: 'Liquid precipitation, heavy',
45: 'Solid precipitation, slight or moderate',
46: 'Solid precipitation, heavy',
47: 'Freezing precipitation, slight or moderate',
48: 'Freezing precipitation, heavy',
//49 - Reserved
50: 'DRIZZLE',
51: 'Drizzle, not freezing, slight',
52: 'Drizzle, not freezing, moderate',
53: 'Drizzle, not freezing, heavy',
54: 'Drizzle, freezing, slight',
55: 'Drizzle, freezing, moderate',
56: 'Drizzle, freezing, heavy',
57: 'Drizzle and rain, slight',
58: 'Drizzle and rain, moderate or heavy',
//59 - Reserved
60: 'RAIN',
61: 'Rain, not freezing, slight',
62: 'Rain, not freezing, moderate',
63: 'Rain, not freezing, heavy',
64: 'Rain, freezing, slight',
65: 'Rain, freezing, moderate',
66: 'Rain, freezing, heavy',
67: 'Rain (or drizzle) and snow, slight',
68: 'Rain (or drizzle) and snow, moderate or heavy',
//69 - Reserved
70: 'SNOW',
71: 'Snow, slight',
72: 'Snow, moderate',
73: 'Snow, heavy',
74: 'Ice pellets, slight',
75: 'Ice pellets, moderate',
76: 'Ice pellets, heavy',
77: 'Snow grains',
78: 'Ice crystals',
//79 - Reserved
80: 'SHOWER(S) or INTERMITTENT PRECIPITATION',
81: 'Rain shower(s) or intermittent rain, slight',
82: 'Rain shower(s) or intermittent rain, moderate',
83: 'Rain shower(s) or intermittent rain, heavy',
84: 'Rain shower(s) or intermittent rain, violent',
85: 'Snow shower(s) or intermittent snow, slight',
86: 'Snow shower(s) or intermittent snow, moderate',
87: 'Snow shower(s) or intermittent snow, heavy',
//88 - Reserved
89: 'Hail',
90: 'THUNDERSTORM',
91: 'Thunderstorm, slight or moderate, with no precipitation',
92: 'Thunderstorm, slight or moderate, with rain showers and/or snow showers',
93: 'Thunderstorm, slight or moderate, with hail',
94: 'Thunderstorm, heavy, with no precipitation',
95: 'Thunderstorm, heavy, with rain showers and/or snow showers',
96: 'Thunderstorm, heavy, with hail',
//97-98 - Reserved
99: 'Tornado'
};

function set_options(id_parametro) {
//A seconda del parametro richiamato setto alcune opzioni per il grafico:
	switch(id_parametro)
	{
	case 'DEFLUSSO':
		plot_title = 'Scala di deflusso';
		udm = 'Livello idrometrico [m]';
		xaxys_type = 'linear';
		xaxys_title = 'Portata [m3/s]';
		rangeselector_enabled = false;
		navigator_enabled = false;
		scrollbar_enabled = false;
		legend_enabled = false;
		markers_on_line = false;
		break;
	case 'GAMMA1':
		plot_title = 'Andamento intensita\' di dose equivalente di radiazione gamma';
		udm = 'nSv/h';
		yaxys_type = 'logarithmic';
		soglia = -999;
                <?php if(!empty($sogliaG2)) { ?>
                soglia2 = <?php echo $sogliaG2; ?>;
                soglia = soglia2 + 0.1;
                <?php } ?>
                <?php if(!empty($sogliaG3)) { ?>
                soglia3 = <?php echo $sogliaG3; ?>;
                soglia = soglia3 + 0.1;
                <?php } ?>
                label_soglia2 = 'Livello di attenzione';
                label_soglia3 = 'Livello di pericolo';
		markers_on_line = false;
		if (soglia2) min_y = Math.min(lowest, soglia2);
		else min_y = lowest;
                max_y = Math.max(highest, soglia);
		break;
	case 'BARO':
		plot_title = 'Andamento della pressione atmosferica misurata e ridotta';
		udm = 'mb';
		markers_on_line = false;
		series_color = 'blue';
		min_y = lowest;
		// max_y = highest;
		//max_y = Math.max.apply( Math, $.map(graph_data_mslp, function(o){ return o[1]; }) );
		break;
	case 'TERMA':
		plot_title = 'Andamento della temperatura';
		udm = '°C';
		soglia2 = 0;
		soglia3 = 30;
		markers_on_line = false;
		series_negativecolor = 'blue';
		series_color = 'green';
		tick_interval_y = 2.0;
		break;
        case 'TERMAV':
                plot_title = 'Andamento della temperatura virtuale';
                udm = '°C';
                soglia2 = 0;
                soglia3 = 30;
                markers_on_line = false;
                series_negativecolor = 'blue';
                series_color = 'green';
                tick_interval_y = 2.0;
                break;
	case 'DEW':
                plot_title = 'Andamento della temperatura dell\'aria ed humidex';
                udm = '°C';
                soglia2 = 0;
                soglia3 = 30;
                markers_on_line = false;
                series_negativecolor = 'blue';
                series_color = 'green';
                tick_interval_y = 2.0;
                break;
	case 'PLUV':
		name_series = 'intensita';
		plot_title = 'Andamento delle precipitazioni: intensita\' orarie e pioggia cumulata';
		type_series = 'area';
		series_color = '#235EAC';
		suffix_series = 'mm/h';
                udm = 'mm/h';
		step_line = 'right';
		markers_on_line = false;
		min_y = 0;
		max_y = Math.max(highest, 20);
		tick_interval_y = 5;
		shadow_line = false;
		break;
	case 'TPP':
		name_series = 'pioggia';
                plot_title = 'Tempo presente: pioggia cumulata';
                type_series = 'area';
                series_color = '#235EAC';
                suffix_series = 'mm';
                udm = 'mm';
                step_line = 'right';
                markers_on_line = false;
                min_y = 0;
                max_y = Math.max(highest, 20);
                tick_interval_y = 5;
                shadow_line = false;
                break;
	case 'IGRO':
                plot_title = 'Umidita\' dell\'aria';
                udm = '%';
		min_y = 0;
		max_y = 100;
		markers_on_line = false;
		series_color = '#6495ED';
		series_negativecolor = '#DAA520';
		series_treshold = 40;
		soglia2 = '40';
                break;
	case 'IDRO':
	case 'IDRO1':
		plot_title = 'Livello idrometrico';
		soglia = -999;
		<?php if(!empty($soglia1)) { ?>
                soglia1 = <?php echo $soglia1; ?>;
		soglia = soglia1 + 0.1;
                <?php } ?>
		<?php if(!empty($soglia2)) { ?>
                soglia2 = <?php echo $soglia2; ?>;
		soglia = soglia2 + 0.1;
                <?php } ?>
		<?php if(!empty($soglia3)) { ?>
		soglia3 = <?php echo $soglia3; ?>;
		soglia = soglia3 + 0.1;
		<?php } ?>
		label_soglia2 = 'Livello di attenzione';
		label_soglia3 = 'Livello di pericolo';
                udm = 'm';
		markers_on_line = false;
		if (soglia1) min_y = Math.min(lowest, soglia1);
		else min_y = lowest;
		max_y = Math.max(highest, soglia);
		//tick_interval_y = 0.4;
                break;
	case 'TP':
		plot_title = 'Tempo presente: codice synop automatico';
                udm = '';
                suffix_series = 'codice';
                markers_on_line = true;
		type_series = 'scatter';
                min_y = 0;
                max_y = Math.max(highest, 100);
                //tick_interval_y = 20;
                break;
	case 'TPN':
		plot_title = 'Tempo presente: altezza neve';
                udm = 'cm';
                suffix_series = 'cm';
                markers_on_line = false;
                min_y = 0;
                max_y = Math.max(highest, 100);
                tick_interval_y = 20;
                break;
	case 'NIVO':
                plot_title = 'Altezza neve';
                udm = 'cm';
		suffix_series = 'cm';
		markers_on_line = false;
                min_y = 0;
		max_y = Math.max(highest, 100);
		tick_interval_y = 20;
                break;
	case 'VELV':
                plot_title = 'Velocita\' del vento';
                udm = 'm/s';
		markers_on_line = false;
		series_treshold = 11;
		series_color = '#DAA520';
		series_negativecolor = 'green';
                min_y = 0;
		soglia1 = '5';
		soglia2 = '7';
		soglia3 = '9';
		soglia4 = '11';
                break;
	case 'DIRV':
		plot_title = 'Direzione del vento';
		udm = 'gradi';
		type_series = 'scatter';
		min_y = 0;
                max_y = 360;
		tick_interval_y = 45,
		point_symbol = 'triangle-down';
		marker_fillcolor = 'rgba(100,100,100,0)';
		markerline_width = 1;
		markerline_color = 'green';
		break;
	case 'ROSE':
                plot_title = 'Direzione e frequenza dei venti per classi di velocita - oggi';
                name_series = '<0.5m/s';
                name_alert_serie = '0.5-5m/s';
                name_warning_serie = '5-10m/s';
                name_verify_serie = '>10m/s';
                udm = '';
                type_series = 'column';
                type_chart = 'column';
                enabled_marker_alertwarningverify = false;
                serie_type_alertwarningverify = 'column';
                min_y = 0;
                min_x = 0;
                max_x = 360;
                xaxys_title = '%';
                polar_chart = true;
                xaxys_type = '';
                tick_interval_x = 22.5;
                xaxis_tickposition = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5];
                rangeselector_enabled = false;
                navigator_enabled = false;
                markers_on_line = false;
                enable_label_y = false;
                showInLegend_serie1 = true;
                scrollbar_enabled = false;
                series_color = '#7cb5ec';
                plotOptions_stacking = 'normal';
                plotOptions_shadow = false;
                plotOptions_groupPadding = 0;
                plotOptions_pointPlacement = 'on';
		legend_enabled = true;
                //point_symbol = 'triangle-down';
                //marker_fillcolor = 'rgba(100,100,100,0)';
                //markerline_width = 1;
                //markerline_color = 'green';
                break;
	case 'RADD':
                plot_title = 'Radiazione globale';
		type_series = 'area';
                udm = 'W/m2';
                markers_on_line = false;
                series_color = '#DAA520';
                break;
	case 'VIS':
                plot_title = 'Andamento della visibilita';
                udm = 'km';
                markers_on_line = false;
                series_color = 'green';
                soglia2 = 1;
                label_soglia2 = 'Nebbia';
		series_negativecolor = '#DAA520';
		series_treshold = 1;
		soglia1 = 10;
		label_soglia1 = 'Foschia';
                yaxys_type = 'logarithmic';
                min_y = 0.01;
		series_color = '#6495ED';
                break;
	case 'PORTATA':
		plot_title = 'Portata';
		udm = 'm3/s';
		soglia = -999;
                <?php if(!empty($sogliaP1)) { ?>
                soglia1 = <?php echo $sogliaP1; ?>;
                soglia = soglia1 + 0.1;
                <?php } ?>
                <?php if(!empty($sogliaP2)) { ?>
                soglia2 = <?php echo $sogliaP2; ?>;
                soglia = soglia2 + 0.1;
                <?php } ?>
                <?php if(!empty($sogliaP3)) { ?>
                soglia3 = <?php echo $sogliaP3; ?>;
                soglia = soglia3 + 0.1;
                <?php } ?>
                label_soglia2 = 'Livello di attenzione';
                label_soglia3 = 'Livello di pericolo';
		markers_on_line = false;
		if (soglia1) min_y = Math.min(lowest, soglia1);
		else min_y = lowest;
                max_y = Math.max(highest, soglia);
                //tick_interval_y = 0.4;
		break;
	default:
		plot_title = 'Andamento del parametro nel tempo';
		udm = 'n.d.';
	}
}

//var query = "<?php //echo $query; ?>";
var id_parametro = '<?php echo $id_parametro; ?>';
//var tipo_validaz = '<?php //echo $tipo_validaz; ?>';
var data_agg = '<?php echo $data_agg; ?>';
var denominazione = '<?php echo $denominazione; ?>';
var quota = <?php echo $quota; ?>;
//var codice_istat = '<?php //echo $codice_istat; ?>';
//var progr_punto_com = <?php //echo $progr_punto_com; ?>;
var codice_istat, progr_punto_com;
graph_data = <?php echo json_encode($data_array); ?>;
graph_data_cum = <?php echo json_encode($data_array_cum); ?>;
graph_data_raf = <?php echo json_encode($data_array_raf); ?>;
graph_data_alert = <?php echo json_encode($data_array_alert); ?>;
graph_data_warning = <?php echo json_encode($data_array_warning); ?>;
graph_data_validate = <?php echo json_encode($data_array_validate); ?>;
graph_data_dew = <?php echo json_encode($data_array_dew); ?>;
graph_data_mslp = <?php echo json_encode($data_array_mslp); ?>;
graph_data_temp = <?php echo json_encode($data_array_temp); ?>;

var highest_cum = Math.max.apply( Math, $.map(graph_data_cum, function(o){ return o[1]; }) );
var highest = Math.max.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
var lowest  = Math.min.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );

//alert(highest,lowest);

set_options(id_parametro);

//Definisco gli elementi series e yaxis per i grafici combinati:
//DA SVILUPPARE!!!


$(function() {

/*
var id_parametro = '<?php //echo $id_parametro; ?>';
graph_data = <?php //echo json_encode($data_array); ?>;
set_options(id_parametro);
*/

//proviamo Highcharts:
Highcharts.setOptions({
    lang: {
        contextButtonTitle: ['Download chart as SVG']
    }
});
$('#container').highcharts('StockChart', {
//$('#container').highcharts( {
        chart: {
            type: type_chart,
	    //plotBackgroundImage: '/common/icons/ARPA_Piem.jpg',
	    polar: polar_chart,
                plotBackgroundColor: {
                        linearGradient: { x1: 1, y1: 0, x2: 1, y2: 1 },
                        stops: [
                        [0, 'rgb(255, 255, 255)'],
                        [1, 'rgb(200, 200, 255)']
                        //[0, '#FFF'], [1, '#DDD']
                        ]
                }
        },
	credits: {
		text: 'Arpa Lombardia - ultimo agg. '+data_agg
		,href: 'http://ita.arpalombardia.it/'
	/*
	    position: {
	        align: 'left',
        	verticalAlign: 'bottom',
	        x: 10,
        	y: -10
	    }
	*/
	},
	title: { text: 'Stazione '+denominazione+' - quota '+quota+' slm' },
        subtitle: {
            text: plot_title
        },
	exporting: {
            //width: 1920
	    chartOptions:{
                legend:{enabled:false},
		rangeSelector: {enabled: false},
		navigator: {enabled: false},
		scrollbar: {enabled: false}
            },
	    filename: denominazione+'_'+id_parametro
	    //Per evitare di scegliere l'estensione, faccio esportare solo in svg:
	    ,buttons: {
                contextButton: {
                    menuItems: null,
                    onclick: function () {
                        this.exportChart();
                    }
                }
            }
	    ,type: 'image/svg+xml'
	},
	legend: {
	    	enabled: legend_enabled,
	    	align: 'center',
        	//backgroundColor: '#FCFFC5',
        	borderColor: 'black',
        	borderWidth: 1,
	    	layout: 'vertical',
	    	verticalAlign: 'top',
	    	y: 0, x: 275,
		floating: true,
	    	shadow: true
	},
        xAxis: {
                type: xaxys_type,
                gridLineWidth: 1,
		ordinal: false
		,tickInterval: tick_interval_x
                ,tickPositions: xaxis_tickposition
                ,min: min_x
                ,max: max_x
                ,tickmarkPlacement: 'on'
                ,title: {
                        text: xaxys_title
                }
                ,labels: {
                        formatter: function() {
			if (id_parametro == 'DEFLUSSO') return this.value;
			else if (id_parametro == 'ROSE') {
                                return wind_categories[Math.round(this.value / 22.5)] + '*';
                                //return wind_categories[this.value];
                        }
			else return Highcharts.dateFormat('%d/%m/%y', this.value) + '<br />' + Highcharts.dateFormat('%H:%M', this.value);
                        }
                }
        },
	//Aggiungiamo alcune opzioni per HighStock:
	navigator: {
            enabled: navigator_enabled
        },
	scrollbar: {
            enabled: scrollbar_enabled
        },
	rangeSelector : {
		buttons : [{
			type : 'day',
			count : 1,
			text : '1d'
		}, {
			type : 'day',
			count : 2,
			text : '2d'
		}, {
		type : 'day',
                        count : 3,
                        text : '3d'
                }, {
			type : 'all',
			count : 1,
			text : 'All'
		}],
		selected : 0,
		inputEnabled : false,
		enabled: rangeselector_enabled
	},
        yAxis: {
	    id: 'general_yaxis',
            type: yaxys_type,
	    minRange: min_range_y,
	    tickInterval: tick_interval_y,
	    min: min_y,
	    max: max_y,
            title: {
                text: udm
            },
            lineWidth: 2,
	    labels: {
            formatter: function() {
		if (id_parametro=='DIRV') {
                    var value = wind_dir[this.value];
                    return value !== 'undefined' ? value : this.value;
		}
		else return this.value;
            }
	    ,align: 'right', x:-5
	    ,style: { color: series_color, fontWeight:'bold' }
	    ,enabled: enable_label_y
            },
            plotLines: [
                {
                color: '#FFFF00', // Color value
                value: soglia1,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia1,
			align: 'right'
                }
                },
                {
                color: '#FFC000', // Color value
                value: soglia2,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia2,
			align: 'right'
                }
                },
                {
                color: '#FF6600', // Color value
                value: soglia3,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia3,
			align: 'right'
                }
                },
                {
                color: '#FF0000', // Color value
                value: soglia4,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia4,
			align: 'right'
                }
                }
            ]
        },
	/*
	plotOptions: {
                line: {
                    marker: {
                        enabled: markers_on_line
                    }
                }
        },
	*/
	//Opzioni per ROSE da verificare se valide anche per gli altri:
        plotOptions: {
            series: {
                stacking: plotOptions_stacking,
                shadow: plotOptions_shadow,
                groupPadding: plotOptions_groupPadding,
                pointPlacement: plotOptions_pointPlacement
            }
        },
        series: [
            {name: name_series,
	    type: type_series,
            showInLegend: showInLegend_serie1,
            data: graph_data,
	    step: step_line,
            shadow : shadow_line,
	    marker: {
		enabled: markers_on_line,
                    symbol: point_symbol,
		    fillColor: marker_fillcolor,
		    lineColor: markerline_color,
		    lineWidth: markerline_width
            },
		tooltip: {
                        valueSuffix: suffix_series
                },
	    threshold: series_treshold,
	    color: series_color,
	    negativeColor: series_negativecolor
        }
	,{name: 'seconda_serie',
            showInLegend: showInLegend_serie2,
            //data: graph_data,
            //step: step_line,
            //shadow : shadow_line,
            marker: {
                    symbol: point_symbol,
                    fillColor: marker_fillcolor,
                    lineColor: markerline_color,
                    lineWidth: markerline_width
            },
            threshold: series_treshold,
            color: series_color,
            negativeColor: series_negativecolor
        }
	,{name: 'terza_serie',
            showInLegend: showInLegend_serie3,
            marker: {
                symbol: point_symbol,
                fillColor: marker_fillcolor,
                lineColor: markerline_color,
                lineWidth: markerline_width
            },
            threshold: series_treshold,
            color: series_color,
            negativeColor: series_negativecolor
        }
	,{name: name_alert_serie,
            showInLegend: true,
            data: graph_data_alert,
            type: serie_type_alertwarningverify,
            //shadow : shadow_line,
            marker: {
		//symbol: 'url(/common/icons/plot_warning.png)'
                    symbol: 'circle',
                    fillColor: 'red',
                    lineColor: markerline_color,
                    lineWidth: markerline_width
		    ,enabled: enabled_marker_alertwarningverify
            }
            //threshold: series_treshold,
            //color: series_color,
            //negativeColor: series_negativecolor
        }
	,{name: name_warning_serie,
            showInLegend: true,
            data: graph_data_warning,
            type: serie_type_alertwarningverify,
            //shadow : shadow_line,
            marker: {
                    symbol: 'circle',
                    fillColor: 'orange',
                    lineColor: markerline_color,
                    lineWidth: markerline_width
		    ,enabled: enabled_marker_alertwarningverify
            }
            //threshold: series_treshold,
            //color: series_color,
            //negativeColor: series_negativecolor
        }
	,{name: name_verify_serie,
            showInLegend: true,
            data: graph_data_validate,
            type: serie_type_alertwarningverify,
            //shadow : shadow_line,
            marker: {
                    symbol: 'circle',
                    fillColor: 'yellow',
                    lineColor: markerline_color,
                    lineWidth: markerline_width
		    ,enabled: enabled_marker_alertwarningverify
            }
            //threshold: series_treshold,
            //color: series_color,
            //negativeColor: series_negativecolor
        }
        ],
        tooltip: {
                formatter: function() {
			//if(id_parametro=='VELV') return 'h'+Highcharts.dateFormat('%H:%M', this.x)+'  <b> '+this.y+udm+'-'+(this.y*3.6).toFixed(1)+'km/h';
		    if (id_parametro=='DEFLUSSO') return (this.y).toFixed(2) + 'm   <b> ' + (this.x).toFixed(1) + 'm3/s';
                        //else return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + udm;
		    else if (id_parametro=='ROSE') return wind_categories[this.x/22.5] + '  <b> ' + this.y + '%</b>';
		    else if (id_parametro=='TP') return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + ' ' + synop_code[this.y];
		    else return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + udm;
                },
		shared: true
                ,crosshairs: true
        }
    });


//Aggiungo la serie di dati per la PIOGGIA CUMULATA:
if(id_parametro=='PLUV') {

	var chart = $('#container').highcharts();

	chart.addAxis({ // Secondary yAxis
            id: 'rainfall-axis',
	    min: 0,
	    max: Math.max(highest_cum, 50), //NON RIESCO A FARGLI PRENDERE IL VALORE MAX SULLE Y....
            title: {
                text: 'Pioggia cumulata [mm]'
            },
            lineWidth: 1,
            lineColor: 'green',
            opposite: true
	    ,labels: {
	        style: { color: 'green', fontWeight:'bold' }
	    }
        });

	var seconda_serie = chart.series[1];
	seconda_serie.update({
		name: 'pioggia_cum',
		yAxis: 'rainfall-axis',
		data: graph_data_cum,
		step: 'right',
		type: 'line',
		color: 'green',
		shadow: shadow_line,
		tooltip: {
			valueSuffix: 'mm'
		},
		shadow: false
	}, false);

	//chart.series[1].setData(graph_data_cum,true);
	chart.tooltip.options.shared = true;
	chart.tooltip.options.crosshairs = true;
	chart.tooltip.options.formatter = function() {
		//return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
		
		var s = [];
            $.each(this.points, function(i, point) {
		//s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+ point.series.name +': '+
		s.push('<span style="color:'+point.series.color+';font-weight:bold;">h'+Highcharts.dateFormat('%H:%M ', point.x)+
                    point.y + this.series.tooltipOptions.valueSuffix + '<span>');
            });
            return s.join('<br />');
	}

	chart.redraw();

	//var options = chart.options;
        //options.tooltip.shared = true;
	//chart = new Highcharts.Chart(options);	
}

//Aggiungo la serie di dati per la validazione dei dati NIVO:
if(id_parametro=='NIVO') {
        var chart = $('#container').highcharts();
	chart.yAxis[0].update({
	    max: Math.max(highest_cum, highest, 100)
	});

        var seconda_serie = chart.series[1];
        seconda_serie.update({
            name: 'pioggia cum',
            //yAxis: 'rainfall-axis',
            data: graph_data_cum,
            step: 'right',
            type: 'line',
            color: 'green',
            shadow: shadow_line,
            tooltip: {
                valueSuffix: 'mm'
            },
            shadow: false
	    ,showInLegend: true
        }, false);
	seconda_serie.hide();
	//Aggiungo l'asse per le temperature e relativa serie di dati:
	chart.addAxis({ // Secondary yAxis
            id: 'temp-axis',
            //min: 0,
            title: {
                text: 'Temperatura [°C]'
            },
            lineWidth: 1,
            lineColor: 'green',
            opposite: true
        });
	var terza_serie = chart.series[2];
	terza_serie.update({
            name: 'temperatura',
            yAxis: 'temp-axis',
            data: graph_data_temp,
            type: 'line',
	    tickInterval: 2.0,
            color: 'orange',
            shadow: true,
	    threshold: 0,
	    negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: '°C'
            }
            ,showInLegend: true
        }, false);
        terza_serie.hide();
        /*chart.addSeries({
            name: 'temperatura',
            yAxis: 'temp-axis',
            type: 'line',
	    tickInterval: 2.0,
            showInLegend: true,
            data: graph_data_temp,
            shadow : true,
	    tooltip: {
                valueSuffix: '°C'
            },
            marker: {
                symbol: point_symbol,
                fillColor: marker_fillcolor,
                lineColor: markerline_color,
                lineWidth: markerline_width
            },
            threshold: series_treshold,
            color: 'orange'
            //,negativeColor: 'blue'
        });*/

        //chart.series[1].setData(graph_data_cum,true);
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                var s = [];
            $.each(this.points, function(i, point) {
                //s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+ point.series.name +': '+
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">h'+Highcharts.dateFormat('%H:%M ', point.x)+
                    point.y + this.series.tooltipOptions.valueSuffix + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiungo la serie di dati per le RAFFICHE DI VENTO:
/*if(id_parametro=='VELV') {
        var chart = $('#container').highcharts();
        var seconda_serie = chart.series[1];
        seconda_serie.update({
                name: 'vento_raffiche',
                //yAxis: 'general_yaxis',
                data: graph_data_raf,
                //type: 'scatter',
		type: 'spline',
		//Colori trasparenti per nn far vedere la linea ma abilitare cmq il tooltip:
                color: 'rgba(255, 255, 255, 0.1)',
		negativeColor: 'rgba(255, 255, 255, 0.1)'
		,marker: {
		    enabled: true,
                    symbol: 'square',
                    fillColor: 'olive',
                    lineColor: markerline_color,
                    lineWidth: markerline_width
                }
        }, false);
	chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                var s = [];
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">h'+Highcharts.dateFormat('%H:%M ', point.x)+
			'  <b> '+this.y+udm+'-'+(this.y*3.6).toFixed(1)+'km/h' + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}*/

//Aggiungo la serie di dati per la temperatura percepita:
if(id_parametro=='DEW') {
        var chart = $('#container').highcharts();
        var seconda_serie = chart.series[1];
        seconda_serie.update({
                name: 'temp_rugiada',
                //yAxis: 'general_yaxis',
                data: graph_data_dew,
                //type: 'scatter',
                type: 'line',
		color: '#6495ED'
        }, false);
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                var s = [];
            $.each(this.points, function(i, point) {
		if(point.series.name=='temp_rugiada') {
		s.push('<span style="color:'+point.series.color+';font-weight:bold;">HI '+(this.y).toFixed(0)+ '</span>');
		}
		else {
                //s.push('<span style="color:'+point.series.color+';font-weight:bold;">h'+Highcharts.dateFormat('%H:%M ', point.x)+ '  <b> '+this.y+udm + '<span>');
		s.push('<span style="color:'+point.series.color+';font-weight:bold;">T ' + (this.y).toFixed(1) + udm + ' <b>(h '+Highcharts.dateFormat('%H:%M', point.x) + ')</span>');
		}
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiungo la serie di dati per la mslp:
if(id_parametro=='BARO') {
        var chart = $('#container').highcharts();
        var seconda_serie = chart.series[1];
        seconda_serie.update({
                name: 'baro_mslp',
                //yAxis: 'general_yaxis',
                data: graph_data_mslp,
                type: 'line',
		color: '#6495ED'
        }, false);
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                var s = [];
            $.each(this.points, function(i, point) {
		if(point.series.name=='baro_mslp') {
		s.push('<span style="color:'+point.series.color+';font-weight:bold;">mslp<b> '+this.y+udm + '<span>');
		}
		else {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">h'+Highcharts.dateFormat('%H:%M ', point.x)+ '  <b> '+this.y+udm + '<span>');
		}
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiorno il tooltip per la ROSE:
if(id_parametro=='ROSE') {
        var chart = $('#container').highcharts();
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                $.each(this.points, function(i, point) {
                        s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+point.series.name+
                                '\t'+point.y + '%<span>');
                });
                return '<b>'+wind_categories[this.x/22.5]+'</b><br/>'+s.join('<br />');
        }
        chart.yAxis[0].update({
            endOnTick: false
            ,showLastLabel: true
            ,reversedStacks: false
        });
        chart.redraw();
}

//Richiamo la funzione per recuperare le ore di alba e tramonto:
if(id_parametro!='ROSE' && id_parametro!='PORTATA_BIS' && id_parametro!='IDRO_BIS'  && id_parametro!='DEFLUSSO' && id_parametro!='MAX_IDRO') {
  calc_day_and_nigth(45.5, 9.7);
}


//Reference for timelabel: http://stackoverflow.com/questions/7101464/how-to-get-highcharts-dates-in-the-x-axis
//fine della pova con Highcharts
});

</script>

</head>

<body>

<div id="container" style="width:100%; height:400px;"></div>

</body>
</html>

