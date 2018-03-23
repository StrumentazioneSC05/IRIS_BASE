/*
 *
 * Definizione dei gruppi da associare ai layers per organizzarli in cartele nel menu laterale
 *
 *
*/

var group_sismi = "<!--sismi1-->";
var group_ingv = "<!--ingv-->";
var group_diss = "<!--diss-->";
var group_claxsism = "<!--claxsism-->";
var group_base = "<!--base-->";
var group_rete = "<!--rete-->";
var group_idro = "<!--idro1-->";
var group_idro_solo = "<!--idro0-->";
var group_radar = "<!--radar1-->";
var group_radar2 = "<!--radar2-->";
var group_suolo = "<!--suolo1-->";
var group_storm = "<!--temporali-->";
var group_neve = "<!--neve-->";
var group_modelli = "<!--modelli-->";
var group_test = "<!--test-->";
var group_animazione = "<!--animazione2-->"; //dovrebbero essere nascosti nel layerTreeMenu
var group_siccita = "<!--siccita1-->";
var group_piene = "<!--piene1-->";
var group_allerta = "<!--allerta-->";
var group_piene_def = "<!--pienedef-->"; //dovrebbe essere il nuovo gruppo a seguito della riclassificazione voluta da Secondo
var group_risorse_idro = "<!--risorseidro-->"; //dovrebbe essere il nuovo gruppo a seguito della riclassificazione voluta da Secondo

/* IMPOSTAZIONE DA DB
//Creo oggetto con descrizione dei gruppi per casi eventuali:
//In realta' l'ordine viene sfruttato per i cookie per scegliere i layer all'avvio del webgis:
var groups_labels = new Array();
groups_labels[group_sismi] = 'Sismica: dati RSNI';
groups_labels[group_ingv] = 'Sismica: dati INGV';
groups_labels[group_diss] = 'Sismica: dati DISS';
groups_labels[group_claxsism] = 'Sismica: classificazione';
groups_labels[group_base] = 'Dati di base';
groups_labels[group_rete] = 'Dati rete a terra';
groups_labels[group_idro_solo] = 'Idrologia';
groups_labels[group_idro] = 'Idrologia';
groups_labels[group_piene] = 'Idrologia - piene';
groups_labels[group_siccita] = 'Idrologia - siccita';
groups_labels[group_radar] = 'Info radar';
groups_labels[group_radar2] = 'Altri dati radar';
groups_labels[group_suolo] = 'Effetti al suolo';
groups_labels[group_storm] = 'Temporali';
groups_labels[group_neve] = 'Info nivologiche';
groups_labels[group_modelli] = 'Info da modelli';
groups_labels[group_test] = 'in sviluppo...';
groups_labels[group_allerta] = 'Temi per allerta CF';
groups_labels[group_piene_def] = 'Idrologia - piene';
groups_labels[group_risorse_idro] = 'Idrologia - risorse idriche';
*/

/* LAYERS DATI DI BASE */
var base00 = "Conoidi alluvionali"+group_base;
var base01 = "Bacini - modello DEFENSE"+group_base;
var base_title01 = "Bacini del sistema DEFENSE";
var base02 = "Visibilita radar 4km"+group_base;
/*
var base03 = "Stabilimenti RIR art.8"+group_base;
var base_title03 = "Stabilimenti RIR art. 8 D.Lgs. 334/99, D.Lgs 238/05";
var base04 = "Stabilimenti RIR art.6"+group_base;
var base_title04 = "Stabilimenti RIR art. 6 D.Lgs. 334/99, D.Lgs 238/05";
*/
var base03 = "Stabilimenti extraRIR 334/99"+group_base;
var base_title03 = "Stabilimenti extraRIR - direttiva 334(doppio-click sull'elemento per zoomare)";
var base04 = "Stabilimenti RIR 334/99"+group_base;
var base_title04 = "Stabilimenti RIR  - direttiva 334(doppio-click sull'elemento per zoomare)";
var base04_105 = "Stabilimenti RIR 105/15"+group_base;
var base_title04_105 = "Stabilimenti RIR - direttiva 105(doppio-click sull'elemento per zoomare)";
var base05 = "Reticolo idrografico NW"+group_idro;
var base06 = "Dissesti PAI - Piemonte"+group_base;
var base07 = "Sistema valanghe - Arpa Piemonte"+group_neve;
var base08 = "Settori alpini - Arpa Piemonte"+group_neve;
var base09 = "Fasce fluviali - Regione Piemonte"+group_base;
var base10 = "Scenari di alluvioni - Pericolosita"+group_base;
var base11 = "Reticolo idrografico Piemonte"+group_idro;
var base12 = "Area Expo 2015"+group_base;
var base12b = "Expo 2015"+group_base; //puntuale
var base13 = "Aeroporti nazionali"+group_base;
var base14 = "Limiti comunali"+group_base;
var base15 = "Idrografia Regione Piemonte"+group_idro;
var base16 = "Distanze"+group_base;


/* LAYERS SUOLO */
var suolo00 = "Frane superficiali - SMART"+group_suolo;
var suolo_title00 = "SMART: simulazioni con pioggia osservata";
var suolo01 = "Debris Flow - DEFENSE"+group_suolo;
var suolo_title01 = "DEFENSE - Bacini con superamento negli ultimi 7gg";
var suolo02 = "Frane traslative/rotazionali - TRAPS"+group_suolo;
var suolo_title02 = "TRAPS (Translational/Rotational slides Activation Prediction System): elenco dei comuni";
var suolo03 = "Frane superficiali previsione - SMART"+group_suolo;
var suolo_title03 = "Aree SMART: simulazioni con pioggia  media prevista nelle 36 ore";
var suolo04 = "Warning comuni"+group_suolo;
var suolo_title04 = "Comuni che hanno subito un superamento nelle precipitazioni - ultime 24 ore:";
var suolo05 = "Livelli di criticita"+group_suolo;
var suolo06 = "Precipitazione prevista"+group_suolo;
var suolo12 = "Urban Flooding-UFO: celle"+group_suolo;
var suolo13 = "Urban Flooding-UFO: aree"+group_suolo;
var suolo14 = "Precipitazione prevista 10gg"+group_suolo;
var suolo15 = "Rete inclinometri"+group_suolo;
var suolo16 = "SIFRAP"+group_suolo;
var suolo17 = "Allerta pluvio - comuni"+group_suolo;
var suolo18 = "Allerta pluvio - pluviometri"+group_suolo;
var suolo19 = "Allerta pluvio - comuni buffer15km"+group_suolo;
var suolo20 = "Allerta pluvio - pluviometri buffer15km"+group_suolo;
var suolo21 = "Frane superficiali - SMART_SLOPS"+group_suolo;

var suolo03b = "Aree SMART"+group_suolo; //vecchio layer probabilmente...
var suolo02b = "Comuni TRAPS"+group_suolo; //vecchio layer probabilmente...
var suolo00b = "Pluviometri SMART"+group_suolo; //vecchio layer probabilmente...


/* LAYERS NEVE */
var suolo07 = "Snow cover SWE"+group_neve;
var suolo08 = "Neve fresca - 3gg (raster)"+group_neve;
var suolo09 = "Neve fresca (raster)"+group_neve;
var suolo10 = "Neve al suolo (raster)"+group_neve;
var suolo11 = "Stazioni nivo - Statistiche"+group_neve;
var suolo15 = "Snowcover IMS"+group_neve;
var suolo16 = "Neve al suolo"+group_neve;


/* LAYERS RETE */
var rete_title = "Anagrafica stazioni rete a terra (double-click to zoom on interested station)";
var rete00 = "Rete meteoidro"+group_rete;
var rete00t = "Rete meteoidro tiny"+group_rete;
var rete00l = "Rete ARPA Lombardia completa"+group_base;
var rete00m = "Rete ARPA Lombardia meteoidro"+group_rete;
var rete00e = "Altre reti"+group_rete;
var rete00lago = "Rete meteoidro NW"+group_rete;
var rete00ch = "Rete Svizzera"+group_rete;
var rete01 = "Pioggia: infiltrata 60gg"+group_rete;
var rete02 = "Pioggia: cumulata ultime 24h"+group_rete;
var rete03 = "Pioggia: cumulata ultime 12h"+group_rete;
var rete04 = "Pioggia: cumulata ultime 6h"+group_rete;
var rete05 = "Pioggia: cumulata ultime 3h"+group_rete;
var rete06 = "Pioggia: precipitazione oraria"+group_rete;
var rete07 = "Temperature"+group_rete;
var rete07lago = "Temperature zona lago"+group_rete;
var rete08 = "Venti"+group_rete;
var rete09 = "Temperature - Altre reti"+group_rete;
var rete09ch = "Temperature - Svizzera"+group_rete;
var rete10 = "Neve"+group_neve;
var rete11 = "Venti - Altre reti"+group_rete;
var rete12 = "Precipitazioni - atlante piogge"+group_rete;
var rete13 = "Radiazioni gamma"+group_rete;
var rete14 = "Neve dalle 8"+group_neve;
var rete15 = "Rete idrometrica"+group_idro;
var rete16 = "Temperature Lombardia"+group_rete;
var rete17 = "Venti Lombardia"+group_rete;
var rete18 = "Piogge Lombardia ultime 3h"+group_rete;
var rete19 = "Stazioni SAI"+group_idro;
var rete20 = "Stazioni BIS"+group_idro;
var rete20_title = "Stazioni bollettino Idrologico mensile di sintesi (fare doppio click per zoom in mappa sull'elemento selezionato)";
var rete21 = "Stazioni meteo web"+group_rete;
var rete22 = "Stazioni SYNOP"+group_rete;
var rete23 = "Idrometri"+group_rete;
var rete24 = "Idrometri area lago"+group_rete;


/* LAYERS IDRO */
var idro00 = "Idrometri bollettino piene"+group_piene;
var idro00_title = "Idrometri bollettino piene (fare doppio click per zoom in mappa sull'elemento selezionato)";
var idro01 = "Idrometri PO"+group_piene;
var idro02 = "Invasi"+group_idro;
var idro03 = "Bollettino piene - previsione"+group_piene;
var idro_title03 = "Bollettino previsione piene (fare doppio click per zoom in mappa sull'elemento selezionato):";
var idro04 = "Bollettino piene - attuale"+group_piene;
var idro05 = "Bacini idrografici"+group_idro;
var idro06 = "Nodi modello magre"+group_idro;
var idro07 = "Bacini SPI03"+group_siccita;
var idro08 = "Bacini SPI01"+group_siccita;
var idro09 = "Bacini SPI06"+group_siccita;
var idro10 = "Bacini SPI12"+group_siccita;
var idro11 = "Bacino del Po"+group_idro;
var idro13 = "Bacini Palmer PDSI"+group_siccita;
var idro14 = "SIRI - Prese"+group_idro;
var idro15 = "SIRI - Restituzioni"+group_idro;
var idro16 = "Webcam da web"+group_idro;


/* LAYERS SISMICA */
var sismi00 = "Terremoti <30gg - profondita"+group_sismi;
var sismi_title00 = "Elenco degli eventi sismici registrati negli ultimi 30 giorni dalla Rete Sismica Regionale dell'Italia Nord-occidentale - (doppio-click sull'elemento per zoomare sul sisma)";
var sismi00b = "Terremoti <30gg - tempo trascorso"+group_sismi;

var sismi01 = "Stazioni sismiche"+group_sismi;
var sismi_title01 = "Stazioni sismiche attive della rete RSNI";

var sismi02a = "Terremoti 217a.C.-2002 - magnitudo (CPTI04)"+group_ingv;
var sismi02 = "Terremoti 1000-2006 - magnitudo (CPTI11)"+group_ingv;

var sismi03 = "CPTI04*"; //label

var sismi04 = "Clax sismica 2004 (DGR 61-11017)"+group_claxsism;
var sismi05 = "Clax sismica 2012 (DGR 11-13058)"+group_claxsism;
var sismi_title05 = "Comuni della classificazione sismica 2003 (DGR61-11017) e 2012 (DGR11-13058) - Regione Piemonte";

var sismi06 = "Clax sismica-label*"; //label

var sismi07 = "Sequenze sismiche <60gg - aree"+group_sismi;
var sismi_title07 = "Sequenze sismiche identificate negli utlimi 60gg in tempo reale:";

var sismi08 = "Sequenze sismiche <60gg - terremoti"+group_sismi;

var sismi09 = "Sismicita strumentale*";

var sismi10 = "Sorgenti macrosismiche (DISS 3.0.4 2007)"+group_diss;
var sismi11 = "Sorgenti individuali (DISS 3.1.1 2010)"+group_diss;
var sismi12 = "Sorgenti complesse (DISS 3.1.1 2010)"+group_diss;
var sismi13 = "Faglie note"+group_diss;


/* LAYERS TEMPORALI */
var temporali00 = "Temporali-3h"+group_storm;
var temporali00b = "Temporali-1h"+group_storm;
var temporali00c = "Temporali-3h"+group_test;
var temporali_title00 = "Temporali (double-click to zoom on interested storm)";
var temporali01 = "Forecast-1h"+group_storm;
var temporali02 = "Fulmini-3h"+group_storm;
var temporali02b = "Fulmini-1h"+group_storm;
var temporali03 = "Percorsi-oggi"+group_storm;
var temporali04 = "Spostamento"+group_storm;
var temporali05 = "Cluster fulmini-3h"+group_storm;
var temporali06 = "Select da raster come wfs"+group_test;
var temporali07 = "Temporali-3h Mosaico BIS"+group_test;
var temporali08 = "Forecast-1h Mosaico BIS"+group_test;

var animazione00 = "Storm 24h"+group_animazione;
var animazione01 = "Fulmini 24h"+group_animazione;

var appcell00 = "Celle attuali demo"+group_test;
var appcell01 = "Celle f30 demo"+group_test;
var appcell02 = "Celle f60 demo"+group_test;


/* LAYERS MODELLI */
var modelli00 = "Venti da moello"+group_modelli;
var modelli01 = "cosmoi7_2014030400_021_hgt700"+group_modelli;
var modelli02 = "COSMOI2_2014030400_021"+group_modelli;


/* LAYERS RADAR */
var radar00 = "Prec - Mosaico nordovest"+group_radar;
var radar01 = "Prec - Mosaico Piemonte"+group_radar;
var radar02 = "Prec - Piemonte (Lema e Milano)"+group_radar;
var radar03 = "Prec - Banda-X (Lago d'Iseo)"+group_radar;
var radar04 = "Prec - Cumulata 1h"+group_radar;
var radar05 = "Prec - Cumulata 3h"+group_radar;
var radar06 = "Prec - Cumulata 6h"+group_radar;
var radar07 = "Prec - Cumulata ieri-oggi"+group_radar;
var radar08 = "Prec - Neve"+group_radar;
var radar09 = "Prec - Mosaico DPC"+group_radar;
var radar10 = "Prec - OPERA"+group_radar;
var radar11 = "Prec - Grandine - oggi"+group_radar;
var radar12 = "Temperatura nubi"+group_radar;
var radar13 = "Prec - Banda-X Max Echo (Lago d'Iseo)"+group_radar;
var radar14 = "VIL Density"+group_radar;

/* CREAZIONE DI UN DIZIONARIO PER I DATI RADAR PER GESTIRE FUNZIONI AVANZATE */
/* IN SVILUPPO */
/*
var url_raster_nivo = "/common/DATA/nivo/";
var url_raster_idro = "/common/DATA/idro/PLUV/";
var url_raster_modelli = "/common/DATA/modelli/";
var url_raster = "/common/DATA/raster/";
var raster_names = {
     'mosaicoNW' : ['Cloud Mask', 'cloud_mask.png', "/common/DATA/idro/TRAPS/"],
     "2" : true,
     "3" : false
};
//Dizionario richiamabile nella forma:
console.log(raster_names['mosaicoNW'][0]);
*/

