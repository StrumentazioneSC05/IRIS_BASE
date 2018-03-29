/*
 * author: Armando Riccardo Gaeta
 * email: ar_gaeta@yahoo.it
 * 
*/


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////

/*AREA EXPO*/
var style_areaexpo = new OpenLayers.Style({
	strokeColor: "black", strokeWidth: 0.6, strokeOpacity: 0.8, fillOpacity: 0.6, 
	label: "${descrizione}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
	}, {
	rules: [
	/*new OpenLayers.Rule({
                title: "Area Expo",
                symbolizer: {fill:1, fillColor: "purple", strokeWidth: 0.8}
        }),*/
	new OpenLayers.Rule({
		title: " ",
    		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "area", value: "Area 1"
		}),
		minScaleDenominator: 250000,
		symbolizer: {pointRadius: 3, fontSize: "0px", strokeWidth:0.6, fillColor: "purple"}
	}),
	new OpenLayers.Rule({
		title: " ",
    		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "area", value: "Area 1"
		}),
		maxScaleDenominator: 250000,
		symbolizer: { pointRadius: 13, fontSize: "13px", fillColor: "purple" }
	})
]});
var styleMap_areaexpo = new OpenLayers.StyleMap({"default": style_areaexpo});
var areaexpo = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_areaexpo,
	strategies: [new OpenLayers.Strategy.Fixed()
	],
	projection: OL_4326,
	protocol: new OpenLayers.Protocol.WFS({
		url: url_tinyows, featureType: "areaexpo",
		featureNS: "http://www.tinyows.org/",
		readFormat: new OpenLayers.Format.GML({
                	'internalProjection': OL_4326,
                	'externalProjection': OL_4326
                })
	})
});
areaexpo.setVisibility(false);
var style_areaexpo_pto = new OpenLayers.Style({
	externalGraphic: root_dir_html+"/common/icons/marker_expo.svg", graphicWidth: 60, graphicOpacity:1, graphicYOffset: -60 
	}, {
        rules: [
	new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: { graphicWidth: 35, graphicYOffset: -30 }
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: { }
        })
]});
var styleMap_areaexpo_pto = new OpenLayers.StyleMap({"default": style_areaexpo_pto});
var areaexpo_pto = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_areaexpo_pto,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "areaexpo_pto",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
areaexpo_pto.setVisibility(false);

var style_areaexpo_pub = new OpenLayers.Style({
        strokeColor: "purple", strokeWidth: 2.6, strokeOpacity: 0.8, fillOpacity: 0,
        }, {
        rules: [
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: { strokeWidth:1.6, fillColor: "purple"}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: { }
        })
]});
var styleMap_areaexpo_pub = new OpenLayers.StyleMap({"default": style_areaexpo_pub});
var areaexpo_pub = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_areaexpo_pub,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "areaexpo",
                featureNS: "http://www.tinyows.org/",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
areaexpo_pub.setVisibility(false);


/*RETE ARPA LOMBARDIA COMPLETA */
var style_meteoidrol = new OpenLayers.Style({
        label: "${nome}\n\n${quota} m asl", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
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
        title: "Idrometrica",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "Idrometrica"
        }),
        symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
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
var styleMap_meteoidrol = new OpenLayers.StyleMap({
	"default": style_meteoidrol,
	"select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});	
var rete_meteoidrol_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_meteoidrol,
	strategies: [new OpenLayers.Strategy.Fixed()
	],
	projection: OL_4326,
	protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows,
	    featureType: "elencostazionisensori",
	    featureNS: "http://www.tinyows.org/"
	    ,readFormat: new OpenLayers.Format.GML({
		'internalProjection': OL_4326,
		'externalProjection': OL_4326
	    })
	})
});
rete_meteoidrol_tiny.setVisibility(false);


/*RETE ARPA LOMBARDIA PROVA per IRIS LOMBARDIA */
var style_staz = new OpenLayers.Style({
        pointRadius: 5, strokeColor: "black", strokeWidth: 0.4, fillOpacity: 0.3//, strokeOpacity: 0.5, fillOpacity: 0.3, fillColor: "gray"
        ,title: "${denominazione}"
        ,label: "${denominazione}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: -10
        }, {
        rules: [
	new OpenLayers.Rule({
                title: "Meteorologica in tempo reale",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "meteo_tab", value: 'Meteorologica'
                })
                //,symbolizer: {pointRadius: 5, strokeWidth:0.5, fillColor: "red"}
		,symbolizer: {graphicName: "square", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 4}
        }),
        new OpenLayers.Rule({
                title: "Idrometrica",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "meteo_tab", value: 'Idrometrica'
                })
                //,symbolizer: {pointRadius: 5, strokeWidth:0.5, fillColor: "green"}
		,symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
        }),
	new OpenLayers.Rule({
                title: "Pluviometrica",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "meteo_tab", value: 'Pluviometrica'
                })
                //,symbolizer: {graphicName: "triangle", pointRadius: 5, strokeWidth:0.5, fillColor: "blue"}
                ,symbolizer: {graphicName: "triangle", pointRadius: 5, strokeWidth:0.5, fillColor: "blue"}
        }),
	new OpenLayers.Rule({
                title: "Anemometrica",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "meteo_tab", value: 'Anemometrica'
                })
                //,symbolizer: {graphicName: "square", pointRadius: 5, strokeWidth:0.5, fillColor: "orange"}
                ,symbolizer: {graphicName: "square", pointRadius: 5, strokeWidth:0.5, fillColor: "green"}
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
var styleMap_staz = new OpenLayers.StyleMap({
        "default": style_staz,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});
var rete_meteoidro_lm = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_staz,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "v_anagraficasensori_lm",
                featureNS: "http://www.tinyows.org/",
                srsName: "epsg:32632", geometryName: "the_geom"
        })
});
rete_meteoidro_lm.setVisibility(false);
store_staz_lm = new GeoExt.data.FeatureStore({
        fields: [
          //Commento alcuni campi nella speranza che lo scarico dei dati per popolare il menu a tendina sia piu' rapido..
          {name: "idstazione", type: "string"},
          "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
	  {name: "quota", type: "integer"},
	  {name: "utm_nord", type: "integer"},
	  {name: "utm_est", type: "integer"},
	  {name: "nometipologie", type: "string"},
	  {name: "idsensori", type: "string"}
	],
	layer: rete_meteoidro_lm
	//,autoLoad: true
});
var columns_staz_lm = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
	columns: [
		{header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
		{header: "Codice stazione", dataIndex: "idstazione"},
		{header: "Quota [m slm]", dataIndex: "quota"},
		{header: "Utm X [m]", dataIndex: "utm_est"},
		{header: "Utm Y [m]", dataIndex: "utm_nord"},
		{header: "Tipo sensori", dataIndex: "nometipologie"},
		{header: "ID sensori", dataIndex: "idsensori"}
	]
});


/*TEMPERATURE LOMBARDIA*/
//Provo tematizzazione con CLUSTER e cerchi colorati - devo definire un cluster strategy per ogni layer altrimenti non so perche sballa e lo fa solo sull'ultimo layer per cui e' definito!
var clust_temp_lm = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var context_temp_lm = {
    getLabel: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            //Se il cluster non e' per attributi:
            /*valore = [];
            for (var i = 0; i < feature.cluster.length; i++) {
                if (feature.cluster[i].attributes.ultimovalore) valore.push(feature.cluster[i].attributes.ultimovalore);
            }
            valore.sort(); //alphabetical order: dunque con i numeri sballa!
            valore.reverse();
	    return label_scaled(valore[0]);*/
	    feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
		if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
		if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
		return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
	    });
	//console.log(feature.cluster);
	    return label_scaled(feature.cluster[0].attributes.ultimovalore,'\xB0');
            //Se il cluster e' per attributi allora:
            //return feature.cluster[0].attributes.dir_class;
        }
        else { //se invece interrogo la singola feature
            //Se il cluster non e' per attributi:
            return label_scaled(feature.attributes.ultimovalore,'\xB0');
            //Se il cluster e' per attributi allora:
            //return feature.attributes.dir_class;
        }
    }
    ,getLabel_idro: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
            return label_scaled_pluv(feature.cluster[0].attributes.ultimovalore,'');
        }
        else { //se invece interrogo la singola feature
            return label_scaled_pluv(feature.attributes.ultimovalore,'');
        }
    }
    ,getLabel_nivo: function(feature){
    //Gestisco le label nel caso di clusterizzazione:
    if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
            return label_scaled(feature.cluster[0].attributes.ultimovalore,'');
        }
        else { //se invece interrogo la singola feature
            return label_scaled(feature.attributes.ultimovalore,'');
        }
    }
    ,getLabel_gamma: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
                if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
            return label_scaled(feature.cluster[0].attributes.ultimovalore,'');
        }
        else { //se invece interrogo la singola feature
            return label_scaled(feature.attributes.ultimovalore,'');
        }
    }
    //per gestire la dimensione in base alla scala visto che Rules e Context non vanno d'accordo:
    ,getRadius: function() {
        if (mapPanel.map.getScale() > 500000 && mapPanel.map.getScale() < 2500000) return 12;
        else if (mapPanel.map.getScale() > 2500000) return 4;
        else return 16;
    }
    ,getWidth: function(feature) {
        return (feature.cluster) ? 1.5 : 0.5; //se l'elemento e' clusterzizato il suo bordo e' piu' spesso
    }
    //per gestire il colore del cerchio contenente la label visto che Rules e Context non vanno d'accordo:
    ,getFillColor: function(feature) {
	if (mapPanel.map.getScale() > 2500000) return colors.neutral;
	else {
	    if (feature.cluster) { //se interrogo un cluster e non la singola feature
		feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                  if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                  if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                  return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            	});
		return give_color(label_scaled(feature.cluster[0].attributes.ultimovalore,''), 'temp');
    	    }
	    else return give_color(label_scaled(feature.attributes.ultimovalore,''), 'temp');
	} //fine dell'else sul valore di scala della mappa
    }
    ,getFillColor_idro: function(feature) {
        if (mapPanel.map.getScale() > 2500000) return colors.neutral;
        else {
            if (feature.cluster) { //se interrogo un cluster e non la singola feature
                feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                  //if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                  //if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                  //return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
                  //Nel caso degli IDROMETRI mi serve lo stato:
                  return b.attributes.stato - a.attributes.stato; //reverse order
                });
                //return give_color(label_scaled(feature.cluster[0].attributes.ultimovalore,''), 'idro');
                return give_color(label_scaled(feature.cluster[0].attributes.stato,''), 'idro');
            }
            //else return give_color(label_scaled(feature.attributes.ultimovalore,''), 'idro');
            else return give_color(label_scaled(feature.attributes.stato,''), 'idro');
        } //fine dell'else sul valore di scala della mappa
    }
    ,getFillColor_nivo: function(feature) {
        if (mapPanel.map.getScale() > 2500000) return colors.neutral;
        else {
            if (feature.cluster) { //se interrogo un cluster e non la singola feature
                feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                  if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                  if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                  return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
                });
                return give_color(label_scaled(feature.cluster[0].attributes.ultimovalore,''), 'nivo');
            }
            else return give_color(label_scaled(feature.attributes.ultimovalore,''), 'nivo');
        } //fine dell'else sul valore di scala della mappa
    }
    //Per dare un ALT col nome della stazione
    ,getTitle: function(feature) {
	if (feature.cluster) { //se interrogo un cluster e non la singola feature
	    feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
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
var style_temp_clust_lm = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 15
        ,graphicName: "circle", fillColor: "${getFillColor}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    //A quanto pare il context non funzione se c'e una Rule
    ,{context: context_temp_lm} //context dentro allo style
);
var styleMap_temp_clust_lm = new OpenLayers.StyleMap({
    "default": style_temp_clust_lm,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var temperatura_lm = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_temp_clust_lm,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.Fixed()
            //,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            //,filterStrategy_temp
	    ,clust_temp_lm
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
		//version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom",
		url: url_tinyows,
		featureNS: "http://www.tinyows.org/",
		//featureType: "v_datistazioni", //vecchia logica
		featureType: "v_last_terma_lombardia", //nuova logica dati da meteo_real_time
		//featurePrefix: "tows",
                readFormat: new OpenLayers.Format.GML({
			'internalProjection': OL_32632,
			'externalProjection': OL_32632
                })
        })
});
temperatura_lm.setVisibility(false);
var store_terma_lm = new GeoExt.data.FeatureStore({
        fields: [
                {name: "idstazione", type: "integer"},
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "idsensore", type: "integer"},
                {name: "utm_nord", type: "integer"},
                {name: "utm_est", type: "integer"},
                {name: "ultimovalore", type: "float"},
                {name: "timeultimovalore", type: "string"}
        ],
        layer: temperatura_lm
	//,autoLoad: true
});
store_terma_lm.on('load', function(store){
        store.sort('timeultimovalore', 'ASC');
});
var columns_terma_lm = new Ext.grid.ColumnModel({
        defaults: {
                sortable: true
        },
        columns: [
                {header: "Id sensore", dataIndex: "idsensore",  width: 90},
		{header: "Denominazione", dataIndex: "denominazione", width: 100},
		{xtype: "numbercolumn", header: "Valore [&deg;C]", dataIndex: "ultimovalore", decimalPrecision: 1, align: "center", width: 60},
                {id: "Date", header: "Data ora", dataIndex: "timeultimovalore", sortable: true, width: 70},
		{header: "UTM X", dataIndex: "utm_est",  width: 90},
		{header: "UTM Y", dataIndex: "utm_nord",  width: 90}
        ]
});


/*RETE METEOIDRO LOMBARDIA IN TEMPO REALE o meglio ATTIVE*/
var style_meteoidrolm = new OpenLayers.Style({
        label: "${denominazione}\n\n${quota} m asl", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
	new OpenLayers.Rule({
        title: "Meteorologica in tempo reale",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "meteo_tab", value: "Meteorologica"
        }),
	symbolizer: {graphicName: "square", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 4}
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
                title: "Pluviometrica",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "meteo_tab", value: 'Pluviometrica'
                })
                ,symbolizer: {graphicName: "triangle", pointRadius: 5, strokeWidth:0.5, fillColor: "blue"}
        }),
        new OpenLayers.Rule({
                title: "Anemometrica",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "meteo_tab", value: 'Anemometrica'
                })
                ,symbolizer: {graphicName: "square", pointRadius: 5, strokeWidth:0.5, fillColor: "green"}
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
var styleMap_meteoidrolm = new OpenLayers.StyleMap({
	"default": style_meteoidrolm,
	"select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});	
var rete_meteoidrolm_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_meteoidrolm,
	strategies: [new OpenLayers.Strategy.Fixed()
	],
	projection: OL_4326,
	protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows,
	    featureType: "v_stazioni_lombardia_meteo",
	    featureNS: "http://www.tinyows.org/"
	    ,readFormat: new OpenLayers.Format.GML({
		'internalProjection': OL_4326,
		'externalProjection': OL_4326
	    })
	})
});
store_meteoidrolm = new GeoExt.data.FeatureStore({
        fields: [
            {name: "idstazione", type: "integer"},
	    "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
            {name: "quota", type: "float"}
        ],
        layer: rete_meteoidrolm_tiny
        //,autoLoad: true
});
//store_meteoidro.load();
store_meteoidrolm.on('load', function(store){
    store.sort('denominazione', 'ASC');
    //combo.setDisabled(true);
});
var columns_meteoidrolm = new Ext.grid.ColumnModel({
    defaults: { sortable: true },
        columns: [
                {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
                {header: "Codice stazione", dataIndex: "idstazione"},
		{header: "Quota s.l.m.", dataIndex: "quota"}
        ]
});
rete_meteoidrolm_tiny.setVisibility(false);


/* TEMPERATURA PER VISUALIZZAZIONE ETICHETTE */
var clust_temp_expo = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var context_temp_expo = {
    getLabel: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            //Se il cluster non e' per attributi:
            /*valore = [];
            for (var i = 0; i < feature.cluster.length; i++) {
                if (feature.cluster[i].attributes.ultimovalore) valore.push(feature.cluster[i].attributes.ultimovalore);
            }
            valore.sort(); //alphabetical order: dunque con i numeri sballa!
            valore.reverse();
            return label_scaled(valore[0]);*/
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
        //console.log(feature.cluster);
            return label_scaled(feature.cluster[0].attributes.ultimovalore,'\xB0');
            //Se il cluster e' per attributi allora:
            //return feature.cluster[0].attributes.dir_class;
        }
        else { //se invece interrogo la singola feature
            //Se il cluster non e' per attributi:
            return label_scaled(feature.attributes.ultimovalore,'\xB0');
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
        return (feature.cluster) ? 1.5 : 0.5; //se l'elemento e' clusterzizato il suo bordo e' piu' spesso
    }
    //per gestire il colore del cerchio contenente la label visto che Rules e Context non vanno d'accordo:
    ,getFillColor: function(feature) {
        if (mapPanel.map.getScale() > 2500000) return colors.neutral;
        else {
            if (feature.cluster) { //se interrogo un cluster e non la singola feature
                feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                  if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                  if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                  return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
                });
                return give_color(label_scaled(feature.cluster[0].attributes.ultimovalore,''), 'temp');
            }
            else return give_color(label_scaled(feature.attributes.ultimovalore,''), 'temp');
        } //fine dell'else sul valore di scala della mappa
    }
    ,getFillColor_nivo: function(feature) {
        if (mapPanel.map.getScale() > 2500000) return colors.neutral;
        else {
            if (feature.cluster) { //se interrogo un cluster e non la singola feature
                feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                  if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                  if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                  return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
                });
                return give_color(label_scaled(feature.cluster[0].attributes.ultimovalore,''), 'nivo');
            }
            else return give_color(label_scaled(feature.attributes.ultimovalore,''), 'nivo');
        } //fine dell'else sul valore di scala della mappa
    }
    //Per dare un ALT col nome della stazione
    ,getTitle: function(feature) {
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
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
var style_temp_clust_expo = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 14
        ,graphicName: "circle", fillColor: "${getFillColor}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    //A quanto pare il context non funzione se c'e una Rule
    ,{context: context_temp_expo} //context dentro allo style
);
var styleMap_temp_clust_expo = new OpenLayers.StyleMap({
    "default": style_temp_clust_expo,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var temperatura_tiny_expo = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_temp_clust_expo,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            //,filterStrategy_temp
            ,clust_temp_expo
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                //version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom",
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_terma_expo", //nuova logica dati da meteo_real_time
                //featurePrefix: "tows",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
temperatura_tiny_expo.setVisibility(false);
store_last_termalm = new GeoExt.data.FeatureStore({
        fields: [
            {name: "idstazione", type: "integer"},
	    "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
            {name: "tipo_staz", type: "string"},
	    {name: "ultimovalore", type: "float"},
	    {name: "timeultimovalore", type: "string"}
        ],
        layer: temperatura_tiny_expo
        //,autoLoad: true
});
store_last_termalm.on('load', function(store){
    store.sort('denominazione', 'ASC');
});
var columns_last_termalm = new Ext.grid.ColumnModel({
    defaults: { sortable: true },
        columns: [
                {header: "Denominazione", dataIndex: "denominazione", align: "center", width: 200},
                {header: "Codice stazione", dataIndex: "idstazione"},
                {header: "Tipo stazione", dataIndex: "tipo_staz"},
				{header: "Ultimo valore [C]", dataIndex: "ultimovalore"},
				{header: "Dataora", dataIndex: "timeultimovalore"}
        ]
});


/* LIVELLO IDROMETRICO PER VISUALIZZAZIONE ETICHETTE - TEST per IRIS LOMBARDIA */
var clust_idro_lm = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var style_idro_clust_lm = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel_idro}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 14
        ,graphicName: "circle", fillColor: "${getFillColor_idro}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    ,{context: context_temp} //context dentro allo style
);
var styleMap_idro_clust_lm = new OpenLayers.StyleMap({
    "default": style_idro_clust_lm,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 18, cursor: "pointer"})
});
var last_idro_lm = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idro_clust_lm,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            //,clust_idro_lm
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                srsName: "epsg:23032", geometryName: "the_geom",
                url: url_tinyows, featureNS: "http://www.tinyows.org/",
                featureType: "v_last_idro_lombardia" //nuova logica dati da meteo_real_time
        })
});
last_idro_lm.setVisibility(false);
var store_idro_lm = new GeoExt.data.FeatureStore({
        fields: [
                {name: "idstazione", type: "integer"},
		"denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
                {name: "idsensore", type: "integer"},
                {name: "utm_nord", type: "integer"},
                {name: "utm_est", type: "integer"},
                {name: "ultimovalore", type: "float"},
                {name: "timeultimovalore", type: "string"}
        ],
        layer: temperatura_lm
        //,autoLoad: true
});
store_idro_lm.on('load', function(store){
        store.sort('timeultimovalore', 'DESC');
});
var columns_idro_lm = new Ext.grid.ColumnModel({
        defaults: {
                sortable: true
        },
        columns: [
                {header: "Id sensore", dataIndex: "idsensore",  width: 90},
                {header: "Denominazione", dataIndex: "denominazione", width: 100},
                {xtype: "numbercolumn", header: "Valore [&deg;C]", dataIndex: "ultimovalore", decimalPrecision: 1, align: "center", width: 60},
                {id: "Date", header: "Data ora", dataIndex: "timeultimovalore", sortable: true, width: 70},
                {header: "UTM X", dataIndex: "utm_est",  width: 90},
                {header: "UTM Y", dataIndex: "utm_nord",  width: 90}
        ]
});


/* PIOGGE ULTIME 3H */
var clust_pluv_expo = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2 //soglia, al di sotto della qual non clusterizza
});
var context_pluv_expo = {
    getLabel: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            //Se il cluster non e' per attributi:
            /*valore = [];
            for (var i = 0; i < feature.cluster.length; i++) {
                valore.push(feature.cluster[i].attributes.pluv3h);
            }
            valore.sort();
            valore.reverse();
            return label_scaled(valore[0]);*/
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.pluv3h == null) a.attributes.pluv3h = -99;
                if (b.attributes.pluv3h == null) b.attributes.pluv3h = -99;
                return b.attributes.pluv3h - a.attributes.pluv3h; //reverse order
            });
            return label_scaled_pluv(feature.cluster[0].attributes.pluv3h,'');
            //Se il cluster e' per attributi allora:
            //return feature.cluster[0].attributes.pluv3h;
        }
        else { //se invece interrogo la singola feature
            //Se il cluster non e' per attributi:
            return label_scaled_pluv(feature.attributes.pluv3h,'');
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
                  if (a.attributes.pluv3h == null) a.attributes.pluv3h = -99;
                  if (b.attributes.pluv3h == null) b.attributes.pluv3h = -99;
                  return b.attributes.pluv3h - a.attributes.pluv3h; //reverse order
                });
                return give_color(label_scaled(feature.cluster[0].attributes.pluv3h,''), 'pluv');
            }
            else return give_color(label_scaled(feature.attributes.pluv3h,''), 'pluv');
        } //fine dell'else sul valore di scala della mappa
    }
    ,getTitle: function(feature) {
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.pluv3h == null) a.attributes.pluv3h = -99;
                if (b.attributes.pluv3h == null) b.attributes.pluv3h = -99;
                return b.attributes.pluv3h - a.attributes.pluv3h; //reverse order
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
var style_pluv_expo = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 12
        ,graphicName: "circle", fillColor: "${getFillColor_pluv}", fillOpacity: 0.9, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    //A quanto pare il context non funzione se c'e una Rule:
    //{rules: [ new OpenLayers.Rule({ title: "Stazioni pluvio",
    //symbolizer: {graphicName: "circle", fillColor: "#c7c7fd", fillOpacity: 0.5, strokeColor:"gray", pointRadius: 10, strokeWidth: 0.5
    //,label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"}
    //}  ,{context: context_pluv_expo} //context dentro al rule: non funziona
    //) ]}
    ,{context: context_pluv_expo} //context dentro allo style
);
var styleMap_pluv_expo = new OpenLayers.StyleMap({
    "default": style_pluv_expo,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var rete_pluv_expo = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_pluv_expo,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,clust_pluv_expo
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
        url: url_tinyows,
        featureType: "v_last_pluv",
        featureNS: "http://www.tinyows.org/"
        ,readFormat: new OpenLayers.Format.GML({
                'internalProjection': OL_4326,
                'externalProjection': OL_4326
        })
        })
});
rete_pluv_expo.setVisibility(false);

//Tematismo replicando struttura anagrafica di Arpa Lombardia:
var clust_pluv_lm = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2 //soglia, al di sotto della qual non clusterizza
});
var rete_pluv_lm = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_pluv_expo,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,clust_pluv_lm
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
          url: url_tinyows,
          featureType: "v_last_pluv_lombardia",
          featureNS: "http://www.tinyows.org/",
	  geometryName: "the_geom"
        })
});
rete_pluv_lm.setVisibility(false);


/* VENTI */
var styleMap_vento_lm = new OpenLayers.StyleMap({
"default": style_vento_graphicname
,"select": new OpenLayers.Style({fontSize: 19, pointRadius: 23, fillColor: "blue", fillOpacity: 0.8})
,"temporary": new OpenLayers.Style({pointRadius: 23, cursor: "pointer"})
});
var last_vento_expo_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_vento_lm,
        strategies: [new OpenLayers.Strategy.Fixed()
        ,new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "v_last_vento_expo", //nuova logica ultimo dato da meteo_real_time
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
last_vento_expo_tiny.setVisibility(false);

//Tematismo replicando struttura anagrafica di Arpa Lombardia:
var last_vento_lm_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_vento_lm,
        strategies: [new OpenLayers.Strategy.Fixed()
        ,new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "v_last_vento_lombardia", //nuova logica ultimo dato da meteo_real_time
                featureNS: "http://www.tinyows.org/",
		geometryName: "the_geom"
        })
});
last_vento_lm_tiny.setVisibility(false);


/*AREU PIAZZOLE*/
var style_areu_piazzole = new OpenLayers.Style({
	strokeColor: "black", strokeWidth: 0.6, strokeOpacity: 0.8, fillOpacity: 0.6,
	label: "${nominativo}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
	}, {
	rules: [
	new OpenLayers.Rule({
		title: "NOTT_ILL",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "NOTT_ILL"
		}),
		symbolizer: {graphicName: "square", fillColor: "purple", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "NOTT_NVG",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "NOTT_NVG"
		}),
		symbolizer: {graphicName: "triangle", fillColor: "blue", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "NVG",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "NVG"
		}),
		symbolizer: {graphicName: "triangle", fillColor: "gold", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "DIURNE",
		filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LIKE,
		property: "tipologia", value: "DIURN"
	}),
	symbolizer: {fillColor: "gray", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
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
			labelYOffset: "18",
			fontSize: "12px"
		}
	})
]});
var styleMap_areu_piazzole = new OpenLayers.StyleMap({
	"default": style_areu_piazzole,
	"select": new OpenLayers.Style({pointRadius: 10, fillColor: "blue", fillOpacity: 0.8}),
	"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var areu_piazzole = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_areu_piazzole,
	strategies: [new OpenLayers.Strategy.Fixed()],
		projection: OL_4326,
		protocol: new OpenLayers.Protocol.WFS({
			url: url_tinyows,
			featureNS: "http://www.tinyows.org/",
			featureType: "areu_piazzole",
			geometryName: "the_geom"
		})
});
areu_piazzole.setVisibility(false);


/*AREU SITI ILLUMINATI NVG*/
var style_areu_siti_illuminati = new OpenLayers.Style({
	strokeColor: "black", strokeWidth: 0.6, strokeOpacity: 0.8, fillOpacity: 0.6,
	label: "${nominativo}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
	}, {
	rules: [
	new OpenLayers.Rule({
		title: "PIAZZOLA",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "PIAZZOLA"
		}),
		symbolizer: {graphicName: "square", fillColor: "blue", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "ILL",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "ILL"
		}),
		symbolizer: {graphicName: "triangle", fillColor: "olive", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "DIURNO",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "DIURNO"
		}),
		symbolizer: {fillColor: "gray", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "NVG",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "tipologia", value: "NVG"
		}),
		symbolizer: {graphicName: "triangle", fillColor: "gold", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
	}),
	new OpenLayers.Rule({
		title: "NOTT_ILL",
		filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LIKE,
		property: "tipologia", value: "NOTT"
	}),
	symbolizer: {graphicName: "triangle", fillColor: "purple", fillOpacity: 0.5, strokeColor:"black", pointRadius: 6}
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
			labelYOffset: "18",
			fontSize: "12px"
		}
	})
]});
var styleMap_areu_siti_illuminati = new OpenLayers.StyleMap({
	"default": style_areu_siti_illuminati,
	"select": new OpenLayers.Style({pointRadius: 10, fillColor: "blue", fillOpacity: 0.8}),
	"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var areu_siti_illuminati = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_areu_siti_illuminati,
	strategies: [new OpenLayers.Strategy.Fixed()],
		projection: OL_4326,
		protocol: new OpenLayers.Protocol.WFS({
			url: url_tinyows,
			featureNS: "http://www.tinyows.org/",
			featureType: "areu_siti_illuminati_nvg",
			geometryName: "the_geom"
		})
});
areu_siti_illuminati.setVisibility(false);


