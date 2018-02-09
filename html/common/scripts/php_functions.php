<?php

//Get datetime of server:
date_default_timezone_set('UTC');
$timezone = date_default_timezone_get();
$datetime = date('d/m/Y H:i:s T', time());
echo $datetime;

?>
