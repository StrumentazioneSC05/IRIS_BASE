/***************************************************************
* Name:        IRIS - Integrated Radar Information System
* Purpose:     WebGis System for Meteorological Monitoring
*
* Author:      Roberto Cremonini, Armando Gaeta, Rocco Pispico
* Email:       sistemi.previsionali@arpa.piemonte.it
*
* Created:     01/04/2016
* Licence:     EUPL 1.1 Arpa Piemonte 2016
***************************************************************/

/*
In questo script metto tutta la parte javascript che c'era in webgis_produzione.html cosi' minimizzo anche questa
*/

//Inizializziamo alcune variabili e funzioni generali:

//Per trasformare correttamente le coordinate. A quanto pare OL riconosce al volo solo 900913 e 4326.
//Gli altri SRID non li legge da locale, ma proj4js tenta di connettersi a http://spatialreference.org per recuperare la definizione della proiezione specificata, fallendo pero' al primo tentativo.
//Definendo queste proiezioni qui evita questo primo fallito-tentativo.
//In realta pare che legga le definizioni sotto common/defs...ma potrebbe essere un problema relativo alla cache del browser...
Proj4js.defs["epsg:23032"] = "+proj=utm +zone=32 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs"; //da QGis
Proj4js.defs["epsg:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
Proj4js.defs["epsg:3785"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["epsg:900913"]= "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";
//Proj4js.defs["epsg:3857"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["epsg:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"; //da QGis


/////////////// PERCORSI GENERALI ////////////////
//var urlMG = "/mapguide/mapagent/mapagent.fcgi";
//var local_meteo = "http://remotesensing.arpa.piemonte.it/webgis/meteo";

var urlMS_loc = root_dir_html+"/cgi-bin/mapserv"; //per i layers forniti come WMS

var urlMS_sismi; //definito in seguito in base al valore di "base_layers"
var urlMS_datidibase; //definito in seguito in base al valore di "base_layers"
var urlMS_realtime; //definito in seguito in base al valore di "base_layers"
var urlMS_spatialite; //definito in seguito in base al valore di "base_layers"
var urlMS_map; //definito in seguito in base al valore di "base_layers"
//var path_raster = map_path + "raster.map";//serve per caricare i raster come wms-tiff
//var path_meteo_wms = map_path + "meteo_wms.map";//serve per creare la legenda dei raster


//////////////// VARIABILI GENERALI ////////////////
var map, mapPanel, popup, legend, treeConfig, selectCtrl, multiSelectCtrl, select00, selectCtrlWMS, highlightLayerWMS;
var store_grid, columns_grid, view_grid, collapsed_grid, gridPanel;
var multiselect=false;
//definisco store e columns di default:
var store_default = new GeoExt.data.FeatureStore({
        fields: [
            {name: "codice_stazione", type: "string"},
            {name: "denominazione", type: "string"}
        ]
        });
var columns_default = new Ext.grid.ColumnModel({
    columns: [
        {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
        {header: "Codice stazione", dataIndex: "codice_stazione"}
    ]
});
var title_grid_default = "Nessuna griglia attributi attivata";

//creating source and destination Proj4js objects
var proj4326 = new Proj4js.Proj("epsg:4326"); //LatLon WGS84
var proj3785 = new Proj4js.Proj("epsg:3785"); //UTM Google 900913

var OL_4326 = new OpenLayers.Projection("epsg:4326");
var OL_900913 = new OpenLayers.Projection("epsg:900913");
var OL_23032 = new OpenLayers.Projection("epsg:23032");
var OL_32632 = new OpenLayers.Projection("epsg:32632");
var OL_3857 = new OpenLayers.Projection("epsg:3857");
var OL_3785 = OL_3857;
//var OL_3785 = new OpenLayers.Projection("epsg:3857");
//var OL_3875 = new OpenLayers.Projection("epsg:3875");

var aggiornamento_raster = 60000; //valore in millisecondi, 3 minuti
//Ext.BLANK_IMAGE_URL = "/ext-3.4.0/resources/images/default/s.gif";

//In modo tale da poter settare le dimensioni della mappa in % se si vuole...
//alert('Your resolution is '+screen.width+'x'+screen.height);
var screen_h = parseInt(screen.height);
var screen_w = parseInt(screen.width);
var height_map = Math.round(screen_h * 0.58);
var width_map = Math.round(screen_w * 0.78);

var now = new Date();
var currentTimeUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());


/////////////// RETRIEVE PARAMETERS FROM URL ////////////////
function gup(name)
{
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );
        if( results == null )
                return "";
        else
                return results[1];
}

//Recupero un'eventuale elenco di layer da visualizzare da subito per creare viste personalizzate:
var custom_list = "";
var custom_layers="";
custom_list = gup("custom_layers");
if (custom_list!="") { custom_layers = custom_list.split(","); }
//Setto una variabile se si vuole o meno attivare la query sui raster:
var query_raster = gup("query_raster"); //difatto e' definibile da DB in base al servizio..

//transforming point coordinates
var lon_center = gup("lon");
var lat_center = gup("lat");
var zoom_center = gup("zoom");
var legend_var = gup("legend");
var grid_var = gup("grid");
var base_layers = gup("base_layers");
var address = gup("address");
//Per arrotondare a 3 decimali, lon_center.toFixed(3), ma non e' supportato da tutti i browser...

if (lon_center == "" || lat_center == "" || zoom_center == "") {
	//non faccio niente, ormai scarico i dati da DB
	/*
	if (webgis.indexOf("expo2015") >= 0) {
        	lon_center = 9.10563;
        	lat_center = 45.51846; 
        	var x_center = 1013634;
        	var y_center = 5703510;
        	zoom_center = 10;
	}
	else {
        	lon_center = 7.5;
        	lat_center = 45;
        	var x_center = 950000;
        	var y_center = 5600000;
        	zoom_center = 8;
	}
	*/
}
//Nel caso in cui voglia ancora recuperare questi parametri da URL. Ricordati pero' che verranno sovrascritti da DB e dai cookie!
else {
        p1 = new Proj4js.Point(Math.round(lon_center*1000)/1000, Math.round(lat_center*1000)/1000);
        pp1 = Proj4js.transform(proj4326, proj3785, p1);
        var x_center = pp1.x;
        var y_center = pp1.y;
}

//Anche per le righe che seguono il tutto potrebbe essere sovrascritto da DB!
//Stabilisco un layer attivo di default per la legenda (nel caso del meteo per ora):
if (legend_var == "") {
        legend_var = 'legenda_ist';
}

//Stabilisco quali layer di base caricare.Se ZERO=classico, se UNO=wms_arpa:
if (base_layers == "" || base_layers == "0") {
        base_layers = 0;
        urlMS_sismi = urlMS_loc + "?MAP=" + map_path + "map900913.map";
	urlMS_datidibase = urlMS_loc + "?MAP=" + map_path + "map900913.map";
	urlMS_realtime = urlMS_loc + "?MAP=" + map_path + "map900913.map";
	urlMS_map = map_path + "map900913.map";
	//urlMS_spatialite = urlMS_loc + "?MAP=" + map_path + "spatialite.map";//not used at the moment
}
else {
        urlMS_sismi = urlMS_loc + "?MAP=" + map_path + "map32632.map";
	urlMS_datidibase = urlMS_loc + "?MAP=" + map_path + "map32632.map";
        urlMS_realtime = urlMS_loc + "?MAP=" + map_path + "map32632.map";
	urlMS_map = map_path + "map32632.map";
        //urlMS_spatialite = urlMS_loc + "?MAP=" + map_path + "spatialite.map";//not used at the moment
        var x_center = 500000;
        var y_center = 5000000;
        zoom_center = 3;
}


//Provo a mostrare una progress bar per il caricamento dei layer...NIENTE su Chrome
/*
function toggleLoadingPanel() {
        mapPanel.map.getControlsByClass('OpenLayers.Control.LoadingPanel')[0].toggle();
}
*/

//Carico gli script javascript per caricare i layer necessari:
//var src = "meteo/theme_layers_" + webgis + ".js";
//document.write("<script type='text/javascript' src=" + src +"><\/script>");


////////////////// GEOCODER di NOMINATIM-OPENSTREETMAP /////////////////
var markers = new OpenLayers.Layer.Markers("Markers");;
markers.id = "Markers";
var marker;
function get_address(pt_xy, pt_ln) {
        map.setCenter(pt_xy, 12);
	//Inserisco un marker:
	map.addLayer(markers);
	var size = new OpenLayers.Size(21,25);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon(root_dir_html+'/common/icons/marker.png', size, offset);
	var markerslayer = map.getLayer('Markers');
	if (marker !== null) markers.removeMarker(marker);
	marker = new OpenLayers.Marker(pt_xy,icon);
	marker.id = "seiqui";
	markerslayer.addMarker(marker);
	//markerslayer.addMarker(new OpenLayers.Marker(pt_xy,icon));
}

function get_latlon_nominatim(response) {
//codice originale da http://open.mapquestapi.com/media/js/samples/nominatim/exampleBasic.js
	var searched_address = document.getElementById("indirizzo_OSM").value;
	if (!response[0]) {alert(searched_address + ": corrispondenza non trovata. Provare ad inserire lo stato, o la provincia per intero");}
	else {
        var result = response[0]; //questo perche' ho richiesto solo UN risultato
        var lat_osm = result['lat'];
        var lon_osm = result['lon'];
        //alert(result.type + ' name: ' + result.display_name + ' result: ' + result['lat']);

        var point_latlon = new OpenLayers.LonLat(lon_osm, lat_osm);
        point_latlon.transform(OL_4326, OL_900913); //pare gia' nelle coord. giuste
        if (!point_latlon) {
            alert(address + " : non esiste!");
        }
        get_address(point_latlon, point_latlon); //in realta' il secondo termine non mi serve,ma ormai la funzione l'ho creata cosi'...
        } //fine dell'else che si avvia se si ha un risultato
};


var HOST_URL = 'https://nominatim.openstreetmap.org';
var EXAMPLE_BASIC = HOST_URL + '/search?format=json&json_callback=get_latlon_nominatim';


////////////////// ADD WMS FROM URL FUNCTION /////////////////
var wms_utente;
function add_wms_from_url(wms_layername, wms_url, wms_title) {
	//Ripulisco la mappa dall'ultima immagine se c'e':
	//if (wms_utente) {map.removeLayer(wms_utente);} //lo lasciamo, come in http://geoportail.biodiversite-nouvelle-aquitaine.fr/visualiseur/
	
        if((wms_url[wms_url.length-1] != '?') && (wms_url.search(/\?/) == -1) )  wms_url += '?';

	wms_utente = new OpenLayers.Layer.WMS(wms_layername+'<!--wmsutente-->', wms_url+'FORMAT=image/png&',
	//{layers: wms_title, transparent:true, version: '1.1.1'}, {isBaseLayer:false, singleTile:false});
	{layers:wms_title, transparent:true, format:"image/png"}, {displayInLayerSwitcher:true, projection:"EPSG:3857", opacity: 0.65});
	//, attribution:"<img src='icons/wms.png'/>" //aggiunge icona o scritta in basso a sinistra sulla mappa, utile ad esempio per i copyright
	//Per far caricare la legenda ai WMS "normali" devo usare la versione 1.1.1
	//wms_utente.projection = OL_3857;
	
	map.addLayer(wms_utente);
        //map.setLayerIndex(wms_utente, 0);

	//A questo punto aggiungiamo il layer ad una cartella nella TOC dei layer, verificando prima che questa cartella non esista gia:
	node_wmsutente = {nodeType: "gx_layercontainer", text: "WMS utente", expanded: true, isLeaf: false, leaf: false, loader: { baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"}, filter: function(record) {return record.get("layer").name.indexOf("wmsutente") !== -1}}};
	tree_radice = layerTree.root;
	group_gia_esistente=0;
	bimbi = tree_radice.childNodes.length;
	for (i=0; i<bimbi; i++) {
	  if (tree_radice.childNodes[i].text=="WMS utente") group_gia_esistente=1;
	}
	if (group_gia_esistente==0) tree_radice.appendChild(node_wmsutente);
	//SVILUPPO: provare ad inserire questo nuovo gruppo di layer in testa invece che al fondo della TOC
	//al momento l'unica soluzione potrebbe essere quella di agiungere il gruppo nella tabella config.webgis_groups o comunque caricarlo di default nel treeConfig

	
	//Proviamo a far caricare questa cazzo di legenda per i WMS Arpa - YES! - ma non mi serve basta specificare le opzioni corrette in GeoExt-legendPanel...!
	/*legendID = "ext-comp-1006-" + wms_utente.id; //Il prefisso dell'id del campo della legenda pare sia sempre "ext-comp-1006-"
	legendsURL = wms_url+'&service=WMS&version=1.1.1&REQUEST=GetLegendGraphic&format='+wms_utente.params.FORMAT+'&layer='+encodeURIComponent(wms_utente.params.LAYERS);
	legendsURL_attuale = $("#"+legendID+" img").attr('src');
	if (legendsURL_attuale.indexOf('image/gif') != -1){
	    console.log("trovata probabile anomalia nella stringa dell'immagine legenda");
	    $("#"+legendID+" img").attr('src', legendsURL);
	}*/
}



