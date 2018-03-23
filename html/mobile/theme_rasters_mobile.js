/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


var refresh_test;
	
/////////////////////// ADD RASTER LAYER /////////////////////
	
//Creo questa variabile per permettere il refresh delle immagini:
var d = new Date();

var url_raster = root_dir_html + "/common/DATA/raster/";

var raster_options = {isBaseLayer: false, alwaysInRange: true, opacity: 0.6
, buffer: 0 //dovrebbe servire a non tenere in cache le immagini
//numZoomLevels: 3
};

//ECCEZIONE per LAYER VETTORIALI che trasformo in raster per velocizzarne il caricamento:
var url_vector_raster_mobile = root_dir_html + "/mobile/raster/";
var size_mobile = new OpenLayers.Size(1000, 1000); 
var bounds_mobile = new OpenLayers.Bounds(692302.302, 5464802.302, 1087697.698, 5860197.698); //completamente fuori non capisco perche'??!!

var aree_allert_raster = new OpenLayers.Layer.Image(
        "Livelli di criticita",
        url_vector_raster_mobile + "aree_allertamento.png?"+d.getTime(),
        bounds_mobile, size_mobile, raster_options
);
aree_allert_raster.setVisibility(false);
aree_allert_raster.redraw(true);


//Per cloudmask MSG:
var bounds10 = new OpenLayers.Bounds(313624.231, 4942465.181, 1502178.899, 6081869.092);
var size10 = new OpenLayers.Size(255, 266);
var bounds1 = new OpenLayers.Bounds(313624.231, 4942116.099, 1500503.305, 6081869.092); //dal tiff in 900913
var bounds2 = new OpenLayers.Bounds(673811.859, 5310564.071, 1254923.782, 5881520.640); //coord dal tiff gia' in 900913
var bounds2a = new OpenLayers.Bounds(702363.967, 5311713.301, 1298612.054, 5895539.553); //coord dal tiff gia' in 900913
//Mosaico Nazionale DPC
//var bounds3 = new OpenLayers.Bounds(624594.733, 4029479.035, 2762476.717, 6084228.862); //dal tiff in 900913
var bounds3 = new OpenLayers.Bounds(499556.8, 4094696, 2662618, 6152957); //dal tiff in 900913
//Per il radar in BANDA X:
var bounds4 = new OpenLayers.Bounds(818395.95, 5550636.52, 1045264.95, 5783682.85); //dal tiff in che 32632 convertite in 900913

var size = new OpenLayers.Size(680, 653);
var size2 = new OpenLayers.Size(1543, 1483);
var size3 = new OpenLayers.Size(515, 506);
var size4 = new OpenLayers.Size(528, 517);
	
var mosaico = new OpenLayers.Layer.Image(
        "Pioggia: mosaico nordovest",
        //"http://10.127.141.100/radar/imgs/googlemaps/googlemap_composite.png?rand="+d.getTime(),
        url_raster + "googlemap_composite.png?rand="+d.getTime(),
        bounds1, size, raster_options
);
mosaico.setVisibility(false);
mosaico.redraw(true);

var istantaneo = new OpenLayers.Layer.Image(
        "Pioggia - istantanea",
        url_raster + "googlemap_ist.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
istantaneo.redraw(true);
istantaneo.setVisibility(false);

var istantaneo_bis = new OpenLayers.Layer.Image(
        "Pioggia Lema-Milano",
        url_raster + "googlemap_ist_bis.png?rand="+d.getTime(),
        bounds2a, size4, raster_options
);
istantaneo_bis.setVisibility(true);
istantaneo_bis.redraw(true);

var bandax = new OpenLayers.Layer.Image(
        "Pioggia - banda x",
        url_raster + "xband.png?rand="+d.getTime(),
        bounds4, size3, raster_options
);
bandax.setVisibility(false);
bandax.redraw(true);

var rain1h = new OpenLayers.Layer.Image(
        "Pioggia - 1h",
        url_raster + "googlemap_01h.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
rain1h.setVisibility(false);
rain1h.redraw(true);

var rain3h = new OpenLayers.Layer.Image(
        "Pioggia - 3h",
        url_raster + "googlemap_03h.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
rain3h.setVisibility(false);
rain3h.redraw(true);

var rain6h = new OpenLayers.Layer.Image(
        "Pioggia - 6h",
        url_raster + "googlemap_06h.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
rain6h.setVisibility(false);
rain6h.redraw(true);

var rain48h = new OpenLayers.Layer.Image(
        "Pioggia - ieri-oggi",
        url_raster + "googlemap_tot.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
rain48h.setVisibility(false);
rain48h.redraw(true);

var neve = new OpenLayers.Layer.Image(
        "Pioggia - Neve",
        url_raster + "googlemap_pioggia_neve.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
neve.setVisibility(false);
neve.redraw(true);

var dpc = new OpenLayers.Layer.Image(
        "Pioggia DPC",
        url_raster + "googlemap_dpc_ist.png?rand="+d.getTime(),
        bounds3, size2, raster_options
);
dpc.setVisibility(false);
dpc.redraw(true);

var grandine = new OpenLayers.Layer.Image(
        "Pioggia-Grandine - oggi",
        url_raster + "googlemap_hail.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
grandine.setVisibility(false);
grandine.redraw(true);

var msg = new OpenLayers.Layer.Image(
	"Nubi",
	url_raster + "clm_bt.png?rand="+d.getTime(),
	bounds10, size10, raster_options
);
msg.setVisibility(false);
msg.redraw(true);


