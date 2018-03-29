/*
 * author: Armando Riccardo Gaeta
 * email: ar_gaeta@yahoo.it
 * 
*/


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////

/*STABILIMENTI RIR*/
var rule_B = new OpenLayers.Rule({
                title: "Art. 8",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento", value: "B"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'#222222', strokeDashstyle:'dashdot', fontColor:'#222222'}
});
var rule_A = new OpenLayers.Rule({
                title: "Art. 6",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento", value: "A"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'navy', strokeDashstyle:'solid', fontColor:'navy'}
});
var rule_E = new OpenLayers.Rule({
                title: "Soglia inf.",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento105", value: "E"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'#222222', strokeDashstyle:'solid', fontColor:'#222222'}
});
var rule_F = new OpenLayers.Rule({
                title: "Soglia sup.",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento105", value: "F"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'navy', strokeDashstyle:'dashdot', fontColor:'navy'}
});
var rule_cod3 = new OpenLayers.Rule({
                title: "Produzione/deposito esplosivi",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 3
                }),
                symbolizer: {fill:1, fillColor: '#B42DB4'}
});
var rule_cod7 = new OpenLayers.Rule({
                title: "Deposito gas infiammabili",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 7
                }),
                symbolizer: {fill:1, fillColor: '#FD4FEE'}
});
var rule_cod10 = new OpenLayers.Rule({
                title: "Deposito sostanze tossiche",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 10
                }),
                symbolizer: {fill:1, fillColor: '#B41E1E'}
});
var rule_cod8 = new OpenLayers.Rule({
                title: "Deposito oli minerali",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 8
                }),
                symbolizer: {fill:1, fillColor: '#FF5A00'}
});
var rule_cod2 = new OpenLayers.Rule({
                title: "Produzione chimica di base",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 2
                }),
                symbolizer: {fill:1, fillColor: '#FF8C00'}
});
var rule_cod5 = new OpenLayers.Rule({
                title: "Trattamenti galvanici",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 5
                }),
                symbolizer: {fill:1, fillColor: '#FEBD00'}
});
var rule_cod4 = new OpenLayers.Rule({
                title: "Produzione chimica farmaceutica",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 4
                }),
                symbolizer: {fill:1, fillColor: '#FFFF00'}
});
var rule_cod6 = new OpenLayers.Rule({
                title: "Prod./stoccaggio di gas tecnici",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 6
                }),
                symbolizer: {fill:1, fillColor: '#01FF01'}
});
var rule_cod9 = new OpenLayers.Rule({
                title: "Produzione resine sintetiche",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 9
                }),
                symbolizer: {fill:1, fillColor: '#00D000'}
});
var rule_cod1 = new OpenLayers.Rule({
                title: "Altre attivita specifiche",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_attivita", value: 1
                }),
                symbolizer: {fill:1, fillColor: '#00B400'}
});
var style_stabrir = new OpenLayers.Style({
	label: "${label}", strokeColor: "black", strokeWidth: 0.6, strokeOpacity: 0.8, fillOpacity: 0.6,
	title: "${nome_stabilimento}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
	}, {
	rules: [
	rule_B, rule_A,
	rule_cod3, rule_cod7, rule_cod10,
	rule_cod8, rule_cod2, rule_cod5,
	rule_cod4, rule_cod6, rule_cod9, rule_cod1,
	new OpenLayers.Rule({
		title: " ",
		minScaleDenominator: 250000,
		symbolizer: {pointRadius: 3, fontSize: "0px", strokeWidth:0.6}
	}),
	new OpenLayers.Rule({
		title: " ",
		maxScaleDenominator: 250000,
		symbolizer: {
			//pointRadius: 13,
			fontSize: "13px"
		}
	})
]});
var styleMap_stabrir = new OpenLayers.StyleMap({
	"default": style_stabrir
	,"temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
var filter_stab_seveso = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.OR,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "cod_adempimento", value: 'A'
                }),
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "cod_adempimento", value: 'B'
                })]
});
var filterStrategy_stab_seveso = new OpenLayers.Strategy.Filter({filter: filter_stab_seveso});
var saveStrategy_stabrir = new OpenLayers.Strategy.Save();
var stabrir = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_stabrir,
	strategies: [new OpenLayers.Strategy.BBOX()
	,filterStrategy_stab_seveso
	//,saveStrategy_stabrir
	],
	projection: OL_32632,
	protocol: new OpenLayers.Protocol.WFS({
		url: url_tinyows, featureType: "v_stabrir_webgis_334",
		featureNS: "http://www.tinyows.org/",
		geometryName: "the_geom"
		/*readFormat: new OpenLayers.Format.GML({
                	'internalProjection': OL_32632,
                	'externalProjection': OL_32632
                })*/
	})
});
stabrir.setVisibility(false);


/* STABILIMENTI NUOVA RIR CLP DLGS 105/2015 */
var style_stabrir105 = new OpenLayers.Style({
        title: "${label}", strokeColor: "black", strokeWidth: 0.6, strokeOpacity: 0.8, fillOpacity: 0.6,
        label: "${nome_stabilimento}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        rule_E, rule_F,
        rule_cod3, rule_cod7, rule_cod10,
        rule_cod8, rule_cod2, rule_cod5,
        rule_cod4, rule_cod6, rule_cod9, rule_cod1,
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {pointRadius: 3, fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        pointRadius: 13,
                        fontSize: "13px"
                }
        })
]});
var styleMap_stabrir105 = new OpenLayers.StyleMap({
        "default": style_stabrir105
        ,"temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
var filter_stab_seveso105 = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.OR,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "cod_adempimento105", value: 'E'
                }),
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "cod_adempimento105", value: 'F'
                })]
});
var filterStrategy_stab_seveso105 = new OpenLayers.Strategy.Filter({filter: filter_stab_seveso105});
//var saveStrategy_stabrir = new OpenLayers.Strategy.Save();
var stabrir105 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_stabrir105,
        strategies: [new OpenLayers.Strategy.BBOX()
        ,filterStrategy_stab_seveso105
        ],
        projection: OL_32632,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows, featureType: "v_stabrir_webgis_105",
                featureNS: "http://www.tinyows.org/",
                geometryName: "the_geom"
        })
});
stabrir105.setVisibility(false);
var store_stabrir105 = new GeoExt.data.FeatureStore({
        fields: [
                {name: "id_stabilimento", type: "integer"},
		"nome_stabilimento", {name: "comboDisplay", type: "string", mapping:"nome_stabilimento"},
                {name: "indirizzo", type: "string"},
                {name: "comune", type: "string"},
                {name: "sigla_pro", type: "string"},
                {name: "adempimento_label_s", type: "string"},
                {name: "attivita_label_s", type: "string"}
        ],
        layer: stabrir105
        //,autoLoad: true
});
store_stabrir105.on('load', function(store){
        store.sort('nome_stabilimento', 'ASC');
});


/*STABILIMENTI EXTRA RIR*/
var style_stabex = new OpenLayers.Style({
        title: "${nome_stabilimento}", strokeColor: "black", strokeWidth: 0.6, strokeOpacity: 0.8, fillOpacity: 0.6,
        label: "${label}", labelAlign: "ct", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
        new OpenLayers.Rule({
                title: "Sottosoglia",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento", value: "C"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'#222222', strokeDashstyle:'dashdot', fontColor:'#222222'}
        }),
        new OpenLayers.Rule({
                title: "Chiuso",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "cod_adempimento", value: "D"
                }),
                symbolizer: {fill:0, strokeWidth:4, strokeColor:'navy', strokeDashstyle:'solid', fontColor:'navy'}
        }),
	rule_cod3, rule_cod7, rule_cod10,
        rule_cod8, rule_cod2, rule_cod5,
        rule_cod4, rule_cod6, rule_cod9, rule_cod1,
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 250000,
                symbolizer: {pointRadius: 3, fontSize: "0px", strokeWidth:0.6}
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: {
                        pointRadius: 13,
                        fontSize: "13px"
                }
        })
]});
var styleMap_stabex = new OpenLayers.StyleMap({
	"default": style_stabex
	,"temporary": new OpenLayers.Style({strokeWidth:4, fontSize: 15, fillOpacity: 1, cursor: "pointer"})
});
//Qui metto tutti gli altri stabilimenti ancora di interesse:
var filter_stab_exseveso = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.OR,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "cod_adempimento", value: 'C'
                }),
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "cod_adempimento", value: 'D'
                })]
});
var filterStrategy_stab_exseveso = new OpenLayers.Strategy.Filter({filter: filter_stab_exseveso});
var stabrirC = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_stabex,
	strategies: [new OpenLayers.Strategy.Fixed()
	,filterStrategy_stab_exseveso
	],
	projection: OL_32632,
	protocol: new OpenLayers.Protocol.WFS({
		url: url_tinyows, featureType: "v_stabrir_webgis_334",
		featureNS: "http://www.tinyows.org/",
		readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_32632,
                        'externalProjection': OL_32632
                })
	})
});
stabrirC.setVisibility(false);

var store_stabrirC = new GeoExt.data.FeatureStore({
	fields: [
		{name: "id_stabilimento", type: "integer"},
		"nome_stabilimento", {name: "comboDisplay", type: "string", mapping:"nome_stabilimento"},
		{name: "indirizzo", type: "string"},
		{name: "comune", type: "string"},
                {name: "sigla_pro", type: "string"},
		{name: "adempimento_label_s", type: "string"},
		{name: "attivita_label_s", type: "string"}
	],
	layer: stabrirC
});
store_stabrirC.on('load', function(store){
	store.sort('nome_stabilimento', 'ASC');
});
store_stabrir = new GeoExt.data.FeatureStore({
	fields: [
		{name: "id_stabilimento", type: "integer"},
		"nome_stabilimento", {name: "comboDisplay", type: "string", mapping:"nome_stabilimento"},
		{name: "indirizzo", type: "string"},
		{name: "comune", type: "string"},
                {name: "sigla_pro", type: "string"},
		{name: "adempimento_label_s", type: "string"},
		{name: "attivita_label_s", type: "string"}
	],
	layer: stabrir
	//,autoLoad: true
});
store_stabrir.on('load', function(store){
	store.sort('nome_stabilimento', 'ASC');
});
var columns_stabrir = new Ext.grid.ColumnModel({
	defaults: {
		sortable: true
	},
	columns: [
		{header: "Id", dataIndex: "id_stabilimento", width: 20},
		{header: "Nome stabilimento", dataIndex: "nome_stabilimento", width: 100},
		{header: "Indirizzo", dataIndex: "indirizzo", width: 100},
		{header: "Comune", dataIndex: "comune", width: 80},
		{header: "Sigla_pro", dataIndex: "sigla_pro", width: 25},
		{header: "Attivita'", dataIndex: "attivita_label_s", width: 80},
		{header: "Natura adempimento", dataIndex: "adempimento_label_s", width: 80}
	]
});

//Proviamo ad USARE SLD VECTOR STYLE creato da QGIS - FUNZIONA! non gestisce pero' le label...
/*
var style_stabrir2 = new OpenLayers.Rule({symbolizer: {label: "${nome_azienda}", fontWeight: "bold", fontFamily: "sans-serif"}});
var stabrir2 = new OpenLayers.Layer.Vector(default_layer_name, {
	//styleMap: styleMap_stabrir,
	strategies: [new OpenLayers.Strategy.Fixed()
	//,filterStrategy_natB
	],
	protocol: new OpenLayers.Protocol.WFS({
		url: urlMS_datidibase, featureType: "stabilimenti_rir",
		featureNS: "http://mapserver.gis.umn.edu/mapserver",
		geometryName: "the_geom", srsName: "epsg:32632"
	})
});
var format = new OpenLayers.Format.SLD();
OpenLayers.Request.GET({
	url: "/common/tematismi/prova_sld_v100.sld",
	success: sldparser
});
function sldparser(req) {
	sld = format.read(req.responseXML || req.responseText);
	//styles_rir = sld.namedLayers.interpreted.userStyles[0];
	styles_rir = sld.namedLayers["stabilimenti_rir"].userStyles[0];
	styles_rir.addRules([style_stabrir2]);
	stabrir2.styleMap.styles.default = styles_rir;
}
*/


