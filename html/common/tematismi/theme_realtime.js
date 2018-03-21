/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


var last1h = new Date(currentTimeUTC.getTime() - 3600000); //recupero 1 ora fa
var last3h = new Date(currentTimeUTC.getTime() - 10800000); //recupero 3 ore fa
var last15min = new Date(currentTimeUTC.getTime()); //recupero l'ultimo disponibile

//Variabili per costruire il filtro filterStrategyStorm:
//var last3h_string = l3_dy.toString() + l3_mm + l3_dd + l3_hh + l3_min; //nella forma "yyyymmddhhmm"
var last1h_string = get_dateString(last1h);
var last3h_string = get_dateString(last3h); //recupero il primo ellipse di 3 ore fa
var lastStorm_string = get_dateString(last15min); //recupero l'ultimo ellipse disponibile


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////

/*RITARDO CARICAMENTO DATI STAZIONI*/
var style_ritardo_stazioni = new OpenLayers.Style({
	title: "${denominazione}",
        label: "${ritardo_caricamento}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 12
        ,graphicName: "circle", fillOpacity: 0.8, strokeColor:"black",  strokeWidth: 0.5
	}, {
	rules: [
		new OpenLayers.Rule({
		title: "<span style='color:#5a5c2d;'> <15' </span>",
		filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.LESS_THAN,
				property: "ritardo_caricamento", value: 15
		}),
		symbolizer: {fillColor: '#5a5c2d', pointRadius: 7}
		}),
		new OpenLayers.Rule({
		title: "<span style='color:#A0A000;'> 15'-30' </span>",
		filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: "ritardo_caricamento", lowerBoundary: 15, upperBoundary: 30
		}),
		symbolizer: {fillColor: '#A0A000', pointRadius: 7}
		}),
		new OpenLayers.Rule({
		title: "<span style='color:orange;'> 30'-45' </span>",
		filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: "ritardo_caricamento", lowerBoundary: 30, upperBoundary: 45
		}),
		symbolizer: {fillColor: 'orange', pointRadius: 7}
		}),
		new OpenLayers.Rule({
		title: "<span style='color:purple;'> >45' </span>",
		filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.GREATER_THAN,
				property: "ritardo_caricamento", value: 45
		}),
		symbolizer: {fillColor: 'purple', pointRadius: 7}
		}),
		new OpenLayers.Rule({
		title: "<span style='color:gray;'>Ultimo dato > 60'</span>",
		filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.GREATER_THAN,
				property: "ritardo_webgis", value: 60
		}),
		symbolizer: {fillColor: 'silver', pointRadius: 7}
		}),
		new OpenLayers.Rule({
			title: " ",
			maxScaleDenominator: 250000,
			symbolizer: {pointRadius: 14, fontSize: 15}
		}),
		new OpenLayers.Rule({
			title: " ",
			minScaleDenominator: 250000,
			symbolizer: {fontSize: "0px"}
		})
	]}
);				
var styleMap_ritardo_stazioni = new OpenLayers.StyleMap({
    "default": style_ritardo_stazioni,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var ritardo_stazioni = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_ritardo_stazioni,
	strategies: [new OpenLayers.Strategy.Fixed()
		,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
	],
	projection: OL_23032,
	protocol: new OpenLayers.Protocol.WFS({
		url: url_tinyows,
		featureNS: "http://www.tinyows.org/",
		featureType: "v_ritardi_caricamento"
		,srsName: "epsg:23032"
		,geometryName: "the_geom"
	})
});
ritardo_stazioni.setVisibility(false);


/*ELLIPSE-TEMPORALI ellissi*/
var style_ellipse = new OpenLayers.Style();
var ellipse_0 = new OpenLayers.Rule({
	title: "0 - non classificato",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 0
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "white", fillOpacity: 0.4, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
var ellipse_1 = new OpenLayers.Rule({
	title: "1 - prob. occ. > 50%",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 1
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "#347C17", fillOpacity: 0.4, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
var ellipse_2 = new OpenLayers.Rule({
	title: "2 - prob. occ. < 50%",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 2
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "#52D017", fillOpacity: 0.45, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
var ellipse_3 = new OpenLayers.Rule({
	title: "3 - prob. occ. < 30%",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 3
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "yellow", fillOpacity: 0.5, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
var ellipse_4 = new OpenLayers.Rule({
	title: "4 - prob. occ. < 15%",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 4
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "orange", fillOpacity: 0.55, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
var ellipse_5 = new OpenLayers.Rule({
	title: "5 - prob. occ. < 3%",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 5
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "red", fillOpacity: 0.6, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
var ellipse_6 = new OpenLayers.Rule({
	title: "6 - temporale forte mai osservato",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "si", value: 6
	}),
    symbolizer: {strokeColor: "black", strokeWidth: 0.5, fillColor: "#B93B8F", fillOpacity: 0.65, label: " ${ora}", labelAlign: "cm", fontSize: "8px", fontColor: 'black', fontWeight: "normal", fontFamily: 'Comic Sans MS'}
});
style_ellipse.addRules([ellipse_0, ellipse_1, ellipse_2, ellipse_3, ellipse_4, ellipse_5, ellipse_6]);
var styleMap_ellipse = new OpenLayers.StyleMap({
	"default": style_ellipse,
	"temporary": new OpenLayers.Style({fontSize: 19, cursor: "pointer"})
});
var filterStorm = new OpenLayers.Filter.Comparison({
	type: OpenLayers.Filter.Comparison.BETWEEN,
	//type: OpenLayers.Filter.Comparison.EQUAL_TO,
	property: "data_num",
	//value: dateString
	lowerBoundary: last3h_string,
	upperBoundary: lastStorm_string
});
var filterStrategyStorm = new OpenLayers.Strategy.Filter({filter: filterStorm});
var ellipse = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_ellipse,
	strategies: [new OpenLayers.Strategy.Fixed()
	//,new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
	, filterStrategyStorm
	],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_realtime,
		version: "1.1.0",
		featureType: "ellipse3h",
	        featureNS: "http://mapserver.gis.umn.edu/mapserver",
		geometry: "msGeometry", srsName: "epsg:23032"
	})
});
var store_storm = new GeoExt.data.FeatureStore({
	fields: [
		"id", {name: "comboDisplay", type: "string", mapping:"id"},
		{name: "data", type: "string"},
		{name: "ora", type: "string"},
		{name: "lifetime", type: "integer"},
		{name: "si", type: "integer"},
		{name: "vil", type: "float"},
		{name: "area", type: "float"},
		{name: "comune", type: "string"},
		{name: "tmin", type: "float"},
		{name: "cltop", type: "float"},
		{name: "top", type: "float"},
		{name: "vv", type: "integer"},
		{name: "dd", type: "integer"},
		{name: "max", type: "float"},
		{name: "mean", type: "float"}
		//{name: "provincia", type: "string"}
	],
	layer: ellipse
	//,sortInfo: { field: "DATA_ORIGINE", direction: "ASC" } //pare non funzionare...
});
store_storm.on('load', function(store){
	store.sort('data', 'DESC');
});
var columns_storm = new Ext.grid.ColumnModel({
	defaults: {
		sortable: true
	},
	columns: [
		{header: "Id", dataIndex: "id",  width: 90},
		{id: "Date", header: "Data", dataIndex: "data", sortable: true, width: 70},
		{header: "Ora", dataIndex: "ora", width: 40},
		{header: "SSI", dataIndex: "si", align: "center", width: 40},
		{header: "Vita [min]", dataIndex: "lifetime", align: "center", width: 60},
		{header: "Vel [km/h]", dataIndex: "vv", align: "center", width: 60},
		{header: "Dir [&deg;]", dataIndex: "dd", align: "center", width: 60},
		{header: "Comune", dataIndex: "comune", width: 100},
		//{header: "Provincia", dataIndex: "provincia"},
		{xtype: "numbercolumn", header: "Area [km2]", dataIndex: "area", decimalPrecision: 1, align: "center", width: 60},
		{xtype: "numbercolumn", header: "Max [dBZ]", dataIndex: "max", decimalPrecision: 1, align: "center", width: 60},
		{xtype: "numbercolumn", header: "Mean [dBZ]", dataIndex: "mean", decimalPrecision: 1, align: "center", width: 60},
		{xtype: "numbercolumn", header: "Vil [kg/m2]", dataIndex: "vil", decimalPrecision: 1, align: "center", width: 60},
		{xtype: "numbercolumn", header: "Tmin [&deg;C]", dataIndex: "tmin", decimalPrecision: 1, align: "center", width: 60},
		{xtype: "numbercolumn", header: "ClTop [100m]", dataIndex: "cltop", decimalPrecision: 1, align: "center", width: 60},
		{xtype: "numbercolumn", header: "Top [100m]", dataIndex: "top", decimalPrecision: 1, align: "center", width: 60}
	]
});
ellipse.setVisibility(false);


/*ELLIPSE-TEMPORALI ellissi - recupero solo 1 ora*/
//ERRORE se attivo filterStrategyStorm1h del tipo "Cannot read property 'clone' of undefined" di GeoExt ma non capisco perche', forse solo quando non ci sono temporali? ma su ellipse 3h non da lo stesso problema, buh
var filterStorm1h = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.GREATER_THAN,
        property: "dataora",
        value: last1h_string
});
var filterStrategyStorm1h = new OpenLayers.Strategy.Filter({filter: filterStorm1h, caching: false});
var ellipse1h = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_ellipse,
        strategies: [new OpenLayers.Strategy.BBOX()
        //, new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
        , filterStrategyStorm1h
        ],
	projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "g_ellipse_app_last",
                featureNS: "http://www.tinyows.org/",
		geometryName: "the_geom"
        })
});
var store_storm1h = new GeoExt.data.FeatureStore({
        fields: [
		"id_storm_track", {name: "comboDisplay", type: "string", mapping:"id_storm_track"},
                {name: "fulldate", type: "string"},
                {name: "lifetime", type: "integer"},
                {name: "si", type: "integer"},
                {name: "area", type: "float"},
                {name: "vv", type: "integer"},
                {name: "dd", type: "integer"}
        ],
        layer: ellipse1h
});
store_storm1h.on('load', function(store){
        store.sort('fulldate', 'DESC');
});
var columns_storm1h = new Ext.grid.ColumnModel({
        defaults: {
                sortable: true
        },
        columns: [
                {header: "Id", dataIndex: "id_storm_track",  width: 90},
                {id: "Date", header: "Data", dataIndex: "fulldate", sortable: true, width: 70},
                {header: "SSI", dataIndex: "si", align: "center", width: 40},
                {header: "Vita [min]", dataIndex: "lifetime", align: "center", width: 60},
                {header: "Vel [km/h]", dataIndex: "vv", align: "center", width: 60},
                {header: "Dir [&deg;]", dataIndex: "dd", align: "center", width: 60},
		{xtype: "numbercolumn", header: "Area [km2]", dataIndex: "area", decimalPrecision: 1, align: "center", width: 60}
        ]
});
ellipse1h.setVisibility(false);

/*ELLIPSE ultime 3H su mosaico bis*/
var filterStorm_lema = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.BETWEEN,
        property: "data_num",
        lowerBoundary: last3h_string,
        upperBoundary: lastStorm_string
});
var filterStrategyStorm_lema = new OpenLayers.Strategy.Filter({filter: filterStorm_lema});
var ellipse3h_lema = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_ellipse,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [
	    //new OpenLayers.Strategy.Fixed(),
	    new OpenLayers.Strategy.BBOX(),
	    filterStrategyStorm_lema
	],
	projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows, featureType: "ellipse_3ore_lema",
	    featureNS: "http://www.tinyows.org/",
            readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_23032,
		    'externalProjection': OL_23032
            })
	})
});
ellipse3h_lema.setVisibility(false);
var store_storm_lema = new GeoExt.data.FeatureStore({
	fields: [
		"id", {name: "comboDisplay", type: "string", mapping:"id"},
		{name: "data", type: "string"},
		{name: "ora", type: "string"},
		{name: "lifetime", type: "integer", useNull: true},
		{name: "si", type: "integer", useNull: true},
		{name: "vil", type: "auto"},
		{name: "area", type: "float", useNull: true},
		{name: "comune", type: "string"},
		{name: "tmin", type: "float", useNull: true},
		{name: "cltop", type: "float", useNull: true},
		{name: 'cltop_km', type:'auto'}, // is cltop/10
		{name: "top", type: "auto"},
		{name: "top_km", type: "auto"}, // is top/10
		{name: "vv", type: "integer", useNull: true},
		{name: "dd", type: "integer", useNull: true},
		{name: "max", type: "float", useNull: true},
		{name: "mean", type: "float", useNull: true}
		//{name: "provincia", type: "string"}
	],
	layer: ellipse3h_lema
});
store_storm_lema.on('load', function(store){
	store.sort('data', 'DESC');
});
var columns_storm_lema = new Ext.grid.ColumnModel({
        defaults: { sortable: true },
        columns: [
                {header: "Id", dataIndex: "id",  width: 90},
                {id: "Date", header: "Data", dataIndex: "data", sortable: true, width: 70},
                {header: "Ora", dataIndex: "ora", width: 40},
                {header: "SSI", dataIndex: "si", align: "center", width: 40},
                {header: "Vita [min]", dataIndex: "lifetime", align: "center", width: 40},
                {header: "Vel [km/h]", dataIndex: "vv", align: "center", width: 40},
                {header: "Dir [&deg;]", dataIndex: "dd", align: "center", width: 40},
                {header: "Comune", dataIndex: "comune", width: 80},
                //{xtype: "numbercolumn", header: "Area [km2]", dataIndex: "area", decimalPrecision: 1, align: "center", width: 50},
                {header: "Area [km2]", dataIndex: "area", align: "center", width: 50, editor:{xtype:'numberfield', decimalPrecision:1}},
		{header: "Max [dBZ]", dataIndex: "max", align: "center", width: 50, editor:{xtype:'numberfield', decimalPrecision:1}},
		{header: "Mean [dBZ]", dataIndex: "mean", align: "center", width: 50, editor:{xtype:'numberfield', decimalPrecision:1}},
		{header: "Vil [kg/m2]", dataIndex: "vil", align: "center", width: 50, editor:{xtype:'numberfield', decimalPrecision:1}},
		{header: "Tmin [&deg;C]", dataIndex: "tmin", align: "center", width: 50, editor:{xtype:'numberfield', decimalPrecision:1}},
                {dataIndex:"cltop_km", header:"ClTop [km]", align:"center", width:50, renderer:function(value,metadata,record){
		    if (record.get('cltop')) return record.get('cltop')/10;
		    else return record.get('cltop');
	        } },
                {dataIndex:"top_km", header:"Top [km]", align:"center", width:50, renderer:function(value,metadata,record){
		    if (record.get('top')) return record.get('top')/10;
		    else return record.get('top');
	        } }
        ]
});


/*ELLIPSE ultime 24H - per animazione*/
var filterStorm24 = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.BETWEEN,
        property: "data",
        lowerBoundary: last3h_string,
        upperBoundary: lastStorm_string
});
var filterStrategyStorm24 = new OpenLayers.Strategy.Filter({filter: filterStorm24});
var ellipse_24h = new OpenLayers.Layer.Vector(default_layer_name, {
          styleMap: styleMap_ellipse,
          strategies: [
                new OpenLayers.Strategy.Fixed()
                , filterStrategyStorm24
          ],
          projection: OL_23032,
          protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "ellipse_oggi",
                featureNS: "http://www.tinyows.org/",
                geometryName: "the_geom"
          })
});
ellipse_24h.setVisibility(false);


/*FORECAST ENVELOPE*/
/*var style_for_env = new OpenLayers.Style({
	title: "Forecast 1h", strokeColor: "black", strokeWidth: 0.5, strokeOpacity: 0.6, fillColor: "#B93B8F", fillOpacity: 0.5
});
var styleMap_for_env = new OpenLayers.StyleMap({"default": style_for_env});
*/
var style_for_env = new OpenLayers.Style();
var for_env_rule = new OpenLayers.Rule({
        title: "Nowcasting 1h",
        symbolizer: {strokeColor: "black", strokeWidth: 0.5, strokeOpacity: 0.6, fillColor: "gray", fillOpacity: 0.5}
        });
style_for_env.addRules([for_env_rule]);
var styleMap_for_env = new OpenLayers.StyleMap({
	"default": style_for_env
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});

var for_env = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_for_env,
	strategies: [new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Refresh({force: true, interval:150000})],
	protocol: new OpenLayers.Protocol.WFS({
        url: urlMS_realtime, version: "1.1.0", featureType: "forecast_envelope",
        featureNS: "http://mapserver.gis.umn.edu/mapserver",
	geometry: "msGeometry", srsName: "epsg:23032"
    })
});
for_env.setVisibility(false);

/*Forecast 1h  su mosaico bis */
var for_env_lema = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_for_env,
        strategies: [new OpenLayers.Strategy.Fixed()],
	projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows, featureType: "forecast_envelope_lema",
	    featureNS: "http://www.tinyows.org/",
            readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_23032,
		    'externalProjection': OL_23032
            })
	})
});
for_env_lema.setVisibility(false); 

/*SPOSTAMENTO */
/*var style_disp = new OpenLayers.Style({
	title: "Spostamento", strokeColor: "black", strokeWidth: 0.5, strokeOpacity: 0.6, fillColor: "#B93B8F", fillOpacity: 0.5
});
var styleMap_disp = new OpenLayers.StyleMap({"default": style_disp});
*/
var style_disp = new OpenLayers.Style();
var disp_rule = new OpenLayers.Rule({
        title: "Spostamento 30min",
        symbolizer: {strokeColor: "black", strokeWidth: 0.5, strokeOpacity: 0.6, fillColor: "gray", fillOpacity: 0.5}
        });
style_disp.addRules([disp_rule]);
var styleMap_disp = new OpenLayers.StyleMap({
	"default": style_disp
	,"temporary": new OpenLayers.Style({strokeWidth:4, cursor: "pointer"})
});

var disp = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_disp,
	strategies: [new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Refresh({force: true, interval:150000})],
	protocol: new OpenLayers.Protocol.WFS({
        url: urlMS_realtime, version: "1.1.0", featureType: "spostamento",
        featureNS: "http://mapserver.gis.umn.edu/mapserver",
	geometry: "msGeometry", srsName: "epsg:23032"
    })
});
disp.setVisibility(false);


/*FULMINI*/
OpenLayers.Renderer.symbol.cross2 = [4,0, 5,0, 5,4, 9,4, 9,5, 5,5, 5,9, 4,9, 4,5, 0,5, 0,4, 4,4, 4,0];
var style_fulmini_default = new OpenLayers.Style();
var fulmini_default_rule = new OpenLayers.Rule({
        title: "Fulmini ultime 3h",
	symbolizer: {pointRadius: 8, graphicName: "cross2", fillColor: "#ee0099", fillOpacity: 0.5, strokeColor:"black", rotation: 45, strokeWidth: 0.4}
        //"externalGraphic": "meteo/fulmine.gif"
});
var ccfulmini_rule = new OpenLayers.Rule({
        title: "C-C Fulmini ultime 3h",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "tipo", value: "C"
	}),
		symbolizer: {pointRadius: 8, graphicName: "cross2", fillColor: "#777777", fillOpacity: 0.5, strokeColor:"black", rotation: 45, strokeWidth: 0.4}
});
var cgfulmini_rule = new OpenLayers.Rule({
        title: "C-G Fulmini ultime 3h",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "tipo", value: "G"
	}),
		symbolizer: {pointRadius: 8, graphicName: "cross2", fillColor: "#ee0099", fillOpacity: 0.5, strokeColor:"black", rotation: 45, strokeWidth: 0.4}
});
var style_fulmini_select = new OpenLayers.Style();
var fulmini_select_rule = new OpenLayers.Rule({
        symbolizer: {pointRadius: 14, graphicName: "cross2", fillColor: "blue", fillOpacity: 0.7, strokeWidth: 0.1}
        //"externalGraphic": "meteo/fulmine.gif"
});
style_fulmini_default.addRules([ccfulmini_rule, cgfulmini_rule]);
// style_fulmini_default.addRules([fulmini_default_rule]);
style_fulmini_select.addRules([fulmini_select_rule]);
var styleMap_fulmini = new OpenLayers.StyleMap({
        "default": style_fulmini_default,
        "select": style_fulmini_select
	,"temporary": new OpenLayers.Style({pointRadius: 16, cursor: "pointer"})
});
var filterFulmini = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.BETWEEN,
        //type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: "data_num",
        //value: dateString
        lowerBoundary: last3h_string,
        upperBoundary: lastStorm_string
});
var filterStrategyFulmini = new OpenLayers.Strategy.Filter({filter: filterFulmini});
console.log(last3h_string, lastStorm_string);
var fulmini = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_fulmini,
	strategies: [new OpenLayers.Strategy.Fixed(),
	new OpenLayers.Strategy.Refresh({force: true, interval:150000})
	, filterStrategyFulmini
	],
	projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "g_fulmini_3ore",
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
fulmini.setVisibility(false);

//FULMINI 1h//
var filterFulmini1h = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.GREATER_THAN,
        property: "data_num",
        value: last1h_string
});
var filterStrategyFulmini1h = new OpenLayers.Strategy.Filter({filter: filterFulmini1h});
var fulmini1h = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_fulmini,
        strategies: [new OpenLayers.Strategy.BBOX(),
        new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
        , filterStrategyFulmini1h
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "g_fulmini_3ore",
                featureNS: "http://www.tinyows.org/",
                geometryName: "the_geom"
        })
});
fulmini1h.setVisibility(false);


//FULMINI 24h - solo per animazione//
var filterFulmini24 = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.BETWEEN,
        property: "data_num",
	lowerBoundary: last3h_string,
        upperBoundary: lastStorm_string
});
var filterStrategyFulmini24 = new OpenLayers.Strategy.Filter({filter: filterFulmini24});
var fulmini24h = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_fulmini,
        strategies: [new OpenLayers.Strategy.Fixed()
        , filterStrategyFulmini24
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "g_fulmini_oggi",
                featureNS: "http://www.tinyows.org/",
                geometryName: "the_geom"
        })
});
fulmini24h.setVisibility(false);


/*CLUSTER FULMINI*/
var style_cluster_f = new OpenLayers.Style();
var date_last3h = new Date(currentTimeUTC.getTime() - (3 * 60 * 60 * 1000) );
var last3h = date_last3h.today_bis() + " " + date_last3h.timeNow();
//alert(typeof(last3h));
//In realta' questo filtro funziona solo sulla data ma non sull'ora...Carico una vista.
var filter_3h = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.GREATER_THAN,
        property: "full_date", value: last3h
});
var cluster_f_rule = new OpenLayers.Rule({
        title: "Cluster di fulmini",
	//filter: filter_3h,
        symbolizer: {strokeColor: '${rainbow}', strokeWidth: 3, strokeOpacity: 1, fillColor: '${rainbow}', fillOpacity: 0.1
	// ,label: '${cluster_id}', labelAlign: 'rt', fontSize: '13px', fontColor: 'black', fontWeight: 'bold', labelYOffset: -15, fontFamily: 'Comic Sans MS'
	}
        });
style_cluster_f.addRules([cluster_f_rule]);
var styleMap_cluster_f = new OpenLayers.StyleMap({
        "default": style_cluster_f,
        "select": {fillColor: "blue"}
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var cluster_fulmini = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_cluster_f,
        strategies: [new OpenLayers.Strategy.BBOX()],
        //strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "v_clust_f_3ore",
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
cluster_fulmini.setVisibility(false);


/*PATH temporali*/
var style_path = new OpenLayers.Style();
var path_rule = new OpenLayers.Rule({
	title: "Storm tracking ultime 24h",
	symbolizer: {strokeColor: "#ff9933", strokeWidth: 3}
	});
style_path.addRules([path_rule]);
var styleMap_path = new OpenLayers.StyleMap({
	"default": style_path
	,"temporary": new OpenLayers.Style({strokeWidth:4, cursor: "pointer"})
});
var path = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_path,
    strategies: [new OpenLayers.Strategy.Fixed(),
	new OpenLayers.Strategy.Refresh({force: true, interval:150000})
	],
    protocol: new OpenLayers.Protocol.WFS({
	url: urlMS_realtime, version: "1.1.0", featureType: "path3h",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		geometry: "msGeometry", srsName: "epsg:23032"
    })
});
path.setVisibility(false);


/*BACINI 15GG in realta LAST*/
var style_bacini_15gg = new OpenLayers.Style({
        label: "${nome}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
});
var bacini_val2 = new OpenLayers.Rule({
        title: "prob. occ. media",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "maxvalore", value: 2
        }),
    symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "yellow", fillOpacity: 0.5}
});
var bacini_val3 = new OpenLayers.Rule({
        title: "prob. occ. alta",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "maxvalore", value: 3
        }),
    symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "red", fillOpacity: 0.5}
});
//Escludo da questa tematizzazione i bacini che possono dare flash-flood:
var filter_flashflood3 = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.AND,
	filters: [
		new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "processo_principale", value: 'Flash flood'
		}),
		new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "maxvalore", value: 3
		})]
});
var bacini_flashflood3 = new OpenLayers.Rule({
    title: 'flash flood - prob. alta',
    filter: filter_flashflood3,
    symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "cyan", fillOpacity: 0.5}
});
var filter_flashflood2 = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "processo_principale", value: 'Flash flood'
                }),
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "maxvalore", value: 2
                })]
});
var bacini_flashflood2 = new OpenLayers.Rule({
    title: '',
    filter: filter_flashflood2,
    symbolizer: {display: "none"}
});
//Escludo da questa tematizzazione i bacini che possono dare debris-flood:
var filter_debrisflood3 = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "processo_principale", value: 'Debris flood'
                }),
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "maxvalore", value: 3
                })]
});
var bacini_debrisflood3 = new OpenLayers.Rule({
    title: 'debris flood - prob. alta',
    filter: filter_debrisflood3,
    symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "fuchsia", fillOpacity: 0.5}
});
var filter_debrisflood2 = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "processo_principale", value: 'Debris flood'
                }),
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "maxvalore", value: 2
                })]
});
var bacini_debrisflood2 = new OpenLayers.Rule({
    title: '',
    filter: filter_debrisflood2,
    symbolizer: {display: "none"}
});
var bacini_zoom1 = new OpenLayers.Rule({
        title: " ",
        minScaleDenominator: 100000,
        symbolizer: {fontSize: "0px", strokeWidth:0.6}
});
var bacini_zoom2 = new OpenLayers.Rule({
        title: " ",
        maxScaleDenominator: 100000,
        symbolizer: {fontSize: "12px"}
});
style_bacini_15gg.addRules([bacini_val2, bacini_val3, bacini_flashflood3, bacini_debrisflood3, bacini_flashflood2, bacini_debrisflood2, bacini_zoom1, bacini_zoom2]);
var styleMap_bacini_15gg = new OpenLayers.StyleMap({
	"default": style_bacini_15gg
	, "temporary": new OpenLayers.Style({strokeWidth:2, strokeOpacity:1, fillOpacity: 1, cursor: "pointer", fontSize: "14px"})
});
var bacini_15gg = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_15gg,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime, version: "1.1.0", featureType: "bacini_last",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometry: "msGeometry", srsName: "epsg:32632"
                //extractAttributes: true, //extractStyles: true,
        })
});
bacini_15gg.setVisibility(false);
store_bacini_15gg = new GeoExt.data.FeatureStore({
        fields: [
                {name: "id_bacino", type: "integer"},
		{name: "gid", type: "integer"},
		"nome", {name: "comboDisplay", type: "string", mapping:"nome"},
                {name: "comune", type: "string"},
                {name: "gruppo_sigla", type: "string"},
                {name: "dataora", type: "string"},
                {name: "maxmedia", type: "float"},
                {name: "maxvalore", type: "float"},
		{name: "probabilita", type: "string"},
		{name: "flag_description", type: "string"},
		{name: "processo_principale", type: "string"}
        ],
        layer: bacini_15gg
});
store_bacini_15gg.on('load', function(store){
      store.sort('dataora', 'DESC');
});
var columns_bacini_15gg = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                //{header: "Id bacino", dataIndex: "id_bacino"},
                {header: "<b>Nome</b>", dataIndex: "nome", width: 90},
                {header: "Comune", dataIndex: "comune", width: 90},
                {header: "Gruppo bacino", dataIndex: "gruppo_sigla", align: "center", width: 75},
                {header: "Data-ora <b>ultimo</b> superamento", dataIndex: "dataora", align: "center", width: 75},
                {header: "Prec. max stimata </br> 48h precedenti [mm/h]", dataIndex: "maxmedia", decimalPrecision: 3, align: "center", width: 75},
                {header: "<b>Probabilita' di occorrenza</b>", dataIndex: "probabilita", align: "center", width: 75},
		{header: "Affidabilita'", dataIndex: "flag_description", align: "center"},
		{header: "Processo atteso", dataIndex: "processo_principale", align: "center"}
        ]
});


/*COMUNI LAST*/
var style_comuni_last = new OpenLayers.Style();
var comuni_val2 = new OpenLayers.Rule({
        title: "classe 2",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "valore", value: 2
        }),
	symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "yellow", fillOpacity: 0.5
//, label: " ${comune},\n${media}", labelAlign: "cm", fontSize: "10px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Comic Sans MS'
}
});
var comuni_val3 = new OpenLayers.Rule({
        title: "classe 3",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "valore", value: 3
        }),
	symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "red", fillOpacity: 0.5
//, label: " ${comune},\n${media}", labelAlign: "cm", fontSize: "10px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Comic Sans MS'
}
});
style_comuni_last.addRules([comuni_val2, comuni_val3]);
var styleMap_comuni_last = new OpenLayers.StyleMap({
	"default": style_comuni_last
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var comuni_last = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_comuni_last,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Refresh({force: true, interval:150000})
	],
	protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime, version: "1.1.0", featureType: "comuni_last",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometry: "msGeometry", srsName: "epsg:32632"
                //extractAttributes: true, //extractStyles: true,
        })
});
comuni_last.setVisibility(false);
store_comuni_last = new GeoExt.data.FeatureStore({
        fields: [
                //{name: "id_bacino", type: "integer"},
                "comune", {name: "comboDisplay", type: "string", mapping:"comune"},
                {name: "provincia", type: "string"},
		{name: "regione", type: "string"},
		{name: "warning_class", type: "integer"},
                {name: "data", type: "string"},
                {name: "media", type: "float"},
                {name: "valore", type: "float"}
        ],
        layer: comuni_last
});
store_comuni_last.on('load', function(store){
      store.sort('data', 'DESC');
});
var columns_comuni_last = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                //{header: "Id bacino", dataIndex: "id_bacino"},
                {header: "<b>Comune</b>", dataIndex: "comune", width: 180},
                {header: "Provincia", dataIndex: "provincia"},
                {header: "Regione", dataIndex: "regione", align: "center"},
		{header: "Warning class", dataIndex: "warning_class", align: "center"},
                {header: "Data-ora superamenti", dataIndex: "data", align: "center"},
                {header: "Prec. max stimata [mm/h]", dataIndex: "media", decimalPrecision: 3, align: "center"},
                {header: "<b>Codice soglia</b>", dataIndex: "valore", align: "center"}
        ]
});


/*SMARTprevimedie*/
var style_smartprevimedie = new OpenLayers.Style();
var smartprevimedie_1 = new OpenLayers.Rule({
        title: "Assenza di pioggia",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 1
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "white", fillOpacity: 0.7
	,label: "${subaree}"
//, label: " ${comune},\n${media}", labelAlign: "cm", fontSize: "10px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Comic Sans MS'
}
});
var smartprevimedie_2 = new OpenLayers.Rule({
        title: "Pioggia almeno 1 stazione",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 2
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "aqua", fillOpacity: 0.4
        ,label: "${subaree}"
}
});
var smartprevimedie_3 = new OpenLayers.Rule({
        title: "Sup. soglia piatta >2 stazioni",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 3
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "fuchsia", fillOpacity: 0.4
        ,label: "${subaree}"
}
});
var smartprevimedie_4 = new OpenLayers.Rule({
        title: "Prossimita' soglia 50%",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 4
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "green", fillOpacity: 0.4
        ,label: "${subaree}"
}
});
var smartprevimedie_5 = new OpenLayers.Rule({
        title: "Superamento soglia >2 stazioni",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 5
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "gray", fillOpacity: 0.7
        ,label: "${subaree}"
}
});
var smartprevimedie_6 = new OpenLayers.Rule({
        title: "Superamento soglia 30%",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 6
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "yellow", fillOpacity: 0.4
        ,label: "${subaree}"
}
});
var smartprevimedie_7 = new OpenLayers.Rule({
        title: "Superamento soglia 50%",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 7
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "red", fillOpacity: 0.4
        ,label: "${subaree}"
}
});
style_smartprevimedie.addRules([smartprevimedie_7, smartprevimedie_6, smartprevimedie_5, smartprevimedie_4, smartprevimedie_3, smartprevimedie_2, smartprevimedie_1]);
var styleMap_smartprevimedie = new OpenLayers.StyleMap({
	"default": style_smartprevimedie
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var smartprevimedie = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_smartprevimedie,
        strategies: [new OpenLayers.Strategy.BBOX()
        //strategies: [new OpenLayers.Strategy.Fixed()
	,new OpenLayers.Strategy.Refresh({force: true, interval:300000})
	],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime, featureType: "smart_previmedie",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
smartprevimedie.setVisibility(false);
store_smartprevimedie = new GeoExt.data.FeatureStore({
        fields: [
		{name: "data", type: "string"},
		{name: "ora", type: "string"},
                {name: "zonetype", type: "string"},
		"cod_area", {name: "comboDisplay", type: "string", mapping:"cod_area"},
                {name: "smart_wz", type: "string"},
                {name: "subaree", type: "string"},
                {name: "area", type: "float"},
		{name: "numstaz", type: "integer"},
		{name: "staz_eve", type: "integer"},
		{name: "perc_avv", type: "integer"},
		{name: "perc_sup", type: "integer"},
		{name: "perc_ero", type: "integer"},
		{name: "avvtot", type: "integer"},
		{name: "suptot", type: "integer"},
		{name: "erotot", type: "integer"},
		{name: "stato", type: "integer"}
        ],
        layer: smartprevimedie
});
store_smartprevimedie.on('load', function(store){
      store.sort('subaree', 'ASC');
});
var columns_smartprevimedie = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
		{header: "Data agg", dataIndex: "data"},
		{header: "Ora agg", dataIndex: "ora"},
                {header: "Zona tipo", dataIndex: "zonetype"},
                {header: "<b>Codice area</b>", dataIndex: "cod_area"},
                {header: "Smart wz", dataIndex: "smart_wz"},
                {header: "Subarea", dataIndex: "subaree", align: "center"},
                {header: "Area [km2]", dataIndex: "area", decimalPrecision: 3, align: "center"},
		{header: "Num_staz", dataIndex: "numstaz", align: "center"},
		{header: "Staz_eve", dataIndex: "staz_eve", align: "center"},
		{header: "Perc_avv", dataIndex: "perc_avv", align: "center"},
		{header: "Perc_sup", dataIndex: "perc_sup", align: "center"},
		{header: "Perc_ero", dataIndex: "perc_ero", align: "center"},
		{header: "Avv_tot", dataIndex: "avvtot", align: "center"},
		{header: "Sup_tot", dataIndex: "suptot", align: "center"},
		{header: "Ero_tot", dataIndex: "erotot", align: "center"},
		{header: "Stato", dataIndex: "stato", align: "center"}
        ]
});


/*SMART_STAZ*/
var style_smart_staz = new OpenLayers.Style({
	label: "${stazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", labelYOffset: 15
});
var smart_staz_max= new OpenLayers.Rule({
        title: "Sup. previsto max",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_max", value: 2
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 1.5, strokeOpacity: 0.7, fillOpacity: 0.6, fillColor: "gray"
	,graphicName: "triangle", pointRadius: 5
}
});
var smart_staz_0 = new OpenLayers.Rule({
        title: "Nessun evento",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.NOT_EQUAL_TO,
                property: "stato_max", value: 2
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 1.5, strokeOpacity: 0.7, fillColor: "gray", fillOpacity: 0.8
        ,graphicName: "circle", pointRadius: 4
}
});
var smart_staz_1 = new OpenLayers.Rule({
        title: "Evento esaurito da +6h",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 1
        }),
        symbolizer: {graphicName: "circle", pointRadius: 4, fillColor: "white"
//, label: " ${comune},\n${media}", labelAlign: "cm", fontSize: "10px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Comic Sans MS'
}
});
var smart_staz_2 = new OpenLayers.Rule({
        title: "Pioggia ultime 6h",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 2
        }),
        symbolizer: {pointRadius: 4, fillColor: "aqua"}
});
var smart_staz_3 = new OpenLayers.Rule({
        title: "Superamento soglia piatta",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 3
        }),
        symbolizer: {pointRadius: 4, fillColor: "fuchsia"}
});
var smart_staz_4 = new OpenLayers.Rule({
        title: "Prossimita' alla soglia",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 4
        }),
        symbolizer: {pointRadius: 5, fillColor: "lime", fillOpacity: 0.6}
});
var smart_staz_5 = new OpenLayers.Rule({
        title: "Superamento soglia",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 5
        }),
        symbolizer: {pointRadius: 5, fillColor: "red", fillOpacity: 0.6}
});
var smart_staz_6 = new OpenLayers.Rule({
        title: "Criticita' residua",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato", value: 6
        }),
        symbolizer: {pointRadius: 5, fillColor: "#FA8072", fillOpacity: 0.6}
});
var smart_staz_7 = new OpenLayers.Rule({
	title: " ",
        minScaleDenominator: 250000,
        symbolizer: {fontSize: "0px", strokeWidth:0.6}
});
var smart_staz_8 = new OpenLayers.Rule({
        title: " ",
        maxScaleDenominator: 250000,
        symbolizer: {fontSize: "12px"}
});

style_smart_staz.addRules([smart_staz_max, smart_staz_0, smart_staz_1, smart_staz_2, smart_staz_3, smart_staz_4, smart_staz_5, smart_staz_6, smart_staz_7, smart_staz_8]);
var styleMap_smart_staz = new OpenLayers.StyleMap({
	"default": style_smart_staz
	,"temporary": new OpenLayers.Style({pointRadius: 10, fontSize: 13, labelYOffset: 20, cursor: "pointer"})
});
var smart_staz = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_smart_staz,
        strategies: [new OpenLayers.Strategy.BBOX()
        //strategies: [new OpenLayers.Strategy.Fixed()
	,new OpenLayers.Strategy.Refresh({force: true, interval:300000})
	],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime, featureType: "smart_staz",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
smart_staz.setVisibility(false);
store_smart_staz = new GeoExt.data.FeatureStore({
        fields: [
		"stazione", {name: "comboDisplay", type: "string", mapping:"stazione"},
                {name: "cod_stazione", type: "string"},
                {name: "x", type: "integer"},
                {name: "y", type: "integer"},
		{name: "data", type: "string"},
		{name: "ora", type: "string"},
		{name: "pcum", type: "double"},
                {name: "soglia", type: "double"},
                {name: "t_non_pioggia", type: "integer"},
                {name: "durata", type: "integer"},
                {name: "ultime_6h", type: "string"}
        ],
        layer: smart_staz
});
store_smart_staz.on('load', function(store){
      store.sort('stazione', 'ASC');
});
var columns_smart_staz = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "<b>Stazione</b>", dataIndex: "stazione", width: 85},
                {header: "<b>Codice stazione</b>", dataIndex: "cod_stazione", width: 45},
                //{header: "Coord. X", dataIndex: "x", align: "center"},
                //{header: "Coord. Y", dataIndex: "y", align: "center"},
		{header: "Data", dataIndex: "data", width: 45},
                {header: "Ora (UTC)", dataIndex: "ora", width: 45},
                {header: "Pcum [mm]", dataIndex: "pcum", align: "center", width: 45},
                {header: "Soglia [mm]", dataIndex: "soglia", align: "center", width: 45},
                {header: "T non pioggia [h]", dataIndex: "t_non_pioggia", align: "center", width: 45},
                {header: "Durata [h]", dataIndex: "durata", align: "center", width: 45},
                {header: "Ultime 6h", dataIndex: "ultime_6h", width: 85}
        ]
});


/*TRAPS comuni*/
var style_traps = new OpenLayers.Style();
var traps_0 = new OpenLayers.Rule({
	title: "Probabilita' bassa",
	/*filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato", value: 0
	}),*/
	symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "white", fillOpacity: 0.6
//, label: " ${comune},\n${media}", labelAlign: "cm", fontSize: "10px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Comic Sans MS'
}
});
var traps_2 = new OpenLayers.Rule({
	title: "Probabilita' media",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato", value: 2
	}),
	symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "yellow", fillOpacity: 0.5
}
});
var traps_3 = new OpenLayers.Rule({
	title: "Probabilita' alta",
	filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "stato", value: 3
	}),
	symbolizer: {strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "red", fillOpacity: 0.4
}
});
style_traps.addRules([traps_0, traps_2, traps_3]);
var styleMap_traps = new OpenLayers.StyleMap({
	"default": style_traps
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var traps = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_traps,
	strategies: [new OpenLayers.Strategy.BBOX()
	//strategies: [new OpenLayers.Strategy.Fixed()
	//,new OpenLayers.Strategy.Refresh({force: true, interval:300000})
	],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_realtime, featureType: "traps_com",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		geometryName: "the_geom", srsName: "epsg:23032"
		//extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
	})
});
traps.setVisibility(false);
store_traps = new GeoExt.data.FeatureStore({
	fields: [
		{name: "area", type: "float"},
		{name: "istat", type: "string"},
		{name: "sigla_pro", type: "string"},
		"comune", {name: "comboDisplay", type: "string", mapping:"comune"},
		{name: "i_f", type: "float"},
		{name: "n_frane", type: "integer"},
		{name: "data", type: "string"},
		{name: "frane_sup1", type: "integer"},
		{name: "frane_sup2", type: "integer"},
		{name: "stato", type: "integer"}
	],
	layer: traps
});
store_traps.on('load', function(store){
	store.sort('comune', 'ASC');
});
var columns_traps = new Ext.grid.ColumnModel({
	defaults: {
		sortable: true
	},
	columns: [
		{header: "Istat", dataIndex: "istat"},
		{header: "Provincia", dataIndex: "sigla_pro"},
		{header: "<b>Comune</b>", dataIndex: "comune"},
		{header: "Area [km2]", dataIndex: "area", decimalPrecision: 3},
		{header: "i_f", dataIndex: "i_f"},
		{header: "Totale scivolamenti", dataIndex: "n_frane"},
		{header: "Data", dataIndex: "data"},
		{header: "Superamenti stato antecedente", dataIndex: "frane_sup1", align: "center"},
		{header: "Superamenti innesco", dataIndex: "frane_sup2", align: "center"},
		{header: "Stato", dataIndex: "stato", align: "center"}
	]
});


/*FILTRO RUPAR*/
var filter_rupar = new OpenLayers.Filter.Comparison({
	type: OpenLayers.Filter.Comparison.EQUAL_TO,
	property: "flag_rupar",
	value: 'S'
});


/*NEVE*/
OpenLayers.Renderer.symbol.rectangle1 = [0, -50, 45, -50, 45, 50, 0, 50, 0, -50]; //sul punto
var style_neve = new OpenLayers.Style({
	//fill: 0, stroke: 0,
        label: " ${ultimovalore}\n${neve0suolo}\n${neve0fresca}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px", fontColor: 'blue'
        }, {
        rules: [
		new OpenLayers.Rule({
        	title: "hs-ultimo dato<br />hs-altezza neve h8<br />hn-neve fresca h8",
        	maxScaleDenominator: 250000,
		symbolizer: {fontSize: "16px", graphicName: "rectangle1", pointRadius: 25, strokeColor: "black", strokeWidth: 1, fillColor: "white", fillOpacity: 0.8}
        	//symbolizer: {externalGraphic: "/common/icons/rectangle.png", labelOutlineColor: "white", labelOutlineWidth: 0, labelYOffset: 20, fontSize: "16px", graphicWidth: 35, graphicHeight: 19, graphicYOffset: -24, graphicOpacity:0.8}
		}),
		new OpenLayers.Rule({
		title: " ",
		minScaleDenominator: 250000,
		symbolizer: {graphicName: "rectangle1", pointRadius: 22, strokeColor: "black", strokeWidth: 1, fillColor: "white", fillOpacity: 0.8}
		})
	]}
);
var styleMap_neve = new OpenLayers.StyleMap({
	"default": style_neve
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var filterStrategy_neve = new OpenLayers.Strategy.Filter({filter: filter_rupar});
var neve_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_neve,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.Fixed()
        //,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ,filterStrategy_neve
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
		//version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom",
		url: url_tinyows,
		featureNS: "http://www.tinyows.org/",
		featureType: "v_neve",
		//featurePrefix: "tows",
                readFormat: new OpenLayers.Format.GML({
			'internalProjection': OL_23032,
			'externalProjection': OL_23032
                })
        })
});
neve_tiny.setVisibility(false);


/*BOLLETTINO PIENE*/
var style_bollpiene = new OpenLayers.Style({
	strokeWidth: 2.5
	},
	{rules: [
                new OpenLayers.Rule({
		title: "Criticita' elevata",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_prevista", value: 'E'
                }),
                symbolizer: {strokeColor: "#D80000", fillColor: "#D80000"}
                }),
		new OpenLayers.Rule({
                title: "Criticita' moderata",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_prevista", value: 'M'
                }),
                symbolizer: {strokeColor: "#FF8C00", fillColor: "#FF8C00"}
                }),
		new OpenLayers.Rule({
                title: "Criticita' ordinaria",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_prevista", value: 'O'
                }),
                symbolizer: {strokeColor: "#FFD700", fillColor: "#FFD700"}
                }),
                new OpenLayers.Rule({
                title: "Criticita' assente",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_prevista", value: 'A'
                }),
                symbolizer: {strokeColor: "#228B22", fillColor: "#228B22"}
                }),
		 new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {strokeWidth: 8}
                }),
                new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {strokeWidth: 2.5}
                })
        ]}
);
var styleMap_bollpiene = new OpenLayers.StyleMap({
	"default": style_bollpiene
	,"temporary": new OpenLayers.Style({strokeWidth:10, cursor: "pointer", label: "${nome}", fontWeight: "bold", labelAlign: "cm", fontSize: "16px"})
});
var bollpiene_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bollpiene,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bollettini_piene",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
bollpiene_tiny.setVisibility(false);
///BOLL PIENE criticita attuale:
var style_bollpiene_att = new OpenLayers.Style({
        strokeWidth: 2.5
        },
        {rules: [
                new OpenLayers.Rule({
                title: "Criticita' elevata",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_attuale", value: 'E'
                }),
                symbolizer: {strokeColor: "#D80000", fillColor: "#D80000"}
                }),
                new OpenLayers.Rule({
                title: "Criticita' moderata",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_attuale", value: 'M'
                }),
                symbolizer: {strokeColor: "#FF8C00", fillColor: "#FF8C00"}
                }),
                new OpenLayers.Rule({
                title: "Criticita' ordinaria",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_attuale", value: 'O'
                }),
                symbolizer: {strokeColor: "#FFD700", fillColor: "#FFD700"}
                }),
                new OpenLayers.Rule({
                title: "Criticita' assente",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "criticita_attuale", value: 'A'
                }),
                symbolizer: {strokeColor: "#228B22", fillColor: "#228B22"}
                }),
                 new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {strokeWidth: 8}
                }),
                new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {strokeWidth: 2.5}
                })
        ]}
);
var styleMap_bollpiene_att = new OpenLayers.StyleMap({
	"default": style_bollpiene_att
	,"temporary": new OpenLayers.Style({strokeWidth:10, cursor: "pointer", label: "${nome}", fontWeight: "bold", labelAlign: "cm", fontSize: "16px"})
});
var bollpiene_tiny_att = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bollpiene_att,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bollettini_piene",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
bollpiene_tiny_att.setVisibility(false);
//Definiamo le colonne per recuperare i dati:
store_bollpiene = new GeoExt.data.FeatureStore({
        fields: [
                {name: "corsodacqua", type: "string"},
		"stazione", {name: "comboDisplay", type: "string", mapping:"stazione"},
                {name: "portatacod1", type: "string"},
                {name: "portatacod2", type: "string"},
                {name: "portatacod3", type: "string"},
		{name: "ultime6h", type: "string"},
		{name: "portata", type: "string"},
		{name: "criticita_attuale", type: "string"},
		{name: "criticita_12h", type: "string"},
		{name: "criticita_24h", type: "string"},
		{name: "criticita_36h", type: "string"},
		{name: "tendenza_48h", type: "string"},
		{name: "criticita_prevista", type: "string"},
		{name: "data_agg", type: "string"}
        ],
        layer: bollpiene_tiny
});
store_bollpiene.on('load', function(store){
        store.sort('corsodacqua', 'ASC');
});
var columns_bollpiene = new Ext.grid.ColumnModel({
        defaults: {
                sortable: true
        },
        columns: [
                {header: "Corso d'acqua", dataIndex: "corsodacqua"},
                {header: "Stazione", dataIndex: "stazione"},
                {header: "Portata cod. 1", dataIndex: "portatacod1"},
                {header: "Portata cod. 2", dataIndex: "portatacod2"},
                {header: "Portata cod. 3", dataIndex: "portatacod3"},
                {header: "Tendenza ultime 6h", dataIndex: "ultime6h"},
                {header: "Portata [mc/s]", dataIndex: "portata"},
                {header: "Criticita attuale", dataIndex: "criticita_attuale", align: "center"},
                {header: "Criticita prev. 12h", dataIndex: "criticita_12h", align: "center"},
                {header: "Criticita prev. 24h", dataIndex: "criticita_24h", align: "center"},
		{header: "Criticita prev. 36h", dataIndex: "criticita_36h", align: "center"},
		{header: "Tendenza a +48h", dataIndex: "tendenza_48h"},
		{header: "Aggiornamento", dataIndex: "data_agg"}
        ]
});


/*UFO URBAN FLOOD*/
var style_ufo = new OpenLayers.Style({
	//label: " ${ultimovalore}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px"
	label: " ${giorno}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px",
	fillOpacity: 0.5, strokeWidth: 0.8
        }, {
        rules: [
		new OpenLayers.Rule({
                title: "nessun superamento",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "superamento", value: 0
                }),
                symbolizer: {fillColor: 'white', fontSize: "0px"}
                }),
                new OpenLayers.Rule({
                title: "solo Tr-2anni",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.BETWEEN,
                        property: "superamento", lowerBoundary: 1, upperBoundary: 5
                }),
                symbolizer: {fillColor: 'yellow'}
                }),
		new OpenLayers.Rule({
                title: "1 sup. con Tr-10anni",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.BETWEEN,
                        property: "superamento", lowerBoundary: 5, upperBoundary: 9
                }),
                symbolizer: {fillColor: 'orange'}
                }),
                new OpenLayers.Rule({
                title: "2 sup. con Tr-10anni",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.BETWEEN,
                        property: "superamento", lowerBoundary: 9, upperBoundary: 13
                }),
                symbolizer: {fillColor: 'red'}
                }),
                new OpenLayers.Rule({
                title: "almeno 3 sup. con Tr-10anni",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.GREATER_THAN,
                        property: "superamento", value: 13
                }),
                symbolizer: {fillColor: 'purple'}
                }),
                new OpenLayers.Rule({
                title: "Label: giorni passati dal superamento",
                maxScaleDenominator: 250000
                //symbolizer: {label: " ${superamento}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px"}
		}),
                new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
		symbolizer: {fontSize: "0px"}
                })
        ]}
);
var styleMap_ufo = new OpenLayers.StyleMap({
	"default": style_ufo
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var ufo_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_ufo,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_ufo_superamenti_last",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
ufo_tiny.setVisibility(false);
var styleMap_ufo_aree = new OpenLayers.StyleMap({
        "default": style_ufo
        , "temporary": new OpenLayers.Style({label: " ${nome}", fontSize: 12, strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var ufo_aree_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_ufo_aree,
        strategies: [new OpenLayers.Strategy.Fixed()
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_ufo_superamenti_aree_last",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })
        })
});
ufo_aree_tiny.setVisibility(false);


/*ALLERTA PLUVIO SU COMUNI*/
var style_comuni_pluvio = new OpenLayers.Style({
        label: " ${comune}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px",
        fillOpacity: 0.4, strokeWidth: 0.8
        }, {
        rules: [
                new OpenLayers.Rule({
                title: "nessuna criticita",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "stato_pluvio", value: 0
                }),
                symbolizer: {fillColor: 'white', fontSize: "0px"}
                }),
                new OpenLayers.Rule({
                title: "Codice 2",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "stato_pluvio", value: 1
                }),
                symbolizer: {fillColor: 'gold'}
                }),
                new OpenLayers.Rule({
                title: "Codice 3",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "stato_pluvio", value: 2
                }),
                symbolizer: {fillColor: 'orange'}
                }),
                new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000
                //symbolizer: {label: " ${superamento}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px"}
                }),
                new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {fontSize: "0px"}
                })
        ]}
);
var styleMap_comuni_pluvio = new OpenLayers.StyleMap({
        "default": style_comuni_pluvio
        , "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var wcm_comuni_pluvio= new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_comuni_pluvio,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_comuni_piemonte_pluvio_01",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
wcm_comuni_pluvio.setVisibility(false);
var wcm_comuni_pluvio_buffer= new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_comuni_pluvio,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_comuni_piemonte_pluvio_buffer",
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
        })
});
wcm_comuni_pluvio_buffer.setVisibility(false);


/* ALLERTA PLUVIO SU PLUVIOMETRI*/
var style_wcm_pluvio = new OpenLayers.Style(
    {   title: "${denominazione}",
        label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 15, labelYOffset: 12
        ,graphicName: "circle", fillColor: "blue", fillOpacity: 0.8, strokeColor:"black", pointRadius: "6", strokeWidth: "0.5"
    }
);
var styleMap_wcm_pluvio = new OpenLayers.StyleMap({
    "default": style_wcm_pluvio,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var wcm_pluviometri = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_wcm_pluvio,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_allerta_pluviometri_01",
		geometryName: "the_geom"
        })
});
wcm_pluviometri.setVisibility(false);
var wcm_pluviometri_buffer = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_wcm_pluvio,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_allerta_pluviometri_buffer",
                geometryName: "the_geom"
        })
});
wcm_pluviometri_buffer.setVisibility(false);


/*TEMPERATURE*/
//Tematizzazione 'classica' con i rettangoli:
OpenLayers.Renderer.symbol.rectangle = [0, -12, 38, -12, 38, 12, 0, 12, 0, -12];
var style_temp = new OpenLayers.Style({
	//fill: 0, stroke: 0,
        label: " ${ultimovalore}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px"
        }, {
        rules: [
        	new OpenLayers.Rule({
		title: "<span style='color:blue;'> <0 &deg;C </span>",
        	filter: new OpenLayers.Filter.Comparison({
                	type: OpenLayers.Filter.Comparison.LESS_THAN,
	                property: "ultimovalore", value: 0
        	}),
        	symbolizer: {fontColor: 'blue'}
		}),
		new OpenLayers.Rule({
  		title: "<span style='color:red;'> 0-30 &deg;C </span>",
	        filter: new OpenLayers.Filter.Comparison({
                	type: OpenLayers.Filter.Comparison.BETWEEN,
                	property: "ultimovalore", lowerBoundary: 0, upperBoundary: 30
        	}),
        	symbolizer: {fontColor: 'red'}
		}),
		new OpenLayers.Rule({
	        title: "<span style='color:purple;'> >30 &deg;C </span>",
        	filter: new OpenLayers.Filter.Comparison({
        	        type: OpenLayers.Filter.Comparison.GREATER_THAN,
	                property: "ultimovalore", value: 30
	        }),
        	symbolizer: {fontColor: 'purple'}
		}),
		new OpenLayers.Rule({
        	title: " ",
        	maxScaleDenominator: 250000,
		symbolizer: {fontSize: "16px", graphicName: "rectangle", pointRadius: 18, strokeColor: "black", strokeWidth: 1, fillColor: "white", fillOpacity: 0.8}
        	//symbolizer: {externalGraphic: "/common/icons/rectangle.png", labelOutlineColor: "white", labelOutlineWidth: 0, labelYOffset: 20, fontSize: "16px", graphicWidth: 35, graphicHeight: 19, graphicYOffset: -24, graphicOpacity:0.8}
		}),
		new OpenLayers.Rule({
		title: " ",
		minScaleDenominator: 250000,
		symbolizer: {graphicName: "rectangle", pointRadius: 14, strokeColor: "black", strokeWidth: 1, fillColor: "white", fillOpacity: 0.8}
		})
	]}
);
var styleMap_temp = new OpenLayers.StyleMap({"default": style_temp});
var filterStrategy_temp = new OpenLayers.Strategy.Filter({filter: filter_rupar});
//Provo tematizzazione con CLUSTER e cerchi colorati - devo definire un cluster strategy per ogni layer altrimenti non so perche sballa e lo fa solo sull'ultimo layer per cui e' definito!
var clust_temp = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var context_temp = {
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
    ,getLabel_nivo_validati: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
            //return label_scaled(feature.cluster[0].attributes.ultimovalore,'') + '\n' + label_scaled(feature.cluster[0].attributes.hn_ultimovalore,'');
	    return label_scaled_double(feature.cluster[0].attributes.ultimovalore, feature.cluster[0].attributes.hn_ultimovalore, '');
        }
        else { //se invece interrogo la singola feature
	    return label_scaled_double(feature.attributes.ultimovalore, feature.attributes.hn_ultimovalore, '');
        }
    }
    ,getLabel_idro_portata: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
            return label_scaled_pluv_double(feature.cluster[0].attributes.ultimovalore, feature.cluster[0].attributes.portata, '');
        }
        else { //se invece interrogo la singola feature
            return label_scaled_pluv_double(feature.attributes.ultimovalore, feature.attributes.portata, '');
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
    ,getLabel_portata: function(feature){
        //Gestisco le label nel caso di clusterizzazione:
        if (feature.cluster) { //se interrogo un cluster e non la singola feature
            feature.cluster.sort(function(a, b) { //NUMERICAL ORDER-pero' ha un problema con i valori NULL
                if (a.attributes.ultimovalore == null) a.attributes.ultimovalore = -99;
                if (b.attributes.ultimovalore == null) b.attributes.ultimovalore = -99;
                return b.attributes.ultimovalore - a.attributes.ultimovalore; //reverse order
            });
            //return label_scaled_pluv(feature.cluster[0].attributes.ultimovalore,'');
            return label_scaled_pluv(feature.cluster[0].attributes.portata,'');
        }
        else { //se invece interrogo la singola feature
            //return label_scaled_pluv(feature.attributes.ultimovalore,'');
	    return label_scaled_pluv(feature.attributes.portata,'');
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
var style_temp_clust = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 15
        ,graphicName: "circle", fillColor: "${getFillColor}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    //A quanto pare il context non funzione se c'e una Rule
    ,{context: context_temp} //context dentro allo style
);
var styleMap_temp_clust = new OpenLayers.StyleMap({
    "default": style_temp_clust,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var temperatura_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_temp_clust,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            //,filterStrategy_temp
	    ,clust_temp
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
		//version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom",
		url: url_tinyows,
		featureNS: "http://www.tinyows.org/",
		//featureType: "v_datistazioni", //vecchia logica
		featureType: "v_last_terma", //nuova logica dati da meteo_real_time
		//featurePrefix: "tows",
                readFormat: new OpenLayers.Format.GML({
			'internalProjection': OL_23032,
			'externalProjection': OL_23032
                })
        })
});
temperatura_tiny.setVisibility(false);
var clust_temp_lago = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var temperatura_lago_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_temp_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_temp_lago
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_terma_lagomaggiore", //nuova logica dati da meteo_real_time
                readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_23032,
                    'externalProjection': OL_23032
                })
        })
});
temperatura_lago_tiny.setVisibility(false);
var clust_temp_estero_ch = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var terma_estero_ch = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_temp_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_temp_estero_ch
        ],
        projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_terma_estero_svizzera", //nuova logica dati da meteo_real_time
                readFormat: new OpenLayers.Format.GML({
                    'internalProjection': OL_4326,
                    'externalProjection': OL_4326
                })
        })
});
terma_estero_ch.setVisibility(false);
var filter_estero_terma = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "tipo_staz",
        value: 'T'
});
var filterStrategy_estero_terma = new OpenLayers.Strategy.Filter({filter: filter_estero_terma});
var clust_temp_estero = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var terma_estero_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        //styleMap: styleMap_temp,
        styleMap: styleMap_temp_clust,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            //, filterStrategy_estero_terma
            ,clust_temp_estero
        ],
        projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                //version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom"
                //featureType: "v_dati_estero",
                featureType: "v_last_terma_estero",
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
terma_estero_tiny.setVisibility(false);


/* DATI VENTO - simboli */
var style_vento_graphicname;
style_vento_graphicname = fn_style_vento_graphicname(); //a causa del minify devo mettere la definizione di questo stile all'interno di una funzione, la quale viene riconosciuta e come tale caricata per prima da minify.
var styleMap_datistaz = new OpenLayers.StyleMap({
	"default": style_vento_graphicname
	,"select": new OpenLayers.Style({fontSize: 19, pointRadius: 23, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 23, cursor: "pointer"})
});
var filterStrategy_temp = new OpenLayers.Strategy.Filter({filter: filter_rupar});
var datistazioni_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_datistaz,
        strategies: [//new OpenLayers.Strategy.Fixed()
	new OpenLayers.Strategy.BBOX()
	,new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
        //,filterStrategy_temp
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                //featureType: "v_datistazioni", //vecchia logica
		featureType: "v_last_vento", //nuova logica ultimo dato da meteo_real_time
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })
        })
});
datistazioni_tiny.setVisibility(false);
var vento_estero = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_datistaz,
        strategies: [new OpenLayers.Strategy.Fixed()
        ,new OpenLayers.Strategy.Refresh({force: true, interval: 150000})
        //,filterStrategy_temp
        ],
        projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                //featureType: "v_datistazioni", //vecchia logica
                featureType: "v_last_vento_estero", //nuova logica ultimo dato da meteo_real_time
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_4326,
                        'externalProjection': OL_4326
                })
        })
});
vento_estero.setVisibility(false);


/* RADIAZIONI GAMMA */
var style_gamma_clust = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel_gamma}", labelAlign: "cb", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 15
	,externalGraphic: root_dir_html+"/common/icons/icon_gamma.svg", labelYOffset: 14
        ,graphicName: "circle", fillColor: "${getFillColor}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    ,{context: context_temp} //context dentro allo style
);
var styleMap_gamma_clust = new OpenLayers.StyleMap({
    "default": style_gamma_clust,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, labelYOffset: 20, cursor: "pointer"})
});
var clust_gamma = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var gamma_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_gamma_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_gamma
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_gamma", //nuova logica dati da meteo_real_time
                readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })
        })
});
gamma_tiny.setVisibility(false);


/* NEVE DALLE 8 */
var style_nivo_clust = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel_nivo}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 15
        ,graphicName: "circle", fillColor: "${getFillColor_nivo}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    ,{context: context_temp} //context dentro allo style
);
var styleMap_nivo_clust = new OpenLayers.StyleMap({
    "default": style_nivo_clust,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var clust_nivo = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var nivo_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_nivo_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_nivo
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_nivo" //nuova logica dati da meteo_real_time
		//,srsName: "epsg:23032"
		,geometryName: "the_geom"
		//,schema: "http://127.0.0.1/cgi-bin/tinyows?service=WFS&version=1.1.0&request=DescribeFeatureType&Typename=tows:v_last_nivo"
		//,version: "1.1.0", featurePrefix: "tows"
                /*,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_23032,
                        'externalProjection': OL_23032
                })*/
        })
});
nivo_tiny.setVisibility(false);
var clust_nivo_suolo = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var nivo_suolo = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_nivo_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_nivo_suolo
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_nivo_suolo" //nuova logica dati da meteo_real_time
                ,srsName: "epsg:23032"
                ,geometryName: "the_geom"
        })
});
nivo_suolo.setVisibility(false);

var style_nivo_clust_validati = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel_nivo_validati}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 10
        ,graphicName: "circle", fillColor: "${getFillColor_nivo}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    ,{context: context_temp} //context dentro allo style
);
var styleMap_nivo_clust_validati = new OpenLayers.StyleMap({
    "default": style_nivo_clust_validati,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 19, cursor: "pointer"})
});
var clust_nivo_validati = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var nivo_validati = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_nivo_clust_validati,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_nivo_validati
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_nivo_validati" //nuova logica dati da meteo_real_time
                ,srsName: "epsg:23032"
                ,geometryName: "the_geom"
        })
});
nivo_validati.setVisibility(false);
var store_nivo_validati = new GeoExt.data.FeatureStore({
        fields: [
                "denominazione", {name: "comboDisplay", type: "string", mapping:"denominazione"},
		{name: "codice_istat_comune", type: "text"},
		{name: "progr_punto_com", type: "text"},
                {name: "quota", type: "integer"},
                {name: "ultimovalore", type: "integer"},
		{name: "tipo_rete", type: "text"}
        ],
        layer: nivo_validati
});
store_nivo_validati.on('load', function(store){
        store.sort('ultimovalore', 'DESC');
});
var columns_nivo_validati = new Ext.grid.ColumnModel({
        defaults: { sortable: true },
        columns: [
                {header: "Nome", dataIndex: "denominazione"},
		{header: "Codice_istat", dataIndex: "codice_istat_comune"},
		{header: "Progressivo", dataIndex: "progr_punto_com"},
		{header: "Tipo rete", dataIndex: "tipo_rete"},
                {header: "Quota", dataIndex: "quota"},
                {header: "Ultimo valore", dataIndex: "ultimovalore"}
        ]
});


/* IDROMETRI ULTIMO DATO */
var style_idro_clust = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel_idro_portata}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 10
        ,graphicName: "circle", fillColor: "${getFillColor_idro}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    ,{context: context_temp} //context dentro allo style
);
var styleMap_idro_clust = new OpenLayers.StyleMap({
    "default": style_idro_clust,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 15, cursor: "pointer"})
});
var clust_idro = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var last_idro_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idro_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_idro
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_idro" //nuova logica dati da meteo_real_time
                ,srsName: "epsg:23032"
                ,geometryName: "the_geom"
        })
});
last_idro_tiny.setVisibility(false);


/* IDROMETRI LAGO MAGGIORE ULTIMO DATO */
/*var style_idro_clust = new OpenLayers.Style(
    {   title: "${getTitle}",
        label: "${getLabel_idro}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize: 10
        ,graphicName: "circle", fillColor: "${getFillColor_nivo}", fillOpacity: 0.8, strokeColor:"black", pointRadius: "${getRadius}", strokeWidth: "${getWidth}"
    }
    ,{context: context_temp} //context dentro allo style
);
var styleMap_idro_clust = new OpenLayers.StyleMap({
    "default": style_idro_clust,
    "select": new OpenLayers.Style({fontSize: 19, pointRadius: 18, fillColor: "blue", fillOpacity: 0.8}),
    "temporary": new OpenLayers.Style({pointRadius: 20, fontSize: 15, cursor: "pointer"})
});*/
var clust_idro_lm = new OpenLayers.Strategy.Cluster({
    distance: 30 //pixel
    , threshold: 2
});
var last_idro_lm_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_idro_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_idro_lm
        ],
        projection: OL_4326,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_last_idro_lagomaggiore" //nuova logica dati da meteo_real_time
                ,srsName: "epsg:4326"
                ,geometryName: "the_geom"
        })
});
last_idro_lm_tiny.setVisibility(false);


/*BACINI SICCITA SPI*/
function create_style_bacini_spi(parametro) {
    var style_bacini_spi = new OpenLayers.Style({
	title: "spi01 ${spi01}\nspi03 ${spi03}\nspi06 ${spi06}\nspi12 ${spi12}"
        }, {
        rules: [
                new OpenLayers.Rule({
                  title: "Piovosita estrema",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.GREATER_THAN,
                    property: parametro, value: 2
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "navy", fillOpacity: 0.6}
                })
                ,new OpenLayers.Rule({
                  title: "Piovosita severa",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: parametro, lowerBoundary: 1.5, upperBoundary: 2
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "blue", fillOpacity: 0.6}
                })
		,new OpenLayers.Rule({
                  title: "Piovosita moderata",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: parametro, lowerBoundary: 1, upperBoundary: 1.5
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#028a03", fillOpacity: 0.4}
                })
		,new OpenLayers.Rule({
                  title: "Piovosita normale",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: parametro, lowerBoundary: -1, upperBoundary: 1
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "white", fillOpacity: 0.2}
                })
		,new OpenLayers.Rule({
                  title: "Siccita moderata",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: parametro, lowerBoundary: -1.5, upperBoundary: -1
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "orange", fillOpacity: 0.4}
                })
		,new OpenLayers.Rule({
                  title: "Siccita severa",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: parametro, lowerBoundary: -2, upperBoundary: -1.5
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "red", fillOpacity: 0.6}
                })
		,new OpenLayers.Rule({
                  title: "Siccita estrema",
		  filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.LESS_THAN,
                    property: parametro, value: -2
                  }),
                  symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "brown", fillOpacity: 0.6}
                })
        ]}
    );
    return style_bacini_spi;
}
var spi01_ruleA = new OpenLayers.Rule({
        title: "Siccita' lieve",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "spi01", lowerBoundary: -1, upperBoundary: -0.5
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "gold", fillOpacity: 0.4}
});
var spi01_ruleB = new OpenLayers.Rule({
        title: "Piovosita' lieve",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "spi01", lowerBoundary: 0.5, upperBoundary: 1
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#02f501", fillOpacity: 0.4}
});
style_bacini_spi_01 = create_style_bacini_spi('spi01');
style_bacini_spi_01.addRules([spi01_ruleA, spi01_ruleB]);

var styleMap_bacini_spi = new OpenLayers.StyleMap({
        "default": create_style_bacini_spi('spi03')
        , "temporary": new OpenLayers.Style({label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize:15, strokeWidth:2, strokeOpacity:1, fillOpacity: 0.8, cursor: "pointer"})
});
var bacini_spi = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_spi,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bacini_siccita_stato",
		geometryName: "the_geom"
        })
});
bacini_spi.setVisibility(false);
var styleMap_bacini_spi01 = new OpenLayers.StyleMap({
        //"default": create_style_bacini_spi('spi01')
        "default": style_bacini_spi_01
        , "temporary": new OpenLayers.Style({label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize:15, strokeWidth:4, strokeOpacity:1, fillOpacity: 0.8, cursor: "pointer"})
});
var bacini_spi01 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_spi01,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bacini_siccita_stato",
                geometryName: "the_geom"
        })
});
bacini_spi01.setVisibility(false);
var styleMap_bacini_spi06 = new OpenLayers.StyleMap({
        "default": create_style_bacini_spi('spi06')
        , "temporary": new OpenLayers.Style({label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize:15, strokeWidth:4, strokeOpacity:1, fillOpacity: 0.8, cursor: "pointer"})
});
var bacini_spi06 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_spi06,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bacini_siccita_stato",
                geometryName: "the_geom"
        })
});
bacini_spi06.setVisibility(false);
var styleMap_bacini_spi12 = new OpenLayers.StyleMap({
        "default": create_style_bacini_spi('spi12')
        , "temporary": new OpenLayers.Style({label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize:15, strokeWidth:4, strokeOpacity:1, fillOpacity: 0.8, cursor: "pointer"})
});
var bacini_spi12 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_spi12,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bacini_siccita_stato",
                geometryName: "the_geom"
        })
});
bacini_spi12.setVisibility(false);


/*BACINI SICCITA PALMER*/
var style_bacini_pal = new OpenLayers.Style({
    title: "pal ${palmer}"
    }, {
    rules: [
		new OpenLayers.Rule({
		title: "Estremamente Umido",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.GREATER_THAN,
			property: "palmer", value: 4
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#031A77", fillOpacity: 0.6}
		})
		,new OpenLayers.Rule({
		title: "Molto Umido",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: 3, upperBoundary: 4
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#0000F6", fillOpacity: 0.6}
		})
		,new OpenLayers.Rule({
		title: "Moderatamente Umido",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: 2, upperBoundary: 3
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#008B01", fillOpacity: 0.4}
		})
		,new OpenLayers.Rule({
		title: "Lievemente Umido",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: 1, upperBoundary: 2
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#09EB01", fillOpacity: 0.2}
		})
		,new OpenLayers.Rule({
		title: "Incipiente Periodo Umido",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: 0.5, upperBoundary: 1
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#A5FB9A", fillOpacity: 0.4}
		})
		,new OpenLayers.Rule({
		title: "Normale",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: -0.5, upperBoundary: 0.5
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#FFFFFF", fillOpacity: 0.4}
		})
		,new OpenLayers.Rule({
		title: "Incipiente Periodo Secco",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: -1, upperBoundary: -0.5
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#FFFF00", fillOpacity: 0.4}
		})
		,new OpenLayers.Rule({
		title: "Lievemente Secco",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: -2, upperBoundary: -1
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#FFCA00", fillOpacity: 0.4}
		})
		,new OpenLayers.Rule({
		title: "Moderatamente Secco",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: -3, upperBoundary: -2
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#FF9000", fillOpacity: 0.6}
		})
		,new OpenLayers.Rule({
		title: "Molto Secco",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "palmer", lowerBoundary: -4, upperBoundary: -3
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#FE0000", fillOpacity: 0.6}
		})
		,new OpenLayers.Rule({
		title: "Estremamente Secco",
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.LESS_THAN,
			property: "palmer", value: -4
		}),
		symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "#8F0100", fillOpacity: 0.6}
		})
    ]}
);
var styleMap_bacini_pal = new OpenLayers.StyleMap({
        "default": style_bacini_pal
        , "temporary": new OpenLayers.Style({label: "${denominazione}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif", fontSize:15, strokeWidth:2, strokeOpacity:1, fillOpacity: 0.8, cursor: "pointer"})
});
var bacini_pal = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_bacini_pal,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_bacini_siccita_stato",
                geometryName: "the_geom"
        })
});
bacini_pal.setVisibility(false);

