
<?php

//Carico le configurazioni di base da un file esterno:
include_once('common/config_iris.php');

//se proengo dalla pagina in cui ho modificato la password:
$check_modify = 0;
if (isset($_POST["password1"])) { //vuol dire che ho richiesto di modificare la password
  $password = $_POST["password1"];
  if (isset($_POST["username"])) { //se e' presente prendo l'username dal POST, altrimenti lo prendo dalle variabili del SERVER
    $username = $_POST["username"];
  }
//echo $username;

  //Carico le configurazioni di base da un file esterno:
  //$conn_string = "host=localhost port=5432 dbname=iris_base user=webgis password=webgis$2013%";
  $conn = pg_connect($conn_string);
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
  pg_close($conn);

}

$check_reset = 0;
if (isset($_POST["httpd_mail"])) { //vuol dire che ho richiesto di resettare la password
  $httpd_mail = $_POST["httpd_mail"];
  //Carico le configurazioni di base da un file esterno:
  //$conn_string = "host=localhost port=5432 dbname=iris_base user=webgis password=webgis$2013%";
  //Recupero dati per i servizi WebGIS disponibili:
  $conn = pg_connect($conn_string);
  if (!$conn) { // Check if valid connection
    echo "Error Connecting to database - reset pwd <br>";
    exit;
  }
  else {
    $query_mail = "SELECT * FROM config.httpd_users WHERE email = '$httpd_mail' LIMIT 1;";
    $result_mail = pg_query($conn, $query_mail);
    if (!$result_mail) {
        echo "Error on the query area<br>" . $query_mail;
        exit;
    }
    else {
      //se non corrisponde email con nessun utente avviso l'utente
      $rows = pg_num_rows($result_mail);
      if ($rows<1) {
	$check_reset = -1;
      }
      else {
	$check_reset = 1;
        //qui dovrei far partire una query su DB che resetta la pwd per la mail corrispondente e invia la nuova password alla mail
	$fetch_mail = pg_fetch_all($result_mail);
	//print_r( $fetch_mail[0]);
	$username = $fetch_mail[0]['username'];
	$query_newpwd = <<<EOT
UPDATE config.httpd_users SET password = '{SHA}'||encode(digest(newpwd,'sha1'),'base64') FROM (
 SELECT array_to_string(ARRAY(SELECT chr((65 + round(random() * 25)) :: integer) FROM generate_series(1,7)), '') AS newpwd
) AS foo
WHERE httpd_users.username = '$username'
RETURNING newpwd;
EOT;
	$result_newpwd = pg_query($conn, $query_newpwd);
	$row = pg_fetch_row($result_newpwd);
	$newpwd_is = $row['0'];
	$this_filename = $_SERVER['SCRIPT_NAME'];
	$this_hostname = $_SERVER['SERVER_NAME'];
print $this_hostname;
	// To send HTML mail, the Content-type header must be set
	$headers[] = 'MIME-Version: 1.0';
	$headers[] = 'Content-type: text/html; charset=iso-8859-1';
	// Additional headers
	$headers[] = 'From: IRIS strumentazione <strumentazionesc05@gmail.com>';
	// Message
	$message = <<<EOF
	<html>
	<head>
	  <title>Reset password sistemi IRIS</title>
	</head>
	<body>
	<p>
	La nuova password per l'utente $username e': $newpwd_is.
	<br/> <br/>
	Per accedere al sistema visitare la pagina <a href="http://$this_hostname$this_filename">pagina di login</a>
	</p>
	</body>
	</html>
EOF;

	$my_subject = "Reset password per i sistemi IRIS";
	//$message = "La nuova password per l'utente $username e': $newpwd_is. \n Per accedere al sistema visitare la pagina <a href='i$this_hostname$this_filename'>pagina di login</a> ";
	$result = mail($httpd_mail, $my_subject, $message, implode("\r\n", $headers) );
	if ($result==true) {
	  //print 'ok mail';
	  $check_reset = 1;
	}
	else {
	  //print 'error mail';
	  $check_reset = -2;
	}
      }
    }
  }
  pg_close($conn);
}

?>

<html>

<head>

                <title>Login page</title>


  <link href='open-scripts/button-style.css' rel='stylesheet' type='text/css' >


<meta name="viewport" content="user-scalable=no, width=device-width" />


<script type="text/javascript" src="jQuery/jquery-1.10.2.min.js"></script>


<script language="Javascript">

</script>

<style>
html {
  background: url(sfondo_webgis.png) no-repeat center center fixed;
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

#loginform {
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
#loginform p {
    margin-bottom: 0;
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

#mailform {
    width: 520px;
    margin-top: 20px;
    margin-left: 0;
    margin: auto;
}
#mailform p {
    margin-bottom: 0;
}
.icon-ph {
    display: inline-block;
    width: 15px;
    height: 15px;
    min-width: 16px;
    padding: 4px 5px;
    font-size: 20px;
    font-weight: normal;
    line-height: 20px;
    text-align: center;
    text-shadow: 0 1px 0 #ffffff;
    background-color: transparent;
    position: absolute;
    left: 6px;
    top: 4px;
    bottom: 3px;
    z-index: 3;
}
h2 {
    color: darkred;
    font-size: 1em;
    font-style: italic;
}
</style>


	</head>
	<body>

<?php
if ($check_reset == 1) {
?>
	<br/><h2>Una mail e' stata inviata all'indirizzo specificato contenente le nuove credenziali di accesso ai sistemi IRIS</h2>
<?php
}
else if ($check_reset == -1) {
?>
        <br/><h2>Spiacenti ma la mail fornita non risulta asscoiata ad alcun utente registrato alla piattaforma</h2>
<?php
}
else if ($check_reset == -2) {
?>
        <br/><h2>Oooops! Rilevato un errore nell'inviare la mail con la nuova password. Riprovare piu' tardi oppure contattare l'amministratore del sistema</h2>
<?php
}
?>


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


	<br/><h1>Credenziali di accesso ai sistemi IRIS</h1>

		<form name="loginform" id="loginform" method="POST" action="/devel/dologin.html">

	<p>
		<label for="user_login" id="log_input_lable">Nome utente<div class="input-container"> <div class="icon-ph"><i class="fa fa-user"></i></div> <input id="user_login" name="httpd_username" class="input_text" type="text" placeholder="Nome Utente" required="required"></div></label>
	</p>

	<p>
		<label for="user_pass" id="pwd_input_lable">Password<div class="input-container"> <div class="icon-ph"><i class="fa fa-key"></i></div> <input id="user_pass" name="httpd_password" class="input_text" type="password" placeholder="Password" required="required"></div></label>
	</p>

			<input type="submit" id="login_btn" name="login" class="btn login_btn" value="Login" />

		</form>

	<p>
	<form name="mailform" id="mailform" method="POST" action="">
	Hai dimenticato la password?
	<br/>
	Inserisci la mail sulla quale ricevere la nuova password
		<p>
                <div class="input-container"> <div class="icon-ph"><i class="fa fa-key"></i></div> <input id="user_mail" name="httpd_mail" class="input_text" type="email" placeholder="e-mail" required="required"></div></label>
        	</p>

	<button title='resetta password e invia la nuova password via mail' type="submit" name="reset_pwd" value="Reset" style="font-size:1em;width:50%;padding:2px 3px;" class="btn classname"> Resetta password </button>

		</form>
	</p>

	</body>
</html>
