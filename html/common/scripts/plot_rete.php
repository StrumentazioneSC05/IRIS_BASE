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
In modo da poter essere plottati...
Lo script e' pensato in maniera tale da poter essere richiamato da altre pagine.
*/

date_default_timezone_set('UTC');

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

$realtimetable_from = 'realtime.meteo_real_time';
$basetable_from = 'dati_di_base.rete_meteoidrografica';

//Recupero alcune info dall'URL del popup.js:
if(isset($_GET['cod_staz'])){ //Nel caso si voglia richiamare la stazione tramite il codice stazione:
	$cod_staz = $_GET['cod_staz'];
	$conn = pg_connect($conn_string);
	if (!$conn) { // Check if valid connection
	        echo "Error Connecting to database <br>";
        	exit;
	}
	else {
		$query="SELECT codice_istat_comune, progr_punto_com FROM $basetable_from WHERE codice_stazione='$cod_staz';";
	        $result = pg_query($conn,$query);
		$primariga = pg_fetch_row($result, 0);
                $codice_istat = $primariga[0];
                $progr_punto_com = $primariga[1];
	}
}
//Se il cod_staz non e' nell'url la stazione viene piu' propriamente richiamata tramite codice_istat e progressivo:
else {
	$codice_istat = $_GET['codice_istat'];
	$progr_punto_com = $_GET['progr_punto_com'];
}
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
$id_parametro = $_GET['id_parametro'];
$data_array = array(); //variabile array dove stoccare i dati per la costruzione del grafico
$data_array_cum = array(); //variabile array dove stoccare i dati per la costruzione del grafico - PIOGGIA CUMULATA
$data_array_raf = array(); //variabile array dove stoccare i dati per la costruzione del grafico - RAFFICHE DI VENTO
$data_array_alert = array(); //variabile array dove stoccare i dati con tipologia di validazione "A-Alert"
$data_array_warning = array(); //variabile array dove stoccare i dati con tipologia di validazione "W-Warning"
$data_array_validate = array(); //variabile array dove stoccare i dati con tipologia di validazione "V-Verify"
$data_array_range = array(); //variabile array dove stoccare i dati per plottare un range e quindi [data, valore1, valore2]
$data_array_atl = array(); //variabile array stocca dati per curve segnalatrici atlante piogge
$data_array_dew = array(); //variabile array stocca dati temperatura di rugiada
$data_array_mslp = array(); //variabile array stocca dati temperatura di rugiada
$data_array_temp = array(); //variabile array stocca dati temperatura per validazione dati NIVO
$data_array_note_max_idro = array(); //variabile array dove stoccare le note sui massimi idrologici
$data_array_hmax  = array(); //variabile array dove stoccare valori max idrometrici BIS
$data_array_hmed = array(); //variabile array dove stoccare valori medi idrometrici BIS


//Recupero alcune informazioni generali dall'anagrafica, come soglie, denominazione, etc.
//Eventuali altre informazioni verranno dettagliate all'interno di ciascu parametyro:
$query_datigenerali = "SELECT a.denominazione, quota_int, b.codice1, b.codice2, b.codice3, c.codice1, c.codice2, c.codice3, e.soglia_allarme, c.dmv_base, c.dmv_deroga, d.codice2, d.codice3, b.zero_idrometrico FROM $basetable_from a LEFT OUTER JOIN dati_di_base.soglie_idrometriche b ON a.codice_istat_comune = b.codice_istat_comune AND a.progr_punto_com = b.progr_punto_com and id_parametro like 'IDRO%' LEFT OUTER JOIN dati_di_base.soglie_idrometriche c ON a.codice_istat_comune = c.codice_istat_comune AND a.progr_punto_com = c.progr_punto_com and c.id_parametro like 'PORTATA%' LEFT OUTER JOIN dati_di_base.soglie_gamma d ON a.codice_istat_comune = d.codice_istat_comune AND a.progr_punto_com = d.progr_punto_com LEFT OUTER JOIN realtime.bis_stato e ON a.codice_istat_comune||a.progr_punto_com = e.codice WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com;";


if($id_parametro=='PLUV') {
	//Problema questa query: fa vedere anche i dati intermedi se l'ora non e' completa
	// $query = "SELECT max(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone) AS data, sum(valore_originale) AS valore_originale, max(tipologia_validaz), max(data_agg) FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' GROUP BY ceil(extract('epoch' from to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone) / 3600) ORDER BY data;";
	//Problema questa query: accorpa come dato orario dei dati anche se il ciclo orario non e' completo
	//$query = "SELECT to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval AS data, sum(valore_originale) AS valore_originale, max(tipologia_validaz), max(data_agg) FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' GROUP BY to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval ORDER BY data ASC;";
        //Correggo la tipologia di validazione in modo da prendere il dato peggiore:
        $query = <<<EOT
SELECT to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval AS data, sum(valore_originale) AS valore_originale, CASE
WHEN string_agg(substring(tipologia_validaz,1,1),'') LIKE '%A%' THEN 'A'
WHEN string_agg(substring(tipologia_validaz,1,1),'') LIKE '%W%' THEN 'W'
WHEN string_agg(substring(tipologia_validaz,1,1),'') LIKE '%V%' THEN 'V'
ELSE 'O'
END AS tipo_val,  max(data_agg) FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' GROUP BY to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval ORDER BY data ASC;
EOT;
	//$query_cumulata = "SELECT data+ora::time AS dataora, sum(valore_originale) OVER (ORDER BY data+ora::time) FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='$id_parametro';";
	//Mh...la cumulata in realta' sono i dati ogni 10minuti, e la query normale sono ogni ora... Il codice di validazione lo devo associare al dato ogni 10', quindi devo recuperare la validazione dalla cumulata:
	$query_cumulata = <<<EOT
SELECT data+ora::time AS dataora, sum(valore_originale) OVER (ORDER BY data+ora::time),
CASE WHEN substring(tipologia_validaz,1,1) LIKE '%A%' THEN 'A' WHEN substring(tipologia_validaz,1,1) LIKE '%W%' THEN 'W' WHEN substring(tipologia_validaz,1,1) LIKE '%V%' THEN 'V' ELSE 'O'
END AS tipo_val
FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='$id_parametro';
EOT;
}
else if($id_parametro=='ATL') {
        $query = "SELECT tr, array_to_string(durate,','), array_to_string(pioggia,','), data_agg FROM dati_di_base.atlante_piogge_lspp WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;";
}
else if($id_parametro=='SLOPS') {
	/*$query = <<<EOT
SELECT date_trunc('hour', dd)::timestamp without time zone AS data, sum
FROM generate_series (now()-
--'24 hour'::interval 
(SELECT ore_pioggia::integer+1 FROM  dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com) * '1 hour'::interval
, now(), '1 hour'::interval) dd
LEFT OUTER JOIN (
SELECT data+ora::time AS dataora, sum(valore_originale) OVER (ORDER BY data+ora::time) FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='PLUV' AND data+ora::time >= now()-
--'24 hour'::interval
(SELECT ore_pioggia::integer+1 FROM  dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com) * '1 hour'::interval
) AS cum_pioggia ON date_trunc('hour', dd)=cum_pioggia.dataora;
EOT;
	$query_cumulata = <<<EOT
SELECT data, a*((row_number+11)^(mcmean)), row_number, mcmean, a, ore_pioggia, lasttime_value, lasttime_value - (ore_pioggia * INTERVAL '1 hour') + '12 hour'::interval AS starttime, valore_p, infiltrazione, valore_i
FROM (
SELECT date_trunc('hour', dd)::timestamp without time zone AS data, row_number() over (order by date_trunc('hour', dd)::timestamp without time zone ASC)
FROM generate_series ( 
(SELECT lasttime_value - (ore_pioggia * INTERVAL '1 hour') + '12 hour'::interval FROM dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com)
, now(), '1 hour'::interval) dd
) AS tempo
, dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;
EOT;*/
	//Con le query a 10':
	$query = <<<EOT
SELECT dd::timestamp without time zone AS data, sum+infiltrazione
FROM generate_series (date_trunc('hour',now())-
(SELECT ore_pioggia::integer+1 FROM  dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com) * '1 hour'::interval
, now(), '10 minute'::interval) dd
LEFT OUTER JOIN (
SELECT data+ora::time AS dataora, sum(valore_originale) OVER (ORDER BY data+ora::time) FROM realtime.meteo_real_time WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='PLUV' AND valore_originale IS NOT NULL AND substring(tipologia_validaz, 1, 1) != 'A' AND data+ora::time >= 
(SELECT lasttime_value - ore_pioggia * INTERVAL '1 hour' FROM  dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com)
) AS cum_pioggia ON date_trunc('minute', dd)=cum_pioggia.dataora
LEFT OUTER JOIN dati_di_base.smart_slops ON codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;
EOT;
	//In realta in questo caso la cumulata e' la curva della soglia I. Con passo 30'
        $query_cumulata = <<<EOT
WITH tempi AS (
SELECT lasttime_value, lasttime_value - (ore_pioggia::integer * INTERVAL '1 hour') + '12 hour'::interval AS start_date
FROM dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com)
SELECT data, 
a*(((((row_number::numeric(3,1)-1)/2)+12)::numeric(3,1))^(mcmean)) AS soglia, row_number, mcmean, a, ore_pioggia, lasttime_value, lasttime_value - (ore_pioggia::integer * INTERVAL '1 hour') + '12 hour'::interval AS starttime, valore_p, infiltrazione, valore_i
FROM (
SELECT dd::timestamp without time zone AS data, row_number() over (order by dd::timestamp without time zone ASC)
FROM generate_series (
(SELECT date_trunc('hour', start_date) + date_part('minute', start_date)::int / 30 * interval '30 min' FROM tempi), (SELECT date_trunc('hour', lasttime_value) + date_part('minute', start_date)::int / 30 * interval '30 min' FROM tempi), '30 minute'::interval) dd
) AS tempo , dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;
EOT;
	//Con passo come la pioggia cioe' 10':
        $query_cumulata = <<<EOT
WITH tempi AS (
SELECT lasttime_value, lasttime_value - (ore_pioggia::integer * INTERVAL '1 hour') + '12 hour'::interval AS start_date
FROM dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com)
SELECT data,
a*(((((row_number-1)/6)+12))^(mcmean))::numeric(5,2) AS soglia, row_number, mcmean, a, ore_pioggia, lasttime_value, lasttime_value - (ore_pioggia::integer * INTERVAL '1 hour') + '12 hour'::interval AS starttime, valore_p, infiltrazione, valore_i
FROM (
SELECT dd::timestamp without time zone AS data, row_number() over (order by dd::timestamp without time zone ASC)
FROM generate_series (
(SELECT start_date FROM tempi), (SELECT lasttime_value FROM tempi), '10 minute'::interval) dd
) AS tempo , dati_di_base.smart_slops WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;
EOT;
}
else if($id_parametro=='NIVO') {
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale*100, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' ORDER BY data ASC;";
	//provo query che crea serie temporale costante passo 30minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale*100 as valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati cumulata pioggia per validazione con lo stesso step temporale dei dati nivo:
	$query_cumulata = "SELECT dd::timestamp without time zone as data, valore_originale FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT data+ora::time AS data, sum(valore_originale) OVER (ORDER BY data+ora::time) as valore_originale FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='PLUV') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati temperatura per validazione:
	$query_temp = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz/*, max(dati_staz.data_agg) OVER () AS data_agg*/ FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') AS dati_staz ON (dd=data) ORDER BY data ASC;"; 
}
else if($id_parametro=='FEST') {
	$query_datigenerali = "SELECT denominazione, quota_int FROM idro.v_radar_soglie WHERE istat_progr = '$codice_istat';";
	$query = <<<EOT
        SELECT dd::timestamp without time zone AS data, 
		dati.cum_rain, dati.threshold, dati.alert, dati.last_update
        FROM generate_series (date_trunc('hour', now())-'24 hour'::interval , date_trunc('hour', now())+'0.5 hour'::interval, '5 minutes'::interval) dd
		LEFT OUTER JOIN (
		SELECT dataora, cum_rain, threshold, alert, last_update FROM idro.radar_soglie WHERE codice='$codice_istat'
		) AS dati ON dd=dati.dataora;
EOT;
}
else if($id_parametro=='NIVOVAL') {
	$realtimetable_from = "realtime.neve_globale";
	$query_datigenerali = "SELECT denominazione, quota FROM realtime.v_last_nivo_validati WHERE codice_istat_comune = '$codice_istat' and progr_punto_com = $progr_punto_com;";
	//provo query che crea serie temporale costante passo 1 giorno:
	$query = "SELECT dd::timestamp without time zone as data, hs_validato, hs_flag_validaz, hn_validato, hn_flag_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(data) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com) , now(), '1 day'::interval) dd LEFT OUTER JOIN (SELECT data, hs_validato, hs_flag_validaz, hn_validato, hn_flag_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com) AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='IDROC') {
	$realtimetable_from = "realtime.canali";
	$query_datigenerali = "SELECT denominazione, quota_stazione FROM idro.misuratori_canali WHERE codice_istat_comune = '$codice_istat' and progr_punto_com = $progr_punto_com;";
	//provo query che crea serie temporale costante passo 60minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'IDRO%') , now(), '60 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'IDRO%' ORDER BY id_parametro LIMIT 1) ) AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='PORTATAC') {
	$realtimetable_from = "realtime.canali";
	$query_datigenerali = "SELECT denominazione, quota_stazione FROM idro.misuratori_canali WHERE codice_istat_comune = '$codice_istat' and progr_punto_com = $progr_punto_com;";
	//provo query che crea serie temporale costante passo 30minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_validato, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'PORTATA%') , now(), '60 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'PORTATA%' ORDER BY id_parametro LIMIT 1) ) AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='IDRO') {
	//Visto che alcune stazioni hanno piu' di un idrometro, sono costretto a prenderne solo uno per stazione:
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%' ORDER BY id_parametro LIMIT 1) ORDER BY data ASC;";
	//provo query che crea serie temporale costante passo 30minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%' ORDER BY id_parametro LIMIT 1) ) AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='DEFLUSSO') {
	//Recupero tutti i dati e parametri che mi servono per costruire la curva della scala di deflusso:
	//$query = "SELECT a.valore_originale, to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone, b.* FROM realtime.meteo_real_time a LEFT JOIN dati_di_base.calcolo_portate b ON (b.codice_istat_comune=a.codice_istat_comune AND b.progr_punto_com=a.progr_punto_com) WHERE a.codice_istat_comune = '$codice_istat' and a.progr_punto_com = $progr_punto_com AND a.id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND a.id_parametro like 'IDRO%' ORDER BY id_parametro LIMIT 1)  AND b.data_fine_validita IS NULL order by to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone DESC LIMIT 1;";
	//Prendo solo le scale di deflusso per il parametro IDRO:
	$query = "SELECT a.valore_originale, to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone, b.* FROM realtime.meteo_real_time a LEFT JOIN dati_di_base.calcolo_portate b ON (b.codice_istat_comune=a.codice_istat_comune AND b.progr_punto_com=a.progr_punto_com AND a.id_parametro=b.id_parametro) WHERE a.codice_istat_comune = '$codice_istat' and a.progr_punto_com = $progr_punto_com AND a.id_parametro LIKE 'IDRO%' AND b.data_fine_validita IS NULL order by to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone DESC LIMIT 1;";
}
else if($id_parametro=='MAX_IDRO') {
	//Recupero le informazioni per costruire il grafico a colonne per i max storici idrologici:
	$query = "SELECT data, valore, note FROM dati_di_base.massimi_storici_idrologici WHERE codice_istat_comune = '$codice_istat' and progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND a.id_parametro like 'IDRO%' ORDER BY id_parametro LIMIT 1) ORDER BY data;";
}
else if($id_parametro=='SEZFLUV') {
        $query = "SELECT dd::real/100 AS xaxys, profilo_z, (SELECT valore_originale FROM realtime.meteo_real_time WHERE codice_istat_comune||progr_punto_com='$codice_istat$progr_punto_com' AND id_parametro='IDRO' ORDER BY to_timestamp(meteo_real_time.data || meteo_real_time.ora::text, 'YYYY-MM-DDHH24:MI:SS'::text) DESC LIMIT 1)::numeric(6,2) FROM generate_series ((SELECT (floor(min(profilo_x))*100)::integer FROM idro.sezioni_fluviali WHERE codice='$codice_istat$progr_punto_com'), (SELECT (ceil(max(profilo_x))*100)::integer FROM idro.sezioni_fluviali WHERE codice='$codice_istat$progr_punto_com'), 1) dd LEFT OUTER JOIN (SELECT profilo_x, profilo_z FROM idro.sezioni_fluviali WHERE codice='$codice_istat$progr_punto_com') AS fluvio ON (profilo_x::numeric(6,2)=dd::real/100) ORDER BY xaxys ASC;";
}
else if($id_parametro=='IDRO_BIS' || $id_parametro=='PORTATA_BIS') {
    if($id_parametro=='IDRO_BIS') {$parametri = array('H_MIN', 'H_MAX', 'H_MED');}
    else if($id_parametro=='PORTATA_BIS') {$parametri = array('Q_MIN', 'Q_MAX', 'Q_MED');}
        //Recupero le informazioni per costruire il grafico con le 3 curve MEDIE-MAX-MIN dei livelli stazioni BIS:
	//$query = "SELECT dd::date AS data, valore, descrizione FROM generate_series ((current_date - '365 days'::interval) , current_date, '1 day'::interval) dd LEFT OUTER JOIN (SELECT data::date AS data, valore, descrizione, last_update FROM realtime.v_stazioni_bis_data a WHERE a.codice = '$codice_istat$progr_punto_com' AND id_parametro like '$parametri[0]') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Per recuperare eventuali doppie note:
	$query = "SELECT dd::date AS data, valore, descrizione FROM generate_series ((current_date - '365 days'::interval) , current_date, '1 day'::interval) dd LEFT JOIN (SELECT data::date AS data, max(valore) AS valore, string_agg(descrizione, ' - ') AS descrizione FROM realtime.v_stazioni_bis_data a WHERE a.codice = '$codice_istat$progr_punto_com' AND id_parametro like '$parametri[0]' GROUP BY data::date) AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo altre 2 serie: valori MINIMI e MEDI, sfruttando le variabili gia create per i dati NIVO:
	$query_cumulata = "SELECT dd::date AS data, valore FROM generate_series ((current_date - '365 days'::interval) , current_date, '1 day'::interval) dd LEFT OUTER JOIN (SELECT data::date AS data, valore, descrizione, last_update FROM realtime.v_stazioni_bis_data a WHERE a.codice = '$codice_istat$progr_punto_com' AND id_parametro like '$parametri[1]') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	$query_temp = "SELECT dd::date AS data, valore FROM generate_series ((current_date - '365 days'::interval) , current_date, '1 day'::interval) dd LEFT OUTER JOIN (SELECT data::date AS data, valore, descrizione, last_update FROM realtime.v_stazioni_bis_data a WHERE a.codice = '$codice_istat$progr_punto_com' AND id_parametro like '$parametri[2]') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if(stristr($id_parametro, 'SPI')) {
    //Devo recuperare in questo caso le curve per 4 parametri:
    $parametri = array('SPI01', 'SPI03', 'SPI06', 'SPI12');
    //$query = "SELECT (dd - '00:00:01'::interval)::date as data, valore, denominazione FROM generate_series ('1913-02-01'::date , current_date+'1 month'::interval, '1 month'::interval) dd LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico a, dati_di_base.bacini_siccita b WHERE a.codice = '$codice_istat' AND b.codice = '$codice_istat' AND id_parametro like '$parametri[1]') AS dati_staz ON ((dd - '00:00:01'::interval)::date=data) ORDER BY data ASC;";
    //Proviamo con una UNICA query:
    $query = <<<EOT
		SELECT (dd - '00:00:01'::interval)::date as data, dati_staz03.valore AS spi03, dati_staz03.denominazione, dati_staz01.valore AS spi01, dati_staz06.valore AS spi06, dati_staz12.valore AS spi12 FROM generate_series ('1913-02-01'::date , current_date+'1 month'::interval, '1 month'::interval) dd
		LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico f, dati_di_base.bacini_siccita h
		WHERE f.codice = '$codice_istat' AND h.codice = '$codice_istat' AND id_parametro like '$parametri[0]') AS dati_staz01 ON ((dd - '00:00:01'::interval)::date=dati_staz01.data)
		LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico a, dati_di_base.bacini_siccita b
		WHERE a.codice = '$codice_istat' AND b.codice = '$codice_istat' AND id_parametro like '$parametri[1]') AS dati_staz03 ON ((dd - '00:00:01'::interval)::date=dati_staz03.data)
		LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico d, dati_di_base.bacini_siccita e
		WHERE d.codice = '$codice_istat' AND e.codice = '$codice_istat' AND id_parametro like '$parametri[2]') AS dati_staz06 ON ((dd - '00:00:01'::interval)::date=dati_staz06.data)
		LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico c, dati_di_base.bacini_siccita d
		WHERE c.codice = '$codice_istat' AND d.codice = '$codice_istat' AND id_parametro like '$parametri[3]') AS dati_staz12 ON ((dd - '00:00:01'::interval)::date=dati_staz12.data)
		ORDER BY data ASC;
EOT;
}
else if(stristr($id_parametro, 'PAL01')) {
    $parametri = array('PAL01');
    //Ronchi richiede anche dati SPI01: aggiungo
    $query = <<<EOT
                SELECT (dd - '00:00:01'::interval)::date as data, dati_staz01.denominazione, dati_staz01.valore AS pal01, dati_staz02.valore AS spi01, dati_staz03.valore AS spi03 FROM generate_series ('1958-02-01'::date , current_date, '1 month'::interval) dd
                LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico f, dati_di_base.bacini_siccita h
                WHERE f.codice = '$codice_istat' AND h.codice = '$codice_istat' AND id_parametro like '$parametri[0]') AS dati_staz01 ON ((dd - '00:00:01'::interval)::date=dati_staz01.data)
		LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico f, dati_di_base.bacini_siccita h
                WHERE f.codice = '$codice_istat' AND h.codice = '$codice_istat' AND id_parametro like 'SPI01') AS dati_staz02 ON ((dd - '00:00:01'::interval)::date=dati_staz02.data)
		LEFT OUTER JOIN (SELECT data::date AS data, valore, denominazione FROM realtime.bacini_siccita_storico f, dati_di_base.bacini_siccita h
                WHERE f.codice = '$codice_istat' AND h.codice = '$codice_istat' AND id_parametro like 'SPI03') AS dati_staz03 ON ((dd - '00:00:01'::interval)::date=dati_staz03.data)
                ORDER BY data ASC;
EOT;
}
else if($id_parametro=='FEWS' || $id_parametro=='FEWSQ') {
    $query_datigenerali = "SELECT a.shortname||' ('||a.provincia||')' AS denominazione, elev AS quota_int FROM fews.rete_fews a WHERE a.id = 'I-$codice_istat';";
        //$parametri = array('MC', 'M1', 'SO', 'HE');
        if ($id_parametro=='FEWS') $filter_param = 'H';
        else if ($id_parametro=='FEWSQ') $filter_param = 'Q';
    $query = <<<EOT
	SELECT date_trunc('hour', dd)::timestamp without time zone AS data,
		dati_oss.event_value AS oss, dati_oss.dataora_valore AS dataora_oss
		,m1_model.event_value AS m1, m1_model.dataora_forecast AS m1_tof, m1_model.id_modello
		,so_model.event_value AS so, so_model.dataora_forecast AS so_tof, so_model.id_modello
		,he_model.event_value AS he, he_model.dataora_forecast AS he_tof, he_model.id_modello
	FROM generate_series (now()-'24 hour'::interval , now()+'72 hour'::interval, '1 hour'::interval) dd
	LEFT OUTER JOIN (
	SELECT (event_date||' '||event_time)::timestamp without time zone AS dataora_valore, NULLIF(event_value::numeric(6,2), 'NaN') AS event_value
        FROM fews.oss_idro
        WHERE location_id = 'I-$codice_istat' AND id_parametro LIKE '$filter_param%'
	) AS dati_oss ON dati_oss.dataora_valore=date_trunc('hour', dd)
        LEFT OUTER JOIN (
	SELECT (event_date||' '||event_time)::timestamp without time zone AS dataora_valore, event_value::numeric(6,2), (creation_date||' '||creation_time)::timestamp without time zone AS dataora_forecast, id_modello
	FROM fews.previ_idro
	WHERE location_id = 'I-$codice_istat' AND id_parametro = '$filter_param.simulated.forecast' AND id_modello = 'M1' AND (creation_date||' '||creation_time)::timestamp without time zone = (SELECT max((creation_date||' '||creation_time)::timestamp without time zone) FROM fews.previ_idro where location_id = 'I-$codice_istat' AND id_parametro = '$filter_param.simulated.forecast' AND id_modello = 'M1')
        ) AS m1_model ON m1_model.dataora_valore=date_trunc('hour', dd)
	LEFT OUTER JOIN (
        SELECT (event_date||' '||event_time)::timestamp without time zone AS dataora_valore, event_value::numeric(6,2), (creation_date||' '||creation_time)::timestamp without time zone AS dataora_forecast, id_modello
        FROM fews.previ_idro
        WHERE location_id = 'I-$codice_istat' AND id_parametro = '$filter_param.simulated.forecast' AND id_modello = 'SO' AND (creation_date||' '||creation_time)::timestamp without time zone = (SELECT max((creation_date||' '||creation_time)::timestamp without time zone) FROM fews.previ_idro where location_id = 'I-$codice_istat' AND id_parametro = '$filter_param.simulated.forecast' AND id_modello = 'SO')
        ) AS so_model ON so_model.dataora_valore=date_trunc('hour', dd)
	LEFT OUTER JOIN (
        SELECT (event_date||' '||event_time)::timestamp without time zone AS dataora_valore, event_value::numeric(6,2), (creation_date||' '||creation_time)::timestamp without time zone AS dataora_forecast, id_modello
        FROM fews.previ_idro
        WHERE location_id = 'I-$codice_istat' AND id_parametro = '$filter_param.simulated.forecast' AND id_modello = 'HE' AND (creation_date||' '||creation_time)::timestamp without time zone = (SELECT max((creation_date||' '||creation_time)::timestamp without time zone) FROM fews.previ_idro where location_id = 'I-$codice_istat' AND id_parametro = '$filter_param.simulated.forecast' AND id_modello = 'HE')
        ) AS he_model ON he_model.dataora_valore=date_trunc('hour', dd)
	ORDER BY dd ASC;
EOT;
}
else if($id_parametro=='FEWS_L' || $id_parametro=='FEWS_V') {
	$query_datigenerali = "SELECT a.name AS denominazione, elev AS quota_int, max_volume_mmc, max_livello_mslm FROM fews.v_invasi_rid a WHERE a.id = '$codice_istat';";
	if ($id_parametro=='FEWS_L') {
		$id_parametro='Liv.obs';
		$query = <<<EOT
        SELECT dd::timestamp without time zone AS data, event_value
        FROM generate_series ((
        SELECT min(to_timestamp(event_date || event_time, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) FROM fews.oss_idro a WHERE a.location_id = '$codice_istat' AND id_parametro='$id_parametro') , now(), '24 hour'::interval) dd
        LEFT OUTER JOIN (
        SELECT to_timestamp(event_date || event_time, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS dataora_valore, event_value FROM fews.oss_idro a WHERE a.location_id = '$codice_istat' AND id_parametro='$id_parametro'
        ) AS dati_oss ON dati_oss.dataora_valore=dd
        ORDER BY dd ASC;
EOT;
        	//Riporto le variabili a quelle consone:
		$id_parametro='DIGHE_L';
	}
        else if ($id_parametro=='FEWS_V') {
		$id_parametro='Vol.obs';
		$query = <<<EOT
        SELECT dd::timestamp without time zone AS data, event_value/1000000
        FROM generate_series ((
        SELECT min(to_timestamp(event_date || event_time, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) FROM fews.oss_idro a WHERE a.location_id = '$codice_istat' AND id_parametro='$id_parametro') , now(), '24 hour'::interval) dd
        LEFT OUTER JOIN (
        SELECT to_timestamp(event_date || event_time, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS dataora_valore, event_value FROM fews.oss_idro a WHERE a.location_id = '$codice_istat' AND id_parametro='$id_parametro'
        ) AS dati_oss ON dati_oss.dataora_valore=dd
        ORDER BY dd ASC;
EOT;
        	//Riporto le variabili a quelle consone:
        	$id_parametro='DIGHE_V';
	}
}
else if($id_parametro=='FEWS_T' || $id_parametro=='FEWS_P' || $id_parametro=='FEWS_H' || $id_parametro=='FEWS_Q') {
	if ($id_parametro=='FEWS_T') $id_parametro='T.obs.drybulb';
	else if ($id_parametro=='FEWS_P') $id_parametro='P.obs';
	else if ($id_parametro=='FEWS_H') $id_parametro='H.obs';
	else if ($id_parametro=='FEWS_Q') $id_parametro='Q.rated';
	else if ($id_parametro=='FEWS_L') $id_parametro='Liv.obs';
        else if ($id_parametro=='FEWS_V') $id_parametro='Vol.obs';
	$query_datigenerali = "SELECT a.shortname||' ('||a.provincia||')' AS denominazione, elev AS quota_int FROM fews.rete_fews a WHERE a.id = '$codice_istat';";
	$query = <<<EOT
	SELECT dd::timestamp without time zone AS data, event_value
	FROM generate_series ((
	SELECT min(to_timestamp(event_date || event_time, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) FROM fews.oss_idro a WHERE a.location_id = '$codice_istat' AND id_parametro='$id_parametro') , now(), '60 minute'::interval) dd
	LEFT OUTER JOIN (
	SELECT to_timestamp(event_date || event_time, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS dataora_valore, event_value FROM fews.oss_idro a WHERE a.location_id = '$codice_istat' AND id_parametro='$id_parametro'
	) AS dati_oss ON dati_oss.dataora_valore=dd
	ORDER BY dd ASC;
EOT;
	//Riporto le variabili a quelle consone:
	if ($id_parametro=='T.obs.drybulb') $id_parametro='TERMA';
        else if ($id_parametro=='P.obs') $id_parametro='PLUV';
        else if ($id_parametro=='H.obs') $id_parametro='IDRO';
        else if ($id_parametro=='Q.rated') $id_parametro='PORTATA';
}
else if($id_parametro=='PREVIDRO' || $id_parametro=='PREVIPO') {
	$parametri = array('MC', 'M1', 'SO', 'HE');
	if ($id_parametro=='PREVIDRO') $filter_param = 'PORTATA';
	else if ($id_parametro=='PREVIPO') $filter_param = 'IDRO';
	$query = <<<EOT
        SELECT date_trunc('hour', dd)::timestamp without time zone AS data, mc_model.valore AS mc, m1_model.valore AS m1, so_model.valore AS so, he_model.valore AS he, dati_oss.valore AS oss
        , mc_model.dataora_forecast AS mc_tof, m1_model.dataora_forecast AS m1_tof, so_model.dataora_forecast AS so_tof, he_model.dataora_forecast AS he_tof
        , mc_model.id_previ, mc_model.dataora_previ, m1_model.id_previ, m1_model.dataora_previ, so_model.id_previ, so_model.dataora_previ, he_model.id_previ, he_model.dataora_previ, dati_oss.dataora_valore AS dataora_oss
        FROM generate_series (now()-'24 hour'::interval , now()+'72 hour'::interval, '1 hour'::interval) dd
	LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[0]' AND dataora_forecast = (SELECT max(dataora_forecast) FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[0]')
        ) AS mc_model ON date_trunc('hour', dd)=mc_model.dataora_valore
        LEFT OUTER JOIN (
        SELECT to_timestamp(data||' '||ora, 'YYYY-MM-DD HH24:MI')::timestamp without time zone AS dataora_valore, valore_validato AS valore FROM realtime.meteo_real_time WHERE codice_istat_comune||progr_punto_com='$codice_istat$progr_punto_com' AND id_parametro = '$filter_param'
        ) AS dati_oss ON dati_oss.dataora_valore=date_trunc('hour', dd)
        LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[1]' AND dataora_forecast = (SELECT max(dataora_forecast) FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[1]')
        ) AS m1_model ON m1_model.dataora_valore=date_trunc('hour', dd)
        LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[2]' AND dataora_forecast = (SELECT max(dataora_forecast) FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[2]')
        ) AS so_model ON so_model.dataora_valore=date_trunc('hour', dd)
        LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[3]' AND dataora_forecast = (SELECT max(dataora_forecast) FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$filter_param' AND id_modello = '$parametri[3]')
        ) AS he_model ON he_model.dataora_valore=date_trunc('hour', dd)
        ORDER BY dd ASC;
EOT;
}
else if($id_parametro=='previMC') {
        $parametri = array('MC');
        $query = <<<EOT
        SELECT date_trunc('hour', dd)::timestamp without time zone AS data, m1.valore AS m1, m2.valore AS m2, m3.valore AS m3, m4.valore AS m4, dati_oss.valore AS oss
        , m1.dataora_forecast AS m1_tof, m2.dataora_forecast AS m2_tof, m3.dataora_forecast AS m3_tof, m4.dataora_forecast AS m4_tof
        , m1.id_previ, m1.dataora_previ, m2.id_previ, m2.dataora_previ, m3.id_previ, m3.dataora_previ, m4.id_previ, m4.dataora_previ, dati_oss.dataora_valore AS dataora_oss
        FROM generate_series (now()-'24 hour'::interval , now()+'72 hour'::interval, '1 hour'::interval) dd
        LEFT OUTER JOIN (
        SELECT to_timestamp(data||' '||ora, 'YYYY-MM-DD HH24:MI')::timestamp without time zone AS dataora_valore, valore_validato AS valore FROM realtime.meteo_real_time WHERE codice_istat_comune||progr_punto_com='$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA'
        ) AS dati_oss ON dati_oss.dataora_valore=date_trunc('hour', dd)
	LEFT OUTER JOIN (
	SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' AND dataora_forecast = (
	SELECT dataora_forecast FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' GROUP BY dataora_forecast ORDER BY dataora_forecast DESC LIMIT 1 OFFSET 0)
        ) AS m1 ON date_trunc('hour', dd)=m1.dataora_valore
	LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' AND dataora_forecast = (
        SELECT dataora_forecast FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' GROUP BY dataora_forecast ORDER BY dataora_forecast DESC LIMIT 1 OFFSET 1)
        ) AS m2 ON date_trunc('hour', dd)=m2.dataora_valore
	LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' AND dataora_forecast = (
        SELECT dataora_forecast FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' GROUP BY dataora_forecast ORDER BY dataora_forecast DESC LIMIT 1 OFFSET 2)
        ) AS m3 ON date_trunc('hour', dd)=m3.dataora_valore
	LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' AND dataora_forecast = (
        SELECT dataora_forecast FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' GROUP BY dataora_forecast ORDER BY dataora_forecast DESC LIMIT 1 OFFSET 3)
        ) AS m4 ON date_trunc('hour', dd)=m4.dataora_valore
        ORDER BY dd ASC;
EOT;
}
else if($id_parametro=='previPROB') {
        $parametri = array('MP', 'cosmo');
        $query = <<<EOT
	SELECT date_trunc('hour', dd)::timestamp without time zone AS data, max_modello.valore AS max_modello, min_modello.valore AS min_modello, dati_oss.valore AS oss, avg_modello.valore AS avg
        , max_modello.dataora_forecast AS max_modello_tof, min_modello.dataora_forecast AS min_modello_tof
        , max_modello.id_previ AS max_id_previ, max_modello.dataora_previ AS max_dataora_previ, min_modello.id_previ AS min_id_previ, min_modello.dataora_previ AS min_dataora_previ, onlymax.valore AS valorimax, onlymin.valore AS valorimin, dati_oss.dataora_valore AS dataora_oss
        FROM generate_series (now()-'24 hour'::interval , now()+'72 hour'::interval, '1 hour'::interval) dd
        LEFT OUTER JOIN (
        SELECT to_timestamp(data||' '||ora, 'YYYY-MM-DD HH24:MI')::timestamp without time zone AS dataora_valore, valore_validato AS valore FROM realtime.meteo_real_time WHERE codice_istat_comune||progr_punto_com='$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA'
        ) AS dati_oss ON dati_oss.dataora_valore=date_trunc('hour', dd)
        LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' AND id_previ = (
	SELECT id_previ FROM realtime.previsioni_idrologiche WHERE id_modello='$parametri[0]' AND id_previ like '$parametri[1]%' AND id_parametro = 'PORTATA' AND codice_stazione='$codice_istat$progr_punto_com' ORDER BY valore DESC LIMIT 1)
        ) AS max_modello ON date_trunc('hour', dd)=max_modello.dataora_valore
	LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = 'PORTATA' AND id_modello = '$parametri[0]' AND id_previ = (
	SELECT id_previ FROM realtime.previsioni_idrologiche WHERE id_modello='$parametri[0]' AND id_previ like '$parametri[1]%' AND id_parametro='PORTATA' AND codice_stazione='$codice_istat$progr_punto_com' ORDER BY valore ASC LIMIT 1)
        ) AS min_modello ON date_trunc('hour', dd)=min_modello.dataora_valore
        LEFT OUTER JOIN (	
SELECT dataora_valore, avg(valore) AS valore FROM realtime.previsioni_idrologiche WHERE id_modello='$parametri[0]' AND id_previ like '$parametri[1]%' AND id_parametro = 'PORTATA' AND codice_stazione='$codice_istat$progr_punto_com' GROUP BY dataora_valore ORDER BY dataora_valore
) AS avg_modello ON date_trunc('hour', dd)=avg_modello.dataora_valore
	LEFT OUTER JOIN (
SELECT dataora_valore, max(valore) AS valore FROM realtime.previsioni_idrologiche WHERE id_modello='$parametri[0]' AND id_previ like '$parametri[1]%' AND id_parametro = 'PORTATA' AND codice_stazione='$codice_istat$progr_punto_com' GROUP BY dataora_valore ORDER BY dataora_valore
) AS onlymax ON date_trunc('hour', dd)=onlymax.dataora_valore
        LEFT OUTER JOIN (
SELECT dataora_valore, min(valore) AS valore FROM realtime.previsioni_idrologiche WHERE id_modello='$parametri[0]' AND id_previ like '$parametri[1]%' AND id_parametro = 'PORTATA' AND codice_stazione='$codice_istat$progr_punto_com' GROUP BY dataora_valore ORDER BY dataora_valore
) AS onlymin ON date_trunc('hour', dd)=onlymin.dataora_valore;
EOT;
}
else if($id_parametro=='bilancioIDRO') {
        $parametri = array('MH', 'PORTATA');
        $query = <<<EOT
	SELECT date_trunc('hour', dd)::timestamp without time zone AS data, m1.valore AS m1, dati_oss.valore AS oss
        , date_trunc('hour',m1.dataora_forecast) AS m1_tof
        , m1.id_previ, m1.dataora_previ
        FROM generate_series (now()-'10 days'::interval , now()+'10 days'::interval, '1 hour'::interval) dd
        LEFT OUTER JOIN (
        SELECT to_timestamp(data||' '||ora, 'YYYY-MM-DD HH24:MI')::timestamp without time zone AS dataora_valore, valore_validato AS valore FROM $realtimetable_from WHERE codice_istat_comune||progr_punto_com='$codice_istat$progr_punto_com' AND id_parametro = '$parametri[1]'
        ) AS dati_oss ON dati_oss.dataora_valore=date_trunc('hour', dd)
        LEFT OUTER JOIN (
        SELECT dataora_valore, valore, id_modello, dataora_forecast, id_previ, dataora_previ FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$parametri[1]' AND id_modello = '$parametri[0]' AND dataora_forecast = (
        SELECT dataora_forecast FROM realtime.previsioni_idrologiche where codice_stazione = '$codice_istat$progr_punto_com' AND id_parametro = '$parametri[1]' AND id_modello = '$parametri[0]' GROUP BY dataora_forecast ORDER BY dataora_forecast DESC LIMIT 1 OFFSET 0)
        ) AS m1 ON date_trunc('hour', dd)=m1.dataora_valore
        ORDER BY dd ASC;
EOT;
}
else if($id_parametro=='SRI') {
	$query = <<<EOT
	SELECT (dd + '00:00:01'::interval)::date as data, valore
	FROM generate_series (date_trunc('month', current_date)-'12 month'::interval, current_date-'1 month'::interval, '1 month'::interval) dd
	LEFT OUTER JOIN (
	SELECT data::date AS data, valore FROM realtime.indice_sri c
	WHERE c.codice = '018107700' AND id_parametro = 'SRI' AND id_aggregazione='1m'
	) AS indice_sri ON ((dd + '00:00:01'::interval)::date=date_trunc('month',indice_sri.data))
	ORDER BY data ASC;
EOT;
}
else if($id_parametro=='PORTATA') {
	//Nel caso della PORTATA esiste solo il valore_validato. Alcune stazioni, avendo piu' idrometri, hanno anche piu' valori di portata. A noi pero' al momento interessa solo PORTATA:
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro' ORDER BY data ASC;";
	//provo query che crea serie temporale costante passo 30minuti:
        $query = "SELECT dd::timestamp without time zone as data, round(valore_validato), tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='DEW') {
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, zradar_td(dati_staz.valore_originale, umidita.igro), zradar_humidex(dati_staz.valore_originale, umidita.igro) FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') AS dati_staz ON (dd=dati_staz.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS igro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'IGRO%') AS umidita ON (dd=umidita.data) ORDER BY data ASC;";
}
else if($id_parametro=='IGRO') {
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati temperatura per validazione:
        $query_temp = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz/*, max(dati_staz.data_agg) OVER () AS data_agg*/ FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='BARO') {
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, zradar_mslp(dati_staz.valore_originale, temp.terma, umidita.igro, staz.quota) FROM  generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'BARO%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'BARO%') AS dati_staz ON (dd=dati_staz.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS igro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'IGRO%') AS umidita ON (dd=umidita.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS terma FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') AS temp ON (dd=temp.data)  LEFT OUTER JOIN (SELECT quota_int AS quota FROM dati_di_base.rete_meteoidrografica  a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com) AS staz ON (dd=temp.data) ORDER BY data ASC;";
}
else if($id_parametro=='VELV' or $id_parametro=='DIRV') {
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '10 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='ROSE') {
	//query per recuperare gli ultimi 145 valori:
	$query = "SELECT realtime.cardinal2degree(dirv.direction),round((count(velv.dataora) * 100 / max(dirv.total))) AS big_freq0,round((count(velv1.dataora) * 100 / max(dirv.total))) AS big_freq1,round((count(velv2.dataora) * 100 / max(dirv.total))) AS big_freq2,round((count(velv3.dataora) * 100 / max(dirv.total))) AS big_freq3,max(dirv.total) AS big_total, max(data_agg) as data_agg FROM (SELECT codice_istat_comune, progr_punto_com, data||ora AS dataora, data_agg, count(*) OVER () AS total, realtime.degree2cardinal(valore_originale) AS direction FROM $realtimetable_from WHERE id_parametro IN ('DIRV') AND valore_originale IS NOT NULL AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND data = current_date AND tipologia_validaz NOT LIKE 'A%' ) AS dirv LEFT JOIN (SELECT valore_originale AS speed0, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale < 0.5 AND data = current_date ) AS velv ON (velv.codice_istat_comune= dirv.codice_istat_comune AND velv.progr_punto_com= dirv.progr_punto_com AND velv.dataora = dirv.dataora) LEFT JOIN (SELECT valore_originale AS speed1, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale BETWEEN 0.5 AND 5 AND data = current_date ) AS velv1 ON (velv1.codice_istat_comune= dirv.codice_istat_comune AND velv1.progr_punto_com= dirv.progr_punto_com AND velv1.dataora = dirv.dataora) LEFT JOIN (SELECT valore_originale AS speed2, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale BETWEEN 5 AND 10 AND data = current_date ) AS velv2 ON (velv2.codice_istat_comune= dirv.codice_istat_comune AND velv2.progr_punto_com= dirv.progr_punto_com AND velv2.dataora = dirv.dataora) LEFT JOIN (SELECT valore_originale AS speed3, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale > 10 AND data = current_date ) AS velv3 ON (velv3.codice_istat_comune= dirv.codice_istat_comune AND velv3.progr_punto_com= dirv.progr_punto_com AND velv3.dataora = dirv.dataora) GROUP BY dirv.codice_istat_comune, dirv.progr_punto_com, dirv.direction ORDER BY dirv.codice_istat_comune, dirv.progr_punto_com, realtime.cardinal2degree(dirv.direction);";
}
else if($id_parametro=='VIS') {
	$parametri = array('VIS_1M', 'VIS_10M', 'VIS_ALA');
        $query = "SELECT dd::timestamp without time zone as data, valore_originale/100 AS km, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$parametri[1]') , now(), '10 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$parametri[1]') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='WTH') {
	$parametri = array('WTH 15M', ' WTH 1H');
        $query = "SELECT dd::timestamp without time zone as data, valore_originale/100 AS km, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$parametri[1]') , now(), '10 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$parametri[1]') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='TERMN') {
        $parametri = array('TERMNI', 'TERMN1', 'TERMN4', 'TERMN30', 'TERMN90');
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, term1.valore_originale, term4.valore_originale, term30.valore_originale, term90.valore_originale FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro='$parametri[0]') AS dati_staz ON (dd=data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro='$parametri[1]') AS term1 ON (dd=term1.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro='$parametri[2]') AS term4 ON (dd=term4.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro='$parametri[3]') AS term30 ON (dd=term30.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro='$parametri[4]') AS term90 ON (dd=term90.data) ORDER BY data ASC;";
}
else {
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%'  ORDER BY data ASC;";
	//provo query che crea serie temporale costante passo 30minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}


$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	$result = pg_query($conn, $query);
	$result_generale = pg_query($conn, $query_datigenerali);
        //if (!$result || !$result_generale) {
	if (!$result) {
                echo "Error on the query to extract data<br>";
		print $query;
        }
	else if (!$result_generale) {
                echo "Error on the query to extract anagraphic data<br>";
		print $query_datigenerali;
        }
        else {
                $numrows = pg_numrows($result);
		//$primariga = pg_fetch_row($result, 0); //prendo il primo record
		//$tipo_validaz = $primariga[2];
		//$data_agg = $primariga[3];
		//Prendo la prima riga per estrarre alcuni dati generali sulla stazione:
		$primariga = pg_fetch_row($result_generale, 0);
		$denominazione = addslashes($primariga[0]);
		if ($primariga[1]) $quota = $primariga[1];
		else $quota = 0;
		$last_data_oss = 0; //inziializzo la variabile con dataora ultimo dato osservato
		$first_data_oss = -9999; //inziializzo la variabile con dataora primo dato osservato

		//Recupero le soglie IDROmetriche:
		$soglia1 = is_null($primariga[2]) ? null : $primariga[2];
		$soglia2 = $primariga[3];
		$soglia3 = $primariga[4];
		//Recupero le soglie per la PORTATA:
		$sogliaP1 = $primariga[5];
                $sogliaP2 = $primariga[6];
                $sogliaP3 = $primariga[7];
		$soglia_equilibrio = $primariga[8]; //sostituito con soglia_allarme ovvero attenzione!!
		$soglia_dmv_base = $primariga[9];
		$soglia_dmv_deroga = $primariga[10];
		//Recupero le soglie per GAMMA:
		$sogliaG2 = $primariga[11];
                $sogliaG3 = $primariga[12];
		//Recupero lo zero idrometrico:
                $zero_idrometrico = $primariga[13];

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
		//Nel caso della temperatura calcolo anche la temperatura di rugiada:
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
			$data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[5]) ? null : round(floatval($row[5]),1));
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
		} //fine nel caso che il parametro sia DEFLUSSO
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
		else if ($id_parametro=='MAX_IDRO') {
		    while($row = pg_fetch_array($result)) {
			//Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                        $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
                        //Recupero l'array per la tipologia di validazione:
                        //$data_array_alert[] = array(strtotime($row[0])*1000, ($row[2][0]=='A') ? floatval($row[1]) : null);
                        //$data_array_warning[] = array(strtotime($row[0])*1000, ($row[2][0]=='W') ? floatval($row[1]) : null);
                        //$data_array_validate[] = array(strtotime($row[0])*1000, ($row[2][0]=='V') ? floatval($row[1]) : null);
			//Recupero il campo NOTE:
			$data_array_note_max_idro[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : $row[2]);
                        //La data_aggiornamento del dato la prendo una per tutti:
                        $data_agg = $row[3];
		    }
		}
		else if ($id_parametro=='IDRO_BIS' || $id_parametro=='PORTATA_BIS') {
                    while($row = pg_fetch_array($result)) {
                        //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                        $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
			//Recupero il campo NOTE:
                        $data_array_note_max_idro[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : $row[2]);
                        //La data_aggiornamento del dato la prendo una per tutti:
                        $data_agg = $row[0];
                    }
		    //Recupero anche i dati sui valori MIN MED sfruttando le variabili gia definite per i dati NIVO:
		    $result_hmax = pg_query($conn,$query_cumulata);
                    while($row_cum = pg_fetch_array($result_hmax)) {
                        $data_array_hmax[] = array(strtotime($row_cum[0])*1000, is_null($row_cum[1]) ? null : round(floatval($row_cum[1]),2));
                    }
		    $result_temp = pg_query($conn,$query_temp);
                    while($row_temp = pg_fetch_array($result_temp)) {
                        $data_array_temp[] = array(strtotime($row_temp[0])*1000, is_null($row_temp[1]) ? null : round(floatval($row_temp[1]),2));
                    }
                }
		//else if ($id_parametro=='SPI03') {
		else if(stristr($id_parametro, 'SPI')) {
		    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
		      //Sfruttando le variabili usati per la validazione recupero le altre 3 grandezze:
		      $data_array_alert[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //SPI01
		      $data_array_warning[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),2)); //SPI06
		      $data_array_validate[] = array(strtotime($row[0])*1000, is_null($row[5]) ? null : round(floatval($row[5]),2)); //SPI12
                      //La data_aggiornamento del dato la prendo una per tutti:
                      $data_agg = $row[3];
		      if (!empty($row[2])) $denominazione = $row[2];
                    }
                }
		else if ($id_parametro=='FEST') {
		   while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
                      //Sfruttando le variabili usati per la validazione recupero le altre 3 grandezze:
                      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2)); //threshold
		      //La data_aggiornamento del dato la prendo una per tutti:
                      $data_agg = $row[4];
                    }
		}
		else if ($id_parametro=='NIVOVAL') {
                   while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
		      $data_array_alert[] = array(strtotime($row[0])*1000, ($row[2]==1) ? floatval($row[1]) : null);
		      $data_array_warning[] = array(strtotime($row[0])*1000, (is_null($row[2])) ? floatval($row[1]) : null);
                      //Sfrutto variavili gia esistenti per recuperare la neve fresca:
                      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //threshold
                      //La data_aggiornamento del dato la prendo una per tutti:
                      $data_agg = $row[5];
                    }
                }
		else if(stristr($id_parametro, 'PAL')) {
                    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2));
		      //Recupero un'altra serie:
		      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //SPI01
		      $data_array_cum[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),2)); //SPI03
                      //La data_aggiornamento del dato la prendo una per tutti:
                      $data_agg = $row[0];
                      if (!empty($row[1])) $denominazione = $row[1];
                    }
                }
		else if($id_parametro=='SEZFLUV') {
                   while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                      $data_array[] = array($row[0], is_null($row[1]) ? null : round(floatval($row[1]),2));
		      //Sfrutto questa variabile, che contiene la data dell'ultimo dato osservato, per salvarmi invece il valore massimo del profilo_x:
		      $last_data_oss = $row[0];
		      if ($first_data_oss==-9999) $first_data_oss = $row[0];
		      $soglia1 = round($zero_idrometrico + $row[2], 2);
                    }
		}
		else if(stristr($id_parametro, 'PREVIPO')) {
                    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation'.
		      //Per primi mi carico i dati osservati:
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[5]) ? null : round(floatval($row[5]),2)); //dati_oss
		      //Poi il modello MC sfruttando l'array delle temperature:
		      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)-$zero_idrometrico); //MC
                      //Sfruttando le variabili usati per la validazione recupero le altre 3 grandezze:
                      $data_array_alert[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2)); //M1
                      $data_array_warning[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //SO
                      $data_array_validate[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),2)); //HE
		      //Recupero alcune info sui modelli meteo e la previsione una sola volta e prendo il primo valore non nullo:
		      if (!empty($row[6]) && !isset($tof_mc)) $tof_mc = date_create($row[6]);
		      if (!empty($row[7]) && !isset($tof_m1)) $tof_m1 = date_create($row[7]);
                      if (!empty($row[8]) && !isset($tof_so)) $tof_so = date_create($row[8]);
                      if (!empty($row[9]) && !isset($tof_he)) $tof_he = date_create($row[9]);
                      if (!empty($row[10]) && !isset($id_previ_mc)) {$id_previ_mc = $row[10]; //psa
			      $data_previ_mc = date_create($row[11]);}
		      if (!empty($row[12]) && !isset($id_previ_m1)) {$id_previ_m1 = $row[12]; //lami
	                      $data_previ_m1 = date_create($row[13]);}
		      if (!empty($row[14]) && !isset($id_previ_so)) {$id_previ_so = $row[14]; //lami
	                      $data_previ_so = date_create($row[15]);}
                      if (!empty($row[16]) && !isset($id_previ_he)) {$id_previ_he = $row[16]; //lami
	                      $data_previ_he = date_create($row[17]);}
                    }
		    //Rielaboro le date per visualzizazione piu semplice:
		    $tof_mc = date_format($tof_mc, 'd/m H:i');
		    $tof_m1 = date_format($tof_m1, 'd/m H:i');
		    $tof_so = date_format($tof_so, 'd/m H:i');
		    $tof_he = date_format($tof_he, 'd/m H:i');
		    $data_previ_mc = date_format($data_previ_mc, 'd/m');
		    $data_previ_m1 = date_format($data_previ_m1, 'd/m H');
                    $data_previ_so = date_format($data_previ_so, 'd/m H');
                    $data_previ_he = date_format($data_previ_he, 'd/m H');
		    //La data_aggiornamento del dato la prendo di oggi e via:
		    $data_agg = date('Y/m/d H:i'); 
                }
		else if(stristr($id_parametro, 'PREVIDRO')) {
                    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation'.
		      //Per primi mi carico i dati osservati:
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[5]) ? null : round(floatval($row[5]),2)); //dati_oss
		      //Poi il modello MC sfruttando l'array delle temperature:
		      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //MC
                      //Sfruttando le variabili usati per la validazione recupero le altre 3 grandezze:
                      $data_array_alert[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2)); //M1
                      $data_array_warning[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //SO
                      $data_array_validate[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),2)); //HE
		      //Recupero alcune info sui modelli meteo e la previsione una sola volta e prendo il primo valore non nullo:
		      if (!empty($row[6]) && !isset($tof_mc)) $tof_mc = date_create($row[6]);
		      if (!empty($row[7]) && !isset($tof_m1)) $tof_m1 = date_create($row[7]);
                      if (!empty($row[8]) && !isset($tof_so)) $tof_so = date_create($row[8]);
                      if (!empty($row[9]) && !isset($tof_he)) $tof_he = date_create($row[9]);
                      if (!empty($row[10]) && !isset($id_previ_mc)) {$id_previ_mc = $row[10]; //psa
			      $data_previ_mc = date_create($row[11]);}
		      if (!empty($row[12]) && !isset($id_previ_m1)) {$id_previ_m1 = $row[12]; //lami
	                      $data_previ_m1 = date_create($row[13]);}
		      if (!empty($row[14]) && !isset($id_previ_so)) {$id_previ_so = $row[14]; //lami
	                      $data_previ_so = date_create($row[15]);}
                      if (!empty($row[16]) && !isset($id_previ_he)) {$id_previ_he = $row[16]; //lami
	                      $data_previ_he = date_create($row[17]);}
		      //recupero l'ora dell'ultimo dato disponibile osservato:
		      if (!empty($row[18])) $last_data_oss = strtotime($row[18])*1000;
                    }
		    //Rielaboro le date per visualzizazione piu semplice:
		    $tof_mc = date_format($tof_mc, 'd/m H:i');
		    $tof_m1 = date_format($tof_m1, 'd/m H:i');
		    $tof_so = date_format($tof_so, 'd/m H:i');
		    $tof_he = date_format($tof_he, 'd/m H:i');
		    $data_previ_mc = date_format($data_previ_mc, 'd/m');
		    $data_previ_m1 = date_format($data_previ_m1, 'd/m H');
                    $data_previ_so = date_format($data_previ_so, 'd/m H');
                    $data_previ_he = date_format($data_previ_he, 'd/m H');
		    //La data_aggiornamento del dato la prendo di oggi e via:
		    $data_agg = date('Y/m/d H:i'); 
                }
		else if(stristr($id_parametro, 'FEWS')) {
                    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation'.
                      //Per primi mi carico i dati osservati:
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //dati_oss
                      //Poi il modello MC sfruttando l'array delle temperature:
                      //$data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //MC
                      //Sfruttando le variabili usati per la validazione recupero le altre 3 grandezze:
                      $data_array_alert[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //M1
                      $data_array_warning[] = array(strtotime($row[0])*1000, is_null($row[6]) ? null : round(floatval($row[6]),2)); //SO
                      $data_array_validate[] = array(strtotime($row[0])*1000, is_null($row[9]) ? null : round(floatval($row[9]),2)); //HE
                      //Recupero alcune info sui modelli meteo e la previsione una sola volta e prendo il primo valore non nullo:
                      //if (!empty($row[6]) && !isset($tof_mc)) $tof_mc = date_create($row[6]);
                      if (!empty($row[4]) && !isset($tof_m1)) $tof_m1 = date_create($row[4]);
                      if (!empty($row[7]) && !isset($tof_so)) $tof_so = date_create($row[7]);
                      if (!empty($row[10]) && !isset($tof_he)) $tof_he = date_create($row[10]);
                      /*if (!empty($row[10]) && !isset($id_previ_mc)) {$id_previ_mc = $row[10]; //psa
                              $data_previ_mc = date_create($row[11]);}
                      if (!empty($row[12]) && !isset($id_previ_m1)) {$id_previ_m1 = $row[12]; //lami
                              $data_previ_m1 = date_create($row[13]);}
                      if (!empty($row[14]) && !isset($id_previ_so)) {$id_previ_so = $row[14]; //lami
                              $data_previ_so = date_create($row[15]);}
                      if (!empty($row[16]) && !isset($id_previ_he)) {$id_previ_he = $row[16]; //lami
                              $data_previ_he = date_create($row[17]);}*/
                      //recupero l'ora dell'ultimo dato disponibile osservato:
                      if (!empty($row[2])) $last_data_oss = strtotime($row[2])*1000;
                    }
                    //Rielaboro le date per visualzizazione piu semplice:
                    //$tof_mc = date_format($tof_mc, 'd/m H:i');
                    $tof_m1 = date_format($tof_m1, 'd/m H:i');
                    $tof_so = date_format($tof_so, 'd/m H:i');
                    $tof_he = date_format($tof_he, 'd/m H:i');
                    //$data_previ_mc = date_format($data_previ_mc, 'd/m');
                    $data_previ_m1 = date_format($data_previ_m1, 'd/m H');
                    $data_previ_so = date_format($data_previ_so, 'd/m H');
                    $data_previ_he = date_format($data_previ_he, 'd/m H');
                    //La data_aggiornamento del dato la prendo di oggi e via:
                    $data_agg = date('Y/m/d H:i');
                }
		else if(stristr($id_parametro, 'previMC')) {
                    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation'.
                      //Per primi mi carico i dati osservati:
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[5]) ? null : round(floatval($row[5]),2)); //dati_oss
                      //Poi il modello MC sfruttando l'array delle temperature:
                      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //MC
                      //Sfruttando le variabili usati per la validazione recupero le altre 3 grandezze:
                      $data_array_alert[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2)); //M1
                      $data_array_warning[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //SO
                      $data_array_validate[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),2)); //HE
                      //Recupero alcune info sui modelli meteo e la previsione una sola volta e prendo il primo valore non nullo:
                      if (!empty($row[6]) && !isset($tof_mc)) $tof_mc = date_create($row[6]);
                      if (!empty($row[7]) && !isset($tof_m1)) $tof_m1 = date_create($row[7]);
                      if (!empty($row[8]) && !isset($tof_so)) $tof_so = date_create($row[8]);
                      if (!empty($row[9]) && !isset($tof_he)) $tof_he = date_create($row[9]);
                      if (!empty($row[10]) && !isset($id_previ_mc)) {$id_previ_mc = $row[10]; //psa
                              $data_previ_mc = date_create($row[11]);}
                      if (!empty($row[12]) && !isset($id_previ_m1)) {$id_previ_m1 = $row[12]; //lami
                              $data_previ_m1 = date_create($row[13]);}
                      if (!empty($row[14]) && !isset($id_previ_so)) {$id_previ_so = $row[14]; //lami
                              $data_previ_so = date_create($row[15]);}
                      if (!empty($row[16]) && !isset($id_previ_he)) {$id_previ_he = $row[16]; //lami
                              $data_previ_he = date_create($row[17]);}
		      //recupero l'ora dell'ultimo dato disponibile osservato:
                      if (!empty($row[18])) $last_data_oss = strtotime($row[18])*1000;
                    }
                    //Rielaboro le date per visualzizazione piu semplice:
                    $tof_mc = date_format($tof_mc, 'd/m H:i');
                    $tof_m1 = date_format($tof_m1, 'd/m H:i');
                    $tof_so = date_format($tof_so, 'd/m H:i');
                    $tof_he = date_format($tof_he, 'd/m H:i');
                    $data_previ_mc = date_format($data_previ_mc, 'd/m');
                    $data_previ_m1 = date_format($data_previ_m1, 'd/m');
                    $data_previ_so = date_format($data_previ_so, 'd/m');
                    $data_previ_he = date_format($data_previ_he, 'd/m');
                    //La data_aggiornamento del dato la prendo di oggi e via:
                    $data_agg = date('Y/m/d H:i');
                }
		else if(stristr($id_parametro, 'previPROB')) {
                    while($row = pg_fetch_array($result)) {
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation'.
                      //Per primi mi carico i dati osservati:
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[3]) ? null : round(floatval($row[3]),2)); //dati_oss
                      //Sfruttando le variabili usati per la validazione recupero il modello col min il max e la curva media:
		      $data_array_alert[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //Max
                      $data_array_warning[] = array(strtotime($row[0])*1000, is_null($row[4]) ? null : round(floatval($row[4]),2)); //Avg
		      $data_array_validate[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2)); //Min
		      $data_array_range[] = array(strtotime($row[0])*1000, is_null($row[12]) ? null : round(floatval($row[12]),2), is_null($row[11]) ? null : round(floatval($row[11]),2)); //carico array per plottare un range
                      //Recupero alcune info sui modelli meteo e la previsione una sola volta e prendo il primo valore non nullo:
                      if (!empty($row[5]) && !isset($tof_mc)) $tof_mc = date_create($row[5]); //Max
                      if (!empty($row[6]) && !isset($tof_m1)) $tof_m1 = date_create($row[6]); //Min
                      if (!empty($row[7]) && !isset($id_previ_mc)) {$id_previ_mc = $row[7]; //cosmoXX
                              $data_previ_mc = date_create($row[8]);}
                      if (!empty($row[9]) && !isset($id_previ_m1)) {$id_previ_m1 = $row[9]; //cosmoXX
                              $data_previ_m1 = date_create($row[10]);}
		      //recupero l'ora dell'ultimo dato disponibile osservato:
                      if (!empty($row[13])) $last_data_oss = strtotime($row[13])*1000;
                    }
                    //Rielaboro le date per visualzizazione piu semplice:
                    $tof_mc = date_format($tof_mc, 'd/m H:i');
                    $tof_m1 = date_format($tof_m1, 'd/m H:i');
                    $data_previ_mc = date_format($data_previ_mc, 'd/m');
                    $data_previ_m1 = date_format($data_previ_m1, 'd/m');
                    //La data_aggiornamento del dato la prendo di oggi e via:
                    $data_agg = date('Y/m/d H:i');
                }
		else if(stristr($id_parametro, 'bilancioIDRO')) {
                    while($row = pg_fetch_array($result)) {
		      //Recupero l'ora della previsione che andro poi a visualizzare come una linea:
		      if (!empty($row[3]) && !isset($tof_mc)) {
			$tof_mc = date_create($row[3]); //tof MH
			//Meglio creare una linea!
                        $Xline = strtotime($row[3])*1000;
		      }
                      //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation'.
                      //Per primi mi carico i dati osservati:
                      $data_array[] = array(strtotime($row[0])*1000, is_null($row[2]) ? null : round(floatval($row[2]),2)); //dati_oss
		      //Recupero la portata alla datora del modello per creare il punto:
		      //if ($row[3] == $row[0]) $data_array_hmax[] = array(strtotime($row[3])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //TOF
                      //Sfruttando le variabili usati per la validazione recupero la curva del modello:
		      $data_array_temp[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2)); //MH
		    }
		    //Rielaboro le date per visualizzazione piu semplice:
                    $tof_mc = date_format($tof_mc, 'd/m H:i');
		    //La data_aggiornamento del dato la prendo di oggi e via:
                    $data_agg = date('Y/m/d H:i');
                }
		/*else if($id_parametro=='PLUV') {
		while($row = pg_fetch_array($result)) {
		    //Dato che il cast to float riporta a ZERO i null, eseguo un 'ternary operation':
                    $data_array[] = array(strtotime($row[0])*1000, is_null($row[1]) ? null : round(floatval($row[1]),2));
		    //La data_aggiornamento del dato la prendo una per tutti:
                    $data_agg = $row[3];
		}
		//Recupero la cumulata con la tipologia di validazione:
		$result_cumulata = pg_query($conn,$query_cumulata);
                while($row_cum = pg_fetch_array($result_cumulata)) {
                      $data_array_cum[] = array(strtotime($row_cum[0])*1000, is_null($row_cum[1]) ? null : round(floatval($row_cum[1]),0));
                      $data_array_alert[] = array(strtotime($row[0])*1000, ($row[2][0]=='A') ? floatval($row[1]) : null);
                      $data_array_warning[] = array(strtotime($row[0])*1000, ($row[2][0]=='W') ? floatval($row[1]) : null);
                      $data_array_validate[] = array(strtotime($row[0])*1000, ($row[2][0]=='V') ? floatval($row[1]) : null);
                }
		}*/
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

		//In alcuni casi faccio altre query per recuperare altre serie di dati. Ad esempio nel caso della PLUV e NIVO faccio un'altra query per recuperare i dati della cumulata; per NIVO, nella query sucecssiva,recupero anche la temperatura, etc..
		if($id_parametro=='PLUV') {
			$result_cumulata = pg_query($conn,$query_cumulata);
			//Ridefinisco l'array di validazione poiche' nel caso della pioggia associo questo parametro alla cumulata, che in realta' sarebbe il dato ogni 10 minuti - OPPURE NO? Da ragionarci...
			$data_array_alert = array();
			$data_array_warning = array();
			$data_array_validate = array();
			while($row_cum = pg_fetch_array($result_cumulata)) {
                 	  $data_array_cum[] = array(strtotime($row_cum[0])*1000, is_null($row_cum[1]) ? null : round(floatval($row_cum[1]),0));
			  //Ridefinisco l'array di validazione poiche' nel caso della pioggia associo questo parametro alla cumulata, che in realta' sarebbe il dato ogni 10 minuti:
                          $data_array_alert[] = array(strtotime($row_cum[0])*1000, ($row_cum[2][0]=='A') ? floatval($row_cum[1]) : null);
                          $data_array_warning[] = array(strtotime($row_cum[0])*1000, ($row_cum[2][0]=='W') ? floatval($row_cum[1]) : null);
                          $data_array_validate[] = array(strtotime($row_cum[0])*1000, ($row_cum[2][0]=='V') ? floatval($row_cum[1]) : null);
                	}
		}
		if($id_parametro=='SLOPS') {
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
			//Recupero anche i dati sulla pioggia cumulata:
			$result_cumulata = pg_query($conn,$query_cumulata);
                        while($row_cum = pg_fetch_array($result_cumulata)) {
                               $data_array_cum[] = array(strtotime($row_cum[0])*1000, is_null($row_cum[1]) ? null : round(floatval($row_cum[1]),0));
			}
                }
		if($id_parametro=='IGRO') {
                        $result_temp = pg_query($conn,$query_temp);
                        while($row_temp = pg_fetch_array($result_temp)) {
                               $data_array_temp[] = array(strtotime($row_temp[0])*1000, is_null($row_temp[1]) ? null : round(floatval($row_temp[1]),1));
                        }
                }

		//Nel caso del vento recupero i dati sulla raffica:
		if($id_parametro=='VELV') {
			$query_raffica = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'VELR'  ORDER BY data ASC;";
                        $result_raffica = pg_query($conn,$query_raffica);
                        while($row_raf = pg_fetch_array($result_raffica)) {
                               $data_array_raf[] = array(strtotime($row_raf[0])*1000, round(floatval($row_raf[1]),1));
                	}
		}
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
//La nuova versione di HighStock permette di fare grafici a colonna con colore in base al valore...ma sputtana il WindRose!
/*$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highstock-4.2.5/js/highstock.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highstock-4.2.5/js/highcharts-more.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highstock-4.2.5/js/modules/exporting.js"></script>';*/
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
var graph_data_dew; //inizializzazione data array per i grafici - temperatura di rugiada
var graph_data_mslp; //inizializzazione data array per i grafici - temperatura di rugiada
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

var main_plot_title, plot_title, udm, soglia, soglia1, soglia2, soglia3, label_soglia1, label_soglia2, label_soglia3, min_y, max_y, min_x, max_x, marker_fillcolor, markerline_color, yAxis_offset_x, zero_idrometrico;
var markerline_color_alert, markerline_color_warning, markerline_color_verify, series_color_alert, series_color_warning, series_color_verify;
var Xline, label_Xline, align_label_Xline;
var sogliaP1, sogliaP2, sogliaP3;
var sogliaG1, sogliaG2;
var series_negativecolor, min_range_y, tick_interval_y, tick_interval_x, suffix_series, xaxis_tickposition;
var plotOptions_stacking, plotOptions_shadow, plotOptions_groupPadding, plotOptions_pointPlacement, plotOptions_column_groupPadding, plotOptions_column_pointWidth;
var plotOptions_value0, plotOptions_value0_color, plotOptions_value1, plotOptions_value1_color, plotOptions_value2, plotOptions_value2_color, plotOptions_value3, plotOptions_value3_color, plotOptions_value4, plotOptions_value4_color, plotOptions_value5_color;
var color_plotBand, start_plotBand, end_plotBand, label_plotBand, align_plotBand;
var yplotBands_color, yplotBands_from, yplotBands_to;
var zone_serie_color0, zone_serie_color1, zone_serie_color2, zone_serie_value0, zone_serie_value1, zone_serie_value2;
var custom_height = 400;
var name_series = 'parametro';
var name_alert_serie = 'alert';
var name_warning_serie = 'warning';
var name_verify_serie = 'verify';
var export_legend_enabled = false;
var enabled_marker_alertwarningverify = true;
var serie_type_alertwarningverify = 'scatter';
var symbol_alertwarningverify = 'circle';
var marker_fillcolor_alert = 'red';
var marker_fillcolor_warning = 'orange';
var marker_fillcolor_verify = 'yellow';
var shadow_line = true;
var series_treshold = 0;
var series_color = 'blue';
var color_soglia1 = 'green';
var color_soglia2 = 'orange';
var color_soglia3 = 'red';
var color_Xline = 'gray';
var step_line = false;
var polar_chart = false;
var markers_on_line = true;
var type_chart = 'line';
var type_series = 'line';
var point_symbol = 'circle';
var markerline_width = 0;
var xaxys_type = 'datetime';
var xaxys_title = 'Data e ora (UTC)';
var yaxys_type = 'linear';
var rangeselector_enabled = true;
var navigator_enabled = true;
var scrollbar_enabled = true;
var legend_enabled = true;
var enable_label_y = true;
var showInLegend_serie1 = false;
var showInLegend_serie2 = false;
var showInLegend_serie3 = false;
show_in_legend_alertwarningverify = true;
var y_legend = 0;
var align_label_soglia1 = align_label_soglia2 = align_label_soglia3 = 'right';
var connectNulls_mainseries = false;
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
var default_rangeSelector_buttons = [{type : 'day',count : 1,text : '1d' }, {type : 'day',count : 2,text : '2d' }, {type : 'day',count : 3,text : '3d' }, {type : 'all',count : 1,text : 'All' }];


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
    main_plot_title = 'Stazione '+denominazione+' - quota '+quota+' slm';
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
		max_y_mslp = Math.max.apply( Math, $.map(graph_data_mslp, function(o){ return o[1]; }) );
                max_y_baro = Math.max.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
                max_y = Math.max(max_y_mslp, max_y_baro);
		break;
	case 'VIS':
                plot_title = 'Andamento della visibilita';
                udm = 'km';
                markers_on_line = false;
                series_color = 'green';
		soglia2 = 1;
		series_negativecolor = '#DAA520';
		series_treshold = 1;
		label_soglia2 = 'Nebbia';
		soglia1 = 10;
		label_soglia1 = 'Foschia';
		yaxys_type = 'logarithmic';
                min_y = 0.01;
		series_color = '#6495ED';
                break;
	case 'WTH 15M':
		plot_title = 'Tempo presente: codice synop automatico';
                udm = '';
                suffix_series = 'codice';
                markers_on_line = true;
		marker_fillcolor = '';
		type_series = 'scatter';
                min_y = 0;
                max_y = Math.min(highest, 100);
	series_treshold = '';
	series_color = '';
	series_negativecolor = '';
		zone_serie_value0 = 30;
		zone_serie_color0 = 'red';
		zone_serie_value1 = 60;
                zone_serie_color1 = 'green';
                //tick_interval_y = 20;
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
	case 'DEW':
                plot_title = 'Andamento delle temperature: aria, rugiada e temperatura percepita (humidex)';
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
	case 'SLOPS':
                name_series = 'rainfall amount';
                plot_title = 'Accumulated rainfall Vs triggering threshold';
                suffix_series = 'mm';
		markers_on_line = false;
                udm = 'mm';
                min_y = 0;
		xaxys_title = 'Duration';
                shadow_line = false;
		show_in_legend_alertwarningverify = false;
		legend_enabled = true;
		export_legend_enabled = true;
		rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
                showInLegend_serie1 = true;
		showInLegend_serie2 = true;
                break;
	case 'IGRO':
                plot_title = 'Umidita\' dell\'aria';
                udm = '%';
                suffix_series = '%';
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
	case 'IDROC':
		plot_title = 'Livello idrometrico' + ' - zero idrometrico ' + zero_idrometrico + ' m slm';
		//series_color = 'green';
                color_soglia1 = 'gold';
                color_soglia2 = 'orange';
                color_soglia3 = 'red';
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
		label_soglia1 = 'Livello di pre-soglia';
		label_soglia2 = 'Livello di guardia';
		label_soglia3 = 'Livello di pericolo';
                udm = 'm';
		markers_on_line = false;
		if (soglia1) min_y = Math.min(lowest, soglia1);
		else min_y = lowest;
		max_y = Math.max(highest, soglia);
		tick_interval_y = 0.4;
                break;
	case 'DIGHE_L':
		main_plot_title = 'Diga '+denominazione;
		plot_title = 'Livello idrometrico m slm';
                //series_color = 'green';
		udm = 'm';
                markers_on_line = true;
		soglia = -999;
		<?php if(!empty($soglia2)) { ?>
		soglia2 = <?php echo $soglia2; ?>;
		soglia = soglia2 + 0.1;
		<?php } ?>
		label_soglia2 = 'Livello massimo invasabile slm';
                if (soglia1) min_y = Math.min(lowest, soglia2);
                else min_y = lowest;
                max_y = Math.max(highest, soglia);
                //tick_interval_y = 0.4;
		show_in_legend_alertwarningverify = false;
                legend_enabled = false;
                rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
                break;
	case 'DIGHE_V':
		main_plot_title = 'Diga '+denominazione;
                plot_title = 'Volume invasato [Mm3]';
                //series_color = 'green';
                udm = 'Mm3';
                markers_on_line = true;
                soglia = -999;
		<?php if(!empty($soglia1)) { ?>
                soglia1 = <?php echo $soglia1; ?>;
                soglia = soglia1 + 0.1;
                <?php } ?>
                label_soglia1 = 'Volume massimo invasabile';
                if (soglia1) min_y = Math.min(lowest, soglia1);
                else min_y = lowest;
                max_y = Math.max(highest, soglia);
                //tick_interval_y = 0.4;
                show_in_legend_alertwarningverify = false;
                legend_enabled = false;
                rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
                break;
	case 'SEZFLUV':
                udm = 'm slm';
		suffix_series = 'm';
		type_series = 'area';
		series_color = 'brown';
                markers_on_line = false;
		min_x = first_data_oss;
		max_x = last_data_oss;
		min_y = lowest;
		yplotBands_from = 0;
		yplotBands_to = null;
		<?php if(!empty($soglia1)) { ?>
		yplotBands_to = <?php echo $soglia1; ?>;
		<?php } ?>
		plot_title = 'Sezione fluviale. Ultimo dato registrato: '+yplotBands_to+' m s.l.m.';
		yplotBands_color = 'cyan';
		connectNulls_mainseries = true;
                xaxys_title = 'Profilo x [m]';
		xaxys_type = 'Linear';
		step_line = false;
                //shadow_line = false;
                show_in_legend_alertwarningverify = false;
                legend_enabled = false;
                rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
                break;
	case 'MAX_IDRO':
		plot_title = 'Massimi storici Idrologici' + ' - zero idrometrico ' + zero_idrometrico + ' m slm';
		color_soglia1 = 'gold';
                color_soglia2 = 'orange';
                color_soglia3 = 'red';
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
		label_soglia1 = 'Livello di pre-soglia';
                label_soglia2 = 'Livello di guardia';
                label_soglia3 = 'Livello di pericolo';
		//if (soglia1) min_y = Math.min(lowest, soglia1);
                //else min_y = lowest;
                max_y = Math.max(highest, soglia);
		//tick_interval_y = 0.4;
		type_series = 'column';
                type_chart = 'column';
		legend_enabled = false;
		rangeselector_enabled = false;
		udm = 'm';
		xaxys_title = 'Data';
		xaxys_type = '';
		plotOptions_stacking = 'normal';
                //plotOptions_shadow = false;
                plotOptions_groupPadding = 0;
                //plotOptions_pointPlacement = 'on';
		break;
	case 'PORTATA_BIS':
		plot_title = 'Bollettino Idrologico di Sintesi - BIS';
                name_series = 'valore minimi';
		series_color = 'green';
                color_soglia1 = 'red';
                color_soglia2 = 'orange';
                color_soglia3 = 'gold';
		//color_soglia1 = 'gold';
		//color_soglia2 = '#00CED1'; //DarkTurquoise
		//color_soglia3 = '#66CDAA'; //MediumAquaMarine
		soglia = -999;
                <?php if(!empty($soglia_dmv_deroga)) { ?>
                soglia1 = <?php echo $soglia_dmv_deroga; ?>;
                soglia = soglia1 + 0.1;
                <?php } ?>
                <?php if(!empty($soglia_dmv_base)) { ?>
                soglia2 = <?php echo $soglia_dmv_base; ?>;
                soglia = soglia2 + 0.1;
                <?php } ?>
                <?php if(!empty($soglia_equilibrio)) { ?>
                soglia3 = <?php echo $soglia_equilibrio; ?>;
                soglia = soglia3 + 0.1;
                <?php } ?>
		label_soglia1 = 'DMV deroghe';
                label_soglia2 = 'DMV base';
                label_soglia3 = 'Q attenzione';
		align_label_soglia3 = 'left';
		//if (soglia1) min_y = Math.min(lowest, soglia1);
                //else min_y = lowest;
		min_y = 0;
                //if (soglia3) max_y = Math.max(highest_hmax, highest, soglia3);
		markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = false;
                udm = 'm3/s';
                suffix_series = 'm3/s';
                xaxys_title = 'Data';
                default_rangeSelector_buttons = [{type : 'week',count : 1,text : '1w' }, {type : 'month',count : 1,text : '1m' }, {type : 'month',count : 3,text : '3m' }, {type : 'all',count : 1,text : 'Year' }];
                break;
	case 'IDRO_BIS':
                plot_title = 'Bollettino Idrologico di Sintesi - BIS';
		name_series = 'valore minimi';
		series_color = 'green';
                color_soglia1 = 'gold';
                color_soglia2 = 'orange';
                color_soglia3 = 'red';
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
		label_soglia1 = 'Livello di pre-soglia';
                label_soglia2 = 'Livello di guardia';
                label_soglia3 = 'Livello di pericolo';
                if (soglia1) min_y = Math.min(lowest, soglia1);
                else min_y = lowest;
		max_y = Math.max(highest_hmax, highest, soglia);
		markers_on_line = false;
                legend_enabled = true;
		showInLegend_serie1 = true;
		show_in_legend_alertwarningverify = false;
                udm = 'm';
		suffix_series = 'm';
                xaxys_title = 'Data';
		yAxis_offset_x = -10;
                //xaxys_type = '';
		default_rangeSelector_buttons = [{type : 'week',count : 1,text : '1w' }, {type : 'month',count : 1,text : '1m' }, {type : 'month',count : 3,text : '3m' }, {type : 'all',count : 1,text : 'Year' }];
                break;
	case 'SPI01':
	case 'SPI12':
	case 'SPI06':
	case 'SPI03':
		main_plot_title = 'Bacino '+denominazione;
		plot_title = 'Stato siccita bacini - indice SPI';
		name_series = 'SPI03';
		series_color = 'green';
		color_soglia1 = 'navy';
                color_soglia2 = 'white';
                color_soglia3 = 'brown';
		label_soglia1 = 'Piovosita estrema';
		label_soglia3 = 'Siccita estrema';
		//soglia = 2;
		//La BANDA non so perche' non funziona...
		//color_plotBand = 'orange';
		//start_plotBand = graph_data.length-10;
		//end_plotBand = graph_data.length;
		//label_plotBand = 'Previsione';
		//align_plotBand = 'left';
		soglia1 = 2;
		soglia2 = 0;
		soglia3 = -2;
		serie_type_alertwarningverify = 'line';
		symbol_alertwarningverify = '';
		enabled_marker_alertwarningverify = false;
		markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
		name_alert_serie = 'SPI01';
                name_warning_serie = 'SPI06';
                name_verify_serie = 'SPI12';
		//series_color_alert = 'red';
		//series_color_warning = 'orange';
		//series_color_verify = 'yellow';
                udm = 'SPI index';
                suffix_series = '';
                xaxys_title = 'Data';
		default_rangeSelector_buttons = [{type: 'year', count: 10, text: '10y'}, {type: 'year', count: 25, text: '25y'}, {type: 'year', count: 50, text: '50y'}, {type: 'all',count: 1,text: 'all'}];
		break;
	case 'PAL01':
		main_plot_title = 'Bacino '+denominazione;
                plot_title = 'Stato siccita bacini - indice Palmer';
                name_series = 'PAL01';
                series_color = 'green';
                color_soglia1 = 'navy';
                color_soglia2 = 'white';
                color_soglia3 = 'brown';
                label_soglia1 = 'Moderatamente umido';
                label_soglia3 = 'Moderatamente secco';
		soglia1 = 2;
                soglia2 = 0;
                soglia3 = -2;
                symbol_alertwarningverify = '';
		show_in_legend_alertwarningverify = false;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
		udm = 'PAL index';
                suffix_series = '';
                xaxys_title = 'Data';
                default_rangeSelector_buttons = [{type: 'year', count: 10, text: '10y'}, {type: 'year', count: 25, text: '25y'}, {type: 'year', count: 50, text: '50y'}, {type: 'all',count: 1,text: 'all'}];
                break;
	case 'PREVIPO':
		custom_height = 500;
                main_plot_title = 'Stazione '+denominazione;
		plot_title = 'Livello idrometrico' + ' - zero idrometrico ' + zero_idrometrico + ' m slm';
                name_series = 'Dati osservati';
                series_color = 'blue';
                rangeselector_enabled = false;
                navigator_enabled = true;
                scrollbar_enabled = true;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
                name_alert_serie = 'Fews-M11' + ' TOF<?php echo $tof_m1; ?>';
                name_warning_serie = 'Fews-SOB' + ' TOF<?php echo $tof_so; ?>';
                name_verify_serie = 'Fews-HEC' + ' TOF<?php echo $tof_he; ?>';
                series_color_alert = 'gray';
                series_color_warning = '#40E0D0';
                series_color_verify = '#9ACD32';
                udm = 'Livello m';
                suffix_series = 'm';
                xaxys_title = 'Data';
                yAxis_offset_x = -13;
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
                soglia = soglia3 * 1.05;
                <?php } ?>
		label_soglia1 = 'Livello di pre-soglia';
                label_soglia2 = 'Livello di guardia';
                label_soglia3 = 'Livello di pericolo';
                align_label_soglia1 = 'left';
                align_label_soglia2 = 'left';
                align_label_soglia3 = 'left';
                color_soglia1 = '#FFD700';
                if (soglia1) min_y = Math.min(lowest, soglia1);
                else min_y = lowest;
                max_y = Math.max(highest, soglia);
		//max_y = Math.max(highest_oss, highest_mc, highest_m1, highest_so, highest_he, soglia);
                break;
	case 'FEST':
		min_y = 0;
		udm = 'mm';
		rangeselector_enabled = false;
		show_in_legend_alertwarningverify = false;
		showInLegend_serie1 = true;
		name_series = 'P. cumulata da radar';
		navigator_enabled = false;
                scrollbar_enabled = false;
		break;
	case 'FEWSQ':
                custom_height = 500;
                //main_plot_title = 'Stazione '+denominazione;
                //plot_title = 'Previsioni IDRO - vari modelli';
                name_series = 'Dati osservati';
                series_color = 'blue';
                rangeselector_enabled = false;
                navigator_enabled = true;
                scrollbar_enabled = true;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
                name_alert_serie = 'Fews-M11' + ' TOF<?php echo $tof_m1; ?>';
                name_warning_serie = 'Fews-SOB' + ' TOF<?php echo $tof_so; ?>';
                name_verify_serie = 'Fews-HEC' + ' TOF<?php echo $tof_he; ?>';
                series_color_alert = 'gray';
                series_color_warning = '#40E0D0';
                series_color_verify = '#9ACD32';
                udm = 'Portate m3/s';
                suffix_series = 'm3/s';
                xaxys_title = 'Data';
                yAxis_offset_x = -13;
                soglia = -999;
                max_y = Math.max(highest_oss, highest_mc, highest_m1, highest_so, highest_he, soglia);
                break;
	case 'FEWS':
		custom_height = 500;
                //main_plot_title = 'Stazione '+denominazione;
		//plot_title = 'Previsioni IDRO - vari modelli';
                name_series = 'Dati osservati';
                series_color = 'blue';
                rangeselector_enabled = false;
                navigator_enabled = true;
                scrollbar_enabled = true;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
                name_alert_serie = 'Fews-M11' + ' TOF<?php echo $tof_m1; ?>';
                name_warning_serie = 'Fews-SOB' + ' TOF<?php echo $tof_so; ?>';
                name_verify_serie = 'Fews-HEC' + ' TOF<?php echo $tof_he; ?>';
                series_color_alert = 'gray';
                series_color_warning = '#40E0D0';
                series_color_verify = '#9ACD32';
                udm = 'Livello m';
                suffix_series = 'm';
                xaxys_title = 'Data';
                yAxis_offset_x = -13;
                soglia = -999;
                max_y = Math.max(highest_oss, highest_mc, highest_m1, highest_so, highest_he, soglia);
		break;
	case 'PREVIDRO':
		custom_height = 500;
                main_plot_title = 'Stazione '+denominazione;
                //plot_title = 'Previsioni IDRO - vari modelli';
                name_series = 'Dati osservati';
                series_color = 'blue';
		rangeselector_enabled = false;
                navigator_enabled = true;
                scrollbar_enabled = true;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
                //name_alert_serie = 'Fews-M11' + ' TOF<?php echo $tof_m1 .' '. $id_previ_m1.$data_previ_m1; ?>';
                //name_warning_serie = 'Fews-SOB' + ' TOF<?php echo $tof_so .' '. $id_previ_so.$data_previ_so; ?>';
                //name_verify_serie = 'Fews-HEC' + ' TOF<?php echo $tof_he .' '. $id_previ_he.$data_previ_he; ?>';
		name_alert_serie = 'Fews-M11' + ' TOF<?php echo $tof_m1; ?>';
		name_warning_serie = 'Fews-SOB' + ' TOF<?php echo $tof_so; ?>';
		name_verify_serie = 'Fews-HEC' + ' TOF<?php echo $tof_he; ?>';
                series_color_alert = 'gray';
                series_color_warning = '#40E0D0';
                series_color_verify = '#9ACD32';
                udm = 'Portata m3/s';
                suffix_series = 'm3/s';
                xaxys_title = 'Data';
		yAxis_offset_x = -13;
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
                soglia = soglia3 * 1.05;
                <?php } ?>
		label_soglia1 = 'Criticita ordinaria';
                label_soglia2 = 'Criticita moderata';
                label_soglia3 = 'Criticita elevata';
		align_label_soglia1 = 'left';
		align_label_soglia2 = 'left';
		align_label_soglia3 = 'left';
		color_soglia1 = '#FFD700';
                //if (soglia1) min_y = Math.min(lowest, soglia1);
                //else min_y = lowest;
		//Essendo portate il minimo lo metto sempre a zero e sti caz:
		min_y = 0;
                max_y = Math.max(highest_oss, highest_mc, highest_m1, highest_so, highest_he, soglia);
                break;
	case 'previMC':
		custom_height = 500;
                main_plot_title = 'Stazione '+denominazione;
                //plot_title = 'Previsioni IDRO - vari modelli';
                name_series = 'Dati osservati';
                series_color = 'blue';
                rangeselector_enabled = false;
                navigator_enabled = true;
                scrollbar_enabled = true;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
		name_alert_serie = 'FW-MC' + ' TOF<?php echo $tof_m1 .' '. $id_previ_mc.$data_previ_m1; ?>';
                name_warning_serie = 'FW-MC' + ' TOF<?php echo $tof_so .' '. $id_previ_mc.$data_previ_so; ?>';
                name_verify_serie = 'FW-MC' + ' TOF<?php echo $tof_he .' '. $id_previ_mc.$data_previ_he; ?>';
                series_color_alert = 'gray';
                series_color_warning = '#40E0D0';
                series_color_verify = '#9ACD32';
                udm = 'Portata m3/s';
                suffix_series = 'm3/s';
                xaxys_title = 'Data';
                yAxis_offset_x = -13;
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
                soglia = 1.6 * soglia3;
                <?php } ?>
                label_soglia1 = 'Criticita ordinaria';
                label_soglia2 = 'Criticita moderata';
                label_soglia3 = 'Criticita elevata';
                align_label_soglia1 = 'left';
                align_label_soglia2 = 'left';
                align_label_soglia3 = 'left';
                color_soglia1 = '#FFD700';
                //if (soglia1) min_y = Math.min(lowest, soglia1);
                //else min_y = lowest;
		//Essendo portate il minimo lo metto sempre a zero e sti caz:
                min_y = 0;
                max_y = Math.max(highest, soglia);
                break;
	case 'previPROB':
                custom_height = 500;
                main_plot_title = 'Stazione '+denominazione;
		plot_title = 'Previsioni probabilistiche MIKE11';
                name_series = 'Dati osservati';
                series_color = 'blue';
                rangeselector_enabled = false;
                navigator_enabled = true;
                scrollbar_enabled = true;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
		marker_fillcolor_alert = null;
		marker_fillcolor_warning = null;
		marker_fillcolor_verify = null;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = true;
                name_alert_serie = 'Corsa massima' + ' TOF<?php echo $tof_mc; ?>';
                name_warning_serie = 'Valori medi e Spread';
		name_verify_serie = 'Corsa minima' + ' TOF<?php echo $tof_m1; ?>';
                series_color_alert = '#d01c8b';
                series_color_warning = 'gray';
		series_color_verify = '#4dac26';
                udm = 'Portata m3/s';
                suffix_series = 'm3/s';
                xaxys_title = 'Data';
                yAxis_offset_x = -13;
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
                soglia = 1.6 * soglia3;
                <?php } ?>
                label_soglia1 = 'Criticita ordinaria';
                label_soglia2 = 'Criticita moderata';
                label_soglia3 = 'Criticita elevata';
                align_label_soglia1 = 'left';
                align_label_soglia2 = 'left';
                align_label_soglia3 = 'left';
                color_soglia1 = '#FFD700';
                //if (soglia1) min_y = Math.min(lowest, soglia1);
                //else min_y = lowest;
		//Essendo portate il minimo lo metto sempre a zero e sti caz:
                min_y = 0;
                max_y = Math.max(highest, soglia);
                break;
        case 'bilancioIDRO':
                //custom_height = 500;
                main_plot_title = 'Simulazioni per il nodo '+denominazione;
                plot_title = 'Previsioni con MIKE HYDRO';
                name_series = 'Dati osservati';
                series_color = 'cyan';
                rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
                serie_type_alertwarningverify = 'line';
                symbol_alertwarningverify = '';
                enabled_marker_alertwarningverify = false;
                //marker_fillcolor_alert = null;
                //marker_fillcolor_warning = null;
                //marker_fillcolor_verify = null;
                markers_on_line = false;
                legend_enabled = true;
                showInLegend_serie1 = true;
                show_in_legend_alertwarningverify = false;
		y_legend = 50;
                //series_color_warning = 'gray';
                //series_color_verify = '#4dac26';
                udm = 'Portata m3/s';
                suffix_series = 'm3/s';
                xaxys_title = 'Data';
                yAxis_offset_x = -13;
		<?php if(!empty($Xline)) { ?>
		  Xline = <?php echo $Xline; ?>;
                <?php } ?>
		label_Xline = 'Data del modello';
		color_soglia1 = 'red';
                color_soglia2 = 'orange';
                color_soglia3 = 'gold';
		soglia = -999;
                <?php if(!empty($soglia_dmv_deroga)) { ?>
                soglia1 = <?php echo $soglia_dmv_deroga; ?>;
                soglia = soglia1 + 0.1;
                <?php } ?>
                <?php if(!empty($soglia_dmv_base)) { ?>
                soglia2 = <?php echo $soglia_dmv_base; ?>;
                soglia = soglia2 + 0.1;
                <?php } ?>
                <?php if(!empty($soglia_equilibrio)) { ?>
                soglia3 = <?php echo $soglia_equilibrio; ?>;
                soglia = soglia3 + 0.1;
                <?php } ?>
                label_soglia1 = 'DMV deroghe';
                label_soglia2 = 'DMV base';
                label_soglia3 = 'Q attenzione';
                align_label_soglia1 = 'right';
                align_label_soglia2 = 'right';
                align_label_soglia3 = 'right';
                //if (soglia1) min_y = Math.min(lowest, soglia1);
                //else min_y = lowest;
		min_y = 0;
                //max_y = Math.max(highest, soglia);
		max_y = Math.max(highest_temp, highest, soglia);
                break;
	case 'SRI':
		plot_title = 'Indice SRI - periodo di riferimento 2003-2016';
		main_plot_title = 'Stazione '+denominazione;
                //series_color = 'blue';
                rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
		markers_on_line = false;
                legend_enabled = false;
		udm = 'SRI index';
                suffix_series = '';
                xaxys_title = 'Data';
		type_series = 'column';
                //type_chart = 'column';
		plotOptions_stacking = 'normal';
                //plotOptions_shadow = false;
                plotOptions_groupPadding = 0;
                //plotOptions_pointPlacement = 'on';
		//Per dare un colore alle barre in base al valore:
		plotOptions_value0 = -1.65;
		plotOptions_value0_color = '#541A19';
		plotOptions_value1 = -0.84;
		plotOptions_value1_color = '#E8D384';
		plotOptions_value2 = 0.84;
		plotOptions_value2_color = 'white';
		plotOptions_value3 = 1.65;
		plotOptions_value3_color = '#DAF4D9';
		plotOptions_value4 = 1.65;
                plotOptions_value4_color = '#DAF4D9';
		plotOptions_value5_color = '#0E1172';
		min_y = -3;
		max_y = 3;
		tick_interval_y = 1;
		//xaxys_type = 'linear';
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
	case 'NIVOVAL':
                plot_title = 'Altezza neve al suolo - dati validati';
		name_series = 'Altezza neve al suolo';
                udm = 'cm';
                suffix_series = 'cm';
                markers_on_line = false;
		rangeselector_enabled = false;
                navigator_enabled = false;
                scrollbar_enabled = false;
                legend_enabled = true;
		show_in_legend_alertwarningverify = true;
		name_alert_serie = 'dati non validi';
                name_warning_serie = 'dati ancora da validare';
		name_verify_serie = 'dati validati';
                series_color_verify = '#ffffff';
		marker_fillcolor_verify = 'rgba(255,255,255,0)'; //bianco transparente
		showInLegend_serie1 = true;
                xaxys_title = 'Data';
		type_series = 'column';
                type_chart = 'column';
		//plotOptions_stacking = 'null';
                //plotOptions_shadow = false;
                plotOptions_groupPadding = 0.5;
		plotOptions_column_groupPadding = 0.5;
		plotOptions_column_pointWidth = 20;
                min_y = 0;
                max_y = Math.max(highest, 100);
                tick_interval_y = 20;
                break;
	case 'VELV':
                plot_title = 'Velocita\' del vento e raffica';
                udm = 'm/s';
		markers_on_line = false;
		series_treshold = 15;
		series_color = '#DAA520';
		series_negativecolor = 'green';
                min_y = 0;
		soglia2 = '15';
		soglia3 = '20';
                break;
	case 'DIRV':
		plot_title = 'Direzione del vento';
		udm = 'gradi';
		type_series = 'scatter';
		min_y = 0;
                max_y = 360;
		tick_interval_y = 45;
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
	case 'PORTATA':
	case 'PORTATAC':
		plot_title = 'Portata';
		udm = 'm3/s';
		series_color = 'blue';
                color_soglia1 = 'gold';
                color_soglia2 = 'orange';
                color_soglia3 = 'red';
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
                label_soglia1 = 'Livello di pre-soglia';
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

var id_parametro = '<?php echo $id_parametro; ?>';
//var tipo_validaz = '<?php //echo $tipo_validaz; ?>';
var data_agg = '<?php echo $data_agg; ?>';
var denominazione = '<?php echo $denominazione; ?>';
var quota = <?php echo $quota; ?>;
var codice_istat = '<?php echo $codice_istat; ?>';
var progr_punto_com = '<?php echo $progr_punto_com; ?>';
var zero_idrometrico = '<?php echo $zero_idrometrico; ?>';
if (!zero_idrometrico) zero_idrometrico = 'n.d.';
graph_data = <?php echo json_encode($data_array); ?>;
graph_data_cum = <?php echo json_encode($data_array_cum); ?>;
graph_data_raf = <?php echo json_encode($data_array_raf); ?>;
graph_data_alert = <?php echo json_encode($data_array_alert); ?>;
graph_data_warning = <?php echo json_encode($data_array_warning); ?>;
graph_data_validate = <?php echo json_encode($data_array_validate); ?>;
graph_data_range  = <?php echo json_encode($data_array_range); ?>;
graph_data_dew = <?php echo json_encode($data_array_dew); ?>;
graph_data_mslp = <?php echo json_encode($data_array_mslp); ?>;
graph_data_temp = <?php echo json_encode($data_array_temp); ?>;
graph_data_note_max_idro = <?php echo json_encode($data_array_note_max_idro); ?>;
graph_data_hmax = <?php echo json_encode($data_array_hmax); ?>;

if (id_parametro == 'IDRO_BIS' || id_parametro == 'PORTATA_BIS' || id_parametro == 'bilancioIDRO') {
	//Escludo dal calcolo dei min e max dell'array i valori sballati
	var data_min_clean = graph_data.filter(function (elem) { return elem[1] !== -999.9; });
	var lowest  = Math.min.apply( Math, $.map(data_min_clean, function(o){ return o[1]; }) );
	var highest_hmax = Math.max.apply( Math, $.map(graph_data_hmax, function(o){ return o[1]; }) );
	var highest = Math.max.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
	var highest_temp = Math.max.apply( Math, $.map(graph_data_temp, function(o){ return o[1]; }) );
	var last_data_oss = <?php echo $last_data_oss; ?>;
        var first_data_oss = <?php echo $first_data_oss; ?>;
}
//else if (id_parametro == 'PREVIDRO' || id_parametro == 'PREVIPO') {
else if (id_parametro == 'PREVIDRO' || (id_parametro.match(/FEWS.*/))) {
        var highest_oss = Math.max.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
        var highest_mc = Math.max.apply( Math, $.map(graph_data_temp, function(o){ return o[1]; }) );
        var highest_m1 = Math.max.apply( Math, $.map(graph_data_alert, function(o){ return o[1]; }) );
        var highest_so = Math.max.apply( Math, $.map(graph_data_warning, function(o){ return o[1]; }) );
        var highest_he = Math.max.apply( Math, $.map(graph_data_validate, function(o){ return o[1]; }) );
	var last_data_oss = <?php echo $last_data_oss; ?>;
	var first_data_oss = <?php echo $first_data_oss; ?>;
}
else {
	var highest_cum = Math.max.apply( Math, $.map(graph_data_cum, function(o){ return o[1]; }) );
	var highest = Math.max.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
	var lowest  = Math.min.apply( Math, $.map(graph_data, function(o){ return o[1]; }) );
	var last_data_oss = <?php echo $last_data_oss; ?>;
	var first_data_oss = <?php echo $first_data_oss; ?>;
}

//alert(highest,lowest);
console.log("highest="+highest+" - lowest="+lowest+" - first_data_oss="+first_data_oss);

set_options(id_parametro);

//Per mostrare/nascondere la legenda:
/*Highcharts.Legend.prototype.toggle = function () {
    if (this.display) {
        this.group.hide();
    } else {
        this.group.show();
    }
    this.display = !this.display;
    this.chart.isDirtyBox = true;
    this.chart.redraw();
};
*/


$(function() {

/*
var id_parametro = '<?php //echo $id_parametro; ?>';
graph_data = <?php //echo json_encode($data_array); ?>;
set_options(id_parametro);
*/

//proviamo Highcharts:
$('#container').highcharts('StockChart', {
//$('#container').highcharts( {
        chart: {
	    height: custom_height,
	    polar: polar_chart,
            type: type_chart,
	    //plotBackgroundImage: '/common/icons/ARPA_Piem.jpg',
            plotBackgroundColor: {
                    linearGradient: { x1: 1, y1: 0, x2: 1, y2: 1 },
                    stops: [
                      [0, 'rgb(255, 255, 255)'],
                      [1, 'rgb(200, 200, 255)']
                      //[0, '#FFF'], [1, '#DDD']
                    ]
            }
	    //Provo ad aggiungere del TESTO sul GRAFICO:
	    ,events: {
                    load: function () {
                        //var label = this.renderer.label("How do I move this center and under the legend.")
			//Per il momento spengo questo testo sul grafico:
			var label = this.renderer.label("")
                        .css({
                            width: '450px',
                            color: '#222',
                            fontSize: '16px'
                        })
                        /*.attr({
                            'stroke': 'silver',
                            'stroke-width': 2,
                            'r': 5,
                            'padding': 10
                        })*/
                        .add();
                        label.align(Highcharts.extend(label.getBBox(), {
                            align: 'center',
                            x: 0, // offset
                            verticalAlign: 'center'
                            ,y: 50 // offset
                        }), null,'spacingBox');
                    }
	    }
        },
	lang: {
            printChart: 'Print chart',
            downloadPNG: 'Download PNG',
            downloadJPEG: 'Download JPEG',
            downloadPDF: 'Download PDF',
            downloadSVG: 'Download SVG',
            contextButtonTitle: 'Esporta il grafico'
        },
	credits: {
		text: 'Arpa Piemonte - ultimo agg. '+data_agg,
		href: 'http://webgis.arpa.piemonte.it/webmeteo/meteo.php?CODTOT='+codice_istat+progr_punto_com
	/*
	    position: {
	        align: 'left',
        	verticalAlign: 'bottom',
	        x: 10,
        	y: -10
	    }
	*/
	},
	title: { text: main_plot_title },
        subtitle: {
            text: plot_title
        },
	exporting: {
            //width: 1920,
	    //scale: 1,
	    chartOptions:{
                legend:{enabled: export_legend_enabled},
		rangeSelector: {enabled: false},
		navigator: {enabled: false},
		scrollbar: {enabled: false}
            },
	    filename: denominazione+'_'+id_parametro
            //Per evitare di scegliere l'estensione, faccio esportare solo in svg - commento forse il modulo e' migliorato...
	    ,buttons: {
                contextButton: {
                    /*menuItems: null,
                    onclick: function () {
                        this.exportChart();
                    }*/
                }
            }
            //,type: 'image/svg+xml'
	},
	legend: {
	    	enabled: legend_enabled,
	    	align: 'center',
        	//backgroundColor: '#FCFFC5',
        	borderColor: 'black',
        	borderWidth: 1,
	    	layout: 'vertical',
	    	verticalAlign: 'top',
	    	y: y_legend, x: 275,
		floating: true,
	    	shadow: true
	},
        xAxis: {
                type: xaxys_type
                ,gridLineWidth: 1
		,ordinal: false
		,tickInterval: tick_interval_x
		,tickPositions: xaxis_tickposition
                ,min: min_x
                ,max: max_x
		,tickmarkPlacement: 'on'
                ,title: {
                        text: xaxys_title
                }
		,plotBands: [{
		  color: color_plotBand, // Color value
		  from: start_plotBand, // Start of the plot band
		  to: end_plotBand // End of the plot band
		  ,label: {
		    text: label_plotBand, // Content of the label. 
		    align: align_plotBand // Positioning of the label. Default to center.
		    //,x: +10 // Amount of pixels the label will be repositioned according to the alignment. 
		  }
		}
		]
		,plotLines: [
                    {
                    color: color_Xline, // Color value
                    value: Xline,
                    width: 3,
                    zIndex: 2
                    ,label: {
                        text: label_Xline,
                        align: align_label_Xline
                    }
                    }
            	]
                ,labels: {
                        formatter: function() {
			    if (id_parametro == 'DEFLUSSO') return this.value;
			    else if (id_parametro == 'ROSE') {
				return wind_categories[Math.round(this.value / 22.5)] + '*';
				//return wind_categories[this.value];
			    }
			    else if (id_parametro == 'SEZFLUV') {
                                return (this.value);
                            }
			    else if (id_parametro == 'MAX_IDRO' || id_parametro == 'DIGHE_L' || id_parametro == 'DIGHE_V') {
				return Highcharts.dateFormat('%d/%m/%y', this.value);
			    }
			    else if (id_parametro == 'IDRO_BIS' || id_parametro == 'PORTATA_BIS' || id_parametro == 'bilancioIDRO' || id_parametro == 'NIVOVAL') {
                                return Highcharts.dateFormat('%d/%m/%y', this.value);
                            }
			    //else if (id_parametro == 'SPI03') {
			    else if (id_parametro.match(/SPI.*/) || id_parametro == 'SRI' || id_parametro.match(/PAL.*/)){
                                return Highcharts.dateFormat('%m/%y', this.value);
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
		buttons : default_rangeSelector_buttons 
		,selected : 0,
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
            title: { text: udm, x:yAxis_offset_x },
            lineWidth: 2,
	    opposite:false,
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
	    }
	    ,plotBands: [{ // mark the weekend
              color: yplotBands_color,
              from: yplotBands_from,
              to: yplotBands_to
            }]
            ,plotLines: [
                {
                color: color_soglia1, // Color value
                value: soglia1,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia1,
			align: align_label_soglia1
                }
                },
                {
                color: color_soglia2, // Color value
                value: soglia2,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia2,
			align: align_label_soglia2
                }
                },
                {
                color: color_soglia3, // Color value
                value: soglia3,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia3,
			align: align_label_soglia3
                }
                }
            ]
        },
	//Opzioni per ROSE da verificare se valide anche per gli altri:
	plotOptions: {
            series: {
                stacking: plotOptions_stacking,
                shadow: plotOptions_shadow,
                groupPadding: plotOptions_groupPadding,
                pointPlacement: plotOptions_pointPlacement
            },
	    /*line: {
                    marker: { enabled: markers_on_line }
            }*/
	    //Coloro le barre di un grafico a colonne in base al valore:
	    column: {
		/*stacking: plotOptions_stacking,
                shadow: plotOptions_shadow,
                groupPadding: plotOptions_groupPadding,
                pointPlacement: plotOptions_pointPlacement,*/
		pointWidth: plotOptions_column_pointWidth,
                groupPadding: plotOptions_column_groupPadding,
		zones: [{
		  value: plotOptions_value0, // Values up to this (not including) ...
	  	  color: plotOptions_value0_color
		},{
	  	  value: plotOptions_value1, // Values up to this (not including) ...
	  	  color: plotOptions_value1_color
		},{
	  	  value: plotOptions_value2, // Values up to this (not including) ...
	  	  color: plotOptions_value2_color
		},{
	  	  value: plotOptions_value3, // Values up to this (not including) ...
	  	  color: plotOptions_value3_color
		},{
	  	  value: plotOptions_value4, // Values up to this (not including) ...
	  	  color: plotOptions_value4_color
		},{
		  color: plotOptions_value5_color // Values from this (including) and up have the color red
		}]
	    }
        },
        series: [
            {name: name_series, id: 'main',
	    type: type_series,
            showInLegend: showInLegend_serie1,
	    connectNulls: connectNulls_mainseries,
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
//non sembra venir riconosciuto, almeno nello scatter-plot per i marker
zones: [{
            value: zone_serie_value0,
            color: zone_serie_color0
        }, {
            value: zone_serie_value1,
            color: zone_serie_color1
        }, {
            color: zone_serie_color2
}],
	    negativeColor: series_negativecolor
	    ,dataGrouping: { enabled: false } //per evitare che raggruppi i valori dei dati mostrando difatto dei valori non veri
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
            showInLegend: show_in_legend_alertwarningverify,
            data: graph_data_alert,
            type: serie_type_alertwarningverify,
            //shadow : shadow_line,
            marker: {
		//symbol: 'url(/common/icons/plot_warning.png)'
                    symbol: symbol_alertwarningverify,
                    fillColor: marker_fillcolor_alert,
                    lineColor: markerline_color_alert,
                    lineWidth: markerline_width
		    ,enabled: enabled_marker_alertwarningverify
            }
            //threshold: series_treshold,
            ,color: series_color_alert
            //negativeColor: series_negativecolor
        }
	,{name: name_warning_serie,
            showInLegend: show_in_legend_alertwarningverify,
            data: graph_data_warning,
            type: serie_type_alertwarningverify,
            //shadow : shadow_line,
            marker: {
                    symbol: symbol_alertwarningverify,
                    fillColor: marker_fillcolor_warning,
                    lineColor: markerline_color_warning,
                    lineWidth: markerline_width
		    ,enabled: enabled_marker_alertwarningverify
            }
            //threshold: series_treshold,
            ,color: series_color_warning
            //negativeColor: series_negativecolor
        }
	,{name: name_verify_serie,
            showInLegend: show_in_legend_alertwarningverify,
            data: graph_data_validate,
            type: serie_type_alertwarningverify,
            //shadow : shadow_line,
            marker: {
                    symbol: symbol_alertwarningverify,
                    fillColor: marker_fillcolor_verify,
                    lineColor: markerline_color_verify,
                    lineWidth: markerline_width
                    ,enabled: enabled_marker_alertwarningverify
            }
            //threshold: series_treshold,
            ,color: series_color_verify
            //negativeColor: series_negativecolor
        }
	,{
            name: 'Range',
            data: graph_data_range,
            type: 'arearange',
            lineWidth: 0,
            //linkedTo: ':previous',
	    linkedTo: name_warning_serie,
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0.3,
            zIndex: 0
        }
        ],
        tooltip: {
                formatter: function() {
			//if(id_parametro=='VELV') return 'h'+Highcharts.dateFormat('%H:%M', this.x)+'  <b> '+this.y+udm+'-'+(this.y*3.6).toFixed(1)+'km/h';
		    if (id_parametro=='DEFLUSSO') return (this.y).toFixed(2) + 'm   <b> ' + (this.x).toFixed(1) + 'm3/s';
                        //else return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + udm;
		    else if (id_parametro=='ROSE') return wind_categories[this.x/22.5] + '  <b> ' + this.y + '%</b>';
		    else if (id_parametro=='MAX_IDRO') {
			var chart_ttip = $('#container').highcharts();
			//var points = chart_ttip.get('main').yData;
			//var y_index = points.indexOf( this.y );
			//var note_max_idro = graph_data_note_max_idro[y_index][1];
			var points_X = chart_ttip.get('main').xData;
        	        var x_index = points_X.indexOf( this.x );
	                var note_max_idro = graph_data_note_max_idro[x_index][1];
			if (note_max_idro === null || note_max_idro === undefined) note_max_idro = '';
			return Highcharts.dateFormat('%d/%m/%y', this.x) + '  <b> ' + this.y + udm + '<br/>' + note_max_idro;
		    }
		    else if (id_parametro=='SRI') {
			return 'h'+Highcharts.dateFormat('%m/%y', this.x) + '  <b> ' + this.y;
		    }
		    else if (id_parametro=='SEZFLUV') {
                        return '<b> ' + this.y + udm;
                    }
		    else if (id_parametro=='WTH 15M') {
			return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + ' ' + synop_code[this.y];
		    }
		    else if (id_parametro=='DIGHE_L' || id_parametro=='DIGHE_V') {
			return Highcharts.dateFormat('%d/%m/%y', this.x) + '  <b> ' + this.y +  ' ' + udm;
		    }
		    else return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y + ' ' + udm;
                },
		shared: true
                ,crosshairs: true
        }

//Provo una legenda che si spegne/accende dall'utente:
/*	},
    function(chart) 
    {
        $('#toggle-legend').click(function () { chart.legend.toggle(); });
*/
   /*in ogni caso per individuare la legenda:
	iframe=$("#myIFrame0")
	graphic=iframe.context.all.container
	$(graphic).find('g.highcharts-legend')
	$(graphic).find('g.highcharts-legend').css("visibility", "hidden"); 
   */
//Fine della funzione $('#container').highcharts 
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

	var alert_serie = chart.series[3];
        alert_serie.update({
          yAxis: 'rainfall-axis'
        }, false);
	var warning_serie = chart.series[4];
	warning_serie.update({
	  yAxis: 'rainfall-axis'
        }, false);
	var verify_serie = chart.series[5];
        verify_serie.update({
          yAxis: 'rainfall-axis'
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

//Aggiungo la serie di dati per lo SLOPS calcolo di I:
if(id_parametro=='SLOPS') {
        var chart = $('#container').highcharts();

        var seconda_serie = chart.series[1];
        seconda_serie.update({
                name: 'threshold',
                //yAxis: 'rainfall-axis',
                data: graph_data_cum,
                //step: 'right',
                type: 'line',
                color: 'orange',
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
}
/*
if(id_parametro=='WTH 15M') {
        var chart = $('#container').highcharts();
        chart.series[0].update({
                //color: 'orange',
		zones: [{
		  value: 10, // Values up to this (not including) ...
	  	  color: 'blue'
		},{
	  	  value: 30, // Values up to this (not including) ...
	  	  color: 'orange'
		},{
	  	  value: 60, // Values up to this (not including) ...
	  	  color: 'green'
		},{
	  	  value: 70, // Values up to this (not including) ...
	  	  color: 'purple'
		},{
	  	  value: 80, // Values up to this (not including) ...
	  	  color: 'gray'
		},{
		  color: 'purple' // Values from this (including) and up have the color red
		}],
	});
        chart.redraw();
}
*/
if(id_parametro=='FEST') {
        var chart = $('#container').highcharts();
        var seconda_serie = chart.series[1];
        seconda_serie.update({
            name: 'Soglia',
            data: graph_data_temp,
            color: 'green',
            shadow: shadow_line,
            tooltip: {
                valueSuffix: 'mm'
            },
            shadow: false
            ,showInLegend: true
        }, false);
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

//Aggiungo l'asse per le temperature e relativa serie di dati:
if(id_parametro=='IGRO') {
	var chart = $('#container').highcharts();
        chart.yAxis[0].update({
            max: Math.max(highest_cum, highest, 100)
        });

	chart.addAxis({ // Secondary yAxis
            id: 'temp-axis',
            //min: 0,
            title: {
                text: 'Temperatura [°C]'
            },
            lineWidth: 1,
            lineColor: 'green',
            opposite: true
            ,labels: {
                style: { color: 'orange', fontWeight:'bold' }
            }
        });
        var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'temperatura',
            yAxis: 'temp-axis',
            data: graph_data_temp,
            type: 'line',
            tickInterval: 2.0,
            color: 'green',
            shadow: true,
            threshold: 0,
            negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: '°C'
            }
            ,showInLegend: true
        }, false);
        terza_serie.hide();

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
	    ,labels: {
                style: { color: 'orange', fontWeight:'bold' }
            }
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

//Aggiungo la serie di dati per le stazioni BIS:
if(id_parametro=='IDRO_BIS' || id_parametro == 'PORTATA_BIS') {
        var chart = $('#container').highcharts();
        //chart.yAxis[0].update({
        //    max: Math.max(highest_hmax, highest) //nn so perche non prende questo valore
        //});
        var seconda_serie = chart.series[1];
        seconda_serie.update({
            name: 'valori massimi',
            //yAxis: 'general_yaxis',
            data: graph_data_hmax,
            type: 'line',
            color: 'blue',
            tooltip: {
                valueSuffix: suffix_series
            },
            shadow: true
            ,showInLegend: true
        }, false);
        //seconda_serie.hide();
        var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'valori medi',
            //yAxis: 'general_yaxis',
            data: graph_data_temp,
            type: 'line',
            //tickInterval: 2.0,
            color: 'cyan',
            shadow: true,
            //threshold: 0,
            //negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: suffix_series
            }
            ,showInLegend: true
        }, false);
        //terza_serie.hide();
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
		var s = [];
		var chart_ttip = $('#container').highcharts();
		//var points = chart_ttip.get('main').yData;
		//var y_index = points.indexOf( this.y );
		var points_X = chart_ttip.get('main').xData;
		var x_index = points_X.indexOf( this.x );
		var note_max_idro = graph_data_note_max_idro[x_index][1];
		if (note_max_idro === null || note_max_idro === undefined) note_max_idro = '';
		else s.push(note_max_idro + '<br/>');
            $.each(this.points, function(i, point) {
		s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%m/%y ', point.x)+point.y + this.series.tooltipOptions.valueSuffix + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiungo la serie di dati per le stazioni del bilancio IDRO:
if(id_parametro=='bilancioIDRO') {
        var chart = $('#container').highcharts();
        var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'Portata nodo' + ' TOF<?php echo $tof_mc; ?>',
            //yAxis: 'general_yaxis',
            data: graph_data_temp,
            type: 'line',
	    connectNulls: true,
            //tickInterval: 2.0,
            color: 'blue',
            shadow: true,
            //threshold: 0,
            //negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: suffix_series
            }
            ,showInLegend: true
        }, false);
        //terza_serie.hide();
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
                //var points = chart_ttip.get('main').yData;
                //var y_index = points.indexOf( this.y );
                var points_X = chart_ttip.get('main').xData;
                var x_index = points_X.indexOf( this.x );
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%m/%yh%H ', point.x)+point.y + this.series.tooltipOptions.valueSuffix + '<span>');
            });
            return s.join('<br />');
        }
	chart.redraw();
}

//Aggiungo la serie di dati per le stazioni dei dati nivo validati:
if(id_parametro=='NIVOVAL') {
        var chart = $('#container').highcharts();
        var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'Altezza neve fresca',
            data: graph_data_temp,
            type: 'column',
            connectNulls: false,
            color: 'purple',
            shadow: true,
            tooltip: {
                valueSuffix: suffix_series
            }
            ,showInLegend: true
        }, false);
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
                var points_X = chart_ttip.get('main').xData;
                var x_index = points_X.indexOf( this.x );
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%m/%y ', point.x)+point.y + this.series.tooltipOptions.valueSuffix + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiungo la serie di dati per i bacini SPI:
if(id_parametro.match(/SPI.*/) || id_parametro.match(/PAL.*/)){
	var chart = $('#container').highcharts();
	//Aggiungo opzioni comuni a tutti e 4 i tipi di variabile SPI
	chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%m/%y ', point.x) + Highcharts.numberFormat(point.y, 2) + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}
if(id_parametro=='SPI01') {
        var chart = $('#container').highcharts();
        //Occulto le varie altre serie SPI01-SP06-SP12:
        var serie03 = chart.series[0];
        serie03.hide();
        var serie06 = chart.series[4];
        serie06.hide();
        var serie12 = chart.series[5];
        serie12.hide();

        chart.redraw();
}
if(id_parametro=='SPI03') {
        var chart = $('#container').highcharts();
	//Occulto le varie altre serie SPI01-SP06-SP12:
	var serie01 = chart.series[3];
	serie01.hide();
	var serie06 = chart.series[4];
        serie06.hide();
	var serie12 = chart.series[5];
        serie12.hide();

        chart.redraw();
}
if(id_parametro=='SPI06') {
        var chart = $('#container').highcharts();
        //Occulto le varie altre serie SPI01-SP06-SP12:
        var serie01 = chart.series[3];
        serie01.hide();
        var serie03 = chart.series[0];
        serie03.hide();
        var serie12 = chart.series[5];
        serie12.hide();

        chart.redraw();
}
if(id_parametro=='SPI12') {
        var chart = $('#container').highcharts();
        //Occulto le varie altre serie SPI01-SP06-SP12:
        var serie01 = chart.series[3];
        serie01.hide();
        var serie06 = chart.series[4];
        serie06.hide();
        var serie03 = chart.series[0];
        serie03.hide();

        chart.redraw();
}

//Aggiungo la serie di dati SPI da abbinare a PAL:
if(id_parametro=='PAL01') {
	var chart = $('#container').highcharts();
	var seconda_serie = chart.series[1];
        seconda_serie.update({
            name: 'SPI01',
            yAxis: 'general_yaxis',
            data: graph_data_temp,
            //step: 'right',
            type: 'line',
            color: 'blue',
            shadow: shadow_line,
            shadow: false
            ,showInLegend: true
        }, false);
        seconda_serie.hide();
	var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'SPI03',
            yAxis: 'general_yaxis',
            data: graph_data_cum,
            //step: 'right',
            type: 'line',
            color: 'purple',
            shadow: shadow_line,
            shadow: false
            ,showInLegend: true
        }, false);
        terza_serie.hide();
	chart.redraw();
}


//Aggiungo la serie di dati per le previsioni idro sul PO:
if(id_parametro.match(/PREVIPO.*/)){
        var chart = $('#container').highcharts();
        //Aggiungo la serie dei dati osservati:
        var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'FW-MC' + ' TOF<?php echo $tof_mc .' '. $id_previ_mc.$data_previ_mc; ?>',
            //yAxis: 'general_yaxis',
            data: graph_data_temp,
            type: 'line',
            //tickInterval: 2.0,
            color: 'black',
            shadow: true,
            //threshold: 0,
            //negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: suffix_series
            }
            ,showInLegend: true
        }, false);
        //Aggiungo opzioni comuni a tutti e 4 i tipi di variabile SPI
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%mh%H - ', point.x) + Highcharts.numberFormat(point.y, 1) + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}
//Aggiungo la serie di dati per le previsioni idro:
if(id_parametro.match(/PREVIDRO.*/)){
        var chart = $('#container').highcharts();
	//Aggiungo la serie dei dati osservati:
	var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'FW-MC' + ' TOF<?php echo $tof_mc .' '. $id_previ_mc.$data_previ_mc; ?>',
            //yAxis: 'general_yaxis',
            data: graph_data_temp,
            type: 'line',
            //tickInterval: 2.0,
            color: 'black',
            shadow: true,
            //threshold: 0,
            //negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: suffix_series
            }
            ,showInLegend: true
        }, false);
        //Aggiungo opzioni comuni a tutti e 4 i tipi di variabile SPI
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%mh%H - ', point.x) + Highcharts.numberFormat(point.y, 1) + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}
if(id_parametro.match(/FEWS.*/)) {
        var chart = $('#container').highcharts();
        //Aggiungo opzioni comuni a tutti e 4 i tipi di variabile SPI
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%mh%H - ', point.x) + Highcharts.numberFormat(point.y, 2) + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}
if(id_parametro.match(/previMC.*/)){
        var chart = $('#container').highcharts();
        //Aggiungo la serie dei dati osservati:
        var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'FW-MC' + ' TOF<?php echo $tof_mc .' '. $id_previ_mc.$data_previ_mc; ?>',
            //yAxis: 'general_yaxis',
            data: graph_data_temp,
            type: 'line',
            //tickInterval: 2.0,
            color: 'black',
            shadow: true,
            //threshold: 0,
            //negativeColor: '#6495ED',
            tooltip: {
                valueSuffix: suffix_series
            }
            ,showInLegend: true
        }, false);
        //Aggiungo opzioni comuni a tutti e 4 i tipi di variabile SPI
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
            $.each(this.points, function(i, point) {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%mh%H - ', point.x) + Highcharts.numberFormat(point.y, 1) + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}
if(id_parametro.match(/previPROB.*/)){
        var chart = $('#container').highcharts();
        //Aggiungo opzioni comuni a tutti e 4 i tipi di variabile SPI
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                var s = [];
                var chart_ttip = $('#container').highcharts();
            $.each(this.points, function(i, point) {
                if (point.series.name != 'Range') {s.push('<span style="color:'+point.series.color+';font-weight:bold;">'+Highcharts.dateFormat('%d/%mh%H - ', point.x) + Highcharts.numberFormat(point.y, 1) + '<span>');}
		else if (point.series.name == 'Range') {
		  s.push('<span style="color:'+point.series.color+';font-weight:bold;">Spread ' + Highcharts.numberFormat(point.point.low, 1) + '-' + Highcharts.numberFormat(point.point.high, 1)  + '<span>');
		}
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiungo la serie di dati per le RAFFICHE DI VENTO:
if(id_parametro=='VELV') {
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
			'  <b> '+this.y+' '+udm+'-'+(this.y*3.6).toFixed(1)+'km/h' + '<span>');
            });
            return s.join('<br />');
        }
        chart.redraw();
}

//Aggiungo la serie di dati per la temperatura di rugiada:
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
		,negativeColor: '#6495ED'
        }, false);

	var terza_serie = chart.series[2];
        terza_serie.update({
            name: 'humidex',
            //yAxis: 'temp-axis',
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
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                var s = [];
            $.each(this.points, function(i, point) {
		if(point.series.name=='temp_rugiada') {
		  s.push('<span style="color:'+point.series.color+';font-weight:bold;">rugiada<b> '+this.y+udm + '<span>');
		}
		else if(point.series.name=='humidex') {
                  s.push('<span style="color:'+point.series.color+';font-weight:bold;">humidex<b> '+this.y+udm + '<span>');
                }
		else {
                  s.push('<span style="color:'+point.series.color+';font-weight:bold;">h'+Highcharts.dateFormat('%H:%M ', point.x)+ '  <b> '+this.y+udm + '<span>');
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


//Richiamo la funzione per recuperare le ore di alba e tramonto e plottare le PLOTBANDS:
if(id_parametro!='ROSE' && id_parametro!='PORTATA_BIS' && id_parametro!='IDRO_BIS' && id_parametro!='NIVOVAL' && id_parametro!='DEFLUSSO' && id_parametro!='MAX_IDRO' && (id_parametro.indexOf('SPI')==-1) && (id_parametro.indexOf('PAL01')==-1) && (id_parametro.indexOf('PREVI')==-1) && (id_parametro.indexOf('previ')==-1) && id_parametro!='bilancioIDRO' && (id_parametro.indexOf('FEWS')==-1) && (id_parametro.indexOf('DIGHE')==-1) ) {
  calc_day_and_nigth();
}
if(id_parametro=='PREVIDRO' || (id_parametro.indexOf('previ')>-1) || id_parametro.indexOf('FEWS')>-1) {
  calc_step_orario();
}

//Reference for timelabel: http://stackoverflow.com/questions/7101464/how-to-get-highcharts-dates-in-the-x-axis
//fine della pova con Highcharts
});

</script>

</head>

<body>

<!-- <div id="container" style="width:100%; height:400px;"></div> -->
<div id="container" style="width:99%; height:400px;"></div>

</body>
</html>

