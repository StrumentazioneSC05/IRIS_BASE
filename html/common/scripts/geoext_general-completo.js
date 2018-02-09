/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/

//FILE DI CONFIGURAZIONE DI GEOEXT COMPLETO VALE A DIRE CON COMMENTI E SVILUPPI VARI FALLITI

var options;
var store_grid, columns_grid, view_grid, collapsed_grid, gridPanel, selectCtrl;
var ctrl, toolbarItems = [], action, actions = {};

Ext.onReady(function() {

Ext.QuickTips.init();


/////////////////////// PRINT-PROVIDER TEST ////////////////////

	/*IL PRINT PROVIDER non funziona...
	// The printProvider that connects us to the print service
    var printProvider = new GeoExt.data.PrintProvider({
        method: "GET", // "POST" recommended for production use
        capabilities: printCapabilities, // from the info.json script in the html
        customParams: {
            mapTitle: "Printing Demo"
        }
    });
    // Our print page. Stores scale, center and rotation and gives us a page
    // extent feature that we can add to a layer.
    var printPage = new GeoExt.data.PrintPage({
        printProvider: printProvider
    });
    // A layer to display the print page extent
    var pageLayer = new OpenLayers.Layer.Vector();
    pageLayer.addFeatures(printPage.feature);
	// Legend can be optionally include on the printout
	var includeLegend; // controlled by the "Include legend?" checkbox
	*/
	
	
/////////////////////// MAPPA /////////////////////

	//Adesso a seconda del layer di base che voglio caricare scelgo le opzioni della mappa.

	//BASE_LAYERS=UNO --> caricamento per WMS Arpa WGS84-UTM
if (base_layers == 1) {
	options = {
        	projection        : new OpenLayers.Projection("epsg:32632"),
	        maxExtent         : new OpenLayers.Bounds(-2000000,3000000,3500000,7500000),
		restrictedExtent: new OpenLayers.Bounds(0,4000000,1500000,6000000),
        	maxResolution     : "auto",
		scales		  : [15000000, 8000000, 4000000, 2000000, 1000000, 500000, 250000, 100000, 50000, 25000, 10000, 5000],
		//minScale	  : 15000000,
		//maxScale	  : 1500,
	        //zoom            : 0,
        	//maxZoomLevel      : 12,
	        //numZoomLevels     : 22,
        	//center            : new OpenLayers.LonLat(800000,4669000),
	        units             : "m",
		displayProjection: new OpenLayers.Projection("epsg:32632")
		//,allOverlays: false
	};
} //Fine dell'IF se BASE_LAYERS=UNO

	//BASE_LAYERS=ZERO --> caricamento classico per GoogleMap e OSM:
else {
	options = {
		projection: new OpenLayers.Projection("epsg:900913")
		,units: "m"
		//maxResolution: "auto",		
		//Provo a risettare alcuni valori iniziali per aiutare TileCache:
	    	,maxResolution: 156543.0339
		,maxExtent: new OpenLayers.Bounds(-2000000,3500000,4000000,7500000)
		//maxExtent non viene riconosciuto, forse restrictedExtent si:
		//,restrictedExtent: new OpenLayers.Bounds(-2000000,3500000,4000000,7500000)
		,resolutions:[156543.03390000001, 78271.516950000005, 39135.758475000002, 19567.879237500001, 9783.9396187500006, 4891.9698093750003, 2445.9849046875001, 1222.9924523437501, 611.49622617187504, 305.74811308593752, 152.87405654296876, 76.43702827148438, 38.21851413574219, 19.109257067871095, 9.5546285339355475, 4.7773142669677737, 2.3886571334838869, 1.1943285667419434, 0.59716428337097172, 0.29858214168548586]
		,numZoomLevels: 20
		,tileSize: new OpenLayers.Size(256, 256)
		,displayProjection: new OpenLayers.Projection("epsg:4326")
		,allOverlays: false //e' un opzione di GeoExt, ma non ho ben capito a cosa serva...
		//,fractionalZoom: true
	};
} //Fine dell'ELSE se BASE_LAYERS=ZERO
	
	map = new OpenLayers.Map('map', options);

	
	
//////////////////// CARTE DI BASE ///////////////////
	
//CARICATE DAL FILE ESTERNO BASE_LAYERS.JS



///////////////////// TEST LOAD KML LAYER ////////////////////
	
	/*
	var geographic = new OpenLayers.Projection("EPSG:4326");
	var kml_layer = new OpenLayers.Layer.Vector("KML", {
		projection: geographic,
		strategies: [new OpenLayers.Strategy.Fixed()],
		protocol: new OpenLayers.Protocol.HTTP({
			url: "meteo/gino_line.kml",
			format: new OpenLayers.Format.KML({
				extractStyles: true,
				extractAttributes: true
			})
		})
		, styleMap: new OpenLayers.StyleMap({
			"default": new OpenLayers.Style({
				//graphicName: "circle",
				//pointRadius: 5,
				//fillOpacity: 0.5,
				fillColor: "#ffcc66",
				strokeColor: "#666633",
				strokeWidth: 10
			})
		})
	});
	*/
	

	
///////////////////// TOOLBAR ITEMS and MEASURE TOOLS ///////////////////


//Carico la funzione esterna per caricare tutti gli elementi della toolbar:
toolbar_tools();


////////////// END OF TOOLBAR ITEMS //////////////////////



///////////////// MAP PANEL //////////////////////////////
	
	/*Tutte le opzioni della mappa vanno messe qui dentro, nel MapPanel:*/
	mapPanel = new GeoExt.MapPanel({
		border: true,
		region: "center",
		map: map,		
		tbar: toolbarItems,
		center: [x_center, y_center], //Per OpenStreetMap
		zoom: zoom_center,
		//layers: [gtop, gmap, gsat, ghyb, osmLayer]
		layers: baselayer_to_load
		
		/*VECCHIE opzioni-sviluppi-test-etc:*/
		//renderTo: 'gxmap', //xtype: "gx_mappanel", //bbar: new Ext.Toolbar(),
		//height: height_map, //600, //width: width_map, //900, //center: [lon_center, lat_center],
		//title: 'A Simple GeoExt Map'
		/*
		items: [{ //Opacity slider
        	xtype: "gx_opacityslider", layer: mosaico, changeVisibility: true,
	        aggressive: true, vertical: true, height: 80, x: 15, y: 140,
        	plugins: new GeoExt.LayerOpacitySliderTip({template: "Opacity mosaico: {opacity}%"})
        	}]
		*/

		/*PRINT MAP: non funziona...
		bbar: ["->", {
	        	text: "Print",
	        	handler: function() {
        	        // convenient way to fit the print page to the visible map area
                	printPage.fit(mapPanel, true);
	                // print the page, optionally including the legend
        	        printProvider.print(mapPanel, printPage, includeLegend && {legend: legend});
		}
		}, {
		xtype: "checkbox",
	        boxLabel: "Include legend?",
        	handler: function() {includeLegend = this.checked}
	        }]
		*/
	});


	/*CARICO i layer provenienti dagli altri javascript:*/
	for (i=0; i<layers_to_load.length; i++) {
		mapPanel.map.addLayer(layers_to_load[i]);
	}


	/*Aggiungo i vari CONTROL alla mappa:*/		
	mapPanel.map.addControl(selectCtrl); //per la selezione degli elementi dei layers selezionabili
	selectCtrl.activate();
	
	mapPanel.map.addControl(new OpenLayers.Control.MousePosition());
	mapPanel.map.addControl(new OpenLayers.Control.KeyboardDefaults()); //ZoomBox pressing SHIFT.
	mapPanel.map.addControl(new OpenLayers.Control.Permalink());
	mapPanel.map.addControl(new OpenLayers.Control.Scale());
	mapPanel.map.addControl(new OpenLayers.Control.LoadingPanel());
	//disabilitare questo pannello mi consente uno zoom piu' gentile col mousewheel...
        //mapPanel.map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': true})); //allows the user pan ability
	if (!map.getCenter()) {map.zoomToMaxExtent()}
	//map.addControl(new OpenLayers.Control.PanZoom()); //come settare la posizione??
	//mapPanel.map.addControl(new OpenLayers.Control.ZoomPanel());

	//mapPanel.getTopToolbar().addButton([lengthButton, areaButton]);




///////////////// GRID PANEL WITH STORE INFORMATION //////////////////
	
//I vari store e columns sono definiti nei relativi theme_files.js, dopo la definizione dei singoli layers
//Gli store e columns da caricare sono definiti nella funzione "activeNode" piu' oltre
	
/*
	if (webgis=="sismi") {
		title_grid = "Elenco degli eventi sismici registrati negli ultimi 15 giorni dalla Rete Sismica Regionale dell'Italia Nord-occidentale - (double-click to zoom on interested earthquake)";
		store_grid = store_sismi;
		columns_grid = columns_sismi;
		collapsed_grid = false;
		view_grid = {
                        forceFit: true,
                        //showPreview: true,
                        //enableRowBody: true,
                        scrollOffset: 0,
                        getRowClass: function(record, rowIndex, rp, ds){
                	        var rowClass = '';
                        	if (record.get('magnitudo') > 3){
                                	rowClass = 'managercolour';
                        	}
                        	return rowClass;
        	}};
	}//Fine dell'IF sismi
*/	
/*
	else if (webgis=="pubblico" || webgis=="centrofunzionale") {
		if (grid_var =="comuni") {
			//store_grid = this[grid_var]; //recupero lo store da url
			title_grid = "Comuni che hanno subito un superamento nelle ultime 24 ore:";
                        store_grid = store_comuni_last;
                        columns_grid = columns_comuni_last;
		}
		else {
			title_grid = "Temporali (double-click to zoom on interested storm)";
                        store_grid = store_storm;
                        columns_grid = columns_storm;
		}
		collapsed_grid = true;
		view_grid = {
                        forceFit: true,
                        //showPreview: true,
                        //enableRowBody: true,
                        scrollOffset: 0,
                        getRowClass: function(record, rowIndex, rp, ds){
                                var rowClass = '';
                                if (record.get('valore') > 2){
                                        rowClass = 'managercolour';
                                }
                                return rowClass;
                }};
	} //fine dell'ELSE IF per pubblico e centrofunzionale
*/
/*	
	else if (webgis=="rischioindustriale") {
                title_grid = base_title03;
                store_grid = store_stabrirC;
                columns_grid = columns_stabrirC;
                collapsed_grid = true;
                view_grid = {
                        forceFit: true,
                        //showPreview: true,
                        //enableRowBody: true,
                        scrollOffset: 0
                };
        } //fine dell'ELSE IF per rischioindustriale
*/
	
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
		
		//bbar: pagingToolbar //aggiunge una toolbar al fondo...
		/*
		bbar: [{  //questo aggiunge una toolbar al fondo per zoomare sulla riga selezionata
			text:"zoom to...",
			handler:function()
			{
				gridPanel.getSelectionModel().each(function(rec){
					var feature = rec.get("feature");
					mapPanel.map.zoomToExtent(feature.geometry.getBounds());
				})
			}
		}]
		*/
		//,autoLoad: true //se true anche se il layer non è sulla mappa viene caricato
	});

	//Zoom to feature selected by double-clicking on the row
	gridPanel.on('rowdblclick', function(g, rowIdx,r){
		var rec = store_grid.getAt(rowIdx);
                var feature = rec.get("feature");
                mapPanel.map.setCenter(feature.geometry.getBounds().getCenterLonLat(), 11);
        	//mapPanel.map.setCenter(new OpenLayers.LonLat(rec.get('longitude'),rec.get('latitude')),10);
	});



///////////////////// POPUP INFO /////////////////////


//Carico script esterno per le popup:
//document.write("<script type='text/javascript' src='meteo/popup.js'><\/script>");

var e = document.createElement("script");
e.src = local_scripts + "popup.js";
e.type="text/javascript";

// To make it appear just before the closing head tag use
document.getElementsByTagName("head")[0].appendChild(e);


	
//////////////////// PRINT MODULE EXAMPLE-TEST /////////////////

	/*
	PRINT MODULE: This example shows the how to use GeoExt.PrintMapPanel, to create a printable OSM map. It requires the MapFish or GeoServer print module.
	var printDialog;
	// The PrintProvider that connects us to the print service
	var printProvider = new GeoExt.data.PrintProvider({
		method: "GET", // "POST" recommended for production use
		capabilities: printCapabilities, // provide url instead for lazy loading
		customParams: {
			mapTitle: "GeoExt Printing Demo",
			comment: "This demo shows how to use GeoExt.PrintMapPanel with OSM"
		}
	});
	*/



//////////////////// CREATE LAYER TREE MENU /////////////////
	
	// create our own layer node UI class, using the TreeNodeUIEventMixin:
	var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
	
	// using OpenLayers.Format.JSON to create a nice formatted string of the configuration for editing it in the UI - Qui creiamo il menu dei layer, con 3 gruppi cioè 3 nodeType:
	/*
	var treeConfig = new OpenLayers.Format.JSON().write([
		...il resto delle opzioni come il treeConfig semplice...cosa cambia allora???...
	],true);
	*/

	/*Configuro le CARTELLE della TOC:*/
/*
	var treeConfig = [
		{nodeType: "gx_layercontainer", text: 'Dati di base', expanded: false, isLeaf: false, leaf: false,
		loader: {
                        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
			filter: function(record) {
				//Filtra e prende solo i nomi dei layer conteneti la parola 'test'
				return record.get("layer").name.indexOf("base") !== -1}
		}}
		,{nodeType: "gx_layercontainer", text: 'Effetti al suolo', expanded: false, isLeaf: false, leaf: false,
                loader: {
                        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
                        filter: function(record) {
                                //Filtra e prende solo i nomi dei layer conteneti la parola 'test'
                                return record.get("layer").name.indexOf("suolo") !== -1}
                }}
		,{nodeType: "gx_layercontainer", text: 'Previsione piene', expanded: false, isLeaf: false, leaf: false,
                loader: {
			baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
                        filter: function(record) {
                                //Filtra e prende solo i nomi dei layer conteneti la parola 'idro1'
                                return record.get("layer").name.indexOf("idro1") !== -1}
                }}
		,{nodeType: "gx_layercontainer", text: 'Rete radar', expanded: false, isLeaf: false, leaf: false,
                loader: {
			baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
                        filter: function(record) {
                                //Filtra e prende solo i nomi dei layer conteneti la parola 'radar1'
                                return record.get("layer").name.indexOf("radar1") !== -1}
                }}
		,{nodeType: "gx_layercontainer", text: 'Rete al suolo', expanded: false, isLeaf: false, leaf: false,
                loader: {
                        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
                        filter: function(record) {
                                //Filtra e prende solo i nomi dei layer conteneti la parola 'rete'
                                return record.get("layer").name.indexOf("rete") !== -1}
                }}
*/
/*
		,{nodeType: "gx_layercontainer", text: 'Sismi', expanded: false, isLeaf: false, leaf: false,
                loader: {
                        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
                        filter: function(record) {
                                //Filtra e prende solo i nomi dei layer conteneti la parola 'sismi' o 'ingv':
                		return record.get("layer").name.indexOf("sismi") !== -1
				|| record.get("layer").name.indexOf("ingv") !== -1}
                }}
*/
/*Per creare sottocartelle sotto "sismi":*/
/*
		,{
		nodeType: "async", text: 'Sismi', expanded: false, 
		children:[{nodeType: "gx_layercontainer", text: "RSNI-ARPA", expanded: true
			,loader: {
		        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
		        filter: function(record) {
		        //Filtra e prende solo i nomi dei layer conteneti la parola '-sismi-'
			return record.get("layer").name.indexOf("sismi1") !== -1}
			}
		},
		{
		nodeType: "gx_layercontainer", text: "INGV-Prot.Civile", expanded: true
			,loader: {
		        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
		        filter: function(record) {
		        //Filtra e prende solo i nomi dei layer conteneti la parola 'ingv'
	                return record.get("layer").name.indexOf("ingv") !== -1}
        		}
		}
		]}

		,{nodeType: "gx_layercontainer", text: 'Temporali', expanded: false, isLeaf: false, leaf: false,
                loader: {
                        baseAttrs: {radioGroup: "foo", uiProvider: "layernodeui"},
                        filter: function(record) {
                                //Filtra e prende solo i nomi dei layer conteneti la parola 'temporali'
                                return record.get("layer").name.indexOf("temporali") !== -1}
                }}
		,{nodeType: "gx_baselayercontainer", text: "Carte di sfondo"}
	];
*/	

	
		
	/*Configuro la TOC contenente i layer caricati sul mapPanel: */
	var layerTree = new Ext.tree.TreePanel({
		title: 'Map Layers', region: "nord", autoScroll: true, split: true, id: 'treeP',
		plugins: [
			new GeoExt.plugins.TreeNodeRadioButton({
				listeners: {
					"radiochange": function(node) {active_node=node;activeNode(active_node);}
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
			//append: registerRadio,
			//insert: registerRadio
		}
			
		/*Altre opzioni:*/
		//renderTo: 'layerTree', //border: true,
		//height: height_map, //width: Math.round(width_map*0.20), //circa 600*250,
		//collapsible: true, //collapsed: true, //collapseMode: "mini", //root: layerList,
		
		
		/*
		Per PRINT MODULE:
		,bbar: [{
	        text: "Print...",
        	handler: function(){
	        // A window with the PrintMapPanel, which we can use to adjust
        	// the print extent before creating the pdf.
	        printDialog = new Ext.Window({
                title: "Print Preview", width: 350, autoHeight: true,
                items: [{
                    xtype: "gx_printmappanel",
                    // use only a PanPanel control
                    map: {controls: [new OpenLayers.Control.PanPanel()]},
                    sourceMap: mapPanel,
                    printProvider: printProvider
                }],
                bbar: [{
                    text: "Create PDF",
                    handler: function(){ printDialog.items.get(0).print(); }
                }]
	        });
        	printDialog.show();
	        }
		}]
		*/
		
	}); //Fine del LayerTree



//////////// LAVORO SUL LAYER ATTIVO //////////////////

	/*
	//Cerco di attivare un NODO da subito:
	function select_node(node) {
        	node.eachChild( function(child) { 
		        //if(child.attributes.real_id == real_id ) {
			if(child.attributes.text == "Warning comuni:superamento ultimo giorno") {
              			child.select();
			        categories_panel.un('expandnode', select_node);
		        }
	        });
        };
        //layerTree.on('expandnode', select_node);
	//layerTree.getRootNode().expand();
	//layerTree.on.expandAll();
	*/


	function activeNode(active_node) {

	//SISMI:
	if (active_node.text == sismi01) {
        	title_grid = sismi_title01;
	        store_grid = store_sism_staz;
        	columns_grid = columns_sism_staz;
        }
	//else if (active_node.text.match(/Clax sismica.*/)) {
	else if (active_node.text == sismi05) {
                title_grid = sismi_title05;
                store_grid = store_clax_sismi;
                columns_grid = columns_clax_sismi;
        }
        else if (active_node.text == sismi04) {
                title_grid = sismi_title05;
                store_grid = store_clax_sismi;
                columns_grid = columns_clax_sismi;
        }
        else if (active_node.text == sismi07) {
                title_grid = sismi_title07;
                store_grid = store_cluster;
                columns_grid = columns_cluster;
        }
	else if (active_node.text == sismi00) {
		title_grid = sismi_title00;
		store_grid = store_sismi;
                columns_grid = columns_sismi;
	}
	//BASE:
	else if (active_node.text == base01) {
        	title_grid = base_title01;
	        store_grid = store_bacini_tiny;
        	columns_grid = columns_bacini_tiny;
	}
	else if (active_node.text == base03) {
        	title_grid = base_title03;
	        store_grid = store_stabrirC;
        	columns_grid = columns_stabrirC;
	}
	else if (active_node.text == base04) {
        	title_grid = base_title04;
	        store_grid = store_stabrirB;
        	columns_grid = columns_stabrirC;
	}
	//SUOLO:
	else if (active_node.text == suolo00) {
		title_grid = suolo_title00;
		store_grid = store_smart_staz;
		columns_grid = columns_smart_staz;
	}
	else if (active_node.text == suolo01) {
		title_grid = suolo_title01;
		store_grid = store_bacini_15gg;
		columns_grid = columns_bacini_15gg;
	}
	else if (active_node.text == suolo02) {
		title_grid = suolo_title02;
		store_grid = store_traps;
		columns_grid = columns_traps;
	}
	else if (active_node.text == suolo03) {
        	title_grid = suolo_title03;
	        store_grid = store_smartprevimedie;
        	columns_grid = columns_smartprevimedie;
        }
	else if (active_node.text == suolo04) {
	        title_grid = suolo_title04;
        	store_grid = store_comuni_last;
	        columns_grid = columns_comuni_last;
        }
	//TEMPORALI:
	else if (active_node.text == temporali00) {
                title_grid = temporali_title00;
                store_grid = store_storm;
                columns_grid = columns_storm;
        }


		//PER LA LEGENDA DEI RASTER:
		if (active_node.text == radar01) {
			legend.getComponent('imgPreview').setUrl('/common/legends/legenda_ist.gif');
		}
		else if (active_node.text == radar02) {
			legend.getComponent('imgPreview').setUrl('/common/legends/legenda_ist.gif');
		}
		else if (active_node.text == radar03) {
			legend.getComponent('imgPreview').setUrl('/common/legends/legenda_ist.gif');
		}
		else if (active_node.text == radar04) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_1h.gif');
                }
		else if (active_node.text == radar00) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_mosaico.gif');
                }
		else if (active_node.text == radar05) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_3h.gif');
                }
		else if (active_node.text == radar06) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_3h.gif');
                }
		else if (active_node.text == radar07) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_ieri_oggi.gif');
                }
		else if (active_node.text == radar08) {
			legend.getComponent('imgPreview').setUrl('/common/legends/legenda_pioggia_neve.gif');
                }
		else if (active_node.text == radar11) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_grandine.gif');
                }
                else if (active_node.text == radar12) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_cloudmasktop_temp.png');
                }
		else if (active_node.text == suolo07) {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_snowcover_SWE.png');
                }
		else {
                        legend.getComponent('imgPreview').setUrl('/common/legends/legenda_ist.gif');
                }
	


	//Ora bisogna trovare un modo di ricaricare il grid con le nuove info:
	gridPanel.reconfigure(store_grid, columns_grid);
	gridPanel.setTitle(title_grid);
				
	} //Fine della function active_node
	
	
	
/////////////////////// LEGEND PANEL //////////////////////

/*
	var legend;
	if (webgis=="sismi") {
		var legend = new GeoExt.LegendPanel({
                region: "south", title: "Legend", autoScroll: true, layerStore: mapPanel.layers
	});
	}
	else {
	var legend = new GeoExt.LegendPanel({
		//items : new GeoExt.LegendImage({id: 'imgPreview', url: 'meteo/img/legenda_ist.gif'}),
		items : new GeoExt.LegendImage({id: 'imgPreview', url: '/common/legends/'+legend_var+'.gif'}),
		region: "south", title: "Legend", autoScroll: true, layerStore: mapPanel.layers
		//renderTo: "legend", //height: Math.round(height_map*0.4), //width: Math.round(width_map*0.20),
		//layers: mapPanel.layers    
	});
	}
*/

	var right_panel = new Ext.Panel({
		region: "east", autoScroll: true, split: true, collapsible: true, collapsed: true,
		width: Math.round(width_map*0.25),		
		items: [layerTree, legend]
		//layout: "border",
	});
		
	var mainPanel = new Ext.Panel({
        renderTo: "mainpanel", layout: "border",
		items: [mapPanel,right_panel,gridPanel]
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
	
	setInterval('map_redraw()', aggiornamento_raster);

	setInterval('update_localtime()', 1000);


}); //Fine dell'Ext.onReady function


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
		
		//if (!layer_to_remove.isBaseLayer && layer_to_remove.name.indexOf('Pioggia') !== -1) {
			//alert(layer_to_remove.name+" -- "+mapPanel.map.getLayerIndex(layer_to_remove));			
			
			//map_refresh.removeLayer(layer_to_remove); //Elimina il layer dalla mappa definitivamente
			//layer_to_remove.destroy(); //Elimina il layer dalla mappa definitivamente
			
			/* Per capire se un punto e' dentro o fuori il bound di un layer:
			var point = new Proj4js.Point(2950000, 5600000);
			var img_bound = layer_to_remove.getExtent();
			alert(layer_to_remove.getExtent());
			 if (img_bound.contains(point.x, point.y))
			alert("DENTRO");
			else alert("FUORI");
			*/

			//Modifico l'url dell'immagine in modo da poterla ricaricare:
			var url_image = layer_to_remove.getURL();
			
			//Se il raster e' quello dell'animazione non viene aggiornato con questo ciclo
			if (!url_image.match(/googlemap_ist_T.*/)) {
			
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


function update_localtime() {
        var di = new Date();
        var before = document.getElementById('localtime');
        before.innerHTML = di.todayUTC() + " " + di.timeNowUTC() + " UTC";
}


//Questa funzione e' per provare a settare una nuova amppa avente come baselayer il wms Aarpa.Al momento non funziona...
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

