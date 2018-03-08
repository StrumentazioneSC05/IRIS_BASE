<?php
/**
 * Groups configuration for default Minify implementation
 * @package Minify
 */

/** 
 * You may wish to use the Minify URI Builder app to suggest
 * changes. http://yourdomain/min/builder/
 *
 * See http://code.google.com/p/minify/wiki/CustomSource for other ideas
 **/


//Carico i javascript che servono per le tematizzazioni da un file esterno:
//require_once('theme_js_to_load.php');


return array(
    // 'js' => array('//js/file1.js', '//js/file2.js'),
    // 'css' => array('//css/file1.css', '//css/file2.css'),
    'js' => array('/var/www/IRIS_BASE/html/common/scripts/js_functions.js')
);
