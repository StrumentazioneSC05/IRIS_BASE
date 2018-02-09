/*BACINI_LITE*/
var style_bacini_lite = new OpenLayers.Style({
        title: "Bacini", strokeColor: "black", strokeWidth: 0.8, strokeOpacity: 0.5, fillColor: "#EDE2E2", fillOpacity: 0.3
});
var styleMap_bacini_lite = new OpenLayers.StyleMap({"default": style_bacini_lite});
var bacini_lite = new OpenLayers.Layer.Vector("Bacini Defense (lite)", {
        styleMap: styleMap_bacini_lite,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_spatialite, featureType: "bacini_lite",
                version: "1.1.0",
                featureNS: "http://mapserver.gis.umn.edu/mapserver"
                ,geometryName: "GEOMETRY"
		,srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
bacini_lite.setVisibility(false);
store_bacini_lite = new GeoExt.data.FeatureStore({
        fields: [
                {name: "id_bacino", type: "integer"},
                {name: "nome", type: "string"},
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
        layer: bacini_lite
});
//store_bacini_lite.on('load', function(store){
//      store.sort('nome', 'ASC');
//});
var columns_bacini_lite = new Ext.grid.ColumnModel({
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

