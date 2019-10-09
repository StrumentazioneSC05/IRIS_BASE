<?php
//RICORDARSI DI AGGIORNARE DI CONSEGUENZA ANCHE /var/www/cgi-bin/config.py

$root_dir_html = '/devel'; //senza reverseproxy = ''
//$root_dir_html = '/radar'; //nel caso in cui la ROOT del sistema sia diversa (ad es. reverseproxy)
//$root_dir_html_ext = ''; //senza un REALE reverseproxy per la libreria Ext caricata da Minify che altrimenti non trova alcune immagini = '' - LO TOLGO DAL MINIFY per evitare problemi
$root_dir_cgi = '/cgi-bin';
$root_dir_script = '/common/webgis_central.php';
$proxies_http = 'http://proxy.arpa.piemonte.it';
$proxies_port = '3128';

$conn_string = "host=localhost port=5432 dbname=iris_base user=webgis password=webgis$2013%";
$conn_string_edit = "host=localhost port=5432 dbname=iris_base user=radar password=dirac0";
$conn_string_admin = "host=localhost port=5432 dbname=iris_base user=postgres password=p0stgr3S";

$dns = "postgresql://radar:dirac0@localhost:5432/iris_base"; //permessi di scrittura su alcune tabelle config

//In maniera piu' elegante, ma che mi costringerebbe a modificare tutti gli script...:
//$config['root_dir'] = '/radar'; //nel caso in cui la ROOT del sistema sia diversa (ad es. reverseproxy)
$config['root_dir'] = '/devel'; //senza reverseproxy = ''
//$config['root_dir_ext'] = ''; //senza un REALE reverseproxy per la libreria Ext caricata da Minify che altrimenti non trova alcune immagini = '' - LO TOLGO DAL MINIFY per evitare problemi
$config['dbname'] = 'iris_base';
$config['dbuser'] = 'webgis';
$config['pwd'] = 'webgis$2013%';


/* VARIABILI DI DEFAULT */
//Questa sezione da attivare solo nel caso in cui sia stata definita la variabile $webgis_type ovvero se si e' gia' dentro il servizio:
if (!isset($webgis_type)) {
    //echo "Variabile webgis_type non definita, non recupero altre info dal DB.";
    return;
}

//Ogni servizio WebGis avra' poi le sue variabili definite da DB
$local_path = "/iris_base/";
$themes_path = "/common/tematismi";//percorso dei tematismi
$scripts_path = "/common/scripts";//percorso di altri script js
$nomelogo = $root_dir_html . "/common/icons/logo_ArpaPiemonte_transp.png";
$urllogo = "http://www.arpa.piemonte.gov.it/";
$map_path = "/var/www/html/common/mapfiles/"; //percorso dei file .map di mapserver
$url_tinyows = $root_dir_html . "/cgi-bin/tinyows"; //percorso eseguibile tinyows
$url_tinyows_sigeo = $root_dir_html . "/cgi-bin/tinyows110_pg96"; //percorso eseguibile tinyows
$titlelogo = "WebGis IRIS";
$id_logo_div = "logo";

$local_script = $webgis_type . '.js';

//Recupero da DB le impostazioni personalizzate del servizio:
$conn_config = pg_connect($conn_string);
if (!$conn_config) { // Check if valid connection
        $error_message = "Error Connecting to database";
        pg_close($conn_config);
        die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
}
else {
    //Faccio una prima query per recuperare alcune variabili sui percorsi specifici del servizio:
    $query_config = "SELECT local_path, themes_path, scripts_path, nomelogo, urllogo, map_path, url_tinyows, url_tinyows_sigeo, titlelogo, id_logo_div FROM config.webgis_indici WHERE webgis_name = '$webgis_type';";
    $result_config = pg_query($conn_config, $query_config);
    if (!$result_config) {
        $error_message = "Error on the query indice";
        pg_close($conn_config);
        die("<script>location.href = '" . $root_dir_html . "/error.html?error=". $error_message ."&root_dir_html=". $root_dir_html ."'</script>");
        //echo "<script>console.log('". $error_message ."')</script>";
        //exit;
    }
    else {
        //Recupero alcune impostazioni di base del servizio:
        $fetch_config = pg_fetch_array($result_config, 0); //prendo il primo record

        //Ridefinisco alcune variabili da DB dipendenti dal servizio:
        $local_path = $fetch_config['local_path'];
        $themes_path = $fetch_config['themes_path'];
        $scripts_path = $fetch_config['scripts_path'];
        $nomelogo = $root_dir_html . $fetch_config['nomelogo'];
        $urllogo = $fetch_config['urllogo'];
        $map_path = $fetch_config['map_path'];
        $url_tinyows = $root_dir_html . $fetch_config['url_tinyows'];
        $url_tinyows_sigeo = $root_dir_html . $fetch_config['url_tinyows_sigeo'];
        $titlelogo = $fetch_config['titlelogo'];
        $id_logo_div = $fetch_config['id_logo_div'];
    }
}
pg_close($conn_config);


/*THEMES to LOAD with MINIFY:*/
//WARNING: This funciton take all the .js files inside your $themes_path directory!
//WARNING: if you need some script to be called before the others, put its content in a function --> take a look at fn_style_vento_graphicname() for example

//print_r(__DIR__); ///var/www/IRIS_BASE/html/common
$theme_realpath = __DIR__ . '/../' . $themes_path;
$lista_js2load = preg_grep('~\.(js)$~', scandir( $theme_realpath )); //prelevo solo i file con estensione js
//aggiungo il percorso completo all'array:
foreach ($lista_js2load as &$value) {
        $value = $themes_path.'/'.$value;
}
unset($value);

//If you need to add customized javascript act as:
//array_push($lista_js2load, "javascript_web_path" . "/your_javascript_filename");

?>

