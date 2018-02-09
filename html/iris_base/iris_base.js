/***************************************************************
 * * Name:        IRIS - Integrated Radar Information System
 * * Purpose:     WebGis System for Meteorological Monitoring
 * *
 * * Author:      Roberto Cremonini, Armando Gaeta, Rocco Pispico
 * * Email:       sistemi.previsionali@arpa.piemonte.it
 * *
 * * Created:     01/04/2016
 * * Licence:     EUPL 1.1 Arpa Piemonte 2016
 * ***************************************************************/


/* IMPOSTAZIONE DA DB
if (grid_var == "comuni") {
        //store_grid = this[grid_var]; //recupero lo store da url
        title_grid = "Comuni che hanno subito un superamento nelle ultime 24 ore:";
        store_grid = store_comuni_last;
        columns_grid = columns_comuni_last;
}
else {
        title_grid = "Temporali (double-click to zoom on interested storm)";
        store_grid = store_storm;
        columns_grid = columns_storm;
}
//collapsed_grid = true;
*/

//Le opzioni di visualizzazione edlle righe della griglia modificale sotto geoext_generale_produzione.js!
//Fatto cio' probabilmente basta inzializzare questa variabile, vuota, da qualche parte in comune per TUTTI i webgis. Prova quando ci sono dei temporali e poi ranza via.
//Mh in realta bisogna dirlo come la si vuole da subito, cioe se rossa-arancio e perche altrimenti da subito lui prende una griglia neutra senza colori alle righe
view_grid = {
        forceFit: true,
        //showPreview: true,
        //enableRowBody: true,
        scrollOffset: 0,
        getRowClass: function(record, rowIndex, rp, ds){
                var rowClass = '';
                if (record.get('valore') > 2){
                        rowClass = 'red_grid_row';
                }
                return rowClass;
}};

legend = new GeoExt.LegendPanel({
        //items : new GeoExt.LegendImage({id: 'imgPreview', url: 'meteo/img/legenda_ist.gif'}),
        items : new GeoExt.LegendImage({fieldLabel: 'prova', id: 'imgPreview', url: root_dir_html+'/common/legends/'+legend_var+'.gif'}),
        region: "south", title: "Legend", autoScroll: true//, layerStore: mapPanel.layers
	,xtype: "gx_legendpanel"
	,defaults: {
        //style: 'padding:5px',
        baseParams: {
            FORMAT: 'image/png',
            LEGEND_OPTIONS: 'forceLabels:on'
        }
	//,legendTitle: 'prova' //nome da mettere al posto del layer
	,untitledPrefix: null //prefisso da usare per quei layer senza title cosi evito il fastidioso "Untitled"!
	}

        //renderTo: "legend", //height: Math.round(height_map*0.4), //width: Math.round(width_map*0.20),
        //layers: mapPanel.layers
});

///////////////// LAYER IN DEVEL ///////////////////
//var netcdf = new OpenLayers.Layer.WMS("netcdf - WMS test<!--radar1-->", urlMS_loc,
//    {map: path_raster, layers:"netcdf", isBaseLayer:false, sphericalMercator:true, transparent: true, singleTile: false, transitionEffect: 'resize'});
//    netcdf.setVisibility(false);
///////////////////////////////////////////////////

