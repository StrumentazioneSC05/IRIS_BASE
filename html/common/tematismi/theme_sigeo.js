/*
 * author: Armando Riccardo Gaeta
 * email: ar_gaeta@yahoo.it
 * 
*/


///////////////// DEFINIZIONE WFS VECTOR LAYER //////////////////////

/*RETE INCLINOMETRICA */
var style_rete_incl = new OpenLayers.Style({
        label: "${sist_descrlocalita}\n\n${cod_stru}", labelAlign: "cm", fontWeight: "bold", fontFamily: "sans-serif"
        }, {
        rules: [
	new OpenLayers.Rule({
        title: "Attiva",
	filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "attivo", value: "S"
        }),
	symbolizer: {graphicName: "circle", fillColor: "#ee9900", fillOpacity: 0.5, strokeColor:"black", pointRadius: 5}
	}),
	new OpenLayers.Rule({
        title: "Non attiva",
        filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "attivo", value: "N"
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
var styleMap_rete_incl = new OpenLayers.StyleMap({
	"default": style_rete_incl,
	"select": new OpenLayers.Style({pointRadius: 8, fillColor: "blue", fillOpacity: 0.8})
	,"temporary": new OpenLayers.Style({pointRadius: 8, fontSize: 13, cursor: "pointer"})
});	

var rete_incli_tiny = new OpenLayers.Layer.Vector(default_layer_name, {
	styleMap: styleMap_rete_incl,
	strategies: [new OpenLayers.Strategy.Fixed()
	],
	projection: OL_32632,
	protocol: new OpenLayers.Protocol.WFS({
	    url: url_tinyows_sigeo,
	    featureType: "v_incli_fisso",
	    featureNS: "http://www.tinyows.org/"
	    ,readFormat: new OpenLayers.Format.GML({
		'internalProjection': OL_32632,
		'externalProjection': OL_32632
	    })
	})
});
rete_incli_tiny.setVisibility(false);

