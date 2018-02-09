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

date_default_timezone_set('UTC');

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

/*
Plotto dei grafici per visualizzare l'andamento delle temperature.
Richiama con $.ajax uno script php che scarica i dati da DB e li fornisce nella forma:
[date, values]
In modo da poter essere plottati.
Lo script e' pensato in maniera tale da poter essere richiamato da altre pagine.

*/

$realtimetable_from = 'realtime.meteo_estero';
$basetable_from = 'dati_di_base.rete_estero';

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
$data_array_atl = array(); //variabile array stocca dati per curve segnalatrici atlante piogge
$data_array_dew = array(); //variabile array stocca dati temperatura di rugiada
$data_array_temp = array(); //variabile array stocca dati temperatura per validazione dati NIVO

$pass_time = 60;

if ($codice_istat == '001272' and $progr_punto_com == 825) $pass_time = 10;

//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' ) ORDER BY data ASC;";
if($id_parametro=='PLUV') {
	//Problema questa query: fa vedere anche i dati intermedi se l'ora non e' completa
	// $query = "SELECT max(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone) AS data, sum(valore_originale) AS valore_originale, max(tipologia_validaz), max(data_agg) FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' GROUP BY ceil(extract('epoch' from to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp without time zone) / 3600) ORDER BY data;";
	//Problema questa query: accorpa come dato orario dei dati anche se il ciclo orario non e' completo
	 $query = "SELECT to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval AS data, sum(valore_originale) AS valore_originale, max(tipologia_validaz), max(data_agg) FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' GROUP BY to_char(to_timestamp(data||ora, 'YYYY-MM-DDHH24:MI:SS')::timestamp - '1 minute'::interval,'YYYY-MM-DD HH24:00:00')::timestamp + '1 hour'::interval ORDER BY data ASC;";
	$query_cumulata = "SELECT data+ora::time AS dataora, sum(valore_originale) OVER (ORDER BY data+ora::time) FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='$id_parametro';";
}
else if($id_parametro=='ATL') {
        $query = "SELECT tr, array_to_string(durate,','), array_to_string(pioggia,','), data_agg FROM dati_di_base.atlante_piogge_lspp WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com;";
}
else if($id_parametro=='NIVO') {
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale*100, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = '$id_parametro' ORDER BY data ASC;";
	//provo query che crea serie temporale costante passo 30minuti:
	$query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale*100 as valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati cumulata pioggia per validazione con lo stesso step temporale dei dati nivo:
	$query_cumulata = "SELECT dd::timestamp without time zone as data, valore_originale FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '30 minute'::interval) dd LEFT OUTER JOIN (SELECT data+ora::time AS data, sum(valore_originale) OVER (ORDER BY data+ora::time) as valore_originale FROM $realtimetable_from WHERE codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND id_parametro ='PLUV') AS dati_staz ON (dd=data) ORDER BY data ASC;";
	//Aggiungo dati temperatura per validazione:
	$query_temp = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz /*, max(dati_staz.data_agg) OVER () AS data_agg*/ FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') , now(), '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='IDRO') {
	//Visto che alcune stazioni hanno piu' di un idrometro, sono costretto a prenderne solo uno per stazione:
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%' ORDER BY id_parametro LIMIT 1) ORDER BY data ASC;";
        //provo query che crea serie temporale costante passo 30minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro = (select id_parametro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%' ORDER BY id_parametro LIMIT 1) ) AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='PORTATA') {
	//Nel caso della PORTATA esiste solo il valore_validato. Alcune stazioni, avendo piu' idrometri, hanno anche piu' valori di portata. A noi pero' al momento interessa solo PORTATA:
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro' ORDER BY data ASC;";
        //provo query che crea serie temporale costante passo 30minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_validato, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro') , now(), '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_validato, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}
else if($id_parametro=='DEW') {
	$query = "SELECT dd::timestamp without time zone as data, dati_staz.valore_originale, dati_staz.tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg, umidita.igro, zradar_td(dati_staz.valore_originale, umidita.igro) AS rugiada FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') , now(), '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'TERMA%') AS dati_staz ON (dd=dati_staz.data) LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale AS igro FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like 'IGRO%') AS umidita ON (dd=umidita.data) ORDER BY data ASC;";
}
else if($id_parametro=='ROSE') {
        //query per recuperare gli ultimi 145 valori:
        $query = "SELECT realtime.cardinal2degree(dirv.direction),round((count(velv.*) * 100 / max(dirv.total))) AS big_freq0,round((count(velv1.*) * 100 / max(dirv.total))) AS big_freq1,round((count(velv2.*) * 100 / max(dirv.total))) AS big_freq2,round((count(velv3.*) * 100 / max(dirv.total))) AS big_freq3,max(dirv.total) AS big_total, max(data_agg) as data_agg FROM (SELECT codice_istat_comune, progr_punto_com, data||ora AS dataora, data_agg, count(*) OVER () AS total, realtime.degree2cardinal(valore_originale) AS direction FROM $realtimetable_from WHERE id_parametro IN ('DIRV') AND valore_originale IS NOT NULL AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND data = current_date AND tipologia_validaz NOT LIKE 'A%' ) AS dirv LEFT JOIN (SELECT valore_originale AS speed0, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale < 0.5 AND data = current_date ) AS velv ON (velv.codice_istat_comune= dirv.codice_istat_comune AND velv.progr_punto_com= dirv.progr_punto_com AND velv.dataora = dirv.dataora) LEFT JOIN (SELECT valore_originale AS speed1, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale BETWEEN 0.5 AND 5 AND data = current_date ) AS velv1 ON (velv1.codice_istat_comune= dirv.codice_istat_comune AND velv1.progr_punto_com= dirv.progr_punto_com AND velv1.dataora = dirv.dataora) LEFT JOIN (SELECT valore_originale AS speed2, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale BETWEEN 5 AND 10 AND data = current_date ) AS velv2 ON (velv2.codice_istat_comune= dirv.codice_istat_comune AND velv2.progr_punto_com= dirv.progr_punto_com AND velv2.dataora = dirv.dataora) LEFT JOIN (SELECT valore_originale AS speed3, codice_istat_comune, progr_punto_com, data||ora AS dataora FROM $realtimetable_from WHERE id_parametro IN ('VELV') AND codice_istat_comune = '$codice_istat' AND progr_punto_com = $progr_punto_com AND valore_originale IS NOT NULL AND valore_originale > 10 AND data = current_date ) AS velv3 ON (velv3.codice_istat_comune= dirv.codice_istat_comune AND velv3.progr_punto_com= dirv.progr_punto_com AND velv3.dataora = dirv.dataora) WHERE dirv.codice_istat_comune = '$codice_istat' AND dirv.progr_punto_com = $progr_punto_com GROUP BY dirv.codice_istat_comune, dirv.progr_punto_com, dirv.direction ORDER BY dirv.codice_istat_comune, dirv.progr_punto_com, realtime.cardinal2degree(dirv.direction);";
}
else {
	//$query = "SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%'  ORDER BY data ASC;";
        //provo query che crea serie temporale costante passo 30minuti:
        $query = "SELECT dd::timestamp without time zone as data, valore_originale, tipologia_validaz, max(dati_staz.data_agg) OVER () AS data_agg FROM generate_series ( (select min(to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone) from $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') , now(), '$pass_time minute'::interval) dd LEFT OUTER JOIN (SELECT to_timestamp(data || ora, 'YYYY-MM-DDHH24:MI')::timestamp without time zone AS data, valore_originale, tipologia_validaz, data_agg FROM $realtimetable_from a WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com AND id_parametro like '$id_parametro%') AS dati_staz ON (dd=data) ORDER BY data ASC;";
}

//Recupero quota e soglie idrometriche per la stazione:
$query_datigenerali = "SELECT denominazione, quota_int, b.codice1, b.codice2, b.codice3, c.codice1, c.codice2, c.codice3 FROM $basetable_from a LEFT OUTER JOIN dati_di_base.soglie_idrometriche b ON a.codice_istat_comune = b.codice_istat_comune AND a.progr_punto_com = b.progr_punto_com and id_parametro like 'IDRO%' LEFT OUTER JOIN dati_di_base.soglie_idrometriche c ON a.codice_istat_comune = c.codice_istat_comune AND a.progr_punto_com = c.progr_punto_com and c.id_parametro like 'PORTATA%' WHERE a.codice_istat_comune = '$codice_istat' AND a.progr_punto_com = $progr_punto_com;";

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
                        //Ora calcolo la temperatura di rugiada - DA ERRORE se umidita e' nulla
                        //$temp = is_null($row[1]) ? null : round(floatval($row[1]),2);
                        //$igro = floatval($row[4]);
                        //if (is_null($temp) || is_null($igro)) $dew = null;
                        //else $dew = 243.04*(log($igro/100)+((17.625*$temp)/(243.04+$temp)))/(17.625-log($igro/100)-((17.625*$temp)/(243.04+$temp)));
                        //$dew = $temp * ($igro/100);
                        //$data_array_dew[] = array(strtotime($row[0])*1000, is_null($dew) ? null : round(floatval($dew),1));

			//Lo recupero da DB:
			$data_array_dew[] = array(strtotime($row[0])*1000, is_null($row[5]) ? null : round(floatval($row[5]),1));
                    }
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
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/modules/exporting.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/highcharts-more.js"></script>';
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
var graph_data_temp; //inizializzazione data array per i grafici - temperatura per validazione NIVO
var graph_data_mslp; //inizializzazione data array per i grafici - temperatura di rugiada

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


var plot_title, udm, soglia, soglia1, soglia2, soglia3, label_soglia1, label_soglia2, label_soglia3, min_y, max_y, min_x, max_x, marker_fillcolor, markerline_color;
var sogliaG1, sogliaG2;
var sogliaP1, sogliaP2, sogliaP3;
var series_negativecolor, min_range_y, tick_interval_y, tick_interval_x, suffix_series, xaxis_tickposition;
var plotOptions_stacking, plotOptions_shadow, plotOptions_groupPadding, plotOptions_pointPlacement;
var name_series = 'parametro';
var name_alert_serie = 'alert';
var name_warning_serie = 'warning';
var name_verify_serie = 'verify';
var enabled_marker_alertwarningverify = true;
var serie_type_alertwarningverify = 'scatter';
var showInLegend_serie1 = false;
var showInLegend_serie2 = false;
var showInLegend_serie3 = false;
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
var enable_label_y = true;
var xaxys_type = 'datetime';
var xaxys_title = 'Data e ora (UTC)';
var yaxys_type = 'linear';
var rangeselector_enabled = true;
var navigator_enabled = true;
var scrollbar_enabled = true;
var legend_enabled = true;
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


function set_options(id_parametro) {
//A seconda del parametro richiamato setto alcune opzioni per il grafico:
	switch(id_parametro)
	{
        case 'GAMMA1':
                plot_title = 'Andamento intensita\' di dose equivalente di radiazione gamma';
                udm = 'nSv/h';
                markers_on_line = false;
                series_color = 'blue';
                min_y = lowest;
                max_y = highest;
                break;
	case 'BARO':
		plot_title = 'Andamento della pressione atmosferica';
		udm = 'mb';
		markers_on_line = false;
		series_color = 'blue';
		min_y = lowest;
		max_y = highest;
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
                plot_title = 'Andamento delle temperature: aria e rugiada';
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
                udm = 'cm';
		markers_on_line = false;
		if (soglia1) min_y = Math.min(lowest, soglia1);
                else min_y = lowest;
		max_y = Math.max(highest, soglia);
		tick_interval_y = 0.4;
                break;
	case 'NIVO':
                plot_title = 'Altezza neve';
                udm = 'cm';
		markers_on_line = false;
		suffix_series = 'cm';
                min_y = 0;
		max_y = Math.max(highest, 100);
		tick_interval_y = 20;
                break;
	case 'VELV':
                plot_title = 'Velocita\' del vento';
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

var id_parametro = '<?php echo $id_parametro; ?>';
//var tipo_validaz = '<?php //echo $tipo_validaz; ?>';
var data_agg = '<?php echo $data_agg; ?>';
var denominazione = '<?php echo $denominazione; ?>';
var quota = <?php echo $quota; ?>;
var codice_istat = '<?php echo $codice_istat; ?>';
var progr_punto_com = <?php echo $progr_punto_com; ?>;
graph_data = <?php echo json_encode($data_array); ?>;
graph_data_cum = <?php echo json_encode($data_array_cum); ?>;
graph_data_raf = <?php echo json_encode($data_array_raf); ?>;
graph_data_alert = <?php echo json_encode($data_array_alert); ?>;
graph_data_warning = <?php echo json_encode($data_array_warning); ?>;
graph_data_validate = <?php echo json_encode($data_array_validate); ?>;
graph_data_dew = <?php echo json_encode($data_array_dew); ?>;
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
                gridLineWidth: 1
		,ordinal: false
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
		minRange: min_range_y,
		tickInterval: tick_interval_y,
		min: min_y,
		max: max_y,
            title: { text: udm },
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
            lineWidth: 2,
            plotLines: [
                {
                color: 'green', // Color value
                value: soglia1,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia1,
			align: 'right'
                }
                },
                {
                color: 'orange', // Color value
                value: soglia2,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia2,
			align: 'right'
                }
                },
                {
                color: 'red', // Color value
                value: soglia3,
                width: 3,
                zIndex: 2
                ,label: {
                	text: label_soglia3,
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
                        '  <b> '+this.y+udm+'-'+(this.y*3.6).toFixed(1)+'km/h' + '<span>');
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
        }, false);
        chart.tooltip.options.shared = true;
        chart.tooltip.options.crosshairs = true;
        chart.tooltip.options.formatter = function() {
                //return 'h'+Highcharts.dateFormat('%H:%M', this.x) + '  <b> ' + this.y;
                var s = [];
            $.each(this.points, function(i, point) {
                if(point.series.name=='temp_rugiada') {
                s.push('<span style="color:'+point.series.color+';font-weight:bold;">rugiada<b> '+this.y+udm + '<span>');
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
  calc_day_and_nigth();
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

