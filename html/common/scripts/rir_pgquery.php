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

function onlyifvalue($field) {
        if ($field == '') {return '';}
        else {return ', '.$field;}
}

//Recupero alcune info dall'URL del popup.js:
$id_stabilimento = $_GET['id_stabilimento'];
$id_ministero = $_GET['id_ministero'];
$id_siar = $_GET['id_siar'];
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
<title>Dati stabilimento - ID=<?php echo $id_stabilimento;?> - IdMin.=<?php echo $id_ministero;?> - IdSiar=<?php echo $id_siar;?></title>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
//Proviamo Highcharts:
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/highcharts.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/Highcharts-3.0.9/js/modules/exporting.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/js_functions.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/common/scripts/browser_detect.js"></script>';
echo $script_js1st;
?>

<script>
$(function() {
        $("#tabs").tabs();
});
</script>

<style>
table#categorie th {text-align:center}
table#categorie td {text-align:center}
table#categorie td:nth-child(3) {text-align: left;}
body {font-family: Verdana,Arial,sans-serif;}
/*table#sostanze td:first-child {text-align: center;}*/
#generale {height:30%;}
#tabs {height:60%;}
.ui-widget-content {border:none;}
#tabs-1, #tabs-2 {overflow-y:scroll; height:98%;}
#tabs-4 {width: 90%;}
</style>


<?php

$tab_content2 = "<div id='tabs-1'>"; //contenuto del tab che ospitera' l'elenco delle singole sostanze
$tab_content = ""; //contenuto del tab che ospita la classificazione delle categorie
$tab_content_doc = "<div id='tabs-2'>"; //contenuto del tab che ospitera' l'elenco della documentazione
$tab_contatti = "<div id='tabs-3'>"; //contenuto del tab che ospitera' i contatti dello stabilimento
$tab_content_graph = "<div id='tabs-4'>"; //contenuto del tab che ospitera' i grafici a colonna
$tab_title = "<ul><li><a href='#tabs-3'>INFO</a></li><li><a href='#tabs-1b'>D.lgs. 105/2015</a></li><li><a href='#tabs-1'>D.lgs. 334/1999</a></li><li><a href='#tabs-2'>Documentazione</a></li><li><a href='#tabs-4'>Grafici - TEST</a></li></ul>";

$query = "SELECT * FROM ri0307.v_stabilimenti_rir_piemonte_334 WHERE id_stabilimento = $id_stabilimento;";
$query_cat = "SELECT id_cat AS id, categoria AS elemento, direttiva, label, soglia_inf, soglia_sup, note, nome_campo, nome_tabella, icona, attivo, udm FROM ri0307.soglie_categorie WHERE direttiva = '67/548' AND attivo=1 ORDER BY id_cat;"; //vecchia direttiva Seveso
$query_sost = "SELECT id_sost AS id, sostanza AS elemento, direttiva, label, soglia_inf, soglia_sup, note, nome_campo, nome_tabella, icona, attivo, udm FROM ri0307.soglie_sostanze WHERE direttiva = 'D.Lgs.334/99' AND attivo=1 ORDER BY id_sost;"; //vecchia direttiva Seveso
$query_doc = "SELECT 'empty' as gid, id_stabilimento, titolo, filename, data_caricamento FROM ri0307.documentazione_rir WHERE id_stabilimento = $id_stabilimento AND validita=TRUE;";

/* NUOVA DIRETTIVA */
$tab_content_new = "<div id='tabs-1b'>"; //contenuto del tab per la NUOVA DIRETTIVA
$query_new = "SELECT * FROM ri0307.v_stabilimenti_rir_piemonte_105 WHERE id_stabilimento = $id_stabilimento;";
$query_cat_new = "SELECT id_cat AS id, categoria AS elemento, direttiva, label, soglia_inf, soglia_sup, note, nome_campo, nome_tabella, icona, attivo, udm FROM ri0307.soglie_categorie WHERE direttiva = 'Reg.CE n.1272/2008' AND attivo=1 ORDER BY id_cat;";
$query_sost_new = "SELECT id_sost AS id, sostanza AS elemento, direttiva, label, soglia_inf, soglia_sup, note, nome_campo, nome_tabella, icona, attivo, udm FROM ri0307.soglie_sostanze WHERE direttiva = 'Reg.CE n.1272/2008' AND attivo=1 ORDER BY id_sost;";


function get_tab_content($stabilimento, $query_and_result, $tipo_elemento) {
    global $root_dir_html;
    global $el_nomi, $el_qta, $el_icone, $el_frasi, $el_label, $el_soglie_inf, $el_soglie_sup, $total_arr, $sovrassoglia_arr, $mezzasoglia_arr, $sottosoglia_arr, $sovrassoglia_arrN, $mezzasoglia_arrN, $sottosoglia_arrN;
    $el_nomi = array();
    $el_qta = array();
    $el_icone = array();
    $el_frasi = array();
    $el_label = array(); //per il grafico
    $el_soglie_inf = array();
    $el_soglie_sup = array();
    $total_arr = array();
    $sovrassoglia_arr = array();
    $mezzasoglia_arr = array();
    $sottosoglia_arr = array();
    $sovrassoglia_arrN = array(); //per le variabili normalizzate rispetto alla soglia_sup
    $mezzasoglia_arrN = array(); //per le variabili normalizzate rispetto alla soglia_sup
    $sottosoglia_arrN = array(); //per le variabili normalizzate rispetto alla soglia_sup

    while($elemento = pg_fetch_array($query_and_result)) {
    	$quantita = (double)$stabilimento[$elemento['nome_campo']];
    	if ($quantita > 0) {
    		array_push($el_nomi, $elemento['elemento']);
    		array_push($total_arr, $quantita);
    		$el_qta[$elemento['elemento']] = $quantita;
    		$el_icone[$elemento['elemento']] = $elemento['icona'];
    		$el_frasi[$elemento['elemento']] = $elemento['label'];
    		array_push($el_label, $elemento['label']);
    		$soglia_inf = intval($elemento['soglia_inf']);
    		$soglia_sup = intval($elemento['soglia_sup']);
    		//array_push($el_soglie_inf, $soglia_inf);
    		//array_push($el_soglie_sup, $soglia_sup);
    		$el_soglie_inf[$elemento['elemento']] = $soglia_inf;
    		$el_soglie_sup[$elemento['elemento']] = $soglia_sup;
    		//Costruisco degli array che mi serviranno per la costruzione del grafico a colonne:
    		//Calcolo anche le variabili nel caso in cui voglia plottare il grafico con valori normalizzati:
    		$quantitaN = $quantita / $soglia_sup;
    		$soglia_supN = 1;
    		$soglia_infN = $soglia_inf / $soglia_sup;
    		$quantita_res = 0; //inizializzo semplicemente la variabile
    		if ( $quantita > $soglia_sup ) {
    			$quantita_res = $quantita-$soglia_sup;
    			array_push($sovrassoglia_arr, $quantita_res);
    			array_push($sovrassoglia_arrN, $quantita_res/$soglia_sup); //normalizzato
    			$quantita_res = $quantita-$quantita_res-$soglia_inf;
    			array_push($mezzasoglia_arr, $quantita_res);
    			array_push($sottosoglia_arr, $soglia_inf);
    			array_push($mezzasoglia_arrN, $quantita_res/$soglia_sup); //normalizzato
    			array_push($sottosoglia_arrN, $soglia_inf/$soglia_sup); //normalizzato
    		} elseif ( $quantita > $soglia_inf ) {
    			$quantita_res = $quantita-$soglia_inf;
    			array_push($sovrassoglia_arr, 0);
    			array_push($sovrassoglia_arrN, 0); //normalizzato
    			array_push($mezzasoglia_arr, $quantita_res);
    			array_push($sottosoglia_arr, $soglia_inf);
    			array_push($mezzasoglia_arrN, $quantita_res/$soglia_sup); //normalizzato
    			array_push($sottosoglia_arrN, $soglia_inf/$soglia_sup); //normalizzato
    		} else {
    			array_push($sovrassoglia_arr, 0);
    			array_push($mezzasoglia_arr, 0);
    			array_push($sovrassoglia_arrN, 0); //normalizzato
    			array_push($mezzasoglia_arrN, 0); //normalizzato
    			array_push($sottosoglia_arr, $quantita);
    			array_push($sottosoglia_arrN, $quantitaN); //normalizzato
    		}
    	} //fine dell'IF per quantita>0
    } //fine del ciclo WHILE dentro i risultati della query

    //Nel caso delle CATEGORIE, per il momento, creo delle variabili JS per i GRAFICI:
    if ($tipo_elemento == 'Categorie') {
        print '<script type="text/javascript">';
        print 'var total_arr = ' . json_encode($total_arr) . ';';
        print 'var sovrassoglia_arr = ' . json_encode($sovrassoglia_arr) . ';';
        print 'var mezzasoglia_arr = ' . json_encode($mezzasoglia_arr) . ';';
        print 'var sottosoglia_arr = ' . json_encode($sottosoglia_arr) . ';';
        print 'var sovrassoglia_arrN = ' . json_encode($sovrassoglia_arrN) . ';';
        print 'var mezzasoglia_arrN = ' . json_encode($mezzasoglia_arrN) . ';';
        print 'var sottosoglia_arrN = ' . json_encode($sottosoglia_arrN) . ';';
        print 'var categoria_frasi = ' . json_encode($el_label) . ';';
        print 'var categoria_icone_arr = ' . json_encode($el_icone) . ';';
        print 'var soglia_inf = ' . json_encode(array_values($el_soglie_inf)) . ';';
        print 'var soglia_sup = ' . json_encode(array_values($el_soglie_sup)) . ';';
        print '</script>';
    }
    
    return $tab_content;
}


$conn = pg_connect($conn_string);

if (!$conn) { // Check if valid connection
	echo "Error Connecting to database <br>";
	exit;
}
else {
        // Valid connection, we can go on to retrieve some data
        $result = pg_query($conn,$query);
	$result_new = pg_query($conn,$query_new);
	$result_cat = pg_query($conn,$query_cat);
	$result_sost = pg_query($conn,$query_sost);
	$result_cat_new = pg_query($conn,$query_cat_new);
        $result_sost_new = pg_query($conn,$query_sost_new);
        if (!$result || !$result_cat || !$result_sost || !$result_new || !$result_cat_new || !$result_sost_new) {
                echo "Error on the query <br>";
        }
        else {
                $numrows = pg_numrows($result);

		//$stab = pg_fetch_row($result, 0); //prendo il primo record
		$stab = pg_fetch_array($result); //posso cosi' riferirmi ai risultati sia con l'indice che con il nome del campo! 
		$stab_new = pg_fetch_array($result_new); //posso cosi' riferirmi ai risultati sia con l'indice che con il nome del campo!

                //ELENCHIAMO LE CARATTERISTICHE DELLO STABILIMENTO:

		$div_generale = "<div id='generale'>";
		$div_generale .= "<table id='anagrafica'>";
		$div_generale .= "<tr><td><b>Stabilimento:</b></td><td><b>".$stab["rag_soc_azienda"]."</b></td></tr>";
		$div_generale .= "<tr><td><b>Indirizzo:</b></td><td>".$stab['indirizzo'] . onlyifvalue($stab['localita']).onlyifvalue($stab['comune']). " (".$stab['sigla_pro'].")</td></tr>";
		$div_generale .= "<tr><td>&nbsp;</td></tr>";
                //$div_generale .= "<tr><td><b>Attivita':</b></td><td><b>".$stab['attivita_label_l']."</b></td></tr>";
                //$div_generale .= "</table>";
                /*
		$div_generale .= "<p><b>Adempimento ex D.Lgs. 334/99 e s.m.i.:</b><br/>".$stab['adempimento_label_l'];
		if (!is_null($stab['data_adempimento'])) {$div_generale .= " - da ".$stab['data_adempimento'];}
                $div_generale .= "</p>";
                $div_generale .= "<p><b>Note:</b><br/>".$stab['note']."</p>";
                $div_generale .= "<p><b>Piano di Emergenza Esterno (PEE) ex art. 20 del D.Lgs. 334/99 e s.m.i.:</b></br>";
                //Gestisco il valore del PEE:
                if ($stab['cod_adempimento'] == 'A' || $stab['cod_adempimento'] == 'B') {
                        if (is_null($stab['pee'])) {$div_generale .= "non predisposto";}
                        else $div_generale .= "approvato ".$stab['pee'];
                }
                else {
                        if (is_null($stab['pee'])) {$div_generale .= "non previsto";}
                }
		$div_generale .= "</p><br />";
		*/
		$div_generale .= "</table>";
		$div_generale .= "</div>";

		/* CONTATTI */
		$tab_contatti .= "<p><b>Attivita':</b><b>".$stab['attivita_label_l']."</b></p>";
		if (!is_null($stab_new['cod_adempimento105'])) {
		    $tab_contatti .= "<p><b>Adempimento D.Lgs. 105/2015:</b><br/>".$stab_new['adempimento_label_l105'];
                    if (!is_null($stab_new['data_adempimento105'])) {$tab_contatti .= " - da ".$stab_new['data_adempimento105'];}
                    $tab_contatti .= "</p>";
		}
		else $tab_contatti .= "<p><b>Adempimento D.Lgs. 105/2015:</b><br/>n.d.</p>";
		$tab_contatti .= "<p><b>Adempimento D.Lgs. 334/99 e s.m.i.:</b><br/>".$stab['adempimento_label_l'];
                if (!is_null($stab['data_adempimento'])) {$tab_contatti .= " - da ".$stab['data_adempimento'];}
                $tab_contatti .= "</p>";
                $tab_contatti .= "<p><b>Note:</b><br/>".$stab['note']."</p>";
                $tab_contatti .= "<p><b>Piano di Emergenza Esterno (PEE) ex art. 20 del D.Lgs. 334/99 e s.m.i.:</b></br>";
		//Gestisco il valore del PEE:
                if ($stab['cod_adempimento'] == 'A' || $stab['cod_adempimento'] == 'B') {
                        if (is_null($stab['pee'])) {$tab_contatti .= "non predisposto";}
                        else $tab_contatti .= "approvato ".$stab['pee'];
                }
                else {
                        if (is_null($stab['pee'])) {$tab_contatti .= "non previsto";}
                }
                $tab_contatti .= "</p>";

		$tab_contatti .= "<p><img src='".$root_dir_html."/common/icons/toolbar_icons/tel.png' height=24><br/>". $stab['telefono'] . "</p>";
		$tab_contatti .= "<p><img src='".$root_dir_html."/common/icons/toolbar_icons/fax.png' height=24><br/>".$stab['fax']."</p>";
		$to_repl = array(";", ",");
		$tab_contatti .= "<p><img src='".$root_dir_html."/common/icons/toolbar_icons/mail.png' height=24><br/>". str_replace($to_repl, " </br>", $stab['mail']) . "</p>";
		$tab_contatti .= "</div>";

		
	/* CATEGORIE */

		//Creo un LINK al documento PDF:
		$tab_content .= "<p style='text-align:center;'><a href='".$root_dir_html."/common/docs/allegatoIparte2.pdf' title='scarica il pdf con il testo di legge' download>All.I D.Lgs.334/99 e s.m.i. - Parte 2 <b>'Categorie di sostanze e preparati'</b>:</a></p>";

		//Provo a costruire degli array in maniera dinamica:
		$tab_content .= get_tab_content($stab, $result_cat, 'Categorie');

		//Da qui costruisco il contenuto della tabella:
		$categorie_valorizzate = array();
		//arsort($categorie_qta); //scommentarlo se si vuole ordinare le categorie in base alla qta'
                foreach ($el_qta as $key => $value) {
                        if ($value > 0)  {
                                array_push($categorie_valorizzate, $key);
                        }
                }
		$categorie_filter = array_filter($categorie_valorizzate);
                if (empty($categorie_filter)) {
                        $tab_content .= "<p>Non sono presenti categorie</p>";
                }
		else {
                    $tab_content .= "<center><table id='categorie' border='0' cellspacing='5' cellpadding='5'>";
                    foreach ($categorie_valorizzate as $chiave) {
                      $bckgnd = 'white';
                      if ($el_qta[$chiave] >= $el_soglie_sup[$chiave]) $bckgnd = 'red';
                      else if ($el_qta[$chiave] >= $el_soglie_inf[$chiave]) $bckgnd = 'orange';
                        $tab_content .= "<tr style='background:".$bckgnd.";'><td><img src='".$root_dir_html.$el_icone[$chiave]."' height='56'></td>";
                        $tab_content .= "<td style='text-align:left;'><i>".$el_frasi[$chiave]."</i></td>";
                        $tab_content .= "<td style='text-align:center;'><b>".$el_qta[$chiave]." t</b></td>";
                        $tab_content .= "<td style='text-align:center;'><i>(".$el_soglie_inf[$chiave]."-".$el_soglie_sup[$chiave].")</i></td>";
                        $tab_content .= "</tr>";
                    }
                    $tab_content .= "</table>"; //chiudo la tabella
                }
                $tab_content .= "</center>";

		$tab_content .= "</div>";


        /* SOSTANZE */

		$tab_content2 .= "<p style='text-align:left;font-style:italic;font-size:12px;'>Data ultima notifica: ".$stab['data_notifica_sostanze']."</p>";
                //Creo un LINkal documento PDF:
                $tab_content2 .= "<p style='text-align:center;'><a href='".$root_dir_html."/common/docs/allegatoIparte1.pdf' title='scarica il pdf con il testo di legge' download>All.I D.Lgs.334/99 e s.m.i. - Parte 1 <b>'Sostanze specificate'</b>:</a></p>";
                $tab_content2 .= "<p><center>"; //apro il paragrafo per elencare le sostanze

		$tab_content2 .= get_tab_content($stab, $result_sost, 'Sostanze');

		//Da qui costruisco il contenuto della tabella:
		$sostanze_valorizzate = array();
		//arsort($sostanze_qta); //scommentarlo se si vuole ordinare le sostanze in base alla qta'
                //Prendo solo le sostanze che hanno dei valori > 0:
                foreach ($el_qta as $key => $value) {
                        if ($value > 0)  {
                                array_push($sostanze_valorizzate, $key);
                        }
                }
                //echo implode(" ", $categorie_valorizzate);
                $sostanze_filter = array_filter($sostanze_valorizzate);
                if (empty($sostanze_filter)) {
                        $tab_content2 .= "Non sono presenti sostanze";
                }
                else {
                  $tab_content2 .= "<table id='sostanze' border='1' cellspacing='5' cellpadding='5'>";
                  $tab_content2 .= "<tr><th>Sostanze</th><th>Quantita'</th><th>Soglia inf. e sup.</th></tr>";
                  foreach ($sostanze_valorizzate as $chiave) {
                    $bckgnd = 'white';
                    if ($el_qta[$chiave] >= $el_soglie_sup[$chiave]) $bckgnd = 'red';
                    else if ($el_qta[$chiave] >= $el_soglie_inf[$chiave]) $bckgnd = 'orange';
                        $tab_content2 .= "<tr style='background:".$bckgnd.";'>";
                        $tab_content2 .= "<td><i>".$el_frasi[$chiave]."</i></td>";
                        $tab_content2 .= "<td style='text-align:center;'><b>".$el_qta[$chiave]." t</b></td>";
                        $tab_content2 .= "<td style='text-align:center;'><i>".$el_soglie_inf[$chiave]." - ".$el_soglie_sup[$chiave]."</i></td>";
                        $tab_content2 .= "</tr>";
                  }
                  $tab_content2 .= "</table>";
                } //fine dell'else se si trova qualche sostanza

		$tab_content2 .= "</p>"; //chiudo il paragrafo che elenca le sostanze



		$tab_content_new .= "<center><button type='button' onclick='location.href=\"". $root_dir_html."/cgi-bin/mask_dataentry_rir.py?step=1&root_dir_html=".$root_dir_html."&origine=1&id_stab=" . $id_stabilimento . "\"'>Carica sostanze o categorie per questo stabilimento</button></center>";

        /* SOSTANZE NEW */

		$tab_content_new .= "<p style='text-align:left;font-style:italic;font-size:12px;'>Data ultima notifica: ".$stab_new['data_notifica_sostanze105']."</p>";
                //Creo un LINkal documento PDF:
                $tab_content_new .= "<p style='text-align:center;'><a href='".$root_dir_html."/common/docs/DLgs_26-6-2015n105-Allegato_1.pdf' title='scarica il pdf con il testo di legge' download>Allegato 1 D.Lgs.105/15 <b>'Sostanze pericolose specificate'</b>:</a></p>";
                $tab_content_new .= "<p><center>"; //apro il paragrafo per elencare le sostanze

                $tab_content_new .= get_tab_content($stab_new, $result_sost_new, 'Sostanze NEW');

                //Da qui costruisco il contenuto della tabella:
                $sostanze_valorizzate = array();
                //arsort($sostanze_qta); //scommentarlo se si vuole ordinare le sostanze in base alla qta'
                //Prendo solo le sostanze che hanno dei valori > 0:
                foreach ($el_qta as $key => $value) {
                        if ($value > 0)  {
                                array_push($sostanze_valorizzate, $key);
                        }
                }
                //echo implode(" ", $categorie_valorizzate);
                $sostanze_filter = array_filter($sostanze_valorizzate);
                if (empty($sostanze_filter)) {
                        $tab_content_new .= "Non sono presenti sostanze";
                }
                else {
                  $tab_content_new .= "<table id='sostanze' border='1' cellspacing='5' cellpadding='5'>";
                  $tab_content_new .= "<tr><th>Sostanze</th><th>Quantita'</th><th>Soglia inf. e sup.</th></tr>";
                  foreach ($sostanze_valorizzate as $chiave) {
                    $bckgnd = 'white';
                    if ($el_qta[$chiave] >= $el_soglie_sup[$chiave]) $bckgnd = 'red';
                    else if ($el_qta[$chiave] >= $el_soglie_inf[$chiave]) $bckgnd = 'orange';
                        $tab_content_new .= "<tr style='background:".$bckgnd.";'>";
                        $tab_content_new .= "<td><i>".$el_frasi[$chiave]."</i></td>";
                        $tab_content_new .= "<td style='text-align:center;'><b>".$el_qta[$chiave]." t</b></td>";
                        $tab_content_new .= "<td style='text-align:center;'><i>".$el_soglie_inf[$chiave]." - ".$el_soglie_sup[$chiave]."</i></td>";
                        $tab_content_new .= "</tr>";
                  }
                  $tab_content_new .= "</table>";
                } //fine dell'else se si trova qualche sostanza

                $tab_content_new .= "</p>"; //chiudo il paragrafo che elenca le sostanze

		$tab_content_new .= "</br><hr />";

        /* CATEGORIE NEW */

                //Creo un LINK al documento PDF:
                $tab_content_new .= "<p style='text-align:center;'><a href='".$root_dir_html."/common/docs/DLgs_26-6-2015n105-Allegato_1.pdf' title='scarica il pdf con il testo di legge' download>Allegato 1 D.Lgs.105/15 <b>'Categorie delle sostanze pericolose'</b>:</a></p>";

                //Provo a costruire degli array in maniera dinamica:
                $tab_content_new .= get_tab_content($stab_new, $result_cat_new, 'Categorie NEW');

                //Da qui costruisco il contenuto della tabella:
                $categorie_valorizzate_new = array();
                //arsort($categorie_qta); //scommentarlo se si vuole ordinare le categorie in base alla qta'
                foreach ($el_qta as $key => $value) {
                        if ($value > 0)  {
                                array_push($categorie_valorizzate_new, $key);
                        }
                }
                $categorie_filter_new = array_filter($categorie_valorizzate_new);
                if (empty($categorie_filter_new)) {
                        $tab_content_new .= "<p>Non sono presenti categorie</p>";
                }
                else {
                    $tab_content_new .= "<center><table id='categorie' border='0' cellspacing='5' cellpadding='5'>";
                    foreach ($categorie_valorizzate_new as $chiave) {
                      $bckgnd = 'white';
                      if ($el_qta[$chiave] >= $el_soglie_sup[$chiave]) $bckgnd = 'red';
                      else if ($el_qta[$chiave] >= $el_soglie_inf[$chiave]) $bckgnd = 'orange';
                        $tab_content_new .= "<tr style='background:".$bckgnd.";'><td><img src='".$root_dir_html.$el_icone[$chiave]."' height='56'></td>";
                        $tab_content_new .= "<td style='text-align:left;'><i>".$el_frasi[$chiave]."</i></td>";
                        $tab_content_new .= "<td style='text-align:center;'><b>".$el_qta[$chiave]." t</b></td>";
                        $tab_content_new .= "<td style='text-align:center;'><i>(".$el_soglie_inf[$chiave]."-".$el_soglie_sup[$chiave].")</i></td>";
                        $tab_content_new .= "</tr>";
                    }
                    $tab_content_new .= "</table>"; //chiudo la tabella
                }
                $tab_content_new .= "</center>";

                $tab_content_new .= "</div>";



        } // Query



	//A questo punto carico la eventuale documentazione presente per lo stabilimento:
	$result_doc = pg_query($conn,$query_doc);
	if (!$result_doc) {
		echo "Error on the query doc <br>";
	}
	else {
		$tab_content_doc .= "<br />";
		$numrows_doc = pg_numrows($result_doc);
		if ($numrows_doc == 0) $tab_content_doc .= "<p>Non e' presente documentazione per questo stabilimento</p>";
		else {
		  for ($j=0; $j < $numrows_doc ; $j++) {
			$DataArr = pg_fetch_row($result_doc, $j);
			$tab_content_doc .= "<p><a href='".$root_dir_html."/common/DATA/rir/$DataArr[3]' target='_blank'>$DataArr[2]</a></p>";
		  } // For
		}
		$tab_content_doc .= "<button type='button' onclick='location.href=\"upload_doc.php?root_dir_html=".$root_dir_html."&origine=1&id_stab=" . $id_stabilimento . "\"'>Carica un nuovo documento</button>";
	} //fine dell'else della query_doc

	$tab_content_doc .= "</div>";


} // Connection
pg_close($conn);

?>

<script>

//VOGLIO UN GRAFICO NORMALIZZATO???
var normal = 1; //0=valori reali; 1-valori normalizzati rispetto alla soglia_sup di ogni categoria

/* inizio a creare la parte per i grafici Highcharts */
var root_dir_html = "<?php echo $root_dir_html; ?>";
var categoria_icone = new Array();
kk=0;
for (var key in categoria_icone_arr) {
    //categoria_icone.push(categoria_icone_arr[key]);
    categoria_icone[kk]=categoria_icone_arr[key]
    kk++;
}

$(function () {
    
    //var categoria_frasi = ['m.tossiche', 'tossiche', 'esplosive', 'infiammabili', 'comburenti'];
    
    var getYValue = function(chartObj, seriesIndex, xCat, seriesId) {
	//Uso direttamente l'oggetto chartObj passato nella funzione:
	var chart = chartObj;
        var yValue = null;
    //console.log(xCat);
        //var xValue = categoria_frasi.indexOf(xCat);
    //console.log(chart.xAxis[0].tickPositions);
        //var points = chart.series[seriesIndex].points;
	//Invece che con l'indice recupero la serie tramite il suo ID:
        /*
	//Se uso il metodo "points":
	var points = chart.get(seriesId).points;
	for (var i = 0; i < points.length; i++) {
            if(points[i].x>xValue) break;
            else{
                if(points[i].x==xValue)
                {
                    yValue=points[i].y;
                    break;
                }
            }
            yValue = points[i].y;
        }*/
	//Se uso l'attributo yData:
	var points = chart.get(seriesId).yData;
	yValue = points[xCat];
        return yValue;
    };

    $('#tabs-4').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: "<a href='"+root_dir_html+"/common/docs/allegatoIparte2.pdf' title='scarica il pdf con il testo di legge' download>All.I D.Lgs.334/99 e s.m.i. - Parte 2 <b>'Categorie di sostanze e preparati'</b>:</a>"
        },
	credits: {
                text: 'Scarica allegato',
                href: root_dir_html+'/common/docs/allegatoIparte2.pdf'
        },
        xAxis: {
            categories: categoria_frasi,
            labels: {
                //x: 13,
                useHTML: true,
                formatter: function () {
                    //console.log(this.value);
		    return '<img class="" title="'+this.value+'" src="' + root_dir_html + categoria_icone[categoria_frasi.indexOf(this.value)] + '" height="35" width="35" />';
                }
             }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Tonnellate [t]'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
		}
		/*,formatter: function(){
                    //return Highcharts.numberFormat(this.y,0);
		    chart_stack = this.axis.chart;
		    return getYValue(chart_stack, 6, this.x, 'total');
                }*/
            }
        },
        legend: {
            align: 'right',
            x: -70,
            verticalAlign: 'top',
            y: 20,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.x + ': ' +
                //this.point.stackTotal + ' t</b><br/>' + //nella label appare il TOTALE
		getYValue(this.series.chart, 6, this.point.x, 'total') + ' t</b><br/>' + //recupero la label dall'array dei totali nel caso diplot con variabili normalizzate
                //this.series.name + ': ' + this.y + '<br/>' +
                'Soglia inf.: ' + getYValue(this.series.chart, 7, this.point.x, 'soglia_inf')                
                + '<br/>' +
                'Soglia sup.: ' + getYValue(this.series.chart, 8, this.point.x, 'soglia_sup')
                + '<br/>';
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal'
                /*,dataLabels: {
                    enabled: true
                    //,color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    //,style: {textShadow: '0 0 3px black, 0 0 3px black'}
                }*/
            }
        },
        series: [{
            name: 'art. 8', id: 'sovra',
            data: sovrassoglia_arr,
            color: 'red'
	    ,visible: true
            ,showInLegend: true
        }, {
            name: 'art. 6-7', id: 'mezza',
            data: mezzasoglia_arr,
            color: 'orange'
	    ,visible: true
            ,showInLegend: true
        }, {
            name: 'sottosoglia', id: 'sotto',
            data: sottosoglia_arr,
            color: 'yellow'
	    ,visible: true
            ,showInLegend: true
        },
	{
            name: 'art. 8', id: 'sovraN',
            data: sovrassoglia_arrN,
            color: 'red'
            ,visible: false
            ,showInLegend: false
        }, {
            name: 'art. 6-7', id: 'mezzaN',
            data: mezzasoglia_arrN,
            color: 'orange'
            ,visible: false
            ,showInLegend: false
        }, {
            name: 'sottosoglia', id: 'sottoN',
            data: sottosoglia_arrN,
            color: 'yellow'
            ,visible: false
            ,showInLegend: false
        },
	{
            name: 'total', id: 'total',
            data: total_arr,
            color: 'red'
            ,visible: false
	    ,showInLegend: false
        },
        {
            name: 'soglia_inf', id: 'soglia_inf',
            data: soglia_inf,
            color: 'orange',
            visible: false,
            showInLegend: false
        },
        {
            name: 'soglia_sup', id: 'soglia_sup',
            data: soglia_sup,
            color: 'red',
            visible: false,
            showInLegend: false
        }
        ]
    });

    //Alcune ozpioni per facilitare la costruzione del grafico nel caso di variabili normalizzate:
    var chart = $('#tabs-4').highcharts();
    if (normal==1) {
        chart.yAxis[0].update({
	    title: {text: 'Valori normalizzati rispetto alla soglia superiore'}
	    ,stackLabels: {
		formatter: function(){
                    chart_stack = this.axis.chart;
                    return getYValue(chart_stack, 6, this.x, 'total') + ' t';
                }
	    }
	    ,labels: {enabled: false}
            //max: Math.max(highest_cum, highest, 100)
        });
        var sottoN_serie = chart.get('sottoN');
        sottoN_serie.update({
            showInLegend: true
        }, false);
        sottoN_serie.show();
	var sotto_serie = chart.get('sotto');
        sotto_serie.update({
            showInLegend: false
        }, false);
        sotto_serie.hide();
	var mezzaN_serie = chart.get('mezzaN');
        mezzaN_serie.update({
            showInLegend: true
        }, false);
        mezzaN_serie.show();
        var mezza_serie = chart.get('mezza');
        mezza_serie.update({
            showInLegend: false
        }, false);
        mezza_serie.hide();
	var sovraN_serie = chart.get('sovraN');
        sovraN_serie.update({
            showInLegend: true
        }, false);
        sovraN_serie.show();
        var sovra_serie = chart.get('sovra');
        sovra_serie.update({
            showInLegend: false
        }, false);
        sovra_serie.hide();

	chart.redraw();
    }


});


</script>

</head>

<body>

<?php
print $div_generale;
?>

<div id="tabs">

<?php
print $tab_title;
print $tab_content2;
print "</br><hr />";
print $tab_content;
print $tab_content_new;
print $tab_content_doc;
print $tab_contatti;
print $tab_content_graph;
?>

</div>

</body>

</html>

