/*
 *

Riconosce il browser per attivare o meno delle funzioni:

Browser name: BrowserDetect.browser
Browser version: BrowserDetect.version
OS name: BrowserDetect.OS

 *
 */

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
                        string: navigator.userAgent,
                        subString: "Trident",
                        identity: "Explorer11",
                        versionSearch: "Trident"
                },
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
                           string: navigator.userAgent,
                           subString: "iPad",
                           identity: "iPad"
            	},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

//MANUTENZIONE:
//alert("SERVIZIO MOMENTANEAMENTE FUORI USO CAUSA MANUTENZIONE SU HARDWARE!\nAlcuni servizi potrebbero non essere aggiornati.\nRiprenderemo appena possibile. Scusate per il disagio.");

if (BrowserDetect.browser == "Explorer") {
        alert("ATTENZIONE! IRIS non e' pienamente compatibile con IEXplorer, alcuni tematismi potrebbero non essere visualizzati corettamente e alcune funzionalita' potrebbero essere limitate. Si consiglia di usare Google Chrome o Mozilla.");
}
else if (BrowserDetect.browser == "Explorer11") {
        alert("ATTENZIONE! BROWSER NON PIENAMENTE SUPPORTATO! Se ne sconsiglia l'uso in quanto alcuni temi potrebbero non venire correttamente visualizzati, oltre che per la lentezza del browser stesso.");

	/* 
	* Override: OpenLayers.Format.XML 
	* This file holds overrides for the <OpenLayers.Format.XML> class. 
	* Workaround BUG IE 11 
	* http://osgeo-org.1560.x6.nabble.com/WFS-and-IE-11-tp5090636p5093321.html 
	*/ 
	/* da:
	* http://osgeo-org.1560.x6.nabble.com/WFS-from-Tinyows-on-IExplorer-InvalidParameterValue-td5200463.html#a5201040
	* http://osgeo-org.1560.x6.nabble.com/WFS-and-IE-11-td5090636.html#a5093321
	*/
	/* 
	* Method: write 
	* This override do a search-replace on the rogue text in the XML namespace After the XML has been generated 
	*/ 
	var _class = OpenLayers.Format.XML; 
	var originalWriteFunction = _class.prototype.write; 
	var patchedWriteFunction = function() 
	{ 
       	 var child = originalWriteFunction.apply( this, arguments ); 
        
       	 // NOTE: Remove the rogue namespaces as one block of text.
       	 //       The second fragment "NS1:" is too small on its own and could cause valid text (in, say, ogc:Literal elements) to be erroneously removed
       	 child = child.replace(new RegExp('xmlns:NS\\d+="" NS\\d+:', 'g'), ''); 
        
       	 return child; 
	} 

	_class.prototype.write = patchedWriteFunction; 

	}

//console.log('Appname='+navigator.appName+' and UserAgent='+navigator.userAgent);

/*
if (BrowserDetect.OS == "iPad") {
}
*/
