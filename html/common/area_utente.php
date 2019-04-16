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
- ATTENZIONE!!! quando modifichi la password apache ti sbatte fuori perche dovresti aggiornare la apssword anche delle sessione!
- ridimensionare i pulsanti in modo che sia accessibile tramite tablet-smartphone
- eventualmente dare la possibilita ad utenti con certi poteri di accedere anche agli altri pulsanti...
- aggiungere possibilità di modificare la password

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
			$build_table .= "<tr><td><a title='" . $fetch_webgis['webgis_description'] .  "'href='" . $root_dir_html . $root_dir_script . '?TYPE=' . $fetch_webgis['webgis_name'] . "' target='_blank' class='classname'>" . $fetch_webgis['webgis_name'] . "</a></br></td>";
			//Elencherei di fianco il pulsante per gestire i layer del servizio:
//devo rimandare subito a questo:
//http://www.arpa.piemonte.gov.it/radar/cgi-bin/add_layer_from_db.py?root_dir_html=/radar&step=2&id_stab=13&nome=%20idrologia%20%20#13
	//		$build_table .= '<td><a href="' . $root_dir_html . $root_dir_cgi . $script_admin . '?root_dir_html=' . $root_dir_html . '&step=2&id_stab='.$fetch_webgis['webgis_idx'].'&nome='.$fetch_webgis['webgis_name'].'" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;" title="Gestisci i layer da caricare sul servizio">Gestisci layers</a></td>';
	//		$build_table .= '<td><a href="' . $root_dir_html . '/goaccess_reports/'.$fetch_webgis['webgis_name'].'-report.html" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;" title="Visualizza le statistiche di accesso al servizio">Access Log Stat</a></br></td>';
	//		$build_table .= '<td style="width:3%;">&nbsp;</td>';
	//		$build_table .= '<td><a href="' . $root_dir_html . $root_dir_cgi . $script_service . '?root_dir_html=' . $root_dir_html . '&step=2&id_stab='.$fetch_webgis['webgis_idx'].'&nome='.$fetch_webgis['webgis_name'].'" class="classname" target="_blank" style="font-size:1em; width:100%;padding:2px 3px;border-color:#d71414;" title="Gestisci la toolbar del servizio - IN SVILUPPO!">Gestisci servizio</a></td></tr>';
		    }
		    //Al momento non visualizzo i webgis disattivati, ma posso sempre elencarli a fianco...
		    else $build_table_deactivate .= "<tr><td><a title='" . $fetch_webgis['webgis_description'] .  "'href='" . $root_dir_html . $root_dir_script . '?TYPE=' . $fetch_webgis['webgis_name'] . "' target='_blank' class='classname'>" . $fetch_webgis['webgis_name'] . "</a></br></td></tr>";
		}
		//al fondo inserisco il pulsante del logout:
		//logout con metodi php: NON FUNZIONA!
		//il metodo precedente non funziona. provo a fare un logout da url: NON FUNZIONA!
		//provo allora usando http il metodo form-logout-handler - OK! --> per dettagli vedi /etc/httpd/conf.d/dbd_pgsql.conf
		$build_table .= '<tr><td><a href="' . $root_dir_html .'/logout.html" class="classname" target="_self" style="font-size:1em; width:100%;padding:2px 3px;border-color:#d71414;" title="logout">LOGOUT</a></td></tr>';
	}
}


$check_modify = 0;
/* SPOSTATA SOTTO LOGIN:PHP
if (isset($_POST["password1"])) { //vuol dire che ho richiesto di modificare la password
  $password = $_POST["password1"];
  //if (isset($_POST["username"])) { //se e' presente prendo l'username dal POST, altrimenti lo prendo dalle variabili del SERVER
  //  $username = $_POST["username"];
  //}
//echo $username;

  //Recupero dati per i servizi WebGIS disponibili:
  if (!$conn) { // Check if valid connection
    echo "Error Connecting to database <br>";
    exit;
  }
  else {
    $query_username = "SELECT * FROM config.httpd_users WHERE username = '$username' LIMIT 1;";
    $result_username = pg_query($conn, $query_username);
    if (!$result_username) {
        echo "Error on the query area<br>" . $query_username;
        exit;
    }
    else {
      //se non corrisponde email con nessun utente avviso l'utente
      $rows = pg_num_rows($result_username);
      if ($rows<1) {
        $check_modify = -1;
      }
      else {
        //qui dovrei far partire una query su DB che aggiorna la pwd cosi come richiesto dall'utente
        $query_newpwd = <<<EOT
UPDATE config.httpd_users SET password = '{SHA}'||encode(digest('$password','sha1'),'base64')
WHERE httpd_users.username = '$username';
EOT;
//echo $query_newpwd;
        $result_newpwd = pg_query($conn, $query_newpwd);
	if (!$result_newpwd) {
          echo "Error on the query password<br>" . $query_newpwd;
	  $check_modify = -1;
	}
	else {
	  $check_modify = 1;
	}
      }
    }
  }
}

pg_close($conn);
*/

?>

<html>

<head>

<!-- <link href="//netdna.bootstrapcdn.com/bootstrap/3.1.0/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css"> -->
<!-- <link rel="stylesheet" href="https://jqueryvalidation.org/files/demo/site-demos.css"> -->


  <link href='button-style.css' rel='stylesheet' type='text/css' >
  
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

<!-- <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.0/js/bootstrap.min.js"></script> -->


<script language="Javascript">

/*
//FUNZIONE PURA JAVSCRIPT -- vedi open-scripts/gestione_pwd.html 
$(document).ready(function(){

$("input[type=password]").keyup(function(){
//$(".input-lg").keyup(function(){
    var ucase = new RegExp("[A-Z]+");
        var lcase = new RegExp("[a-z]+");
        var num = new RegExp("[0-9]+");
//console.log($("#password1").val());

        if($("#password1").val().length >= 8){
                $("#8char").removeClass("glyphicon-remove");
                $("#8char").addClass("glyphicon-ok");
                $("#8char").css("color","#00A41E");
                document.getElementById("password2").disabled=false;
        }else{
                $("#8char").removeClass("glyphicon-ok");
                $("#8char").addClass("glyphicon-remove");
                $("#8char").css("color","#FF0004");
                document.getElementById("password2").disabled=false;
        }
        if($("#password1").val() == $("#password2").val()){
                $("#pwmatch").removeClass("glyphicon-remove");
                $("#pwmatch").addClass("glyphicon-ok");
                $("#pwmatch").css("color","#00A41E");
                document.getElementById("change_pwd").disabled=false;
        }else{
                $("#pwmatch").removeClass("glyphicon-ok");
                $("#pwmatch").addClass("glyphicon-remove");
                $("#pwmatch").css("color","#FF0004");
                document.getElementById("change_pwd").disabled=true;
        }
  });
});
*/

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

<?php
if ($check_modify == 1) {
?>
        <br/><h2>Password aggiornata con successo! La nuova password per l'utente <?php echo $username; ?> e': <?php echo $password; ?></h2>
<?php
}
else if ($check_modify == -1) {
?>
        <br/><h2>Spiacenti ma c'e' stato un errore nell'aggiornamento della password. Riprovare piu' tardi o se il problema persiste contattare l'amministratore del sistema.</h2>
<?php
}
?>        

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
        <form name="modify_form" id="modify_form" method="POST" action="">

<p class="text-center"><b>Usa il form seguente per modificare la tua password.</b></p>
<p>
<input type="password" class="input-lg" name="password1" id="password1" placeholder="New Password" autocomplete="off" data-rule-password ="true" required>
<div class="row">
<div class="col-sm-12">
<span id="8char" class="glyphicon glyphicon-remove" style="color:#FF0004;"></span> 8 Characters Long<br>
<!-- <span id="ucase" class="glyphicon glyphicon-remove" style="color:#FF0004;"></span> One Uppercase Letter
</div>
<div class="col-sm-6">
<span id="lcase" class="glyphicon glyphicon-remove" style="color:#FF0004;"></span> One Lowercase Letter<br>
<span id="num" class="glyphicon glyphicon-remove" style="color:#FF0004;"></span> One Number
</div>
-->
</div>
<input type="hidden" name="username" id="username" value="<?php echo $username; ?>" >
<input type="password" class="input-lg" name="password2" id="password2" placeholder="Repeat Password" autocomplete="off" data-rule-password ="true" data-rule-required="true" data-rule-equalTo="#password1" required>
<div class="row">
<div class="col-sm-12">
<span id="pwmatch" class="glyphicon glyphicon-remove" style="color:#FF0004;"></span> Passwords Match
</div>
</div>
<input type="submit" class="btn-primary btn-load btn-lg" data-loading-text="Changing Password..." value="Change Password" id="change_pwd" >
</p>
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
