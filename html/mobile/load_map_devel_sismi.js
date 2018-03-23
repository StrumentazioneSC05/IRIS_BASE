/*
 * ** author: Armando Riccardo Gaeta
 * ** email: ar_gaeta@yahoo.it
 * */

var map, mapPanel, viewport, app, popup;

var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");


//Per la versione Sencha-touch 2:
/*
Ext.require([
    'GXM.Map',
    'GXM.FeatureList'
]);
*/


function load_map() {

Ext.setup({
    onReady: function(){
        //alert('Replace this alert with actual code.');


//var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {transitionEffect: 'resize'});
//var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap Tile", ["http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
//   "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
//   "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"]);

var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap Tile", "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png");

function onFeatureSelect(feature) {
	/*Con questa funzione apro una popup..anche abbastanza brutta:
	while (map.popups.length > 0) { 
	    map.removePopup(map.popups[0]); 
	}

	//alert(feature.attributes.magnitudo);
	selectedFeature = feature;
	var opx = map.getLonLatFromViewPortPx(feature.xy);
	//popup = new OpenLayers.Popup("chicken",
	popup = new OpenLayers.Popup.FramedCloud("chicken", 
		//map.getLonLatFromPixel(new OpenLayers.Pixel(x,y)),
		//new OpenLayers.LonLat(5,40),
		//new OpenLayers.LonLat(opx.lat, opx.lon),
		feature.geometry.getBounds().getCenterLonLat(),
		//map.getLonLatFromViewPortPx(evt.xy),
		new OpenLayers.Size(300,200), //null,
		"<div style='font-size:.8em'>M = " + feature.attributes.magnitudo
		//+ feature.id +"<br>Area: " + feature.geometry.getArea()+"</div>",
		, null
		, true
		//, onPopupClose
		);
	feature.popup = popup;
	map.addPopup(popup);
	*/

	//Cerchiamo di far aprire una sintesi del sisma in un altro tab:
	var uri = root_dir_html + "/mobile/scheda_sismi.php?id=" + feature.attributes.gid;
	Ext.getCmp('results_tab').update('<iframe src="' + uri + '" seamless="seamless" frameborder=0 width=100% height=100%></iframe>');
        Ext.getCmp('tab_panel').setActiveItem(1); //quando clicchi sulla mappa la richiesta viene spostata nel tab 1
	//Attivo il pulsante per poter ritornare alla mappa:
        Ext.getCmp('btn_map').enable();
	
}
var selectControl = new OpenLayers.Control.SelectFeature(
	layers_to_select,
	{
	//autoActivate:true
	onSelect: onFeatureSelect//, onUnselect: onFeatureUnselect
	//Nuove opzioni per vedere se funziona:
        //clickout: true, toggle: false
});

var geolocate = new OpenLayers.Control.Geolocate({
    id: 'locate-control',
    geolocationOptions: {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 7000
    }
});


// create a map
map = new OpenLayers.Map({
	div: "map",
	theme: null,
	projection: sm,
	numZoomLevels: 18,
	controls: [
        new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
        }),
        new OpenLayers.Control.Attribution()
	//,new OpenLayers.Control.Zoom() //per i tasti ZoomIn e ZoomOut da mobile
	,geolocate
        ,selectControl
	]
	,layers: [osmLayer]
	,center: new OpenLayers.LonLat(920000, 5650000)
	,zoom: 7
});

/*CARICO i layer provenienti dagli altri javascript:*/
for (i=0; i<layers_to_load.length; i++) {
        map.addLayer(layers_to_load[i]);
}
//map.addLayers([sismi]);


//GeoLocate: a cosa serve?
var style = {
    fillOpacity: 0.1,
    fillColor: '#000',
    strokeColor: '#f00',
    strokeOpacity: 0.6
};
//vector e' il layer che ospitera' il punto che segnala dove si trova il client
var vector = new OpenLayers.Layer.Vector("Vector Layer", {});
geolocate.events.register("locationupdated", this, function(e) {
    vector.removeAllFeatures();
    vector.addFeatures([
        new OpenLayers.Feature.Vector(
            e.point,
            {},
            {
                graphicName: 'cross',
                strokeColor: '#f00',
                strokeWidth: 2,
                fillOpacity: 0,
                pointRadius: 10
            }
        ),
        new OpenLayers.Feature.Vector(
            OpenLayers.Geometry.Polygon.createRegularPolygon(
                new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                e.position.coords.accuracy / 2,
                50,
                0
            ),
            {},
            style
        )
    ]);
    // map.zoomToExtent(vector.getDataExtent());
    map.setCenter(e.point, 12)
});


//////////////////// CREO ALCUNI PANNELLI GXM /////////
/*
// Create the GXM.Map using the map configuration from above (see OpenLayers.Map constructor)
//var mapPanel = Ext.create('GXM.Map', { //for sencha version 2
mapPanel = new GXM.MapPanel({
    map : map,
    title : 'MapPanel',
    //mapCenter : [0,3000000], mapZoom : 2
});

// Create the GXM FeatureList that also contains a listener dealing with
// tap events on a specific feature in the list triggering a map zoom to the feature.
var featureList = {
    //xtype: 'gxm_featurelist',  //for sencha version 2
    xtype: 'gxm_layerlist',
    mapPanel: mapPanel,
    //layer : neve_tiny,
    //layers: mapPanel.layers, map: map,
    title : 'FeatureList',
    listeners : {
        itemtap : function(list, idx, target, record, e, eOpts) {
            var feature = record.getFeature(), 
                geom = feature.geometry, 
                center = new OpenLayers.LonLat(geom.x, geom.y), 
                zoom = 5;
            mapPanel.getMap().setCenter(center, zoom);
            viewport.setActiveItem(mapPanel);
        }
    }
};
var layerPanel = {
    xtype: 'panel',
    title: 'LayerList',
    fullscreen: true,
    items: [featureList]
};
*/


///////////////////// TOUCH-EVENT ON MAP /////////////
var webgis = 'mobile';
//Aggiungo un controllo sul click per renderlo operativo anche su mobile-touch:
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions: {
        'single': true, 'double': false, 'pixelTolerance': 5, 'stopSingle': false
        //'stopDouble': false
        },
        initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
                {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Click(
                this, {
                //'click': this.trigger
                'click': this.onClick
                }, this.handlerOptions
        );
        }
        //,onClick: function(evt) {alert(evt.xy);}
}); //fine del Control.Click
//Aggiungo il controller del click:
var clickControl = new OpenLayers.Control.Click( {
        onClick: function(e) {
                //var position = this.events.getMousePosition(e); //da la posizione in pixel
                var position = e.xy;
                var ll = map.getLonLatFromViewPortPx(position);
                var map_proj = map.projection.toString();
                var srid = map_proj.replace('EPSG:','');
                var lon_rast = ll.lon;
                var lat_rast = ll.lat;
                var p1_rast = new Proj4js.Point(lon_rast, lat_rast);
                var source = new Proj4js.Proj("EPSG:900913"); //UTM Google 900913
                var dest = new Proj4js.Proj("EPSG:32632"); //UTM WGS84
                //Recuperiamo direttamente i dati dal tiff in 900913
                var pp1_rast = p1_rast;
                var uri = root_dir_html + "/cgi-bin/query_raster_mobile.py?x="+Math.round(pp1_rast.x)+"&y="+Math.round(pp1_rast.y)+"&srid="+srid+"&webgis="+webgis+"&root_dir_html="+root_dir_html;
                //window.open(uri,'radar','location=0,width=800,height=600,toolbar=0,resizable=0,left=200,top=200');

		//nella versione MOBILE carico il risultato in un altro tab:
		Ext.getCmp('results_tab').update('<iframe src="' + uri + '" seamless="seamless" frameborder=0 width=100% height=100%></iframe>');
                Ext.getCmp('tab_panel').setActiveItem(1); //quando clicchi sulla mappa la richiesta viene spostata nel tab 1
		//Attivo il pulsante per poter ritornare alla mappa:
		Ext.getCmp('btn_map').enable();
        }
});
//Aggiungo il controller sul click in mappa:
//map.addControl(clickControl);
//clickControl.activate();


///////////////////////////SELECT TOOL //////////////////////

map.addControl(selectControl);
selectControl.activate();


} //fine OnReady function

}); //fine Ext.Setup

} //fine funzione di prova load_map

