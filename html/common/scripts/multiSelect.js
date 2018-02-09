/*
 *
 *  CREAZIONE FINESTRA PER RACCOGLIERE INFORMAZIONI IN CASO DI MULTISELEZIONE CON JQUERY DIALOG BOX:
 *  01/10/2017
 *  armagaet
 *
 *
 *  NOTE:
 *  + tutti gli attributi degli elementi devono essere valorizzati, altrimenti il plugin dataTable restituisce un errore, tipicamente '_DT_CellIndex undefined'. E' essenziale che gli elementi da restituire con un multiSelect debbano essere forniti tramite una vista per poterne cosi' controllare contenuto e nomi dei campi intelleggibili
 *  Occorre comunque GESTIRLO poiche' anche in alcune viste i campi vuoti sono ammessi...Vedi v_last_terma ad esempio.
 *  Ad ogni modo se gli elementi selezionati hanno un campo non valorizzato questo campo NON e' riportato tra gli attributi da OL, dunque sara' in ogni caso impossibile recuperarlo, ma almeno cerchiamo di evitare l'errore, creando l'array attrData che compilo pero' solo dal PRIMO elemento, potrebbe dunque non riportare TUTTI i campi, ma almeno EVITO l'errore
 *
 *  + gestire dimensioni della dialog: devono sempre tornare a quelle di default anche se e' stata resize dall'utente!
 *  In realta' ha lo stesso comportamento anche la funzione attuale presente su PiGal (per ArpaLo)
 *
 *  + aggiungi colonna ZOOM per andare sul singolo elemento, oppure attiva la funzione select su riga di dataTable. Meglio la riga
 *  Il comando sarebbe:
 *  mapPanel.map.zoomToExtent([left, bottom, right, top], closest=true)
 *
 *  closest=Find the zoom level that most closely fits the specified bounds.  Note that this may result in a zoom that does not exactly contain the entire extent.  Default is false.
 *
 *  cioe ad esempio:
 *  mapPanel.map.zoomToExtent([761450.317526, 5628215.818884, 761450.317526, 5628215.818884], true)
 *
 *  + Aggiungi ZOOM alla SELEZIONE. Messa nel titolo del layer
 *
 *  + ICONE copy e CSV: migliorale, magari piu piccole.
 *
 *  - Quando si seleziona un CLUSTER, alla chiusura della finestra il cluster non si deseleziona! e gli elementi non vengono contati nella maniera corretta. Come ovviare a questo? Come riconoscere se un layer e' clusterizzato oppure no? Forse non e' possibile farlo a meno di fare ennesimi cicli for...
 *
 *
*/

$(function () {
    $( "#multiselect_table" ).dialog({
      modal: false,
      width: 820,
      maxHeight: 600,
      autoOpen: false,
      dialogClass: 'ui-dialog-list', //per personalzizare tramite css la finestra
      draggable: true,
      resizable: true,
      position: ['center', 'center-20%'],
      show: { effect: "fade", duration: 500 },
      hide: 'blind',
      close: function( event, ui ) { 
	closed_from_user=1;
	//deseleziono tutti gli elementi:
	multiSelectCtrl.unselectAll();
      }
      //jquery-extendeddialog - opzioni non riconosciute
      //,minimizable: true, minimizeIcon: 'ui-icon-minus'
      /*buttons: {
        'chiudi': function() {
          $( this ).dialog( "close" );
        }
      }*/
    });
});


//funzione per aprire/chiudere una tabella:
function toggleTable(el, bounds_All) {
  id_tabella = 'multiTable'+el;
  var lTable = document.getElementById(id_tabella);
  lTable.style.display = (lTable.style.display == "table") ? "none" : "table";
  mapPanel.map.zoomToExtent( bounds_All, false );
}


function multiselect_table_open(layer_object) {

  //Carico JS esterni per abilitare export in PDF - non fanno in tempo ad essere riconosciuti dalla funzione!
  //loadjscssfile(root_dir_html+'/jQuery/jszip.min.js', "js"); ////dynamically load and add this .js file
  //loadjscssfile(root_dir_html+'/jQuery/pdfmake.min.js', "js"); //dynamically load and add this .js file
  //loadjscssfile(root_dir_html+'/jQuery/vfs_fonts.js', "js");      

    var mytable;
    var kk = 0;
    mydiv = $('<div></div>').attr({ id: "div1" });
    for(key in layer_object){
	var value = layer_object[key]; //key=id del layer
console.log(value);
	layername = value.name;
	numero_selezioni = value.features.length;

	//aggiungo il layer solo se ha almeno una feature selezionata:
	if (value.features.length>0) {
	  kk++;
	  boundsAll = [value.bounds.left, value.bounds.bottom, value.bounds.right, value.bounds.top];
	  //Provo ad aggiungere un href per aprire/chiudere la tabella:
	  id_href = 'vediTab'+kk;

	  if (kk==1) $('<a></a>').html('<b>Layer: ' + value.name + '</b> ('+value.features.length+' elementi selezionati)<br/>').attr({ id:id_href, onclick:'toggleTable('+kk+', [' + boundsAll + ']);', href:'#'}).appendTo(mydiv);
	  else $('<a></a>').html('<br/><b>Layer: ' + value.name + '</b> ('+value.features.length+' elementi selezionati)<br/>').attr({ id:id_href, onclick:'toggleTable('+kk+', [' + boundsAll + ']);', href:'#'}).appendTo(mydiv);

	  //inizio la creazione della tabella:
	  id_tabella = 'multiTable'+kk;
          mytable = $('<table></table>').attr({ id:id_tabella, style:"border:1px solid #ccc; border-collapse:collapse; display:none;" });
          var tr = [];
	  var tbody;


	  //ciclo dentro le features selezionate:
	  for(var i=0, len=value.features.length; i<len; ++i) {
            var feature = value.features[i];

	    //Se volessi estendere un oggetto bounds con le bounds di tutte le features selezionate:
	    //ol_bounds = new OpenLayers.Bounds();
	    //ol_bounds.extend(feature.geometry.getBounds());

	    //aggiungo header campi tabella:
	    if (i==0) {
		var attrData = []; //creo un array dove ospitare i nomi degli attributi in modo da evitare l'errore '_DT_CellIndex'. Ad ogni modo lo prendo solo dal PRIMO elemento, e' dunque un po' random i campi che puo' restituire....
		var theader = $('<thead></thead>').appendTo(mytable);
		var row = $('<tr></tr>').attr({ style: "font-size: small;font-weight: bold;" }).appendTo(theader);
		//Come prima colonna aggiungo il bounds della singola feature:
		$('<th></th>').text('bounds').attr({ style: "display:none;" }).appendTo(row);
		//SE CLUSTER:
		if (feature.cluster != null && feature.cluster.length>0) {
		    for(heads in feature.cluster[0].attributes) { //qui recupero le colonne
                         $('<th></th>').text(heads).attr({ style:"border:1px solid #ccc; font-weight:bold;" }).appendTo(row);
			 attrData.push(heads);
                    }
		}
		else { //no cluster
		  for(heads in feature.attributes) { //qui recupero le colonne
		    $('<th></th>').text(heads).attr({ style:"border:1px solid #ccc; font-weight:bold;" }).appendTo(row);
		    attrData.push(heads);
		  }
		}
		tbody = $('<tbody></tbody>').appendTo(mytable);
//console.log('array campi='+attrData);
	    }
            //var row = $('<tr></tr>').attr({ style: "font-size: small;" }).appendTo(tbody);
	    //SE CLUSTER:
	    if (feature.cluster != null && feature.cluster.length>0) {
		lenj=feature.cluster.length;
		for(var j=0; j<lenj; j++) { //ciclo dentro i vari elementi del cluster
		    var row = $('<tr></tr>').attr({ style: "font-size: small;" }).appendTo(tbody);
		    //Come prima colonna aggiungo il bounds:
		    boundsEl = [feature.cluster[j].geometry.bounds.left, feature.cluster[j].geometry.bounds.bottom, feature.cluster[j].geometry.bounds.right, feature.cluster[j].geometry.bounds.top];
            	    $('<td></td>').html(boundsEl.toString()).attr({ id:"boundEl", style: "display:none;" }).appendTo(row);

            	    //for(keys in feature.cluster[j].attributes) { //qui recupero il contenuto delle colonne
		    //per evitare di recuperare campi nulli e dunque dare errore '_DT_CellIndex' ciclo su un array di attributi recuperati dal primo elemento:
		    for(var ii=0; ii<attrData.length; ii++) {
		      keys = attrData[ii];
                      valore_campo = feature.cluster[j].attributes[keys] || 'null'; //se alcuni campi son nulli il dataTable da errore!
                      $('<td></td>').html(valore_campo).attr({ style: "border:1px solid #ccc;" }).appendTo(row);
            	    }
		}
            } //fine opzione cluster

	    else {
	      var row = $('<tr></tr>').attr({ style: "font-size: small;" }).appendTo(tbody);
	      //Come prima colonna aggiungo il bounds:
	      boundsEl = [feature.geometry.bounds.left, feature.geometry.bounds.bottom, feature.geometry.bounds.right, feature.geometry.bounds.top];
              $('<td></td>').html(boundsEl.toString()).attr({ id:"boundEl", style: "display:none;" }).appendTo(row);

	      //for(keys in feature.attributes) { //qui recupero il contenuto delle colonne
	      //per evitare di recuperare campi nulli e dunque dare errore '_DT_CellIndex' ciclo su un array di attributi recuperati dal primo elemento:
	      for(var ii=0; ii<attrData.length; ii++) {
                keys = attrData[ii];
	        valore_campo = feature.attributes[keys] || 'null'; //se alcuni campi son nulli il dataTable da errore! cmq questa ternary operation non risolve il problema
//console.log('Chiave='+keys+' ; valore='+feature.attributes[keys]);
		$('<td></td>').html(valore_campo).attr({ style: "border:1px solid #ccc;" }).appendTo(row);
	      }
	    } //fine opzione no cluster

	  }
	  mytable.appendTo(mydiv);
//console.log(mytable.html());
	}
    }
    if (kk==0) $('<p></p>').html('<i>Nessun elemento selezionato in mappa oppure elementi selezionati non disponibili per la multiselezione</i>').appendTo(mydiv);
//mytable.appendTo("#multiselect_table"); //questo append non funziona
    //$("#multiselect_table").html(mytable.html()); //ok, pero voglio provare ad aggiungere anche dei div
    $("#multiselect_table").html(mydiv.html());

    //ancora qualache baco, devo renderla dinamica, poi risolvere l'errore sulle colonne vuote
    for (jj=1; jj<=kk; jj++) {
    //provo a far diventare la tabella html un oggetto dataTable:
    //per stoccarla in una variabile dinamica, perpoi attivare azione sulla riga - ma non funziona col metodo row()
    //window["myTable" + jj] = $('#multiTable'+jj).DataTable( {
    $('#multiTable'+jj).DataTable( {
        //dom: 'Bfrtip'
        dom: 'Bt',
	"pageLength": 25 //numero di record massimo. Default 10
        ,buttons: [
            //'copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5'
	    {
                extend: 'copyHtml5',
                title: '',
		titleAttr: 'Copia negli appunti'
		, text: ''
		, className: 'copybtn' //classe personalizzata: non funziona
		,exportOptions: {
                    //columns: ':visible', //in realta non funziona, forse la proprieta visible e da intendersi in altro modo
		    columns: ':not(:first-child)'
                }
		//className per usare classi, notamente Bootstrap - non funziona
		//, className: 'btn btn-primary glyphicon glyphicon-duplicate'
            }
	    ,{  extend: 'csvHtml5',
		title: 'data_export',
		titleAttr: 'Esporta come CSV'
		,text: ''
		, className: 'csvbtn'
		,exportOptions: {
		    columns: ':not(:first-child)'
                }
	    }
	    //PDF richiede una libreria troppo pesante, idem excel, quasi 2MB
            /*,{
                extend: 'pdfHtml5',
                title: 'data_export',
	        orientation: 'landscape',
		titleAttr: 'Esporta come PDF',
		text: ''
                , className: 'pdfbtn'
            }*/
        ]
    } );

    //Azione su riga:
    $('#multiTable'+jj+' tbody').on('click', 'tr', function() {
	//var id = myTable.fnGetData(this)[0]; //FAIL, vecchio metodo a quanto pare
	//console.log($('#multiTable'+jj).row(this).data()); //FAIL
	//console.log( myTable.row( this ).data() ); //se metto una variabile fissa funziona solo su 1 tabella
	//console.log( eval("myTable"+jj).row( this ).data() ); //cosi mi tira fuori un myTable4 che non esiste..
	ecco_il_bound = $(this).find("td[id='boundEl']").html();
	mapPanel.map.zoomToExtent( ecco_il_bound.split(",") , true);
	//se lo zoom sembra troppo vicino provare il metodo map.setCenter(lonlat,zoom_center);
    });

    }

    //$( "#multiselect_table" ).dialog( "option", "minimizable", true ); //opzione per extensiondialog non riconosciuta
    $("#multiselect_table").dialog('open');
}


