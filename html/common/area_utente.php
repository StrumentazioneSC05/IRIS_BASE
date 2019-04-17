<?php
/***************************************************************
* Name:        IRIS - Integrated Radar Information System
* Purpose:     WebGis System for Meteorological Monitoring
*
* Author:      Armando Gaeta
* Email:       sistemi.previsionali@arpa.piemonte.it
*
* Created:     07/02/2019
* Licence:     EUPL 1.1 Arpa Piemonte 2019
***************************************************************/

/*
Interfaccia utente per gestire i servizi ai quali gli è consentito accedere

DA FARE:
- ridimensionare i pulsanti in modo che sia accessibile tramite tablet-smartphone
- eventualmente dare la possibilita ad utenti con certi poteri di accedere anche agli altri pulsanti...

POTENZIALMENTE questa pagina potrebbe NON servire, soprattutto nella misura in cui non si sara' in grado di far funzionare il logout
*/


//Carico le configurazioni di base da un file esterno:
include_once('config_iris.php');

//Recupero dati per i servizi WebGIS disponibili:
$conn = pg_connect($conn_string);
if (!$conn) { // Check if valid connection
        echo "Error Connecting to database <br>";
        exit;
}
else {
	if (isset($_SERVER['REMOTE_USER'])) { //questo metodo se come login uso html con req da httpd.conf
	  $username = $_SERVER['REMOTE_USER'];
	}
	else if (isset($_SERVER['REDIRECT_REMOTE_USER'])) { //questo metodo se come login uso php senza req
	  $username = $_SERVER['REDIRECT_REMOTE_USER'];
	}
	else {
	  echo "Errore sul reperimento corretto dell'utente";
	}
	$query_webgis = "SELECT a.* FROM config.webgis_indici a, config.httpd_user_webgis b WHERE b.username='$username' AND a.webgis_name=b.webgis_name ORDER BY webgis_idx;";
    $result_webgis = pg_query($conn, $query_webgis);
    if (!$result_webgis) {
        echo "Error on the query area<br>" . $query_webgis;
        exit;
    }
    else {
		$build_table = '';
		$build_table_deactivate = '';
		$script_admin = '/add_layer_from_db.py';
		$script_service = '/manage_webgis_service_from_db.py';
		$this_filename = $_SERVER['SCRIPT_NAME'];
		//Prendo tutti i risultati della query:
        	$fetch_all_webgis = pg_fetch_all($result_webgis);
		foreach ($fetch_all_webgis as $fetch_webgis) {
		    if ($fetch_webgis['attivo']==1) {
			$build_table .= "<tr><td><a title='" . $fetch_webgis['webgis_description'] .  "'href='" . $root_dir_html . $root_dir_script . '?TYPE=' . $fetch_webgis['webgis_name'] . "' target='_blank' class='btn classname'>" . $fetch_webgis['webgis_name'] . "</a></br></td>";
			//Elencherei di fianco il pulsante per gestire i layer del servizio:
//devo rimandare subito a questo:
//http://www.arpa.piemonte.gov.it/radar/cgi-bin/add_layer_from_db.py?root_dir_html=/radar&step=2&id_stab=13&nome=%20idrologia%20%20#13
	//		$build_table .= '<td><a href="' . $root_dir_html . $root_dir_cgi . $script_admin . '?root_dir_html=' . $root_dir_html . '&step=2&id_stab='.$fetch_webgis['webgis_idx'].'&nome='.$fetch_webgis['webgis_name'].'" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;" title="Gestisci i layer da caricare sul servizio">Gestisci layers</a></td>';
	//		$build_table .= '<td><a href="' . $root_dir_html . '/goaccess_reports/'.$fetch_webgis['webgis_name'].'-report.html" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;" title="Visualizza le statistiche di accesso al servizio">Access Log Stat</a></br></td>';
	//		$build_table .= '<td style="width:3%;">&nbsp;</td>';
	//		$build_table .= '<td><a href="' . $root_dir_html . $root_dir_cgi . $script_service . '?root_dir_html=' . $root_dir_html . '&step=2&id_stab='.$fetch_webgis['webgis_idx'].'&nome='.$fetch_webgis['webgis_name'].'" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;border-color:#d71414;" title="Gestisci la toolbar del servizio - IN SVILUPPO!">Gestisci servizio</a></td></tr>';
		    }
		    //Al momento non visualizzo i webgis disattivati, ma posso sempre elencarli a fianco...
		    else $build_table_deactivate .= "<tr><td><a title='" . $fetch_webgis['webgis_description'] .  "'href='" . $root_dir_html . $root_dir_script . '?TYPE=' . $fetch_webgis['webgis_name'] . "' target='_blank' class='btn classname'>" . $fetch_webgis['webgis_name'] . "</a></br></td></tr>";
		}
		//al fondo inserisco il pulsante del logout:
		//logout con metodi php: NON FUNZIONA!
		//il metodo precedente non funziona. provo a fare un logout da url: NON FUNZIONA!
		//provo allora usando http il metodo form-logout-handler - OK! --> per dettagli vedi /etc/httpd/conf.d/dbd_pgsql.conf
		$build_table .= '<tr><td><a href="' . $root_dir_html .'/logout.html" class="btn logout_btn" target="_self" title="logout">LOGOUT</a></td></tr>';
	}
}

pg_close($conn);

?>

<html>

<head>

<!-- <link rel="stylesheet" href="https://jqueryvalidation.org/files/demo/site-demos.css"> -->


  <link href='../open-scripts/button-style.css' rel='stylesheet' type='text/css' >
  
<!-- <link rel="stylesheet" type="text/css" href="desktop.css" media="screen and (min-width: 481px)" /> -->
<!--[if IE]>
<link rel="stylesheet" type="text/css" href="explorer.css" media="all" />
<![endif]-->

<meta name="viewport" content="user-scalable=no, width=device-width" />

<?php
$script_js = '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.12.4.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery.validate.min.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/additional-methods.min.js"></script>';
echo $script_js;
?>


<script language="Javascript">

</script>

<style>
html {
  background: url(<?php echo $root_dir_html; ?>/sfondo_webgis.png) no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: 100% 100%;
}
body {
  background-color:rgba(85, 85, 85, 0.4);
  /*height: 100%;*/
  margin: 0;
  background-repeat: no-repeat;
  background-attachment: fixed;
}
.div_modify {
  margin: 20px;
}

#modify_form {
    text-align: center;
    width: 520px;
    margin-top: 20px;
    margin-left: 0;
    margin: auto;
    padding: 26px 24px 46px;
    font-weight: 400;
    overflow: hidden;

    border-radius: 10px;
    border: 4px solid #383100;
    -moz-box-shadow: 0 4px 10px -1px #C8C8C8;
    -webkit-box-shadow: 0 4px 10px -1px #C8C8C8;
    box-shadow: 0 4px 10px -1px #C8C8C8!important;
    position: relative;
    z-index: 1;
    background-color: rgb(30,115,190);
    background: url() no-repeat center top;
    /*background: rgba(30,115,190,1)!important;
    background: url(http://www.avasva.com/wp-content/plugins/admin-custom-login/css/img/pattern-1.png) repeat scroll left top, url() no-repeat center top !important;*/
}
#modify_form p {
    margin-bottom: 0;
}

h2 {
    text-align: center;
}

/* per jQuery validate*/
label.error { 
   float: none; color: red; 
   padding-left: .5em;
   vertical-align: top; 
   display: block;
}
</style>

</head>
        
        
  <body>

    <h1 style='font-size: 1em;'>
	</br>
	<!-- PANNELLO GESTIONE SERVIZI WEBGIS IRIS -->
    </h1>

<div style="text-align:center;">
    
          <table class="nav" style="margin: 0px auto;text-align:center;">

             
	<!--Elenco servizi disponibili per link al Webgis-->
	  <?php
		echo $build_table;
	  ?>
			 
          </table>
          
</div>


<div class="div_modify">
<!-- proviamo il form per modificare la password -->
        <form name="modify_form" id="modify_form" method="POST" action="../login.php">

<p class="text-center"><b>Usa il form seguente per modificare la tua password.</b></p>

<p></p>

<div class="input-container">
<input type="password" class="input_text" name="password1" id="password1" placeholder="New Password" autocomplete="off" data-rule-password ="true" required>
</div>

<p></p>

<input type="hidden" name="username" id="username" value="<?php echo $username; ?>" >
<div class="input-container">
<input type="password" class="input_text" name="password2" id="password2" placeholder="Repeat Password" autocomplete="off" data-rule-password ="true" data-rule-required="true" data-rule-equalTo="#password1" required>
</div>

<p></p>

<input type="submit" style="font-size:1em;width:50%;padding:2px 3px;" class="btn classname" data-loading-text="Changing Password..." value="Change Password" id="change_pwd" >
        </form>
</div>

<script language="Javascript">
//provo JQUERY VALIDATE
$('#modify_form').validate({
    rules: {
        password1: {
            required: true,
            minlength: 5
        },
        password2: {
            required: true,
            minlength: 5,
            equalTo: "#password1"
        }
    }
});
</script>

        
    </body>
</html>
