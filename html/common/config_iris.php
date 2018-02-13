<?php
//RICORDARSI DI AGGIORNARE DI CONSEGUENZA ANCHE /var/www/cgi-bin/config.py

$root_dir_html = '/devel'; //senza reverseproxy = ''
//$root_dir_html = '/radar'; //nel caso in cui la ROOT del sistema sia diversa (ad es. reverseproxy)
$root_dir_html_ext = ''; //senza un REALE reverseproxy per la libreria Ext caricata da Minify che altrimenti non trova alcune immagini = ''
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
$config['root_dir_ext'] = ''; //senza un REALE reverseproxy per la libreria Ext caricata da Minify che altrimenti non trova alcune immagini = ''
$config['dbname'] = 'iris_base';
$config['dbuser'] = 'webgis';
$config['pwd'] = 'webgis$2013%';

?>

