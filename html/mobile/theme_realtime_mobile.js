/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


var refresh_test;

var today = new Date();
var today_UTC =  new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),  today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds());
var last3h = new Date(today_UTC.getTime() - 10800000); //recupero 3 ore fa
var last15min = new Date(today_UTC.getTime()); //recupero l'ultimo disponibile

var urlMS_realtime = root_dir_html + "/cgi-bin/mapserv?MAP=/var/www/html/common/mapfiles/map900913.map";
var urlMS_raster = root_dir_html + "/cgi-bin/mapserv?MAP=/var/www/html/mobile/raster.map";


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////

/*STORM-TEMPORALI punti*/

	
/*ELLIPSE-TEMPORALI ellissi*/


/*FORECAST ENVELOPE*/


/*FULMINI*/
OpenLayers.Renderer.symbol.cross2 = [4,0, 5,0, 5,4, 9,4, 9,5, 5,5, 5,9, 4,9, 4,5, 0,5, 0,4, 4,4, 4,0];
var style_fulmini_default = new OpenLayers.Style();
var fulmini_default_rule = new OpenLayers.Rule({
        title: "Fulmini ultime 3h",
                symbolizer: {pointRadius: 8, graphicName: "cross2", fillColor: "#ee0099", fillOpacity: 0.5, strokeColor:"black", rotation: 45, strokeWidth: 0.4}
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
});
style_fulmini_default.addRules([ccfulmini_rule, cgfulmini_rule]);
style_fulmini_select.addRules([fulmini_select_rule]);
var styleMap_fulmini = new OpenLayers.StyleMap({
        "default": style_fulmini_default,
        "select": style_fulmini_select
});
var fulmini = new OpenLayers.Layer.Vector(temporali02, {
        styleMap: styleMap_fulmini,
        strategies: [new OpenLayers.Strategy.Fixed()],
        projection: new OpenLayers.Projection("epsg:4326"),
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureType: "g_fulmini_3ore",
                featureNS: "http://10.102.7.210"
                ,readFormat: new OpenLayers.Format.GML({
                        'internalProjection': new OpenLayers.Projection("epsg:4326"),
                        'externalProjection': new OpenLayers.Projection("epsg:4326")
                })
        })
});
fulmini.setVisibility(false);


/*PATH temporali*/


/*BACINI 15GG in realta LAST*/


/*COMUNI LAST*/
var style_comuni_last = new OpenLayers.Style();
var comuni_val2 = new OpenLayers.Rule({
        title: "classe 2",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "valore", value: 2
        }),
	symbolizer: {strokeColor: "black", strokeWidth: 1, fillColor: "orange", fillOpacity: 0.5
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
var styleMap_comuni_last = new OpenLayers.StyleMap({"default": style_comuni_last});
var comuni_last = new OpenLayers.Layer.Vector("Warning comuni:superamento ultimo giorno", {
        styleMap: styleMap_comuni_last,
        strategies: [new OpenLayers.Strategy.Fixed()
	],
	protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime,
		//version: "1.1.0",
		featureType: "comuni_last",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometry: "msGeometry", srsName: "epsg:32632"
                //extractAttributes: true, //extractStyles: true,
        })
});
comuni_last.setVisibility(false);


/*TEMPERATURE*/
//Provo tematizzazione con CLUSTER e cerchi colorati:
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
        if (map.getScale() > 500000 && map.getScale() < 2500000) return 12;
        else if (map.getScale() > 2500000) return 4;
        else return 16;
    }
    ,getWidth: function(feature) {
        return (feature.cluster) ? 1.5 : 0.5; //se l'elemento e' clusterzizato il suo bordo e' piu' spesso
    }
    //per gestire il colore del cerchio contenente la label visto che Rules e Context non vanno d'accordo:
    ,getFillColor: function(feature) {
        if (map.getScale() > 2500000) return colors.neutral;
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
        if (map.getScale() > 2500000) return colors.neutral;
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
var temperatura_tiny = new OpenLayers.Layer.Vector(rete07, {
        styleMap: styleMap_temp_clust,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.BBOX()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            //,filterStrategy_temp
            ,clust_temp
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                //version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom",
                url: url_tinyows,
                featureNS: "http://10.102.7.210",
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


/*NEVE - dai dati interreg*/
var filter_rupar = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: "flag_rupar",
        value: 'S'
});
OpenLayers.Renderer.symbol.rectangle1 = [0, -50, 45, -50, 45, 50, 0, 50, 0, -50];
var style_neve = new OpenLayers.Style({
	//fill: 0, stroke: 0,
        label: " ${ultimovalore}\n${neve0suolo}\n${neve0fresca}", fontWeight: "bold", labelAlign: "cm", fontSize: "12px", fontColor: 'blue'
        }, {
        rules: [
		new OpenLayers.Rule({
        	title: " ",
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
var styleMap_neve = new OpenLayers.StyleMap({"default": style_neve});
var filterStrategy_neve = new OpenLayers.Strategy.Filter({filter: filter_rupar});
var neve_tiny = new OpenLayers.Layer.Vector(rete10, {
        styleMap: styleMap_neve,
        //minScale: 250000,
        strategies: [new OpenLayers.Strategy.BBOX()
        //,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
        ,filterStrategy_neve
        ],
        projection: new OpenLayers.Projection("epsg:23032"),
        protocol: new OpenLayers.Protocol.WFS({
		//version: "1.1.0", srsName: "epsg:23032", geometryName: "the_geom",
		url: url_tinyows,
		featureNS: "http://10.102.7.210",
		featureType: "v_neve_interreg",
		//featurePrefix: "tows",
                readFormat: new OpenLayers.Format.GML({
			'internalProjection': new OpenLayers.Projection("epsg:23032"),
			'externalProjection': new OpenLayers.Projection("epsg:23032")
                })
        })
});
neve_tiny.setVisibility(false);


/* NEVE ULTIMO DATO */
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
var nivo_tiny = new OpenLayers.Layer.Vector(rete10, {
        styleMap: styleMap_nivo_clust,
        strategies: [new OpenLayers.Strategy.Fixed()
            ,new OpenLayers.Strategy.Refresh({force: true, interval:150000})
            ,clust_nivo
        ],
        projection: OL_23032,
        protocol: new OpenLayers.Protocol.WFS({
                url: url_tinyows,
                featureNS: "http://www.tinyows.org/",
                featureType: "v_neve" //nuova logica dati da meteo_real_time
                ,srsName: "epsg:23032"
                ,geometryName: "the_geom"
        })
});
nivo_tiny.setVisibility(false);


/* DATI VENTO - simboli */
var styleMap_datistaz = new OpenLayers.StyleMap({
//"default": style_vento_graphicname
"default": style_vento_svg
,"select": new OpenLayers.Style({fontSize: 19, pointRadius: 23, fillColor: "blue", fillOpacity: 0.8})
,"temporary": new OpenLayers.Style({pointRadius: 23, cursor: "pointer"})
});
var filter_rupar = new OpenLayers.Filter.Comparison({
        type: OpenLayers.Filter.Comparison.EQUAL_TO,
        property: "flag_rupar",
        value: 'S'
});
var filterStrategy_temp = new OpenLayers.Strategy.Filter({filter: filter_rupar});
var datistazioni_tiny = new OpenLayers.Layer.Vector(rete08, {
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

/*AREE ALLERTAMENTO*/
var style_zoneall = new OpenLayers.Style();
var ordinaria = new OpenLayers.Rule({
        title: "Situazione Ordinaria",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_allertamento", value: "0"
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "#EDE2E2", fillOpacity: 0.2
                , label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
var criticita = new OpenLayers.Rule({
        title: "Ordinaria Criticita",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_allertamento", value: "1"
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "#ffff99", fillOpacity: 0.4
                , label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
var codice2 = new OpenLayers.Rule({
        title: "Codice 2",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_allertamento", value: "2"
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "orange", fillOpacity: 0.4
                , label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
var codice3 = new OpenLayers.Rule({
        title: "Codice 3",
    filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "stato_allertamento", value: "3"
        }),
        symbolizer: {strokeColor: "black", strokeWidth: 2, strokeOpacity: 1, fillColor: "red", fillOpacity: 0.4
                , label: "${cod_area}", labelAlign: "cm", fontSize: "11px", fontColor: 'black', fontWeight: "bold", fontFamily: 'Arial'}
});
style_zoneall.addRules([ordinaria, criticita, codice2, codice3]);
var styleMap_zoneall = new OpenLayers.StyleMap({"default": style_zoneall});
var zoneall = new OpenLayers.Layer.Vector(suolo05, {
        styleMap: styleMap_zoneall,
        //strategies: [new OpenLayers.Strategy.BBOX()],
        strategies: [new OpenLayers.Strategy.Fixed()],
        protocol: new OpenLayers.Protocol.WFS({
                url: urlMS_realtime, featureType: "aree_allertamento",
                //version: "1.1.0",
                featureNS: "http://mapserver.gis.umn.edu/mapserver",
                geometryName: "the_geom", srsName: "epsg:23032"
                //extractAttributes: true, //extractStyles: true, //geometry: "msGeometry",
        })
});
zoneall.setVisibility(false);

