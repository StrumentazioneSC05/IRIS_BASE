//Contenuti per il pannello "TICKETS"
//Variabili richiamate dallo script "geoext_general.js", funzione "tickets_panel"

//Il contenuto di questo pannello lo prelevo con un php direttamente dal DB in Postgres:
var content_ticket0 = "<iframe width='100%' height=450px src='/common/scripts/tickets_open.php' seamless></iframe>";

//var content_ticket1 = "<iframe width='100%' height=450px src='meteo/tickets_close.php'></iframe>"; 

var content_ticket1st = '';
var content_ticket2nd = "<iframe width='100%' height=450px src='/common/scripts/tickets_edit.html' seamless></iframe>";
var content_ticket2 = content_ticket1st + content_ticket2nd;

