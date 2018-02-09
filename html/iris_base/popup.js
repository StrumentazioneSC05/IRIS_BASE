/***************************************************************
* Name:        IRIS - Integrated Radar Information System
* Purpose:     WebGis System for Meteorological Monitoring
*
* Author:      Roberto Cremonini, Armando Gaeta, Rocco Pispico
* Email:       sistemi.previsionali@arpa.piemonte.it
*
* Created:     01/04/2016
* Licence:     EUPL 1.1 Arpa Piemonte 2016
***************************************************************/

///////////////////// POPUP INFO /////////////////////

/* Comportamenti su click definiti da DB */
/*
rete_meteoidro.events.on({
      featureselected: function(e) {grafici_rete(e.feature.attributes, 'meteoidro', 'TERMA', e.feature);}
});
staznivo.events.on({
        featureselected: function(e) {
                var uri = root_dir_html+"/common/DATA/nivo/STATS/"+e.feature.attributes.immagine;
		var wname = 'stat_nivo';
		var pop_options = 'location=0,width=650,height=820,toolbar=0,resizable=1,scrollbars=1,status=0,titlebar=0,menubar=0,left=500,top=50';
		open_popup(uri, wname, pop_options, e.feature);
        }
});
nivo_tiny.events.on({
    featureselected: function(e) {
        //Aggiungo la eventualita che si tratti di un cluster:
        var elemento = e.feature;
        if (elemento.cluster) { //se ho selezionato un cluster
            valore_dict = new Array(); //creo un array
            for (var i = 0; i < elemento.cluster.length; i++) {
                //chiave = elemento.cluster[i].attributes.id;
                valore_dict.push({
                        max1: elemento.cluster[i].attributes.ultimovalore,
                        codice_istat_comune: elemento.cluster[i].attributes.codice_istat_comune,
                        progr_punto_com: elemento.cluster[i].attributes.progr_punto_com,
                        tipo_staz: elemento.cluster[i].attributes.tipo_staz
                });
                //valore_dict[chiave] = elemento.cluster[i].attributes.max1ora;
                }
            var sorted = valore_dict.sort(function(a, b) {
                //Pongo a ZERO i valori nulli altrimenti li ordina per primi:
                if (b.max1==null) b.max1=0;
                if (a.max1==null) a.max1=0;
                return b.max1 - a.max1; //reverse order
            });
            grafici_rete(sorted[0], 'meteoidro', 'NIVO', e.feature);
        }
        else {
            grafici_rete(e.feature.attributes, 'meteoidro', 'NIVO', e.feature);
        }
    }
});
*/


/*
//Rileva in continuo la posizione del mouse e la spara nel div_id html di nome "coords"
map.events.register("mousemove", map, function(e) {
var position = this.events.getMousePosition(e);
//OpenLayers.Util.getElement("coords").innerHTML = position;
});
*/


function createPopup(evt, html_feature, title_pop) {

	html_feature = typeof html_feature !== 'undefined' ? html_feature : ""; //definisco valori di default
	title_pop = typeof title_pop !== 'undefined' ? title_pop : ""; //definisco valori di default

        var feature = evt.feature;
        //var html_feature; //definizione contenuto della popup

	if (typeof base11 !== 'undefined') {
	  if (feature.layer.name==base11) {html_feature = feature.attributes.denominazi;
		title_pop = feature.attributes.cod_hydro;
	  }
	}

	if (typeof idro05 !== 'undefined') {
	if (feature.layer.name==idro05) {
	//title_pop = "Bacino";
//Qui applico la funzione CAROTAGGIO cioe' buco tutti gli elementi del layer e li tiro fuori:
    //console.log(evt);
	var feat_id_selected = evt.feature.fid; //del tipo bacini_idrografici.69
    //console.log(evt.object.map.projection);
        result = [];
	//Compilo i dati col bacino selezionato, poi mettero' in coda gli altri:
	result.push(['<b>ordine ', feature.data.ordine, ': ' + feature.data.nome.toLowerCase().replace(/\d+|^\s+|\s+$|_|\./g, '')+ '</b><br/>' ]);
	//html_feature = '<b>ordine ' + feature.data.ordine + ': ' + feature.data.nome.toLowerCase().replace(/\d+|^\s+|\s+$|_|\./g, '') + '</b><br/>';
	//var lon_rast = evt.object.map.layerContainerOrigin.lon; //poco ma sicuro non sono le coordinate del punto cliccato!
	//Recupero allora le coordinate del click dal SelectControl:
	var pixel = selectCtrl.handlers.feature.evt.xy;
	var ll = map.getLonLatFromPixel(pixel);
	//bacini_idro.features.sort(function(a, b){return a.fid-b.fid});
    //console.log(bacini_idro.features);
	var lon_rast = ll.lon;
	var lat_rast = ll.lat;
	var marker_point = new OpenLayers.Geometry.Point(lon_rast, lat_rast);
	    for (var i=0; i<bacini_idro.features.length; i+=1) {
	        if (bacini_idro.features[i].geometry.intersects(marker_point) && bacini_idro.features[i].data.ordine<feature.data.ordine ) {
		    if (bacini_idro.features[i].fid != feat_id_selected) { //se la feature e' quella selezionata la salto
		    result.push(['ordine ', bacini_idro.features[i].data.ordine, ': ' + bacini_idro.features[i].data.nome.toLowerCase().replace(/\d+|^\s+|\s+$|_|\./g, '')+ '<br/>' ]);
		    //bacini_idro.features[i].renderIntent = "temporary";
		    //html_feature += 'ordine ' + bacini_idro.features[i].data.ordine + ': ' + bacini_idro.features[i].data.nome.toLowerCase().replace(/\d+|^\s+|\s+$|_|\./g, '') + '<br/>';
		    //console.log(bacini_idro.features[i].data.nome);
		    } //fine dell'if che esclude la feature selezionata
		}
	    } //fine del FOR tra gli elementi del layer
	//result.sort(function(a, b) {return a[1] - b[1]}); //ASC
	result.sort(function(a, b) {return b[1] - a[1]}); //DESC
	html_feature = result.map(function(elem){ return elem[0] + ' ' + elem[1] + ' ' + elem[2]; }).join(" ");
	}
	}


	// create the popup if it doesn't exist:
	if (!popup) {
		popup = new GeoExt.Popup({
			title: title_pop, feature: feature, width: 210, location: feature,
			opacity: 0.6, //non funziona...
			maximizable: true, collapsible: true, map: mapPanel.map,
			anchored: false, //a cosa serve?come non farmi coprire il punto dalla popup??
			//cmq ho dovuto mettere anchored=false per il reverse proxy, geoext non trovava l'immagine
			listeners: {
				close: function() {
					// closing a popup destroys it, but our reference is truthy
					popup = null;
				}
			},
			html: html_feature
			//html: feature.attributes.NOME_REG + "<br/>" + feature.attributes.COD_REG
		});
		//unselect feature when the popup is closed:
		popup.on({
			close: function() {
				if(OpenLayers.Util.indexOf(feature.layer.selectedFeatures,this.feature) > -1) {
					selectCtrl.unselect(this.feature);
				}
			}
		});
		popup.show();
	}
		
	else if (popup) {
		popup.close();
		popup = new GeoExt.Popup({
			title: title_pop, feature: feature, width: 200, location: feature,
			maximizable: true, collapsible: true, map: mapPanel.map, anchored: true,
			listeners: {
				close: function() {
					// closing a popup destroys it, but our reference is truthy
					popup = null;
				}
			},
			html: html_feature
		});
		// unselect feature when the popup is closed.
		popup.on({
			close: function() {
				if(OpenLayers.Util.indexOf(feature.layer.selectedFeatures,this.feature) > -1) {
				selectCtrl.unselect(this.feature);
				}
			}
		});
		popup.show();
	}


/* Queste righe per aggiungere le info sulla stessa popup
// add some content to the popup (this can be any Ext component)
popup.add({
    xtype: "box",
    autoEl: {
        html: feature.attributes.NOME_REG + "<br/>" + feature.attributes.COD_REG
        //html: "You clicked on (" + loc.lon.toFixed(2) + ", " + loc.lat.toFixed(2) + ")"
    }
});
*/

// reset the popup's location - NON FUNZIONA!
//popup.location = loc;
//popup.doLayout();
// since the popup is anchored, calling show will move popup to this location
//popup.show();



} //Fine della funzione createPopup

