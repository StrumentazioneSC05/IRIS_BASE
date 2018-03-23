/*
 * ** author: Armando Riccardo Gaeta
 * ** email: ar_gaeta@yahoo.it
 * */

var map, mapPanel, viewport, app, popup, cacheWrite;

var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");


//Per la versione Sencha-touch 2:
/*
Ext.require([
    'GXM.Map',
    'GXM.FeatureList'
]);
*/

//Funzione per aggiornamento raster:
function map_redraw() {
        var map_refresh = map;
        //Variabile temporale per la modifica dell'url dell'immagine
        var d = new Date();
        var dt = d.getTime();
        for (var i=0; i < map.layers.length; i++) {
                var layer_to_remove = map_refresh.layers[i];
                //Innanzitutto lavoro SOLO sui layer VISIBILI:
                if (layer_to_remove.getVisibility()==true) {
                var width_image = layer_to_remove.getImageSize().w;
                if (width_image != 256) { //256 e' la dimensione di tutti i layer NON raster
                        //Modifico l'url dell'immagine in modo da poterla ricaricare:
                        var url_image = layer_to_remove.getURL();
                        //Se il raster e' quello dell'animazione non viene aggiornato con questo ciclo
                        if (!url_image.match(/googlemap_ist_bis_T.*/)) {
                        var length_url = url_image.length;
                        var trim_url = length_url - 13;
                        var sub_url = url_image.substring(0,trim_url);
                        var new_url = sub_url + dt;
                        var image_visibility = layer_to_remove.getVisibility();
                        layer_to_remove.setVisibility(true);
                        layer_to_remove.setUrl(new_url);
                        if (image_visibility==false) {layer_to_remove.setVisibility(false);}
                        layer_to_remove.redraw(true);
                        }
                } //fine dell'IF sulle dimensioni del layer
                } //fine dell'IF sulla visibilita' del layer
        } //fine del ciclo for
} //fine della funzione "map_redraw"

//Funzioni e variabili per animazione layer raster su mobile:
var path_raster = root_dir_html + "/common/DATA/raster/animation/";
var raster_file = "googlemap_ist_bis_T10:35Z.png"; //default da cui estrarre le sottostringhe
var index = [19, 24];
var raster_label = "Animazione LEMI-1h"; //default
var formato_data = "HH:MI";
var delta = 10;
var delta_inizio = 0;
var delta_max = 720; //in realta' questo parametro non mi serve nel mobile
var udm = 'MI';
var delta_passo = 60; //in realta' questo parametro non mi serve nel mobile
var delta_max, delta_passo, delta, delta_inizio, udm, spanRaster, formato_data, index, raster_gid, raster_file, path_raster;
var currentDate, animationTimer;
var hh, mms, minutes, anime_rain, endDateRaster, trim_url, url_new, d;
var new_string_time;
var last_time_rounded; //CONTATORE
var interval = 1.125; //numero di secondi tra unanimazione e laltra

function set_raster_url(layer_selected) {
	url_raster_anim = path_raster + raster_file.substring(0, index[0]);
	set_flashback(60); //dovrebbe essere il valore di flashback da cui partire a ritroso, in minuti
}
function convert_incremento_to_seconds(incremento_udm, udm) {
        switch (udm) {
          case 'DD':
            return incremento_udm * 86400;
            break;
          case 'HH':
            return incremento_udm * 3600;
            break;
          case 'MI':
            return incremento_udm * 60;
            break;
          case 'SS':
            return incremento_udm;
            break;
        }
}
function extract_string_time(last_time_rounded, formato_data) {
        date_rounded = new Date(last_time_rounded);
        var second = date_rounded.getSeconds();
        var minute = date_rounded.getMinutes();
        var hour = date_rounded.getHours();
        var day = date_rounded.getDate();
        var month = date_rounded.getMonth()+1;
        var year = date_rounded.getFullYear();
        months = (month < 10) ? "0" + month : month;
        days = (day < 10) ? "0" + day : day;
        hours = (hour < 10) ? "0" + hour : hour;
        minutes = (minute < 10) ? "0" + minute : minute;
        seconds = (second < 10) ? "0" + second : second;
        switch (formato_data) {
          case 'HH:MI':
            return hours+':'+minutes;
            break;
        }
}
function set_flashback(flashback_udm) {
	spanRaster = convert_incremento_to_seconds(flashback_udm, udm);
	set_contatore();
}
function set_contatore() {
        //Ogni volta che avvio la funzione reinizializzo il contatore "last_time_rounded":
        var now = new Date();
        var today =  new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
        var flash_time = spanRaster * 1000; //e' il tempo passato da cui far partire l'animazione in ms

        //Creo il contatore di partenza di tipo TIME arrotondandolo come di dovuto:
        var last_time = today.getTime() - flash_time; //tempo in millisecondi dal 1970 da cui far partire l'animazione
        var delta_min_ms = convert_incremento_to_seconds(delta, udm) * 1000; //converto il passo in ms
        var delta_inizio_ms = convert_incremento_to_seconds(delta_inizio, udm) * 1000; //converto eventuale offset in ms
        var offset_ms = -delta_min_ms + delta_inizio_ms - (2*delta_min_ms); //calcolo offset partenza img. se ZERO si va indietro di un ulteriore delta_min e comunque vado indietro di altri 2 istanti per non rischiare l'assenza dell'img
        last_time_rounded = (Math.floor(last_time / delta_min_ms) * delta_min_ms) + offset_ms;//QUESTO SARA IL TUO CONTATORE
        new_string_time = extract_string_time(last_time_rounded, formato_data); //da cui cerco di estrapolare dal TIME le informazioni che mi servono per comporre la stringa del raster da caricare
//console.log(new_string_time);

        //Inizializzo alcune variabili utili per le animazioni successive:
        endDateRaster = new Date(last_time_rounded + (spanRaster * 1000));
        d = new Date(last_time_rounded); //trasformo l'oggetto time in data
        max_spanRaster = convert_incremento_to_seconds(delta_max, udm);
        maxDateRaster = new Date(today.getTime() - (max_spanRaster * 1000)); //tempo massimo dal quale partire nel passato

        //Ripulisco la mappa dall'ultima immagine se c'e':
        //if (anime_rain) {map.removeLayer(anime_rain);} //nel MOBILE non lo rimuovo altrimenti da errore
        //La pulizia degli altri layer_raster accesi la faccio a monte su toolbar_tools.js
        
	//A questo punto re-inizializzo l'immagine:
	var start_url = path_raster + raster_file.substring(0, index[0]) + new_string_time + raster_file.substring(index[1]);
	anime_rain.setUrl(start_url);
	var image_visibility = anime_rain.getVisibility();
        if (image_visibility==false) {anime_rain.setVisibility(false);}
        anime_rain.redraw(true);

        currentDate = d;
}
function startAnimationRaster() {
    if (animationTimer) {
        stopAnimationRaster(true);
    }
    if (!currentDate) {
        //Appena parto con l'animazione creo il nuovo contatore TIME su cui basare il resto delle animazioni:
        set_contatore();
    } //Fine dell'IF sulla presenza o meno del currentDate

    var next = function() {
        if (currentDate < endDateRaster) {
                //ricarico l'img del delta_tempo successivo:
                //var layer_to_remove = anime_rain;
                incremento = convert_incremento_to_seconds(delta, udm);
                last_time_rounded = last_time_rounded + (incremento * 1000);
                d = new Date(last_time_rounded); //trasformo l'oggetto time in data
                var new_string_time = extract_string_time(last_time_rounded, formato_data);
                var new_url = path_raster + raster_file.substring(0, index[0]) + new_string_time + raster_file.substring(index[1]);
	/*
                var image_visibility = layer_to_remove.getVisibility();
                layer_to_remove.setVisibility(true);
                layer_to_remove.setUrl(new_url);
                if (image_visibility==false) {layer_to_remove.setVisibility(false);}
                layer_to_remove.redraw(true);
	*/
		var image_visibility = anime_rain.getVisibility();
                anime_rain.setVisibility(true);
                anime_rain.setUrl(new_url);
                if (image_visibility==false) {anime_rain.setVisibility(false);}
                anime_rain.redraw(true);

		currentDate = d;
        } else {
            stopAnimationRaster("loop");
        }
    }
    animationTimer = window.setInterval(next, interval * 1000);
}

function stopAnimationRaster(reset) {
    window.clearInterval(animationTimer);
    animationTimer = null;
    currentDate = null;
	if (reset==="loop") {
	   //Faccio ripartire l'animazione in loop
	   set_raster_url('3');
	   startAnimationRaster();
	}
}
function switchoff_anime(visibility) {
	for (var i=0; i < map.layers.length; i++) {
	   var anime_layer = map.layers[i];
	      if ( anime_layer.name.indexOf('Animazione') > -1 ) {
		//console.log(anime_layer.name);
		//console.log(anime_layer);
        	//anime_layer.setVisibility(visibility);
   	   }
	}
}


function load_map() {

Ext.setup({
    onReady: function(){
        //alert('Replace this alert with actual code.');


//var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {transitionEffect: 'resize'});
var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap Tile", [
   "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
   "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
   "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
]);

//var osmLayer = new OpenLayers.Layer.OSM("OpenStreetMap Tile", null, {transitionEffect: 'resize'});
osmLayer.displayInLayerSwitcher = false;

function onFeatureSelect(feature) {
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


//GeoLocate: serve alla localizzazione dell'utente sulla mappa, e a creare un marker sulla posizione
var style = {
    fillOpacity: 0.1,
    fillColor: '#000',
    strokeColor: 'grey',
    strokeOpacity: 0.6
};
//vector e' il layer che ospitera' il punto che segnala dove si trova il client
vector = new OpenLayers.Layer.Vector("Vector Layer", {});
map.addLayer(vector);
vector.displayInLayerSwitcher = false;
/* OPENLAYER GEOLOCATE*/
geolocate.events.register("locationupdated", this, function(e) {
//console.info(e.point); //OpenLayers.Geometry.Point
    vector.removeAllFeatures();
    vector.addFeatures([
        new OpenLayers.Feature.Vector(
            e.point,
            {},
            {
                graphicName: 'cross',
		//externalGraphic: 'http://www.openlayers.org/dev/img/marker.png',
		externalGraphic: root_dir_html + '/common/icons/marker_orange.png',
		//graphicWidth: 32,
	        graphicHeight: 32,
                strokeColor: '#f00', //red
                strokeWidth: 2,
                fillOpacity: 1,
                pointRadius: 10
            }
        )
	,new OpenLayers.Feature.Vector(
            OpenLayers.Geometry.Polygon.createRegularPolygon(
                new OpenLayers.Geometry.Point(e.point.x, e.point.y), //origin
                e.position.coords.accuracy / 2, //radius
                50, //sides
                0 //rotation
            ),
            {},
            style
        )
    ]);
    // map.zoomToExtent(vector.getDataExtent());
    map.setCenter(e.point, 12)
});
geolocate.events.register("locationfailed", this, function() {
console.log(this);
	alert("Posizione non trovata!");
});
geolocate.events.register("locationuncapable", this, function() {
        alert("Il browser non supporta la geolocalizzazione!");
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
map.addControl(clickControl);
clickControl.activate();


///////////////////////////SELECT TOOL //////////////////////

map.addControl(selectControl);
selectControl.activate();


///////////////////////////CACHE WRITE//////////////////////
//Provo a cachare le immagini di OpenLayer per una visualizzazione piu' rapida su Mobile:
cacheWrite = new OpenLayers.Control.CacheWrite({
        autoActivate: true,
        imageFormat: "image/jpeg",
        eventListeners: {
            cachefull: function() { status.innerHTML = "Cache full."; }
        }
});
map.addControl(cacheWrite);
cacheWrite.activate();


///////////////////////////ANIMAZIONE RASTER//////////////////////
//Inizializzo il layer immagine:
anime_rain = new OpenLayers.Layer.Image(
       raster_label,
       null,
       bounds2a, size4, raster_options //variabili definite in theme_raster.js
);
anime_rain.setVisibility(false);
map.addLayer(anime_rain);
map.setLayerIndex(anime_rain, 0);
//console.log(anime_rain);

//Provo ad attivare un handler sull'attivazione di un layer per poi implementare un eventuale animazione:
////OK FUNZIONA! A questo punto all'attivazione di un layer 'animazione' posso attivare gli script implementati in precedenza!
map.events.register('changelayer', null, function(evt){
       if(evt.property === "visibility" && evt.layer.name===raster_label) {
	   if (evt.layer.visibility === true) {
		set_raster_url('3'); //il 3 e' un numero a caso nel mobile non mi serve
		startAnimationRaster();
	   }
	   else {
		stopAnimationRaster(true);
		//Nascondo il layer che a quanto pare ha cambiato riferimento quindi devo riprendermelo:
		switchoff_anime(false);
	   }
          //alert(evt.layer.name + " layer visibility changed to " + evt.layer.visibility );
       }
   }
);
///////////////////////////FINE ANIMAZIONE RASTER//////////////////////


//Provo funzione di refresh raster anche su mobile:
setInterval('map_redraw()', 150000);

} //fine OnReady function

}); //fine Ext.Setup

} //fine funzione di prova load_map

