// Create user extensions namespace (Ext.ux)
Ext.namespace('GeoExt');


/**
  * Ext.Ol.toolTip Extension Class
  *
  * @author Van De Casteele Arnaud
  * @version 1.0
  *
  * Purpose : extends Ext Api with OL API
  * Show PopUp on OL feature 
  * Date : 17/02/2009
  *
  */

/**
 * @requires Ext.ToolTip.js
 */

/** 
 * Exemple of use :			
 *
 *	tt = new GeoExt.toolTip({
 *		map: map,
 *		featureLayer : vectors,
 *		autoHeight : true,
 *		autoWidth : true,
 *		hidden: true,
 *		autoHide: true,
 *		plain: true,
 *		showDelay: 0,
 *		hideDelay: 0,
 *		trackMouse: true,
 *		animCollapse : true
 *	});	
 *
 */

/**
  *
  * @constructor
  * @param {Object} config Configuration options
  */
GeoExt.toolTip = function(config) {
    // call parent constructor
    Ext.apply(this, config);
    GeoExt.toolTip.superclass.constructor.call(this, config);  
};
 

Ext.extend(GeoExt.toolTip, Ext.ToolTip, {
	/**
	 * Property: map
	 * Map Object
	 */
	map : null,

	/**
	 * Property: featureLayer
	 * Vector Layer Object
	 */
	featureLayer : null,

	/**
	 * Property: hoverFeature
	 * Fonction events
	 */
	hoverFeature : null,

	/**
	 * Constructor
	 */     
	initComponent: function() {
		//New paramz Ol with Ext
		this.target = this.map.div.id;             
		this.hoverFeature(this.featureLayer);  
		//Override defaults paramz of Ext
		this.title = " ";       
		this.disable();
		GeoExt.toolTip.superclass.initComponent.call(this);       
	},

	/**
	 * Methode : Show
	 * Override the defaults Ext show() method
	 * to add new properties
	 */
	hoverFeature : function(vector){
		tooltipsParent = this;
		var sf = new OpenLayers.Control.SelectFeature(
			//vectors,
			sismi,
			{
				parent : tooltipsParent,
			    clickout: false, toggle: false,
			    multiple: false, hover: true,
			    toggleKey: "ctrlKey", // ctrl key removes from selection
			    multipleKey: "shiftKey", // shift key adds to selection 
				callbacks: {'over':this.showFeat, 'out': this.hideFeat}					                
			}
		);
	
		this.map.addControl(sf);
		sf.activate();
	},
		
	/**
	 * Methode : ShowFeat
	 * Override the defaults Ext show() method
	 * to add new properties
	 */
	showFeat : function(feat){
	   feat.layer.drawFeature(feat,"temporary");	  
		this.parent.setTitle(feat.attributes.magnitudo); 
		GeoExt.toolTip.superclass.show.call(this.parent);
	},

	/**
	 * Methode : hideFeat
	 * Override the defaults Ext hide() method
	 * to add new properties
	 */
	hideFeat : function(feat){	
		/*		 
		 * For the next version to use it with an array
		 */
		/*var a=cb.getSelections();		
		if(a.length==0){
			vectors.drawFeature(feat,"default")
		}else{
			for(i=0;i<a.length;i++){						
				if(feat.attributes.ID==a[i].data.ID){								
					vectors.drawFeature(feat,"select");
					break;
				}else{							
					vectors.drawFeature(feat,"default");
				}		
			}// EO for
		}//EO else*/
		feat.layer.drawFeature(feat,"default");
		GeoExt.toolTip.superclass.hide.call(this.parent);
	}
}); //EOF extend
Ext.reg('toolTip', GeoExt);
