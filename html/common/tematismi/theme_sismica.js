/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////
	
var filter, filterStrategy;

var todayfull = get_dateString(currentTimeUTC); //nella forma .yyyymmddhhmmss.
//A te serve .endString. per i sismi nella forma "yyyy-mm-dd":
var todayshort = todayfull.substring(0,8); //yyyymmdd
var endString = todayshort.slice(0, 4) + "-" + todayshort.slice(4,6) + "-" + todayshort.slice(6); //per il filterStrategy sui sismi

//per recuperare gli ultimi 15giorni:
var last15gg = new Date(currentTimeUTC.getTime() - 1296000000); //recupero 15 giorni fa
var last15gg_full = get_dateString(last15gg); //nella forma .yyyymmddhhmmss.
//A te serve .startString. per i sismi nella forma "yyyy-mm-dd":
var last15gg_short = last15gg_full.substring(0,12); //yyyymmddhhmm
//var startString = last15gg_short.slice(0, 4) + "-" + last15gg_short.slice(4,6) + "-" + last15gg_short.slice(6,8);
var last15gg_str = last15gg_short.slice(0, 4) + "-" + last15gg_short.slice(4,6) + "-" + last15gg_short.slice(6,8) + " " + last15gg_short.slice(8,10) + ":" + last15gg_short.slice(10);

//per recuperare gli ultimi 30giorni:
var date_last30gg = new Date(currentTimeUTC.getTime() - (30 * 24 * 60 * 60 * 1000) );
var last30full = get_dateString(date_last30gg); //nella forma .yyyymmddhhmmss.
//A te serve .last30gg. per i sismi nella forma "yyyy-mm-dd":
var last30gg_short = last30full.substring(0,12); //yyyymmddhhmm
//CAMBIO LA STARSTRING PER PRENDERE I SISMI DEGLI ULTIMI 30GG:
var startString = last30gg_short.slice(0, 4) + "-" + last30gg_short.slice(4,6) + "-" + last30gg_short.slice(6,8);
var last30gg = last30gg_short.slice(0, 4) + "-" + last30gg_short.slice(4,6) + "-" + last30gg_short.slice(6,8) + " " + last30gg_short.slice(8,10) + ":" + last30gg_short.slice(10);

//Recupero ultime 6h:
var last6h = new Date(currentTimeUTC.getTime() - 21600000);
var last6h_full = get_dateString(last6h); //nella forma .yyyymmddhhmmss.
var last6h_short = last6h_full.substring(0,12); //yyyymmddhhmm
var last6h_str = last6h_short.slice(0, 4) + "-" + last6h_short.slice(4,6) + "-" + last6h_short.slice(6,8) + " " + last6h_short.slice(8,10) + ":" + last6h_short.slice(10);
//Recupero ultime 24h:
var last24h = new Date(currentTimeUTC.getTime() - 86400000);
var last24h_full = get_dateString(last24h); //nella forma .yyyymmddhhmmss.
var last24h_short = last24h_full.substring(0,12); //yyyymmddhhmm
var last24h_str = last24h_short.slice(0, 4) + "-" + last24h_short.slice(4,6) + "-" + last24h_short.slice(6,8) + " " + last24h_short.slice(8,10) + ":" + last24h_short.slice(10);
//Recupero ultime 7gg:
var last7gg = new Date(currentTimeUTC.getTime() - 604800000);
var last7gg_full = get_dateString(last7gg); //nella forma .yyyymmddhhmmss.
var last7gg_short = last7gg_full.substring(0,12); //yyyymmddhhmm
var last7gg_str = last7gg_short.slice(0, 4) + "-" + last7gg_short.slice(4,6) + "-" + last7gg_short.slice(6,8) + " " + last7gg_short.slice(8,10) + ":" + last7gg_short.slice(10);



/*SISMI LAST 15gg*/
var style_sismi = new OpenLayers.Style();
var filter_lastLow = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.AND,
	filters: [
		new OpenLayers.Filter.Comparison({
        	type: OpenLayers.Filter.Comparison.EQUAL_TO,
        	property: "data_origine", value: endString
		}),
		new OpenLayers.Filter.Comparison({
        	type: OpenLayers.Filter.Comparison.LESS_THAN,
        	property: "magnitudo", value: 3.5
		})]
});
var filter_lastHigh = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.AND,
	filters: [
		new OpenLayers.Filter.Comparison({
        	type: OpenLayers.Filter.Comparison.EQUAL_TO,
        	property: "data_origine", value: endString
		}),
		new OpenLayers.Filter.Comparison({
        	type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
        	property: "magnitudo", value: 3.5
		})]
});
var ruleLastLow = new OpenLayers.Rule({
    title: endString + ' M<3.5',
    filter: filter_lastLow,
    symbolizer: {graphicName: "star", pointRadius: 12, fillColor: "purple", fillOpacity: 0.5, strokeColor: "black", strokeWidth: 1.5}
});
var ruleLastHigh = new OpenLayers.Rule({
    title: endString + ' M>=3.5',
    filter: filter_lastHigh,
    symbolizer: {graphicName: "star", pointRadius: 18, fillColor: "purple", fillOpacity: 0.5, strokeColor: "black", strokeWidth: 1.5}
});
var ruleVeryLow = new OpenLayers.Rule({
        title: "M < 1",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "magnitudo", value: 1
        }),
    symbolizer: {pointRadius: 2, strokeColor: "black",strokeWidth: 1}
});
var ruleLow = new OpenLayers.Rule({
	title: "M = 1-2.5",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "magnitudo", lowerBoundary: 1, upperBoundary: 2.5
	}),
    symbolizer: {pointRadius: 4, strokeColor: "black",strokeWidth: 1}
});
var ruleMedium = new OpenLayers.Rule({
	title: "M = 2.5-3.5",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "magnitudo", lowerBoundary: 2.5, upperBoundary: 3.5
	}),
    symbolizer: {pointRadius: 8, strokeColor: "black", strokeWidth: 1}
});
var ruleHigh = new OpenLayers.Rule({
	title: "M = 3.5-4.5",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "magnitudo", lowerBoundary: 3.5, upperBoundary: 4.5
	}),
    symbolizer: {pointRadius: 12, strokeColor: "black", strokeWidth: 1}
});
var ruleVeryHigh = new OpenLayers.Rule({
        title: "M >= 4.5",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                property: "magnitudo", value: 4.5
        }),
    symbolizer: {graphicName:"square",rotation:45, pointRadius:10, strokeColor: "black", strokeWidth: 1}
});
var profUltraLow = new OpenLayers.Rule({
	title: "P < 5 km",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LESS_THAN,
		property: "profondita", value: 5
	}),
    symbolizer: {graphicName: "circle", fillColor: "red", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profVeryLow = new OpenLayers.Rule({
        title: "P = 5-10 km",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "profondita", lowerBoundary: 5, upperBoundary: 10
        }),
    symbolizer: {graphicName: "circle", fillColor: "#FF7F00", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profLow = new OpenLayers.Rule({
        title: "P = 10-15 km",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "profondita", lowerBoundary: 10, upperBoundary: 15
        }),
    symbolizer: {graphicName: "circle", fillColor: "#FFFF00", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profMedium = new OpenLayers.Rule({
        title: "P = 15-20 km",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "profondita", lowerBoundary: 15, upperBoundary: 20
        }),
    symbolizer: {graphicName: "circle", fillColor: "#00FF00", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profModerate = new OpenLayers.Rule({
	title: "P = 20-25 km",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "profondita", lowerBoundary: 20, upperBoundary: 25
	}),
    symbolizer: {graphicName: "circle", fillColor: "#00FFFF", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profHigh = new OpenLayers.Rule({
        title: "P = 25-30 km",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "profondita", lowerBoundary: 25, upperBoundary: 30
        }),
    symbolizer: {graphicName: "circle", fillColor: "#0000FF", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profVeryHigh = new OpenLayers.Rule({
        title: "P = 30-40 km",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "profondita", lowerBoundary: 30, upperBoundary: 40
        }),
    symbolizer: {graphicName: "circle", fillColor: "#7F007F", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var profUltraHigh = new OpenLayers.Rule({
	title: "P >= 40 km",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
		property: "profondita", value: 40
	}),
    symbolizer: {graphicName: "circle", fillColor: "#FF00FF", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
style_sismi.addRules([profUltraLow, profVeryLow, profLow, profMedium, profModerate, profHigh, profVeryHigh, profUltraHigh, ruleVeryLow, ruleLow, ruleMedium, ruleHigh, ruleVeryHigh, ruleLastLow, ruleLastHigh]);
var styleMap_sismi = new OpenLayers.StyleMap({
	"default": style_sismi,
	"select": {pointRadius: 15, fillColor: "blue"}
	,"temporary": new OpenLayers.Style({pointRadius: 15, cursor: "pointer"})
});

//Definisco una filterStrategy, che serve solo per l'animazione dei sismi:
filter = new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.BETWEEN,
    property: "data_origine",
    lowerBoundary: startString,
    upperBoundary: endString
});
filterStrategy = new OpenLayers.Strategy.Filter({filter: filter});

//LAYER CON TEMATIZZAZIONE IN BASE ALLA PROFONDITA':
var sismi = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_sismi,
	//strategies: [new OpenLayers.Strategy.BBOX()],
	strategies: [new OpenLayers.Strategy.Fixed()
		,new OpenLayers.Strategy.Refresh({force: true, interval:300000})
		,filterStrategy
	],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_sismi,
		version: "1.1.0",
		featureType: "sism_last15",
		featureNS: "http://mapserver.gis.umn.edu/mapserver"
		//extractAttributes: true, extractStyles: true,
		,geometry: "msGeometry", srsName: "epsg:32632"
	})
});

//LAYER CON TEMATIZZAZIONE IN BASE AL TEMPO TRASCORSO:
var style_sismi_time = new OpenLayers.Style();
var last6h = new OpenLayers.Rule({
        title: "< 6h",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                property: "full_date", value: last6h_str
        }),
    symbolizer: {graphicName: "circle", fillColor: "#7F00BF", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var last24h = new OpenLayers.Rule({
        title: "6h - 24h",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "full_date", lowerBoundary: last24h_str, upperBoundary: last6h_str
        }),
    symbolizer: {graphicName: "circle", fillColor: "#BF00BF", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var last7gg = new OpenLayers.Rule({
        title: "1gg - 7gg",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "full_date", lowerBoundary: last7gg_str, upperBoundary: last24h_str
        }),
    symbolizer: {graphicName: "circle", fillColor: "#BF0000", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
var last15gg = new OpenLayers.Rule({
        title: "7gg - 30gg",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "full_date", value: last7gg_str
        }),
    symbolizer: {graphicName: "circle", fillColor: "#BF7F7F", fillOpacity: 0.7, pointRadius: 5, strokeWidth: 0.1}
});
style_sismi_time.addRules([last6h, last24h, last7gg, last15gg, ruleVeryLow, ruleLow, ruleMedium, ruleHigh, ruleVeryHigh]);
var styleMap_sismi_time = new OpenLayers.StyleMap({
        "default": style_sismi_time,
        "select": {pointRadius: 15, fillColor: "blue"}
	,"temporary": new OpenLayers.Style({pointRadius: 15, cursor: "pointer"})
});
var sismi_time = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_sismi_time,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,new OpenLayers.Strategy.Refresh({force: true, interval:300000})
                ,filterStrategy
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                version: "1.1.0",
                featureType: "sism_last15",
                featureNS: "http://mapserver.gis.umn.edu/mapserver"
                ,geometry: "msGeometry", srsName: "epsg:32632"
        })
});
var store_sismi_time = new GeoExt.data.FeatureStore({
        fields: [
                {name: "data_origine", type: "date"},// direction: 'DESC'},
                {name: "orario_origine", type: "string"},
                {name: "latitudine", type: "float"},
                {name: "longitudine", type: "float"},
                {name: "erh", type: "float"},
                {name: "profondita", type: "float"},
                {name: "erz", type: "float"},
                {name: "magnitudo", type: "float"},
                {name: "dev_st_m", type: "float"},
                {name: "regione_geografica", type: "string"},
                {name: "fasi", type: "string"},
                {name: "num_fasi", type: "integer"},
                {name: "max_gap_az", type: "integer"},
                {name: "localita", type: "string"},
                {name: "sigla_naz", type: "string"},
               //{name: "full_date", type: "string"},
		"full_date", {name: "comboDisplay", type: "string", mapping:"full_date"},
                {name: "label", type: "string"},
                {name: "tipo_elab", type: "string"}
        ],
        layer: sismi_time
});
store_sismi_time.on('load', function(store){
        store.sort('full_date', 'DESC');
});
var store_sismi = new GeoExt.data.FeatureStore({
	fields: [
		//{name: "ndb", type: "string"},
		{name: "data_origine", type: "date"},// direction: 'DESC'},
		{name: "orario_origine", type: "string"},
		{name: "latitudine", type: "float"},
		{name: "longitudine", type: "float"},
		{name: "erh", type: "float"},
		{name: "profondita", type: "float"},
		{name: "erz", type: "float"},			
		{name: "magnitudo", type: "float"},
		{name: "dev_st_m", type: "float"},
		{name: "regione_geografica", type: "string"},
		{name: "fasi", type: "string"},
		{name: "num_fasi", type: "integer"},
		{name: "max_gap_az", type: "integer"},
		{name: "localita", type: "string"},
		{name: "sigla_naz", type: "string"},
		//{name: "full_date", type: "date", dateFormat: 'timestamp', mapping: "full_date"},
		{name: "full_date", type: "string"},
		{name: "label", type: "string"},
                {name: "tipo_elab", type: "string"}
	],
	layer: sismi
	//remoteSort: true //to enable sorting from server:si prende un botto di tempo...
	//,sortInfo: {field: "full_date", direction: "DESC"} //pare non funzionare...
});
//store_sismi.setDefaultSort('full_date', 'DESC');
//store_sismi.sort("full_date", "DESC");
store_sismi.on('load', function(store){
	store.sort('full_date', 'DESC');
});
// Custom function used for column renderer * @param {Object} val
function magnitudo(val){
        return '<b>' + val + '</b>';
}
function profondita(val){
        if(val > 20 & val < 50)
        {return '<font style="background-color:lime">' + val + '</font>';}
        else if(val <= 20)
        {return '<font style="background-color:orange">' + val + '</font>';}
        //{return '<span style="color:orange;">' + val + '</span>';}
        else if(val >= 50)
        {return '<font style="background-color:cyan">' + val + '</font>';}
}
var columns_sismi = new Ext.grid.ColumnModel({
	defaults: {
        	sortable: true
	},
        columns: [
	        //{header: "ID evento", dataIndex: "ndb"},
        	//{id: "Date", header: "Data", dataIndex: 'data_origine', sortable: true, renderer: Ext.util.Format.dateRenderer("d/m/Y") //YES!
	        //, xtype: "datecolumn", format: "d M Y" //uguale a renderer, forse preferibile},
        	{header: "<b>Tempo origine</b>", dataIndex: "full_date", width: 150},
                //{header: "Ora", dataIndex: "orario_origine"},
                {header: "<b>Magnitudo [ML]</b>", dataIndex: "magnitudo", decimalPrecision: 2,
                //xtype: "numbercolumn", format: "1,000", css: 'bold-column', //css servirebbe per dare uno stile dichiarato sull'html ma non funziona. L'opzione "renderer" lavora perfettamente!
                align: "center", width: 125, renderer: magnitudo},
                {header: "&sigma; [ML]", dataIndex: "dev_st_m", decimalPrecision: 2, align: "center", width: 65},
                {header: "Prof. [km]", dataIndex: "profondita", decimalPrecision: 2, align: "center", renderer: profondita, width: 75},
                {header: "erz [km]", dataIndex: "erz", decimalPrecision: 2, align: "center", width: 65},
                {header: "Lat", dataIndex: "latitudine", decimalPrecision: 3, align: "center", width: 75},
                {header: "Lon", dataIndex: "longitudine", decimalPrecision: 3, align: "center", width: 75},
                {header: "erh [km]", dataIndex: "erh", decimalPrecision: 2, align: "center", width: 65},
                {header: "Regione geografica", dataIndex: "regione_geografica", width: 180},
                {header: "Localita", dataIndex: "localita", width: 180},
                {header: "Nazione", dataIndex: "sigla_naz", width: 50},
                {header: "Fasi", dataIndex: "fasi", align: "center", width: 50},
                {header: "Nfasi", dataIndex: "num_fasi", align: "center", width: 50},
                {header: "gap", dataIndex: "max_gap_az", align: "center", width: 50},
                {header: "Elaborazione", dataIndex: "tipo_elab"}
        ]
});



/*ETICHETTE SISMI LAST 15gg*/
var style_sismi_label = new OpenLayers.Style();
var label_sismi = new OpenLayers.Rule({
	title: "Etichetta sismi",
	symbolizer: {label: '${label}', labelAlign: "lm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", labelXOffset: 8, labelYOffset: 8, fontFamily: 'Comic Sans MS', graphicName: "circle", graphic:false}
	//label: "${data_origine};<br/>\n\M=${magnitudo}" Ma cmq nn funziona la multilinea...
	//label: '${data_origine} ${orario_origine};'+'\n\r'+'M=${magnitudo}' NON funziona
});
style_sismi_label.addRules([label_sismi]);
var styleMap_sismi_label = new OpenLayers.StyleMap({"default": style_sismi_label});
var sismi_label = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_sismi_label,
	displayInLayerSwitcher: false,
	//strategies: [new OpenLayers.Strategy.BBOX()],
	strategies: [new OpenLayers.Strategy.Fixed()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_sismi, version: "1.1.0", featureType: "sism_last15",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
	})
});
	
	
/*STAZIONI SISMICHE*/
var style_sism_staz = new OpenLayers.Style();
var label_staz = new OpenLayers.Rule({
	title: "Etichette stazioni RSNI",
	symbolizer: {label: '${codice_stazione}', labelAlign: 'lm', fontSize: '13px', fontColor: 'black', fontWeight: 'bold', labelXOffset: 10, fontFamily: 'Comic Sans MS'}
});
var realtime = new OpenLayers.Rule({
	title: "Tempo reale",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "tempo_reale", value: "S"
	}),
    symbolizer: {pointRadius: 10, graphicName: "triangle", strokeColor: "black", strokeWidth: 1}
});
var dialup = new OpenLayers.Rule({
	title: "Dial-up",
    filter: new OpenLayers.Filter.Comparison({
		//type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "tempo_reale", value: "N"
	}),
    symbolizer: {pointRadius: 10, graphicName: "square", strokeColor: "black", strokeWidth: 1}
});
var id_reteIG = new OpenLayers.Rule({
	title: "GU",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "id_rete_monit", value: "GU"
	}),
    symbolizer: {fillColor: "yellow", fillOpacity: 0.7, pointRadius: 6, graphicName: "square", strokeWidth: 0.1}
});	
var id_reteCH = new OpenLayers.Rule({
	title: "CH",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "id_rete_monit", value: "CH"
	}),
    symbolizer: {fillColor: "red", fillOpacity: 0.7, pointRadius: 6, graphicName: "square", strokeWidth: 0.1}
});
var id_reteFR = new OpenLayers.Rule({
	title: "FR",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "id_rete_monit", value: "FR"
	}),
    symbolizer: {fillColor: "blue", fillOpacity: 0.7, pointRadius: 6, graphicName: "square", strokeWidth: 0.1}
});
var id_reteIV = new OpenLayers.Rule({
	title: "IV",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "id_rete_monit", value: "IV"
	}),
    symbolizer: {fillColor: "green", fillOpacity: 0.7, pointRadius: 6, graphicName: "square", strokeWidth: 0.1}
});

/*Filtri vari per visualizzare stazioni non acquisite:*/
/*var filter_FR = new OpenLayers.Filter.Logical({
type: OpenLayers.Filter.Logical.OR,
filters: [
    new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "codice_stazione", value: "SURF"
    }),
    new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "codice_stazione", value: "OG35"
    }),
    new OpenLayers.Filter.Spatial({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "codice_stazione", value: "OGDI"
    }),
	new OpenLayers.Filter.Spatial({
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "codice_stazione", value: "RSL"
    })
	]
});
var id_reteFR_U = new OpenLayers.Rule({
	title: "FR_U", filter: filter_FR,
    symbolizer: {pointRadius: 10, fillColor: "blue", fillOpacity: 0.7, graphicName: "triangle", strokeWidth: 1, strokeColor: "black"}
});
*/

style_sism_staz.addRules([id_reteIG, id_reteCH, id_reteFR, id_reteIV, realtime, dialup, label_staz]);
var styleMap_sism_staz = new OpenLayers.StyleMap({"default": style_sism_staz});	
var sism_staz = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_sism_staz,
	//strategies: [new OpenLayers.Strategy.BBOX()],
	strategies: [new OpenLayers.Strategy.Fixed()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_sismi, version: "1.1.0", featureType: "sism_staz",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
	})
});
store_sism_staz = new GeoExt.data.FeatureStore({
	fields: [
		"codice_stazione", {name: "comboDisplay", type: "string", mapping:"codice_stazione"},
		{name: "localita", type: "string"},
		{name: "latitudine", type: "float"},
		{name: "longitudine", type: "float"},
		{name: "quota", type: "integer"},
		{name: "sensore", type: "string"},
		{name: "digitalizzatore", type: "string"},
		{name: "trasmissione", type: "string"},
		{name: "sincronizzazione", type: "string"},
		{name: "canale", type: "string"},
		{name: "componenti", type: "string"},
		{name: "tempo_reale", type: "string"},
		{name: "sigla_rete", type: "string"}
	],
	layer: sism_staz
});
store_sism_staz.on('load', function(store){
	store.sort('codice_stazione', 'ASC');
});
columns_sism_staz = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "<b>Codice stazione</b>", dataIndex: "codice_stazione"},
                {header: "Localita'", dataIndex: "localita", width: 180},
                {header: "Quota [m s.l.m.]", dataIndex: "quota"},
                {header: "Lat", dataIndex: "latitudine", decimalPrecision: 3, align: "center"},
                {header: "Lon", dataIndex: "longitudine", decimalPrecision: 3, align: "center"},
                {header: "Sensore", dataIndex: "sensore", align: "center"},
                {header: "Digitalizzatore", dataIndex: "digitalizzatore", align: "center"},
                {header: "Trasmix", dataIndex: "trasmissione", align: "center"},
		{header: "Sincro", dataIndex: "sincronizzazione", align: "center"},
		{header: "Canali", dataIndex: "canale", align: "center"},
		{header: "Componenti", dataIndex: "componenti", align: "center"},
		{header: "Tempo reale", dataIndex: "tempo_reale", align: "center"},				
                {header: "Rete", dataIndex: "sigla_rete", align: "center"}
        ]
});


/*CPTI04 INGV*/
var style_sism_cpti04 = new OpenLayers.Style();
var cpti04_Low = new OpenLayers.Rule({
	title: "M = 3.92-5",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LESS_THAN,
		property: "magnitudo", value: 5
	}),
    symbolizer: {fillColor: "#ee9900", fillOpacity: 0.5, pointRadius: 4, graphicName: "square", strokeColor: "fuchsia", strokeWidth: 1}
});
var cpti04_Medium = new OpenLayers.Rule({
	title: "M = 5-6",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "magnitudo", lowerBoundary: 5, upperBoundary: 6
	}),
    symbolizer: {fillColor: "#ee9900", fillOpacity: 0.5, pointRadius: 6.5, graphicName: "square", strokeColor: "fuchsia", strokeWidth: 1}
});
var cpti04_High = new OpenLayers.Rule({
	title: "M = 6-7.41",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
		property: "magnitudo", value: 6
	}),
    symbolizer: {fillColor: "#ee9900", fillOpacity: 0.5, pointRadius: 9, graphicName: "square", strokeColor: "fuchsia", strokeWidth: 1}
});
style_sism_cpti04.addRules([cpti04_Low, cpti04_Medium, cpti04_High]);
var styleMap_sism_cpti04 = new OpenLayers.StyleMap({
	"default": style_sism_cpti04,
	"select": {pointRadius: 9, fillColor: "blue"}
	,"temporary": new OpenLayers.Style({pointRadius: 12, cursor: "pointer"})
});
var sism_cpti04 = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_sism_cpti04,
	//strategies: [new OpenLayers.Strategy.BBOX()],
	strategies: [new OpenLayers.Strategy.Fixed()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_sismi, version: "1.1.0", featureType: "sism_cpti04",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
	})
});
var sism_cpti11 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_sism_cpti04,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi, version: "1.1.0", featureType: "sism_cpti11",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});


/*ETICHETTE CPTI04 INGV*/
// allow testing of specific renderers via "?renderer=Canvas"..A cosa serva non so...
var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
var sism_cpti04_label = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: new OpenLayers.StyleMap({
		"default": {title: "Etichette CPTI04", label: " ${data_origine};\nM=${magnitudo}", labelAlign: "lm", fontSize: "11px", fontColor: 'black', pointRadius: 0, fontWeight: "bold", labelXOffset: 8, fontFamily: 'Comic Sans MS', pointerEvents: "visiblePainted"}
	}),
	displayInLayerSwitcher:false,
	//strategies: [new OpenLayers.Strategy.BBOX()],
	strategies: [new OpenLayers.Strategy.Fixed()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_sismi, version: "1.1.0", featureType: "sism_cpti04",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
	}),
	renderers: renderer
});
	
	
/*CLASSIFICAZIONE SISMICA COMUNALE*/
var style_clax_sismi = new OpenLayers.Style();
var clax_sismi_Low = new OpenLayers.Rule({
	title: "zona 3",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "zs_2006", value: 3
	}),
    symbolizer: {fillColor: "yellow", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var clax_sismi_Medium = new OpenLayers.Rule({
	title: "zona 2",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "zs_2006", value: 2
	}),
    symbolizer: {fillColor: "#ee9900", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var clax_sismi_High = new OpenLayers.Rule({
	title: "zona 1",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "zs_2006", value: 1
	}),
    symbolizer: {fillColor: "red", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var style_clax_sismi2010 = new OpenLayers.Style();
var clax_sismi2010_3s = new OpenLayers.Rule({
        title: "zona 3s",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "zs_2010", value: "3s"
        }),
    symbolizer: {fillColor: "yellow", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var clax_sismi2010_3A = new OpenLayers.Rule({
        title: "zona 3",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LIKE,
                property: "zs_2010", value: "3A"
        }),
    symbolizer: {fillColor: "olive", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
style_clax_sismi.addRules([clax_sismi_Low, clax_sismi_Medium, clax_sismi_High]);
var styleMap_clax_sismi = new OpenLayers.StyleMap({
	"default": style_clax_sismi,
	"select": {fillColor: "blue"}
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
style_clax_sismi2010.addRules([clax_sismi2010_3A, clax_sismi2010_3s]);
var styleMap_clax_sismi2010 = new OpenLayers.StyleMap({
        "default": style_clax_sismi2010,
        "select": {fillColor: "blue"}
	, "temporary": new OpenLayers.Style({strokeWidth:4, strokeOpacity:1, fillOpacity: 1, cursor: "pointer"})
});
var clax_sismi = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_clax_sismi,
	strategies: [new OpenLayers.Strategy.BBOX()],
	//strategies: [new OpenLayers.Strategy.Fixed()],
	protocol: new OpenLayers.Protocol.WFS({
		// url: urlMS_sismi, version: "1.1.0", featureType: "clax_sismi",
		url: urlMS_sismi, featureType: "clax_sismi",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
	})
});
var clax_sismi2010 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_clax_sismi2010,
        strategies: [new OpenLayers.Strategy.BBOX()],
        //strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                // url: urlMS_sismi, version: "1.1.0", featureType: "clax_sismi",
                url: urlMS_sismi, featureType: "clax_sismi2012",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});
store_clax_sismi = new GeoExt.data.FeatureStore({
        fields: [
		"nome_ita", {name: "comboDisplay", type: "string", mapping:"nome_ita"},
                {name: "nome_reg", type: "string"},
                {name: "sigla_pro", type: "string"},
                {name: "pop_1991", type: "integer"},
                {name: "pop_2001", type: "integer"},
                {name: "dens_2001", type: "integer"},
                {name: "zs_2006", type: "integer"},
                {name: "zs_2010", type: "string"}
        ],
        layer: clax_sismi2010
});
store_clax_sismi.on('load', function(store){
        store.sort('nome_ita', 'ASC');
});
columns_clax_sismi = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "<b>Comune</b>", dataIndex: "nome_ita"},
                {header: "Regione", dataIndex: "nome_reg"},
                {header: "Prov", dataIndex: "sigla_pro"},
                {header: "Popolazione al 1991", dataIndex: "pop_1991", align: "center"},
                {header: "Popolazione al 2001", dataIndex: "pop_2001", align: "center"},
                {header: "Densita' pop/km2", dataIndex: "dens_2001", align: "center"},
                {header: "Clax del 2003", dataIndex: "zs_2006", align: "center"},
                {header: "Clax del 2012", dataIndex: "zs_2010", align: "center"}
        ]
});


/*CLASSIFICAZIONE SISMICA COMUNALE - ETICHETTE*/
var clax_sismi_label = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: new OpenLayers.StyleMap({
		"default": {title: "Etichette clax sismi", label: "${nome_ita}", labelAlign: "cm", fontSize: "10px", fontColor: 'black', fontWeight: "bold", fill: false, stroke: false, labelXOffset: 0, labelYOffset: 0, fontFamily: 'Comic Sans MS'}
	}),
	displayInLayerSwitcher:false,
	strategies: [new OpenLayers.Strategy.BBOX()],
	protocol: new OpenLayers.Protocol.WFS({
		//url: urlMS_sismi, version: "1.1.0",
		featureType: "clax_sismi",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
	})
});


/*CLUSTER*/
var style_cluster = new OpenLayers.Style();
var cluster_rule = new OpenLayers.Rule({
        title: "Sequenze sismiche ultimi 60gg",
        symbolizer: {strokeColor: '${rainbow}', strokeWidth: 3, strokeOpacity: 1, fillColor: '${rainbow}', fillOpacity: 0.1, label: '${cluster_id}', labelAlign: 'rt', fontSize: '13px', fontColor: 'black', fontWeight: 'bold', labelYOffset: -15, fontFamily: 'Comic Sans MS'}
        });
style_cluster.addRules([cluster_rule]);
var styleMap_cluster = new OpenLayers.StyleMap({
	"default": style_cluster,
	"select": {fillColor: "blue"}
	, "temporary": new OpenLayers.Style({strokeWidth: 6, fontSize: '16px', cursor: "pointer"})
});
var cluster = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_cluster,
        strategies: [new OpenLayers.Strategy.BBOX()],
        //strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi, featureType: "cluster",
		//version: "1.1.0",
                featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});
store_cluster = new GeoExt.data.FeatureStore({
        fields: [
		"cluster_id", {name: "comboDisplay", type: "string", mapping:"cluster_id"},
                {name: "data_inizio", type: "string"},
		{name: "data_fine", type: "string"},
                {name: "durata", type: "integer"},
                {name: "n_eventi", type: "integer"},
		{name: "evento_capo", type: "integer"},
		{name: "data_capo", type: "string"},
		{name: "magnitudo_capo", type: "float"},
		{name: "localita_capo", type: "string"},
                {name: "gid", type: "integer"},
		{name: "energia", type: "float"},
		{name: "rms_medio", type: "float"},
		{name: "erh_medio", type: "float"},
		{name: "erz_medio", type: "float"}
        ],
        layer: cluster
});
//store_clax_sismi.on('load', function(store){
//        store.sort('nome_ita', 'ASC');
//});
columns_cluster = new Ext.grid.ColumnModel({
    defaults: {
        sortable: true
    },
        columns: [
                {header: "<b>Cluster ID</b>", dataIndex: "cluster_id", width: 80},
                {header: "Data inizio", dataIndex: "data_inizio"},
                {header: "Data fine", dataIndex: "data_fine"},
                {header: "Durata [giorni]", dataIndex: "durata", width: 85, align: "center"},
                {header: "# eventi", dataIndex: "n_eventi", width: 75, align: "center"},
		{header: "Energia [kg TNT]", dataIndex: "energia", align: "center"},
		{header: "rms medio", dataIndex: "rms_medio", width: 85, align: "center"},
		{header: "erh medio [km]", dataIndex: "erh_medio", width: 85, align: "center"},
		{header: "erz medio [km]", dataIndex: "erz_medio", width: 85, align: "center"},
		//{header: "GID evento principale", dataIndex: "evento_capo", align: "center"},
		{header: "Data evento principale", dataIndex: "data_capo", align: "center"},
                {header: "ML evento principale", dataIndex: "magnitudo_capo", align: "center"},
		{header: "Localita evento principale", dataIndex: "localita_capo", align: "center"}
		//{header: "GID del cluster", dataIndex: "gid", align: "center"}
        ]
});


/*CLUSTER SISMI*/
/*
var filter_30gg = new OpenLayers.Filter.Comparison({
	type: OpenLayers.Filter.Comparison.GREATER_THAN,
	property: "data_origine", value: last30gg
});
*/
//var style_cluster_sismi = new OpenLayers.Style();
var style_cluster_sismi = new OpenLayers.Style({
	title: "Cluster sismi 30gg", strokeWidth: 1, strokeOpacity: 1, fillColor: '${rainbow}', fillOpacity: 0.5, pointRadius: 3, graphicName: "circle"
});
/*
var cluster_sismi30 = new OpenLayers.Rule({
	title: "Cluster sismi 30gg",
	filter: filter_30gg,
	symbolizer: {strokeWidth: 1, strokeOpacity: 1, fillColor: '${rainbow}', fillOpacity: 0.5, pointRadius: 3}
});
style_cluster_sismi.addRules([cluster_sismi30]);
*/
var styleMap_cluster_sismi = new OpenLayers.StyleMap({
        "default": style_cluster_sismi,
        "select": {fillColor: "blue"}
	,"temporary": new OpenLayers.Style({pointRadius: 10, cursor: "pointer"})
});
var cluster_sismi = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_cluster_sismi,
        strategies: [new OpenLayers.Strategy.BBOX()],
        //strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi, featureType: "cluster_sismi",
                //version: "1.1.0",
                featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});


/*MWSOURCE CSSOURCE ISSOURCE*/
var style_mwsource = new OpenLayers.Style();
var mwsource_Low = new OpenLayers.Rule({
	title: "max M: 5-6",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.LESS_THAN,
		property: "maxmag", value: 6
	}),
    symbolizer: {fillColor: "yellow", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var mwsource_Med = new OpenLayers.Rule({
	title: "max M: 6-6.5",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "maxmag", lowerBoundary: 6, upperBoundary: 6.5
	}),
    symbolizer: {fillColor: "orange", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var mwsource_Hig = new OpenLayers.Rule({
	title: "max M: 6.5-7",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.BETWEEN,
		property: "maxmag", lowerBoundary: 6.5, upperBoundary: 7
	}),
    symbolizer: {fillColor: "red", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
var mwsource_VHig = new OpenLayers.Rule({
	title: "max M: >7",
    filter: new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.GREATER_THAN,
		property: "maxmag", value: 7
	}),
    symbolizer: {fillColor: "purple", fillOpacity: 0.4, strokeColor: "black", strokeWidth: 0.6}
});
style_mwsource.addRules([mwsource_Low, mwsource_Med, mwsource_Hig, mwsource_VHig]);
var styleMap_mwsource = new OpenLayers.StyleMap({
	"default": style_mwsource
});
var mwsource = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_mwsource,
	strategies: [new OpenLayers.Strategy.BBOX()],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_sismi, featureType: "mwsource",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:4326"
	})
});
var issource = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_mwsource,
        strategies: [new OpenLayers.Strategy.BBOX()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi, featureType: "issource",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:4326"
        })
});
var cssource = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_mwsource,
        strategies: [new OpenLayers.Strategy.BBOX()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi, featureType: "cssource",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:4326"
        })
});


/*FAGLIE*/
var style_faglie = new OpenLayers.Style();
var faglie_Low = new OpenLayers.Rule({
        title: "Faglie note",
	symbolizer: {strokeColor: "red", strokeWidth: 2}
});
style_faglie.addRules([faglie_Low]);
var styleMap_faglie = new OpenLayers.StyleMap({
        "default": style_faglie
	,"temporary": new OpenLayers.Style({strokeWidth:4, cursor: "pointer"})
});
var faglie = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_faglie,
        strategies: [new OpenLayers.Strategy.BBOX()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi, featureType: "faglie",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                extractAttributes: false, extractStyles: false, geometry: "msGeometry", srsName: "epsg:23032"
        })
});


sismi.setVisibility(false);
sismi_time.setVisibility(false);
sismi_label.setVisibility(false);
sism_staz.setVisibility(false);
sism_cpti04.setVisibility(false);
sism_cpti11.setVisibility(false);
sism_cpti04_label.setVisibility(false);
clax_sismi.setVisibility(false);
clax_sismi2010.setVisibility(false);
clax_sismi_label.setVisibility(false);
cluster.setVisibility(false);
cluster_sismi.setVisibility(false);
mwsource.setVisibility(false);
issource.setVisibility(false);
cssource.setVisibility(false);
faglie.setVisibility(false);

