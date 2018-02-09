//Definizione di vari contenuti per i pannelli della TOOLBAR, come "INFO", "ANIMAZIONE", etc
//Variabili richiamate dallo script "toolbar_tools.js", funzione "info_panel"

//Il tab sulle anomalie RADAR: il contenuto di questo pannello lo prelevo con un php direttamente dal DB in Postgres:
var content_panel0 = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/anomalie_pgquery.php?webgis="+webgis+"' seamless='seamless'><p>Your browser does not support iframes.</p></iframe>";

//Alcuni elementi di help:
var content_panel1 = help_tab;

//Il tab dei Crediti:
var content_panel2 = credit_tab;

//  SEZIONE EXPO  //
var content_panel_expo1 = help_tab_expo;
var content_panel_expo2 = credit_tab_expo;

//  SEZIONE TFP  //
var content_panel_tfp = help_tab_tfp;

//Il tab dell'asta del Po:
var content_panel5 = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/po.html' seamless='seamless' scrolling='yes'><p>Your browser does not support iframes.</p></iframe>";

//Il tab dell'asta del Tanaro:
var content_panel6 = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/tanaro.html' seamless='seamless' scrolling='yes'><p>Your browser does not support iframes.</p></iframe>";

//Loghi e autori del WebGIS:
var content_3a = '<p style="text-align:center"><img src="meteo/img/loghi_webgis.png" alt="loghi" align=center></p>';
var content_3b = '<p style="text-align:justify;font-family:arial;color:black;font-size:14px;line-height: 20px;"><br/><b>Autori:</b><br/>R. Bechini*<br/>V. Campana*<br/>R. Cremonini*<br/>A.R. Gaeta*<br/>F. Marco**<br/>R. Pispico**<br/>D. Tiranti*<br/></p><br/><p font-size:13px>* ARPA Piemonte, Dipartimento Sistemi Previsionali, Torino.<br/>** ARPA Piemonte, Dipartimento Geologia e Dissesto, Torino.</p>';
var content_3c = '<p style="text-align:center"><a target="_blank" href="http://www.paramount-project.eu"><img style="margin-left:5px;margin-right:45px;" width="10%" src="meteo/img/paramount_72.png" alt="paramount" align=center></a><a target="_blank" href="http://remotesensing.arpa.piemonte.it/joomla/"><img width="35%" src="meteo/img/logo_cristal.png" alt="cristal" align=center></a><a target="_blank" href="http://www.alpine-space.eu/"><img width="20%" src="meteo/img/alpine_space.png" alt="alpinespace" align=center></a></p>';
var content_panel3 = content_3a + content_3b + content_3c;

var content_panel_anime= "<iframe width='100%' height=450px src='"+root_dir_html+"/common/scripts/anime_panel.php?webgis="+webgis+"&root_dir_html="+root_dir_html+"' seamless></iframe>";


//Contenuti per il pannello "TICKETS"
//Variabili richiamate dallo script "toolbar_tools.js", funzione "tickets_panel"

//Il contenuto di questo pannello lo prelevo con un php direttamente dal DB in Postgres:
var content_ticket0 = "<iframe width='100%' height=450px src='"+root_dir_html+"/common/scripts/tickets_open.php?root_dir_html="+root_dir_html+"' seamless></iframe>";

//var content_ticket1 = "<iframe width='100%' height=450px src='meteo/tickets_close.php'></iframe>";

var content_ticket1st = '';
var content_ticket2nd = "<iframe width='100%' height=450px src='"+root_dir_html+"/common/scripts/tickets_edit.html?root_dir_html="+root_dir_html+"' seamless></iframe>";
var content_ticket2 = content_ticket1st + content_ticket2nd;

//SEZIONE COOKIE gestione impostazioni cliente:
var cookie_map = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/cookie_settings.php?code=map&root_dir_html="+root_dir_html+"&TYPE="+webgis+"&devel="+devel+"' seamless='seamless' scrolling='yes'><p>Your browser does not support iframes.</p></iframe>";

var cookie_layers = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/cookie_settings.php?code=layers&root_dir_html="+root_dir_html+"&TYPE="+webgis+"&devel="+devel+"' seamless='seamless' scrolling='yes'><p>Your browser does not support iframes.</p></iframe>";

var cookie_baselayers = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/cookie_settings.php?code=baselayers&root_dir_html="+root_dir_html+"&TYPE="+webgis+"&devel="+devel+"' seamless='seamless' scrolling='yes'><p>Your browser does not support iframes.</p></iframe>";

var cookie_warning = "<iframe width='100%' height='100%' src='"+root_dir_html+"/common/scripts/cookie_settings.php?code=warning&root_dir_html="+root_dir_html+"&TYPE="+webgis+"&devel="+devel+"' seamless='seamless' scrolling='yes'><p>Your browser does not support iframes.</p></iframe>";

