/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


////////////////////////// LAYER STORM-WMS: ///////////////////
//ricordarsi la possibilita' dell'opzione 'opacity: 0.6', e format: 'image/png'....


/*
var layer_storm = new OpenLayers.Layer.WMS("Storm-3h", urlMS_loc,
	{map: path_meteo_wms, layers:"storm3h", isBaseLayer:false, sphericalMercator:true, transparent: true, singleTile: false, transitionEffect: 'resize'});
layer_storm.setVisibility(true);

//Il servizio WMS e' piu' veloce rispetto al WFS,ma nn permette di interrogare i dati facilmente!!!
//Questo lo uso solo per creare la legenda! Come fare per non farlo visualizzare nel menu?
var rain_ist_wms = new OpenLayers.Layer.WMS("Legenda pioggia:ist,1h,mosaico*", urlMS_loc,
	{map: path_meteo_wms, layers:"rain_shp-legend", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
rain_ist_wms.setVisibility(true);
//rain_ist_wms.setDisplayInLayerSwitcher(false);
//rain_ist_wms.setOpacity(0.5);

var rain_ist_wms2 = new OpenLayers.Layer.WMS("Legenda pioggia:3h*", urlMS_loc,
	{map: path_meteo_wms, layers:"rain_shp-legend2", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
rain_ist_wms2.setVisibility(false);

var rain_ist_wms3 = new OpenLayers.Layer.WMS("Legenda pioggia:ieri-oggi*", urlMS_loc,
        {map: path_meteo_wms, layers:"rain_shp-legend3", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
rain_ist_wms3.setVisibility(false);

var rain_ist_wms4 = new OpenLayers.Layer.WMS("Legenda pioggia-neve*", urlMS_loc,
        {map: path_meteo_wms, layers:"rain_shp-legend4", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
rain_ist_wms4.setVisibility(false);
 
//servizi raster WMS da MapServer-esempi non usati in questa mappa poiche' lenti:
var raster_ist = new OpenLayers.Layer.WMS("Istantanea", urlMS_loc,
	{map: path_raster, layers:"rain_ist", isBaseLayer:false, sphericalMercator:true, transparent: true, singleTile: false, transitionEffect: 'resize'});
raster_ist.setVisibility(false);	

var googlemap_ist = new OpenLayers.Layer.WMS("Istantanea - WMS test", urlMS_loc,
        {map: path_raster, layers:"googlemap_ist", isBaseLayer:false, sphericalMercator:true, transparent: true, singleTile: false, transitionEffect: 'resize'});
googlemap_ist.setVisibility(false);
*/


var url_PAI_reg = "http://geomap.reteunitaria.piemonte.it/ws/vtdifsuolo/rp-01/disspaiwms/wms_vtdifsuolo_dissesti_pai?";
var PAI_reg = new OpenLayers.Layer.WMS(default_layer_name, url_PAI_reg,
        {layers:"DissestiPAI", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
PAI_reg.setVisibility(false);

var url_AMM_reg = "http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimslimammwms/wms_limitiAmm?";
var AMM_reg = new OpenLayers.Layer.WMS(default_layer_name, url_AMM_reg,
        {layers:"LimitiComunali", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
AMM_reg.setVisibility(false);

//var url_valanghe_arpa = "http://webgis.arpa.piemonte.it/ags101free/services/geologia_e_dissesto/Valanghe_10000_siva/MapServer/WMSServer";
var url_valanghe_arpa = "http://webgis.arpa.piemonte.it/ags101free/services/geologia_e_dissesto/SIVA/MapServer/WMSServer";
var valanghe_wms = new OpenLayers.Layer.WMS(default_layer_name, url_valanghe_arpa,
        //{layers:"Aree indagate dal SIVa,Opere di difesa,Informazioni storiche,Valanghe da fotointerpretazione,Zone pericolose,Pericolo localizzato,Valanghe con dati associati"
	{layers: "OPERE di DIFESA,Valanghe documentate,Valanghe non documentate,PERICOLO LOCALIZZATO,ZONE PERICOLOSE,Valanghe da modello e verifiche,Valanghe solo da modello,Segnalazioni valanghe non cartografabili,Valanghe nel cuneese da Archivio Storico Topografico Valanghe ,Macroaree ed Enti proprietari,Comuni"
	, transparent:true, format: "image/png"}
	,{isBaseLayer:false, singleTile:false});
valanghe_wms.setVisibility(false);
valanghe_wms.projection = OL_3857;

var url_fasce_fluv = "http://geomap.reteunitaria.piemonte.it/ws/vtdifsuolo/rp-01/fascpaiwms/wms_vtdifsuolo_fasce_fluviali?";
var fasce_fluv_wms = new OpenLayers.Layer.WMS(default_layer_name, url_fasce_fluv,
        {layers:"FasceFluvialiAreali", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
fasce_fluv_wms.setVisibility(false);
fasce_fluv_wms.projection = OL_3857;

var url_mappe_alluvioni = "http://osgis2.csi.it/qgs/qgis_cloud/direttiva_alluvioni?"
var mappe_alluvioni_wms = new OpenLayers.Layer.WMS(default_layer_name, url_mappe_alluvioni,
        {layers:"Scenari di alluvioni - Pericolosita' - 2015", format:'image/png', transparent: true, version: '1.3.0'}
	,{isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
mappe_alluvioni_wms.setVisibility(false);
mappe_alluvioni_wms.projection = OL_3785;

var url_idrografia = "http://geomap.reteunitaria.piemonte.it/ws/taims/rp-01/taimsidrowms/wms_idro?";
var idrografia_reg = new OpenLayers.Layer.WMS(default_layer_name, url_idrografia,
        {layers:"Idrografia", transparent: true, isBaseLayer:false, singleTile: false, displayInLayerSwitcher: false});
idrografia_reg.setVisibility(false);

var url_sifrap = "http://webgis.arpa.piemonte.it/ags101free/services/geologia_e_dissesto/SIFRAP_SI_Frane_Piemonte/MapServer/WMSServer?";
var sifrap_reg = new OpenLayers.Layer.WMS(default_layer_name, url_sifrap,
        {layers:"Frane puntuali,Frane lineari,Frane superficiali lineari,El morf - Puntuali,El morf - Lineari,El morf - Poligonali,Frane superficiali poligonali,Frane areali",
		transparent: true, isBaseLayer:false, displayInLayerSwitcher: false}, {opacity: 0.6, singleTile: false});
sifrap_reg.setVisibility(false);
sifrap_reg.projection = OL_3857;

//var url_retesynop = "https://ogcie.iblsoft.com/observations?VERSION=1.3.0&";
var url_retesynop = "https://ogcie.iblsoft.com/observations?";
var retesynop = new OpenLayers.Layer.WMS(default_layer_name, url_retesynop,
        {layers:"surface", transparent: true, displayInLayerSwitcher: false}
	, {isBaseLayer:false, singleTile:false}
	);
retesynop.setVisibility(false);
retesynop.projection = OL_3857;


/* Come WFS i 2 layer in base alla scala non vengono riconosciuti da OL 2 ma vengono mostrati entrambi se UNION, ma non se GROUP, a quanto pare*/
/*
var limiti_comuni_MS = new OpenLayers.Layer.Vector(default_layer_name, {
	//styleMap: styleMap_reticolo_idro_lm,
	strategies: [new OpenLayers.Strategy.BBOX()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_datidibase, featureType: "limiti_comuni_italiani_union",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		geometryName: "the_geom", srsName: "epsg:32632"
		//extractAttributes: true, //extractStyles: true, //geometry: "msGeometry", //version: "1.1.0",
	})
});
*/
//Come WMS la UNION non viene riconosciuta, ma il GROUP si
//Come funziona pero' per la selezione??
var limiti_comuni_MS = new OpenLayers.Layer.WMS(default_layer_name, urlMS_loc,
        {map: urlMS_map, layers:"limiti_comuni_italiani", transparent: true, displayInLayerSwitcher: false}, {singleTile: false, opacity: 0.6, isBaseLayer:false});
limiti_comuni_MS.setVisibility(false);

