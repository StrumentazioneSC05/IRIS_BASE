//restituisce numeri interi:
function label_scaled(value, suffisso) {
    if (!value || value==-99) return ""; //per gestire i dati senza valori
    else if (map.getScale() > 500000 && map.getScale() < 2500000) return Math.round(value);
    else if (map.getScale() > 2500000) return "";
    else return Math.round(value)+suffisso;
};
//per avere anche i decimali:
function label_scaled_pluv(value,suffisso) {
    if (!value || value==-99) return ""; //per gestire i dati senza valori
    else if (map.getScale() > 500000 && map.getScale() < 2500000) return value;
    else if (map.getScale() > 2500000) return "";
    else return value+suffisso;
};
var colors = {
    s_low: "#0080FF", //blue
    m_low: "#45A2B9", //verde-blu
    low: "#73B98B", //green
    s_middle: "#B9DC45", //verdino
    m_middle: "#FFE700", //yellow
    middle: "#FFD000", //giallo-arancio
    high: "#FF9700", //orange
    m_high: "#FF4000", //arancio-rosso
    s_high: "#FF0000", //red
    neutral: "#738B8B", //colore neutrale azzurro sporco
    nodata: "#D3D3D3" //light-gray
};
var colors_nivo = {
    low: '#DAA520', //goldenrod
    middle: '#B0C4DE', //lightsteelblue
    high: '#6495ED' //cornflowerblue
};
var colors_pluv = {
    s_low: "#00beff", //blue
    low: "#00b400", //verde
    middle: "#FFD000", //giallo-arancio
    high: "#b42db4", //purple
    nodata: "#D3D3D3", //light-gray
    neutral: "#c7c7fd" //azzurro-sporco
};
function give_color(value, layer_name) {
    //Per le temperature:
    if (layer_name=='temp') {
        if (value==="") return colors.nodata;
        else if (value<-5) return colors.s_low;
        else if (value>=-5 && value<=0) return colors.m_low;
        else if (value>0 && value<5) return colors.low;
        else if (value>=5 && value<10) return colors.s_middle;
        else if (value>=10 && value<15) return colors.m_middle;
        else if (value>=15 && value<20) return colors.middle;
        else if (value>=20 && value<25) return colors.high;
        else if (value>=25 && value<30) return colors.m_high;
        else if (value>=30) return colors.s_high;
        else return colors.nodata;
    }
    //Per i dati nivo dalle 8:
    else if (layer_name=='nivo') {
        if (value<0) return colors_nivo.low;
        else if (value>=0 && value<=20) return colors_nivo.middle;
        else if (value>20) return colors_nivo.high;
    }
    else if (layer_name=='pluv') {
        if (value==="") return colors_pluv.nodata;
        else if (value>=0 && value<5) return colors_pluv.neutral;
        else if (value>=5 && value<=50) return colors_pluv.low;
        else if (value>=50 && value<=120) return colors_pluv.middle;
        else if (value>120) return colors_pluv.high;
        else return colors_pluv.nodata;
    }
};

//Provo a creare dei simboli per il vento:
OpenLayers.Renderer.symbol.wind00 = [0,1, 1,0, 2,0, 3,1, 3,2, 2,3, 1,3, 0,2, 0,1];
OpenLayers.Renderer.symbol.wind01 = [0,0 ,1,0 ,1,3 ,4,3 ,4,4 ,1,4 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind02 = [0,0 ,6,0 ,6,1 ,1,1 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind03 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,4,3 ,4,4 ,1,4 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind04 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,6,3 ,6,4 ,1,4 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind05 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,6,3 ,6,4 ,1,4 ,1,6 ,4,6 ,4,7 ,1,7 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind06 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,6,3 ,6,4 ,1,4 ,1,6 ,6,6 ,6,7 ,1,7 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind07 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,6,3 ,6,4 ,1,4 ,1,6 ,6,6 ,6,7 ,1,7 ,1,9 ,4,9 ,4,10 ,1,10 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind08 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,6,3 ,6,4 ,1,4 ,1,6 ,6,6 ,6,7 ,1,7 ,1,9 ,6,9 ,6,10 ,1,10 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind09 = [0,0 ,6,0 ,6,1 ,1,1 ,1,3 ,6,3 ,6,4 ,1,4 ,1,6 ,6,6 ,6,7 ,1,7 ,1,9 ,6,9 ,6,10 ,1,10 ,1,12 ,4,12 ,4,13 ,1,13 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind10 = [0,0 ,1,0 ,5,2 ,1,4 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind11 = [0,0 ,1,0 ,5,2 ,1,4 ,1,6 ,4,6 ,4,7 ,1,7 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind12 = [0,0 ,1,0 ,5,2 ,1,4 ,1,6 ,6,6 ,6,7 ,1,7 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind13 = [0,0 ,1,0 ,5,2 ,1,4 ,1,6 ,6,6 ,6,7 ,1,7 ,1,9 ,4,9 ,4,10 ,1,10 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind14 = [0,0 ,1,0 ,5,2 ,1,4 ,1,5 ,1,6 ,5,7 ,1,9 ,1,15 ,0,15 ,0,0];
OpenLayers.Renderer.symbol.wind15 = [0,0 ,1,0 ,5,2 ,1,4 ,1,5 ,1,6 ,5,7 ,1,9 ,1,11 ,4,11 ,4,12 ,1,12 ,1,15 ,0,15 ,0,0];

//Simbolizzo il vento usando i simboli prima definiti:
var style_vento_graphicname = new OpenLayers.Style({
        //fillColor: "#ffcc66", strokeColor: "#ff9933", strokeWidth: 2
        //graphicName: "wind01", pointRadius: 40, strokeColor: "black", strokeWidth: 2, fillColor: "red"
        //title: "${denominazione}", //se lo metto sbarella la posizione del simbolo bah
        strokeColor: "black", strokeWidth: 1, fillColor: "teal", fillOpacity: 0.8, rotation: "${dirultimo}"
        }
        , {
        rules: [
        new OpenLayers.Rule({
                title: "35.0-37.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 37.5
                }),
                symbolizer: {
                        graphicName: "wind15", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "32.5-35.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 35.0
                }),
                symbolizer: {
                        graphicName: "wind14", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "30.0-32.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 32.5
                }),
                symbolizer: {
                        graphicName: "wind13", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "27.5-30.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 30.0
                }),
                symbolizer: {
                        graphicName: "wind12", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "25.0-27.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 27.5
                }),
                symbolizer: {
                        graphicName: "wind11", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "22.5-25.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 25.0
                }),
                symbolizer: {
                        graphicName: "wind10", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "20.0-22.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 22.5
                }),
                symbolizer: {
                        graphicName: "wind09", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "17.5-20.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 20.0
                }),
                symbolizer: {
                        graphicName: "wind08", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "15.0-17.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 17.5
                }),
                symbolizer: {
                        graphicName: "wind07", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "12.5-15.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 15.0
                }),
                symbolizer: {
                        graphicName: "wind06", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "10.0-12.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 12.5
                }),
                symbolizer: {
                        graphicName: "wind05", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "7.5-10.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 10
                }),
                symbolizer: {
                        graphicName: "wind04", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "5.0-7.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 7.5
                }),
                symbolizer: {
                        graphicName: "wind03", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "2.5-5.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 5
                }),
                symbolizer: {
                        graphicName: "wind02", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "0.3-2.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 2.5
                }),
                symbolizer: {
                        graphicName: "wind01", pointRadius: 8
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg' height='24'>0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 0.3
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/no_data_wind.svg' height='24'>no data",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ventoultimo", value: '--'
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/no_data_wind.svg"
                }
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 1000000,
                symbolizer: {
                        pointRadius: 10
                }
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 1000000,
                minScaleDenominator: 500000,
                symbolizer: {
                        pointRadius: 15
                }
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 500000,
                symbolizer: {
                        pointRadius: 20
                }
        })
]});
//Simbolizzo il vento prendendo icone SVG:
var style_vento_svg = new OpenLayers.Style({
	/*,label: "${max1ora}\t\t${ultimovalore}\n\n${max3ore}\t\t${ultimoneve}"
	 *, labelOutlineColor: "white", labelOutlineWidth: 0, labelYOffset: 15, graphicWidth: 30, graphicHeight: 15, graphicYOffset: -18, graphicOpacity:0.8
	 *,fillColor: "#ffcc66", strokeColor: "#ff9933", strokeWidth: 2        
	 *,fontColor: 'black', fontWeight: "bold", fontFamily: "monospace"*/
        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg", rotation: "${dirultimo}"
        }, {
        rules: [
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_15.svg' height='24'>35.0-37.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 37.5
                }),
                symbolizer: { externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_15.svg" }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_14.svg' height='24'>32.5-35.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 35.0
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_14.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_13.svg' height='24'>30.0-32.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 32.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_13.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_12.svg' height='24'>27.5-30.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 30.0
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_12.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_11.svg' height='24'>25.0-27.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 27.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_11.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_10.svg' height='24'>22.5-25.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 25.0
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_10.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_09.svg' height='24'>20.0-22.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 22.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_09.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_08.svg' height='24'>17.5-20.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 20.0
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_08.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_07.svg' height='24'>15.0-17.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 17.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_07.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_06.svg' height='24'>12.5-15.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 15.0
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_06.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_05.svg' height='24'>10.0-12.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 12.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_05.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_04.svg' height='24'>7.5-10.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 10
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_04.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_03.svg' height='24'>5.0-7.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 7.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_03.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_02.svg' height='24'>2.5-5.0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_02.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg' height='24'>0.3-2.5 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 2.5
                }),
                symbolizer: {
                        externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_01.svg"
                }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg' height='24'>0 m/s",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.LESS_THAN,
                        property: "ventoultimo", value: 0.3
                }),
                symbolizer: { externalGraphic: root_dir_html+"/common/icons/wind_symbols/Symbol_wind_speed_00b.svg" }
        }),
        new OpenLayers.Rule({
                title: "<img src='"+root_dir_html+"/common/icons/wind_symbols/no_data_wind.svg' height='24'>no data",
                filter: new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "ventoultimo", value: '--'
                }),
                symbolizer: { externalGraphic: root_dir_html+"/common/icons/wind_symbols/no_data_wind.svg" }
        }),
        new OpenLayers.Rule({
                title: " ",
                minScaleDenominator: 1000000,
                symbolizer: { graphicWidth: 18 }
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 1000000,
                minScaleDenominator: 500000,
                symbolizer: { graphicWidth: 25 }
        }),
		new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 500000,
                minScaleDenominator: 250000,
                symbolizer: { graphicWidth: 40 }
        }),
        new OpenLayers.Rule({
                title: " ",
                maxScaleDenominator: 250000,
                symbolizer: { graphicWidth: 50 }
        })
]});

