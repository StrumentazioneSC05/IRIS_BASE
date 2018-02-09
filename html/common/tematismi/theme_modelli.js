/*
 * ** author: Armando Riccardo Gaeta
 * ** email: ar_gaeta@yahoo.it
 * */


//La classe OpenLayers.Strategy.AttributeCluster la definisco in js_funcion.js


/*VENTI DA MODELLO PREVISIONALE*/

//Per ruotare il simbolo provo ad usare 'context':
var context = {
	getRotation: function(feature){
		if (feature.cluster) {
			//Se il cluster non e' per attributi:
			var somma = 0;
			for (var i = 0; i < feature.cluster.length; i++) {
				somma = somma + parseInt(feature.cluster[i].attributes.dir_class);
			} //for
			var symbolo;
			var avg_direction = somma/(i-1);
			if (avg_direction > 360) symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg";
			else symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg";
			return avg_direction;
			//Se il cluster e' per attributi allora:
			//return feature.cluster[0].attributes.dir_class;
		}
		else {
			//Se il cluster non e' per attributi:
			if (feature.attributes.dir_class > 360) symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg";
			else symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg";
			return avg_direction;
			//Se il cluster e' per attributi allora:
			//return feature.attributes.dir_class;
		}
	}
	, getSymbol: function(feature){
	if (feature.cluster) {
		//Se il cluster non e' per attributi:
		var somma = 0;
                for (var i = 0; i < feature.cluster.length; i++) {
                        somma = somma + parseInt(feature.cluster[i].attributes.dir_class);
                } //for
                var symbolo;
                var avg_direction = somma/(i-1);
                if (avg_direction > 360) symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg";
                else symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg";
                return symbolo;
		
		//Se il cluster e' per attributi allora:
		//if (feature.cluster[0].attributes.dir_class == 999) return "/common/icons/wind_symbols/Symbol_wind_speed_00b.svg";
		//else return "/common/icons/wind_symbols/Symbol_wind_speed_01.svg";
	}
	else {
		//Se il cluster non e' per attributi:
                if (feature.attributes.dir_class > 360) symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg";
                else symbolo = root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg";
                return symbolo;

		//Se il cluster e' per attributi allora:
		//if (feature.attributes.dir_class == 999) return "/common/icons/wind_symbols/Symbol_wind_speed_00b.svg";
                //else return "/common/icons/wind_symbols/Symbol_wind_speed_01.svg";
	}
	}
};

var style_vento = new OpenLayers.Style({
        strokeColor: "#ff9933", strokeWidth: 2
        ,externalGraphic: "${getSymbol}", rotation: "${getRotation}"
	,graphicWidth: 40
        }
/*
, {
        rules: [
	new OpenLayers.Rule({
                title: "<img src='/common/icons/wind_symbols/Symbol_wind_speed_00b.svg' height='24'>0 m/s",
		context: context,
		elseFilter: true,
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "dir_class", value: '999'
                }),
                symbolizer: {
                        externalGraphic: "/common/icons/wind_symbols/Symbol_wind_speed_00b.svg", graphicWidth: 40
                }
        }, {context: context}
	)
]}
*/
, {context: context}
);

var styleMap_vento = new OpenLayers.StyleMap(style_vento);

var clust_strategy = new OpenLayers.Strategy.Cluster({
	distance: 100
});
var clust_strategy_attr = new OpenLayers.Strategy.AttributeCluster({
    distance: 100
    ,attribute:'dir_class'
});
var vento = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_vento,
        //strategies: [new OpenLayers.Strategy.Fixed(),
        strategies: [new OpenLayers.Strategy.BBOX()
        ,clust_strategy
        ],
        //projection: new OpenLayers.Projection("epsg:900913"),
        projection: OL_3857,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "v_vento_100",
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_3857,
                        'externalProjection': OL_3857
                })
        })
});
vento.setVisibility(false);


/* altimetria a 700hPa da modello*/
var style_hg700 = new OpenLayers.Style();
var hg700_Low = new OpenLayers.Rule({
        title: "cosmoi7_2014030400_021_hgt700",
        symbolizer: {strokeColor: "red", strokeWidth: 2
	,label: "${cntr_value}", fontColor: 'black', fontSize: "12px", fontWeight: "bold", labelOutlineColor: "black", labelOutlineWidth: 0.6
	}
});
style_hg700.addRules([hg700_Low]);
var styleMap_hg700 = new OpenLayers.StyleMap({
        "default": style_hg700
});
//Aggiungo un filtro in modo tala da poter animare questo layer:
var filterGeop = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: "dataora",
        value: '2016080608'
});
var filterStrategyGeop = new OpenLayers.Strategy.Filter({filter: filterGeop});
var hg700 = new OpenLayers.Layer.Vector(default_layer_name, {
        styleMap: styleMap_hg700,
        strategies: [new OpenLayers.Strategy.BBOX(), filterStrategyGeop],
	projection: OL_3857,
        protocol: new OpenLayers.Protocol.WFS({
		url: url_tinyows,
                //featureType: "cosmoi7_2014030400_021_hgt700_simpl",
		//featureType: "cosmoi7_gp700_2016080500_01h17_simpl",
		featureType: "cosmoi7_gp700_100m_simpl",
                featureNS: "http://www.tinyows.org/"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': OL_3857,
                        'externalProjection': OL_3857
                })
        })
});
hg700.setVisibility(false);

