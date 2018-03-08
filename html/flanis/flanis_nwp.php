<?php
if (isset($_GET["root_dir_html"])) {$root_dir_html = $_GET["root_dir_html"];}
if (isset($_GET["param"])) {$param = $_GET["param"];}

echo '<html><body><OBJECT classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" WIDTH="98%" HEIGHT="98%" id="FlAniS">';

echo '<PARAM NAME=movie VALUE="'.$root_dir_html.'/flanis/flanis.swf">';
echo '<PARAM NAME=quality VALUE="high"><PARAM NAME="menu" value="false">';
echo '<PARAM NAME="FlashVars" value="configFilename='.$root_dir_html.'/flanis/nwp/flanis_'.$param.'.cfg">';

echo '<EMBED src="'.$root_dir_html.'/flanis/flanis.swf" NAME="FlAniS" swLiveConnect="false" quality=high menu=false WIDTH="98%" HEIGHT="98%" TYPE="application/x-shockwave-flash" PLUGINSPAGE="http://www.macromedia.com/go/getflashplayer" scale="noscale" FlashVars="configFilename='.$root_dir_html.'/flanis/nwp/flanis_'.$param.'.cfg"></EMBED>';

echo '</OBJECT></body></html>';
