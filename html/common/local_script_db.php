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
In questo script cerco di sostituire i file JS personalizzati di ogni servizio webgis con una chiamata su DB

DA OTTIMIZZARE:
- creare una legenda gif fittizia vuota da caricare in modo tale da creare la componente "imgPreview" nel tool "GeoExt.LegendPanel". Introdurre inoltre la scelta di quale legenda RASTER visualizzare di default nel file "cgi-bin/add_layer_from_db.py"
*/

//if array_column does not exist the below solution will work.
if(!function_exists("array_column")) {
    function array_column($array,$column_name) {
        return array_map(function($element) use($column_name){return $element[$column_name];}, $array);
    }
}

//Recupero da DB le impostazioni personalizzate del servizio:
$conn_local = pg_connect($conn_string);
if (!$conn_local) { // Check if valid connection
	$error_message = "Error Connecting to database";
	pg_close($conn_local);
	die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
}
else {
    //Faccio una prima query per recuperare l'indice del webgis:
    $query_indice = "SELECT webgis_idx, zoom_center, lon_center, lat_center, query_map_idx, tools_variable, baselayers, attivo, collapsed_grid, store_grid, columns_grid, title_grid, (SELECT max(severita) FROM realtime.v_anomalie WHERE severita<10 AND data_fine IS NULL) AS anomalie_severita FROM config.v_webgis_general_config WHERE webgis_name = '$webgis_type';";
    $result_indice = pg_query($conn_local, $query_indice);
    if (!$result_indice) {
	$error_message = "Error on the query indice";
	pg_close($conn_local);
	die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
	//echo "<script>console.log('". $error_message ."')</script>";
        //exit;
    }
    else {
	//Recupero alcune impostazioni di base del servizio:
        $fetch_webgis = pg_fetch_array($result_indice, 0); //prendo il primo record

	$attivo = $fetch_webgis['attivo'];
	// verifica servzio attivo
	if ($attivo == 0 && $devel == 0) {
	  $error_message = "Servizio non attivo";
	  pg_close($conn_local);
          die("<script>location.href = '" . $root_dir_html . "/nonattivo.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
	}

        $indice_webgis = $fetch_webgis['webgis_idx'];
	$zoom_center = $fetch_webgis['zoom_center'];
	$lon_center = $fetch_webgis['lon_center'];
	$lat_center = $fetch_webgis['lat_center'];
	//Per la sezione zoom riabilito una eventuale definizione da URL:
	if (isset($_GET["zoom"]) && isset($_GET["lat"]) && isset($_GET["lon"])) {
	    $zoom_center = $_GET["zoom"];
	    $lon_center = $_GET["lon"];
            $lat_center = $_GET["lat"];
	}

	$query_map_idx = $fetch_webgis['query_map_idx'];
	$collapsed_grid = (string)$fetch_webgis['collapsed_grid']=='t' ? 'true':'false';
	$store_grid = $fetch_webgis['store_grid'];
	$columns_grid = $fetch_webgis['columns_grid'];
	$title_grid = $fetch_webgis['title_grid'];
	$anomalie_operative = $fetch_webgis['anomalie_severita'];
	$icona_info = 'info_normale.png';
	if ($anomalie_operative==1) $icona_info = 'info_basso.png';
	else if ($anomalie_operative==2) $icona_info = 'info_medio.png';
        else if ($anomalie_operative==3) $icona_info = 'info_alto.png';
	$icona_def = "<script>";
        $icona_def .= "icona_info = '" . $icona_info . "';";
	$icona_def .= "</script>";
        echo $icona_def;


/* ************ BASELAYERS ************* */
	//BASELAYERS: devo fare un altra query su DB:
	$query_baselayers = "SELECT baselayer_idx, openlayer_name FROM config.webgis_base_layers ORDER BY baselayer_idx;";
	$result_baselayers = pg_query($conn_local, $query_baselayers);
	$baselayer_ix = array();
	while($row_base = pg_fetch_array($result_baselayers)) {
	  //Per far riconoscere poi al replace la stringa completa e non una parte sono costretto ad inserire questo /\b
	  $baselayer_ix['/\b'.$row_base['baselayer_idx'].'\b/u'] = $row_base['openlayer_name'];
	}
	$baselayers = substr($fetch_webgis['baselayers'], 1, -1);
	//print "<script>console.log('" . $baselayers . "');</script>";
	$baselayer_to_load = preg_replace(array_keys($baselayer_ix), array_values($baselayer_ix), $baselayers);
    }
    if (!isset($indice_webgis)) {
        $error_message = "Tipologia webgis non riconosciuta - Operazione non permessa";
	pg_close($conn_local);
        die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
    }
    else {
	//Importo le variabili da PHP a JS. Eventualmente il livello di zoom puo essere sovrascritto dai COOKIE:
	$zoom_def = "<script>";
	$zoom_def .= "zoom_center = " . $zoom_center . ";";
	$zoom_def .= "lon_center = " . $lon_center . ";";
	$zoom_def .= "lat_center = " . $lat_center . ";";
	$zoom_def .= "indice_webgis = " . $indice_webgis . ";";
	$zoom_def .= "baselayer_to_load = [" . $baselayer_to_load . "];";
	$zoom_def .= "collapsed_grid = " . $collapsed_grid . ";";
	$zoom_def .= "</script>";
	echo $zoom_def;

	//Creo la variabile JS per il clic su mappa:
	$query_raster = "<script> query_raster = '" . $query_map_idx . "'; </script>";
	echo $query_raster;

/* ************ TOOLS ************* */
	//Mi carico i tools selezionati per il webgis, se ci sono vuol dire che non sono nascosti.
	//Prima definisco di default lo stato hidden=true alle varie variabili dei tools:
	$tools_def = "<script>";
	//Di base spengo/nascondo tutti i tools:
	$tools_def .= <<<EOT
	var search_OSM_hidden = true;
	var combo_hidden = true;
	var dialog_hidden = true;
	var anime_hidden = true;
	var dialog0_hidden = true;
	var dialog_upload_hidden = true;
	var list_alert_hidden = true;
	var flanis_anime_hidden = true;
	var expo_bullettin_hidden = true;
	var expo_meteo_hidden = true;
	var cookies_diy_hidden = true;
	var news_btn_hidden = true;
	var zoomSelector_hidden = true;
	var tickets_hidden = true;
	var split_link_hidden = true;
	var multiselect_hidden = true;
	var combo_layers_hidden = true;
	var report_evento_hidden = true;
	var help_layer_hidden = true;
EOT;
	$tools_def .= "</script>";
	echo $tools_def;
	$fetch_all_tools = pg_fetch_all($result_indice);
	foreach ($fetch_all_tools as $fetch_tools) {
	//Se il tools compare nel webgis, allora lo accendo/mostro:
	    if ($fetch_tools['tools_variable']) {
	      echo "<script> " . $fetch_tools['tools_variable'] . " = false; </script>";
	    }
	}

/* ************ GRID ************* */
	//Carico le grid di default:
	$grid_def = "<script>";
        $grid_def .= <<<EOT
	    title_grid = title_grid_default;
            store_grid = store_default;
            columns_grid = columns_default;
EOT;
	if (!empty($store_grid)) {
	    $grid_def .= <<<EOT
            title_grid = "$title_grid";
            store_grid = $store_grid;
            columns_grid = $columns_grid;
EOT;
	}
	$grid_def .= "</script>";
	echo $grid_def;

/* ************ LAYERS ************* */
        //Adesso a seconda del tipo di webgis mi carico le impostazioni personalizzate per i LAYERS:
	$query_local = "SELECT layer_idx, openlayer_name, select_highlight, legend_name, visible, pedice, default_legend_variable, group_order, legend_group_name, expanded, is_father, children_array, father_group_name, father_expanded, father_pedice, store_definition, column_definition, grid_title, geom_type FROM config.v_webgis_custom_settings WHERE webgis_idx = $indice_webgis ORDER BY order_in_webgis DESC;";
	//L'ORDINE e' IMPORTANTE perche' decide quale layer sta sopra e quale sotto!!!
	$result_local = pg_query($conn_local,$query_local);
	if (!$result_local) {
	    //echo "console.log('Error on the query news <br>".$query_news."')";
            //exit;
        }
        else {
        //Attenzione che entra nell'else anche se il risultato della query e' vuoto!!
	    $treeConfig = '[';
	    $layers_load = array();
	    $layers_select = array();
	    $layers_highlight = array();
	    $layers_multiselect = array();
	    $layers_data_store = array();
	    array_push( $layers_data_store, array('none', '--- nessuna selezione ---', 'none') );
	    $layer_visibility_on = '';
	    $unique_folder_list = array(); //lista univoca dei pedici delle cartelle
	    $folder_order = array(); //lista univoca dei pedici delle cartelle con associato l'ordine
	    $activeNode_function = <<<EOT
		function activeNode(active_node) { //inizializzo la funzione, togliendola di fatto da geoext_general_produzione e gestendola cosi da DB
		  if (active_node.text == default_layer_name) console.log("grid non definito per questo layer");
EOT;
	    $activeNode_raster = <<<EOT
		if (!jQuery.isEmptyObject(legend.getComponent('imgPreview'))) { //in alcuni casi il componente infatti non esiste!
		  if (active_node.text == default_layer_name) console.log("legenda non definita per questo raster");
EOT;
	    //Prendo tutti i risultati della query:
	    $fetch_all_local = pg_fetch_all($result_local);

	    //Recupero prima i layers:
	    foreach ($fetch_all_local as $fetch_local) {
                $layers_load[] = $fetch_local['openlayer_name'];
                //Prelevo layer selezionabili:
                if ($fetch_local['select_highlight'] >= 1) {
                    $layers_select[] = $fetch_local['openlayer_name'];
                }
                //Prelevo layer con highlight:
                if ($fetch_local['select_highlight'] >= 2) {
                    $layers_highlight[] = $fetch_local['openlayer_name'];
                }
		//Prelevo layer multiselezionabili:
                if ($fetch_local['select_highlight'] == 3) {
                    $layers_multiselect[] = $fetch_local['openlayer_name'];
                }

		//Cambio il nome del layer in base a quanto definito da DB:
		$db_layer_name = $fetch_local['legend_name'] . "<!--" . $fetch_local['pedice'] . "-->";
		echo "<script> " . $fetch_local['openlayer_name'] . ".setName('" . $db_layer_name . "'); </script>";
		//Per non sballare le funzioni che si basano sui nomi, come activeNode da geoext_general e Tooltips da toolbar_tools, ridefinisco il valore delle variabili dei nomi:
		echo "<script> var " .  $fetch_local['default_legend_variable'] . " = '" . $db_layer_name . "'; </script>";

		//Recupero i layer da accendere subito:
		if ($fetch_local['visible'] == 1) {
		    $layer_visibility_on .= $fetch_local['openlayer_name'] . ".setVisibility(true);";
		}

		//Costruisco l'array univoco delle cartelle:
		if( ! in_array($fetch_local['pedice'], $unique_folder_list ) ) {
		//La cartella manca allora la aggiungo alla lista e creo il treeConfig:
		    $unique_folder_list[] = $fetch_local['pedice'];
		    //Provo a dare un ordine a queste cartelle:
		    $folder_order[] = array( 'pedice' => $fetch_local['pedice'], 'ordine' => $fetch_local['group_order'], 'legend_group_name' => $fetch_local['legend_group_name'], 'expanded' => $fetch_local['expanded'], 'is_father' => $fetch_local['is_father'], 'children_array' => json_decode($fetch_local['children_array']), 'father_group_name' => $fetch_local['father_group_name'], 'father_expanded' => $fetch_local['father_expanded'], 'father_pedice' => $fetch_local['father_pedice'] );
		}

		/* ******* ACTIVE NODE FUNCTION ******* */
		//Compilo la funzione activeNode in base al nodo dei layer selezionato mi dice cosa fare:
		$active_node_text = $fetch_local['default_legend_variable'];
		$store_definition = $fetch_local['store_definition'];
		$grid_title = $fetch_local['grid_title'];
		$column_definition = $fetch_local['column_definition'];
		$legend_name_lay = $fetch_local['legend_name'];
		if (!$store_definition and !$grid_title and !$column_definition) {
		  //in questo caso il layer non ha associato alcuna griglia attributi!
		  $activeNode_function .= <<<EOT
		  else if (active_node.text == $active_node_text) {
		console.log("Layer '$legend_name_lay-$active_node_text' senza griglia degli attributi definita. Se si vuole attivare questa griglia, definire le variabili ColumnStore e StoreGrid per la variabile layer relativa, e caricare questi dati anche sul DB alla tabella webgis_ol_layers");
		    title_grid = 'Griglia degli attributi non definita per il layer "$legend_name_lay"';
		    store_grid = store_default;
		    columns_grid = columns_default;
		  }
EOT;
		}
		else if ($fetch_local['store_definition'] and $fetch_local['column_definition'] and $fetch_local['grid_title']) {
		  //se queste variabili sono definite sul DB allora e' possibile che questo layer abbia attiva la tabella attributi:

		  //Creo uno Store per la combobox dei layer su Ext:
		  $data_arr = array($fetch_local['openlayer_name'], $fetch_local['legend_name'], $fetch_local['store_definition']);
		  array_push($layers_data_store, $data_arr);

		  //inizio a definire la funzione sui nodi attivi:
		  $activeNode_function .= <<<EOT
			else if (active_node.text == $active_node_text) {
                  title_grid = "$grid_title";
                  store_grid = $store_definition;
                  columns_grid = $column_definition;
        		}
EOT;
		  //Definisco poi i casi particolari per modificare l'aspetto del grid:
		  if ($active_node_text == 'sismi00' or $active_node_text == 'sismi00b') {
		  $activeNode_function .= <<<EOT
			if (active_node.text == "$db_layer_name") {
			  gridPanel.getView().getRowClass = function(record, rowIndex, rowParams, store){
                	    var rowClass = '';
                    	    if (record.get('magnitudo') > 2.5){
                	        rowClass = 'red_grid_row';
        	            }
	                    return rowClass;
                	  }
			}
EOT;
		  } //fine caso particolare per aspetto grid
		  if ($active_node_text == 'rete20') {
                  $activeNode_function .= <<<EOT
                        if (active_node.text == "$db_layer_name") {
                          gridPanel.getView().getRowClass = function(record, rowIndex, rowParams, store){
                            var rowClass = '';
			    if (record.get('stato') == 1){
                	        rowClass = 'orange_grid_row';
        	            }
	                    else if (record.get('stato') == 2){
                        	rowClass = 'red_grid_row';
                	    }
        	            else if (record.get('stato') == -1){
	                        rowClass = 'gray_grid_row';
                    	    }
                            return rowClass;
                          }
                        }
EOT;
                  }
		  if ($active_node_text == 'temporali00' || $active_node_text == 'temporali00b' || $active_node_text == 'temporali07') {
                  $activeNode_function .= <<<EOT
                        if (active_node.text == "$db_layer_name") {
                          gridPanel.getView().getRowClass = function(record, rowIndex, rowParams, store){
                            var rowClass = '';
                            if (record.get('valore') > 2){
                                rowClass = 'red_grid_row';
                            }
                            return rowClass;
                          }
                        }
EOT;
                  }

		} //fine activeNode function

		//Ora passo alla legenda per i raster:
		if ($fetch_local['geom_type'] == 'RASTER' and $fetch_local['grid_title']) {
                        $activeNode_raster .= <<<EOT
                                else if (active_node.text == $active_node_text) {
                                  legend.getComponent('imgPreview').setUrl(root_dir_html+'$grid_title');
                                }
EOT;
                }
                /* ******* FINE ACTIVE NODE FUNCTION ******* */

	    }

	    $activeNode_raster .= "} //fine controllo se esiste il componente imgPreview in legenda";
	    $activeNode_function .= $activeNode_raster;
	    $activeNode_function .= <<<EOT
	  	  //Ora bisogna trovare un modo di ricaricare il grid con le nuove info:
	          gridPanel.reconfigure(store_grid, columns_grid);
        	  gridPanel.setTitle(title_grid);
		}
EOT;
	    echo "<script>" . $activeNode_function . "</script>";

	    //Ordino l'array dei gruppi:
	    function sortByOrder($a, $b) {
		return $a['ordine'] - $b['ordine'];
	    }
	    usort($folder_order, 'sortByOrder');
	    //Sfrutto questa variabile per creare la variabile groups_labels in maniera dinamica:
            $groups_labels_str = "var groups_labels = new Array();";
	    $father_folder_list = array(); //lista univoca dei pedici delle cartelle padre
	    //Costruisco l'albero delle cartelle seguendone l'ordine da DB:
	    foreach($folder_order as $key => $value_arr) {
		//Sfrutto questa variabile per creare la variabile groups_labels in maniera dinamica:
		$groups_labels_str .= "groups_labels['<!--". $value_arr['pedice'] ."-->'] = '" . $value_arr['legend_group_name'] . "';";

//echo "<script> console.log('" . $value_arr['ordine'] . " => " . $value_arr['pedice'] . " => " . $value_arr['legend_group_name'] . "'); </script>";
		if ($value_arr['is_father'] == 0) {
//echo "<script> console.log('" . $value_arr['legend_group_name'] . " - NO FATHER'); </script>";
		  $treeConfig .= ' {nodeType: "gx_layercontainer", text: "' . $value_arr['legend_group_name'] . '", expanded: ' . $value_arr['expanded'] . ', isLeaf: false, leaf: false,';
                  $treeConfig .= 'loader: { baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"}, filter: function(record) {';
                  $treeConfig .= 'return record.get("layer").name.indexOf("' . $value_arr['pedice'] . '") !== -1}';
                  $treeConfig .= '}},';
		}

		else if ($value_arr['is_father'] == -1) {
		    if( ! in_array($value_arr['father_pedice'], $father_folder_list ) ) {
		    //La cartella padre non e' ancora stata processata: la aggiungo alla lista e creo il menu:
		    $father_folder_list[] = $value_arr['father_pedice'];
//echo "<script> console.log('" . $value_arr['legend_group_name'] . " - father_name=". $value_arr['father_group_name'] ."'); </script>";
		//Costruisco i treeConfig per un gruppo padre:
		  $treeConfig .= ' {nodeType: "async", text: "' . $value_arr['father_group_name'] . '", expanded: ' . $value_arr['father_expanded'] . ', children:[';
		  for ($x = 0; $x < sizeof($value_arr['children_array']); $x++) {
		  //Recupero i sottogruppi aggiungendoli solo se hanno dei layer nel webgis:
		    if ( in_array($value_arr['children_array'][$x], $unique_folder_list ) ) {
	//echo "<script> console.log('" . $value_arr['children_array'][$x] . "'); </script>";
		      //Recupero le proprieta del sottogruppo da $folder_order:
		      $key_found = array_search($value_arr['children_array'][$x], array_column($folder_order, 'pedice'));
	//echo "<script> console.log('" . implode(",",$folder_order[$key_found]) . "'); </script>";
		      $treeConfig .= ' {nodeType: "gx_layercontainer", text: "' . $folder_order[$key_found]['legend_group_name'] . '", expanded: ' . $folder_order[$key_found]['expanded'] . ',';
		      $treeConfig .= 'loader: { baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"}, filter: function(record) {';
		      $treeConfig .= 'return record.get("layer").name.indexOf("' . $value_arr['children_array'][$x] . '") !== -1}';
		      $treeConfig .= '}},';
		    }
		  }
		  $treeConfig .= ']},';
		  } //fine dell'IF se la cartella PADRE non era stata ancora processata
		} //fine dell'ELSE se la cartella ha un padre
	    }
	    $treeConfig .= '{nodeType: "gx_baselayercontainer", text: "Carte di sfondo"}';
	    $treeConfig .= ']';
	    echo "<script> var treeConfig = " . $treeConfig . "; </script>";
	    echo "<script> " . $groups_labels_str . "; </script>";
	    //echo '<script> console.log("'.$groups_labels_str.'"); </script>';

	    $list_layers_load = implode(",", $layers_load);
	    $list_layers_select = implode(",", $layers_select);
	    $list_layers_highlight = implode(",", $layers_highlight);
	    $list_layers_multiselect = implode(",", $layers_multiselect);
            echo "<script> var layers_to_load = [" . $list_layers_load . "]; </script>";
	    echo "<script> var layers_to_select = [" . $list_layers_select . "]; </script>";
	    echo "<script> var layers_to_highlight  = [" . $list_layers_highlight . "]; </script>";
	    echo "<script> var layers_to_multiselect = [" . $list_layers_multiselect . "]; </script>";

	    //Costruisco le variabili per lo store dei layers:
	    echo "<script> var layers_fields = ['myId', 'displayText', 'store_el']; </script>";
            //echo "<script> var layers_data = []; </script>";
	    echo "<script> var layers_data = " . json_encode($layers_data_store) . "; </script>";

	    //Vi sono 3 modi per cui si possono avere da subito dei layer accesi: da cookie, da url e da DB.
	    //Scelgo di dare assoluta precedenza ai layer impostati via cookie:
/*	    $on_layers = <<<EOT
		if (!custom_list_cookie) {
		//Se ho lasciato l'utente definire i suoi layer allora non lo intralcio con queli di default:
		if (custom_layers!="") {
	        //ACCENDO i layer specificati:
	          for (i=0; i<custom_layers.length; i++) {
                    var layer_single = eval(custom_layers[i]);
                    layer_single.setVisibility(true);
        	  }
		}
		else $layer_visibility_on; //accendo i layer impostati come tali da DB
		}
EOT;*/
	    //Se invece voglio dare assoluta precedenza ai layer impostati da URL:
            $on_layers = <<<EOT
		if (custom_layers) {
		  //ACCENDO i layer specificati:
                  for (i=0; i<custom_layers.length; i++) {
                    var layer_single = eval(custom_layers[i]);
                    layer_single.setVisibility(true);
                  }
		  //Attivo il grid secondo l'ultimo layer elencato nell'url, richiamando la funzione activeNode che legge il campo text=name del layer
                  layer_single.text = layer_single.name;
                  activeNode(layer_single);

		  //Svuoto eventuali layers impostati nel cookie:
		  custom_list_cookie = '';
		}
		else {
		  if (!custom_list_cookie) {
		    $layer_visibility_on; //accendo i layer impostati come tali da DB
		  }
                }
EOT;
	    echo "<script> " . $on_layers . "; </script>";

	}


/* ************ POPUP da DB ************* */
        //Adesso a seconda del tipo di webgis mi carico le impostazioni personalizzate per i LAYERS:
	$query_popup = "SELECT ol_layer_idx, openlayer_name, default_legend_variable, webgis_idx, funzione_associata, url_link, url_name, url_options, grafici_stazione, grafici_tab_attivo, pop_html, pop_title, grafici_valore, grafici_codice, grafici_progr, grafici_tipostaz, grafici_tiporete, grafici_composito FROM config.v_webgis_popups WHERE webgis_idx = $indice_webgis;";
        $result_popup = pg_query($conn_local,$query_popup);
        if (!$result_popup) {
            echo "console.log('Error on the query popup <br>".$query_popup."');";
            //exit;
        }
        else {
	//Attenzione che entra nell'else anche se il risultato della query e' vuoto!!
	  //Prendo tutti i risultati della query:
          $fetch_all_popup = pg_fetch_all($result_popup);
          foreach ($fetch_all_popup as $fetch_popup) {
            //echo "<script>console.log('".$fetch_popup['default_legend_variable']."');</script>";
	    $js_layername = $fetch_popup['openlayer_name'];
	    //Proviamo a costruire la stringa di codice JS:
	    $js_funzione = $fetch_popup['funzione_associata'];
	/* GRAFICI_RETE */
	    if ($js_funzione == 'grafici_rete') {
	      $js_stazione = $fetch_popup['grafici_stazione']; //valore fisso per decidere quale grafico aprire. Forse meglio indicarlo in un campo della tabella in modo da poter considerare la UNION tra dati diversi. Lo faccio col campo "tipo_rete":
	      $js_tipo_rete = $fetch_popup['grafici_tiporete']; //per i cluster il tipo di grafico da aprire lo prendo da un campo della tabella
              $js_tab_attivo = $fetch_popup['grafici_tab_attivo'];
	      $js_campo_valore = $fetch_popup['grafici_valore'];
	      $js_campo_codice = $fetch_popup['grafici_codice'];
              $js_campo_tipostaz = $fetch_popup['grafici_tipostaz'];
              $js_campo_progr = $fetch_popup['grafici_progr'];
	      $js_composito = $fetch_popup['grafici_composito'];
	      $js_composito_arr = explode(",", $js_composito);
	      $js_code = <<<EOT
	/*Codice semplice - da solo funziona:
		$js_layername.events.on({
		  featureselected: function(e) {
		    //Se non e' stato attivata la multiselezione proseguo con la funzione classica:
		    if (multiselect==false) {
		      $js_funzione(e.feature.attributes, "$js_stazione", "$js_tab_attivo", e.feature);
		    }
		  }
        	});
	*/
	/* Codice per cluster ed elementi semplici */
		$js_layername.events.on({
                  featureselected: function(e) {
		   //Se non e' stato attivata la multiselezione proseguo con la funzione classica:
                   if (multiselect==false) {
		    var elemento = e.feature;
		    if (elemento.cluster) { //se ho selezionato un cluster
                      valore_dict = new Array(); //creo un array
                      for (var i = 0; i < elemento.cluster.length; i++) {
			if ("$js_tipo_rete" == 'grafici_stazione') { //il dato proviene da una tabella con fonti uniche
                          var tipo_rete = "$js_stazione"; //ad esempio 'meteoidro'
                        }
                        else { //il dato contiene piu fonti e/o e' una vista
                          var tipo_rete = elemento.cluster[i].attributes.$js_tipo_rete; //il valore 'meteoidro' oppure 'estero' e' preso direttamente da un campo dell'elemento selezionato
                        }
			valore_dict.push({
                                max1: elemento.cluster[i].attributes.$js_campo_valore,
                                codice_istat_comune: elemento.cluster[i].attributes.$js_campo_codice,
                                progr_punto_com: elemento.cluster[i].attributes.$js_campo_progr,
                                tipo_staz: elemento.cluster[i].attributes.$js_campo_tipostaz,
				//tipo_rete: elemento.cluster[i].attributes.$js_tipo_rete
				tipo_rete: tipo_rete
                        });
                        //valore_dict[chiave] = elemento.cluster[i].attributes.max1ora;
                      }
                      var sorted = valore_dict.sort(function(a, b) {
                        //Pongo a ZERO i valori nulli altrimenti li ordina per primi:
                        if (b.max1==null) b.max1=0;
                        if (a.max1==null) a.max1=0;
                        return b.max1 - a.max1; //reverse order
                      });
		      $js_funzione(sorted[0], sorted[0]["tipo_rete"], "$js_tab_attivo", e.feature, '$js_composito');
                    }
                    else { //non si tratta di cluster
			if ("$js_tipo_rete" == 'grafici_stazione') { //il dato proviene da una tabella con fonti uniche
			  var tipo_rete = "$js_stazione";
			}
			else { //il dato contiene piu fonti ed e' una vista
			  var tipo_rete = e.feature.attributes.$js_tipo_rete;
			}
console.log(e.feature.attributes);
			//Per fare in modo che oggetti diversi non abbiano nomi dei campi completamente diversi, ne unifico almeno il codice identificativo, anche per mantenerlo in linea e coerente con la struttura FISSA assegnata nel caso di cluster:
			e.feature.attributes['codice_istat_comune'] = e.feature.attributes.$js_campo_codice;
			e.feature.attributes['progr_punto_com'] = e.feature.attributes.$js_campo_progr;
			e.feature.attributes['tipo_staz'] = e.feature.attributes.$js_campo_tipostaz;
			$js_funzione(e.feature.attributes, tipo_rete, "$js_tab_attivo", e.feature, '$js_composito');
		    }
		   } //fine eccezione se multiselection=false
                  } //fine evento featureSelected
                });
EOT;
	      //$js_code = "grafici_rete";
	      //echo "<script>console.log('".$js_code."');</script>";
	    }
	/* OPEN_POPUP */
	    else if ($js_funzione == 'open_popup') {
	      //echo "<script>console.log('".$fetch_popup['funzione_associata']."');</script>";
	      $js_url = $fetch_popup['url_link'];
              $js_popname = $fetch_popup['url_name'];
              $js_options = $fetch_popup['url_options'];
              $js_code = <<<EOT
                $js_layername.events.on({
                  featureselected: function(e) {
		    //Se non e' stato attivata la multiselezione proseguo con la funzione classica:
                    if (multiselect==false) {
                      var uri = $js_url;
                      var pop_name = "$js_popname";
                      var pop_options = "$js_options";
                      $js_funzione(uri, pop_name, pop_options, e.feature);
                    }
		  }
                });
EOT;
              //echo "<script>console.log('".$js_code."');</script>";
            }
	/* CREATEPOPUP */
            else if ($js_funzione == 'createPopup') {
              $js_poptitle = $fetch_popup['pop_title'];
              $js_pophtml = $fetch_popup['pop_html'];
              $js_code = <<<EOT
                $js_layername.events.on({
                  featureselected: function(e) {
		    //Se non e' stato attivata la multiselezione proseguo con la funzione classica:
                    if (multiselect==false) {
		      $js_funzione(e, $js_pophtml, $js_poptitle);
		    }
                  }
                });
EOT;
              //echo "<script>console.log('".$js_code."');</script>";
            }
	    echo "<script>" . $js_code . "; </script>";
	  } //fine foreach
	} //fine else se query_popup ok

/* ************ FINE POPUP ************* */


    } //indice webgis definito
} //conn
pg_close($conn_local);


//carico ancora il vecchio JS in modo da definire il view_grid e il LegendPanel:
$local_js = '<script type="text/javascript" src="'.$root_dir_html.$local_path . $local_script . '"></script>';
echo $local_js;


///////////////////// TOOLBAR ITEMS and MEASURE TOOLS ///////////////////
//Prima ridefinisco alcune variabili JS che servono:
echo '<script type="text/javascript"> var alert_system = ' . $alert_system . '; </script>';
//Carico la funzione esterna per caricare tutti gli elementi della toolbar - provo a lanciarla da webgis_central.php!
//$launch_toolbar = '<script type="text/javascript">toolbar_tools_default();  toolbar_tools_extension(); </script>';
//echo $launch_toolbar;


?>

