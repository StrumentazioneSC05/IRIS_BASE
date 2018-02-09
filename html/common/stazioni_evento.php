<?php
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

if (isset($_GET['root_dir_html'])) $root_dir_html = $_GET['root_dir_html'];
?>

<html>
<head>        

<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE6" />
<meta name="Author" content="Armando Riccardo Gaeta">
<meta name="Email" content="ar_gaeta@yahoo.it">
<meta name="Subject" content="Sismica">
<meta name="Description" content="Visualizza le stazioni considerate per il calcolo della magnitudo del sisma">

<?php
$jquery_css = '<link rel="stylesheet" href="'.$root_dir_html.'/ext-3.4.0/resources/css/ext-all.css">';
$jquery_css .= '<link rel="stylesheet" href="'.$root_dir_html.'/GeoExt/resources/css/geoext-all-debug.css">';
$jquery_css .= '<link rel="stylesheet" href="'.$root_dir_html.'/OpenLayers-2.12/theme/default/style.css">';
$jquery_css .= '<link rel="stylesheet" href="'.$root_dir_html.'/jQuery/jquery-ui.css">';
echo $jquery_css;

$script_js = '<script type="text/javascript" src="'.$root_dir_html.'/ext-3.4.0/adapter/ext/ext-base.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/ext-3.4.0/ext-all.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/OpenLayers-2.12/OpenLayers.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/GeoExt/script/GeoExt.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/proj4js-combined.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/common/OpenStreetMap.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-1.10.2.js"></script>';
$script_js .= '<script type="text/javascript" src="'.$root_dir_html.'/jQuery/jquery-ui.js"></script>';
echo $script_js;
?>

<script>
$(function() {
        $("#tabs").tabs();
});
</script>


<script type="text/javascript">
var root_dir_html = "<?php echo $root_dir_html; ?>";

/* Alcune variabili d'ambiente: */
var map;
var urlMS_sismi = root_dir_html + "/cgi-bin/mapserv?map=/var/www/html/common/mapfiles/map900913.map";
var screen_h = parseInt(screen.height);
var screen_w = parseInt(screen.width);
var height_map = Math.round(screen_h * 0.5);
var width_map = Math.round(screen_w * 0.7);


//Per recuperare parametri dall'url:
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

//creating source and destination Proj4js objects
var source = new Proj4js.Proj("epsg:4326"); //LatLon WGS84
var dest = new Proj4js.Proj("epsg:3785"); //UTM Google 900913
//transforming point coordinates
var lon_center = gup("lon");
var lat_center = gup("lat");
var ndb_code = gup("ndb");
var magnitudo = gup("magnitudo");
var data = gup("data");
var ora = gup("ora");
var tipo_elab = gup("tipo");

if (lon_center == "" || lat_center == "") {
var lon_center = 7.5;
var lat_center = 45;
var x_center = 950000;
var y_center = 5600000;
}
else {
p1 = new Proj4js.Point(Math.round(lon_center*1000)/1000, Math.round(lat_center*1000)/1000);
pp1 = Proj4js.transform(source, dest, p1);
var x_center = pp1.x;
var y_center = pp1.y;
}

//var waveform = "http://www.dipteris.unige.it/home/sismo/ARCHIVIO/AUTO/";
var waveform = "http://www.distav.unige.it/home/sismo/ARCHIVIO/AUTO/";

function popup_waveform() {
        //window.open(waveform+ndb_code+"/"+ndb_code+".jpg?", ndb_code, "status = 1, height = 612, width = 792, resizable = 0");
	window.open(waveform+ndb_code.substr(0,2)+"/"+ndb_code.substr(2,2)+"/"+ndb_code+"/"+ndb_code+".jpg?", ndb_code, "status = 1, height = 612, width = 792, resizable = 0");
}

document.write("<title>Rapporto evento e stazioni registranti il sisma " + ndb_code + " - " + data + " " + ora + " UTC</title>");

//document.write("<center><table><tr><td align=center><font size=+1><b>Tempo di origine (UTC): " + data + " " + ora + "</b></font></td></tr></table>");

//Proviamo ad inserire queste informazioni in un TAB:
document.write("<div id='tabs'>");
document.write("<ul><li><a href='#tabs-1'>Sisma</a></li><li><a href='#tabs-2'>Effetti</a></li></ul>");
document.write("<div id='tabs-1'>");

document.write("<div id='map'></div><center><table><tr><td><hr color='gray' width='70%'></tr><tr><td>Lat " + lat_center + "; Lon " + lon_center + "</tr><p></table></center>");

//document.write("<center><form action="+waveform+ndb_code+"/"+ndb_code+".jpg? target='_blank'><button type='submit'>Forme d'onda</button></form></center>");

document.write("<center><form><input type='button' onClick='popup_waveform()' value='Waveforms'></form></center>");

//Aggiungo iframe o link al sito di Genova:
//var iframe = "http://10.127.141.100/sismica/dat/xml/events/" + ndb_code + ".man.xml";
if (tipo_elab == "MANUAL") var iframe = "http://www.dipteris.unige.it/geofisica/pg-manual-loca.php?var1=" + ndb_code;
else var iframe = "http://www.dipteris.unige.it/geofisica/pg-auto-loca.php?var1=" + ndb_code;
//document.write("<iframe src='" + iframe + "' width='99%' height=600px scrolling='yes'></iframe>");
document.write("<br/><center><a href='" + iframe + "' target='_blank'>Link alla pagina sul sisma del DISTAV di Genova</a></center>");

document.write("</div>"); //fine del div tabs-1

//Adesso inseriamo il TAB con gli effetti attesi del sisma, e dunque altra mappa con mappa delle PGV o delle intensita MM, e lista comuni coinvolti e somma totale della popolazione:
document.write("<div id='tabs-2'>");
document.write("<div id='map_effetti'><center><img src='"+root_dir_html+"/common/icons/page-under-construction1.jpg' alt='Smiley face' width='65%'></center></div>");
document.write("</div>"); //fine del div tabs-2

//Chiudiamo i TABS:
document.write("</div>"); //fine del div tabs principale

/*
<div id="map" style="width: 700px; height: 500px;" align=center></div>
*/


document.namespaces; //altrimenti IE da errore...
	
Ext.onReady(function() {
	
	Ext.QuickTips.init();
	
	var options = {
		projection: new OpenLayers.Projection("epsg:900913"),
		units: "m",
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(600000,5000000,1600000,6100000),
		tileSize: new OpenLayers.Size(256, 256)
	};
		
	map = new OpenLayers.Map('map', options);

	var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap");
	
	
	/*STAZIONI SISMICHE*/
	var style_sism_staz = new OpenLayers.Style({
		title: "Stazioni", pointRadius: 6, graphicName: "triangle", fillColor: "gray", fillOpacity: 0.5,  strokeColor:"black", strokeWidth: 1});
	var styleMap_sism_staz = new OpenLayers.StyleMap({"default": style_sism_staz});
	var sism_staz = new OpenLayers.Layer.Vector("Stazioni sismiche", {
        	styleMap: styleMap_sism_staz,
        	strategies: [new OpenLayers.Strategy.Fixed()],
        	protocol: new OpenLayers.Protocol.WFS({
        		url: urlMS_sismi,
			//version: "1.1.0",
			featureType: "sism_staz",
			featureNS: "http://mapserver.gis.umn.edu/mapserver",
			extractAttributes: true, extractStyles: true,
			geometry: "msGeometry", srsName: "epsg:32632", geometryName: "the_geom"
        	})
	});

        /*SHAKEMAP - PGV*/
        var style_poly_pgv = new OpenLayers.Style({
                title: "PGV", fillColor: "gray", fillOpacity: 0.5,  strokeColor:"black", strokeWidth: 1});
        var styleMap_poly_pgv = new OpenLayers.StyleMap({"default": style_poly_pgv});
	var filter_pgv = new OpenLayers.Filter.Comparison({
        	type: OpenLayers.Filter.Comparison.LIKE,
                property: "id_sisma", value: ndb_code
	});
        var poly_pgv = new OpenLayers.Layer.Vector("Shakemap - PGV", {
                styleMap: styleMap_poly_pgv,
                strategies: [new OpenLayers.Strategy.Fixed()],
		//filter: filter_pgv,
                protocol: new OpenLayers.Protocol.WFS({
                        url: urlMS_sismi,
                        //version: "1.1.0",
                        featureType: "poly_pgv",
                        featureNS: "http://mapserver.gis.umn.edu/mapserver",
                        extractAttributes: true, extractStyles: true,
                        geometry: "msGeometry", srsName: "epsg:4326", geometryName: "the_geom"
                })
        });
	
	
	/*STAZIONI EVENTO SISMICO LAST 15gg*/
	var style_sism_eve_staz = new OpenLayers.Style({
	        title: "Stazioni evento sismico", pointRadius: 8, graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.8, strokeColor:"black", strokeWidth: 1});
	var label_staz = new OpenLayers.Rule({
	        title: "Etichette stazioni RSNI",
		symbolizer: {label: "${codice_stazione_rapporto}", labelAlign: "lm", fontSize: "13px", fontColor: 'black', fontWeight: "bold", labelXOffset: 5, fontFamily: 'Arial'}
	});
	style_sism_eve_staz.addRules([label_staz]);
	var styleMap_sism_eve_staz = new OpenLayers.StyleMap({"default": style_sism_eve_staz});	
	var myfilter = new OpenLayers.Filter.Logical({
        	type: OpenLayers.Filter.Logical.AND,
        	filters: [new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.LIKE,
				property: "ndb", value: ndb_code}),
			new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.LIKE,
				property: "id_evento_sismico", value: ndb_code})
		]
	});
	var sism_eve_staz = new OpenLayers.Layer.Vector("Sismicita' strumentale - ultimi 15 giorni", {
		styleMap: styleMap_sism_eve_staz,
		strategies: [new OpenLayers.Strategy.Fixed()],
		filter: myfilter,
		protocol: new OpenLayers.Protocol.WFS({
			url: urlMS_sismi,
			//version: "1.1.0", //a quanto pare specificando la versione sballa il filtro!!
			featureType: "sism_ev_staz_last15",
			featureNS: "http://mapserver.gis.umn.edu/mapserver",
			geometry: "msGeometry", srsName: "epsg:32632", geometryName: "the_geom"
		})
	});
	var store_sism_eve_staz = new GeoExt.data.FeatureStore({
		fields: [
	        {name: "ndb", type: "string"},// direction: 'DESC'},
        	{name: "codice_istat_comune", type: "string"},
	        {name: "prog_punto_com", type: "integer"},
        	{name: "codice_stazione_rapporto", type: "string"},
        	{name: "distanza", type: "float"},
	        {name: "azimut", type: "float"},
        	{name: "p_data_arrivo", type: "string"},
		{name: "p_orario_arrivo", type: "string"},
		{name: "p_res", type: "float"},
		{name: "pwt", type: "integer"},
		{name: "phwt", type: "float"},
		{name: "s_data_arrivo", type: "string"},
        	{name: "s_orario_arrivo", type: "string"},
		{name: "s_res", type: "float"},
                {name: "swt", type: "integer"},
                {name: "shwt", type: "float"},
		{name: "mag_wa", type: "float"},
		{name: "amp_wa", type: "float"},
		{name: "pga_z", type: "float"},
        	{name: "pga_n", type: "float"},
		{name: "pga_e", type: "float"},
		{name: "pgv_z", type: "float"},
		{name: "pgv_n", type: "float"},
		{name: "pgv_e", type: "float"}
	],
        layer: sism_eve_staz
	});
	store_sism_eve_staz.on('load', function(store){
                store.sort('distanza', 'ASC');
        });

	
	/*MARKER: lo uso per plottare il sisma */
	var markers = new OpenLayers.Layer.Markers("Marker");	
	markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(x_center, y_center)));
	//map.addLayers([markers]);
	
	var mapPanel = new GeoExt.MapPanel({
        //title: "Map",
        region: "center",
		layers: [osmLayer, sism_staz, sism_eve_staz, markers],
		map: map,
		center: [x_center, y_center], //Per OpenStreetMap
        zoom: 8
    });	
	
	gridPanel = new Ext.grid.GridPanel({
		xtype : 'grid', //a cosa serve?
		title: "Elenco delle stazioni che hanno registrato il sisma",
		region: "south",
		//stripeRows: true,
		columnLines: true,
		//renderTo: "features",
		viewConfig: {forceFit: true},
		store: store_sism_eve_staz,
		loadMask: true, //a cosa serve?
		//width: Math.round(screen_w*0.98), //600
		height: Math.round(height_map*0.4), //280
		autoScroll: true,
		collapsible: true,
		collapsed: false,
		//sm: new GeoExt.grid.FeatureSelectionModel(), //per sincronizzare grid e features
		cm: new Ext.grid.ColumnModel({
			defaults: {
				sortable: false
			},					
			columns: [
				{header: "<b>Stazione</b>", dataIndex: "codice_stazione_rapporto"},
				{header: "Distanza [km]", dataIndex: "distanza", decimalPrecision: 2, align: "center"},
				{header: "Azimut [&deg;]", dataIndex: "azimut", decimalPrecision: 3, align: "center"},
				{header: "p_data_arrivo", dataIndex: "p_data_arrivo", align: "center"},
				{header: "p_orario_arrivo", dataIndex: "p_orario_arrivo"},
				{header: "residui P [ms]", dataIndex: "p_res"},
				//{header: "peso pick. P", dataIndex: "pwt"},
				//{header: "peso hypo P", dataIndex: "phwt"},
				{header: "s_data_arrivo", dataIndex: "s_data_arrivo",  align: "center"},
				{header: "s_orario_arrivo", dataIndex: "s_orario_arrivo", align: "center"},
				{header: "residui S [ms]", dataIndex: "s_res"},
				{header: "Mag. WA", dataIndex: "mag_wa"},
				{header: "Amp. WA", dataIndex: "amp_wa"}
                                //{header: "peso pick. S", dataIndex: "swt"},
                                //{header: "peso hypo S", dataIndex: "shwt"},
			]
        })
        //,autoLoad: true //se true anche se il layer non e' sulla mappa viene caricato
    });	
	
    new Ext.Panel({
        //renderTo: document.body,
	renderTo: 'map',
        width: 850,
        height: 600,
        layout: "border",
	items: [gridPanel, mapPanel]
    });			
			
			
    });
        
</script>
		
    </head>
    
	<body>

    </body>
	
	
</html>
