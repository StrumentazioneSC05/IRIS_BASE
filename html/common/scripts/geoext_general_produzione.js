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

var options;
//Queste variabili provo ad inizializzarle a monte perche' forse le recupero in maniera piu' flessibile da DB:
//var ctrl, toolbarItems = [], action, actions = {};

Ext.onReady(function() {

Ext.QuickTips.init();


/////////////////////// PRINT-PROVIDER TEST ////////////////////
//Sviluppo fallito...


//////////////////// CARTE DI BASE ///////////////////
//CARICATE DAL FILE ESTERNO BASE_LAYERS.JS


///////////////////// TEST LOAD KML LAYER ////////////////////
//Sviluppo riuscito ma al momento non utilizzato	


///////////////////////// DEFINIZIONE MAPPA OPENLAYERS ////////////////////////
////Adesso a seconda del layer di base che voglio caricare scelgo le opzioni della mappa.
//tutta questa parte la carico in toolbar_tool.js in modo da svilupapre la parte che richiama le funzioni da DB
/*
//BASE_LAYERS=UNO --> caricamento per WMS Arpa WGS84-UTM
if (base_layers == 1) {
        options = {
                projection        : OL_32632,
                maxExtent         : new OpenLayers.Bounds(-2000000,3000000,3500000,7500000),
                restrictedExtent: new OpenLayers.Bounds(0,4000000,1500000,6000000),
                maxResolution     : "auto",
                scales            : [15000000, 8000000, 4000000, 2000000, 1000000, 500000, 250000, 100000, 50000, 25000, 10000, 5000],
                units             : "m",
                displayProjection: OL_32632
        };
} //Fine dell'IF se BASE_LAYERS=UNO

//BASE_LAYERS=ZERO --> caricamento classico per GoogleMap e OSM:
else {
        options = {
                projection: OL_900913
                ,maxResolution: "auto"
                //Provo a risettare alcuni valori iniziali per aiutare TileCache:
                ,maxExtent: new OpenLayers.Bounds(-2000000,3500000,4000000,7500000)
                ,resolutions:[156543.03390000001, 78271.516950000005, 39135.758475000002, 19567.879237500001, 9783.9396187500006, 4891.9698093750003, 2445.9849046875001, 1222.9924523437501, 611.49622617187504, 305.74811308593752, 152.87405654296876, 76.43702827148438, 38.21851413574219, 19.109257067871095, 9.5546285339355475, 4.7773142669677737, 2.3886571334838869, 1.1943285667419434, 0.59716428337097172, 0.29858214168548586]
                ,units: "m"
                ,numZoomLevels: 20
                ,tileSize: new OpenLayers.Size(256, 256)
                ,displayProjection: OL_4326
                ,allOverlays: false //e' un opzione di GeoExt messa a false, ma non ho ben capito a cosa serva...
                , theme: null //per non far ricaricare ad Openlayers lo style.css
                
        };
} //Fine dell'ELSE se BASE_LAYERS=ZERO

map = new OpenLayers.Map('map', options);
*/

///////////////////// FINE DEFINIZIONE DELLA MAPPA OPENLAYERS //////////////////////////


///////////////////// TOOLBAR ITEMS and MEASURE TOOLS ///////////////////
//Carico la funzione esterna per caricare tutti gli elementi della toolbar:
//Anche in questo caso provo a lanciare questa funziona dal PHP che carica certe funzioni dal DB:
//toolbar_tools();

////////////// END OF TOOLBAR ITEMS //////////////////////


///////////////// MAP PANEL //////////////////////////////
	
	/*Tutte le opzioni della mappa vanno messe qui dentro, nel MapPanel:*/
	if (webgis=='expo2015_pub') tbar_items = [];
	else tbar_items = toolbarItems;
	mapPanel = new GeoExt.MapPanel({
		border: true,
		region: "center",
		map: map,		
		tbar: tbar_items,
		center: [x_center, y_center], //Per OpenStreetMap
		zoom: zoom_center,
		//layers: [gtop, gmap, gsat, ghyb, osmLayer]
		layers: baselayer_to_load
	
		//Alcuni sviluppi omessi su: opacity slider, print map, etc.
	});


	/*CARICO i layer provenienti dagli altri javascript:*/
	for (i=0; i<layers_to_load.length; i++) {
		mapPanel.map.addLayer(layers_to_load[i]);
	}


	//Controllo sul clik in mappa per recuperare informazioni sulla posizione - QUESTO METODO NN FUNZIONA SU MOBILE
	function handleMapClick(e) {
        	var position = this.events.getMousePosition(e); //da la posizione in pixel
	        var ll = map.getLonLatFromViewPortPx(position);
        	var map_proj = map.projection.toString();
	        var srid = map_proj.replace('EPSG:','');
        	//transforming point coordinates:
	        var lon_rast = ll.lon;
		var lat_rast = ll.lat;
		var p1_rast = new Proj4js.Point(lon_rast, lat_rast);
		//creating source and destination Proj4js objects:
		var source = new Proj4js.Proj("EPSG:900913"); //UTM Google 900913
        	var dest = new Proj4js.Proj("EPSG:32632"); //UTM WGS84
	        //Recuperiamo direttamente i dati dal tiff in 900913
        	var pp1_rast = p1_rast;
        	var uri = root_dir_html+"/cgi-bin/query_raster.py?x="+Math.round(pp1_rast.x)+"&y="+Math.round(pp1_rast.y)+"&srid="+srid+"&webgis="+webgis+"&root_dir_html="+root_dir_html;
	        window.open(uri,'radar','location=0,width=950,height=650,toolbar=0,resizable=0,left=200,top=200');
        };
        //map.events.register("click", map, handleMapClick);

	//Aggiungo un controllo sul click per renderlo operativo anche su mobile-touch:
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
		defaultHandlerOptions: {
		'single': true, 'double': false, 'pixelTolerance': 5, 'stopSingle': false
		//'stopDouble': false
		},
		//handleRightClicks: true,
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
			if (query_raster == 99) 
                            var uri = root_dir_html+"/common/scripts/report_evento.php?x="+Math.round(pp1_rast.x)+"&y="+Math.round(pp1_rast.y)+"&srid="+srid+"&webgis="+webgis+"&root_dir_html="+root_dir_html+"&active_queries="+query_raster;
			else
			    var uri = root_dir_html+"/cgi-bin/query_raster.py?x="+Math.round(pp1_rast.x)+"&y="+Math.round(pp1_rast.y)+"&srid="+srid+"&webgis="+webgis+"&root_dir_html="+root_dir_html+"&active_queries="+query_raster;
                        window.open(uri,'radar','location=0,width=950,height=650,toolbar=0,resizable=0,left=200,top=200');
                }
		/*,eventMethods: {
        	    'rightclick': function (e) { //non viene riconosciuto
                        console.log("RIGTH CLICK");
                     }
                }*/
        });
	//Aggiungo il controller sul click in mappa solo se la variabile query_raster non esiste o non e' ZERO:
	if (query_raster[0] != '0') {
	    mapPanel.map.addControl(clickControl);
            clickControl.activate();
	}

/*SPENGO QUESTA FUNZIONE PER QUANTO FUNZIONASSE BENE, PERO' RALLENTA UN PO' IL SISTEMA
	//Provo ad aggiungere un controllo sull'HOVER al momento solo su UN LAYER ben definito per un TOOOLTIP che BUCA tutto il layer in modo da intercettare tutti i poligoni eventualmente sovrapposti:
        var ttips_map = new OpenLayers.Control.ToolTips({bgColor:"cyan",textColor:"black",bold:true,opacity:0.5});
	var yy=0;
	function tTipsOver(feature, text_to_show) {
		if(yy==0) {map.addControl(ttips_map);} //andrebbe aggiunto fuori dalla funzione,ma in questo modo funziona!!
		var html_feature =  text_to_show.join();
		//console.log(html_feature);
		//map.addControl(ttips); //andrebbe aggiunto fuori dalla funzione,ma in questo modo funziona!!
		ttips_map.show({html:html_feature});
		yy=1;
	}
	function tTipsOut(feature){
		//map.addControl(ttips);
		ttips_map.hide();
	}
	//ATTENZIONE CHE QUESTO REGISTER E' SEMPRE ATTIVO ANCHE A LAYER NON VISIBILE!!!
	//Potrebbe dunque rallentare un po' il sistema secondo me...	
	map.events.register('mouseover', bacini_idro, function(evt) {
	    if (bacini_idro.getVisibility() == false) return;
	    var position = evt.xy;
	    var ll = map.getLonLatFromViewPortPx(position);
            var lon_rast = ll.lon;
            var lat_rast = ll.lat;
console.log("lat="+lat_rast+" e lon="+lon_rast); //in realta sono utm 900913
	    var marker_point=new OpenLayers.Geometry.Point(lon_rast, lat_rast);
	    result = [];
	    //bacini_ordine = new Array();
	    //bacini_nome = new Array();
	    html_text = '';
	    for (var i=0; i<bacini_idro.features.length; i+=1) {
		if (bacini_idro.features[i].geometry.intersects(marker_point)) {
	            result.push(['ordine ', bacini_idro.features[i].data.ordine, ': ' + bacini_idro.features[i].data.nome.toLowerCase().replace(/\d+|^\s+|\s+$/g, '')+ '<br/>' ]);
	            //bacini_idro.features[i].renderIntent = "temporary";
	            html_text += 'ordine ' + bacini_idro.features[i].data.ordine + ': ' + bacini_idro.features[i].data.nome.toLowerCase().replace(/\d+|^\s+|\s+$/g, '') + '<br/>';
		    //bacini_ordine[bacini_idro.features[i].data.gid] = bacini_idro.features[i].data.ordine;
		    //bacini_nome[bacini_idro.features[i].data.gid] = bacini_idro.features[i].data.nome.toLowerCase();
		    //console.log(bacini_idro.features[i].data.nome);
		}
	    };
	    result.sort(function(a, b) {return a[1] - b[1]});
	    //console.log(result[0]);
	    //if (html_text!='') tTipsOver(evt, html_text);
	    if (result.length > 0) tTipsOver(evt, result);
	    //console.log(evt);
	});
	map.events.register('mouseout', bacini_idro, function(evt) {
	    if (yy!=00) tTipsOut(evt);
	});
*/

        /*Aggiungo i vari CONTROL alla mappa:*/
        mapPanel.map.addControl(selectCtrl); //per la selezione degli elementi dei layers selezionabili
        selectCtrl.activate();
        //Attivero' il controllo nel file popup.js proprio di ogni progetto,
        //dopo l'attivazione del Control.Click per non creare problemi di sovrapposizione
        //Il controllo fara' in realta' riferimento al Ext.Button "select00"
        //select00.toggle(true);
        

	/* SELECT su WMS - IN SVILUPPO */
	//Questo controllo pero' resta PARALLELO al precedente
	mapPanel.map.addControl(selectCtrlWMS); //per la selezione degli elementi dei layers selezionabili
        selectCtrlWMS.activate();
	//mapPanel.map.addControl(hoverCtrlWMS); //forse l'hover e' meglio anche se cmq si sovrappone ad altri eventuali hover
	//hoverCtrlWMS.activate();


	//ZOOM:
        /* L'unico modo per ovviare al fatto che la mappa zoomma tantissimo e' commentare questo nuovo Control.Navigation, poiche' a quanto pare ce ne sono 3 caricati sulla mappa. Basta digitare dalla console javascript:
	map.getControlsByClass("OpenLayers.Control.Navigation");
	E vedere come questo controllo compaia tante volte.
 	mapPanel.map.addControl(new OpenLayers.Control.Navigation(
		//Ma tutto questo non serve a niente perche ci sono dei Controls di default definiti in OL che prevalgono
		{zoomWheelEnabled: true, mouseWheelOptions: {cumulative: false, interval: 50, maxDelta: 2}}
	)); //allows the user pan ability and mouseWheel
	*/
	//Provo a disabilitare i controlli tranne uno:
	//http://www.stoimen.com/blog/2009/06/20/openlayers-disable-mouse-wheel-on-zoom/
	controlsNav = map.getControlsByClass('OpenLayers.Control.Navigation');
	for(var i=1; i<controlsNav.length; ++i)
	     controlsNav[i].disableZoomWheel();
	//Funziona. Ma io preferivo avere il doppio zoom...

	//ALTRI CONTROLLI
	mapPanel.map.addControl(new OpenLayers.Control.MousePosition());
	mapPanel.map.addControl(new OpenLayers.Control.KeyboardDefaults()); //ZoomBox pressing SHIFT.
	mapPanel.map.addControl(new OpenLayers.Control.Scale());
        mapPanel.map.addControl(new OpenLayers.Control.LoadingPanel());
        mapPanel.map.addControl(new OpenLayers.Control.ScaleLine({abbreviateLabel: true, geodesic:true}));



	//Provo l'export della mappa ma troppo delirio con i renders lascio perdere..
	//http://dev.openlayers.org/sandbox/camptocamp/canvas/openlayers/examples/exportMapCanvas.html
	//exportMapControl = new OpenLayers.Control.ExportMap();
        //mapPanel.map.addControl(exportMapControl);

	//mapPanel.map.addControl(new OpenLayers.Control.Permalink());

	//scalebar = new OpenLayers.Control.ScaleLine({bottomOutUnits: ''});
	//scalebar = new OpenLayers.Control.ScaleBar({abbreviateLabel: true});
        //mapPanel.map.addControl(scalebar); //non e' possibile la misura geodesica!

	//if (!map.getCenter()) {map.zoomToMaxExtent()}
	//map.addControl(new OpenLayers.Control.PanZoom()); //come settare la posizione??
	//mapPanel.map.addControl(new OpenLayers.Control.ZoomPanel());

	//mapPanel.getTopToolbar().addButton([lengthButton, areaButton]);
	
	//Applico lo stile alla mappa di Google rilievo. Lo stile e' definito in base_layers, cosi' come il layer_id:
	//mapPanel.map.getLayer('google_rilievo').mapObject.setOptions({"styles": style_off});
	//modifica fatta per ArpaLombardia, a noi non utile



//Permetto all'utente di aggiungere un marker: ma come mettere un testo?
/*
markers = new OpenLayers.Layer.Markers( "Markers" );
markers.id = "Markers";
map.addLayer(markers);
*/
/*
//Funziona! Ma come aggiungere del testo?
map.events.register("click", map, function(e) {
   var position = map.getLonLatFromPixel(e.xy);
   var size = new OpenLayers.Size(21,25);
   var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
   var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
   var markerslayer = map.getLayer('Markers');
   markerslayer.addMarker(new OpenLayers.Marker(position,icon));
});
*/

///////////////// END OF MAP PANEL //////////////////////////////



///////////////// GRID PANEL WITH STORE INFORMATION //////////////////
	
//I vari store e columns sono definiti nei relativi theme_files.js, dopo la definizione dei singoli layers
//Gli store e columns da caricare sono definiti nella funzione "activeNode" piu' oltre
//Eventuali opzioni sono definite nei file locali di ciascun webgis
	
	gridPanel = new Ext.grid.GridPanel({
		xtype : 'grid', //a cosa serve?
		region: "south",
		stripeRows: true, //commentato nel caso dei sismi
		columnLines: true,
		//renderTo: "features",
		loadMask: true, //a cosa serve?
		//width: Math.round(screen_w*0.98), //600
		height: Math.round(height_map*0.4), //280
		autoScroll: true,
		titlebar: true, //assente in meteo e frane
		collapsedTitle: "click on the arrows to view the list ==>",
		collapsible: true,
		sm: new GeoExt.grid.FeatureSelectionModel(), //per sincronizzare grid e features
		title: title_grid,
		viewConfig: view_grid,
                store: store_grid,
		cm: columns_grid,
		collapsed: collapsed_grid

		//Sviluppo di una toolbar per zoomare sulla riga selezionata omesso
	});

	//Zoom to feature selected by double-clicking on the row
	gridPanel.on('rowdblclick', function(g, rowIdx,r){
		var rec = store_grid.getAt(rowIdx);
                var feature = rec.get("feature");
                mapPanel.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 12);
        	//mapPanel.map.setCenter(new OpenLayers.LonLat(rec.get('longitude'),rec.get('latitude')),10);
	});

///////////////// END OF GRID PANEL WITH STORE INFORMATION //////////////////


///////////////////// POPUP INFO /////////////////////
/*
//Carico script esterno per le popup dalle cartelle locali:
var e = document.createElement("script");
e.src = local_scripts + "popup.js";
e.type="text/javascript";
// To make it appear just before the closing head tag use
document.getElementsByTagName("head")[0].appendChild(e);
*/
//$.getScript(local_scripts + "popup.js", function(){});


//////////////////// PRINT MODULE EXAMPLE-TEST /////////////////

//Sviluppo non riuscito



//////////////////// CREATE LAYER TREE MENU /////////////////
	
	// create our own layer node UI class, using the TreeNodeUIEventMixin:
	var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());

/*Configuro le CARTELLE della TOC nei file di configurazione locali dei singoli progetti WebGIS:*/

	
	/*Configuro la TOC contenente i layer caricati sul mapPanel: */
	var layerTree = new Ext.tree.TreePanel({
		title: 'Map Layers', region: "nord", autoScroll: true, split: true, id: 'treeP',
		plugins: [
			new GeoExt.plugins.TreeNodeRadioButton({
				listeners: {
					"radiochange": function(node) { activeNode(node); }
				}
			})
		],
		loader: new Ext.tree.TreeLoader({
		//applyLoader set to false to not interfer with loaders of nodes further down the tree hierarchy
			applyLoader: false, uiProviders: {"layernodeui": LayerNodeUI}
		}),			
		root: {nodeType: "async", text: webgis,
			/*the children property of an Ext.tree.AsyncTreeNode is used to
			provide an initial set of layer nodes. We use the treeConfig
			from above, that we created with OpenLayers.Format.JSON.write:*/
			//children: Ext.decode(treeConfig) //Questo lo usi se hai un treeConfig di tipo JSON
			children: treeConfig //per un treeConfig semplice
		},			
		enableDD : true, //permette di spostare i layer all'interno del Tree
		rootVisible: false, lines: true,
		listeners: {
			'checkchange': function(node, checked){
			    activeLayer(node.layer, checked);
			    //console.log(node.attributes.id + " e poi " + checked+ " e poi " + node.leaf);
			}
			//append: registerRadio,
			//insert: registerRadio
		}
		/*Altre opzioni:*/
		//renderTo: 'layerTree', //border: true,
		//height: height_map, //width: Math.round(width_map*0.20), //circa 600*250,
		//collapsible: true, //collapsed: true, //collapseMode: "mini", //root: layerList,


		/*Sviluppo su PRINT MODULE omesso*/

	}); //Fine del LayerTree



//////////// LAVORO SUL LAYER ATTIVO //////////////////

/* Funzione activeNode creata da DB tramite script local_script_db.php */


/////////////////////// LEGEND PANEL //////////////////////

//Il pannello che ospita la legenda e' definite a livello locale di ogni progetto WebGIS

	var right_panel = new Ext.Panel({
		region: "east", autoScroll: true, split: true, collapsible: true, collapsed: true,
		width: Math.round(width_map*0.25),		
		items: [layerTree, legend]
		//layout: "border",
	});

	if (webgis=='expo2015_pub') items_panel = [mapPanel];
	else items_panel = [mapPanel,right_panel,gridPanel];

	var mainPanel = new Ext.Panel({
        renderTo: "mainpanel", layout: "border",
		items: items_panel
		,height: "100%"
		//height: "100%", //frame: true, //border: true, //autoScroll: true, //layout: 'absolute',
		//header:false, //margins: '5 5 5 0', //layout: "fit", //viewConfig: {forceFit: true},		
    });	
	//mainPanel.setHeight((mainPanel.container.getHeight())*0.95);
	mainPanel.setHeight(mainPanel.container.getHeight());

	//Ridimensionare il pannello principale in base alle dimensioni della finestra:
	Ext.EventManager.onWindowResize(function(w, h){
		//mainPanel.doComponentLayout();
		var width_p = Ext.getBody().getViewSize().width;
		var height_p = Ext.getBody().getViewSize().height;
		mainPanel.setSize(width_p, height_p);
	});




///////////////////// REFRESH IN AUTO THE RASTER-MAP ////////////////

	setInterval('map_redraw()', aggiornamento_raster); //aggiorno i dati raster su mappa
	setInterval('ellipse_redraw()', aggiornamento_raster); //aggiorno i dati sui temporali su mappa evitandone l'accumulo

}); //Fine dell'Ext.onReady function


function ellipse_redraw() {
	var currentTimeUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	last1h = new Date(currentTimeUTC.getTime() - 3600000); //recupero 1 ora fa
	last3h = new Date(currentTimeUTC.getTime() - 10800000); //recupero 3 ore fa
	last15min = new Date(currentTimeUTC.getTime()); //recupero l'ultimo disponibile
	//Variabili per costruire il filtro filterStrategyStorm:
	last1h_string = get_dateString(last1h); //nella forma "yyyymmddhhmm"
	last3h_string = get_dateString(last3h); //recupero il primo ellipse di 3 ore fa
	lastStorm_string = get_dateString(last15min); //recupero l'ultimo ellipse disponibile
//console.log(filterStrategyStorm1h.cache());
	//Prima di aggiornare, verifico che queste variabili siano definite:
        if (typeof filterStrategyStorm !== 'undefined' && typeof filterStorm !== 'undefined' && typeof ellipse !== 'undefined') {
          //Deactivo il filterStrategy: in questo modo dovrebbe ripulire la cache:
          filterStrategyStorm.deactivate();
          //Aggiorno il filtro:
          filterStorm.lowerBoundary = last3h_string;
          filterStorm.upperBoundary = lastStorm_string;
          //Riattivo e modifico il filterStrategy:
          filterStrategyStorm.activate();
          filterStrategyStorm.setFilter(filterStorm);
          //Ricarico i layer:
          refresh_ellipse = new OpenLayers.Strategy.Refresh({force: true, active: true});
          refresh_ellipse.setLayer(ellipse);
          refresh_ellipse.activate();
          refresh_ellipse.refresh();
          ellipse.refresh({ force: true });
          ellipse.redraw(true);
        }
        if (typeof filterStrategyStorm1h !== 'undefined' && typeof filterStorm1h !== 'undefined' && typeof ellipse1h !== 'undefined') {
          //Deactivo il filterStrategy: in questo modo dovrebbe ripulire la cache:
          filterStrategyStorm1h.deactivate();
          //Aggiorno il filtro:
          filterStorm1h.value = last1h_string;
          //Riattivo e modifico il filterStrategy:
          filterStrategyStorm1h.activate();
          filterStrategyStorm1h.setFilter(filterStorm1h);
          //Ricarico i layer:
          refresh_ellipse = new OpenLayers.Strategy.Refresh({force: true, active: true});
          refresh_ellipse.setLayer(ellipse1h);
          refresh_ellipse.activate();
          ellipse1h.refresh({ force: true });
          ellipse1h.redraw(true);
        }
}

function map_redraw() {
	//mapPanel.map.destroy;
	var map_refresh = mapPanel.map;
	
	//Variabile temporale per la modifica dell'url dell'immagine
	var d = new Date();
	var dt = d.getTime();
		
	for (var i=0; i < mapPanel.map.layers.length; i++) {
		var layer_to_remove = map_refresh.layers[i];
		
		//Innanzitutto lavoro SOLO sui layer VISIBILI:
		if (layer_to_remove.getVisibility()==true) {

		var width_image = layer_to_remove.getImageSize().w;	
		
		if (width_image != 256) { //256 e' la dimensione di tutti i layer NON raster

			//Modifico l'url dell'immagine in modo da poterla ricaricare:
			var url_image = layer_to_remove.getURL();
			
			//Se il raster e' quello dell'animazione non viene aggiornato con questo ciclo
			//if (!url_image.match(/googlemap_ist_T.*/)) {
			if ( layer_to_remove.name.indexOf('animazione') == -1 ) {
			
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
					
			//Aggiorno il refresh sul dato orario SOLO per i dati raster
			activeLayer(layer_to_remove, true)
		} //fine dell'IF sulle dimensioni del layer

		//Aggiorno il refresh sul dato orario del raster radar:
		//if (layer_to_remove.name.indexOf("Lema") !== -1 || layer_to_remove.name.indexOf("ARX") !== -1) {
		//Il controllo del layer e' gia dentro la funzione:
		//  activeLayer(layer_to_remove, true)
		//}
		
		} //fine dell'IF sulla visibilita' del layer

	} //fine del ciclo for

/* Danno qlke problema si ricarica MServer un botto di volta senza ricevere risposta!!
	//Prima di chiudere la funzione, mi sono accorto che i temporali e altri vettori che hanno una filterstrategy di fatto non si aggironano poiche' il loro vincolo superiore resta sempre il medesimo, o almeno penso sia cosi. Dunque qui aggiorno i parametri della loro filterstrategy:
	var last15min = new Date(currentTimeUTC.getTime()); //recupero l'ultimo disponibile
	var lastStorm_string = get_dateString(last15min); //recupero l'ultimo ellipse disponibile
	//Resetto e visualizzo tutti i temporali e i fulmini:
	if (webgis != 'rischioindustriale') {
	filterStorm.lowerBoundary = last3h_string;
	filterStorm.upperBoundary = lastStorm_string;
	filterStrategyStorm.setFilter(filterStorm);
	filterFulmini.lowerBoundary = last3h_string;
	filterFulmini.upperBoundary = lastStorm_string;
	filterStrategyFulmini.setFilter(filterFulmini);
	}
	
	bboxStrategy = new OpenLayers.Strategy.BBOX();
	bboxStrategy.setLayer(ellipse);
	bboxStrategy.activate();
	refreshStrategy = new OpenLayers.Strategy.Refresh({interval: 150000, force: true});
	refreshStrategy.setLayer(ellipse);
	refreshStrategy.activate();
	refreshStrategy.refresh();
	ellipse.refresh({ force: true });
*/


} //fine della funzione "map_redraw"


//Questa funzione e' per provare a settare una nuova amppa avente come baselayer il wms Arpa.Al momento non funziona...
function switch_map() {

alert("Funzione ancora non disponibile!");


/*
var map_refresh = mapPanel.map;

 for (var i=0; i < mapPanel.map.layers.length; i++) {
                var layer_to_remove = map_refresh.layers[i];

                if (layer_to_remove.isBaseLayer && layer_to_remove.name.indexOf('WMS') == -1) {
                        alert(layer_to_remove.name+" -- "+mapPanel.map.getLayerIndex(layer_to_remove));

                        map_refresh.removeLayer(layer_to_remove); //Elimina il layer dalla mappa definitivamente
                        layer_to_remove.destroy(); //Elimina il layer dalla mappa definitivamente
		} //Fine dell'IF che elimina SOLO i baseLayer

} //fine del ciclo FOR

mapPanel.map.destroy;

        var options32632 = {
          projection        : "epsg:32632",
          maxExtent         : new OpenLayers.Bounds(0,4000000,1500000,6000000),
          maxResolution     : 156543.0339,
          //zoom              : 0,
          maxZoomLevel      : 22,
          numZoomLevels     : 22,
          center            : new OpenLayers.LonLat(800000,4669000),
          units             : "m"
          //controls          : []
        }

        map32632 = new OpenLayers.Map('map', options32632);

	mapPanel = new GeoExt.MapPanel({
                border: true,
                region: "center",
                map: map32632,
                tbar: toolbarItems,
                center: [x_center, y_center], //Per OpenStreetMap
                zoom: zoom_center,
                //layers: [gtop, gmap, gsat, ghyb, osmLayer]
                layers: [] 
	});

        mapPanel.map.addLayer(wms_arpa);

	wms_arpa.setVisibility(true);

*/

} //fine della funzione "switch_map"

