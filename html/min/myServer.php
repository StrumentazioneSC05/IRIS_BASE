<?php // myServer.php

/*
Non so ccome richiamarlo...
Cosi':
http://10.127.152.10/devel/min/myServer.php/?f=common/scripts/js_functions.js

da errore:
Class 'Minify_Controller_Files' not found
*/

/**
 * This script implements a Minify server for a single set of sources.
 * If you don't want '.php' in the URL, use mod_rewrite...
 */

// setup Minify
set_include_path('../min/lib' . PATH_SEPARATOR . get_include_path());
print get_include_path();

require 'Minify.php';
require 'Minify/Cache/File.php';
Minify::setCache(new Minify_Cache_File()); // guesses a temp directory

// setup sources
$sources = array();
$sources[] = '//common/scripts/browser_detect.js';
$sources[] = '//common/scripts/js_functions.js';

// setup serve options
$options = array(
    'files' => $sources,
    'maxAge' => 86400,
);

// handle request
Minify::serve('Files', $options);

