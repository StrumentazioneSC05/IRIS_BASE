/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


//var urlMS_sismi = "http://10.127.141.36/cgi-bin/mapserv?MAP=/var/www/html/sviluppo/meteo/sismi900913.map";
var urlMS_sismi = root_dir_html + "/cgi-bin/mapserv?MAP=/var/www/html/common/mapfiles/map900913.map";
//var urlMS_sismi = "/cgi-bin/mapserv.exe?MAP=C:/Program Files/OSGeo/MapGuide/Web/www/meteo/sismi_wfs.map";

var now = new Date();
var currentTimeUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
var filterStrategylastLow, filterStrategylastMedium, filterStrategylastHigh;
var filterStrategyLow, filterStrategyMedium, filterStrategyHigh;


/////////////
//Try add WFS:
/*SISMI LAST 15gg*/


// Poi vorrei creare dei sismi su 3 livelli, e definisco una filterStrategy:
var todayfull = get_dateString(currentTimeUTC); //nella forma .yyyymmddhhmmss.
//A te serve .endString. per i sismi nella forma "yyyy-mm-dd":
var todayshort = todayfull.substring(0,8); //yyyymmdd
//var endString = todayshort.slice(0, 4) + "-" + todayshort.slice(4,6) + "-" + todayshort.slice(6); //per il filterStrategy sui sismi

//Per prendere una settimana:
var oneweek = currentTimeUTC;
oneweek.setDate(oneweek.getDate() - 7);
var oneweek_str = get_dateString(oneweek);
//Anche qui, ti serve .endString. per i sismi nella forma "yyyy-mm-dd":
var oneweek_short = oneweek_str.substring(0,8); //yyyymmdd
var endString = oneweek_short.slice(0, 4) + "-" + oneweek_short.slice(4,6) + "-" + oneweek_short.slice(6); //per il filterStrategy sui sismi

var filterM1 = new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.BETWEEN,
    property: "magnitudo",
    lowerBoundary: 2,
    upperBoundary: 4
});
/*
var filterM2 = new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.BETWEEN,
    property: "magnitudo",
    lowerBoundary: 3.7,
    upperBoundary: 5
});
*/
var filterM3 = new OpenLayers.Filter.Comparison({
    type: OpenLayers.Filter.Comparison.GREATER_THAN,
    property: "magnitudo",
    value: 4
});

var filter_lastLow = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.AND,
	filters: [
		new OpenLayers.Filter.Comparison({
		//type: OpenLayers.Filter.Comparison.EQUAL_TO,
		type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
		property: "data_origine", value: endString
		}),
		filterM1
		]
});
filterStrategylastLow = new OpenLayers.Strategy.Filter({filter: filter_lastLow});
/*
var filter_lastMedium = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.AND,
	filters: [
		new OpenLayers.Filter.Comparison({
		type: OpenLayers.Filter.Comparison.EQUAL_TO,
		property: "data_origine", value: endString
		}),
		filterM2
		]
});
filterStrategylastMedium = new OpenLayers.Strategy.Filter({filter: filter_lastMedium});
*/
var filter_lastHigh = new OpenLayers.Filter.Logical({
	type: OpenLayers.Filter.Logical.AND,
	filters: [
		new OpenLayers.Filter.Comparison({
		//type: OpenLayers.Filter.Comparison.EQUAL_TO,
		type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
		property: "data_origine", value: endString
		}),
		filterM3
		]
});
filterStrategylastHigh = new OpenLayers.Strategy.Filter({filter: filter_lastHigh});

//Recupero i sismi di oltre una settimana:
var filter_15Low = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "data_origine", value: endString
                }),
                filterM1
                ]
});
filterStrategy15Low = new OpenLayers.Strategy.Filter({filter: filter_15Low});
var filter_15High = new OpenLayers.Filter.Logical({
        type: OpenLayers.Filter.Logical.AND,
        filters: [
                new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "data_origine", value: endString
                }),
                filterM3
                ]
});
filterStrategy15High = new OpenLayers.Strategy.Filter({filter: filter_15High});

var style_M1 = new OpenLayers.Style();
var style_M2 = new OpenLayers.Style();
var style_M3 = new OpenLayers.Style();

var M1_rule = new OpenLayers.Rule({
	title: "",
	symbolizer: {graphicName: "circle", fillColor: "cyan", fillOpacity: 0.7, pointRadius: 6, strokeWidth: 0.8, strokeColor: "black"}	
});
style_M1.addRules([M1_rule]);
var styleMap_M1 = new OpenLayers.StyleMap({
	"default": style_M1,
	"select": {"pointRadius": 15, fillColor: "blue"}
});

var M2_rule = new OpenLayers.Rule({
        title: "",
        symbolizer: {graphicName: "circle", fillColor: "orange", fillOpacity: 0.7, pointRadius: 10, strokeWidth: 0.8, strokeColor: "black"}    
});
style_M2.addRules([M2_rule]);
var styleMap_M2 = new OpenLayers.StyleMap({
        "default": style_M2,
        "select": {"pointRadius": 15, fillColor: "blue"}
});

var M3_rule = new OpenLayers.Rule({
        title: "",
        symbolizer: {graphicName: "circle", fillColor: "red", fillOpacity: 0.7, pointRadius: 14, strokeWidth: 0.8, strokeColor: "black"} 
});
style_M3.addRules([M3_rule]);
var styleMap_M3 = new OpenLayers.StyleMap({
        "default": style_M3,
        "select": {"pointRadius": 15, fillColor: "blue"}
});

filterStrategyLow = new OpenLayers.Strategy.Filter({filter: filterM1});
//filterStrategyMedium = new OpenLayers.Strategy.Filter({filter: filterM2});
filterStrategyHigh = new OpenLayers.Strategy.Filter({filter: filterM3});

var sismi_lastLow = new OpenLayers.Layer.Vector("Sismi 7gg M=2-4", {
        styleMap: styleMap_M1,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,filterStrategylastLow
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                //version: "1.1.0",
                featureType: "sism_last15", featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});
/*
var sismi_lastMedium = new OpenLayers.Layer.Vector("Sismi oggi M=3.7-5", {
        styleMap: styleMap_M2,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,filterStrategylastMedium
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                //version: "1.1.0",
                featureType: "sism_last15", featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});
*/
var sismi_lastHigh = new OpenLayers.Layer.Vector("Sismi 7gg M>4", {
        styleMap: styleMap_M3,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,filterStrategylastHigh
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                //version: "1.1.0",
                featureType: "sism_last15", featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});

var sismiLow = new OpenLayers.Layer.Vector("Sismi 15gg M=2-4", {
        styleMap: styleMap_M1,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,filterStrategy15Low
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                //version: "1.1.0",
                featureType: "sism_last15", featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});
/*
var sismiMedium = new OpenLayers.Layer.Vector("Sismi 15gg M=3.7-5", {
        styleMap: styleMap_M2,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,filterStrategyMedium
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                //version: "1.1.0",
                featureType: "sism_last15", featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});
*/
var sismiHigh = new OpenLayers.Layer.Vector("Sismi 15gg M>4", {
        styleMap: styleMap_M3,
        strategies: [new OpenLayers.Strategy.Fixed()
                ,filterStrategy15High
        ],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_sismi,
                //version: "1.1.0",
                featureType: "sism_last15", featureNS: "http://mapserver.gis.umn.edu/mapserver"
                //extractAttributes: true, extractStyles: true, geometry: "msGeometry", srsName: "epsg:32632"
        })
});

sismiLow.setVisibility(false);
//sismiMedium.setVisibility(false);
sismiHigh.setVisibility(false);


//Da mettere dentro sismi per la popup, butto fuori perche' tanto al momento nn funziona e mi allunga solo il codice:
/*
, eventListeners:{
                'featureselected':function(evt){
                        var feature = evt.feature;
                        //var popup = new OpenLayers.Popup.FramedCloud("popup",
                        var popup = new OpenLayers.Popup("popup",
                        OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                        null,
                        "<div style='font-size:.8em'>Feature: "
                                //+ feature.id +"<br>Foo: " + feature.attributes.foo+"</div>",
                        , null
                        , true
                );
                feature.popup = popup;
                map.addPopup(popup);
            },
            'featureunselected':function(evt){
                var feature = evt.feature;
                map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
        }
*/
