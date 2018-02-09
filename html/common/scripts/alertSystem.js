/*
 *
 * VARIE FUNZIONI PER ABILITARE IL SISTEMA DI ALLERTA STORM-METEO:
 *
 */

var ellipse_centroid; //coordinate del centroide dello storm indicato nella alert
//Funzione jquery per aprire finestra modale invece della classica alert:
$(function () {
    $( "#dialog-message" ).dialog({
      modal: true,
      width: 500,
      autoOpen: false,
      dialogClass: 'ui-dialog-alert', //per personalizzare tramite css la finestra
      show: 'fade',
      buttons: {
        'chiudi': function() {
          $( this ).dialog( "close" );
	  if (! $("#ansa-message").dialog("isOpen")) setTimeout("listCheck();", 500);
        }
      }
    });
});

var closed_from_user = 0;
$(function () {
    $( "#ansa-message" ).dialog({
      modal: false,
      width: 250,
      maxHeight: 300,
      autoOpen: false,
      dialogClass: 'ui-dialog-list', //per personalzizare tramite css la finestra
      draggable: true,
      resizable: false,
      position: ['left', 'bottom'],
      show: { effect: "bounce", duration: 1500 },
      hide: 'blind',
      close: function( event, ui ) { closed_from_user=1;}
    });
});

function setCenterOnEllipse(utmx, utmy) {
	ellipse_centroid = new OpenLayers.LonLat(utmx, utmy);
        ellipse_centroid = ellipse_centroid.transform(OL_23032, OL_900913);
	map.setCenter(ellipse_centroid);
}

var maxsi, maxsi_str, maxsi_str0, distance, direction, velocita, place, position, lastime, utmx, utmy, avv;
function getValueJson(response_list) {
    maxsi = response_list['si'];
    maxsi_str = response_list['si_str_it'];
    if (maxsi_str) maxsi_str0 = maxsi_str.replace(/\s+/g, ''); //elimino spazi contigui..nn ricordo perche' ma probabile desse qlke errore
    distance = response_list['distance'];
    direction = response_list['direction'];
    velocita = response_list['vv'];
    place = response_list['localita'];
    position = response_list['posizione'];
    lastime = response_list['dataora'];
    utmx = response_list['utmx'];
    utmy = response_list['utmy'];
    avv = response_list['avv'];
}

function alertCheck() {
    if (devel==1) var url_alert=root_dir_html+'/cgi-bin/app/storm/cells_test_webgis?progetto=debug';
    else var url_alert=root_dir_html+'/cgi-bin/app/storm/cells_test_webgis?progetto=produzione';
    $.ajax({
	url: url_alert,
        type: 'GET',
	//async: false,
        data: { lat: area_lat, lon: area_lon, radius: area_radius, alert: area_alert, list: 0 } ,
        //contentType: 'Content-Type: text/plain; charset=utf-8',
	contentType: "application/json",
        //dataType:'text',
	dataType: "json",
        success: function (response) {
		if (response!=0) {
                    getValueJson(response[0])
		    var alert_text = "<p><center><img src='"+root_dir_html+"/common/icons/storm_"+maxsi_str0+".svg' alt='warning_storm' height='64' width='64'></center>Temporale  " + maxsi_str + " nel comune di " + place + "<br/> a "+distance+"km in direzione " + position + " rispetto a " + area_nome;
		    if (velocita<0) alert_text += "<br/>Spostamento: n.d.";
		    else alert_text += "<br/>Spostamento: verso "+direction+" a "+velocita+" km/h " + avv;
		    alert_text += "<br/><span style='font-size: 0.65em; font-style: italic;'>ora rilevamento: <a href='javascript:setCenterOnEllipse("+utmx+","+utmy+");'>"+ lastime + "</a></span>";
		    alert_text += '<audio id="alert_beep" autoplay="autoplay" style="display:none;" src="beep.wav" controls preload="auto" autobuffer></audio>';
		    //console.log(alert_text);
		    $("#dialog-message").html(alert_text);
		    $(function () {
			$("#dialog-message").dialog('open');
			return false;
		    });
		    repeatAlert(900); //lascio la funzione di controllo latente per 15'
		}
		else {
		    if (! $("#ansa-message").dialog("isOpen")) setTimeout("listCheck();", 500);
		    console.log('nessun temporale in arrivo');
		    repeatAlert(area_time); //controllo ogni X' un nuovo temporale in arrivo
		}
        },
        error: function () {
                console.log("Error on server or alert system not activate");
        }
    });
}

function listCheck() {
    if (closed_from_user==1) return false;
    if (devel==1) var url_alert=root_dir_html+'/cgi-bin/app/storm/cells_test_webgis?progetto=debug';
    else var url_alert=root_dir_html+'/cgi-bin/app/storm/cells_test_webgis?progetto=produzione';
    $.ajax({
        url: url_alert,
        type: 'GET',
        //async: false,
        data: { lat: area_lat, lon: area_lon, radius: area_radius, alert: area_alert, list: 1 } ,
        //contentType: 'Content-Type: text/plain; charset=utf-8',
        contentType: "application/json",
        //dataType:'text',
        dataType: "json",
        success: function (response) {
	  if (response!=0) {
	    var alert_text = "";
	    var i = 0
	    for(i; i < response.length; i++) {
                getValueJson(response[i])
		    alert_text += '<p style="font-size:0.8em;"><span class="ui-state-default"><span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 0 0;"></span></span>';
                    alert_text += "Temporale  " + maxsi_str + " nel comune di " + place + "<br/> a "+distance+"km in direzione " + position + " rispetto a " + area_nome;
                    if (velocita<0) alert_text += "<br/>Spostamento: n.d.";
                    else alert_text += "<br/>Spostamento: verso "+direction+" a "+velocita+" km/h " + avv;
                    alert_text += "<br/><span style='font-size: 0.65em; font-style: italic;'>ora rilevamento: <a href='javascript:setCenterOnEllipse("+utmx+","+utmy+");'>"+ lastime + "</a></span><p>";
	    } //fine del ciclo FOR per prendere tutti i temporali dati dal JSON
	    //$('#ansa-message').hide().html(alert_text).fadeIn(1200);
            $(function () {
              if (closed_from_user==0) {
		$('#ansa-message').hide().html(alert_text).fadeIn(1200);
		$("#ansa-message").dialog('open');
	      }
              return false;
            });
            repeatList(area_time); //lascio la funzione di controllo latente per X'
	  } //fine dell'IF se e' presnete qualche temporale
          else {
		var alert_text = '<p style="font-size:0.8em;"><span class="ui-state-default"><span class="ui-icon ui-icon-info" style="float:left; margin:0 7px 0 0;"></span></span>';
		alert_text += "Nessun temporale presente entro "+area_radius+"km da "+area_nome;
		//$('#ansa-message').hide().html(alert_text).fadeIn(1200);
                $(function () {
                        if (closed_from_user==0) {
			    $('#ansa-message').hide().html(alert_text).fadeIn(1200);
			    $("#ansa-message").dialog('open');
			}
                        return false;
                });
                //console.log('nessun temporale in arrivo');
                repeatList(area_time); //controllo ogni 5' un nuovo temporale in arrivo
          }
        },
        error: function () {
                console.log("Error on server or alert system not activate");
        }
    });
}

function repeatAlert(alertTime) {
    setTimeout("alertCheck();", alertTime*1000);
}

function repeatList(alertTime) {
    setTimeout("listCheck();", alertTime*1000);
}

if (alert_system==1 || devel==1) {
  setTimeout("alertCheck();", 5000);
}



