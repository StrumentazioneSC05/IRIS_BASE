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

///////////////////// POPUP INFO - per gestionde da DB - in futuro eliminare questa funzione dai file popoup.js dei vari servizi /////////////////////
//Apro la popup,richiamo la funzione che permette il deselez in mappa dell'elemento interrogato una volta chiusa la popup
function open_popup(uri, pop_name, pop_options, layer) {
    var win_graph = window.open(uri, pop_name, pop_options);
    popup_unselect_feature(win_graph, layer);
}

function tipologia2title(tipologia) {
//Funqzione per IRIS Lombardia per assegnare un titolo alla scheda del grafico in base a nometipologia:
//Il primo titolo e' breve, in genere per associargli anche l'id del sensore.
//Il secondo titolo e' in forma piu' esplicita
  if (tipologia=='I') return 'Idro';
  else if (tipologia=='PP') return ['Pluvio', 'Pluviometro'];
  else if (tipologia=='UR') return ['Igro', 'Igrometro'];
  else if (tipologia=='PA') return ['Baro', 'Barometro'];
  else if (tipologia=='DVS') return ['DirVS', 'Direzione VentoS'];
  else if (tipologia=='VVS') return ['VelVS', 'Velocita VentoS'];
  else if (tipologia=='VV') return ['VelV', 'Velocita Vento'];
  else if (tipologia=='T') return ['Temp', 'Temperatura'];
  else if (tipologia=='RG') return ['RadG', 'RadiazioneG'];
  else if (tipologia=='RN') return ['RadN', 'RadiazioneN'];
  else if (tipologia=='DV') return ['DirV', 'Direzione Vento'];
  else if (tipologia=='TPV') return ['Vis', 'TP-Visibilita'];
  else if (tipologia=='TP') return ['TP', 'TP-Synop Code'];
  else if (tipologia=='TPN') return ['TPN', 'TP-Neve'];
  else if (tipologia=='TPP') return ['TPP', 'TP-Pioggia'];
  else return 'sconosciuto';
}

function grafici_rete(e, stazioni, tab_attivo, layer, composito) {
  composito = typeof composito !== 'undefined' ? composito : "2"; //definisco valori di default: in questo caso faccio solo i grafici semplici
    var width_plots = Math.round(screen_w * 0.80);
    var effects = "location=0,width="+width_plots+",height=550,toolbar=0,resizable=1,scrollbars=1,status=0,titlebar=1,menubar=0";
    var custom_height = 420; //altezza di default del frame
    var wname = "dati_stazione";
    var titles = "";
    var links = root_dir_html+"/common/scripts/plot_rete.php";
    //provo a generare una url piu' complessa per creare dei grafici con le nuove librerie Highcharts:
    var parametri = "";
    //creo una variabili che in alcuni casi blocca l'apertura del grafico:
    var aprigrafico=1;

  if (stazioni=='idrometri_bis') {
        var codice = e.codice;
        var codice_istat = codice.substring(0, 6);
        var progr_punto = codice.substring(6);
        titles = 'Portata,Livelli';
        parametri = 'PORTATA_BIS,IDRO_BIS';
        wname = "idrometri_bis";
  }
  else if (stazioni=='bacini_spi') {
        var codice = e.codice;
        var codice_istat = codice;
        var progr_punto = codice.substring(6); //variabile fittixzio in questo caso mi basta solo il codice
        titles = 'Andamento SPI';
        parametri = tab_attivo;
        wname = "bacini_spi";
  }
  else if (stazioni=='bacini_pal') {
        var codice = e.codice;
        var codice_istat = codice;
        var progr_punto = codice.substring(6); //variabile fittixzio in questo caso mi basta solo il codice
        titles = 'Andamento PALMER';
        parametri = tab_attivo;
        wname = "bacini_pal";
  }
  else if (stazioni=='smart_slops') {
        var codice = e.codice_istat_comune;
        var codice_istat = codice;
        var progr_punto = e.progr_punto_com_txt;
        titles = 'Slops';
        parametri = tab_attivo;
        wname = "smart_slops";
  }
  else if (stazioni=='bilancioidro') {
    var codice = e.istat_progr;
    var codice_istat = codice.substring(0,6);
    var progr_punto = codice.substring(6); //variabile fittixzio in questo caso mi basta solo il codice
    titles = 'Bilancio IDRO';
    parametri = tab_attivo;
    wname = "bilancidro";
  }
  else if (stazioni=='previdro') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    titles = 'Previsioni MC-FEWS,Previsioni MC,Probabilistiche FEWS';
    parametri = tab_attivo + ',previMC,previPROB';
    //aumento l'altezza della finestra per rendere i grafici piu' leggibili:
    var effects = "location=0,width="+width_plots+",height=650,toolbar=0,resizable=1,scrollbars=1,status=0,titlebar=1,menubar=0";
    custom_height = 510;
    wname = "previdro";
  }
  else if (stazioni=='previpo') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    titles = 'Previsioni MC-FEWS';
    parametri = tab_attivo;
    //aumento l'altezza della finestra per rendere i grafici piu' leggibili:
    var effects = "location=0,width="+width_plots+",height=650,toolbar=0,resizable=1,scrollbars=1,status=0,titlebar=1,menubar=0";
    custom_height = 510;
    wname = "previpo";
  }
  else if (stazioni=='fews') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    titles = 'Previsioni Livelli,Previsioni Portate';
    parametri = tab_attivo+',FEWSQ';
    //aumento l'altezza della finestra per rendere i grafici piu' leggibili:
    var effects = "location=0,width="+width_plots+",height=650,toolbar=0,resizable=1,scrollbars=1,status=0,titlebar=1,menubar=0";
    custom_height = 510;
    wname = "fews";
  }
  else if (stazioni=='fews_oss') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    if (e.tipo_staz.search("T") >= 0) {
            titles += "@Temperatura@";
            parametri += "@FEWS_T@";
    }
    if (e.tipo_staz.search("P") >= 0) {
            titles += "@Pioggia@";
            parametri += "@FEWS_P@";
    }
    if (e.tipo_staz.search("H") >= 0) {
            titles += "@Idrometro@";
            parametri += "@FEWS_H@";
    }
    if (e.tipo_staz.search("Q") >= 0) {
            titles += "@Portata@";
            parametri += "@FEWS_Q@";
    }
    //questi ultimi 2 casi sono le dighe:
    if (e.tipo_staz.search("V") >= 0) {
            titles += "@Volume@";
            parametri += "@FEWS_V@";
    }
    if (e.tipo_staz.search("L") >= 0) {
            titles += "@Livello@";
            parametri += "@FEWS_L@";
    }
    if (e.tipo_staz.search("0") >= 0) {
	alert("Nessun dato associato a questo invaso!");
	aprigrafico=0;
    }
    titles = titles.replace(/@@/g, ',');
    titles = titles.replace(/@/g, '');
    parametri = parametri.replace(/@@/g, ',');
    parametri = parametri.replace(/@/g, '');
    custom_height = 510;
    wname = "fews";
  }
  else if (stazioni=='fest') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    titles = 'Fest soglie';
    parametri = tab_attivo;
    custom_height = 510;
    wname = "fest";
  }
  else if (stazioni=='canali') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    titles = 'Portata,Idrometro';
    parametri = 'PORTATAC,IDROC';
    custom_height = 510;
    wname = "Canali";
  }
  else if (stazioni=='nivovalidati') {
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    titles = 'Altezza neve al suolo';
    parametri = 'NIVOVAL';
    custom_height = 510;
    wname = "Neveval";
  }
  //replicando sui dati lombardi la nostra logica: cambio solo i titoli dei TAB ma punto alla nuova logica di ArpaLo
  else if (stazioni=='meteoidro_lm') {
    //provo a caricare i grafici per idsensore e non per idparametro
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    var idsensore = e.progr_punto_com.replace('{','').replace('}',''); //su Db e' un array
    var tipologia = e.tipo_staz.replace('{','').replace('}',''); //su Db e' un array
    var idsensore_arr = idsensore.split(",");
    var tipologia_arr = tipologia.split(",");
    for (var i = 0; i < idsensore_arr.length; i++) {
        titles += "@"+tipologia2title(tipologia_arr[i])[1]+"@";
        parametri += "@"+tipologia_arr[i]+"|"+idsensore_arr[i]+"@";
        if (tipologia_arr[i].indexOf('VV') !== -1) {
          titles += "@Rose-"+idsensore_arr[i]+"@";
          parametri += "@ROSE|"+idsensore_arr[i]+"@";
        }
        if (tipologia_arr[i].indexOf(tab_attivo) !== -1) tab_attivo = tab_attivo + '|' + idsensore_arr[i];
    }
    titles = titles.replace(/@@/g, ',');
    titles = titles.replace(/@/g, '');
    parametri = parametri.replace(/@@/g, ',');
    parametri = parametri.replace(/@/g, '');
  }
  //nuova logica uguale a quella di ArpaLo:
  else if (stazioni=='test_lm') {
    //provo a caricare i grafici per idsensore e non per idparametro
    //var codice_istat = e.idstazione;
    var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    var idsensore = e.progr_punto_com.replace('{','').replace('}',''); //su Db e' un array
    var tipologia = e.tipo_staz.replace('{','').replace('}',''); //su Db e' un array
    var idsensore_arr = idsensore.split(",");
    var tipologia_arr = tipologia.split(",");
    for (var i = 0; i < idsensore_arr.length; i++) {
	titles += "@"+tipologia2title(tipologia_arr[i])[0]+'-'+idsensore_arr[i]+"@";
	//parametri += "@"+tipologia2parametro(tipologia_arr[i])+"@";
	parametri += "@"+tipologia_arr[i]+"|"+idsensore_arr[i]+"@";
	if (tipologia_arr[i].indexOf('VV') !== -1) {
	  titles += "@Rose-"+idsensore_arr[i]+"@";
	  parametri += "@ROSE|"+idsensore_arr[i]+"@";
	} 
	if (tipologia_arr[i].indexOf(tab_attivo) !== -1) tab_attivo = tab_attivo + '|' + idsensore_arr[i];
    }
    titles = titles.replace(/@@/g, ',');
    titles = titles.replace(/@/g, '');
    parametri = parametri.replace(/@@/g, ',');
    parametri = parametri.replace(/@/g, '');
  }
  else {
    if (e.idstazione) var codice_istat = e.idstazione;
    else var codice_istat = e.codice_istat_comune;
    var progr_punto = e.progr_punto_com;
    //var idstazione = e.idstazione; //ho equiparato tutti i campi a codice_istat_comune, ma solo per i popupm definiti da DB. Per quelli rimasti da codice, devo alsciare attiva questa opzione --> vedi poche righe sopra
    if (e.tipo_staz.search("T") >= 0 && e.tipo_staz.search("H") >= 0) {
                 titles += "@Temperatura@";
                 parametri += "@DEW@";
    }
    else if (e.tipo_staz.search("T") >= 0) {
            titles += "@Temperatura@";
            parametri += "@TERMA@";
    }
    if (e.tipo_staz.search("Y") >= 0) {
            titles += "@TempNeve@";
            //parametri += "@TERMAV@"; //cos'era questo parametro??
	    parametri += "@TERMN@";
    }
    if (e.tipo_staz.search("H") >= 0) {
            titles += "@Umidita@";
            parametri += "@IGRO@";
    }
    if (e.tipo_staz.search("P") >= 0) {
            titles += "@Pioggia@";
            parametri += "@PLUV@";
    }
    if (e.tipo_staz.search("I") >= 0) {
            titles += "@Idrometro@";
            parametri += "@IDRO@";
    }
    if (e.tipo_staz.search("N") >= 0) {
            titles += "@Neve@";
            parametri += "@NIVO@";
    }
    if (e.tipo_staz.search("V") >= 0) {
            titles += "@Vel.Vento,Dir.Vento,WindRose@";
            parametri += "@VELV,DIRV,ROSE@";
    }
    if (e.tipo_staz.search("R") >= 0) {
            titles += "@Radiazione@";
            parametri += "@RADD@";
    }
    if (e.tipo_staz.search("B") >= 0) {
            titles += "@Pressione@";
            parametri += "@BARO@";
    }
    if (e.tipo_staz.search("Q") >= 0) {
            titles += "@Portata@";
            parametri += "@PORTATA@";
    }
    if (e.tipo_staz.search("G") >= 0) {
            titles += "@RadGamma1@";
            parametri += "@GAMMA1@";
            titles += "@RadGamma3@";
            parametri += "@GAMMA3@";
    }
    if (e.tipo_staz.search("W") >= 0) {
            titles += "@Visibilita@";
            parametri += "@VIS@";
            titles += "@Tempo presente@";
            parametri += "@WTH 15M@";
    }
    meteo_tab = typeof e.meteo_tab !== 'undefined' ? e.meteo_tab : ""; //definisco valori di default
    if (meteo_tab.indexOf('Z') >= 0) {
	alert("Nessun dato associato a questa stazione!");
        aprigrafico=0;
    }

    titles = titles.replace(/@@/g, ',');
    titles = titles.replace(/@/g, '');
    parametri = parametri.replace(/@@/g, ',');
    parametri = parametri.replace(/@/g, '');
  }

    //Nuovo link per generazione PLOT - resetto quelli dati precedentemente di fatto:
    php_url = "/common/scripts/jquery_tab.php";
    if (stazioni=='estero') links = root_dir_html+"/common/scripts/plot_rete_estero.php";
    else if (stazioni=='meteoidro') links = root_dir_html+"/common/scripts/plot_rete.php";
    else if (stazioni=='meteoidro_lm') {
	//links = root_dir_html+"/common/scripts/plot_rete_lombardia.php";
	links = root_dir_html+"/common/scripts/plot_rete_iris_lm.php";
	//php_url = "/common/scripts/jquery_tab_lombardia.php";
    }
    else if (stazioni=='test_lm') {
        links = root_dir_html+"/common/scripts/plot_rete_iris_lm.php";
    }
    else if (stazioni=='idrometri') {
	titles = 'Idrometro,MassimiIdrologici,Portata,ScaleDeflusso,SezioneFluviale';
	parametri = 'IDRO,MAX_IDRO';
	links = root_dir_html+"/common/scripts/plot_rete.php";
	if (e.tipo_staz.search("Q") >= 0) {
          parametri += ',PORTATA,DEFLUSSO';
	}
	else {
          parametri += ',PORTATA$,DEFLUSSO$';
	}
	if (e.tipo_staz.search("X") >= 0) {
          parametri += ',SEZFLUV';
        }
        else {
          parametri += ',SEZFLUV$';
        }
    }
    /*if (stazioni=='meteoidro_lm') var uri = root_dir_html+"/common/scripts/jquery_tab_lombardia.php?titles="+titles+"&links="+links+"&parametri="+parametri+"&id_staz="+codice_istat+"&tipo_tab=1&active_tab="+tab_attivo+"&root_dir_html="+root_dir_html+"&custom_height="+custom_height;
    else */
    var uri = root_dir_html+php_url+"?titles="+titles+"&links="+links+"&parametri="+parametri+"&codice_istat="+codice_istat+"&progr_punto="+progr_punto+"&tipo_tab=1&active_tab="+tab_attivo+"&root_dir_html="+root_dir_html+"&custom_height="+custom_height+"&composito="+composito+"&stazioni="+stazioni;
    var pop_options = effects+",left=120,top=120";

    if (aprigrafico==1) open_popup(uri, wname, pop_options, layer);
    else selectCtrl.unselect(layer);

}
///////////////////// FINE POPUP INFO /////////////////////

///////////////////// ACTIVE LAYER /////////////////////
//Funzione che intercetta l'accensione di un layer:
function activeLayer(layer, checked) {
  //I layer vettoriali non hanno la proprieta' size. Onde evitare di ricevere un errore in questo senso attuo un primo filtro, anche perche' i layer vettoriali non hanno il metadato DATETIME:
  if ( layer.id.indexOf("Image") == -1 ) return false; //cioe' esco dalla funzione se non e' una immagine
   var layer_name = layer.name;
   var width_image = layer.size.w;

   if ( layer_name.indexOf('animazione') !== -1) return false; //per i layer in animazione non mostro il metadato orario
   //else if (layer_name.indexOf("radar") >= 0 || layer_name.indexOf("modelli") >= 0) {
   //se volessi far vedere la dataora di tutti i raster??
   else {
     //console.log("il layer raster attivato e' radar o modelli");
     var active_layer = map.getLayersByName(layer_name)[0];
     var active_url = active_layer['url'];
     var active_id = active_layer['id'] + '_p';
     var valid_url_full = active_url.substring(0, active_url.indexOf('?'));
     var valid_url = valid_url_full.replace(root_dir_html, '');
     //active_layer['metadata']['time']='';
     //Recupero dataora creazione immagine dal server con python e ImageMagick o GdalInfo:
     url_png=root_dir_html+'/cgi-bin/get_date_creation_png.py';
     $.ajax({
        url: url_png,
        type: 'GET',
        //async: false,
        data: { filename: valid_url },
        contentType: 'Content-Type: text/plain; charset=utf-8',
        dataType:'text',
        success: function (response) {
                //console.log(response);
                active_layer['metadata']['time'] = response;
        //Accendo o spengo l'informazione oraria in base allo stato di visibilita del layer e del suo nodo:
                if (checked==true && $('#'+active_id).length>0) {
                    $('#'+active_id).html(layer_name + ' ' + active_layer['metadata']['time']);
                    //console.log('gia presente');
                }
                else if (checked==true && $('#'+active_id).length<=0 ) {
                    $( ".logo_div" ).append( "<p id="+active_id+" title='ora immagine radar visualizzata' class='raster_data'>"+ layer_name + ' ' + active_layer['metadata']['time'] + "</p>" );
                    //console.log('non esiste ancora');
                }
                else if (checked==false && $('#'+active_id).length>0) {
                    $('#'+active_id).html("");
                }
        },
        error: function () {
                console.log("Error on server or alert system not activate");
        }
    });

     //Imposto un metadata sul layer attivato:
     //active_layer['metadata'] = 'ciccialippa';
     //console.log(active_layer['metadata']);
     //console.log(map.getLayersByName(layer_name)[0]['url']);
     //console.log(map.getLayersByName(layer_name)[0]);
     //console.log(map.getLayersByName(layer_name));

   }
}

///////////////////// FINE ACTIVE LAYER /////////////////////


///////////////////// CALCOLO BANDE GIORNO e NOTTE per GRAFICI /////////////////////
//IN SVILUPPO PLOTBANDS per distinguere eil GIORNO e la NOTTE
function calc_day_and_nigth(ilat, ilon) {
  ilat = typeof ilat !== 'undefined' ? ilat : 45; //definisco valori di default
  ilon = typeof ilon !== 'undefined' ? ilon : 8; //definisco valori di default
  //demo: ora di centroide Piemonte:
  var times = SunCalc.getTimes(new Date(), ilat, ilon);
  var sunrise_HH = times['sunriseEnd'].getUTCHours();
  var sunrise_MM = times['sunriseEnd'].getUTCMinutes();
  var sunset_HH = times['sunset'].getUTCHours();
  var sunset_MM = times['sunset'].getUTCMinutes();
console.log(times);
  //prelevo la data minima e massima del grafico
  var highest_ms = Math.max.apply( Math, $.map(graph_data, function(o){ return o[0]; }) );
  var lowest_ms  = Math.min.apply( Math, $.map(graph_data, function(o){ return o[0]; }) );
  var lowest = new Date(lowest_ms); //oggetto Date
  var highest = new Date(highest_ms); //oggetto Date
  var high_readable = new Date(highest).toJSON();
  var low_readable = new Date(lowest).toJSON();
  var lowest_YYMMDD_ms = new Date(lowest_ms).setHours(0,0,0,0);
  var highest_YYMMDD_ms = new Date(highest_ms).setHours(0,0,0,0);
//console.log(new Date(lowest_YYMMDD_ms).toJSON(), new Date(highest_YYMMDD_ms).toJSON());
//console.log(low_readable, high_readable);
  while ( lowest_YYMMDD_ms < today.getTime()) {
    lowest_YYMMDD = new Date(lowest_YYMMDD_ms); //oggetto Date
//console.log(new Date(lowest_YYMMDD).toJSON(), lowest_YYMMDD);
    from_plotband = Date.UTC(lowest_YYMMDD.getFullYear(), lowest_YYMMDD.getMonth(), lowest_YYMMDD.getDate(), sunrise_HH, sunrise_MM);
    to_plotband = Date.UTC(lowest_YYMMDD.getFullYear(), lowest_YYMMDD.getMonth(), lowest_YYMMDD.getDate(), sunset_HH, sunset_MM);
//console.log(from_plotband, to_plotband);
    var chart = $('#container').highcharts();
    chart.xAxis[0].addPlotBand({
      from: from_plotband,
      to: to_plotband,
      //color: '#FCFFC5',
      color: 'rgba(252, 255, 197, 0.4)',
      //label: { text: 'giorno', style: {color: 'blue'} },
      id: 'plot-band-1'
    });
    lowest_YYMMDD.setDate( lowest_YYMMDD.getDate() + 1);
    lowest_YYMMDD_ms = lowest_YYMMDD.getTime();
  }
}
function calc_step_orario(ilat, ilon, steph, stepn) {
  ilat = typeof ilat !== 'undefined' ? ilat : 45; //definisco valori di default
  ilon = typeof ilon !== 'undefined' ? ilon : 8; //definisco valori di default
  steph = typeof steph !== 'undefined' ? steph : 12; //definisco valori di default
  stepn = typeof stepn !== 'undefined' ? stepn : 6; //definisco valori di default 
//per le previsioni bollettino piene, parto con un default di 12h e 5 step
console.log(last_data_oss);
  if (last_data_oss==0) var highest = today;
  else var highest = new Date(last_data_oss); //oggetto Date
  //var max_time = highest.getTime() + (steph*stepn*60*60*1000);
  start_time = highest.getTime(); //time di partenza delle bande
  i = 0;
  //while ( start_time < max_time.getTime()) {
  while ( i < stepn) {
    lowest_YYMMDD = new Date(start_time); //oggetto Date
    //arrive_time = start_time + ( (steph+2) *60*60*1000); //tolgo 2h cosi da avere della sovrapposizione bella da vedere
    arrive_time = start_time + ( steph *60*60*1000); //senza sovrapposizione
    arrive_date = new Date(arrive_time);
    from_plotband = Date.UTC(lowest_YYMMDD.getFullYear(), lowest_YYMMDD.getMonth(), lowest_YYMMDD.getDate(), lowest_YYMMDD.getUTCHours(), lowest_YYMMDD.getUTCMinutes());
    to_plotband = Date.UTC(arrive_date.getFullYear(), arrive_date.getMonth(), arrive_date.getDate(), arrive_date.getUTCHours(), arrive_date.getUTCMinutes()); 
    var chart = $('#container').highcharts();
    colorsA = 255-(i*10);
    colorsB = 255-(i*20);
    colorsC = 200;//-(i*5);
    //oppure random:
    /*colorsA = Math.floor(Math.random() * 255) + 0;
    colorsB = Math.floor(Math.random() * 255) + 0;
    colorsC = Math.floor(Math.random() * 255) + 0;*/
    chart.xAxis[0].addPlotBand({
      from: from_plotband,
      to: to_plotband,
      //color: 'rgba(252, 255, 197, 0.4)',
      color: 'rgba('+colorsB+','+colorsA+','+colorsC+', 0.6)',
      id: 'plot-band-'+i
    });
    i++;
    //start_time = arrive_time - (2*60*60*1000); //ritolgo le 2h che ho aggiunto per la sovrapposizione grafica bella da vedere
    start_time = arrive_time; //nessuna sovrapposizione
  }
}
///////////////////// FINE CALCOLO BANDE GIORNO e NOTTE per GRAFICI /////////////////////


function get_dateString(date_input, sep_date, sep_mid, sep_time) {

	sep_date = sep_date || "";
	sep_mid = sep_mid || "";
	sep_time = sep_time || "";

	var yyyy = date_input.getFullYear();	// Get full year (as opposed to last two digits only)
	
	var month = date_input.getMonth() + 1;	// Get month and correct it (getMonth() returns 0 to 11)
	if (month.toString().length == 1) {mm = "0" + month.toString();}
	else {mm = month.toString();}
	
	var day = date_input.getDate(); // Get date within month
	if (day.toString().length == 1) {dd = "0" + day.toString();}
	else {dd = day.toString();}
	
	var hour = date_input.getHours(); // Get hour
	if (hour.toString().length == 1) {hh = "0" + hour.toString();}
	else {hh = hour.toString();}
	
	/*
	//Arrotondo i minuti a 0 o a 5:
	var diviso5 = (date_input.getMinutes() % 5); //mi restituisce il resto della divisione
	if (date_input.getMinutes()-diviso5 < 5) {minutes = "00";}
	else {minutes = date_input.getMinutes() - diviso5;}
	if (minutes.toString().length == 1) {mms = "0"+minutes;}
	else {mms = minutes;}
	*/

	var minutes = date_input.getMinutes(); // Get minutes
	if (minutes.toString().length == 1) {min = "0" + minutes.toString();}
	else {min = minutes.toString();}

	var seconds = date_input.getSeconds(); // Get seconds
        if (seconds.toString().length == 1) {sec = "0" + seconds.toString();}
        else {sec = seconds.toString();}
	
	//var fullDateString = yyyy.toString() + mm + dd + hh + min; //nella forma "yyyymmddhhmm"
	return yyyy.toString() + sep_date + mm + sep_date + dd + sep_mid + hh + sep_time + min; //nella forma "yyyymmddhhmm"

}

//Funzione per trasformare una data-ora nel formato dd/mm/yyyy e l'ora come hh:mm:ss. Usato come "attribution" nei raster per riportare l'informazione in sovrimpressione sulla mappa:
Date.prototype.today = function(){
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear()
};
Date.prototype.timeNow = function(){
        return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
};
//Per la forma DATA in YYYY-MM-DD:
Date.prototype.today_bis = function(){
        return this.getFullYear() + "-" +(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ ((this.getDate() < 10)?"0":"") + this.getDate()
};

//Nella versione UTC proviamo:
Date.prototype.todayUTC = function(){
	//return this.toUTCString();
	return ((this.getUTCDate() < 10)?"0":"") + this.getUTCDate() +"/"+(((this.getUTCMonth()+1) < 10)?"0":"") + (this.getUTCMonth()+1) +"/"+ this.getUTCFullYear()
};
Date.prototype.timeNowUTC = function(){
        return ((this.getUTCHours() < 10)?"0":"") + this.getUTCHours() +":"+ ((this.getUTCMinutes() < 10)?"0":"") + this.getUTCMinutes() +":"+ ((this.getUTCSeconds() < 10)?"0":"") + this.getUTCSeconds();
};
//Per la forma DATA in YYYY-MM-DD:
Date.prototype.todayUTC_bis = function(){
        //return this.toUTCString();
        return this.getUTCFullYear() + "-" +(((this.getUTCMonth()+1) < 10)?"0":"") + (this.getUTCMonth()+1) +"-"+ ((this.getUTCDate() < 10)?"0":"") + this.getUTCDate()
};


function popup_unselect_feature(popup_name, layer) {
    /* unselect any specific feature when the popup is closed: */
    var timer_graph = setInterval(function() {
      if(popup_name.closed) {
        clearInterval(timer_graph);
        selectCtrl.unselect(layer);
      }
    }, 1000);
}



/////////////////////////////// Funzione load css o js file inside javascript

function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}


/////////////////////////////////////////////////////////////////

//Dato che potrebbe essere utile a tutto il sistema definisco qui la OpenLayers.Strategy.AttributeCluster.
/**
 *  * Class: OpenLayers.Strategy.AttributeCluster
 *   * Strategy for vector feature clustering based on feature attributes.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
*/
OpenLayers.Strategy.AttributeCluster = OpenLayers.Class(OpenLayers.Strategy.Cluster, {
/**
 * the attribute to use for comparison
*/
    attribute: null,
/**
* Method: shouldCluster
 * Determine whether to include a feature in a given cluster.
 *
 * Parameters:
 * cluster - {<OpenLayers.Feature.Vector>} A cluster.
 * feature - {<OpenLayers.Feature.Vector>} A feature.
 *
 * Returns:
 * {Boolean} The feature should be included in the cluster.
*/
    shouldCluster: function(cluster, feature) {
        var cc_attrval = cluster.cluster[0].attributes[this.attribute];
        var fc_attrval = feature.attributes[this.attribute];
        var superProto = OpenLayers.Strategy.Cluster.prototype;
        return cc_attrval === fc_attrval &&
            superProto.shouldCluster.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Strategy.AttributeCluster"
});



