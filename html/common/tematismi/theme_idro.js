/*
 * ** author: Armando Riccardo Gaeta
 * ** email: ar_gaeta@yahoo.it
 * */


//per recuperare gli ultimi 15giorni:
var last15gg_idro = new Date(currentTimeUTC.getTime() - 1296000000); //recupero 15 giorni fa
var last15gg_full_idro = get_dateString(last15gg_idro); //nella forma .yyyymmddhhmmss.
//A te serve .startString. per i modelli4 nella forma "yyyy-mm-dd":
//var last15gg_short_idro = last15gg_full_idro.substring(0,12); //yyyymmddhhmm
var last15gg_str_idro = last15gg_full_idro.slice(0, 4) + "-" + last15gg_full_idro.slice(4,6) + "-" + last15gg_full_idro.slice(6,8); //yyyy-mm-dd

//per recuperare gli ultimi 7giorni:
var last7gg_idro = new Date(currentTimeUTC.getTime() - 604800000); //recupero 15 giorni fa
var last7gg_full_idro = get_dateString(last7gg_idro); //nella forma .yyyymmddhhmmss.
var last7gg_str_idro = last7gg_full_idro.slice(0, 4) + "-" + last7gg_full_idro.slice(4,6) + "-" + last7gg_full_idro.slice(6,8); //yyyy-mm-dd


/*WEBCAM*/
var style_webcam = new OpenLayers.Style({
        label: " ${nome}", fontWeight: "bold", labelAlign: "cm", fontSize: "14px", fontColor: 'black'
        }, {
        rules: [
                new OpenLayers.Rule({
                title: "Webcam fiumi",
                //maxScaleDenominator: 450000,
                filter:  new OpenLayers.Filter.Comparison({
                          type: OpenLayers.Filter.Comparison.EQUAL_TO,
                          property: "tipo_cam", value: 'fiumi'
                }),
                symbolizer: {externalGraphic: root_dir_html+"/common/icons/eye_blu.png", graphicWidth: 35, graphicHeight: 19, rotation: "${direzione}", labelYOffset: 21, labelOutlineWidth: 0}
                }),
		new OpenLayers.Rule({
                title: "Webcam nivo",
                //maxScaleDenominator: 450000,
                filter: new OpenLayers.Filter.Comparison({
                          type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                          property: "tipo_cam", value: 'fiumi'
                }),
                symbolizer: {externalGraphic: root_dir_html+"/common/icons/eye.png", graphicWidth: 35, graphicHeight: 19, rotation: "${direzione}", labelYOffset: 21, labelOutlineWidth: 0}
                }),
	new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 450000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6, graphicWidth: 24}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 450000,
                symbolizer: {
                        fontSize: "12px", graphicWidth: 35
                }
        })
        ]}
);
var styleMap_webcam = new OpenLayers.StyleMap({
        "default": style_webcam
        ,"temporary": new OpenLayers.Style({graphicWidth: 40, fontSize: "16px", cursor: "pointer", labelYOffset: 22})
});
var filterWebcam = new OpenLayers.Filter.Comparison({
	type: OpenLayers.Filter.Comparison.EQUAL_TO,
	property: "stato",
	value: "1"
});
var filterStrategyWebcam = new OpenLayers.Strategy.Filter({filter: filterWebcam, caching: false});
var webcam_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_webcam,
        strategies: [new OpenLayers.Strategy.Fixed()
	  //,filterStrategyWebcam
	],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_webcam",
		geometryName: "the_geom"
        })
});
webcam_tiny.setVisibility(false);

var filterWebcam_ARPALo = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "competenza",
        value: "ARPALo"
});
var filterStrategyWebcam_ARPALo = new OpenLayers.Strategy.Filter({filter: filterWebcam_ARPALo});
var webcam_ARPALo = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_webcam,
        strategies: [new OpenLayers.Strategy.Fixed()
	//, filterStrategyWebcam_ARPALo
	],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_webcam_arpalo",
                geometryName: "the_geom"
        })
});
webcam_ARPALo.setVisibility(false);
var store_webcam_ARPALo = new GeoExt.data.FeatureStore({
        fields: [
                "nome", {name: "comboDisplay", type: "string", mapping:"nome"},
                {name: "quota", type: "integer"},
                {name: "direzione", type: "integer"}
        ],
        layer: webcam_ARPALo
});
store_webcam_ARPALo.on('load', function(store){
        store.sort('nome', 'ASC');
});
var columns_webcam_ARPALo = new Ext.grid.ColumnModel({
        defaults: { sortable: true },
        columns: [
                {header: "Nome", dataIndex: "nome",  width: 90},
                {header: "Quota", dataIndex: "quota", sortable: true, width: 70},
                {header: "Direzione", dataIndex: "direzione", align: "center", width: 40}
        ]
});

/*MISURATORI CANALI*/
var style_misuratori_canali = new OpenLayers.Style({
        label: "${denominazione}\n\n${denominazione_canale}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Misuratori canali",
        symbolizer: {graphicName: "circle", fillColor: "green", fillOpacity: 0.8, strokeColor:"black", pointRadius: 4
        }
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 150000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 150000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_misuratori_canali = new OpenLayers.StyleMap({
        "default": style_misuratori_canali,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var misuratori_canali = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_misuratori_canali,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "misuratori_canali",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
misuratori_canali.setVisibility(false);



/*DERIVAZIONI*/
var style_derivazioni = new OpenLayers.Style({
        label: "${nodo}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Derivazioni",
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
var styleMap_derivazioni = new OpenLayers.StyleMap({
        "default": style_derivazioni,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var derivazioni = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_derivazioni,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "derivazioni",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
derivazioni.setVisibility(false);


/*IDROELETTRICO*/
var style_idroelettrico = new OpenLayers.Style({
        label: "${nodo}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Derivazioni",
        symbolizer: {graphicName: "circle", fillColor: "purple", fillOpacity: 0.8, strokeColor:"black", pointRadius: 4
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
var styleMap_idroelettrico = new OpenLayers.StyleMap({
        "default": style_idroelettrico,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var idroelettrico = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idroelettrico,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "idroelettrico",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
idroelettrico.setVisibility(false);


/*RADAR SOGLIE*/
var style_radarsoglie = new OpenLayers.Style({
        label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "Alert",
        symbolizer: {graphicName: "triangle", fillColor: "red", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN,
                property: "alert", value: 90
        })
        }),
	new OpenLayers.Rule({
        title: "NO alert",
        symbolizer: {graphicName: "triangle", fillColor: "purple", fillOpacity: 0.8, strokeColor:"black", pointRadius: 5
        }
	,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "alert", value: 90
        })
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
var styleMap_radarsoglie = new OpenLayers.StyleMap({
        "default": style_radarsoglie,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var radarsoglie = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_radarsoglie,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_radar_soglie",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
radarsoglie.setVisibility(false);


/* MODELLO 4 NIVO */
var style_modello4 = new OpenLayers.Style({
        label: "${codice}-${data_rilievo}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: "10"
        }, {
        rules: [
        new OpenLayers.Rule({
        title: "GDF",
        symbolizer: {graphicName: "star", fillColor: "yellow", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "codice", value: "GDF"
        })
        }),
        new OpenLayers.Rule({
        title: "Guide",
        symbolizer: {graphicName: "circle", fillColor: "orange", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "codice", value: "G0"
        })
        }),
        new OpenLayers.Rule({
        title: "Ufficio",
        symbolizer: {graphicName: "triangle", fillColor: "purple", fillOpacity: 0.8, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "codice", value: "A"
        })
        }),
        new OpenLayers.Rule({
        title: "Regionali",
        symbolizer: {graphicName: "square", fillColor: "blue", fillOpacity: 0.8, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "codice", value: "S"
        })
        }),
	new OpenLayers.Rule({
        title: "Forestale",
        symbolizer: {graphicName: "square", rotation: 45, fillColor: "green", fillOpacity: 0.8, strokeColor:"black", pointRadius: 5
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "codice", value: "CFS"
        })
        }),
        new OpenLayers.Rule({
        title: "Commissione Locale Valanghe",
        symbolizer: {graphicName: "cross", rotation: 45, fillColor: "red", fillOpacity: 0.8, strokeColor:"black", pointRadius: 5, strokeWidth: 0.6
        }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "codice", value: "CLV"
        })
        }),
	new OpenLayers.Rule({
        title: "Ultimi 7 giorni",
        symbolizer: { pointRadius: 8 }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                property: "last_update", value: last7gg_str_idro
        })
        }),
	new OpenLayers.Rule({
        title: "Ultimi 14 giorni",
        symbolizer: { pointRadius: 5 }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "last_update", lowerBoundary: last7gg_str_idro, upperBoundary: last15gg_str_idro
        })
        }),
	new OpenLayers.Rule({
        title: "Ultimi 30 giorni",
        symbolizer: { pointRadius: 2 }
        ,filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "last_update", value: last15gg_str_idro
        })
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 900000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 900000,
                symbolizer: {
                        fontSize: "12px"
                }
        })
]});
var styleMap_modello4 = new OpenLayers.StyleMap({
        "default": style_modello4,
        "select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
        ,"temporary": new OpenLayers.Style({pointRadius: 12, fontSize: 12, cursor: "pointer", labelYOffset: "18"})
});
var modello4 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_modello4,
        strategies: [new OpenLayers.Strategy.BBOX()
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
            url: url_tinyows,
            featureType: "v_modello4",
            featureNS: "http://www.tinyows.org/",
            geometryName: "the_geom"
        })
});
modello4.setVisibility(false);


/*FOTO NIVO*/
var style_fotonivo = new OpenLayers.Style({
        label: " ${onlydata}", fontWeight: "bold", labelAlign: "cm", fontSize: "14px", fontColor: 'black', labelYOffset: 15
        }, {
        rules: [
                new OpenLayers.Rule({
                title: "Foto rilievi nivologici",
                //maxScaleDenominator: 450000,
                symbolizer: {graphicName: "circle", fillColor: "red", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5
        }
                }),
	new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 450000,
                symbolizer: {fontSize: "0px", strokeWidth:0.6, graphicWidth: 24}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 450000,
                symbolizer: {
                        fontSize: "12px", graphicWidth: 35
                }
        })
        ]}
);
var styleMap_fotonivo = new OpenLayers.StyleMap({
        "default": style_fotonivo
        ,"temporary": new OpenLayers.Style({graphicWidth: 40, fontSize: "16px", cursor: "pointer", labelYOffset: 22})
});

var fotonivo_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_fotonivo,
        strategies: [new OpenLayers.Strategy.Fixed()
	],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_foto_nivo",
		geometryName: "the_geom"
        })
});
fotonivo_tiny.setVisibility(false);

