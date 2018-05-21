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

//inizializzo alcune variabili che serviranno anche in altri script:
var ctrl, toolbarItems = [], action, actions = {}, area, misura_lunghezza, misura_area, misura_heading;
var multiselect_object = {};
var multiselect_layers = {};

//queste funzioni e queste variaibli ho bisogno che stiano fuori dalla macrofunzione toolbar_tools perche' devo usarle da altri script:
var ttips;
function toolTipsOut(feature){
    ttips.hide();
}

function initial_view() {
        var lonlat = new OpenLayers.LonLat(x_center, y_center);
        map.setCenter(lonlat,zoom_center);
}

///////////////////////// DEFINIZIONE MAPPA OPENLAYERS ////////////////////////
////Adesso a seconda del layer di base che voglio caricare scelgo le opzioni della mappa.

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

///////////////////// FINE DEFINIZIONE DELLA MAPPA OPENLAYERS //////////////////////////


///////////////////// INIZIO DEFINIZIONE TOOLS DI DEFAULT PER TUTTI I WEBGIS //////////////////////////
function toolbar_tools_default() {

///////////////////// TOOLBAR ITEMS and MEASURE TOOLS ///////////////////
	//selectCtrl = new OpenLayers.Control.SelectFeature(regions); //stringa semplice di selezione
	selectCtrl = new OpenLayers.Control.SelectFeature(
        layers_to_select,
        {
        clickout: true, toggle: false,
        multiple: false, hover: false
        //,toggleKey: "ctrlKey", // ctrl key removes from selection
        //multipleKey: "shiftKey" // shift key adds to selection
		//,box: true
		//,hover: true //praticamente e' un TOOLTIP!!!!!!!!!!!!
        }
	);
	//Provo un workaround per draggare anche su feature selezionabili - FUNZIONA!
	selectCtrl.handlers['feature'].stopDown = false;
        //selectFeat.handlers['feature'].stopUp = false;
        //da: https://trac.osgeo.org/openlayers/wiki/SelectFeatureControlMapDragIssues


	/* SELECT su WMS - IN SVILUPPO */
        //http://dev.openlayers.org/examples/getfeatureinfo-control.html
        //http://dev.openlayers.org/examples/SLDSelect.html
        //TEMO che l'unico modo che ho per abilitarlo sia creare un NUOVO PULSANTE poiche' entra in conflitto con il click su mappa e con il Select classico, cioe' non si AUTOESCLUDONO
        //
        //OpenLayers.Control.GetFeature NON ha alcun effetto
        /*var wfsProtocol = new OpenLayers.Protocol.WFS.fromWMSLayer(limiti_comuni_MS);
        wfsProtocol.read({ 
          //filter: pfilter, 
          extractAttributes: true, 
          infoFormat: "application/vnd.ogc.gml", 
          //resultType: "hits", 
          callback: function (resp) { 
            // Trying to access Feature Data here, but unsuccessful 
            console.log(resp); 
          } 
        }); 
        selectCtrlWMS = new OpenLayers.Control.GetFeature({
            //protocol: OpenLayers.Protocol.WFS.fromWMSLayer(limiti_comuni_MS),
            protocol: wfsProtocol,
            box: true,
            hover: true,
            multipleKey: "shiftKey",
            toggleKey: "ctrlKey"
        });
        selectCtrlWMS.events.register("featureselected", this, function (e) {
console.log(e);
            //select.addFeatures([e.feature]);
        });*/
        //Creo un layer per contenere gli elementi evidenziati del WMS:
        highlightLayerWMS = new OpenLayers.Layer.Vector("Highlighted WMS Features", {
            displayInLayerSwitcher: false,
            isBaseLayer: false
            }
        );
        //mapPanel.map.addLayer(highlightLayerWMS); //per provare ad evidenziare gli elementi aggiungo il relativo layer alla mappa. per il momento la funzione NON funziona per cui commento
        selectCtrlWMS = new OpenLayers.Control.WMSGetFeatureInfo({
                //url: urlMS_loc, //If omitted, all map WMS layers with a url that matches this url or layerUrls will be considered
		layerUrls: [urlMS_loc, url_valanghe_arpa],
                title: 'Identify features by clicking',
                layers: [limiti_comuni_MS, valanghe_wms], //If omitted, all map WMS layers with a url that matches this url or layerUrls will be considered. In realta non pare vero perche se commento non riconosce piu' il MapServer interno
                queryVisible: true //If true, filter out hidden layers when searching the map for layers to query
		,drillDown: false //Drill down over all WMS layers in the map.  When using drillDown mode, hover is not possible, and an infoFormat that returns parseable features is required
		//,maxFeatures: 10 //pare che se e' omesso il server risponda con 1 sola feature
                //,output:'features'
	        //format: new OpenLayers.Format.JSON,
	        //If you are using drillDown mode and have multiple servers that do not share a common infoFormat, you can override the control’s infoFormat by providing an INFO_FORMAT parameter in your OpenLayers.Layer.WMS instance
	        //,infoFormat: 'text/plain' //se text/html occorre fornire al file map/layer un template adeguato
	        //,infoFormat:'application/geojson'
	        //,infoFormat: 'text/html'
                ,infoFormat: 'application/vnd.ogc.gml' //per recuperare le info in maniera piu' schematica
                ,vendorParams: {map: urlMS_map}
		//,clickCallback: "rightclick" //non viene riconsciuto
		,eventListeners : {
        	    getfeatureinfo : function(event) { showInfo(event); }
		}
        });
	hoverCtrlWMS = new OpenLayers.Control.WMSGetFeatureInfo({
                url: urlMS_loc,
                title: 'Identify features by hover',
                layers: [limiti_comuni_MS],
		queryVisible: true, //If true, filter out hidden layers when searching the map for layers to query
                hover: true,
                infoFormat: 'application/vnd.ogc.gml',
                vendorParams: {map: urlMS_map}
		//,eventListeners : {
                //    getfeatureinfo : function(event) { showInfo(event); }
                //}
                // defining a custom format options here
                /*,formatOptions: {
                    typeName: 'water_bodies',
                    featureNS: 'http://www.openplans.org/topp'
                }*/
        });
	//Per abilitare questa selezione su WMS - oppure indiche un eventListeners nel Control:
	//selectCtrlWMS.events.register("nogetfeatureinfo", this, showInfo);
        //hoverCtrlWMS.events.register("getfeatureinfo", this, showInfo);
	//Altro metodo per abilitare questa selezione:
        //mapPanel.map.addControl(selectCtrlWMS); //per la selezione degli elementi dei layers selezionabili
        //selectCtrlWMS.activate();
        //mapPanel.map.addControl(hoverCtrlWMS);
        //hoverCtrlWMS.activate();

//NIENTE da fare al momento e' IMPOSSIBILE interrogare WMS esterni perlomeno di Arpa insieme a quelli interni. Per qualche motivo al click prende un solo URL e poi anche se il layer e' spento non si aggiorna
        function showInfo(evt) {
console.log(evt);
	  if (evt.object.url != urlMS_loc) {
		console.log('ok ' + evt.object.url);
		visible_layers = mapPanel.map.getLayersBy("visibility", true);
//console.log(visible_layers);
		for (var i=0; i<visible_layers.length; i++) {
		//unico modo per ritrovare il WMS esterno e' cercarlo tra i layer visibili e costruire da me la finestra di query, poiche' altrimenti il servizio Arpa con ArcGis restituisce un errore, sebbene da console la url che compone sia corretta
		  if (visible_layers[i].url == evt.object.url && visible_layers[i].isBaseLayer == false && visible_layers[i].params) {
		    URL = visible_layers[i].url;
		    LAYERS = visible_layers[i].params.LAYERS;
		    STYLES = visible_layers[i].params.STYLES;
		    SERVICE = visible_layers[i].params.SERVICE;
		    VERSION = visible_layers[i].params.VERSION;
		    FORMAT = visible_layers[i].params.FORMAT;
		    INFO_FORMAT = evt.object.infoFormat;
		    INFO_FORMAT = 'text/html'; //nel caso di WMS esterno lo recupero sempre come HTML
		    TYPE = evt.type;
		    BBOX = mapPanel.map.getExtent().toString();
		    CRS = visible_layers[i].params.CRS;
		    MAP = evt.object.vendorParams; //in teoria non mi serve a meno che non richiamo MapServer esterni...
		    query_url = URL + '?LAYERS=' + LAYERS + '&QUERY_LAYERS=' + LAYERS + '&STYLES=' + STYLES + '&SERVICE=' + SERVICE + '&VERSION=' + VERSION + '&REQUEST=' + TYPE + '&FEATURE_COUNT=10&FORMAT=' + FORMAT + '&INFO_FORMAT=' + INFO_FORMAT + '&I='+ Math.round(evt.xy.x) + '&J=' + Math.round(evt.xy.y) + '&BBOX=' + BBOX + '&CRS=' + CRS + '&HEIGHT=340&WIDTH=1200';
		    window.open(query_url, '_blank');
		  }
		}
	  }
          //Se effettivamente ho selezionato qualcosa:
          else if (evt.features && evt.features.length) {
             //ricostruisco in maniera fittizia alcune variabili utili per riciclare la funzione createPopup:
             evt.feature = evt.features[0]; //prendo solo il PRIMO elemento selezionato
             //non riesce ancora a posizionare la popup all'altezza dell'elemento...
             LonLatFromPixel = mapPanel.map.getLonLatFromPixel(evt.xy);
             evt.feature.geometry = new OpenLayers.Geometry.Point(LonLatFromPixel.lon, LonLatFromPixel.lat); //questo comando piazza correttamente la popup ma genera un punto su mappa!
             evt.feature.layer = evt.object.layers[0];
             evt.feature.layer.selectedFeatures = new Array();
             evt.feature.layer.selectedFeatures[0] = evt.feature;
             createPopup(evt, "Localita: "+evt.features[0].attributes.localita, evt.feature.layer.name);
             //Per attivare evidenziazione elemento: attualmente NON funziona - in realta' attiva la creazione su mappadell'elemento evt.feature.geometry!! Il quale allo stato attuale e' un OpenLayers.Geometry.Point ma se si riuscisse a recuperare la reale geometria dell'elemento selezionato, allora l'highlight funzionerebbe
	  /*highlightLayerWMS.destroyFeatures();
             highlightLayerWMS.addFeatures(evt.features);
             highlightLayerWMS.redraw();*/
          } else {
            //document.getElementById('responseText').innerHTML = evt.text;
console.log("nessun elemento da WMS selezionato o il layer WMS non e' visibile o il layer WMS non e' selezionabile");
            if (popup) {
                //popup.close(); //chiudere la popup restituisce un errore
                popup.hide();
            }
            if (highlightLayerWMS) highlightLayerWMS.destroyFeatures();
          }
        }


	/* TOOLTIPS!!! */
	ttips = new OpenLayers.Control.ToolTips({bgColor:"red",textColor:"black",bold:true,opacity:0.5});	
	//map.addControl(ttips); //pare che questa linea dia ERRORE!!!!! Perche'?? Nella funzione pero' funziona....
	
	//if(webgis=='sismi') {
		var yy=0;
		function toolTipsOver(feature, text_to_show) {
			if(yy==0) {map.addControl(ttips);} //andrebbe aggiunto fuori dalla funzione,ma in questo modo funziona!!
			//var html_feature =  feature.attributes.label;
			var html_feature =  text_to_show;
			//map.addControl(ttips); //andrebbe aggiunto fuori dalla funzione,ma in questo modo funziona!!
			ttips.show({html:html_feature});
			yy=1;
		}
		/*function toolTipsOut(feature){
			//map.addControl(ttips);
			ttips.hide();
		}*/

		var highlightCtrl = new OpenLayers.Control.SelectFeature(layers_to_highlight, {
        	        hover: true,
			multiple: true,
	                highlightOnly: true,
                	renderIntent: "temporary",
			eventListeners: {
	                	//beforefeaturehighlighted: report,
				featurehighlighted: function(e) {
				  if (typeof sismi00 !== 'undefined' && typeof sismi00b !== 'undefined') { //if doverosa in quanto carico le variaibli da DB e in questa fase non sono ancora pronte e/o il layer non e' caricato sul servizio dunque la variabile non esiste in javascript
				    if(e.feature.layer.name==sismi00 || e.feature.layer.name==sismi00b) toolTipsOver(e.feature, e.feature.attributes.label);
				    /*else if(e.feature.layer.name==suolo15) {
					//console.log("gid="+e.feature.attributes.ordine);
					toolTipsOver(e.feature, "ordine "+e.feature.attributes.ordine+": "+e.feature.attributes.nome);
				    }*/
				  }
				},
				featureunhighlighted: function(e) {
				  if (typeof sismi00 !== 'undefined' && typeof sismi00b !== 'undefined') {
				    if(e.feature.layer.name==sismi00 || e.feature.layer.name==sismi00b) toolTipsOut(e.feature);
				    }
				    //else if(e.feature.layer.name==suolo15) toolTipsOut(e.feature);
				  }
			}
		});
		map.addControl(highlightCtrl);
		highlightCtrl.activate();	
	//} //Fine dell'IF tooltip per il webgis sismico

	
	var options_measure = {
		displayUnits: 'm',
		handlerOptions: {
		    persist: true,
		    geodesic: true} //in realta' questa opzione geodesic non fa unulla...
	};	
	var length = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, options_measure);
	length.geodesic = true; //IMPORTANTE opzione per una corretta misura!!
	length.events.on({
		"measure": handleMeasurements
		//,"measurepartial": handleMeasurements
	});
	map.addControl(length);
	
	area = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, options_measure);	
	area.geodesic = true; //IMPORTANTE opzione per una corretta misura!!
	area.events.on({
		"measure": handleMeasurements
		//,"measurepartial": handleMeasurements
	});
	map.addControl(area);

	//devi riuscire a passare 2 punti nella forma:
	//a = new OpenLayers.LonLat(7, 45)
	//b = new OpenLayers.LonLat(8, 45)
	//heading = OpenLayers.Spherical.computeHeading(a, b)
	//var heading = OpenLayers.Spherical.computeHeading(OpenLayers.Handler.Point);
	var heading = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, options_measure);
        heading.geodesic = true; //IMPORTANTE opzione per una corretta misura!!
	heading.events.on({
                "measure": handleHeading
                //,"measurepartial": handleMeasurements
        });
        map.addControl(heading);
	
	function handleHeading(event) {
	a = event.geometry.components[0];
	aa = a.transform(OL_900913, OL_4326);
	aa_p = new OpenLayers.LonLat(aa.x, aa.y);
	b = event.geometry.components[1];
        bb = b.transform(OL_900913, OL_4326);
	bb_p = new OpenLayers.LonLat(bb.x, bb.y);
            var geometry = event.geometry;
            var units = event.units;
            var order = event.order;
            var measure = event.measure;
            var out = "";
	    out = -OpenLayers.Spherical.computeHeading(aa_p, bb_p);
	    var outs = "Azimuth: " + out.toFixed(3);
            alert(outs);
        }

	function handleMeasurements(event) {
            var geometry = event.geometry;
            var units = event.units;
            var order = event.order;
            var measure = event.measure;            
            var out = "";
            if(order == 1) {
                out += "measure: " + measure.toFixed(3) + " " + units;
            } else {
                out += "measure: " + measure.toFixed(3) + " " + units + "^2";
            }
	    //var element = document.getElementById('output');
            //element.innerHTML = out;
		alert(out);
	}

/*
    // ZoomToMaxExtent control, a "button" control
    action = new GeoExt.Action({
        control: new OpenLayers.Control.ZoomToMaxExtent(),
        map: map,
        text: "max extent",
        tooltip: "zoom to max extent"
    });
    actions["max_extent"] = action;
    toolbarItems.push(action);
*/

var initial_view_btn = new Ext.Button({
	text: "",
	tooltip: "torna alla vista iniziale",
	handler: initial_view
	,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
        ,icon: root_dir_html+'/common/icons/toolbar_icons/home-dav.png'
        ,scale: 'medium'
});
toolbarItems.push(initial_view_btn);

toolbarItems.push("-");


    // Navigation history - two "button" controls
    ctrl = new OpenLayers.Control.NavigationHistory();
    map.addControl(ctrl);
    previous_zoom = new GeoExt.Action({
        text:"",
        control: ctrl.previous,
        disabled: true,
        tooltip: "zoom precedente"
	//,xtype:  'button'
	//,cls:  'x-btn-text-icon'
	,xtype:'tbbutton'
	,cls: 'x-btn-icon'
	,icon: root_dir_html+'/common/icons/toolbar_icons/indietro-dav.png'
	,scale: 'medium'
    });
    actions["previous"] = previous_zoom;
    toolbarItems.push(previous_zoom);

    next_zoom = new GeoExt.Action({
        text: "",
        control: ctrl.next,
        disabled: true,
        tooltip: "zoom successivo"
	,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
        ,icon: root_dir_html+'/common/icons/toolbar_icons/avanti-dav.png'
        ,scale: 'medium'
    });
    actions["next"] = next_zoom;
    toolbarItems.push(next_zoom);

toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));


///////////// CONTROL TOOLS ////////////

        // SelectFeature control, a "toggle" control
        function selected(feature) {
            console.log("select:"+ feature.layer.name +":"+ feature.id);
	    //console.log("multiselect:" + this.multipleSelect()); //se uso il box e' true, altrimenti e' false
	    //multiselect = this.multipleSelect();
	    //ha qualche problema, pare come sia un ritardo...poi bisognerebbe reinizializzarlo a false quando si sgancia il pulsante.
        }
	function boxEnd(feature) {
            //console.log(feature);
            //OK! Devo stoccare i layer con feature selezionate in un array, da passare a fasi successive:
            multiselect_object = {}; //lo reinizializzo ogni volta
	    var layers = feature.layers;
	    for(var l=0; l<layers.length; ++l) {
                layer = layers[l];
//console.log(layer);
		//lavoro solo sui layer visibili:
		if (!layer.getVisibility()) {
                  continue;
                }
		multiselect_layers = {};
		multiselect_features = [];
		ol_bounds = new OpenLayers.Bounds(); 
		for(var i=0, len = layer.selectedFeatures.length; i<len; ++i) {
                    var feature = layer.selectedFeatures[i];
		    // check if the feature is displayed
	            if (!feature.getVisibility()) {
	              continue;
	            }
		    multiselect_features.push(feature);
		    ol_bounds.extend(feature.geometry.getBounds());
		}
		multiselect_layers['name'] = layer.name;
		multiselect_layers['features'] = multiselect_features;
		multiselect_layers['bounds'] = ol_bounds;
		multiselect_object[layer.id] = multiselect_layers;
	    }
	    //console.log(multiselect_layers);
	    //Apro la finestra di dialogo con la tabella dei layer selezionati.
	    multiselect_table_open(multiselect_object);
        }
	multiSelectCtrl = new OpenLayers.Control.SelectFeature(
                layers_to_multiselect,
                {
                    //onSelect:selected, //e' cmq un comando incrementale
                    //onUnselect:unselected, //e' cmq un comando incrementale
                    clickout: true, toggle: false,
                    multiple: false, hover: false,
                    box: true
                    ,toggleKey: "ctrlKey" // ctrl key removes from selection
                    ,multipleKey: "shiftKey" // shift key adds to selection
                }
        );
        multiselect_control = new GeoExt.Action({
                text: "",
                control: multiSelectCtrl,
		//devo creare un handler per riattivare la selezione normale:
		handler: function(e) {
			ispressed=e.pressed;
			multiselect = e.pressed;
			if (ispressed==true) {
			    selectCtrl.deactivate();
			    multiSelectCtrl.events.register("boxselectionend", layers_to_multiselect, boxEnd);
			}
			else {
			    selectCtrl.activate();
			    multiSelectCtrl.events.unregister("boxselectionend", layers_to_multiselect, boxEnd);
			}
			//console.log(e.pressed);
		},
                //control: selectCtrl,
                map: map, pressed: false,
                // button options:
                toggleGroup: "controls", //group: "controls",
                //allowDepress: false,
                tooltip: "seleziona oggetti multipli"
                // check item options:
                ,enableToggle: true
                ,checked: false
                ,xtype:'tbbutton', cls:'x-btn-icon'
                ,icon:root_dir_html+'/common/icons/toolbar_icons/multiselect.png', scale:'medium'
                //,hidden:true
        });
        actions["select"] = multiselect_control;
//toolbarItems.push(select_control);

        /* Navigation control and MeasureTools controls in the same toggle group: */
        //Button for PAN control:
        pan_control = new GeoExt.Action({
                text: "",
                control: new OpenLayers.Control.Navigation(),
                map: map,
                pressed: true, //in origine false
                // button options:
                //toggleGroup: "controls", group: "controls",
                allowDepress: false, tooltip: "navigate the map"
                // check item options:
                ,enableToggle:true //in origine false
                ,checked:true //in origine false
                ,xtype:'tbbutton', cls:'x-btn-icon'
                ,icon:root_dir_html+'/common/icons/toolbar_icons/cpan.png', scale:'medium'
                ,hidden:true
        });
        actions["pan"] = pan_control;

        toolbarItems.push(pan_control);

//toolbarItems.push("-");

        // Button for Measure-distance controls
        misura_lunghezza = new GeoExt.Action({
                text: "",
                //enableToggle: true,
                toggleGroup: "controls", group: "controls",
                control: length,
                map: map,
                tooltip: "misura una lunghezza"
                ,xtype:'tbbutton', cls:'x-btn-icon'
                ,icon:root_dir_html+'/common/icons/toolbar_icons/misuralinea.png', scale:'medium'
        });
        actions["distanza"] = misura_lunghezza;
        //toolbarItems.push(action); //li aggiungo alla fine per ragioni di estetica

        // Button for Measure-area controls
        misura_area = new GeoExt.Action({
                text: "",
                //enableToggle: true,
                toggleGroup: "controls", group: "controls",
                control: area,
                map: map,
                tooltip: "misura un'area"
                ,xtype:'tbbutton', cls:'x-btn-icon'
                ,icon:root_dir_html+'/common/icons/toolbar_icons/misuraarea.png', scale:'medium'
        });
        actions["area"] = misura_area;
        //toolbarItems.push(action); //li aggiungo alla fine per ragioni di estetica

	// Button for Measure-area controls
	misura_heading = new GeoExt.Action({
                text: "",
                toggleGroup: "controls", group: "controls",
                control: heading,
                map: map,
                tooltip: "misura azimuth"
                ,xtype:'tbbutton', cls:'x-btn-icon'
                ,icon:root_dir_html+'/common/icons/toolbar_icons/misuraheading.png', scale:'medium'
        });
        actions["heading"] = misura_heading;


}
/////////// FINE FUNZIONE TOOLBAR_TOOLS_DEFAULT ////////////


//Metto fuori queste funzioni in modo tale da poterle richiamare anche passadno un indirizzo da URL:
function showBasicURL(address) {
	address = typeof address !== 'undefined' ? address : null; //definisco valore di default
        advancedOptions = EXAMPLE_BASIC;
	//var query = search_OSM.getValue();
	if (address!="" && address) {
	  var address = address.replace(/_/g, " ");
	  var query = address;
console.log("Address for nominatim: "+address);
	}
	else var query = $('#indirizzo_OSM').val();
        if (query == "")
            {
                advancedOptions='';
                markers.removeMarker(marker);
            }
        else {
           var address = 0;
           var limit = 1;
           advancedOptions += "&q=" + query + "&countrycodes=IT,FR,CH,AT,ES,PT,DE,SI,HR";
           if(address != ""){advancedOptions += "&addressdetails=" + address;}
           if(limit != ""){advancedOptions += "&limit=" + limit;}
           var safe = advancedOptions; //safe e' l'url richiamata
        }
};
function doBasicClick(address) {
	address = typeof address !== 'undefined' ? address : null; //definisco valore di default
        searchType = 'basic';
        var script = document.createElement('script');
        script.type = 'text/javascript';
        showBasicURL(address);
        if (advancedOptions!='') {
            var newURL = advancedOptions;
            script.src = newURL;
            document.body.appendChild(script);
        }
};

/////////// INIZIO TOOLS AGGIUNTIVI DA RICHIAMARE SECONDO DB ////////////
function toolbar_tools_extension() {

	//// SEARCH /////
//Search con NOMINATIM-OSM:
//URL di Nominatim che richiama la funzione "get_latlon_nominatim":
/*function showBasicURL() {
        advancedOptions = EXAMPLE_BASIC;
        //var query = document.getElementById("e1_query").value;
        var query = search_OSM.getValue();
	if (query == "")
	    {
		advancedOptions='';
		markers.removeMarker(marker);
	    }
	else {
           var address = 0;
           var limit = 1;
           advancedOptions += "&q=" + query + "&countrycodes=IT,FR,CH,AT,ES,PT,DE,SI,HR";
           if(address != ""){advancedOptions += "&addressdetails=" + address;}
           if(limit != ""){advancedOptions += "&limit=" + limit;}
           var safe = advancedOptions; //safe e' l'url richiamata
	}
};
//Richiama l'url di Nominatim
function doBasicClick() {
        searchType = 'basic';
	var script = document.createElement('script');
	script.type = 'text/javascript';
	showBasicURL();
	if (advancedOptions!='') {
	    var newURL = advancedOptions;
	    script.src = newURL;
            document.body.appendChild(script);
	}
};
*/
var search_OSM = new Ext.form.TextField({
        id:"indirizzo_OSM",
        name:"indirizzo_OSM",
        name:"indirizzo_OSM",
        tag: "input",
        value:"",
        emptyText:"Cerca un indirizzo:CITTA',NAzione...",
        width: 180,
        selectOnFocus: true,
        focus: true,
	hidden: search_OSM_hidden,
        listeners: {
        specialkey: function(f,e){
                if (e.getKey() == e.ENTER) {
                        //alert("about to submit");
                        doBasicClick();
                        //myform.getForm().submit();
                }
        }
        }
});
search_OSM.on('afterrender', function(){
    Ext.QuickTips.register({ target: search_OSM.getEl(), text: "Ricerca con Nominatim di OSM" });
});
toolbarItems.push(search_OSM);


toolbarItems.push(new Ext.Toolbar.Spacer({width:5}));



///// COMBO BOX per la scelta di una stazione meteo e zoom: /////
//Dovresti capire come caricare da subito i dati nello store...
//if (webgis=='expo2015') store_combo='store_meteoidrolm';
tooltip_combo = "Prima di poter selezionare una stazione meteo e' necessario attivare il layer";
emptytext_combo = "Seleziona una stazione...";
displayField_combo = "denominazione";

if (webgis.indexOf("expo2015")>=0 || webgis.indexOf("arpalombardia")>=0 || webgis.indexOf("thefloatingpiers")>=0) {
    //store_combo='store_meteoidrolm';
    store_combo='store_last_termalm';
}
else if (webgis.indexOf("rischioindustriale") >= 0) {
    store_combo='store_stabrir';
    tooltip_combo = "Prima di poter selezionare uno stabilimento e' necessario attivarne il layer";
    emptytext_combo = "Seleziona uno stabilimento...";
    displayField_combo = "nome_stabilimento";
}
else {store_combo='store_meteoidro';}
var combo = new Ext.form.ComboBox({
    xtype: 'combo',
    mode: 'local',
    tooltip: tooltip_combo,
    store: eval(store_combo),
    displayField: displayField_combo,
    valueField: "feature",
    // The minimum number of characters the user must type before autocomplete and typeAhead activate 
    //minChars: 1,
    emptyText: emptytext_combo,
    forceSelection: true,
    selectOnFocus:true,
    typeAhead: true,
    triggerAction: "all"
    ,hidden: combo_hidden
    //,queryMode : 'remote'
    // set this to true if the map should automatically zoom in to the selected feature
    ,autoZoomIn: true
    //method: 'GET',
    //enableKeyEvents: true
    //,renderTo: document.body
    ,listeners:{
	select:function(combo,record,index){
	    var key = record.get(combo.valueField);
            mapPanel.map.setCenter(key.geometry.getBounds().getCenterLonLat(), 11);
            //mapPanel.map.setCenter(key.geometry.getBounds().getCenterLonLat(), 11); //perche' era scritto 2 volte?
	}
    }
});
combo.on('afterrender', function(){
    Ext.QuickTips.register({ target: combo.getEl(), text: tooltip_combo });
});
toolbarItems.push(combo);


/* COMBO BOX per i LAYER -  IN SVILUPPO*/
if (devel==1) {
  combo_layers_hidden = false;
}
var layers_store = new Ext.data.ArrayStore({
        id: 0,
	//autoLoad: true, //quando true pare scaricarsi oltre 1Mb di dati..perche' mai?
        fields: layers_fields, //variabile definita su local_script_db.php e presa dal DB campo layers_data_store
        data: layers_data //variabile definita su local_script_db.php e presa dal DB campo layers_data_store
});
layers_store.sort('displayText', 'ASC');
//console.log(layers_store);

//console.log(layers_to_multiselect);
//console.log(eval(store_meteoidro));

tooltip_layers_combo = "Scegli layer";
emptytext_combo = "Seleziona un layer...";
var combo_layers = new Ext.form.ComboBox({
    id: 'combo_layers',
    xtype: 'combo',
    mode: 'local',
    //queryMode: 'local',
    tooltip: tooltip_layers_combo,
    store: layers_store,
    displayField: "displayText",
    valueField: "myId",
    // The minimum number of characters the user must type before autocomplete and typeAhead activate
    //minChars: 1,
    emptyText: emptytext_combo,
    //mode: "local",
    forceSelection: true,
    selectOnFocus:true,
    typeAhead: true,
    triggerAction: "all"
    ,hidden: combo_layers_hidden
    // set this to true if the map should automatically zoom in to the selected feature
    ,autoZoomIn: true
    //method: 'GET',
    //enableKeyEvents: true
    //,renderTo: document.body
    ,listeners:{
	// delete the previous query in the beforequery event or set combo.lastQuery = null (this will reload the store the next time it expands)
        beforequery: function(qe) {
            delete qe.combo.lastQuery;
	    //questo metodo pare funzionare ma solo alla prima selezione..oppure e' lastQuery:'' che ha funzionato?
        },
	beforeselect:function(combo,record,index){
	    if (combo.lastSelectEvent && combo.lastSelectEvent!='none') eval(combo.lastSelectEvent).setVisibility(false); //spengo il layer selezionato precedentemente, se esiste
        },
        select:function(combo,record,index){
            var key = record.get(combo.valueField); //in questo caso e' il campo "myId", cioe' il nome OL del layer
	    combo.lastSelectEvent = key; //salvo l'elemento selezionato per deselezionarlo successivamente
	    //zoommo la mappa sulla totale estensione del layer selezionato così da esser sicuro carichi tutti gli elementi:
	    //bounds_layer = eval(key).getDataExtent(); //restituisce null, non capisco perche'...
	    //extent_layer = [bounds_layer.left, bounds_layer.bottom, bounds_layer.right, bounds_layer.top];
	    //mapPanel.map.zoomToExtent(bounds_layer);
	    //Risolvo riportando la mappa alla vista iniziale:
	    initial_view();
	    feature_combo.lastQuery = ''; //resetto la query della combo...a cosa serve esattamente?
	    if (key=='none') {
		feature_combo.emptyText = "Scegli prima un layer valido...";
		feature_combo.disable();
		Ext.getCmp('feature_combo').clearValue();
	    }
	    else {
	      feature_combo.enable(); //abilito la selezione dell'elemento
	      feature_combo.emptyText = "Seleziona un elemento...";
	      eval(key).setVisibility(true); //accendo il layer selezionato
	      //adesso cerco all'interno dell'array "layers_data" lo store relativo al layer selezionato:
	      for (i = 0; i < layers_data.length; i++) {
		if (layers_data[i].indexOf(key) >=0) {
		  combo.store_el = layers_data[i][2];
            //console.log(layers_data[i][2]);
		}
	      }
	      //feature_combo.store = eval(combo.store_el); //funziona ma non visualizza i campi...
	      //Oppure usando la chiamata Ext:
	      //Ext.getCmp('feature_combo').store = eval(combo.store_el);
	      myStore = eval(combo.store_el);
	      /*Ripuliamo prima la combo e cerco il nuovo campo da mostrare il quale deve avere nello store id:'pk' --> in realta in questo modo non funziona, non so perche aggiorna solo il primo cambiamneto ma non i successivi..
	      for (var j=0; j<myStore.fields.items.length; j++) {
		if (myStore.fields.items[j].id && myStore.fields.items[j].id=='pk') {
		  displayField_feat_combo = myStore.fields.items[j].name;
		}
	      }
	      Ext.getCmp('feature_combo').displayField = displayField_feat_combo;*/
	      Ext.getCmp('feature_combo').clearValue();
	      Ext.getCmp('feature_combo').bindStore(myStore);
	    }//fine else nel caso in cui si sia selezionato effettivamente un layer
        }
    }
});
combo_layers.on('afterrender', function(){
    Ext.QuickTips.register({ target: combo_layers.getEl(), text: tooltip_layers_combo });
});
toolbarItems.push(combo_layers);
toolbarItems.push(new Ext.Toolbar.Spacer({width:5}));

//COMBO per le FEATURES:
var displayField_feat_combo = "comboDisplay"; //dovrebbe essere dinamico..ma come? definisco un mapping nei vari store
var tooltip_feat_combo = "Scegli un elemento";
var emptytext_feat_combo = "Scegli prima un layer....";
feature_combo = new Ext.form.ComboBox({
    id: 'feature_combo',
    disabled: true,
    xtype: 'combo',
    mode: 'local',
    queryMode : 'remote',
    tooltip: tooltip_feat_combo,
    //store: eval(store_combo),
    store: store_default, // this is a default empty store to start with
    displayField: displayField_feat_combo, //provo a commentare per vedere cosa prende di default..niente
    valueField: "feature",
    emptyText: emptytext_feat_combo,
    forceSelection: true,
    selectOnFocus:true,
    typeAhead: true,
    triggerAction: "all"
    //To make sure the filter in the store is not cleared the first time the ComboBox trigger is used:
    ,lastQuery: ''
    ,hidden: combo_layers_hidden
    ,autoZoomIn: true
    ,listeners:{
        select:function(combo,record,index){
            var key = record.get(combo.valueField);
            mapPanel.map.setCenter(key.geometry.getBounds().getCenterLonLat(), 11);
        }
    }
});
feature_combo.on('afterrender', function(){
    Ext.QuickTips.register({ target: feature_combo.getEl(), text: tooltip_feat_combo });
});
toolbarItems.push(feature_combo);


//// PANNELLO DI HELP E INFORMATIVO: ////

function piene_panel() {
        var panel5 = new Ext.Panel({title:"Po", html: content_panel5});
        var panel6 = new Ext.Panel({title:"Tanaro", html: content_panel6});

        var tabs = new Ext.TabPanel({
                activeTab: 0,
                defaults: {//autoHeight: true,
			height:'100%', bodyStyle: 'padding:10px',
                autoScroll:true},
                items:[
                        panel5
                        ,panel6
                ]
        });

  new Ext.Window({
        title            : 'Informazioni sulle piene'
        ,width           : mapPanel.getWidth() * 0.68
        ,height          : mapPanel.getHeight() * 0.70
        ,hideMode        : 'visibility'
        ,id              : 'myFrameWin'
        ,hidden          : true   //wait till you know the size
        ,plain           : true
        ,constrainHeader : true
        ,minimizable     : true
        ,ddScroll        : false
        ,border          : false
        ,bodyBorder      : false
        ,layout          : 'fit'
        ,plain           : true
        ,maximizable     : true
        ,buttonAlign     : 'center'
        ,modal           : true
        //,html          : content
        ,items           : tabs
        ,fbar: [{
                text: 'Ok, chiudi',
                handler: function () {
                        Ext.getCmp('myFrameWin').close();
                }
        }]
  }).show();

} //Fine della funzione che apre una window di PIENE


function info_panel() {
	var panel2 = new Ext.Panel({title:"Crediti", html: content_panel2});
        var panel1 = new Ext.Panel({title:"Help", html: content_panel1});
	var panel0 = new Ext.Panel({title:"Avvisi", html: content_panel0});
	var panel_expo1 = new Ext.Panel({title:"Help", html: content_panel_expo1});
	var panel_tfp = new Ext.Panel({title:"Help", html: content_panel_tfp});
	var panel_expo2 = new Ext.Panel({title:"Crediti", html: content_panel_expo2});
	//var panel3 = new Ext.Panel({title:"Credits", html: content_panel3});
	if (webgis=="expo2015") {
	    items_panels = [panel_expo2, panel_expo1];
	}
	else if (webgis=="thefloatingpiers") {
            items_panels = [panel_expo2, panel_tfp];
        }
	else if (webgis=="nivologia") {
            items_panels = [panel2, panel_expo1];
	}
	else if (webgis=="areu118") {
            items_panels = [panel1, panel_expo2];
        }
	else items_panels = [panel0, panel1, panel2];
	var tabs = new Ext.TabPanel({
		activeTab: 0,
		defaults: {//autoHeight: true,
		height:'100%', bodyStyle: 'padding:10px',
		autoScroll:true},
		//items:[	panel0	,panel1	,panel2
			//,panel3			
			/*New tab of type "textfield:
			,{title: 'Vehicle',
				layout: 'form',
				//defaults: {width: 230},
				defaultType: 'textfield',
				items: [{}]
			}*/
		//]
		items: items_panels
	});
	
  new Ext.Window({
        title            : 'Avvisi ed informazioni sul WebGIS "IRIS" '
        ,width           : mapPanel.getWidth() * 0.68, height:mapPanel.getHeight() * 0.70
        ,hideMode        : 'visibility', id:'myFrameWin'
        ,hidden          : true   //wait till you know the size
        ,plain           : true, constrainHeader:true
        ,minimizable     : true, ddScroll:false
        ,border          : false, bodyBorder:false
        ,layout          : 'fit', plain:true
        ,maximizable     : true, buttonAlign:'center'
	,modal		 : true
        //,html		 : content
        ,items		 : tabs
	,fbar: [{
		text: 'Ok, chiudi',  
		handler: function () {  
			Ext.getCmp('myFrameWin').close();  
		}  
	}]
  }).show();

} //Fine della funzione che apre una window di HELP


var dialog = new Ext.Button({
	text: "",
	handler: info_panel,
	tooltip: "avvisi e informazioni su IRIS"
	,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
        //,icon: root_dir_html+'/common/icons/toolbar_icons/info2-dav.png'
	,icon: root_dir_html+'/common/icons/toolbar_icons/'+icona_info
	,iconCls:'toolbar_icon'
        ,scale:  'medium'
	,hidden: dialog_hidden
});
toolbarItems.push(dialog);


//Provo ad aggiungere una finestra NON modale per ospitare in futuro l'animazione dei layer:
var win;
var restore_closed_raster = []; //qui ospito la lista dei layer raster eventualmente chiusi all'apertura dell'animazione
function get_active_layer() {
	//Individuo i raster accesi per spegnerli e ripristinarli successivamente alla chiusura dell'anime_panel:
	//NB: non giro sui layer_vector perche' il sistema sclera non ho capito perche'...
	for (var i=0; i < mapPanel.map.layers.length; i++) {
		var layers_to_remove = mapPanel.map.layers[i];
		var width_image = layers_to_remove.getImageSize().w;
		if (width_image != 256) { //256 e' la dimensione di tutti i layer NON raster
			var image_visibility = layers_to_remove.getVisibility();
			if (image_visibility==true) {
				//Aggiungo il layer nella lista dei layer da riaccendere alla chiusura dell'anime_panel:
				restore_closed_raster.push(layers_to_remove.name);
				layers_to_remove.setVisibility(false);
			}
		}
	} //fine del ciclo for
}
//Rimuovo il layer d'animazione alla chiusura della finestra o lo riattivo alla riapertura:
function remove_anime_layer(visibility) {
	for (var i=0; i < mapPanel.map.layers.length; i++) {
		var anime_layer = mapPanel.map.layers[i];
		if ( anime_layer.name.indexOf('animazione2') > -1 ) {
			//mapPanel.map.removeLayer(anime_layer);
			anime_layer.setVisibility(visibility);
		//non lo elimino perche dopo un altra apertura della finestra resta attiva la variabile anime_rain e mi da un errore sulla rimozione di questo layer, che in realta non esiste piu in mappa. cosi lo nascondo solamente
		}
	}
	//Ripristino eventuali raster spenti per l'animazione alla chiusura del pannello:
	if (visibility==false) {
	   var layer_to_restore;
	   for (var j=0; j < restore_closed_raster.length; j++) {
		layer_to_restore = map.getLayersByName(restore_closed_raster[j])[0];
		layer_to_restore.setVisibility(true);
           }
	   restore_closed_raster = []; //resetto l'array dei layer da riattivare
	}
	//In ogni caso spengo il layer sui livelli geopotenziali:
	hg700.setVisibility(false);
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
}
function anime_panel() {
//spengo i layer-raster accesi e ne recupero i nomi per ripristinarli successivamente alla chiusura del pannello:
get_active_layer();
if(!win){
        win = new Ext.Window({
                //applyTo:'hello-win',
                title: "Animazione (chiudere per spegnere il layer)",
                layout:'fit',
                width:330,
                height:250,
		x:5, y:150,
		closable:false, //la finestra si chiude solo tramite il pulsante 'close'
                closeAction:'hide',
                plain: true,
                html: content_panel_anime,
                buttons: [
		/*
		{
                    text:'Submit',
                    disabled:true
                },
		*/
		{
                    text: 'Close',
                    handler: function(){
			remove_anime_layer(false);
                        win.hide();
			//win.update(content_panel_anime);
                    }
                }]
		, listeners:{
            	    close: function(){alert('ciao');}
            	    //,scope:this
        	}
            });
        }
else {
	//remove_anime_layer(true);
	win.update(content_panel_anime);
}
win.show(this);
}
var anime = new Ext.Button({
        text: "",
        handler: anime_panel,
        tooltip: "Animazione radar"
        ,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
        ,icon: root_dir_html+'/common/icons/toolbar_icons/film2-26.png'
        ,scale:  'medium'
	,hidden: anime_hidden
});
//if (webgis!="pubblico") {
    toolbarItems.push(anime);
//}
//FINE prova pannello ANIMAZIONE


var dialog0 = new Ext.Button({
	text: "",
	handler: piene_panel,
	tooltip: "strumenti: gestione PIENE"
	,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
        ,icon: root_dir_html+'/common/icons/toolbar_icons/flood_dav.png'
        ,scale:  'medium'
	,hidden: dialog0_hidden
});
//if (webgis=="centrofunzionale") {
	toolbarItems.push(dialog0);
//}

var content_panel_upload = "<iframe width='100%' height='90%' src='"+root_dir_html+"/common/scripts/upload_doc.php?webgis="+webgis+"&type=upload&root_dir_html="+root_dir_html+"' seamless><p>Your browser does not support iframes.</p></iframe>";
var content_panel_download = "<iframe width='100%' height='90%' src='"+root_dir_html+"/common/scripts/upload_doc.php?webgis="+webgis+"&type=download&root_dir_html="+root_dir_html+"' seamless><p>Your browser does not support iframes.</p></iframe>";
function upload_panel() {
        var panel0 = new Ext.Panel({title:"Sezione Upload", html: content_panel_upload});
	var panel1 = new Ext.Panel({title:"Sezione Download", html: content_panel_download});
        var tabs = new Ext.TabPanel({
                activeTab: 0,
                defaults: {//autoHeight: true,
			height:'100%', bodyStyle: 'padding:10px',
                autoScroll:true},
                items:[panel0, panel1]
        });

new Ext.Window({
        title            : 'Carica documentazione sul server e sul DB'
        ,width           : mapPanel.getWidth() * 0.68, height:mapPanel.getHeight() * 0.70
        ,hideMode        : 'visibility', id:'myFrameWin'
        ,hidden          : true   //wait till you know the size
        ,plain           : true, constrainHeader:true
        ,minimizable     : true, ddScroll:false
        ,border          : false, bodyBorder:false
        ,layout          : 'fit', plain:true
        ,maximizable     : true, buttonAlign:'center'
        ,modal           : true
        //,html          : content
        ,items           : tabs
        ,fbar: [{
                text: 'Ok, chiudi',
                handler: function () {
                        Ext.getCmp('myFrameWin').close();
                }
        }]
}).show();

} //Fine della funzione che apre una window di UPLOAD

var dialog_upload = new Ext.Button({
        text: "",
        handler: upload_panel,
        tooltip: "carica file sul server e sul DB"
        ,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
        ,icon: root_dir_html+'/common/icons/toolbar_icons/up_and_download-dav.png'
        ,scale:  'medium'
	,hidden: dialog_upload_hidden
});
//if (webgis=="rischioindustriale") {
toolbarItems.push(dialog_upload);
//}


list_alert_disable = true;
list_alert_tooltip = "Funzione avvisi temporali non attiva";
if (alert_system==1) {
    list_alert_disable = false;
    list_alert_tooltip = "Apri la finestra degli avvisi sui temporali";
}
var list_alert = new Ext.Button({
        handler: function() { closed_from_user=0; listCheck(); }
        ,tooltip: list_alert_tooltip
        //,xtype:'tbbutton'
        //,text: "Storm Alert"
        //,autoWidth: true
        //,ctCls: 'x-btn-over'
        ,disabled: list_alert_disable
	,icon: root_dir_html+'/common/icons/toolbar_icons/storm_intenso_lightning_black.png'
	,scale:  'medium'
	,cls: 'x-btn-icon'
	,hidden: list_alert_hidden
});
//if (webgis=="expo2015" || devel==1 || alert_system==1) {
    toolbarItems.push(list_alert);
//}

var flanis_anime = new Ext.Button({
        handler: function() { flanis_animation(); }
        ,tooltip: "Apri/Chiudi finestra anteprima animazione radar"
	,icon: root_dir_html+'/common/icons/toolbar_icons/radar_flanis.png'
        ,scale:  'medium'
        ,cls: 'x-btn-icon'
	,hidden: flanis_anime_hidden
});
//if (webgis=="expo2015" && devel==1) {
    toolbarItems.push(flanis_anime);
    toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));
//}

var expo_bullettin = new Ext.Button({
        handler: function() {window.open(root_dir_html+'/common/DATA/expo2015/bollettino_prob.pdf');}
        ,tooltip: "Apri previsioni probabilistiche"
        ,xtype:'tbbutton'
	//PER ICONA:
	//,text: ""
        //,cls: 'x-btn-icon'
        //,icon: root_dir_html+'/common/icons/toolbar_icons/bar_report26.png'
        //,scale:  'medium'
        //PER TESTO:
        ,text: "Previsioni Probabilistiche"
	,autoWidth: true
	,ctCls: 'x-btn-over'
	,hidden: expo_bullettin_hidden
});
//if (webgis=="expo2015") {
toolbarItems.push(expo_bullettin);
toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));
//}

var expo_meteo = new Ext.Button({
        handler: function() {window.open(root_dir_html+'/common/DATA/expo2015/bollettino_meteo.pdf');}
        ,tooltip: "Apri bollettino meteo"
        ,xtype:'tbbutton'
        ,text: "Bollettino Meteo"
        ,autoWidth: true
        ,ctCls: 'x-btn-over'
	,hidden: expo_meteo_hidden
});
//if (webgis=="expo2015") {
toolbarItems.push(expo_meteo);
//}


function cookies_panel() {
        var panel_map = new Ext.Panel({title:"Generale", html: cookie_map});
        var panel_layers = new Ext.Panel({title:"Layers", html: cookie_layers});
	var panel_baselayers = new Ext.Panel({title:"Base Layers", html: cookie_baselayers});
	var panel_warning = new Ext.Panel({title:"Warning", html: cookie_warning});

        var tabs = new Ext.TabPanel({
                activeTab: 0,
                defaults: {//autoHeight: true,
                  height:'100%', bodyStyle: 'padding:10px',
                  autoScroll:true},
                items:[
                        panel_map
                        ,panel_layers
			,panel_baselayers
			,panel_warning
                ]
        });
new Ext.Window({
        title            : 'Impostazioni WebGIS personalizzate (tramite uso di cookie tecnici)'
        ,width           : mapPanel.getWidth() * 0.68
        ,height          : mapPanel.getHeight() * 0.70
        ,hideMode        : 'visibility'
        ,id              : 'myCookieWin'
        ,hidden          : true   //wait till you know the size
        ,plain           : true
        ,constrainHeader : true
        ,minimizable     : true
        ,ddScroll        : false
        ,border          : false
        ,bodyBorder      : false
        ,layout          : 'fit'
        ,plain           : true
        ,maximizable     : true
        ,buttonAlign     : 'center'
        ,modal           : true
        //,html          : content
        ,items           : tabs
        ,fbar: [{
                text: 'chiudi questa finestra',
                handler: function () {
                        Ext.getCmp('myCookieWin').close();
                }
        }]
}).show();
} //Fine della funzione che apre una window di COOKIE

var cookies_diy = new Ext.Button({
        handler: cookies_panel
        ,tooltip: "Impostazioni utente"
        ,icon: root_dir_html+'/common/icons/toolbar_icons/mixer.png'
        ,scale:  'medium'
        ,cls: 'x-btn-icon'
	,hidden: cookies_diy_hidden
});
//if (devel==1) {
    toolbarItems.push(cookies_diy);
    toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));
//}

var news_btn = new Ext.Button({
	id:'news_ext_btn',
        handler: function() { news_message(); }
        ,tooltip: "Mostra ultime novita' del WebGIS IRIS"
        ,icon: root_dir_html+'/common/icons/toolbar_icons/news.png'
        ,scale:  'medium'
        ,cls: 'x-btn-icon'
	,hidden: news_btn_hidden
});
//if (devel==1) {
    toolbarItems.push(news_btn);
    //toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));
//}

/*
//EXPORT MAP: sviluppo lasciato cadere, troppo complesso
var export_btn = new Ext.Button({
        id:'export_btn',
        handler: function() { exportMap(); }
        ,tooltip: "Esporta Mappa"
        ,icon: root_dir_html+'/common/icons/toolbar_icons/news.png'
        ,scale:  'medium'
        ,cls: 'x-btn-icon'
        //,hidden: news_btn_hidden
});
if (devel==1) {
    toolbarItems.push(export_btn);
    toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));
}
*/

// MENU A TENDINA con LINK a siti esterni:
/*var combo_link = new Ext.form.ComboBox({
    xtype: 'combo',  typeAhead: true,  triggerAction: 'all',  lazyRender:true,
    mode: 'local',  valueField: 'link',  displayField: 'name',
    store: new Ext.data.ArrayStore({
	id: 0,
	fields: ['id', 'name', 'link'],
	data: [
	    [0, 'ODINO', 'http://odino.arpa.piemonte.it/?q=node/236'],
	    [1, 'DPC', 'https://sc05.arpa.piemonte.it/sc05/pioggia.jsp']
	]
    }),
    width:75
    ,listeners:{
        select:function(combo,record,index){
            var key = record.get(combo.valueField);
	    var win = window.open(key, '_blank');
	    win.focus();
        }
    }
});
if (devel==1) toolbarItems.push(combo_link);
combo_link.on('afterrender', function(){
    Ext.QuickTips.register({ target: combo_link.getEl(), text: "Link a risorse esterne" });
});
*/
//oppure uso menu item??
function onItemClick(item){
  var win = window.open(item.url, '_blank');
  win.focus();
}
//var split_link = new Ext.Toolbar.SplitButton({
var split_link = new Ext.Button({
    text: 'Links',
    //handler: onButtonClick,
    tooltip: {text:'Link a risorse esterne', title:'Links'},
    //,xtype:'tbbutton', cls: 'x-btn-icon', icon: root_dir_html+'/common/icons/toolbar_icons/flood_dav.png'
    hidden: split_link_hidden,
    //iconCls: 'blist',
    listeners : {
        mouseover: function(){
            hideTask.cancel();
            if(!this.hasVisibleMenu()){
                this.showMenu();
            }
        },
        mouseout: function(){
            hideTask.delay(250);
        }
    },
    //Menus can be built/referenced by using nested menu config objects
    menu: {
	plain: true,
	showSeparator: false, //per non mostrare la icona separatrice a sinistra, ma non funziona
	listeners: {
	  //Azzero o reimposto il ritardo di chiusura del pulsante se sono dentro al menu:
          mouseover: function(){
                hideTask.cancel();
            },
            mouseout: function(){
                hideTask.delay(250);
            }
        },
        items: [{
            text: '<i>Tabelle pluvio</i>', url: 'https://www.arpa.piemonte.gov.it/radar/common/DATA/tab_aggiornamento/tabelle_pluvio.pdf', handler: onItemClick
        }, {
            text: '<i>Tabelle idro</i>', url: 'https://www.arpa.piemonte.gov.it/radar/common/DATA/tab_aggiornamento/tabelle_idro.pdf', handler: onItemClick
        }, {
            text: '<i>Odino</i>', url: 'http://odino.arpa.piemonte.it/?q=node/236', handler: onItemClick
        }, {
            text: '<i>SC05</i>', url: 'https://sc05.arpa.piemonte.it/sc05/pioggia.jsp', handler: onItemClick
        }
	]
    }
});
var hideTask = new Ext.util.DelayedTask(split_link.hideMenu, split_link);
toolbarItems.push(split_link);


toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));


////////////////// ANIMAZIONE DEI LAYER SISMI E METEO ///////////////////

//Inserisco gli elementi definiti in "filter_strategy.js":
//SOSTITUITI ORMAI DAL NUOVO PANNELLO DI ANIMAZIONE!

toolbarItems.push("->");	


//Provo ad inserire la combo box per la scelta della scala:
var scaleStore = new GeoExt.data.ScaleStore({map: map});
var zoomSelector = new Ext.form.ComboBox({
    store: scaleStore,
    emptyText: "Zoom Level",
    tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',
    editable: false,
    triggerAction: 'all', // needed so that the combo box doesn't filter by its current content
    mode: 'local' // keep the combo box from forcing a lot of unneeded data refreshes
    ,width:100
    ,hidden: zoomSelector_hidden
});
zoomSelector.on('select',
    function(combo, record, index) {
        map.zoomTo(record.data.level);
    },
    this
);
map.events.register('zoomend', this, function() {
    var scale = scaleStore.queryBy(function(record){
        return this.map.getZoom() == record.data.level;
    });

    if (scale.length > 0) {
        scale = scale.items[0];
		//Provo a visualizzare dei numeri piu' significativi ma non serve a molto...
		//var scala_num = parseInt(scale.data.scale);
		//var digit_num = scala_num.toString().length;
		//if (digit_num>=5) {var migliaia = (scala_num/10000).toFixed(1);var zoom=migliaia*10000;}
		//else {var migliaia = (scala_num/1000).toFixed(2); var zoom=migliaia*1000;}
        zoomSelector.setValue("1 : " + parseInt(scale.data.scale));
	        //zoomSelector.setValue("1 : " + zoom);
    } else {
        if (!zoomSelector.rendered) return;
        zoomSelector.clearValue();
    }
});
toolbarItems.push(zoomSelector);

toolbarItems.push(new Ext.Toolbar.Spacer({width: 5}));


///////// PANNELLO GESTIONE DEI TICKETS: ///////

function tickets_panel() {
    var ticket0 = new Ext.Panel({title:"Tickets aperti", html: content_ticket0});
    //var ticket1 = new Ext.Panel({title:"Tickets chiusi", html: content_ticket1});
    var ticket2 = new Ext.Panel({title:"Inserire un ticket", html: content_ticket2});

    var ticket_tabs = new Ext.TabPanel({
		activeTab: 0,
		defaults: {//autoHeight: true,
			height:'100%', bodyStyle: 'padding:10px', autoScroll:true},
		items:[
			ticket0
			//,ticket1
			,ticket2
		]
    });

new Ext.Window({
	title            : 'Tickets WebGIS "IRIS"'
	,width           : mapPanel.getWidth() * 0.68, height:mapPanel.getHeight() * 0.70
	,hideMode        : 'visibility', id: 'myFrameWin'
	,hidden          : true   //wait till you know the size
	,plain           : true, constrainHeader:true, minimizable:true
	,ddScroll        : false, border:false
	,bodyBorder      : false, layout:'fit'
	,plain           : true, maximizable:true
	,buttonAlign     : 'center', modal:true
	//,html          : content
	,items           : ticket_tabs
	,fbar: [{
		text: 'Chiudi',
		handler: function () {
			Ext.getCmp('myFrameWin').close();
		}
	}]

}).show();

} //Fine della funzione che apre una window di TICKETS

/* Nella versione PUBBLICO lo disattivo:*/
var tickets = new Ext.Button({
	text: "",
	handler: tickets_panel,
	tooltip: "lascia un ticket"
	,xtype:'tbbutton'
        ,cls: 'x-btn-icon'
	,icon: root_dir_html+'/common/icons/toolbar_icons/ticket_davide.png'
        ,scale:  'medium'
	,hidden: tickets_hidden
});
//if (webgis=="centrofunzionale" || webgis=="rischioindustriale") {
toolbarItems.push(tickets);
//}


toolbarItems.push("-");


////////////// MEASURE TOOLS //////////////////////
//In teoria sarebbero dei tools di default ma per mantenere l'ordine sulla toolbar li devo scrivere qui in fondo:
//// TEST SELEZIONE MULTIPLA ////
if (multiselect_hidden==false)  toolbarItems.push(multiselect_control);
//toolbarItems.push(misura_lunghezza);
//toolbarItems.push(misura_area);
//toolbarItems.push(misura_heading);

if (devel==1) {
  toolbarItems.push({
  text: "menu",
  menu: new Ext.menu.Menu({
    items: [
	actions["distanza"],
	actions["area"],
        actions["heading"]
    ]
  })
  });
}
else {
  toolbarItems.push(misura_lunghezza);
  toolbarItems.push(misura_area);
  toolbarItems.push(misura_heading);
}



////////////// END OF TOOLBAR ITEMS //////////////////////

}
