/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////
	
/*AREE ALLERTAMENTO*/
var style_zoneall = new OpenLayers.Style();
var ordinaria = new OpenLayers.Rule({
	title: "Situazione Ordinaria",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato_allertamento", value: "0"
	}),
	symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "green", fillOpacity: 0.4
		, label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
var criticita = new OpenLayers.Rule({
	title: "Ordinaria Criticita",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato_allertamento", value: "1"
	}),
	symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "#ffd800", fillOpacity: 0.5
		, label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
var codice2 = new OpenLayers.Rule({
	title: "Codice 2",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato_allertamento", value: "2"
	}),
	symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "orange", fillOpacity: 0.6
		, label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
var codice3 = new OpenLayers.Rule({
	title: "Codice 3",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato_allertamento", value: "3"
	}),
	symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "red", fillOpacity: 0.6
		, label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
style_zoneall.addRules([ordinaria, criticita, codice2, codice3]);
var styleMap_zoneall = new OpenLayers.StyleMap({
	"default": style_zoneall
	, "temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
var zoneall = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_zoneall,
	//strategies: [new OpenLayers.Strategy.BBOX()],
	strategies: [new OpenLayers.Strategy.Fixed()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_datidibase, featureType: "aree_allertamento", 
		//version: "1.1.0",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		geometryName: "the_geom", srsName: "epsg:23032"
		//extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
	})
});
zoneall.setVisibility(false);
store_zoneall = new GeoExt.data.FeatureStore({
        fields: [
		"cod_area", {name: "comboDisplay", type: "string", mapping:"cod_area"},
                {name: "nome_area", type: "string"},
                {name: "stato_allertamento", type: "string"}
        ],
        layer: zoneall
});
var columns_zoneall = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Codice area", dataIndex: "cod_area"},
                {header: "<b>Nome</b>", dataIndex: "nome_area", width: 250},
                {header: "Stato allertamento", dataIndex: "stato_allertamento"}
        ]
});


/*PRECIPITAZIONE PREVISTA SU AREE IDROLOGICHE*/
var style_zone_idro = new OpenLayers.Style();
var zone_idro = new OpenLayers.Rule({
        title: "Zone idrologiche",
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "#EDE2E2", fillOpacity: 0.2
                , label: "${cod_area_allerta}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
style_zone_idro.addRules([zone_idro]);
var styleMap_zone_idro = new OpenLayers.StyleMap({
	"default": style_zone_idro
	, "temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
var zoneall2 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_zone_idro,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
	projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows, featureType: "zone_idrologiche_simplified",
	    featureNS: "http://www.tinyows.org/",
            readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_23032,
		    'externalProjection': OL_23032
            })
	})
});
zoneall2.setVisibility(false);

/*RAGGI SU BERSAGLIO */
var style_radius = new OpenLayers.Style();
var radius = new OpenLayers.Rule({
        title: "Distanza",
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "#EDE2E2", fillOpacity: 0.0
                , label: "${radius}${udm}", labelAlign: "lb", fontOpacity: 0.0, fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
style_radius.addRules([radius]);
var styleMap_radius = new OpenLayers.StyleMap({
	"default": style_radius
	, "temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
var radiusL = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_radius,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
	projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows, featureType: "webgis_target",
	    featureNS: "http://www.tinyows.org/",
            readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_32632,
		    'externalProjection': OL_32632
            })
	})
});
radiusL.setVisibility(false);

/*PRECIPITAZIONE OPREVISTA SU AREE IDROLOGICHE*/
var style_zone_idro1 = new OpenLayers.Style();
var zone_idro1 = new OpenLayers.Rule({
        title: "Zone idrologiche 10gg",
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "#EDE2E2", fillOpacity: 0.2
                , label: "${cod_area_allerta}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
style_zone_idro1.addRules([zone_idro1]);
var styleMap_zone_idro1 = new OpenLayers.StyleMap({
	"default": style_zone_idro1
	, "temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
var zoneall3 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_zone_idro1,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
	projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows, featureType: "zone_idrologiche_simplified",
	    featureNS: "http://www.tinyows.org/",
            readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_23032,
		    'externalProjection': OL_23032
            })
	})
});
zoneall3.setVisibility(false);


/*VISIBILITA' RADAR 4000MT*/
var style_radarvisib = new OpenLayers.Style();
var radarvisib_rule = new OpenLayers.Rule({
        title: "Visibilita radar 4km",
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.8, fillColor: "purple", fillOpacity: 0.5}
});
style_radarvisib.addRules([radarvisib_rule]);
var styleMap_radarvisib = new OpenLayers.StyleMap({
	"default": style_radarvisib
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var radarvisib = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_radarvisib,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_datidibase, featureType: "radar_visibility4000",
                //version: "1.1.0",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
radarvisib.setVisibility(false);


/*BACINI*/
var style_bacini_tiny = new OpenLayers.Style();
var bacini_rule = new OpenLayers.Rule({
	title: "Bacini Piemonte",
	symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "#EDE2E2", fillOpacity: 0.3}
});
style_bacini_tiny.addRules([bacini_rule]);
var styleMap_bacini_tiny = new OpenLayers.StyleMap({
	"default": style_bacini_tiny
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var bacini_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_bacini_tiny,
	strategies: [new OpenLayers.Strategy.Fixed()],
	projection: OL_32632,
	protocol: new OpenLayers.Protocol.WFS({
		url: url_tinyows, featureType: "bacinidefense",
		featureNS: "http://www.tinyows.org/",
		srsName: "epsg:32632",
		geometryName: "the_geom"
	})
});
bacini_tiny.setVisibility(false);
store_bacini_tiny = new GeoExt.data.FeatureStore({
	fields: [
		{name: "id_bacino", type: "integer"},
		"nome", {name: "comboDisplay", type: "string", mapping:"nome"},
		{name: "comune", type: "string"},
		{name: "prov", type: "string"},
		{name: "classe", type: "integer"},
		{name: "mesobacino", type: "string"},
		{name: "macrobacino", type: "string"},
		{name: "area", type: "float"},
		{name: "processo_principale", type: "string"},
		{name: "soglia1", type: "float"},
		{name: "soglia2", type: "float"},
		{name: "soglia3", type: "float"}
	],
	layer: bacini_tiny
});
//store_bacini.on('load', function(store){
//      store.sort('nome', 'ASC');
//});
var columns_bacini_tiny = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
	columns: [
		{header: "Id bacino", dataIndex: "id_bacino"},
		{header: "<b>Nome</b>", dataIndex: "nome", width: 180},
		{header: "Comune", dataIndex: "comune"},
		{header: "Provincia", dataIndex: "prov", align: "center"},
		{header: "Classe", dataIndex: "classe", align: "center"},
		{header: "Mesobacino", dataIndex: "mesobacino", align: "center"},
		{header: "Macrobacino", dataIndex: "macrobacino", align: "center"},
		{header: "Area [km2]", dataIndex: "area", decimalPrecision: 3, align: "center"},
		{header: "Processo principale", dataIndex: "processo_principale", align: "center"},
		{header: "Soglia di attenzione [mm]", dataIndex: "soglia1", align: "center"},
		{header: "Pre-soglia [mm]", dataIndex: "soglia2", align: "center"},
		{header: "Soglia d'innesco [mm]", dataIndex: "soglia3", align: "center"}
	]
});

	
/*RETE METEOIDRO*/
/*
var meteoidro_pluvio = new OpenLayers.Rule({
	title: "Ripetitore",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "meteo_tab", value: "Ripetitore"
	}),
    symbolizer: {graphicName: "square", rotation: 45, fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 4}
});
*/
var style_meteoidro = new OpenLayers.Style({
        label: "${denominazione}\n\n${quota_int} m asl", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
	new OpenLayers.Rule({
        title: "Meteorologica",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "Meteorologica"
        }),
	symbolizer: {graphicName: "square", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 4}
	}),
	new OpenLayers.Rule({
        title: "Meteorologica con tempo presente",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "MeteorologicaW"
        }),
	symbolizer: {graphicName: "square", rotation: 45, fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
	}),
	new OpenLayers.Rule({
        title: "Idrometrica",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "Idrometrica"
        }),
	symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
	}),
        new OpenLayers.Rule({
        title: "Idrometrica con portata",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "IdrometricaQ"
        }),
        symbolizer: {graphicName: "triangle", fillColor: "purple", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
        }),
        new OpenLayers.Rule({
                title: "Nivometrica",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "Nivometrica"
        }),
	symbolizer: {graphicName: "circle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 4}
        }),
	new OpenLayers.Rule({
                title: "Disattivate",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "meteo_tab", value: "Z"
        }),
        symbolizer: {fillColor: "gray", fillOpacity: 0.5, strokeColor:"black", pointRadius: 4}
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_meteoidro = new OpenLayers.StyleMap({
	"default": style_meteoidro,
	"select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});
var rete_meteoidro = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_meteoidro,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        protocol: new OpenLayers.Protocol.WFS({
            url: urlMS_datidibase,
            featureType: "rete_meteoidro",
            featureNS: "http://mapserver.gis.umn.edu/mapserver"
        })
});

//////////// PROVO STILE SLD da QGis
//
// 2 problemi:
//
// 1- SLD salvato da QGis 2.x e' nella versione 1.1.0 NON riconosciuta da OL 2.x. Occorre sostituire:
// 1.1.0 --> 1.0.0
// se: --> '' (cioe' niente)
// SvgParameters --> CssParameters
//
// 2- le label NON vengono salvate da QGis nel file SLD. Si possono aggiungere a mano sul file SLD (delirio) oppure indicarle come al solito nel file js, come di seguito ho provato a fare
//
// Vedi anche:
// http://dev.openlayers.org/examples/sld.html
// http://dev.openlayers.org/examples/SLDSelect.html

var format = new OpenLayers.Format.SLD();

var label_rete_meteoidro_sld = new OpenLayers.Rule({symbolizer: {label: "${denominazione}\n\n${quota_int} m asl", fontWeight: "bold", fontFamily: "sans-serif", labelAlign: "cm"}});
var minzoom_rete_meteoidro_sld = new OpenLayers.Rule({
	title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        });
var maxzoom_rete_meteoidro_sld = new OpenLayers.Rule({
        title: " ",
                maxScaleDenominator: 250000,
                symbolizer: { fontSize: "12px" }
        });

//Provo ad associare l'sld ad uno styleMap invece che direttamente al layer (come in fondo)
//In questo modo pero' non funziona piu' la selezione e l'hover...
var styleMap_meteoidro_sld = new OpenLayers.StyleMap({
        "default": '',
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});
OpenLayers.Request.GET({
        url: root_dir_html + '/common/tematismi/rete_meteoidro_label.sld',
        success: function (req) {
            sld = format.read(req.responseXML || req.responseText);
            styles = sld.namedLayers['rete_meteoidrografica'].userStyles[0];
	    styles.addRules([label_rete_meteoidro_sld, minzoom_rete_meteoidro_sld, maxzoom_rete_meteoidro_sld]);
            styleMap_meteoidro_sld.styles.default = styles;
        }
});

var rete_meteoidro_sld = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_meteoidro_sld,
        strategies: [new OpenLayers.Strategy.BBOX()],
        protocol: new OpenLayers.Protocol.WFS({
            url: urlMS_datidibase,
            featureType: "rete_meteoidro",
            featureNS: "http://mapserver.gis.umn.edu/mapserver"
        })
});

/*OpenLayers.Request.GET({
        url: root_dir_html + '/common/tematismi/rete_meteoidro_label.sld',
        success: function (req) {
            sld = format.read(req.responseXML || req.responseText);
            styles = sld.namedLayers['rete_meteoidrografica'].userStyles[0];
	    //styles.addRules([label_rete_meteoidro_sld]);
            rete_meteoidro_sld.styleMap.styles.default = styles;
        }
});*/
rete_meteoidro_sld.setVisibility(false);

//
//////////// FINE PROVA SLD

var filter_meteoidro_not_lombardia = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.NOT,
	filters: [
		new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LIKE,
		property: "proprietario", value: "LOMBARDIA"
		})
	]
});
var filterStrategy_meteoidro = new OpenLayers.Strategy.Filter({filter: filter_meteoidro_not_lombardia});
var rete_meteoidro_not_lombardia = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_meteoidro,
	//minScale: 500000,
	strategies: [new OpenLayers.Strategy.BBOX()
	,filterStrategy_meteoidro
	//,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
	],
	//projection: new OpenLayers.Projection("epsg:32632"),
	protocol: new OpenLayers.Protocol.WFS({
	    url: urlMS_datidibase,
	    //version: "1.1.0",
	    featureType: "rete_meteoidro",
	    featureNS: "http://mapserver.gis.umn.edu/mapserver"
	    //,geometry: "msGeometry", srsName: "epsg:23032"
	})		
});
var rete_meteoidro_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_meteoidro,
	strategies: [new OpenLayers.Strategy.Fixed()
	],
	projection: OL_23032,
	protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows,
	    featureType: "rete_meteoidrografica",
	    featureNS: "http://www.tinyows.org/",
	    geometryName: "the_geom"
	})
});
rete_meteoidro.setVisibility(false);
rete_meteoidro_not_lombardia.setVisibility(false);
rete_meteoidro_tiny.setVisibility(false);
var rete_meteoidro_lago = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_meteoidro,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_rete_meteoidro_lagomaggiore",
            featureNS: "http://www.tinyows.org/"
            ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
            })
        })
});
rete_meteoidro_lago.setVisibility(false);
store_meteoidro = new GeoExt.data.FeatureStore({
        fields: [
	//Commento alcuni campi nella speranza che lo scarico dei dati per popolare il menu a tendina sia piu' rapido..
            //{name: "codice_istat_comune", type: "string"},
            //{name: "progr_punto_com", type: "integer"},
            {name: "codice_stazione", type: "string"},
	    "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"}
            /*,{name: "utm_x", type: "integer"},
            {name: "utm_y", type: "integer"}*/
            //{name: "quota_stazione", type: "float"}
        ],
        layer: rete_meteoidro
	//,autoLoad: true
});
store_meteoidro_lago = new GeoExt.data.FeatureStore({
        fields: [
	    {name: "codice_stazione", type: "string"},
	    "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"}
	],
        layer: rete_meteoidro_lago
        //,autoLoad: true
});
//store_meteoidro.load();
store_meteoidro.on('load', function(store){
    store.sort('denominazione', 'ASC');
    //combo.setDisabled(true);
});
store_meteoidro_tiny = new GeoExt.data.FeatureStore({
        fields: [
	    {name: "codice_stazione", type: "string"},
            "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"}
        ],
        layer: rete_meteoidro_tiny
        //,autoLoad: true
});
store_meteoidro_tiny.on('load', function(store){
    store.sort('denominazione', 'ASC');
});

store_meteoidro_lago.on('load', function(store){
    store.sort('denominazione', 'ASC');
});
var columns_meteoidro = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
		{header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
		{header: "Codice stazione", dataIndex: "codice_stazione"}
                /*,{header: "Codice_istat_comune", dataIndex: "codice_istat_comune"},
                {header: "Progr_punto_com", dataIndex: "progr_punto_com"},
                {header: "Utm X [m]", dataIndex: "utm_x"},
                {header: "Utm Y [m]", dataIndex: "utm_y"},
                {header: "Quota [m]", dataIndex: "quota_stazione"}*/
        ]
});
//rete_meteoidro_tiny.setVisibility(false); //ma questo layer lo usa qualche progetto?
var rete_estero = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_meteoidro,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
        url: url_tinyows,
        featureType: "rete_estero",
        featureNS: "http://www.tinyows.org/"
        ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_4326,
                'externalProjection': OL_4326
        })
        })
});
rete_estero.setVisibility(false);
var rete_estero_svizzera = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_meteoidro,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
        url: url_tinyows,
        featureType: "v_rete_estero_svizzera",
        featureNS: "http://www.tinyows.org/"
        ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_4326,
                'externalProjection': OL_4326
        })
        })
});
rete_estero_svizzera.setVisibility(false);


/*RETE IDROMETRICA*/
var style_idrometri = new OpenLayers.Style({
	label: "${denominazione}\n\n${quota_int} m asl", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
	}, {
	rules: [
	new OpenLayers.Rule({
        title: "Idrometrica",
        /*filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "meteo_tab", value: "Idrometrica"
        }),*/
        symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
	//,label: "${denominazione}\n\n${quota_int} m asl", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
	}
        }),
	new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {fontSize: "12px"}
        })
]});
var styleMap_idrometri = new OpenLayers.StyleMap({
        "default": style_idrometri,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "5"})
});
var filter_idrometri = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "meteo_tab", value: "Idrometrica*"
});
var filterStrategy_idrometri = new OpenLayers.Strategy.Filter({filter: filter_idrometri});
var idrometri_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idrometri,
        strategies: [new OpenLayers.Strategy.Fixed(), filterStrategy_idrometri
	],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "rete_meteoidrografica",
            featureNS: "http://www.tinyows.org/"
            ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
            })
        })
});
idrometri_tiny.setVisibility(false);


/*RETE IDROMETRICA SAI*/
var style_idrometri_sai = new OpenLayers.Style({
    label: "${denominazione}\n\n", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
  }, {
  rules: [
  /*  new OpenLayers.Rule({
      title: "Idrometrica",
      symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black"}
  }),*/
    new OpenLayers.Rule({
	title: "Estremamente umido",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.GREATER_THAN,
		property: "valore", value: 1.65
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#0E1172", fillOpacity: 0.8, pointRadius: 7, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Molto umido",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "valore", lowerBoundary: 1.28, upperBoundary: 1.65
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#3BE5E2", fillOpacity: 0.8, pointRadius: 6, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Moderatamente umido",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "valore", lowerBoundary: 0.84, upperBoundary: 1.28
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#DAF4D9", fillOpacity: 0.8, pointRadius: 5, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Normale",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "valore", lowerBoundary: -0.84, upperBoundary: 0.84
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#FEFEFE", fillOpacity: 0.8, pointRadius: 5, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Moderatamente secco",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "valore", lowerBoundary: -1.28, upperBoundary: -0.84
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#E8D384", fillOpacity: 0.8, pointRadius: 5, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Molto secco",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "valore", lowerBoundary: -1.65, upperBoundary: -1.28
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#C31B1B", fillOpacity: 0.8, pointRadius: 6, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Estremamente secco",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LESS_THAN,
		property: "valore", value: -1.65
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "#541A19", fillOpacity: 0.8, pointRadius: 7, strokeWidth:0.6}
	})
	,new OpenLayers.Rule({
	title: "Dati mancanti",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "valore", value: -9.9
	}),
	symbolizer: {graphicName: "triangle", strokeColor: "black", fillColor: "gray", fillOpacity: 0.6, pointRadius: 5, strokeWidth:0.6}
	}),
  new OpenLayers.Rule({
    title: " ",
    minScaleDenominator: 250000,
    symbolizer: {fontSize: "0px", strokeWidth:0.6}
  }),
  new OpenLayers.Rule({
    title: " ",
    maxScaleDenominator: 250000,
    symbolizer: {
      fontSize: "12px"
    }
  })
]});
var styleMap_idrometri_sai = new OpenLayers.StyleMap({
  "default": style_idrometri_sai,
  "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
  ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "5"})
});
var idrometri_sai_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
  styleMap: styleMap_idrometri_sai,
  strategies: [new OpenLayers.Strategy.Fixed()],
  projection: OL_23032,
  protocol: new OpenLayers.Protocol.WFS({
      url: url_tinyows,
      featureType: "v_stazioni_sai",
      featureNS: "http://www.tinyows.org/",
      geometryName: "the_geom"
  })
});
idrometri_sai_tiny.setVisibility(false);


/*SISTEMA SIRI - PRESE*/
var style_prese_siri = new OpenLayers.Style({
        label: "${codice_ril}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Prese SIRI",
        symbolizer: {graphicName: "circle", fillColor: "green", fillOpacity: 0.8, strokeColor:"black", pointRadius: 4
        }
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 50000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 50000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_prese_siri = new OpenLayers.StyleMap({
        "default": style_prese_siri,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var prese_siri = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_prese_siri,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "siri_prese",
            featureNS: "http://www.tinyows.org/",
	    geometryName: "the_geom"
        })
});
prese_siri.setVisibility(false);


/*SISTEMA SIRI - RESTITUZIONI*/
var style_restituzioni_siri = new OpenLayers.Style({
          label: "${codice_ril}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
          title: "Restituzioni SIRI",
          symbolizer: {graphicName: "square", rotation: 45, fillColor: "cyan", fillOpacity: 0.8, strokeColor:"black", pointRadius: 4
        }
        }),
        new OpenLayers.Rule({
          title: " ",
          minScaleDenominator: 50000,
          symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
           title: " ",
           maxScaleDenominator: 50000,
           symbolizer: {
              fontSize: "12px"
           }
        })
]});
var styleMap_restituzioni_siri = new OpenLayers.StyleMap({
        "default": style_restituzioni_siri,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var restituzioni_siri = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_restituzioni_siri,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "siri_restituzioni",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
restituzioni_siri.setVisibility(false);


/*RETE METEOROLOGICA DA WEB*/
var style_rete_web = new OpenLayers.Style({
        label: "${name}\n\n${elev} m asl", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Meteorologica",
        symbolizer: {graphicName: "star", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 8
        }
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_rete_web = new OpenLayers.StyleMap({
        "default": style_rete_web,
        "select": new OpenLayers.Style({pointRadius: 11, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 15, fontSize: 12, cursor: "pointer", labelYOffset: "5"})
});
var rete_web_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_web,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "rete_web",
            featureNS: "http://www.tinyows.org/"
            ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_4326,
                'externalProjection': OL_4326
            })
        })
});
rete_web_tiny.setVisibility(false);

/*RETE IDROMETRICA BIS*/
var style_idrometri_bis = new OpenLayers.Style({
        label: "${denominazione}\n\n", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Dati mancanti",
        symbolizer: {graphicName: "triangle", fillColor: "gray", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
	,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "-1"
        })
        }),
	new OpenLayers.Rule({
        title: "Qmedia = -999",
        symbolizer: {graphicName: "triangle", fillColor: "cyan", fillOpacity: 0.2, strokeColor:"black", pointRadius: 7
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "-2"
        })
        }),
	new OpenLayers.Rule({
        title: "Qmedia > DMVbase",
        symbolizer: {graphicName: "triangle", fillColor: "green", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "0"
        })
        }),
        new OpenLayers.Rule({
        title: "DMVderoga < Qmedia < DMVbase",
        symbolizer: {graphicName: "triangle", fillColor: "yellow", fillOpacity: 0.5, strokeColor:"black", pointRadius: 7
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "4"
        })
        }),
	new OpenLayers.Rule({
        title: "Qmedia < DMVbase (NO DMVderoga)",
        symbolizer: {graphicName: "triangle", fillColor: "orange", fillOpacity: 0.6, strokeColor:"black", pointRadius: 7
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "1"
        })
        }),
	new OpenLayers.Rule({
        title: "Qmedia < DMVderoga",
        symbolizer: {graphicName: "triangle", fillColor: "red", fillOpacity: 0.5, strokeColor:"black", pointRadius: 7
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "2"
        })
        }),
	new OpenLayers.Rule({
        title: "Soglie mancanti",
        symbolizer: {graphicName: "triangle", fillColor: "white", fillOpacity: 0.2, strokeColor:"black", pointRadius: 7
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "3"
        })
        }),
	new OpenLayers.Rule({
        title: "Soglia attenzione superata",
        //symbolizer: {graphicName: "circle", fillColor: "white", fillOpacity: 0, strokeColor:"black", pointRadius: 15}
        symbolizer: {pointRadius: 15, externalGraphic: root_dir_html+"/common/icons/bullseye_targeting_ha.gif"}
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_allarme", value: "1"
        })
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        fontSize: "12px", strokeWidth:0.8, pointRadius: 10, labelYOffset: "5"
                }
        })
]});
var styleMap_idrometri_bis = new OpenLayers.StyleMap({
        "default": style_idrometri_bis,
        "select": new OpenLayers.Style({pointRadius: 10, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "7"})
});
var idrometri_bis_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idrometri_bis,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "bis_stato"
            ,featureNS: "http://www.tinyows.org"
            ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
            })
        })
});
idrometri_bis_tiny.setVisibility(false);
store_bis = new GeoExt.data.FeatureStore({
        fields: [
                {name: "codice", type: "string"},
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "data", type: "date"},
                {name: "ultimovalore", type: "float"},
		{name: "dmv_base", type: "float"},
                {name: "dmv_deroga", type: "float"},
		{name: "stato", type: "integer"}
        ],
        layer: idrometri_bis_tiny
});
store_bis.on('load', function(store){
      store.sort('denominazione', 'ASC');
});

var columns_bis = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Codice stazione", dataIndex: "codice"},
                {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
                {header: "Data", dataIndex: "data", align: "center", xtype: "datecolumn", format: "Y-M-d"},
                {header: "Valore Q_MED [m3/s]", dataIndex: "ultimovalore", align: "center"},
                {header: "DMV base [m3/s]", dataIndex: "dmv_base", align: "center"},
		{header: "DMV deroga [m3/s]", dataIndex: "dmv_deroga", align: "center"},
		{header: "Stato", dataIndex: "stato", align: "center", hidden: true}
        ]
});


/*ATLANTE PIOGGE STAZIONI METEO*/
var clust_atl = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2 //soglia, al di sotto della qual non clusterizza
});
var context_atl = {
    getLabel: function(feature){
/*
        if (!feature.attributes.max1ora) return ""; //per gestire i dati senza valori
        else if (mapPanel.map.getScale() > 2500000) return "";
        else return Math.round(feature.attributes.max1ora);
*/
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            //Se il cluster non e' per attributi:
            /*valore = [];
	    for (var i = 0; i < feature.cluster.length; i++) {
	        valore.push(feature.cluster[i].attributes.max1ora);
	    }
	    valore.sort();
	    valore.reverse();
	    return label_scaled(valore[0]);*/
	    feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.max1ora == null) a.attributes.max1ora = -99;
                if (b.attributes.max1ora == null) b.attributes.max1ora = -99;
                return b.attributes.max1ora - a.attributes.max1ora; //reverse order
            });
            return label_scaled(feature.cluster[0].attributes.max1ora,'');
	    //Se il cluster e' per attributi allora:
	    //return feature.cluster[0].attributes.max1ora;
	}
        else { //se invece interrogo la singola feature
	    //Se il cluster non e' per attributi:
	    return label_scaled(feature.attributes.max1ora,'');
            //Se il cluster e' per attributi allora:
	    //return feature.attributes.dir_class;
        }
	
    }
    //per gestire la dimensione in base alla scala visto che Rules e Context non vanno d'accordo:
    ,getRadius: function() {
        if (mapPanel.map.getScale() > 500000 && mapPanel.map.getScale() < 2500000) return 12;
        else if (mapPanel.map.getScale() > 2500000) return 4;
        else return 16;
    }
    ,getWidth: function(feature) {
	return (feature.cluster) ? 1.5 : 0.5;
    }
    //per gestire il colore del cerchio contenente la label visto che Rules e Context non vanno d'accordo:
    ,getFillColor_pluv: function(feature) {
        if (mapPanel.map.getScale() > 2500000) return colors.neutral;
        else {
            if (feature.cluster) { //se interrogo un cluster e non la singola feature
                feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                  if (a.attributes.max1ora == null) a.attributes.max1ora = -99;
                  if (b.attributes.max1ora == null) b.attributes.max1ora = -99;
                  return b.attributes.max1ora - a.attributes.max1ora; //reverse order
                });
                return give_color(label_scaled(feature.cluster[0].attributes.max1ora,''), 'pluv');
            }
            else return give_color(label_scaled(feature.attributes.max1ora,''), 'pluv');
        } //fine dell'else sul valore di scala della mappa
    }
    ,getTitle: function(feature) {
	if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.max1ora == null) a.attributes.max1ora = -99;
                if (b.attributes.max1ora == null) b.attributes.max1ora = -99;
                return b.attributes.max1ora - a.attributes.max1ora; //reverse order
            });
            return feature.cluster[0].attributes.denominazione;
        }
        else { //se invece interrogo la singola feature
            //Se il cluster non e' per attributi:
            return feature.attributes.denominazione;
            //Se il cluster e' per attributi allora:
            //return feature.attributes.dir_class;
        }
    }
};
var style_atl = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 15
        ,graphicName: "circle", fillColor: "${getFillColor_pluv}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    //A quanto pare il context non funzione se c'e una Rule:
    //{rules: [ new OpenLayers.Rule({ title: "Stazioni pluvio",
    //symbolizer: {graphicName: "circle", fillColor: "#c7c7fd", fillOpacity: 0.5, strokeColor:"gray", pointRadius: 10, strokeWidth: 0.5
    //,label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"}
    //}  ,{context: context} //context dentro al rule: non funziona 
    //) ]}
    ,{context: context_atl} //context dentro allo style
);
var styleMap_atl = new OpenLayers.StyleMap({
    "default": style_atl,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var rete_atlpiogge = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_atl,
        strategies: [new OpenLayers.Strategy.Fixed()
	    ,clust_atl
	    ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
        url: url_tinyows,
        featureType: "v_atlante_piogge_rete",
        featureNS: "http://www.tinyows.org/"
        ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
        })
        })
});
rete_atlpiogge.setVisibility(false);


/*RETE METEOIDRO PREVISIONI*/
var style_previdro = new OpenLayers.Style({
	label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
	new OpenLayers.Rule({
        title: "Idrometro",
	symbolizer: {graphicName: "triangle", fillColor: "purple", fillOpacity: 0.6, strokeColor:"black", pointRadius: 5}
        }),
	new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_previdro = new OpenLayers.StyleMap({
        "default": style_previdro,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	, "temporary": new OpenLayers.Style({pointRadius: 10, cursor: "pointer", fontSize: 13, labelYOffset: "15"})
});
var rete_previdro = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_previdro,
        //minScale: 500000,
        strategies: [new OpenLayers.Strategy.BBOX(),
        new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_datidibase,
                //version: "1.1.0",
                featureType: "rete_previdro",
                featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //geometry: "msGeometry", srsName: "epsg:23032"
        })
});
rete_previdro.setVisibility(false);
store_previdro = new GeoExt.data.FeatureStore({
        fields: [
                {name: "codice_istat_comune", type: "string"},
                {name: "progr_punto_com", type: "integer"},
                {name: "codice_stazione", type: "string"},
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "utm_x", type: "integer"},
                {name: "utm_y", type: "integer"},
                {name: "quota_stazione", type: "float"}
        ],
        layer: rete_previdro
});
store_previdro.on('load', function(store){
      store.sort('denominazione', 'ASC');
});
var columns_previdro = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Codice_istat_comune", dataIndex: "codice_istat_comune"},
                {header: "Progr_punto_com", dataIndex: "progr_punto_com"},
                {header: "Codice stazione", dataIndex: "codice_stazione"},
                {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
                {header: "Utm X [m]", dataIndex: "utm_x"},
                {header: "Utm Y [m]", dataIndex: "utm_y"},
                {header: "Quota [m]", dataIndex: "quota_stazione"}
        ]
});

/*RETE METEOIDRO PREVISIONI*/
var style_previdro_stato = new OpenLayers.Style({
        label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Dati mancanti",
        symbolizer: {graphicName: "triangle", fillColor: "gray", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "-1"
        })
        }),
        new OpenLayers.Rule({
        title: "Nessuna criticita prevista",
        symbolizer: {graphicName: "triangle", fillColor: "green", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "0"
        })
        }),
        new OpenLayers.Rule({
        title: "Criticita ordinaria",
        symbolizer: {graphicName: "triangle", fillColor: "gold", fillOpacity: 0.5, strokeColor:"black", pointRadius: 7
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "1"
        })
        }),
        new OpenLayers.Rule({
        title: "Criticita moderata",
        symbolizer: {graphicName: "triangle", fillColor: "orange", fillOpacity: 0.5, strokeColor:"black", pointRadius: 8
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "2"
        })
        }),
        new OpenLayers.Rule({
        title: "Criticita elevata",
        symbolizer: {graphicName: "triangle", fillColor: "red", fillOpacity: 0.5, strokeColor:"black", pointRadius: 9
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: "3"
        })
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        fontSize: "12px", strokeWidth:0.8, pointRadius: 10, labelYOffset: "10"
                }
        })
]});
var styleMap_previdro_stato = new OpenLayers.StyleMap({
        "default": style_previdro_stato,
        "select": new OpenLayers.Style({pointRadius: 10, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 13, cursor: "pointer", labelYOffset: "15"})
});
var previdro_stato_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_previdro_stato,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "previsioni_idro_stato"
            ,featureNS: "http://www.tinyows.org"
            ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
            })
        })
});
previdro_stato_tiny.setVisibility(false);
store_previdro_tiny = new GeoExt.data.FeatureStore({
        fields: [
                {name: "codice_istat_comune", type: "string"},
                {name: "progr_punto_com", type: "integer"},
                {name: "codice_stazione", type: "string"},
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "codice1", type: "float"},
                {name: "codice2", type: "float"},
                {name: "codice3", type: "float"},
		{name: "stato", type: "integer"}
        ],
        layer: previdro_stato_tiny
});
store_previdro_tiny.on('load', function(store){
      store.sort('denominazione', 'ASC');
});
var columns_previdro_tiny = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Codice_istat_comune", dataIndex: "codice_istat_comune"},
                {header: "Progr_punto_com", dataIndex: "progr_punto_com"},
                {header: "Codice stazione", dataIndex: "codice_stazione"},
                {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
                {header: "Codice 1", dataIndex: "codice1"},
                {header: "Codice 2", dataIndex: "codice2"},
                {header: "Codice 3", dataIndex: "codice3"},
		{header: "Stato", dataIndex: "stato"}
        ]
});


/*RETE METEOIDRO PREVISIONI - PO*/
var style_previpo = new OpenLayers.Style({
        label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Idrometro",
        symbolizer: {graphicName: "triangle", fillColor: "blue", fillOpacity: 0.6, strokeColor:"black", pointRadius: 5}
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_previpo = new OpenLayers.StyleMap({
        "default": style_previpo,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	, "temporary": new OpenLayers.Style({pointRadius: 10, cursor: "pointer", fontSize: 13, labelYOffset: "15"})
});
var rete_previpo = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_previpo,
        //minScale: 500000,
        strategies: [new OpenLayers.Strategy.BBOX(),
        new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_datidibase,
                //version: "1.1.0",
                featureType: "rete_previpo",
                featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //geometry: "msGeometry", srsName: "epsg:23032"
        })
});
rete_previpo.setVisibility(false);
store_previpo = new GeoExt.data.FeatureStore({
        fields: [
                {name: "codice_istat_comune", type: "string"},
                {name: "progr_punto_com", type: "integer"},
                {name: "codice_stazione", type: "string"},
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "utm_x", type: "integer"},
                {name: "utm_y", type: "integer"},
                {name: "quota_stazione", type: "float"}
        ],
        layer: rete_previpo
});
//store_bacini.on('load', function(store){
//      store.sort('nome', 'ASC');
//});
var columns_previpo = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Codice_istat_comune", dataIndex: "codice_istat_comune"},
                {header: "Progr_punto_com", dataIndex: "progr_punto_com"},
                {header: "Codice stazione", dataIndex: "codice_stazione"},
                {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
                {header: "Utm X [m]", dataIndex: "utm_x"},
                {header: "Utm Y [m]", dataIndex: "utm_y"},
                {header: "Quota [m]", dataIndex: "quota_stazione"}
        ]
});


/*RETICOLO_IDRO_NW*/
var style_reticolo_idro_nw = new OpenLayers.Style({
	strokeColor: "blue"}, {
	rules: [
	new OpenLayers.Rule({
		title: "fiumi",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipo", value: "FIUME"
		}),
		symbolizer: {strokeWidth: 1.5}
	}),
	new OpenLayers.Rule({
		title: "corsi minori",
		elseFilter:true,
		symbolizer: {strokeWidth: 0.5}
	})
/*
	new OpenLayers.Rule({
		title: " ",
		maxScaleDenominator: 100000,
		symbolizer: {label: "${nome}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif", fontSize: "11px"}
	})
*/
	]}
);
var styleMap_reticolo_idro_nw = new OpenLayers.StyleMap({
        "default": style_reticolo_idro_nw,
        "select": new OpenLayers.Style({strokeColor: "violet"})
	,"temporary": new OpenLayers.Style({strokeWidth:4, cursor: "pointer"})
});
var filter_idro = new OpenLayers.Filter.Comparison({
	type: OpenLayers.Filter.Comparison.EQUAL_TO,
	property: "publish",
	value: 1
});
var filterStrategy_idro = new OpenLayers.Strategy.Filter({filter: filter_idro});
var reticolo_idro_nw1 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_reticolo_idro_nw,
        //minScale: 500000,
        strategies: [new OpenLayers.Strategy.BBOX(), filterStrategy_idro],
	projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "reticolo_idro_nw",
                featureNS: "http://www.tinyows.org/",
		readFormat: new OpenLayers.Format.GML({
		'internalProjection': OL_32632,
		'externalProjection': OL_32632
		})
        })
});
reticolo_idro_nw1.setVisibility(false);


/*RETICOLO PIEMONTE PTA*/
var style_reticolo_idro_piem = new OpenLayers.Style({
	strokeColor: "blue", label: "${denominazi}", labelAlign: "ct", fontWeight: "normale", fontFamily: "sans-serif", fontSize: "0.8em"
});
var styleMap_reticolo_idro_piem = new OpenLayers.StyleMap({
        "default": style_reticolo_idro_piem,
        "select": new OpenLayers.Style({strokeColor: "violet"})
	,"temporary": new OpenLayers.Style({strokeWidth:4, cursor: "pointer"})
});
var reticolo_idro_piem = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_reticolo_idro_piem,
        strategies: [new OpenLayers.Strategy.BBOX()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "idro_network_pta",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
                })
        })
});
reticolo_idro_piem.setVisibility(false);


/*SMARTWS*/
var style_smartws = new OpenLayers.Style({
        title: "Smartws", strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "64B437", fillOpacity: 0.4
});
var styleMap_smartws = new OpenLayers.StyleMap({
	"default": style_smartws
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var smartws = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_smartws,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_datidibase, featureType: "smartws",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
smartws.setVisibility(false);
store_smartws = new GeoExt.data.FeatureStore({
        fields: [
                {name: "zonetype", type: "string"},
		"cod_area", {name: "comboDisplay", type: "string", mapping:"cod_area"},
                {name: "smart_wz", type: "string"},
                {name: "subaree", type: "string"},
                {name: "area", type: "float"}
        ],
        layer: smartws
});
//store_smartws.on('load', function(store){
//      store.sort('nome', 'ASC');
//});
var columns_smartws = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Zona tipo", dataIndex: "zonetype"},
                {header: "<b>Codice area</b>", dataIndex: "cod_area", width: 180},
                {header: "Smart wz", dataIndex: "smart_wz"},
                {header: "Subarea", dataIndex: "subaree", align: "center"},
                {header: "Area [km2]", dataIndex: "area", decimalPrecision: 3, align: "center"}
        ]
});


/*COMTRAPS*/
var style_comtraps = new OpenLayers.Style({
        title: "ComTraps", strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "#D737D7", fillOpacity: 0.4
});
var styleMap_comtraps = new OpenLayers.StyleMap({
	"default": style_comtraps
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var comtraps = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_smartws,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_datidibase, featureType: "comtraps",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
comtraps.setVisibility(false);


/*CONI*/
var style_coni = new OpenLayers.Style({
        title: "Coni", strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.7, fillColor: "#646464", fillOpacity: 0.5
});
var styleMap_coni = new OpenLayers.StyleMap({
	"default": style_coni
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var coni = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_coni,
        strategies: [new OpenLayers.Strategy.Fixed()],
	projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "coni",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })
        })
});
coni.setVisibility(false);


/*PLUVSMARTS*/
var style_pluvsmartz = new OpenLayers.Style({
        title: "PluvSmartz", strokeColor: "black", strokeWidth: 1.5, strokeOpacity: 0.7, fillColor: "white", fillOpacity: 0.5,
	graphicName: "circle", pointRadius: 4
});
var styleMap_pluvsmartz = new OpenLayers.StyleMap({
	"default": style_pluvsmartz
	,"temporary": new OpenLayers.Style({pointRadius: 10, cursor: "pointer"})
});
var pluvsmartz = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_pluvsmartz,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_datidibase, featureType: "pluvsmartz",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
pluvsmartz.setVisibility(false);
store_pluvsmartz = new GeoExt.data.FeatureStore({
        fields: [
                {name: "stazione", type: "string"},
		"cod_stazione", {name: "comboDisplay", type: "string", mapping:"cod_stazione"},
                {name: "x", type: "integer"},
                {name: "y", type: "integer"},
                {name: "z", type: "integer"}
        ],
        layer: pluvsmartz
});
store_pluvsmartz.on('load', function(store){
      store.sort('stazione', 'ASC');
});
var columns_pluvsmartz = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "<b>Stazione</b>", dataIndex: "stazione"},
                {header: "<b>Codice stazione</b>", dataIndex: "cod_stazione"},
                {header: "Coord. X", dataIndex: "x", align: "center"},
		{header: "Coord. Y", dataIndex: "y", align: "center"}
        ]
});


/*INVASI*/
var style_invasi_tiny = new OpenLayers.Style({
	strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "blue", fillOpacity: 0.5
	,label: "${prot_civ_1}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif", labelXOffset: "0", labelYOffset: "22"
	}, {
	rules: [
	new OpenLayers.Rule({
                title: "Invasi Piemonte",
                minScaleDenominator: 500000,
		filter: new OpenLayers.Filter.Comparison({
                	type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
	                property: "link_img", value: "null"
        	}),
                symbolizer: {
                        pointRadius: 10,
                        fontSize: "0px"
                }
        }),
        new OpenLayers.Rule({
                title: "Invasi Piemonte",
                maxScaleDenominator: 500000,
		filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                        property: "link_img", value: "null"
                }),
                symbolizer: {
                        pointRadius: 14,
                        fontSize: "11px"
                }
        })
]});
/*
var invasi_rule = new OpenLayers.Rule({
        title: "Invasi Piemonte",
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "#EDE2E2", fillOpacity: 0.5, radius:20}
});
style_invasi_tiny.addRules([invasi_rule]);
*/
var styleMap_invasi_tiny = new OpenLayers.StyleMap({
	"default": style_invasi_tiny,
	"select": new OpenLayers.Style({pointRadius: 15, fillOpacity: 0.8})
	, "temporary": new OpenLayers.Style({cursor: "pointer", pointRadius: 16, fontSize: "14px", labelYOffset: 25})
});
var invasi_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_invasi_tiny,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "invasi_point",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
invasi_tiny.setVisibility(false);


/*NODI MODELLO DELLE MAGRE ALESSIO SALANDIN*/
var style_nodo_modello_magre_tiny = new OpenLayers.Style({
	strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "blue", fillOpacity: 0.5, title: "${denominazione}"
	,label: "${denominazione}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif", labelXOffset: "0", labelYOffset: "22"
	}, {
	rules: [
	new OpenLayers.Rule({
                title: "Nodi MIKE HYDRO",
                minScaleDenominator: 500000,
		filter: new OpenLayers.Filter.Comparison({
                	type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
	                property: "link_img", value: "null"
        	}),
                symbolizer: {
                        pointRadius: 8,
                        fontSize: "0px"
                }
        }),
        new OpenLayers.Rule({
                title: "Nodi MIKE HYDRO",
                maxScaleDenominator: 500000,
		filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                        property: "link_img", value: "null"
                }),
                symbolizer: {
                        pointRadius: 10,
                        fontSize: "11px"
                }
        })
]});
var styleMap_nodo_modello_magre_tiny = new OpenLayers.StyleMap({
    "default": style_nodo_modello_magre_tiny,
    "select": new OpenLayers.Style({pointRadius: 15, fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 15, cursor: "pointer", fontSize: "14px", labelYOffset: 25})
});
var nodo_modello_magre_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_nodo_modello_magre_tiny,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "nodi_modello_magre",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })
        })
});
nodo_modello_magre_tiny.setVisibility(false);


/*SETTORI ALPINI 2012*/
/*
var style_settorialpini_tiny = new OpenLayers.Style();
var settorialpini_rule = new OpenLayers.Rule({
        title: "Settori alpini - Piemonte",
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "#EDE2E2", fillOpacity: 0.3}
});
style_settorialpini_tiny.addRules([settorialpini_rule]);
*/
var style_settorialpini_tiny = new OpenLayers.Style({
        strokeColor: "black", strokeWidth: 1.5, strokeOpacity: 0.8, fillOpacity: 0.6, fillColor: "#EDE2E2",
        label: "${nome}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
                title: "Settori alpini - Piemonte"
		/*
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento", value: "B"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'#222222', strokeDashstyle:'dashdot', fontColor:'#222222'}
		*/
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 2000000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 2000000,
                symbolizer: {
                        fontSize: "13px"
                }
        })
]});
var styleMap_settorialpini_tiny = new OpenLayers.StyleMap({"default": style_settorialpini_tiny});
var settorialpini_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_settorialpini_tiny,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "settori_2012_simplified",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
settorialpini_tiny.setVisibility(false);


/*STAZIONI NIVO YETI 2014*/
var style_staznivo = new OpenLayers.Style({
        strokeColor: "black", strokeWidth: 0.5, strokeOpacity: 0.8, fillOpacity: 0.6,
        label: "${denominazione}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: -10
        }, {
        rules: [
        new OpenLayers.Rule({
                title: "stazioni manuali",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "tipologia", value: "manuali"
                }),
                symbolizer: {strokeWidth:0.5, graphicName: "square", pointRadius: 4, fillColor: "#00bb78"}
        }),
	new OpenLayers.Rule({
                title: "stazioni automatiche",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "tipologia", value: "automatiche"
                }),
                symbolizer: {strokeWidth:0.5, graphicName: "circle", pointRadius: 4, fillColor: "#00bb78"}
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 1000000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 1000000,
                symbolizer: {
                        fontSize: "13px"
                }
        })
]});
var styleMap_staznivo = new OpenLayers.StyleMap({
    "default": style_staznivo
    ,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 14, cursor: "pointer", labelYOffset: 20})
});
var staznivo = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_staznivo,
        strategies: [new OpenLayers.Strategy.BBOX()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "v_neve_statistiche",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_23032,
                'externalProjection': OL_23032
                })
        })
});
staznivo.setVisibility(false);


/*BACINI IDROGRAFICI*/
var style_bacini_idro = new OpenLayers.Style({
        strokeColor: "black", strokeWidth: 0.4, strokeOpacity: 0.5, fillOpacity: 0.3, fillColor: "gray"
	,title: "${nome}"
        //label: "${denominazi}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: -10
        }, {
        rules: [
        new OpenLayers.Rule({
                title: "bacini di testata",
		maxScaleDenominator: 250000,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 99
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        }),
        new OpenLayers.Rule({
                title: "ordine 8",
		maxScaleDenominator: 500000,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 8
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        }),
	new OpenLayers.Rule({
                title: "ordine 7",
                maxScaleDenominator: 500000,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 7
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        }),
	new OpenLayers.Rule({
                title: "ordine 6",
                minScaleDenominator: 250000,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 6
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        }),
	new OpenLayers.Rule({
                title: "ordine 5",
                minScaleDenominator: 250000,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 5
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        }),
	new OpenLayers.Rule({
                title: "ordine 4",
                minScaleDenominator: 500000,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 4
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        }),
	new OpenLayers.Rule({
                title: "ordine 3",
                //minScaleDenominator: 500000, //questi li faccio vedere sempre
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 3
                })
                //,symbolizer: {strokeWidth:0.5, fillColor: "#00bb78"}
        })
	,new OpenLayers.Rule({
                title: "ordine 00",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ordine", value: 0
                })
        })
]});
var styleMap_bacini_idro = new OpenLayers.StyleMap({
    "default": style_bacini_idro
    , "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillColor:"blue", strokeColor:"orange"})
});
/*PROVA TOOLTIP ma non funziona direttamente sul layer, ho provato a metterlo sulla mappa:
var layerListeners = {
            featureover: function(e) {
                console.log(e.object.name + " says: " + e.feature.gid + " hover.");
                return false;
            },
            featureout: function(e) {
                console.log(e.object.name + " says: No feature hover.");
            }
	,featureclick: function(e) {
            console.log("Map says: " + e.feature.gid + " clicked on " + e.feature.layer.name);
        }
};
*/
var filter_bacini_idro = new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.EQUAL_TO,
    property: "display", value: 'true'
});
var filterStrategy_bacini_idro = new OpenLayers.Strategy.Filter({filter: filter_bacini_idro});
var bacini_idro = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_idro,
	//renderers: ["SVG", "VML"], //ho tolto opzione Canvas sperando che l'hover intercetti tutti i poligoni sovrapposti
	//eventListeners: layerListeners,
        strategies: [new OpenLayers.Strategy.BBOX()
	//, filterStrategy_bacini_idro
	],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "bacini_idrografici_simplified",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_32632,
                'externalProjection': OL_32632
                })
        })
});
bacini_idro.setVisibility(false);
//BACINI DEL PO:
var bacini_idro00 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_idro,
        strategies: [new OpenLayers.Strategy.BBOX()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "bacini_idro00_simplified",
                featureNS: "http://www.tinyows.org/", geometryName: "the_geom"
        })
});
bacini_idro00.setVisibility(false);


/* AEROPORTI NAZIONALI */
var style_aeroporti = new OpenLayers.Style({
        fillColor: "#ffcc66", strokeColor: "#ff9933", strokeWidth: 2
        ,label: "${id}", labelYOffset: -3
        ,fontColor: 'white', fontWeight: "bold", fontFamily: "monospace"
        ,externalGraphic: root_dir_html+"/common/icons/aeroporti.svg", graphicWidth: 60, graphicOpacity:0.8
/*, labelOutlineColor: "white", labelOutlineWidth: 0, labelYOffset: 15, graphicHeight: 15, graphicYOffset: -18*/
	}, {
        rules: [
        new OpenLayers.Rule({
		title: " ",
                minScaleDenominator: 450000,
                symbolizer: {fontSize: "0px", graphicWidth: 25}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 450000,
                symbolizer: { fontSize: "12px" }
        })
]}
);
var styleMap_aeroporti = new OpenLayers.StyleMap({
	"default": style_aeroporti
	,"temporary": new OpenLayers.Style({graphicWidth: 70, fontSize: 14, cursor: "pointer"})
});
/*var filter_rupar = new OpenLayers.Filter.Comparison({
 *         type: OpenLayers.Filter.Comparison.EQUAL_TO,
 *         property: "flag_rupar",
 *         value: 'S'
 *});
 *var filterStrategy_temp = new OpenLayers.Strategy.Filter({filter: filter_rupar});*/
var aeroporti = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_aeroporti,
        strategies: [new OpenLayers.Strategy.Fixed()
        /*,filterStrategy_temp*/
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "aeroporti_nazionali", //nuova logica ultimo dato da meteo_real_time
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })
        })
});
aeroporti.setVisibility(false);


/*SMART SLOP nuova struttura*/
var style_smartslops = new OpenLayers.Style({
	title: "${localita}", strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "#EDE2E2", fillOpacity: 0.3
	}, {
	rules: [
	/*new OpenLayers.Rule({
        title: "Slops con superamento in evento",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_slops", value: 1
        }),
        symbolizer: {fillColor: "red", fillOpacity: 0.5, strokeColor:"black"}
        }),*/
	new OpenLayers.Rule({
		title: "Inneschi isolati",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "alert", value: 'L'
		})
		,symbolizer: {strokeWidth:0.5, fillColor: "gold"}
	}),
	new OpenLayers.Rule({
		title: "Inneschi poco diffusi",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "alert", value: 'M'
		})
		,symbolizer: {strokeWidth:0.5, fillColor: "orange"}
	}),
	new OpenLayers.Rule({
		title: "Inneschi diffusi",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "alert", value: 'H'
		})
		,symbolizer: {strokeWidth:0.5, fillColor: "red"}
	}),
	new OpenLayers.Rule({
		title: "Inneschi molto diffusi",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "alert", value: 'V'
		})
		,symbolizer: {strokeWidth:0.5, fillColor: "purple"}
    	}),
	new OpenLayers.Rule({
        title: "Pioggia continuativa di almeno 12h",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_slops", value: 0
        }),
        symbolizer: {fillColor: "green", fillOpacity: 0.5, strokeColor:"black"}
        }),
	new OpenLayers.Rule({
        title: "Pioggia inferiore alle 12h",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_slops", value: -1
        }),
        symbolizer: {fillColor: "gray", fillOpacity: 0.5, strokeColor:"black"}
        })
	/*,new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 450000,
                symbolizer: {fontSize: "0px", graphicWidth: 25}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 450000,
                symbolizer: { fontSize: "12px" }
        })*/
	]}
);
var styleMap_smartslops = new OpenLayers.StyleMap({
        "default": style_smartslops
        , "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var filterSmartslops = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.GREATER_THAN,
        property: "stato_slops",
        value: -1 
});
var filterSmartslops = new OpenLayers.Strategy.Filter({filter: filterSmartslops});
var smartslops_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_smartslops,
        strategies: [new OpenLayers.Strategy.Fixed()
	  //, filterSmartslops
	],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "smart_slops",
                featureNS: "http://www.tinyows.org/",
                srsName: "epsg:32632", geometryName: "the_geom"
        })
});
smartslops_tiny.setVisibility(false);
store_smartslops = new GeoExt.data.FeatureStore({
        fields: [
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "codice_stazione", type: "string"},
                {name: "cod_area", type: "string"},
                {name: "ore_pioggia", type: "integer"},
                {name: "localita", type: "string"},
		{name: "valore_p", type: "double"},
		{name: "infiltrazione", type: "double"},
		{name: "valore_i", type: "double"},
		{name: "diff", type: "auto"},
		{name: "stato_slops", type: "integer"}
        ],
        layer: smartslops_tiny
});
store_smartslops.on('load', function(store){
      store.sort('diff', 'DESC');
});
var columns_smartslops = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Denominazione", dataIndex: "denominazione", width:90},
		{header: "<b>Codice staz.</b>", dataIndex: "codice_stazione", align: "center", width:30},
                {header: "<b>Codice area</b>", dataIndex: "cod_area", align: "center", width:30},
                {header: "h pioggia", dataIndex: "ore_pioggia", align: "center", width:30},
		{header: "diff [mm]", dataIndex: "diff", width:30,
		  renderer:function(value, metadata, record){
		    pioggia = record.get('valore_p') + record.get('infiltrazione');
		    diff = parseFloat(pioggia - record.get('valore_i'));
		    return diff.toFixed(2);
                } },
                {header: "Localita", dataIndex: "localita"}
        ]
});

