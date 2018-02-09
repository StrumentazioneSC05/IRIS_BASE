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
SCRIPT UTILIZZATO SULLA INTRANET ARPA PER MONITORARE LE STAZIONI SINGOLARMENTE CON I LORO PARAMETRI
*/

//Carico le configurazioni di base da un file esterno:
include_once('../config_iris.php');

//Recupero alcune info dall'URL del popup.js:
$active_tab;
if(isset($_GET['active_tab'])){
	$active_tab = $_GET['active_tab'];
}
if(isset($_GET['cod_staz'])){ //Nel caso si voglia richiamare la stazione tramite il codice stazione:
        $cod_staz = $_GET['cod_staz'];
        $conn = pg_connect($conn_string);
        if (!$conn) { // Check if valid connection
                echo "Error Connecting to database <br>";
                exit;
        }
        else {
                $query="SELECT codice_istat_comune, progr_punto_com, tipo_staz FROM dati_di_base.rete_meteoidrografica WHERE codice_stazione='$cod_staz';";
                $result = pg_query($conn,$query);
                $primariga = pg_fetch_row($result, 0);
                $codice_istat = $primariga[0];
                $progr_punto_com = $primariga[1];
		//Ora recupero e ciclo dentro il tipo_staz della stazione per recuperare i sensori installati:
		$tipo_staz = $primariga[2];
		$parametri_arr = array(); //questo array contiene i parametri da passare allo script successivo
		$titles_arr = array(); //questo array contiene i titoli da dare ai tab per il plttaggio dei parametri
		$strlen = strlen( $tipo_staz );
		for( $i = 0; $i <= $strlen; $i++ ) {
			$char = substr( $tipo_staz, $i, 1 );
		    switch ($char)
			{
			case 'T':
			  array_push($parametri_arr, 'TERMA');
			  array_push($titles_arr, 'Temperatura');
			  break;
			case 'H':
			  array_push($parametri_arr, 'IGRO');
                          array_push($titles_arr, 'Umidita');
			  break;
			case 'P':
			  array_push($parametri_arr, 'PLUV');
                          array_push($titles_arr, 'Pioggia');
			  break;
			case 'I':
                          array_push($parametri_arr, 'IDRO');
                          array_push($titles_arr, 'Idrometro');
                          break;
			case 'N':
                          array_push($parametri_arr, 'NIVO');
                          array_push($titles_arr, 'Neve');
                          break;
			case 'V':
                          array_push($parametri_arr, 'VELV', 'DIRV');
                          array_push($titles_arr, 'Vel.Vento', 'Dir.Vento');
                          break;
			case 'R':
                          array_push($parametri_arr, 'RADD');
                          array_push($titles_arr, 'Radiazione');
                          break;
			case 'B':
                          array_push($parametri_arr, 'BARO');
                          array_push($titles_arr, 'Pressione');
                          break;
			case 'G':
                          array_push($parametri_arr, 'GAMMA1');
                          array_push($titles_arr, 'RadGamma');
                          break;
			default:
			  //code to be executed if n is different from all labels;
		    }
		}
		//Adesso se e' stato scelto un TAB da attivare lo cerco e lo pongo per primo nell'array:
		if ($active_tab) {
			$active_ix = array_search($active_tab, $parametri_arr);
			array_unshift($parametri_arr, $active_tab);
			array_unshift($titles_arr, $titles_arr[$active_ix]);
			unset($parametri_arr[$active_ix+1]);
			unset($titles_arr[$active_ix+1]);
		}
		$parametri = implode(',',$parametri_arr);
		$titles = implode(',',$titles_arr);
		$link = "&links=/radar/common/scripts/plot_rete.php";

		header("Location: /radar/common/scripts/jquery_tab.php?titles=" . $titles . $link . "&parametri=" . $parametri . "&codice_istat=" . $codice_istat . "&progr_punto=" . $progr_punto_com . "&tipo_tab=1&root_dir_html=" . $root_dir_html);

        }
}
else {
	print "Specificare il parametro 'cod_staz' nell'url con il Codice Stazione della quale si vogliono recuperare i grafici sull'andamento dei parametri misurati dai sensori.";
	exit;
}

?>
