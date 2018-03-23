/*
** author: Armando Riccardo Gaeta
** email: ar_gaeta@yahoo.it
*/


////////////////////////// LAYER STORM-WMS: ///////////////////
//ricordarsi la possibilitàell'opzione 'opacity: 0.6', e format: 'image/png'....


//raster WMS da MapServer per applicazioni mobile:
var raster_ist = new OpenLayers.Layer.WMS("Istantanea"
	,urlMS_raster
	,
	{
	//map: path_meteo_wms
	layers:"rain_ist"
	, transparent: true
	}
	,
	//In teoria dovrebbe stare tutto nel gruppo precedente, ma non so per quale motivo non mi riconosce piu' certe opzioni...
	{
	isBaseLayer:false
	, sphericalMercator:true
	//, transparent: true
	, singleTile: false 
	, transitionEffect: 'resize'
	//, opacity: 0.5
	, format: 'image/png'
	}
);
raster_ist.setVisibility(true);	

