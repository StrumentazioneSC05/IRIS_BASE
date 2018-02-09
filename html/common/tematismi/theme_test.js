/*
 * qui metto quei layer in fase di sviluppo attivo o morto ma da cui posso prendere spunto per sviluppi futuri
*/


/*STORM-TEMPORALI punti*/
var style_storm = new OpenLayers.Style();
var vilLow = new OpenLayers.Rule({
        title: "Green: si < 3",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "si", value: 3
        }),
        symbolizer: {fillColor: "green"}
});
var vilMedium = new OpenLayers.Rule({
        title: "Orange: si = 3-4",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "si", lowerBoundary: 3, upperBoundary: 4
        }),
        symbolizer: {fillColor: "orange"}
});
var vilHigh = new OpenLayers.Rule({
        title: "Red: si > 4",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                property: "si", value: 4
        }),
        symbolizer: {fillColor: "red"}
});
var areaLow = new OpenLayers.Rule({
        title: "area < 5 km2",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.LESS_THAN,
                property: "area", value: 5
        }),
        symbolizer: {pointRadius: 4, fillOpacity: 0.5, strokeColor: "black", strokeWidth: 1}
});
var areaMedium = new OpenLayers.Rule({
        title: "area = 5-20 km2",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "area", lowerBoundary: 5, upperBoundary: 20
        }),
        symbolizer: {pointRadius: 6, fillOpacity: 0.5, strokeColor: "black", strokeWidth: 1}
});
var areaHigh = new OpenLayers.Rule({
        title: "area > 20 km2",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                property: "area", value: 20
        }),
        symbolizer: {pointRadius: 8, fillOpacity: 0.5, strokeColor: "black", strokeWidth: 1}
});
style_storm.addRules([areaLow, areaMedium, areaHigh, vilLow, vilMedium, vilHigh]);
var styleMap_storm = new OpenLayers.StyleMap({
        "default": style_storm,
        "select": new OpenLayers.Style({pointRadius: 12, fillColor: "blue", fillOpacity: 0.8})
});

var storm = new OpenLayers.Layer.Vector(temporali00c, {
        styleMap: styleMap_storm,
    strategies: [new OpenLayers.Strategy.Fixed(),
        new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ],
    protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime, version: "1.1.0", featureType: "storm3h",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometry: "msGeometry", srsName: "epsg:23032"
    })
});
storm.setVisibility(false);


/*RAIN_SHP WFS - test x select raster info */
var style_rain_ist = new OpenLayers.Style();
var rain_istLow = new OpenLayers.Rule({
        title: "dn < 5 km2",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "dn", lowerBoundary: 0, upperBoundary: 5
        }),
    symbolizer: {fillColor: "cyan", fillOpacity: 0, strokeColor: "cyan", strokeOpacity: 0}
});
var rain_istMedium = new OpenLayers.Rule({
        title: "dn = 5-20 km2",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.BETWEEN,
                property: "dn", lowerBoundary: 5, upperBoundary: 13
        }),
        symbolizer: {fillColor: "yellow", fillOpacity: 0, strokeColor: "yellow", strokeOpacity: 0}
});
var rain_istHigh = new OpenLayers.Rule({
        title: "dn > 20 km2",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
                property: "dn", value: 13
        }),
        symbolizer: {fillColor: "red", fillOpacity: 0, strokeOpacity: 0}
});
var rain_istAll = new OpenLayers.Rule({
        title: "pioggia istantanea",
    symbolizer: {fillOpacity: 0, strokeOpacity: 0}
});
style_rain_ist.addRules([rain_istAll]);
var styleMap_rain_ist = new OpenLayers.StyleMap({
        "default": style_rain_ist
});
var rain_shp = new OpenLayers.Layer.Vector(temporali06, {
        styleMap: styleMap_rain_ist,
    strategies: [new OpenLayers.Strategy.BBOX()
        ],
    protocol: new OpenLayers.Protocol.WFS({
        url: urlMS_realtime, version: "1.1.0", featureType: "rain_shp",
        featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometry: "msGeometry", srsName: "epsg:900913"
    })
});
rain_shp.setVisibility(false);

