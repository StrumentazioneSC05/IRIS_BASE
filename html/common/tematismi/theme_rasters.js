/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


/////////////////////// ADD RASTER LAYER /////////////////////
	
//Creo questa variabile per permettere il refresh delle immagini:
var d = new Date();

var raster_options = {isBaseLayer: false, opacity: 0.6//, alwaysInRange: true
, buffer: 0 //dovrebbe servire a non tenere in cache le immagini
,alwaysInRange:true, transparent: true, visibility: true
//numZoomLevels: 3
//,attribution:"<p id='localtime' style='font-weight:bold'>"+d.today() + " " + d.timeNow() + "</p>"
};

var size = new OpenLayers.Size(680, 653);
var size2 = new OpenLayers.Size(1543, 1483);
var size3 = new OpenLayers.Size(515, 506);
var size4 = new OpenLayers.Size(528, 517);

var bounds1 = new OpenLayers.Bounds(313624.231, 4942116.099, 1500503.305, 6081869.092); //dal tiff in 900913
var bounds2 = new OpenLayers.Bounds(673811.859, 5310564.071, 1254923.782, 5881520.640); //coord dal tiff gia' in 900913
var bounds2a = new OpenLayers.Bounds(702363.967, 5311713.301, 1298612.054, 5895539.553); //coord dal tiff gia' in 900913
//var bounds3 = new OpenLayers.Bounds(624594.733, 4029479.035, 2762476.717, 6084228.862); //dal tiff in 900913
var bounds3 = new OpenLayers.Bounds(499556.8, 4094696, 2662618, 6152957); //dal tiff in 900913
//Per il radar in BANDA X:
var size_x = new OpenLayers.Size(527, 523); //size del png o del tiff..?
var bounds4 = new OpenLayers.Bounds(818395.95, 5550636.52, 1045264.95, 5783682.85); //VERCELLI dal tiff in 32632 convertite in 900913
//var bounds4 = new OpenLayers.Bounds(895093.483,5589039.595, 1127676.151,5818326.560); //MILANOFIERE
//var bounds4 = new OpenLayers.Bounds(922981.592, 5616557.938, 1098999.592, 5792097.938); //MILANOFIERE dal tiff in 900913 range 60km
//var bounds4 = new OpenLayers.Bounds(925072, 5616802, 1097090, 5791007); //a mano..
// var bounds4 = new OpenLayers.Bounds(1044919, 5651767, 1192231, 5799607); //a mano..LAGO ISEO
//var bounds4m = new OpenLayers.Bounds(1045700, 5652074, 1192791, 5799166); //a mano..LAGO ISEO MAX ECHO
//(1046550, 5654475, 1193641, 5801566) //dal tiff MAX ECHO ISEO
//var bounds4m = new OpenLayers.Bounds(1046550, 5654475, 1193641, 5801566);
var bounds4m = new OpenLayers.Bounds(1045263, 5652433, 1192304.5, 5799474.5);
var size4m = new OpenLayers.Size(616, 616);
//Per il mosaico OPERA - radar europei:
var bounds5 = new OpenLayers.Bounds(-4401103.612, 3728784.563, 6436458.971,12486167.779);
var size5 = new OpenLayers.Size(3152, 2547);
//Per cloudmask MSG:
var bounds10 = new OpenLayers.Bounds(313624.231, 4942465.181, 1502178.899, 6081869.092);
var size10 = new OpenLayers.Size(255, 266);

//Per snowcover IMS:
//var bounds11 = new OpenLayers.Bounds(313624.231, 4942465.181, 1502178.899, 6081869.092);
var bounds11 = new OpenLayers.Bounds(596067.998, 5124377.804, 1932542.348, 6326810.479);
var size11 = new OpenLayers.Size(1017, 915);

//Per immagini METEOSWISS - prova per la Lombardia:
var bounds_meteoswiss = new OpenLayers.Bounds(299385, 5406475, 1387223, 6354697);
var size_meteoswiss = new OpenLayers.Size(710, 640);
url_raster_meteoswiss = root_dir_html+"/common/DATA/raster/meteoswiss/";
var meteoswiss = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_meteoswiss + "meteoswiss.radar.precip.png?rand="+d.getTime(),
        bounds_meteoswiss, size_meteoswiss,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
meteoswiss.setVisibility(false);
meteoswiss.redraw(true);

//Per immagini MODIS per copertura nevosa
var bounds_modis = new OpenLayers.Bounds(281571.520, 5245506.545, 1640731.466, 6281073.932);
var size_modis = new OpenLayers.Size(3818, 2909);
url_raster_modis = root_dir_html+"/common/DATA/raster/";
var modis = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_modis + "googlemap_modis.png?rand="+d.getTime(),
        bounds_modis, size_modis,
        {isBaseLayer: false, alwaysInRange: true, opacity: 0.6}
);
modis.setVisibility(false);
modis.redraw(true);


//Per le immagini di monitoraggio TRAPS:
url_raster_traps = root_dir_html+"/common/DATA/idro/TRAPS/";
var bounds7 = new OpenLayers.Bounds(855320.537, 5508299.698, 964871.933, 5606615.053);
var size7 = new OpenLayers.Size(78, 70);

var traps_pluvio = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_traps + "mappa3785.png?rand="+d.getTime(),
        bounds7, size7,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
traps_pluvio.setVisibility(false);
traps_pluvio.redraw(true);

//Per le immagini di monitoraggio SWE:
url_raster_swe = root_dir_html+"/common/DATA/idro/SWE/";
var bounds8 = new OpenLayers.Bounds(724218.546, 5425153.041, 1055223.810, 5885435.039);
var size8 = new OpenLayers.Size(324, 233);

var statoneve = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_swe + "stato_neve3785.png?rand="+d.getTime(),
        bounds8, size8,
	{isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
statoneve.setVisibility(false);
statoneve.redraw(true);

//Per le immagini di monitoraggio NIVO:
url_raster_nivo = root_dir_html+"/common/DATA/nivo/";
var bounds9 = new OpenLayers.Bounds(724108.892, 5424880.111, 1055101.249, 5885144.160);
var size9 = new OpenLayers.Size(324, 233);

var nevefresca3g = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_nivo + "piemonte_kriging_Hn_3gg3875.png?rand="+d.getTime(),
        bounds9, size9,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
nevefresca3g.setVisibility(false);
nevefresca3g.redraw(true);

var nevefresca = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_nivo + "piemonte_kriging_Hn3875.png?rand="+d.getTime(),
        bounds9, size9,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
nevefresca.setVisibility(false);
nevefresca.redraw(true);

var nevesuolo = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_nivo + "piemonte_kriging_Hs3875.png?rand="+d.getTime(),
        bounds9, size9,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
nevesuolo.setVisibility(false);
nevesuolo.redraw(true);

var snowcover = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_nivo + "ims_snowcover_google.png?rand="+d.getTime(),
        bounds11, size11,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
snowcover.setVisibility(false);
snowcover.redraw(true);


//Per le immagini di monitoraggio IDRO:
url_raster_idro = root_dir_html+"/common/DATA/idro/PLUV/";
//var bounds6 = new OpenLayers.Bounds(608479.980, 5447311.177, 1150451.816, 5903933.118);
////var size6 = new OpenLayers.Size(381, 321);
var bounds6 = new OpenLayers.Bounds(724218.546, 5425153.041, 1055223.810, 5885435.039);
var size6 = new OpenLayers.Size(324, 233);

var idro24 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_idro + "PLUV_ultime_24ore3785.png?rand="+d.getTime(),
        bounds6, size6,
	{isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
idro24.setVisibility(false);
idro24.redraw(true);

var idro12 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_idro + "PLUV_ultime_12ore3785.png?rand="+d.getTime(),
        bounds6, size6,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
idro12.setVisibility(false);
idro12.redraw(true);

var idro6 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_idro + "PLUV_ultime_6ore3785.png?rand="+d.getTime(),
        bounds6, size6,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
idro6.setVisibility(false);
idro6.redraw(true);

var idro3 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_idro + "PLUV_ultime_3ore3785.png?rand="+d.getTime(),
        bounds6, size6,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
idro3.setVisibility(false);
idro3.redraw(true);

var idro1 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_idro + "PLUV_ultima_ora3785.png?rand="+d.getTime(),
        bounds6, size6,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
idro1.setVisibility(false);
idro1.redraw(true);


//Per le immagini delle previsioni da MODELLI:
var url_raster_modelli = root_dir_html+"/common/DATA/modelli_elaborati/";
var size_modelli = new OpenLayers.Size(793, 859);
var bounds_modelli = new OpenLayers.Bounds(-1391.494, 4027464.792, 2560322.665, 6802385.930); //dal tiff in 900913
var modelli = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_modelli + "COSMOI2_2014030400_021_EPSG3857.png?rand="+d.getTime(),
        bounds_modelli, size_modelli,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
modelli.setVisibility(false);
modelli.redraw(true);

//MODELLI da Alessio:
var size_modelli_asc = new OpenLayers.Size(458, 401);
var bounds_modelli_asc = new OpenLayers.Bounds(-560076.188, 3688352.368, 3000474.587, 6805777.829); //dal tiff in 900913
var modelli_d0 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_modelli + "COSMOI7_24h243857.png?rand="+d.getTime(),
        bounds_modelli_asc, size_modelli_asc,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
modelli_d0.setVisibility(false);
modelli_d0.redraw(true);
var modelli_d1 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_modelli + "COSMOI7_24h483857.png?rand="+d.getTime(),
        bounds_modelli_asc, size_modelli_asc,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
modelli_d1.setVisibility(false);
modelli_d1.redraw(true);
var modelli_d2 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster_modelli + "COSMOI7_24h723857.png?rand="+d.getTime(),
        bounds_modelli_asc, size_modelli_asc,
        {isBaseLayer: false, alwaysInRange: true, opacity: 1}
);
modelli_d2.setVisibility(false);
modelli_d2.redraw(true);


//Per le immagini di monitoraggio RADAR:
var url_raster = root_dir_html+"/common/DATA/raster/";
var mosaico = new OpenLayers.Layer.Image(default_layer_name,
	//"http://10.127.141.100/radar/imgs/googlemaps/googlemap_composite.png?rand="+d.getTime(),
	url_raster + "googlemap_composite.png?rand="+d.getTime(),
	bounds1, size, raster_options
);
mosaico.setVisibility(false);
mosaico.redraw(true);

var istantaneo = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_ist.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
istantaneo.setVisibility(false);
istantaneo.redraw(true);

var dvil = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_dvil.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
dvil.setVisibility(false);
dvil.redraw(true);

var istantaneo_bis = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_ist_bis.png?rand="+d.getTime(),
	bounds2a, size4, raster_options
);
istantaneo_bis.setVisibility(false);
istantaneo_bis.redraw(true);

//lon=9.081282;
//lat=45.52283;
lon=10.04334;
lat=45.65780;
var bandax_centroid = new OpenLayers.LonLat(lon, lat);
bandax_centroid = bandax_centroid.transform(OL_4326, OL_900913);
utmx_min = bandax_centroid.lon-60000;
utmx_max = bandax_centroid.lon+60000;
utmy_min = bandax_centroid.lat-60000;
utmy_max = bandax_centroid.lat+60000;
var boundsx_test = new OpenLayers.Bounds(utmx_min,utmy_min, utmx_max,utmy_max); //TEST
var sizex_test = new OpenLayers.Size(2048, 2048);
var bandax_test = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "bandax_polar_512.png?rand="+d.getTime(),
        boundsx_test, sizex_test, raster_options
);
bandax_test.setVisibility(false);
bandax_test.redraw(true);

var bandax = new OpenLayers.Layer.Image(default_layer_name,
        url_raster + "xband.png?rand="+d.getTime(),
        bounds4, size_x, raster_options
);
bandax.setVisibility(false);
bandax.redraw(true);

var maxband = new OpenLayers.Layer.Image(default_layer_name,
        url_raster + "maxband.png?rand="+d.getTime(),
        bounds4m, size4m, raster_options
);
maxband.setVisibility(false);
maxband.redraw(true);

var rain1h = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_01h.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
rain1h.setVisibility(false);
rain1h.redraw(true);

var test_app = new OpenLayers.Layer.Image(default_layer_name,
        root_dir_html+"/common/DATA/raster/app_temporalert/" + "cell0_demo.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
test_app.setVisibility(false);
test_app.redraw(true);
var test_appf = new OpenLayers.Layer.Image(default_layer_name,
        root_dir_html+"/common/DATA/raster/app_temporalert/" + "cell_f30_demo.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
test_appf.setVisibility(false);
test_appf.redraw(true);
var test_appf1 = new OpenLayers.Layer.Image(default_layer_name,
        root_dir_html+"/common/DATA/raster/app_temporalert/" + "cell_f60_demo.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
test_appf1.setVisibility(false);
test_appf1.redraw(true);

var rain3h = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_03h.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
rain3h.setVisibility(false);
rain3h.redraw(true);

var rain6h = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_06h.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
rain6h.setVisibility(false);
rain6h.redraw(true);

var rain48h = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_tot.png?rand="+d.getTime(),
        bounds2, size3, raster_options
);
rain48h.setVisibility(false);
rain48h.redraw(true);
	
var neve = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_pioggia_neve.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
neve.setVisibility(false);
neve.redraw(true);

var dpc = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_dpc_ist.png?rand="+d.getTime(),
	bounds3, size2, raster_options
);
dpc.setVisibility(false);
dpc.redraw(true);

var opera = new OpenLayers.Layer.Image(default_layer_name,
        url_raster + "opera.png?rand="+d.getTime(),
        bounds5, size5, raster_options
);
opera.setVisibility(false);
opera.redraw(true);

var grandine = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "googlemap_hail.png?rand="+d.getTime(),
	bounds2, size3, raster_options
);
grandine.setVisibility(false);
grandine.redraw(true);

var msg = new OpenLayers.Layer.Image(default_layer_name,
	url_raster + "clm_bt.png?rand="+d.getTime(),
	bounds10, size10, raster_options
);
msg.setVisibility(false);
msg.redraw(true);


//Raster FEWS di cumulata sulle 72h:
var url_raster = root_dir_html+"/common/DATA/fews/anime_png/";
var bounds_fews = new OpenLayers.Bounds(245849, 3861665, 2329923, 6881447);
var size_fews = new OpenLayers.Size(297, 313);
var fews72 = new OpenLayers.Layer.Image(default_layer_name,
        url_raster + "fews_73h_mm_3857.png?rand="+d.getTime(),
        bounds_fews, size_fews, raster_options
);
fews72.setVisibility(false);
fews72.redraw(true);


