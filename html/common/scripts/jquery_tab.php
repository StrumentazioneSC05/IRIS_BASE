<?php
/*
Questo script genera una finestra composta da delle schede TAB di JQuery.
Per far questo prende tramite URL:
-i titles dei TAB
-l'url per il contenuto dei TAB (solitamente delle immagini)

Esempio di stringa da chiamare:
http://remotesensing.arpa.piemonte.it/common/scripts/jquery_tab.php?titles=Temperatura,Pioggia,Vento&links=webgis.arpa.piemonte.it/grafici/TERMAIGRO/TERMA122.png,webgis.arpa.piemonte.it/grafici/PLUV/PLUV122.png,webgis.arpa.piemonte.it/grafici/VELVDIRV/VELV122.png

Esempio aggiornato col composito attivo:
http://www.arpa.piemonte.gov.it/radar/common/scripts/jquery_tab.php?titles=Idrometro,Portata&links=/radar/common/scripts/plot_rete.php&parametri=IDRO,PORTATA&codice_istat=001236&progr_punto=700&tipo_tab=1&active_tab=TERMA&root_dir_html=/radar&custom_height=420&composito=2&stazioni=meteoidro
*/

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

//Creo una "diversione" dello script nel caso in cui le variabili da passare per comporre
//i vari TAB siano piu' complesse, ad esempio per la creazione dei nuovi plot con Highcharts:
$tipo_tab = 0;
$active_tab=0; //variabile per specificare il numero del TAB da attivare da subito - DA SVILUPPARE!!!
if(isset($_GET['tipo_tab'])){
        $tipo_tab = $_GET['tipo_tab'];
}
if($tipo_tab == 1) {
	//Plot per i dati alle stazioni meteo:
	$codice_istat = $_GET['codice_istat'];
	$progr_punto = $_GET['progr_punto'];
	$parametri = $_GET['parametri'];
	$parametri_array = explode(",", $parametri);
	if(isset($_GET['active_tab'])){
        	$active_tab_str = $_GET['active_tab'];
	}
}
if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
else {
  print "need root_dir_html";
  die();
}
//per capire con quali tab comporre la nuova finestra:
if (isset($_GET['composito'])) $composito = explode(",", $_GET['composito']);
else $composito = array(2,3); //questo else non funziona nei casi in cui 'composito' e' undefined
//per reindirizzare i contenuti alle query/scripts corretti:
if (isset($_GET['stazioni'])) $sorgente = $_GET['stazioni'];
else $sorgente = 'meteoidro'; //questo else non funziona nei casi in cui 'stazioni' e' undefined
$links = htmlspecialchars($_GET["links"]);
$links_array = explode(",", $links);
$n_links = sizeof($links_array);
$titles = htmlspecialchars($_GET["titles"]);
$titles_array = explode(",", $titles);
$n_titles = sizeof($titles_array);
$tab_title = "<ul>";
$tab_content = "";
$div_generale = "";
$disable_tab = array();
$i = 0;
//In certi casi e' venuta fuori l'esigenza di modificare l'altezza del grafico:
if (isset($_GET['custom_height'])) $custom_height = $_GET['custom_height'];
else $custom_height = 450;


//Generazione TAB con url complesse - ad esempio grafici:
if($tipo_tab == 1) {


/******* TAB GENERALE ********/
if (in_array(1, $composito)) {

  //intestazione tabella comune:
  $div_generale = "<div id='generale'>";
  $div_generale .= "<table id='anagrafica'>";

  $conn = pg_connect($conn_string);
  if (!$conn) { // Check if valid connection
	echo "Error Connecting to database <br>";
	exit;
  }
  else {
    //Volendo posso discriminare la query in base alla variabile "sorgente"
    $query = "SELECT codice_istat_comune, progr_punto_com, denominazione, indirizzo, quota_stazione FROM dati_di_base.rete_meteoidrografica WHERE codice_istat_comune='$codice_istat' AND progr_punto_com=$progr_punto;";
    $result = pg_query($conn, $query);
    if (!$result) {
	echo "Error on the query <br> " . $query;
    }
    else {
	/*while($row = pg_fetch_array($result)) {
	  $ccccc = $row['name'];
	}*/
	$row = pg_fetch_array($result, 0);
	
	$div_generale .= "<tr><td><b>Stazione:</b></td><td><b>" . $row['denominazione'] . " (" . $row['codice_istat_comune'] .$row['progr_punto_com'] . ")</b></td></tr>";
	$div_generale .= "<tr><td><b>Indirizzo:</b></td><td>" . $row['indirizzo'] . "</td></tr>";
	$div_generale .= "<tr><td><b>Quota:</b></td><td>" . $row['quota_stazione'] . "</td></tr>";
    }
    pg_close($conn);
  }

  //chiusura tabella comune:
  $div_generale .= "<tr><td>&nbsp;</td></tr>";
  $div_generale .= "</table>";
  $div_generale .= "</div>";

}


/******* TAB GRAFICI ********/
if (in_array(2, $composito)) {
  foreach ($parametri_array as $parametro) {
	//$tab_content .= "<div id='tabs-" . $i . "'><iframe width='100%' height=450px src='" . $links . "?codice_istat=" . $codice_istat . "&progr_punto_com=" . $progr_punto . "&id_parametro=" . $parametro . "' frameborder='0' allowtransparency='true' seamless='seamless'></iframe>";
	//Cerco di evitare di caricare tutti i grafici contemporaneamente. Carico il primo e poi gli altri quando vengono cliccati i TAB:
	if($i==0) $tab_content .= "<div id='tabs-" . $i . "'><iframe id='myIFrame". $i . "' width='100%' height=".$custom_height." src='" . $links . "?codice_istat=" . $codice_istat . "&progr_punto_com=" . $progr_punto . "&id_parametro=" . $parametro . "&root_dir_html=" . $root_dir_html ."' frameborder='0' allowtransparency='true' seamless='seamless'></iframe>";
	else $tab_content .= "<div id='tabs-" . $i . "'><iframe id='myIFrame". $i . "' width='100%' height=".$custom_height." src='' frameborder='0' allowtransparency='true' seamless='seamless'></iframe>";
        $tab_content .= "</div>"; //lo chiudo dopo aver aggiunto il tab con i grafici compositi
	$tab_title .= "<li><a href='#tabs-" . $i . "'>" . $titles_array[$i] . "</a></li>";
	//Se la variabile active_tab_str e' definita la cerco tra i parametri e ne recupero l'indice per attivare dfa subito il TAB relativo:
	if($active_tab_str and $active_tab_str==$parametro) {
	    $active_tab=$i;
	}
	//Per disabilitare un tab senza dati ad esempio:
	if ( strpos($parametro, '$')!==false ) {
		$disable_tab[]=$i;
	}
	$i++;
  } //fine di ciclare dentro i parametri
}


/******* TAB METEOGRAMMA ********/
if (in_array(3, $composito)) {
//Provo ad aggiungere un tab finale con i grafici compositi:
  $link_comp = $root_dir_html.'/common/scripts/multigraphs_highcharts.html';
  $tab_name_comp = 'Meteogramma_1h';
  //if ( strpos($links, 'lombardia') == TRUE) $sorgente='lombardia';
  //else $sorgente='';
  //if ( strpos($parametri, 'MAX_IDRO')==FALSE )  //escludo le query su idrometri nel far vedere questi meteogrammi
//esclusione con IF inutile dal momento che controllo questa finestra da DB, tab 'config.webgis_popups', campo 'grafici_composito'
    $tab_content .= "<div id='tabs-" . $i . "'><iframe id='myIFrame". $i . "' width='100%' height=".$custom_height." src='" . $link_comp . "?codice_istat=" . $codice_istat . "&progr_punto=" . $progr_punto . "&parametri=" . implode(",", $parametri_array) . "&root_dir_html=" . $root_dir_html ."&sorgente=". $sorgente ."' frameborder='0' allowtransparency='true' seamless='seamless'></iframe>";
    $tab_content .= "</div>";
    $tab_title .= "<li><a href='#tabs-" . $i . "'>" . $tab_name_comp . "</a></li>";
    $i++;
}


/******* TAB URL LIBERO ********/
if (in_array(4, $composito)) {
  //DA SVILUPPARE!!!!
  
  //Carico le funzioni dell'URL libero (composito=4) da un file esterno:
  include('grafici_composito_url.php');

  $i++;
}

}

else {
//Generazione TAB con url semplici - immagini:
foreach ($links_array as $link) {
	$estensione_link = substr($link, -3);
	if ( strtoupper($estensione_link) =='PDF' ) {
	  //$tab_content .= "<div id='tabs-" . $i . "'><embed src='" . $link . "#page=1&zoom=100' type='application/pdf' width='100%' height='800'></div>";
	  //provo a fittare completamente il pdf nella pagina usando un iframe - peggio:
	  //$tab_content .= "<div id='tabs-" . $i . "'><iframe src='" . $link . "' type='application/pdf' width='' height='' border='0'></iframe></div>";
	  //Uso un altro metodo che dovrebbe mostrare un messaggio in caso di assenza dell'oggetto ma non mostra il messaggio:
	  $tab_content .= "<div id='tabs-" . $i . "'><object width='100%' height='900' type='application/pdf' data='" . $link . "#page=1&zoom=70' id='pdf_content'><p>Oggetto non disponibile</p></object></div>";
	}
	else $tab_content .= "<div id='tabs-" . $i . "'><img src='" . $link . "' /></div>";
	if ($n_links != $n_titles) {
		$slash_position = strrpos($link, '/');
		$tab_title .= "<li><a href='#tabs-" . $i . "'>" . substr($link, $slash_position+1) . "</a></li>";
	}
	else $tab_title .= "<li><a href='#tabs-" . $i . "'>" . $titles_array[$i] . "</a></li>";
	$i++;
} //fine di ciclare dentro i vari links
}

$tab_title .= "</ul>";

//print gettype($links_array);

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>

<head>
<title>Dati stazione</title>

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js1st = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
$script_js1st .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
echo $script_js1st;
?>

<script>

var active_tab = <?php echo $active_tab; ?>;

$(function() {
	$("#tabs").tabs(
	{select: function(event, ui){
            var tabNumber = ui.index;
            var tabName = $(ui.tab).text();

            console.log('Tab number ' + tabNumber + ' - ' + tabName + ' - clicked');
        }
	});
});

//Adesso facciamo in modo che quando un determinato TAB viene selezionato si carica il plot relativo:
var activated_tab_index = new Array();//provo a tenere traccia dei TAB gia' caricati per non ricaricarli
if (active_tab==null || active_tab=='') activated_tab_index.push(active_tab); //se non specifico il tab da attivare, salva il tab di default nei tab gia caricati
$(document).ready(function() {
    // Tab initialization
    $('#tabs').tabs({
        activate: function(event, ui){
            var tabNumber = ui.newTab.index();
            var tabName = $(ui.newTab).text();
	    if (jQuery.inArray( tabNumber, activated_tab_index )==-1) { //se il tab e' gia' stato caricato non lo ricarico
            //console.log('Tab number ' + tabNumber + ' - ' + tabName + ' - clicked');
		var id_parametro_js = <?php echo json_encode($parametri_array); ?>;
		//Considero l'eventuale aggiunta del tab composito con grafici multipli:
		if (tabName=='<?php echo $tab_name_comp; ?>') var new_src = "<?php echo $link_comp; ?>?codice_istat=<?php echo $codice_istat; ?>&progr_punto=<?php echo $progr_punto;?>&parametri=" + id_parametro_js + "&root_dir_html=<?php echo $root_dir_html; ?>&sorgente=<?php echo $sorgente; ?>";
		else var new_src = "<?php echo $links; ?>?codice_istat=<?php echo $codice_istat; ?>&progr_punto_com=<?php echo $progr_punto;?>&id_parametro=" + id_parametro_js[tabNumber] + "&root_dir_html=<?php echo $root_dir_html; ?>";
		$('#myIFrame'+tabNumber).attr('src', new_src);
		activated_tab_index.push(tabNumber);
	    }
        }
    });

//Per attivare uno specifico TAB o dal numero o dal suo ID. Di default e' ZERO:
//$('#tabs').tabs("option", "active", '#tabs-1'); //tramite ID
$('#tabs').tabs("option", "active", active_tab); //tramite numero
$('#tabs').tabs({ disabled: [ <?php echo implode(",", $disable_tab); ?> ] } );

});


</script>

<style type="text/css">
/*Volevo cercare di risolvere il problema dei TAB su Mozilla ma non riesco a capire...*/
/*
p, table {font-size: 0.75em;}
#tab_generale {font-size: 0.85em;}
body {font-family: Verdana,Arial,sans-serif;}
#generale {height:21%;}
#tabs {width:100%;height:80%;}
.ui-widget-content {border:none;}
*/
/*#tabs-1, #tabs-2 {overflow-y:scroll; height:98%;}*/
/*Aggiungo una modifica per Mozilla perche' non fa vedere la scroll bar in quanto vuole i "px" e non le "%":*/
/*Fonte: http://perishablepress.com/css-hacks-for-different-versions-of-firefox/ */
@-moz-document url-prefix() { #tabs-1, #tabs-2 {overflow-y:scroll; height:500px;} }
</style>

</head>

<body>

<div class='tabs' id="tabs">

<?php
print $div_generale;
print $tab_title;
print $tab_content;
?>

</div>

</body>

</html>

