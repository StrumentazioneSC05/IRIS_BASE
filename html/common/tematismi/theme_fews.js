/*
 * author: Armando Riccardo Gaeta
 * email: ar_gaeta@yahoo.it
 * 
*/


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////

/*RETE STAZIONI FEWS*/
var style_rete_fews_idro = new OpenLayers.Style({
        label: "${shortname}\n\n${id_codice}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
	new OpenLayers.Rule({
        title: "Idro",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "description", value: "Idro"
        }),
	symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
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
var styleMap_rete_fews_idro = new OpenLayers.StyleMap({
	"default": style_rete_fews_idro,
	"select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});	
var filter_fews_idro = new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "description", value: 'Idro'
	});
var filterStrategy_fews_idro = new OpenLayers.Strategy.Filter({filter: filter_fews_idro});
var rete_fews_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_rete_fews_idro,
	strategies: [new OpenLayers.Strategy.Fixed()
	  //, filterStrategy_fews_idro
	],
	projection: OL_4326,
	protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows,
	    featureType: "rete_fews",
	    featureNS: "http://www.tinyows.org/",
	    geometryName: "the_geom"
	})
});
rete_fews_tiny.setVisibility(false);

var style_rete_fews_meteo = new OpenLayers.Style({
        label: "${shortname}\n\n${id_codice}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Meteo",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "description", value: "Meteo"
        }),
        symbolizer: {graphicName: "circle", fillColor: "#eeeeee", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
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
var styleMap_rete_fews_meteo = new OpenLayers.StyleMap({
        "default": style_rete_fews_meteo,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});
var filter_fews_meteo = new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                property: "description", value: 'Idro'
        });
var filterStrategy_fews_meteo = new OpenLayers.Strategy.Filter({filter: filter_fews_meteo});
var rete_oss_fews = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_fews_meteo,
        strategies: [new OpenLayers.Strategy.Fixed()
	,filterStrategy_fews_meteo
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_stazioni_oss_idro",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_oss_fews.setVisibility(false);

var rete_oss_idro_fews = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_fews_idro,
        strategies: [new OpenLayers.Strategy.Fixed()
	,filterStrategy_fews_idro
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_stazioni_oss_idro",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_oss_idro_fews.setVisibility(false);


/* ULTIMA OSSERVAZIONE IDRO */
var rete_oss_idro_fews_po = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idro_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
        //,filterStrategy_fews_idro
        ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_stazioni_oss_idro_po",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_oss_idro_fews_po.setVisibility(false);


/* PREVISIONI IDRO SU STAZIONI */
var style_rete_previ_fews = new OpenLayers.Style({
        label: "${shortname}\n\n${id_codice}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Idro",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "description", value: "Idro"
        }),
        symbolizer: {graphicName: "triangle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
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
var styleMap_rete_previ_fews = new OpenLayers.StyleMap({
        "default": style_rete_previ_fews,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});
var rete_previ_fews = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_previ_fews,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_stazioni_previ_idro",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_previ_fews.setVisibility(false);

var rete_previ_fews_po = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_previ_fews,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_stazioni_previ_idro_po",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_previ_fews_po.setVisibility(false);

var rete_previ_fews_affluenti_po = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_previ_fews,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_stazioni_previ_idro_affluenti_po",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_previ_fews_affluenti_po.setVisibility(false);

store_previ_fews_po = new GeoExt.data.FeatureStore({
        fields: [
                "nome", {name: "comboDisplay", type: "string", mapping:"nome"},
                {name: "id", type: "string"},
                {name: "elev", type: "float"}
        ],
        layer: rete_previ_fews_po
});
var columns_previ_fews_po = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "Nome stazione", dataIndex: "nome"},
                {header: "<b>ID</b>", dataIndex: "id", width: 250},
                {header: "Quota [m slm]", dataIndex: "elev"}
        ]
});


/* INVASI RID DIGHE */
var style_rete_dighe_fews = new OpenLayers.Style({
        label: "${name}\n\n${id}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
	//,graphicName: "circle", fillColor: "blue", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "con dati",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                property: "tipo_staz", value: "0"
        }),
        symbolizer: {graphicName: "circle", fillColor: "blue", fillOpacity: 0.5, strokeColor:"black", pointRadius: 7}
        }),
        new OpenLayers.Rule({
        title: "senza dati",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "tipo_staz", value: "0"
        }),
        symbolizer: {graphicName: "circle", fillColor: "gray", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 500000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 500000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_rete_dighe_fews = new OpenLayers.StyleMap({
        "default": style_rete_dighe_fews,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});
var rete_dighe_fews = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_dighe_fews,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_invasi_rid",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_dighe_fews.setVisibility(false);

var rete_dighe_piemunt_fews = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_rete_dighe_fews,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_invasi_rid_piemonte",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
rete_dighe_piemunt_fews.setVisibility(false);

