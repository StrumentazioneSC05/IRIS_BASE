<?php
/*
Caricato da jquery_tab.php per costruire l'eventuale tab composito per quei layer con attiva la funzione grafici_rete.
In base alla variabile sorgente creo il contenuto di questo tab
*/

if ($sorgente=='nd') {
  $tab_name_extra = 'Composito';
  $tab_content .= "<div id='tabs-" . $i . "'>Campo sorgente-stazioni per tab composito non definita";
  $tab_content .= "</div>";
  $tab_title .= "<li><a href='#tabs-" . $i . "'>" . $tab_name_extra . "</a></li>";
}

/* IDROMETRI BIS */
if ($sorgente=='idrometri_bis') {
  $tab_name_extra = 'Elenco prese';
  $tab_content .= "<div id='tabs-" . $i . "'>";

  $table_cont = "<table border='1' cellspacing='0' cellpadding='5' id='prese'>";
  $table_cont .= "<tr><th>Cod_presa</th><th>Tipo</th><th>Corso acqua</th><th>Uso</th><th>Qmax prelievo</th></tr>";
  $conn = pg_connect($conn_string);
  if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
  }
  else {
    $query = "SELECT rnum, cod_presa, tipo_presa, bacino_area_idro, corso_acqua, codice, denominazione, superficie, denominazione_utenze, uso, q_max_prelievo from idro.v_associazione_prese_idrometri a, realtime.bis_stato b where b.codice = ANY(cod_idro_arr) AND b.codice='$codice_istat$progr_punto' ORDER BY q_max_prelievo DESC;";
    $result = pg_query($conn, $query);
    if (!$result) {
        echo "Error on the query <br> " . $query;
    }
    else {
	$numrows = pg_numrows($result);
	while($row = pg_fetch_array($result)) {
	  $table_cont .= "<tr><td>" . $row['cod_presa'] . "</td><td>" . $row['tipo_presa'] . "</td><td>" . $row['corso_acqua'] . "</td><td>" . $row['uso'] . "</td><td>" . $row['q_max_prelievo'] . "</td></tr>";
	}

    }
  pg_close($conn);
  }
  $table_cont .= "</table>";

  $tab_content .= $table_cont . "</div>";
  $tab_title .= "<li><a href='#tabs-" . $i . "'>" . $tab_name_extra . "</a></li>";
}

else {
  $tab_name_extra = 'Composito';
  $tab_content .= "<div id='tabs-" . $i . "'>Campo sorgente-stazioni per tab composito non definita";
  $tab_content .= "</div>";
  $tab_title .= "<li><a href='#tabs-" . $i . "'>" . $tab_name_extra . "</a></li>";
}


?>
