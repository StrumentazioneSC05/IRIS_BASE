/* This is the FlAniS -- Flash version of the AnimationS applet.

This code is Copyright(C) 2008-2010 by Tom Whittaker. You may use
this for any lawful purpose, and we are not responsible for what you
do with it. It was developed as an outcome of the  VISIT Project and
uses many methods and ideas from the VISITview collaborative 
training / distance learning tool. 
*/

// this is compiled with the mxmlc using the flanis.mxml template...
//

package {
  import mx.controls.Button;
  import mx.controls.CheckBox;
  import mx.controls.ComboBox;
  import mx.controls.Label;
  import mx.controls.HSlider;
  import mx.controls.RadioButton;
  import mx.controls.RadioButtonGroup;
  import mx.controls.ProgressBar;
  import mx.controls.Alert;
  import mx.controls.TextArea;
  import mx.core.*;
  import mx.containers.HBox;
  import mx.containers.VBox;
  import mx.containers.Canvas;
  import mx.containers.Panel;
  import mx.containers.TitleWindow;

  import mx.core.UIComponent;
  import mx.events.SliderEvent;
  import mx.events.ListEvent;
  import mx.events.CloseEvent;
  import mx.utils.StringUtil;
  import mx.formatters.NumberFormatter;
  import flash.display.Loader;
  import flash.display.Bitmap;
  import flash.display.Sprite;
  import flash.display.BitmapData;
  import flash.display.Graphics;
  import flash.display.SimpleButton;
  import flash.display.Shape;
  import flash.events.Event;
  import flash.events.EventPhase;
  import flash.events.MouseEvent;
  import flash.events.KeyboardEvent;
  import flash.events.IOErrorEvent;
  import flash.events.SecurityErrorEvent;
  import flash.events.HTTPStatusEvent;
  import flash.external.ExternalInterface;
  import flash.filters.ColorMatrixFilter;
  import flash.net.URLRequest;
  import flash.geom.Point;
  import flash.geom.Rectangle;
  import flash.geom.Matrix;
  import flash.geom.ColorTransform;
  import flash.printing.PrintJob;
  import flash.printing.PrintJobOptions;

  import flash.utils.Timer;
  import flash.events.TimerEvent;
  import flash.system.System;
  import flash.system.Capabilities;

  import flash.net.*;
  import flash.text.*;
  import flash.media.Sound;

  import mx.managers.PopUpManager;
  


  public class FlAniS {

    [Embed (source='OpenSans-Regular.ttf', fontName="OpenSans", fontWeight="normal", mimeType="application/x-font")] public var myFontReg:Class;
    [Embed (source='OpenSans-Bold.ttf', fontName="OpenSans", fontWeight="bold", mimeType="application/x-font")] public var myFontBold:Class;

    private var version:String;

    private var isDebug:Boolean;
    private var debugTextArea:TextArea;
    private var debugText:String;

    private var s:Array;
    private var background:int;
    private var foreground:int;
    private var usingIP:Boolean;
    private var onlyShowFirstImage:Boolean;
    private var quietReload:Boolean;
    private var quietLoadem:Boolean;
    private var noControls:Boolean;
    private var useProgressBar:Boolean;
    private var isLoading:Boolean;
    private var countFrames:int;
    private var doExcludeCaching:Boolean;
    private var excludeCaching:String;
    private var useCaching:Boolean;
    private var useAntiCaching:Boolean;
    private var antiCacheIndex:int;
    private var baseStatic:Boolean;
    private var baseEnhance:int;
    private var imageBase:String;
    private var startingMinute:int;
    private var utcOffset:int;
    private var tzLabel:String;
    private var timeColor:int;
    private var timeBack:int;
    private var timeFontSize:int;
    private var timeFontWeight:String;
    private var its:int;

    private var showButt:Button;
    private var printButt:Button;
    private var zoom:Button;
    private var zoomLabelTrue:String;
    private var zoomLabelFalse:String;
    private var zoomLabelColors:Array;
    private var keepZoom:Boolean;
    private var activeZoom:Boolean;
    private var zoomScale:Number;
    private var zoomXFactor:Number;
    private var zoomYFactor:Number;
    private var zoomFactorMax:Number;
    private var zoomXBase:Number;
    private var zoomYBase:Number;
    private var isZooming:Boolean;
    private var isInitialZoom:Boolean;
    private var initialZoom:Number;
    private var enableZooming:Boolean;
    private var frameLabelWidth:int;
    private var frameLabelField:Label;
    private var hasFrameLabel:Boolean;
    private var frameLabels:Array;

    private var doLayoutControls:Boolean;
    private var useBottomControls:Boolean;
    private var looprock:Button;
    private var looprockLabelTrue:String;
    private var looprockLabelFalse:String;
    private var looprockLabelColors:Array;
    private var isLoopRock:Boolean;
    private var loopDirection:int;
    private var isRocking:Boolean;
    private var autoOnOff:Button;
    private var autoOnOffLabelTrue:String;
    private var autoOnOffLabelFalse:String;
    private var autoOnOffLabelColors:Array;
    private var refreshRate:int;
    private var refreshTimer:Timer;
    private var autoState:Boolean;
    private var refresh:Button;
    private var isAutoRefresh:Boolean;
    private var showAllOnOff:Boolean;
    private var onOffWidth:int;
    private var onOffHeight:int;
    private var onOffSpacing:int;
    private var onOffState:Array;
    private var onOffMin:int;
    private var onOffMax:int;
    private var onOffDoingRange:Boolean;
    private var onOffBM:Bitmap;
    private var onOffRect:Rectangle;
    private var onOffBMD:BitmapData;
    private var onOffUI:UIComponent;
    private var onOffSprite:Sprite;
    private var onOffBackground:uint;
    private var isOnOff:Boolean;
    private var incFrame:int;

    private var stepBack:Button;
    private var stepForward:Button;
    private var isStepping:Boolean;
    private var stepFirst:Button;
    private var stepLast:Button;

    private var isWiping:Boolean;
    private var wiperButt:Button;
    private var wiperLabelOff:String;
    private var wiperLabelOn:String;
    private var wiperLabelColors:Array;
    private var wiperLine:Boolean;
    private var wiperLineColor:uint;

    private var setFrameScrollbar:HSlider;
    private var setFrameText:String;
    private var isSetFrameScrollbar:Boolean;

    private var setFaderScrollbar:HSlider;
    private var faderToggle:Button;
    private var setFaderText:String;
    private var isFader:Boolean;
    private var isFading:Boolean;
    private var numFadeSteps:int;
    private var faderFrame:int;
    private var faderImages:Array;
    private var isShowingFrames:Boolean;
    private var bgndInit:Boolean;
    private var ptt:Point;
    private var oo:int;
    private var scale:int;
    private var ptxy:Point;
    private var wPoint:Point;
    private var wRect:Rectangle;

    private var faderLabel:String;
    private var startFrame:int;
    private var basename:String;
    private var baseNumber:int;
    private var numFrames:int;
    private var currentFrame:int;
    private var deadFrames:int;
    private var firstFrame:int;
    private var lastFrame:int;
    private var endFrame:int;

    private var enh:Array;
    private var enhNames:Array;
    private var enhanceChoice:ComboBox;
    private var madeEnhBitmaps:Boolean;
    private var enhBitmaps:Array;
    private var enhOverlay:int;

    private var location:Array;
    private var lat:Number;
    private var lon:Number;
    private var isLoc:Boolean;
    private var is180:Boolean;
    private var doingLoc:Boolean;
    private var locLabel:Label;
    private var locLabelDigits:int;
    private var locLabelFirst:String;
    private var locLabelSecond:String;
    private var xMouse:int;
    private var yMouse:int;
    private var xProbe:int;
    private var yProbe:int;
    private var probePix:int;
    private var probePrecision:int;
    private var probeVal:Number;
    private var pixPrefix:String;
    private var pixLabel:String;
    private var pixUnits:String;
    private var locOffset:int;
    private var locButt:Button;
    private var locLabelOff:String;
    private var locLabelOn:String;
    private var locLabelColors:Array
    private var locLabels:Array;

    private var vb:VBox;
    private var vbc:VBox;
    private var hb:HBox;
    private var controlBox:HBox;
    private var overlayControlBox:Container;
    private var overlayControlContainer:VBox;
    private var speed:HSlider;
    private var dwell:int;
    private var minSpeed:int;
    private var maxSpeed:int;
    private var mySpeed:int;
    private var addDwell:int;
    private var pauseOnLast:int;
    private var pausePercent:int;
    private var startstop:Button;
    private var startstopLabelTrue:String;
    private var startstopLabelFalse:String;
    private var startstopLabelColors:Array;
    private var bm:Bitmap;
    private var grandma:Application;
    private var mom:Canvas;
    private var contentX:int;
    private var contentY:int;
    private var sp:Sprite;
    private var timer:Timer;
    private var fofTimer:Timer;
    private var isLooping:Boolean;
    private var wasLooping:Boolean;
    private var isOverlay:Boolean;
    private var overlay:Array;
    private var overlayLinks:Array;
    private var overlayOrder:Array;
    private var overlayEnhance:Array;
    private var overlayPreserve:Array;
    private var overlayHidden:Array;
    private var overlayStatic:Array;
    private var overlayZoom:Array;
    private var overlayTransparentAmount:Array;

    private var ct:ColorTransform;
    private var transparency:int;
    private var numOverlayLabels:int;
    private var doneOverlayMask:Array;
    private var overlayMask:Array;

    private var probeValues:Array;
    private var probeUnits:Array;
    private var probePrefixes:Array;
    private var probeDecimals:Array;
    private var probeLabels:Array;
    private var probeOneUnit:String;
    private var probeOnePrefix:String;
    private var probeOneDecimal:int;
    private var probeFontSize:int;
    private var probeBgColor:int;
    private var probeFgColor:int;
    private var probeFormatter:NumberFormatter;
    
    private var probe:Button;
    private var probeLabelColors:Array;
    private var isProbe:Boolean;
    private var probeEnabled:Boolean;

    private var fnList:Array;
    private var biList:Array;
    private var olList:Array;
    private var hiresFnList:Array;
    private var fnDwell:Array;
    private var useDwell:Boolean;
    private var minDwell:int;
    private var canResetDwell:Boolean;

    private var hsButton:Array;
    private var hsUI:UIComponent;
    private var hsType:Array;
    private var hsValue:Array;
    private var hsPoint:Array;
    private var hsPan:Array;
    private var hsBitmaps:Array;
    private var hsColor:int;
    private var hsImageNames:Array;
    private var hsLoaders:Array;
    private var hsLoaderInfo:Array;
    private var hsSimButts:Array;
    private var hsCan:Canvas;

    private var doingHotspots:Boolean;
    private var loadingHotspot:Boolean;

    private var backhsButton:Array;
    private var backhsType:Array;
    private var backhsValue:Array;
    private var doingBackHotspots:Boolean;
    private var loadingBackHotspot:Boolean;

    private var drawingPaper:Canvas;
    private var probePaper:UIComponent;

    private var soundClip:Sound;

    private var extrap:Button;
    private var extrapLabelTrue:String;
    private var extrapLabelFalse:String;
    private var extrapLabelColors:Array;
    private var extrapMode:int;
    private var extrapStep:Timer;
    private var doingExtrap:Boolean;
    private var isExtrap:Boolean;
    private var showExtrapResults:Boolean;
    private var extrapTimes:Array;
    private var extrapTimesTemplate:RegExp;
    private var extrapAMPM:Boolean;
    private var minutes:Array;
    private var toFrom:Boolean;
    private var toFromLock:Boolean;
    private var extrapX:Array;
    private var extrapY:Array;
    private var xExtrap:int;
    private var yExtrap:int;

    private var pbar:ProgressBar;
    private var totalFrames:int;
    private var initialLoad:Boolean;
    private var fofErrorCount:int;
    private var imgList:Array;
    private var hiresImgList:Array;
    private var singleImage:Array;
    private var imgSmoothList:Array;
    private var imgUIBack:UIComponent;
    private var imgLoaderList:Array;
    private var hiresImgLoaderList:Array;
    private var imgLoaderInfoList:Array;
    private var hiresImgLoaderInfoList:Array;
    private var imgZoomableList:Array;
    private var preserve:Array;
    private var preserveOlay:Array;
    private var preRect:Rectangle;
    private var prePoint:Point;
    private var xImage:int;
    private var yImage:int;
    private var hasCoordinates:Boolean;
    private var distance:Number;
    private var distUnit:String;
    private var distFgColor:int;
    private var distBgColor:int;
    private var distFontSize:int;
    private var distPrecision:int;
    private var distFormatter:NumberFormatter;
    private var showBearing:Boolean;
    private var showGC:Boolean;
    private var bearingType:String;
    private var bearingTo:Number;
    private var bearingFrom:Number;
    private var mapScale:Number;
    private var hasScale:Boolean;

    private var begLat:Number;
    private var endLat:Number;
    private var begLon:Number; 
    private var endLon:Number;
    private var xLineBeg:int;
    private var yLineBeg:int;
    private var xLineEnd:int;
    private var yLineEnd:int;
    private var xScreen:int;
    private var yScreen:int;
    private var xMove:int;
    private var yMove:int;
    private var bmdp:BitmapData;
    private var bmPal:BitmapData;
    private var bmBack:Bitmap;
    private var bmBackground:BitmapData;
    private var bmBackCreated:Boolean
    private var bmBackLoaded:Array
    private var bmWidth:int;
    private var bmHeight:int;
    private var userWindowSize:Boolean;
    private var imgWidth:int;
    private var imgHeight:int;


    private var biComp:UIComponent;
    private var biSprite:Sprite;
    private var usingBI:Boolean;

    private var activeKey:int;
    private var backSprite:Sprite;

    private var upperLeft:Point;
    private var lowerRight:Point;
    private var imgRect:Rectangle;
    private var bmRect:Rectangle;
    private var isDragging:Boolean;
    private var isDrawingLine:Boolean;

    private var paramNames:Array;
    private var paramValues:Array;
    private var pLabels:Array

    private var verLab:Label;

    private var DTR:Number = .01745329252;
    private var reBar:RegExp;

    // Application point of entry

    public static function main(defConfig:int):void {
      var ec:FlAniS = new FlAniS();
      ec.letterroll(defConfig);
    }


/** letterroll()
*
* Why did we call it this?
*
*/
    public function letterroll(defConfig:int):void {

      grandma = Application(Application.application);
      grandma.layout="absolute";
      grandma.horizontalScrollPolicy=ScrollPolicy.OFF;
      grandma.verticalScrollPolicy=ScrollPolicy.OFF;
      grandma.frameRate = 1;

      mom = new Canvas();
      mom.height = grandma.height;
      mom.width = grandma.width;
      mom.setStyle("backgroundColor", grandma.getStyle("backgroundColor"));
      mom.setFocus();
      mom.addEventListener(KeyboardEvent.KEY_DOWN, kclick);
      mom.addEventListener(KeyboardEvent.KEY_UP, kclick);
      mom.horizontalScrollPolicy=ScrollPolicy.OFF;
      mom.verticalScrollPolicy=ScrollPolicy.OFF;
      grandma.addChild(mom);

      initialLoad = true;
      canResetDwell = false;
      currentFrame = 0;
      bmBackCreated = false;
      zoomXFactor = 1.0;
      zoomYFactor = 1.0;
      isZooming = false;
      enableZooming = false;
      isDragging = false;
      isDrawingLine = false;
      isOverlay = false;
      incFrame = 1;
      isFader = false;
      isFading = false;
      isWiping = false;
      isProbe = false;
      probePix = 0;
      probeVal = Number.NaN;
      probeEnabled = false;
      preRect = new Rectangle();
      prePoint = new Point();
      madeEnhBitmaps = false;
      locOffset = 20;
      hasCoordinates = false;
      reBar = /\|/g;
      fofErrorCount = 0;
      numFadeSteps = 10;


      upperLeft = new Point(0,0);
      lowerRight = new Point(mom.width,mom.height);  // until image defined
      ptxy = new Point();

      ct = new ColorTransform(1.0,1.0,1.0,1.0);
      version = "FlAniS version 3.0";

      trace(version);
      debugText = version+"\n";

      // all set up must be serialized, since there is no
      // other way to do it...hmmmm....

      // start with the deadman timeout timer for file-of-filenames
      fofTimer = new Timer(2000);
      fofTimer.addEventListener(TimerEvent.TIMER,
         function(e:Event):void {
           fofTimer.stop();
           getImageFilenames(); 

         }
      );

      paramNames = new Array();
      paramValues = new Array();

      // see if name supplied in Flashvars
      var cfname:String = grandma.parameters.configFilename;
      if (defConfig == 1) cfname = "flanis.cfg";

      if (cfname == null) {
        debugText = debugText + "\n NO config filename!";
        configParams();

      } else {

        trace ("config filename = "+cfname);
        debugText = debugText +"\nConfig filename = "+cfname;
        if (cfname.indexOf("?") > 0) {
          cfname = cfname.replace(reBar,"&");
          debugText = debugText + "\nPHP config = "+cfname;
        }
        //debugText = debugText + "\nIP = "+getUserIP();

        isLoading = false;

        try {
          var configLoader:URLLoader = new URLLoader();
          configLoader.dataFormat = URLLoaderDataFormat.TEXT;
          configLoader.addEventListener(Event.COMPLETE, configLoaded);
          configLoader.addEventListener(IOErrorEvent.IO_ERROR, errorLoadingConfigFile);

          var request:URLRequest = new URLRequest(cfname);

          // turn off caching ?
          request.requestHeaders.push(new URLRequestHeader("Cache-Control","no-store,max-age=0,no-cache,must-revalidate"));
          request.requestHeaders.push(new URLRequestHeader("Expires","Mon, 26 Jul 1997 05:00:00 GMT"));
          request.requestHeaders.push(new URLRequestHeader("Pragma","no-cache"));

          configLoader.load(request);

        } catch (ibce:Error) {
          Alert.show("Unable to load config file: "+cfname+" Error="+ibce);
        }
      }
    }





/** configLoaded(Event)
*
* after getting the "configFile", parse it and create lists for
* getParameter() calls...
*
*/
 
    private function configLoaded(event:Event) : void {

      trace("into configLoaded.........");
      var cfl:URLLoader = URLLoader(event.target);
      cfl.removeEventListener(Event.COMPLETE, configLoaded);
      cfl.removeEventListener(IOErrorEvent.IO_ERROR, errorLoadingConfigFile);

      var lines:Array = cfl.data.split("\n");
      var eqinx:int = 0;

      // first, parse the basic requests
      for (var i:int=0; i<lines.length; i++) {
        if (lines[i].length < 5) continue;
        eqinx = lines[i].indexOf("=");
        if (eqinx < 1) continue;

        trace("text:  "+lines[i]);

        paramNames.push(StringUtil.trim(
               lines[i].substring(0,eqinx)).toLowerCase());

        var args:Array = lines[i].substring(eqinx+1).split(",");

        // scan the array and trim the values
        for (var k:int=0; k<args.length; k++) {
          args[k] = StringUtil.trim(args[k]);
        }

        trace("name="+paramNames[paramNames.length-1]+"  args = "+args);
        debugText = debugText+ "\n param name="+paramNames[paramNames.length-1]+"  args = "+args;

        paramValues.push(args);
      }

      configParams();
    }
    


/** configParams()
*
* now get the parameters off the flashVars list, if any...
*
*/
    private function configParams() : void {

      // now add in all the flashVars parameters
      debug("in configParams");
      var fvars:Object = grandma.parameters;
      var args:Array;
      if (fvars != null) {
        var key:String;
        var keyval:String;
        for (key in fvars) {
          //trace("fvars = "+key+"  val="+fvars[key]);
          debugText = debugText+"\nfvars = "+key+"  val="+fvars[key];
          paramNames.push(StringUtil.trim(key));

          args = fvars[key].split(",");
          for (var k:int=0; k<args.length; k++) {
            args[k] = StringUtil.trim(args[k]);
          }
          paramValues.push(args);
        }
      }


      // done with setup for getParameter()....

      isDebug = false;
      s = getParameter("debug");
      if (s !=null && s[0].toLowerCase() == "true") {
        isDebug = true;
        debugTextArea = new TextArea();
        debugTextArea.editable = false;
        debugTextArea.wordWrap = true;
        debugTextArea.text = debugText;
        debugTextArea.width=430;
        debugTextArea.height=200;
        var debugButt:Button = new Button();
        debugButt.label = "Close";
        var debugClear:Button = new Button();
        debugClear.label = "Clear";
        var debugPanel:Panel = new Panel();
        debugPanel.title = "FlAniS Debug Panel";
        debugPanel.width = 450;
        debugPanel.height = 280;
        debugPanel.addChild(debugTextArea)
        var debughb:HBox = new HBox();
        debughb.addChild(debugButt);
        debughb.addChild(debugClear);
        debugPanel.addChild(debughb);
        PopUpManager.addPopUp(debugPanel, grandma, false);
        PopUpManager.centerPopUp(debugPanel);

        debugButt.addEventListener(MouseEvent.CLICK,
          function(e:Event):void {
            isDebug = false;
            PopUpManager.removePopUp(debugPanel);
            mom.setFocus();
          }
        );

        debugClear.addEventListener(MouseEvent.CLICK,
          function(e:Event):void {
            debugTextArea.text = version+"\n";
          }
        );

      }


      s = getParameter("height");
      if (s != null) {
        mom.height = parseInt(s[0]);
      }

      s = getParameter("width");
      if (s != null) {
        mom.width = parseInt(s[0]);
      }

      background = mom.getStyle("backgroundColor");
      s = getParameter("backcolor");
      if (s != null) {
        background = parseHex(s[0]);
        mom.setStyle("backgroundColor", background);
      }

      foreground = mom.getStyle("color");
      s = getParameter("forecolor");
      if (s != null) {
        foreground = parseHex(s[0]);
        mom.setStyle("color", foreground);
      }

      s = getParameter("hotspot_color");
      hsColor = 0;
      if (s != null) hsColor = parseHex(s[0]);

      s = getParameter("font_size");
      if (s != null) {
        mom.setStyle("fontSize",parseInt(s[0]));
      }

      usingIP = false;
      s = getParameter("use_IP");
      if (s != null && s[0].toLowerCase() == "true") usingIP = true;

      onlyShowFirstImage = false;
      s = getParameter("only_show_first_image");
      if (s != null && s[0].toLowerCase() == "true") onlyShowFirstImage = true;

      quietReload = false;
      quietLoadem = false;
      s = getParameter("quiet_reload");
      if (s != null && s[0].toLowerCase() == "true") quietReload = true;
      if (s != null && s[0].toLowerCase() == "very") {
        quietReload = true;
        quietLoadem = true;
      }

      noControls = false;
      s = getParameter("no_controls");
      if (s != null && s[0].toLowerCase() == "true") noControls = true;

      useProgressBar = true;
      s = getParameter("use_progress_bar");
      if (s != null && s[0].toLowerCase() == "false") useProgressBar = false;

      doExcludeCaching = false;
      s = getParameter("exclude_caching");
      if (s != null) {
        doExcludeCaching = true;
        excludeCaching = s[0];
      }

      useCaching = false;
      s = getParameter("use_caching");
      if (s != null && s[0].toLowerCase() == "true") useCaching = true;

      useAntiCaching = true;
      s = getParameter("use_anti_caching");
      if (s != null) {
        if (s[0].toLowerCase() == "true") useAntiCaching = true;
        if (s[0].toLowerCase() == "false") useAntiCaching = false;
      }

      baseEnhance = -1;
      s = getParameter("base_enhance_table");
      if (s == null) s = getParameter("base_enhance");
      if (s == null) s = getParameter("enhance_base");
      if (s != null) baseEnhance = parseInt(s[0])-1;
      if (baseEnhance <= 0) baseEnhance = -1;

      baseStatic = false;
      s = getParameter("base_static");
      if (s != null && s[0].toLowerCase() == "true") baseStatic = true;

      imageBase = null;
      s = getParameter("image_base");
      if (s != null) imageBase = s[0];

      fnList = new Array();
      s = getParameter("filenames");
      if (s != null) {
        fnList[0] = s;
        debug("got filenames="+fnList[0]);
        numFrames = fnList[0].length;
        lastFrame = numFrames - 1;
        firstFrame = 0;
        currentFrame = 0;
      }

      utcOffset = 0;
      tzLabel = " ";
      timeColor = 0xffffff;
      timeBack = -1;
      timeFontSize = 10;
      timeFontWeight="normal";

      // times_label_style = color, utc_offset, append_text
      s = getParameter("times_label_style");
      extrapAMPM = false;
      if (s != null) {
        timeColor = parseHex(s[0]);
        if (s.length > 1) utcOffset = int( 60.*parseFloat(s[1]));
        if (s.length > 2) tzLabel = s[2];
        if (s.length > 3) timeBack = parseInt(s[3]);
        if (s.length > 4) timeFontSize = parseInt(s[4]);
        if (s.length > 5) timeFontWeight = s[5];
        if (s.length > 6 && startsWith(s[6],"t") ) extrapAMPM = true;
      }

      extrapTimes = new Array();
      s = getParameter("times");
      if (s != null) {
        for (i=0; i<s.length; i++) {
          extrapTimes[i] = parseInt(s[i]);
        }
        makeTimes(extrapTimes);
      }

      s = getParameter("extrap_times_template");
      extrapTimesTemplate = null;
      if (s != null) extrapTimesTemplate = new RegExp(s[0]);

      s = getParameter("extrap_mode");
      extrapMode = 0;
      if (s != null) {
        if (startsWith(s[0],"key")) {
          extrapMode = 1;
          extrapStep = new Timer(500,1);
          extrapStep.addEventListener(TimerEvent.TIMER,
            function(e:Event):void {
              loopDirection = 1;
              setCurrentFrame(false, loopDirection, false);
            }
          );
        }
      }

      s = getParameter("to_from_lock");
      toFromLock = false;
      toFrom = false;
      if (s != null) {
        toFromLock = true;
        if (startsWith(s[0],"t") ) {
          toFrom = true;
        } else {
          toFrom = false;
        }
      }
      debug("toFrom = "+toFrom);

      s = getParameter("eventfile");
      if (s == null) s = getParameter("times_file");
      if (s != null) {
        // event file in form:  index  yyyyddd hh:mm:ss
      }

      s = getParameter("hires_filenames");
      if (s != null) {
        hiresFnList = s;
      }


      keepZoom = false;
      s = getParameter("keep_zoom");
      if (s != null && s[0].toLowerCase() == "true") keepZoom = true;

      activeZoom = false;
      s = getParameter("active_zoom");
      if (s != null && s[0].toLowerCase() == "true") activeZoom = true;
      enableZooming = activeZoom;

      zoomScale = 1.0;
      s = getParameter("zoom_scale");
      if (s == null) s = getParameter("zoom_factor");
      if (s != null) zoomScale = parseFloat(s[0]);

      zoomFactorMax = 999999.0;
      s = getParameter("maximum_zoom");
      if (s != null) zoomFactorMax = parseFloat(s[0]);

      isInitialZoom = false;
      s = getParameter("initial_zoom");
      if (s != null) {
        isInitialZoom = true;
        initialZoom = parseFloat(s[0]);
        xScreen = parseFloat(s[1]);
        yScreen = parseFloat(s[2]);
      }

      refreshRate = 1;
      isAutoRefresh = false;
      autoState = false;
      s = getParameter("auto_refresh");
      if (s != null) {
        refreshRate = parseInt(s[0]);
        if (refreshTimer != null)
        refreshTimer.removeEventListener(TimerEvent.TIMER, refreshImages);
        refreshTimer = new Timer(refreshRate*60*1000);
        refreshTimer.addEventListener(TimerEvent.TIMER, refreshImages, false, 0, true);
        isAutoRefresh = true;
        autoState = true;
      }

      isLooping = true;

      startFrame = 0;
      s = getParameter("start_frame");
      if (s != null) {
        startFrame = parseInt(s[0]);
        currentFrame = startFrame;
        isLooping = false;
      }

      fnDwell = new Array();
      useDwell = false;
      s = getParameter("dwell_rates");
      if (s != null) {
        for (var i:int = 0; i<s.length; i++) {
          fnDwell.push( parseInt(s[i]));
        }
        useDwell = true;
      }

      frameLabelWidth = 100;
      s = getParameter("frame_label_width");
      if (s != null) frameLabelWidth = parseInt(s[0]);


      s = getParameter("always_wiping");
      if (s != null) {
        if (startsWith(s[0],"t")) {
          isWiping = true;
          isLooping = false;
        }
      }

      wiperLine = false;
      wiperLineColor = 0xffffff;
      s = getParameter("wiper_line_color");
      if (s != null) {
        wiperLine = true;
        wiperLineColor = parseInt(s[0]);
      }


      s = getParameter("start_looping");
      if (s != null) {
        isLooping = true;
        if (startsWith(s[0],"f") || startsWith(s[0],"F") ) {
          isLooping = false;
        }
      }
      wasLooping = isLooping;

      s = getParameter("basename");
      if (s == null) s = getParameter("basenames");
      if (s != null) {
        basename = s[0];
        baseNumber = 0;
        s = getParameter("base_starting_number");
        if (s!= null) baseNumber = parseInt(s[0]);
        s = getParameter("num_frames");
        if (s == null) s = getParameter("num_images");
        if (s == null) {
          debug("******** Problem with config -- no num_frames parameter!");
        }
        numFrames = parseInt(s[0]);
        lastFrame = numFrames - 1;
        fnList[0] = getNamesUsingBaseName(basename, numFrames);
      }


      s = getParameter("overlay_filenames");
      if (s !=null) {
        debug("got overlays = "+s);
        for (var m:int = 1; m<s.length+1; m++) {
          debug("olList m = "+m);
          fnList[m] = s[m-1].replace(reBar,"&").split("&");
          debug("  number="+fnList[m].length);
          for (var n:int=0; n<fnList[m].length; n++) {
            debug("   added:"+fnList[m][n]);
            fnList[m][n] = StringUtil.trim(fnList[m][n]);
          }

        }
      }


      enhOverlay = 0;
      s = getParameter("enhance_overlay");
      if (s == null) s = getParameter("overlay_enhance");
      if (s != null) enhOverlay = parseInt(s[0]) + 1;
      if (enhOverlay < 0) enhOverlay = 0;


      // minimum dwell
      minDwell = 10000/100;  //set to 10 fps

      s = getParameter("minimum_dwell");
      if (s != null) minDwell = parseInt(s[0]);
      if (minDwell < 20) minDwell = 20;  // 50 fps

      // now pick up params with no associated widget....
      minSpeed = 2;
      maxSpeed = 10000/minDwell;
      mySpeed = (maxSpeed + minSpeed)/2

      s = getParameter("rate");
      if (s != null) {
        mySpeed = parseInt(s[0]);

        if (mySpeed > 500 || mySpeed < 1) {
          debug("******** Invalid value for 'rate' parameter, = "+mySpeed);
          mySpeed = (maxSpeed + minSpeed)/2;
        }

        if (s.length > 1) {
          minSpeed = parseInt(s[1]);
          maxSpeed = parseInt(s[2]);
          if (maxSpeed > 500 || maxSpeed < mySpeed) {
            maxSpeed = 300;
            debug("******** Invalid value for 'rate' maxSpeed parameter....");
          }
          if (minSpeed < 0 || minSpeed > mySpeed) {
            maxSpeed = 2;
            debug("******** Invalid value for 'rate' minSpeed parameter....");
          }

        } else {
          
          // compute minSpeed = mySpeed - (maxSpeed - mySpeed);
          if (mySpeed >= maxSpeed) {
            maxSpeed = mySpeed + 50;
            minDwell = 10000/maxSpeed;
          }
          if (maxSpeed - mySpeed > 10) minSpeed = 2*mySpeed - maxSpeed;
          if (minSpeed < 2) minSpeed = 2;
        }
      }

      dwell = 10000/mySpeed;

      s = getParameter("rocking");
      if (s != null) {
        if (startsWith(s[0],"t") || startsWith(s[0],"T")) isRocking=true;
      } else {
        isRocking = false;
      }

      s = getParameter("loop");


      s = getParameter("pause");
      pauseOnLast = 0;
      if (s != null) {
        pauseOnLast = parseInt(s[0]);
        if (pauseOnLast < 0 || pauseOnLast > 20000) {
          pauseOnLast = 0;
          debug("******** Bad value for 'pause' parameter = "+pauseOnLast);
        }
      }

      s = getParameter("pause_percent");
      pausePercent = 0;
      if (s != null) {
        pausePercent = parseInt(s[0]);
        if (pausePercent < 0 || pausePercent > 20000) {
          pausePercent = 0;
          debug("******** Bad value for 'pause' parameter = "+pausePercent);
        }

      }

      s = getParameter("transparency");
      transparency = 0x00000000;
      if (s != null) {
        transparency = parseHex(s[0]);
      }


      s = getParameter("image_preserve");
      if (s != null) {
        if (s.length % 4 != 0) {
          debug("******** image_preserve -- incorrect number of parameters!");
          preserve = null;
        } else {
          preserve = new Array(s.length);
          for (i = 0; i<s.length; i++) {
            preserve[i] = parseInt(s[i]);
          }
        }
      }
       
      s = getParameter("overlay_preserve");
      if (s != null) {
        var pok:Boolean = true;
        preserveOlay = new Array();
        var polay:Array = new Array();
        var inx:int = 0;
         
        for (i = 0; i<s.length; i++) {
          inx = s[i].indexOf("|");
          if (inx == -1) inx = s[i].indexOf("&");
          if (inx == -1) inx = s[i].indexOf(";");
          if (inx == -1) {
            polay.push(parseInt(s[i]));
          } else {
            polay.push(parseInt(s[i].substring(0,inx)));

            if ( (polay.length % 4) != 0) pok = false;
            preserveOlay.push(polay);
            polay = new Array();
            polay.push(parseInt(s[i].substring(inx+1)));
          }
        }

        if ( (polay.length % 4) != 0) pok = false;
        preserveOlay.push(polay);
        debug("len preOlay = "+preserveOlay.length);
        debug("len preOlay[0] = "+preserveOlay[0].length);
        if (!pok) {
          debug("******** overlay_preserve -- incorrect number of parameters!");
          preserveOlay = null;
        }
      }

      isLoc = false;
      doingLoc = false;
      s = getParameter("coordinates");
      if (s != null) makeCoordinates(s);

      distUnit = "km";
      s = getParameter("distance_unit");
      if (s != null) {
        if (startsWith(s[0],"pi")) distUnit = "pixel";
        if (startsWith(s[0],"mi")) distUnit = "mi";
        if (startsWith(s[0],"nm")) distUnit = "nmi";
        if (startsWith(s[0],"na")) distUnit = "nmi";
      }

      s = getParameter("probe_style");
      probeBgColor = background;
      probeFgColor = foreground;
      probeFontSize = 12;
      probeFormatter = new NumberFormatter();
      probeFormatter.precision = 0;
      probeFormatter.useThousandsSeparator = false;
      probeOneUnit = "";
      probeOnePrefix = "Value=";
      probeOneDecimal = 0;

      if (s != null) {
        probeBgColor = parseHex(s[0]);
        probeFgColor = parseHex(s[1]);
        if (s.length > 2 && s[2].length > 0) probeFontSize = parseInt(s[2]);
        if (s.length > 3 && s[3].length > 0) probeOneDecimal = parseInt(s[3]); 
        if (s.length > 4 && s[4].length > 0) probeOneUnit = s[4];
        if (s.length > 5 && s[5].length > 0) probeOnePrefix = s[5];
      }

      s = getParameter("distance_style");
      distBgColor = background;
      distFgColor = foreground;
      distFontSize = 12;
      distFormatter = new NumberFormatter();
      distFormatter.precision = 0;
      distFormatter.useThousandsSeparator = false;

      if (s != null) {
        distBgColor = parseHex(s[0]);
        distFgColor = parseHex(s[1]);
        if (s.length > 2 && s[2].length > 0) distFontSize = parseInt(s[2]);
        if (s.length > 3 && s[3].length > 0) 
                    distFormatter.precision = parseInt(s[3]);
      }

      s = getParameter("map_scale");
      hasScale = false;
      if (s != null) {
        hasScale = true;
        mapScale = parseFloat(s[0]);
      }

      s = getParameter("show_bearing");
      showBearing = false;
      bearingType = "";
      if (s != null && (s[0].indexOf("t") != -1 || s[0].indexOf("f") != -1) ) {
        showBearing = true;
        bearingType = s[0];
      }
      showGC = false;

      //hotspot
      doingHotspots = false;
      loadingHotspot = false;
      s = getParameter("hotspot");
      if (s == null) s = getParameter("hotspot0");
      hsButton = new Array();
      hsPoint = new Array();
      hsType = new Array();
      hsValue = new Array();
      hsPan = new Array();
      hsImageNames = new Array();
      hsSimButts = new Array();
      hsLoaders = new Array();
      hsLoaderInfo = new Array();
      hsBitmaps = new Array();

      var hsi:int = 0;

      while (s != null) {
        doingHotspots = true;
        makeHotspot(s);
        hsi = hsi + 1;
        s = getParameter("hotspot"+hsi);
      }

      // background_hotspot

      doingBackHotspots = false;
      loadingBackHotspot = false;
      s = getParameter("background_hotspot");
      if (s == null) s = getParameter("background_hotspot0");
      backhsButton = new Array();
      backhsType = new Array();
      backhsValue = new Array();
      hsi = 0;

      while (s != null) {
        doingBackHotspots = true;
        makeBackHotspot(s);
        hsi = hsi + 1;
        s = getParameter("background_hotspot"+hsi);
      }


      // userWindowSize
      userWindowSize = false;
      zoomXBase = 1.0;
      zoomYBase = 1.0;
      s = getParameter("image_window_size");
      if (s != null) {
        bmWidth = parseInt(s[0]);
        bmHeight = parseInt(s[1]);
        bmRect = new Rectangle(0,0,bmWidth, bmHeight);
        userWindowSize = true;
      }

      contentX = 0;
      contentY = 3;
      s = getParameter("content_position");
      if (s != null) {
        contentX = parseInt(s[0]);
        contentY = parseInt(s[1]);
      }

      s = getParameter("fade");
      if (s != null) {
        isFading = true;
      } else {
        isFading = false;
      }

      s = getParameter("fade_steps");
      numFadeSteps = 10;
      if (s != null) numFadeSteps = parseInt(s[0]);

      // not implemented...yet....
      s = getParameter("blank_screen");
      s = getParameter("overlay_locations");
      s = getParameter("image_size");

      // control layout must be done after the image info is available...

      doLayoutControls = true;

      // timer for animation
      if (timer != null) timer.removeEventListener(TimerEvent.TIMER, showFrames);
      timer = new Timer(50);
      timer.addEventListener(TimerEvent.TIMER, showFrames, false, 0, true);

      s = getParameter("background_image");
      onOffBackground = mom.getStyle("backgroundColor");
      usingBI = false;

      if (s != null) {
        debug("......doing background_image...........");
        onOffBackground = 0x00000000;
        biSprite = new Sprite();
        var biBitmap:Bitmap = new Bitmap(new BitmapData(mom.width, mom.height));
        biSprite.addChild(biBitmap);
        biComp =new UIComponent();
        biComp.addChild(biSprite);
        biComp.x = 0;
        biComp.y = 0;
        biComp.width = mom.width;
        biComp.height= mom.height;

        if (doingBackHotspots) {
          for (i=0; i<backhsButton.length; i++) {
            biComp.addChild(backhsButton[i]);
          }
        }

        mom.addChild(biComp);
        usingBI = true;

        var biName:String = s[0];
        if (useAntiCaching) {
          antiCacheIndex = Math.random()*1677216.0;
          biName = biName+"?"+antiCacheIndex;
        }

        var biLoader:Loader = new Loader();
        biLoader.contentLoaderInfo.addEventListener(Event.COMPLETE,
          function(e:Event):void {
            biBitmap.bitmapData = e.target.content.bitmapData;
          } );

        biLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, 
          function(e:IOErrorEvent):void {
            debug("******** Error loading background_image "+biName);
          } );


        try {
          if (imageBase != null) {
            biName = imageBase+biName;
          }

          biLoader.load( new URLRequest(biName));

        } catch (ibe:Error) {
          Alert.show("Unable to load background_image "+biName);
        }
        
      }

      // Now create the VBox to hold the UI components...and addChild it
      vb = new VBox();
      vb.move(contentX, contentY);
      vb.width=mom.width-contentX;
      vb.height=mom.height-contentY;
      vb.setStyle("horizontalAlign","center");
      vb.setStyle("verticalGap",2);
      vb.horizontalScrollPolicy=ScrollPolicy.OFF;
      vb.verticalScrollPolicy=ScrollPolicy.OFF;
      mom.addChild(vb);

      enh = null;
      var doEnh:Boolean = false;
      var sc:Array = getParameter("controls");
      if (sc != null && sc.indexOf("enhance") > -1) doEnh = true;
      sc = getParameter("bottom_controls");
      if (sc != null && sc.indexOf("enhance") > -1) doEnh = true;
      sc = getParameter("overlay_enhance_table");
      if (sc != null) doEnh = true;
      sc = getParameter("base_enhance_table");
      if (sc != null) doEnh = true;
      sc = getParameter("base_enhance");
      if (sc != null) doEnh = true;
      sc = getParameter("enhance_base");
      if (sc != null) doEnh = true;

      s = getParameter("no_enh");

      if (s != null || !doEnh) {
        trace(" s = "+s+"  doEnh = "+doEnh);
        getImageFilenames();

      } else {

        var enhLoader:URLLoader = new URLLoader();
        enhLoader.dataFormat = URLLoaderDataFormat.TEXT;
        enhLoader.addEventListener(Event.COMPLETE, doneGettingEnhTab);
        enhLoader.addEventListener(IOErrorEvent.IO_ERROR, 

          function(e:IOErrorEvent):void {
            debug("IOErrorEvent for enh.tab file");
            getImageFilenames();
          } );


        var enhName:String = "enh.tab";
        s = getParameter("enhance_filename");
        if (s != null) enhName = s[0];

        try {

          if (useAntiCaching) {
            antiCacheIndex = Math.random()*1677216.0;
            enhName = enhName+"?"+antiCacheIndex;
          }
          if (imageBase != null) enhName = imageBase+enhName;

          var request:URLRequest = new URLRequest(enhName);

          // turn off caching ?
          request.requestHeaders.push(new URLRequestHeader("Cache-Control","no-store,max-age=0,no-cache,must-revalidate"));
          request.requestHeaders.push(new URLRequestHeader("Expires","Mon, 26 Jul 1997 05:00:00 GMT"));
          request.requestHeaders.push(new URLRequestHeader("Pragma","no-cache"));

          enhLoader.load( request);

        } catch (ioe:Error) {
          debug("Other Error for enh.tab file");
          Alert.show("Unable to load enhancement file: "+enhName+"  Error: "+ioe);
        }
        
      }

    }



/** getImageFilenames()
*
* come here to get the filenames (initially and/or on "refresh")
*
* if file_of_filenames, initiate read of that
*
* otherwise, just continue on....
*
*/

    private function getImageFilenames():void {

      var s:Array = getParameter("file_of_filenames");
      if (s != null) {
        fnList = new Array();
        var fnLoader:URLLoader = new URLLoader();
        fnLoader.dataFormat = URLLoaderDataFormat.TEXT;
        fnLoader.addEventListener(Event.COMPLETE, doneGettingFilenames );
        fnLoader.addEventListener(IOErrorEvent.IO_ERROR, errorLoadingFilenames);

        var fofName:String = s[0];
        try {

          if (fofName.indexOf("?") > 0) {
            fofName = fofName.replace(reBar,"&");
            debugText = debugText + "\nPHP file-of-filenames = "+fofName;

          } else if (useAntiCaching) {
            antiCacheIndex = Math.random()*1677216.0;
            fofName = StringUtil.trim(s[0])+"?"+antiCacheIndex;
          }

          if (imageBase != null) fofName = imageBase+fofName;
          var request:URLRequest = new URLRequest(fofName);

          // turn off caching ?
          request.requestHeaders.push(new URLRequestHeader("Cache-Control","no-store,max-age=0,no-cache,must-revalidate"));
          request.requestHeaders.push(new URLRequestHeader("Expires","Mon, 26 Jul 1997 05:00:00 GMT"));
          request.requestHeaders.push(new URLRequestHeader("Pragma","no-cache"));

          fnLoader.load( request);

        } catch (ioe:Error) {
          Alert.show("Unable to load configuration file: "+s[0]+"  Error: "+ioe);
        }
        
      } else {
        doneGettingFilenames(null);
      }
    }



/** doneGettingFilenames(Event)
*
* handler for file_of_filenames
*
* if called from elsewhere, just continue on to getImages()
*
*/

    private function doneGettingFilenames(event:Event) : void {

      frameLabels = getParameter("frame_label");
      hasFrameLabel = false;
      var doTimes:Boolean = false;

      if (event != null) {

        fofErrorCount = 0;

        if (extrapTimes == null || extrapTimesTemplate != null) {
          extrapTimes = new Array();
        }

        if (frameLabels == null) frameLabels = new Array();

        var fnl:URLLoader = URLLoader(event.target);
        fnl.removeEventListener(Event.COMPLETE, doneGettingFilenames);
        fnl.removeEventListener(IOErrorEvent.IO_ERROR, errorLoadingFilenames);
        var lines:Array = fnl.data.split("\n");
        var firstTime:Boolean = true;
        var firstHotspot:Boolean = true;

        // first push for background ([0])
        fnList.push(new Array());

        for (var i:int=0; i<lines.length; i++) {

          debug("f_o_f reading line = "+lines[i]);

          lines[i] = StringUtil.trim(lines[i]);
          if (lines[i].slice(0,1) == "#") continue;
          if (lines[i].length < 2) continue;

          if (startsWith(lines[i],"hotspot") ) {
            
            if (firstHotspot) {
              hsButton = new Array();
              hsType = new Array();
              hsValue = new Array();
              hsPoint = new Array();
              hsPan = new Array();
              doingHotspots = true;
              firstHotspot = false;
            }

	          var shi:int = lines[i].indexOf("=");
            var shh:Array = lines[i].substring(shi+1).split(",");
            makeHotspot(shh);


          } else if (startsWith(lines[i],"pop_up") ||
                     startsWith(lines[i],"popup") ) {
            var scp:int = lines[i].indexOf("=");
            Alert.show(lines[i].substring(scp+1) );

          } else if (startsWith(lines[i],"play_audio") ||
                     startsWith(lines[i],"play_sound") ) {
            var scs:Array = lines[i].split("=");
            soundClip = new Sound();
            soundClip.addEventListener(Event.COMPLETE, soundLoaded);
            soundClip.load(new URLRequest(scs[1]) );

          } else if (startsWith(lines[i],"coordinates") ) {
            var sc:Array = lines[i].split("=");
            var sch:Array = sc[1].split(",");
            makeCoordinates(sch);

          } else if (startsWith(lines[i], "map_scale") ) {
              hasScale = true;
              var ssc:Array = lines[i].split("=");
              mapScale = parseFloat(ssc[1]);

          } else if (startsWith(lines[i],"times") ) {
            var st:Array = lines[i].split("=");
            var sth:Array = st[1].split(",");
            extrapTimes = new Array();
            for (var m:int=0; m<sth.length; m++) {
              extrapTimes.push(parseInt(StringUtil.trim(sth[m])));
            }
            doTimes = true;

          } else {


            var begindex:int = lines[i].indexOf("\"");
            debug("Looking for quote mark, index="+begindex);
            if (begindex >= 0) {
              var endindex:int = lines[i].lastIndexOf("\"");
              if (begindex == endindex) {
                debug("Error processing frameLabel in "+lines[i]);
                hasFrameLabel = false;
                frameLabels.push(" ");
              } else {
                hasFrameLabel = true;
                frameLabels.push(lines[i].substring(begindex+1,endindex));
              }

              lines[i] = 
                 (lines[i].substring(0,begindex)+lines[i].substring(endindex+1));
            }

            lines[i] = StringUtil.trim(lines[i]);
            debug("now lines = "+lines[i]);

            // look for dwell [value]
            begindex = lines[i].indexOf(" [");
            if (begindex >= 0) {
              endindex = lines[i].lastIndexOf("]");
              if (endindex < begindex) {
                debug("******** Error processing frameDwell in "+lines[i]);
                fnDwell.push(300);
              } else {
                fnDwell.push(parseInt(lines[i].substring(begindex+2,endindex)));
                useDwell = true;
              }

              lines[i] = 
                 (lines[i].substring(0,begindex)+lines[i].substring(endindex+1));
            }

            // look for extrap_time {time}
            if (extrapTimesTemplate == null) {
              begindex = lines[i].indexOf(" {");
              if (begindex >= 0) {
                endindex = lines[i].lastIndexOf("}");
                if (endindex < begindex) {
                  debug("******** Error processing extrap_time in "+lines[i]);
                  extrapTimes.push(300);
                } else {
                  extrapTimes.push(parseInt(lines[i].substring(begindex+2,endindex)));
                  doTimes = true;
                }

                lines[i] = 
                   (lines[i].substring(0,begindex)+lines[i].substring(endindex+1));
              }
            }

            //debug("now lines = "+lines[i]);

            // check for extrap times in filename
            if (extrapTimesTemplate != null) {
              var ptimes:Array = lines[i].match(extrapTimesTemplate);
              if (ptimes != null && ptimes.length == 2) {
                extrapTimes.push( parseInt(ptimes[1]));
                debug("+ + + Extrap time found:"+ptimes[1]);
                doTimes = true;
              } else {
                debug("+ + + Error parsing times - no group match of "+extrapTimesTemplate+" in line: "+lines[i]);
              }
            }

            lines[i] = StringUtil.trim(lines[i]);
            var inx:int = lines[i].indexOf(" ");

            if (inx > 0) {
              var leftHand:String = StringUtil.trim(lines[i].substring(0,inx));
              var rightHand:String = StringUtil.trim(lines[i].substring(inx));
              fnList[0].push(leftHand);

              var lt:Array = rightHand.split("=");

              if (lt.length != 2) {
                debug("******** Error processing overlay= in "+lines[i]);
              }

              // comma-separated list of overlay names for this frame...
              if (StringUtil.trim(lt[0]) == "overlay") {
                var olnames:Array = lt[1].split(",");

                for (var k:int = 0; k<olnames.length; k++ ) {
                  if (firstTime) fnList.push(new Array());
                  fnList[k+1].push (StringUtil.trim(olnames[k])); 
                }
                firstTime = false;

              } else {
                debug("******** Error processing overlay name in "+lines[i]);
              }


            } else {

              // just the background filename given -- push it onto the array.
              fnList[0].push(lines[i]);
            }

            
          }
        }

        if (doTimes) makeTimes(extrapTimes);
      }

      loadUpImages();
       
    }



/** loadUpImages
*
* initial housekeeping prior to actually loading images
*
*/

    private function loadUpImages(): void {

      if (initialLoad) {
        imgList = new Array(fnList.length);
        singleImage = new Array(fnList.length);
        imgLoaderList = new Array(fnList.length);
        imgLoaderInfoList = new Array(fnList.length);
        bmBackLoaded = new Array(fnList.length);
        overlayStatic = new Array(fnList.length);
        doneOverlayMask = new Array(fnList.length);
        overlayMask = new Array(fnList.length);
        for (var m:int=0; m<fnList.length; m++) {
           overlayStatic[m] = false;
           overlayMask[m] = false;
        }
        overlayStatic[0] = baseStatic;

        enhBitmaps = new Array();
        madeEnhBitmaps = false;
      }

      // estimate totalframes - will be computed later...
      totalFrames = 0;
      numFrames = fnList[0].length;
      lastFrame = numFrames -1;

      // create a list for image load completed
      for (var i:int=0; i<fnList.length; i++) {

        if (!initialLoad && !loadingHotspot && overlayStatic[i]) continue;

        var bll:Array = new Array(fnList[i].length);
        var blo:Array = new Array(fnList[i].length);
        singleImage[i] = true;

        for (var k:int = 0; k<fnList[i].length; k++ ) {
          bll[k] = false;
          blo[k] = false;
          if (fnList[i][k] != fnList[i][0]) singleImage[i] = false;
          totalFrames = totalFrames + 1;
        }

        if (singleImage[i]) totalFrames = totalFrames - (fnList[i].length - 1);
        bmBackLoaded[i] = bll;
        doneOverlayMask[i] = blo;
      }

      debug("Estimated Total Frames = "+totalFrames);
      debug("Num of layers = "+fnList.length);

      if ( (totalFrames > 0) && useProgressBar && !quietReload && (pbar == null) ) {
        pbar = new ProgressBar();
        pbar.labelPlacement="center";
        pbar.label="Reading image files";
        pbar.indeterminate = false;
        pbar.mode = "manual";
        pbar.setProgress(0,totalFrames);
        pbar.width=200;
        pbar.move(mom.width/2-100, mom.height/2);
        mom.addChild(pbar);
      }


      if (doLayoutControls) {
        layoutControls();
      }

      if (doingHotspots && baseStatic && (hsCan != null)) {
        hsCan.removeAllChildren();
        debug("ADDING hotspots to existing canvas....."+hsButton.length);
        for (m = 0; m<hsButton.length; m++) {
          hsCan.addChild(hsButton[m]);
        }

      }

      getImages();

    }



/** layoutControls()
*
* from the "controls=" and/or "bottom_controls=" parameters,
* crete and layout the control widgets
*
*/

    private function layoutControls():void {

      // now analyze the 'control' parameters -- only the first time...
      hasFrameLabel = false;
      isLoopRock = false;
      loopDirection = 1;
      isOnOff = false;
      onOffUI = null;
      isStepping = false;
      useBottomControls = false;
      var tips:Array;

      imgSmoothList = new Array(fnList.length);
      imgZoomableList = new Array(fnList.length);
      for (var h:int=0; h<fnList.length; h++) {
        imgZoomableList[h] = true;
        imgSmoothList[h] = false;
      }


      for (var ctb:int=0; ctb<2; ctb++) {

        vbc= new VBox();
        vbc.setStyle("horizontalAlign","center");
        vbc.setStyle("verticalGap",0);

        if (ctb == 0) {
          s = getParameter("controls");
          tips = getParameter("controls_tooltip");
        } else {
          s = getParameter("bottom_controls");
          tips = getParameter("bottom_controls_tooltip");
        }

        debug("s = "+s);

        if (s != null) {
          controlBox = new HBox();
          controlBox.height = 40;
          controlBox.setStyle("verticalGap","0");
          var ctsp:Array = getParameter("controls_gap");
          var ctgap:int = 5;
          if (ctsp != null) {
            ctgap = parseInt(ctsp[0]);
          }
          controlBox.setStyle("horizontalGap",ctgap);

          overlayControlBox = null;
          onOffUI = null;
          var gotControls:Boolean = false;

          for (var cn:int=0; cn<s.length; cn++) {

            if (startsWith(s[cn], "/")) {

              if (gotControls) vbc.addChild(controlBox);
              controlBox = new HBox();
              controlBox.height = 40;
              controlBox.setStyle("verticalGap","0");
              controlBox.setStyle("horizontalGap",ctgap);
              s[cn] = s[cn].substring(1);
            }

            if (s[cn] == "startstop") {
              startstop = new Button();
              pLabels = getParameter("startstop_labels");
              if (pLabels == null) {
                startstopLabelTrue = " Stop ";
                startstopLabelFalse= "Start";
              } else {
                startstopLabelTrue = pLabels[0];
                startstopLabelFalse = pLabels[1];
                if (pLabels.length == 3) {
                  startstop.width = parseInt(pLabels[2]);
                }

              }
              startstopLabelColors = getLabelColors("startstop");

              if (isLooping) {
                startstop.label=startstopLabelTrue;
                setLabelColors(startstop, startstopLabelColors,true);
              } else {
                startstop.label=startstopLabelFalse;
                setLabelColors(startstop, startstopLabelColors,false);
              }

              startstop.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) startstop.toolTip = tips[cn];
              controlBox.addChild(startstop);
              gotControls = true;

            } else if (s[cn] == "speed") {
              speed = new HSlider();
              speed.setStyle("labelOffset",0);
              pLabels = getParameter("speed_label");
              if (pLabels == null) {
                speed.labels = [" ","Set Animation Speed"," "];
              } else {
                speed.labels = [" ",pLabels[0]," "];
                if (pLabels.length == 2) {
                  speed.width = parseInt(pLabels[1]);
                }
              }
              speed.showDataTip = false;
              speed.maximum = maxSpeed;
              speed.minimum = minSpeed;
              speed.value = mySpeed;
              speed.liveDragging = true;
              speed.addEventListener(SliderEvent.CHANGE, changeSpeed);
              if (tips != null) speed.toolTip = tips[cn];
              controlBox.addChild(speed);
              gotControls = true;

            } else if (s[cn] == "framelabel") {
              frameLabelField = new Label();
              frameLabelField.width = frameLabelWidth;
              frameLabelField.height = 20;
              var fls:Array = getParameter("frame_label_style");
              if (fls != null) {
                frameLabelField.opaqueBackground = parseHex(fls[0]);
                frameLabelField.setStyle("color", parseHex(fls[1]));
                if (fls.length > 2) {
                  frameLabelField.setStyle("fontSize",parseInt(fls[2]));
                }
                if (fls.length > 3) {
                  frameLabelField.height = parseInt(fls[3]);
                }

              } else {
                frameLabelField.opaqueBackground = background;
                frameLabelField.setStyle("color",foreground);
              }
              frameLabelField.graphics.lineStyle(1,foreground);
              frameLabelField.graphics.drawRect(0,0,frameLabelWidth,frameLabelField.height);
              frameLabelField.text = " ";

              hasFrameLabel = true;
              if (tips != null) frameLabelField.toolTip = tips[cn];
              controlBox.addChild(frameLabelField);
              gotControls = true;

            } else if (s[cn] == "looprock") {
              looprock = new Button();
              pLabels = getParameter("looprock_labels");
              if (pLabels == null) {
                looprockLabelTrue = "Loop";
                looprockLabelFalse = "Rock";
              } else {
                looprockLabelTrue = pLabels[0]; 
                looprockLabelFalse =  pLabels[1];
                if (pLabels.length == 3) {
                  looprock.width = parseInt(pLabels[2]);
                }
              }

              looprockLabelColors = getLabelColors("looprock");

              if (isRocking) {
                looprock.label = looprockLabelTrue;
                setLabelColors(looprock, looprockLabelColors, true);
              } else {
                looprock.label = looprockLabelFalse;
                setLabelColors(looprock, looprockLabelColors, false);
              }

              looprock.addEventListener(MouseEvent.CLICK, bclick);
              isLoopRock = true;
              if (tips != null) looprock.toolTip = tips[cn];
              controlBox.addChild(looprock);
              gotControls = true;

            } else if ( (s[cn].indexOf("autotoggle") == 0) ||
                        (s[cn].indexOf("autorefresh") == 0) ) {
              autoOnOff = new Button();
              pLabels = getParameter("autotoggle_labels");
              if (pLabels == null) pLabels = getParameter("autorefresh_labels");
              if (pLabels == null) {
                autoOnOffLabelTrue = "Auto On ";
                autoOnOffLabelFalse = "Auto Off";
              } else {
                autoOnOffLabelTrue = pLabels[0]; 
                autoOnOffLabelFalse =  pLabels[1];
                if (pLabels.length == 3) {
                  autoOnOff.width = parseInt(pLabels[2]);
                }
              }
              autoOnOffLabelColors = getLabelColors("autotoggle");

              if (!isAutoRefresh) {
                
                refreshRate = 1;
                refreshTimer = new Timer(refreshRate*60*1000);
                refreshTimer.addEventListener(TimerEvent.TIMER, refreshImages, false, 0, true);
                isAutoRefresh = true;
              }

              if (s[cn].indexOf("/off") > 0) {
                autoOnOff.label = autoOnOffLabelTrue;
                setLabelColors(autoOnOff, autoOnOffLabelColors, false);
                autoState = false;
                refreshTimer.stop();
              } else {
                autoOnOff.label = autoOnOffLabelFalse;
                setLabelColors(autoOnOff, autoOnOffLabelColors, true);
                autoState = true;
              }
              if (tips != null) autoOnOff.toolTip = tips[cn];
              autoOnOff.addEventListener(MouseEvent.CLICK, bclick);
              controlBox.addChild(autoOnOff);
              gotControls = true;

            } else if (s[cn] == "refresh") {
              refresh = new Button();
              pLabels = getParameter("refresh_label");
              if (pLabels == null) {
                refresh.label = "Refresh";
              } else {
                refresh.label = pLabels[0];
                if (pLabels.length == 2) {
                  refresh.width = parseInt(pLabels[1]);
                }
              }

              refresh.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) refresh.toolTip = tips[cn];
              controlBox.addChild(refresh);
              gotControls = true;

            } else if (s[cn] == "location" || s[cn] == "location/on") {
              locButt = new Button();
              locLabels = getParameter("location_labels");
              if (locLabels == null) {
                locLabelOff = "Show Location";
                locLabelOn = "Hide Location";
                locButt.width = 100;
              } else {
                locLabelOff = locLabels[0];
                locLabelOn = locLabels[1];
                if (locLabels.length == 3) {
                  locButt.width = parseInt(locLabels[2]);
                }
              }
              locLabelColors = getLabelColors("location");

              if (s[cn] == "location/on") {
                isLoc = true;
                locLabel.visible = true;
                locButt.label = locLabelOn;
              } else {
                isLoc = false;
                locLabel.visible = false;
                locButt.label = locLabelOff;
              }

              setLabelColors(locButt, locLabelColors, isLoc);
              locButt.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) locButt.toolTip = tips[cn];
              controlBox.addChild(locButt);
              gotControls = true;

            } else if (s[cn] == "probe" || s[cn] == "probe/on") {
              probe = new Button();
              pLabels = getParameter("probe_label");
              if (pLabels == null) {
                probe.label = "Probe";
              } else {
                probe.label = pLabels[0];
                if (pLabels.length == 2) {
                  probe.width = parseInt(pLabels[1]);
                }
              }
              probeLabelColors = getLabelColors("probe");

              probe.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) probe.toolTip = tips[cn];
              controlBox.addChild(probe);
              isProbe = true;
              probeEnabled = false;
              if (s[cn] == "probe/on") probeEnabled = true;
              setLabelColors(probe, probeLabelColors, probeEnabled);
              gotControls = true;

            } else if (s[cn] == "show") {
              debug("Making show button....");
              if (flash.external.ExternalInterface.available) {
                debug("External interface available...");
                showButt = new Button();
                showButt.label = "Show";
                var sbl:Array = getParameter("show_label");
                if (sbl != null) showButt.label = sbl[0];
                showButt.addEventListener(MouseEvent.CLICK, bclick);
                if (tips != null) showButt.toolTip = tips[cn];
                if (isLooping) {
                  showButt.enabled = false;
                } else {
                  showButt.enabled = true;
                }
                controlBox.addChild(showButt);
                gotControls = true;

              } else {
                debug("External Interface is NOT availble - so no Show Button!")
              }

            } else if (s[cn] == "wiper")  {
              wiperButt = new Button();
              wiperButt.label = " Wiper ";
              isWiping = false;
              var wbl:Array = getParameter("wiper_labels");
              if (wbl != null) {
                wiperLabelOff = wbl[0];
                wiperLabelOn = wbl[1];
              } else {
                wiperLabelOff = " Wiper ";
                wiperLabelOn = "Cancel";
              }
              wiperLabelColors = getLabelColors("wiper");

              wiperButt.label = wiperLabelOff;
              setLabelColors(wiperButt, wiperLabelColors, false);
              wiperButt.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) wiperButt.toolTip = tips[cn];
              controlBox.addChild(wiperButt);
              gotControls = true;

            } else if (s[cn] == "print")  {
              printButt = new Button();
              printButt.label = "Print";
              var pbl:Array = getParameter("print_label");
              //if (pbl == null) pbl = getParameter("show_label");
              if (pbl != null) printButt.label = pbl[0];
              printButt.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) printButt.toolTip = tips[cn];
              if (isLooping) {
                printButt.enabled = false;
              } else {
                printButt.enabled = true;
              }

              controlBox.addChild(printButt);
              gotControls = true;

            } else if (s[cn] == "step") {
              stepBack = new Button();
              stepBack.label="<";
              stepBack.width=20;
              stepBack.addEventListener(MouseEvent.CLICK, bclick);
              stepForward = new Button();
              stepForward.label=">";
              stepForward.width=20;
              stepForward.addEventListener(MouseEvent.CLICK, bclick);
              isStepping = true;
              if (tips != null) stepBack.toolTip = tips[cn];
              if (tips != null) stepForward.toolTip = tips[cn];
              controlBox.addChild(stepBack);
              controlBox.addChild(stepForward);
              gotControls = true;

            } else if (s[cn] == "firstlast") {
              stepFirst = new Button();
              stepFirst.label = "<|";
              stepFirst.width = 30;
              stepFirst.addEventListener(MouseEvent.CLICK, bclick);
              stepLast = new Button();
              stepLast.label = "|>";
              stepLast.width = 30;
              stepLast.addEventListener(MouseEvent.CLICK, bclick);
              if (tips != null) stepFirst.toolTip = tips[cn];
              if (tips != null) stepLast.toolTip = tips[cn];
              controlBox.addChild(stepFirst);
              controlBox.addChild(stepLast);
              gotControls = true;

            } else if (s[cn] == "setframe") {
              setFrameScrollbar = new HSlider();
              var sft:Array = getParameter("setframe_label");
              setFrameText = "Set Frame *";
              if (sft != null) setFrameText = StringUtil.trim(sft[0]);

              setFrameScrollbar.setStyle("labelOffset",0);
              //setFrameScrollbar.height=40;
              setFrameScrollbar.showDataTip = false;
              setFrameScrollbar.maximum = numFrames - 1;
              setFrameScrollbar.minimum = 0; 
              setFrameScrollbar.value = startFrame; 
              setFrameScrollbar.liveDragging = true;
              setFrameScrollbar.addEventListener(SliderEvent.CHANGE,changeFrame);
              if (tips != null) setFrameScrollbar.toolTip = tips[cn];
              //setFrameScrollbar.labels = [" ",setFrameText," "];
              changeFrame(null);
              controlBox.addChild(setFrameScrollbar);
              gotControls = true;

            } else if (s[cn].indexOf("toggle") == 0) {
              var toggles:Array = getParameter("toggle_size");
              if (s[cn].toLowerCase().indexOf("/showall") != -1) {
                showAllOnOff = true;
              } else {
                showAllOnOff = false;
              }

              onOffDoingRange = false;
              onOffMin = 0;
              onOffMax = numFrames-1;
              onOffWidth = 10;
              onOffHeight = 10;
              onOffSpacing = 3;

              if (toggles != null) {
                onOffWidth = parseInt(toggles[0]);
                onOffHeight = parseInt(toggles[1]);
                if (toggles.length > 2) onOffSpacing = parseInt(toggles[2]);
              }

              onOffBMD = new BitmapData(numFrames*(onOffSpacing+onOffWidth), 
                                  onOffHeight+3, true, onOffBackground);
              onOffBM = new Bitmap(onOffBMD);
              onOffSprite = new Sprite();
              onOffSprite.addChild(onOffBM);
              onOffRect = new Rectangle(0,0,onOffWidth, onOffHeight);
              onOffUI = new UIComponent();
              onOffUI.addChild(onOffSprite);
              onOffUI.height = onOffHeight+3;
              onOffUI.width = (onOffSpacing+onOffWidth)*numFrames;

              var togonoff:Array = getParameter("toggle_onoff");
              onOffState =new Array();
              for (var nof:int = 0; nof<numFrames; nof++) {
                onOffState[nof] = 0;
              }
              onOffState[currentFrame] = 1;

              if (togonoff != null) {
                for (nof = 0; nof<numFrames; nof++) {
                  if (togonoff[nof] == "0" ||
                      togonoff[nof] == "off" ||
                      startsWith(togonoff[nof],"f")) onOffState[nof] = -1;
                }
              }

              isOnOff = true;
              if (tips != null) {
                onOffUI.toolTip = tips[cn];
              } else {
                onOffUI.toolTip = "Click on frame to disable; Shift+click to show the frame";
              }
              onOffUI.addEventListener(MouseEvent.CLICK, ooclick);
              drawOnOff();

            } else if (s[cn] == "extrap") {
              extrap = new Button();
              pLabels = getParameter("extrap_labels");
              extrap.width=70;
              if (pLabels == null) {
                extrapLabelTrue = "Extrap";
                extrapLabelFalse = "Normal";
              } else {
                extrapLabelTrue = pLabels[0];
                extrapLabelFalse = pLabels[1];
                if (pLabels.length == 3) {
                  extrap.width = parseInt(pLabels[2]);
                }
              }
              extrapLabelColors = getLabelColors("extrap");

              extrap.label=extrapLabelTrue;
              setLabelColors(extrap, extrapLabelColors, false);
              if (tips != null) extrap.toolTip = tips[cn];
              controlBox.addChild(extrap);
              doingExtrap = true;
              isExtrap = false;
              showExtrapResults = false;
              extrap.addEventListener(MouseEvent.CLICK, bclick);
              showFrames(null);

            } else if (s[cn] == "spacer") {
              var spacer:UIComponent = new UIComponent();
              spacer.width=10;
              spacer.height= 10;
              controlBox.addChild(spacer);

            } else if (s[cn] == "zoom") {
              zoom = new Button();
              zoom.width=70;
              pLabels = getParameter("zoom_labels");
              if (pLabels == null) {
                zoomLabelTrue = "  Zoom  ";
                zoomLabelFalse = "Un-zoom";
              } else {
                zoomLabelTrue = pLabels[0];
                zoomLabelFalse = pLabels[1];
                if (pLabels.length == 3) {
                  zoom.width = parseInt(pLabels[2]);
                }
              }
              zoomLabelColors = getLabelColors("zoom"); 

              zoom.label=zoomLabelTrue;
              setLabelColors(zoom, zoomLabelColors, false);
              if (tips != null) zoom.toolTip = tips[cn];
              controlBox.addChild(zoom);
              activeZoom = false;
              enableZooming = false;
              isZooming = false;
              gotControls = true;
              zoom.addEventListener(MouseEvent.CLICK, bclick);
              showFrames(null);


            } else if (s[cn] == "fader") {
              setFaderScrollbar = new HSlider();
              var sfd:Array = getParameter("fader_label");
              setFaderText = "Use slider to fade";
              if (sfd != null) setFaderText = StringUtil.trim(sfd[0]);
              sfd = getParameter("fader_width");
              if (sfd != null) setFaderScrollbar.width = parseInt(sfd[0]);

              setFaderScrollbar.setStyle("labelOffset",0);
              setFaderScrollbar.setStyle("slideDuration",10);
              setFaderScrollbar.labels = [" ",setFaderText," "];
              setFaderScrollbar.showDataTip = false;
              setFaderScrollbar.maximum = numFadeSteps*(numFrames-1);
              faderImages = new Array(numFadeSteps*numFrames);
              setFaderScrollbar.minimum = 0; 
              setFaderScrollbar.value = 0; 
              setFaderScrollbar.liveDragging = true;
              faderFrame = 0;
              setFaderScrollbar.addEventListener(SliderEvent.CHANGE,changeFade);
              if (tips != null) setFaderScrollbar.toolTip = tips[cn];
              controlBox.addChild(setFaderScrollbar);
              isFader = true;
              gotControls = true;

            } else if (s[cn] == "fadertoggle") {
              faderToggle = new Button();
              faderToggle.addEventListener(MouseEvent.CLICK, bclick);
              var stl:Array = getParameter("fadertoggle_label");
              if (stl != null) {
                faderToggle.label = stl[0];
              } else {
                faderToggle.label = "Toggle Original Images";
              }
              if (tips != null) faderToggle.toolTip = tips[cn];
              controlBox.addChild(faderToggle);
              gotControls = true;
                
              
            } else if (s[cn] == "enhance") {
              if (enh == null) {
                Alert.show("No enhancement file 'enh.tab' found...");

              } else {

                enhanceChoice = new ComboBox();
                enhanceChoice.editable = false;
                enhanceChoice.rowCount = 20;
                enhanceChoice.addEventListener(ListEvent.CHANGE, changeEnh);
                var ehp:Array = getParameter("pick_enhancement");
                if (ehp == null) {
                  ehp = new Array();
                  ehp[0] = "Pick Enhancement";
                }
                for (var ie:int =0; ie<enhNames.length; ie++) {
                  ehp[ie+1] = enhNames[ie];
                }
                enhanceChoice.dataProvider = ehp;
                if (tips != null) enhanceChoice.toolTip = tips[cn];

                controlBox.addChild(enhanceChoice);
                gotControls = true;
              }
              

            } else if (s[cn] == "overlay") {
              var ols:Array = getParameter("overlay_labels");
              if (ols == null) ols = getParameter("overlay_label");

              var olloc:Array = getParameter("overlay_labels_placement");

              if (olloc == null) {
                overlayControlBox = new HBox();
                overlayControlBox.setStyle("verticalGap",1);
                var olsp:Array = getParameter("overlay_gap");
                var olgap:int = 8;
                if (olsp != null) {
                  olgap = parseInt(olsp[0]);
                }
                overlayControlBox.setStyle("horizontalGap",olgap);
              } else {
                overlayControlBox = new Canvas();
                overlayControlBox.width = vb.width;
              }

              overlayControlContainer = new VBox();
              overlayControlContainer.setStyle("horizontalAlign","center");
              overlayControlContainer.setStyle("verticalGap",0);
              overlayControlContainer.setStyle("paddingBottom",10);

              if (ols != null) {
                var olct:Array = getParameter("overlay_labels_color");
                var olmoct:Array = getParameter("overlay_labels_mouseover_color");
                var olr:Array = getParameter("overlay_radio");
                var olta:Array = getParameter("overlay_transparent_amount");
                var oll:Array = getParameter("overlay_links");
                var olzo:Array = getParameter("overlay_zorder");
                var olst:Array = getParameter("overlay_static");
                var olzm:Array = getParameter("overlay_zoom");
                var olprl:Array = getParameter("overlay_preserve_list");
                var olsmoo:Array = getParameter("overlay_smooth");
                var oltips:Array = getParameter("overlay_tooltip");
                var olbold:Array = getParameter("overlay_labels_bold");
                var olspacer:Array = getParameter("overlay_labels_spacer");
                var olenh:Array = getParameter("overlay_enhance_table");

                numOverlayLabels = ols.length;
                if (numOverlayLabels != fnList.length-1) {
                  debug("******** Error: Number of overlay files must equal number of overlay_labels");
                }
                overlay = new Array(numOverlayLabels+1);  //  0=backgnd

                overlayLinks = new Array(numOverlayLabels+1);
                overlayOrder = new Array(numOverlayLabels+1);
                overlayHidden = new Array(numOverlayLabels+1);
                overlayStatic = new Array(numOverlayLabels+1);
                overlayZoom = new Array(numOverlayLabels+1);
                overlayPreserve = new Array(numOverlayLabels+1);
                overlayTransparentAmount = new Array(numOverlayLabels+1);
                overlayEnhance = new Array(numOverlayLabels+1);

                var doAllAsRadio:Boolean = false;
                var rbg:Array = new Array();
                if (olr != null) {
                  if (olr.indexOf(",") < 0) doAllAsRadio = true;
                }

                var initState:Boolean = false;
                var hiddenState:Boolean = false;
                overlay[0] = null;
                var olprecount:int = 0;

                for (var i:int =0; i<numOverlayLabels; i++) {
                  overlayHidden[i+1] = false;
                  initState = false
                  hiddenState = false
                  if (startsWith(ols[i],"/") ) {
                    overlayControlContainer.addChild(overlayControlBox);
                    if (olloc == null) {
                      overlayControlBox = new HBox();
                      overlayControlBox.setStyle("verticalGap",1);
                      overlayControlBox.setStyle("horizontalGap",olgap);
                    } else {
                      overlayControlBox = new Canvas();
                      overlayControlBox.width = vb.width;
                    }

                    ols[i] = ols[i].substring(1);
                  }

                  if (endsWith(ols[i],"/on")) {
                    ols[i] = ols[i].substring(0,ols[i].length-3);
                    initState = true;
                  } else if (endsWith(ols[i],"/always")) {
                    ols[i] = ols[i].substring(0,ols[i].length-7);
                    initState = true;
                    hiddenState = true;
                  } else if (endsWith(ols[i],"/hidden")) {
                    ols[i] = ols[i].substring(0,ols[i].length-7);
                    initState = false;
                    hiddenState = true;
                    overlayHidden[i+1] = true;
                  } else if (endsWith(ols[i],"/mask") ) {
                    ols[i] = ols[i].substring(0,ols[i].length-5);
                    overlayMask[i+1] = true;

                  }

                  if (olr != null) {
                    if (startsWith(olr[i],"t") || 
                                 startsWith(olr[i],"T") ) {
                      overlay[i+1] = new RadioButton();
                      var rbgIndex:int = 0;
                      if (olr[i].indexOf("/") > 0) {
                        rbgIndex = parseInt(olr[i].substring(
                              olr[i].indexOf("/")+1));
                      }

                      if (rbg[rbgIndex] == null) {
                         rbg[rbgIndex] = new RadioButtonGroup();
                      }

                      if (!hiddenState) overlay[i+1].group = rbg[rbgIndex];

                    } else {
                      overlay[i+1] = new CheckBox();
                    }

                  } else {
                    overlay[i+1] = new CheckBox();
                  }

                  if (oltips != null) {
                    overlay[i+1].toolTip = oltips[i];
                  }

                  overlay[i+1].selected = initState;

                  if (olct != null) {
                    overlay[i+1].setStyle("color",parseHex(olct[i]));
                  }

                  if (olmoct != null) {
                    overlay[i+1].setStyle("textRollOverColor",parseHex(olmoct[i]));
                  }

                  if (olbold != null) {
                    if (startsWith(olbold[i],"t") || startsWith(olbold[i],"T") 
                     || startsWith(olbold[i],"b") || startsWith(olbold[i],"B") )  
                           overlay[i+1].setStyle("fontWeight","bold");
                  }

                  if (!hiddenState) {
                    if (olspacer != null) {
                      var olspval:int = parseInt(olspacer[i]);
                      if (olspval !=0) {
                        var olspace:UIComponent = new UIComponent();
                        olspace.height = 10;
                        olspace.width = olspval;
                        overlayControlBox.addChild(olspace);
                      }
                    }

                    if (olloc != null) {
                      var locs:Array = olloc[i].split("&");
                      trace("olloc = "+olloc[i]);
                      trace("locs = "+locs);
                      overlay[i+1].x = parseInt(locs[0]);
                      overlay[i+1].y = parseInt(locs[1]);
                    }

                    overlay[i+1].label = ols[i];
                    overlay[i+1].addEventListener(MouseEvent.CLICK, cbclick);
                    overlayControlBox.addChild(overlay[i+1]);

                  }

                  overlayPreserve[0] = -1;
                  if (olprl == null || preserveOlay == null) {
                    overlayPreserve[i+1] = -1;
                  } else {
                    if (startsWith(olprl[i],"t") || startsWith(olprl[i],"T")) {
                      overlayPreserve[i+1] = olprecount;
                      olprecount = olprecount + 1;
                    } else {
                      overlayPreserve[i+1] = -1;
                    }
                  }

                  if (olta == null) {
                    overlayTransparentAmount[i+1] = 100;
                  } else {
                    overlayTransparentAmount[i+1] = parseInt(olta[i]);
                  }


                  overlayLinks[0] = 0;
                  if (oll == null) {
                    overlayLinks[i+1] = 0;
                  } else {
                    overlayLinks[i+1] = parseInt(oll[i]);
                  }

                  overlayEnhance[0] = -1;
                  if (olenh == null) {
                    overlayEnhance[i+1] = -1
                  } else {
                    overlayEnhance[i+1] = parseInt(olenh[i]) - 1;
                  }

                  overlayOrder[0] = 0;
                  if (olzo == null) {
                    overlayOrder[i+1] = i + 1;
                  } else {
                    var zo:int = parseInt(olzo[i]);
                    overlayOrder[zo+1] = i + 1;
                  }

                  if (olst == null) {
                    overlayStatic[i+1] = false;
                  } else {
                    if (startsWith(olst[i],"t") ||
                            startsWith(olst[i],"T") ||
                            startsWith(olst[i],"y") ||
                            startsWith(olst[i],"Y") ||
                            startsWith(olst[i],"1")) {
                      overlayStatic[i+1] = true;
                    } else {
                      overlayStatic[i+1] = false;
                    }

                  }
                  overlayStatic[0] = baseStatic;

                  imgZoomableList[0] = true;
                  if (olzm != null) {

                    if (startsWith(olzm[i], "f") ||
                           startsWith(olzm[i], "F") ||
                           startsWith(olzm[i], "n") ||
                           startsWith(olzm[i], "N")) {
                      imgZoomableList[i+1] = false
                    } else {
                      imgZoomableList[i+1] = true;
                    }
                  }
                   
                  imgSmoothList[0] = false;
                  if (olsmoo != null) {

                    if (startsWith(olsmoo[i], "t") ||
                           startsWith(olsmoo[i], "T") ||
                           startsWith(olsmoo[i], "y") ||
                           startsWith(olsmoo[i], "Y")) {
                      imgSmoothList[i+1] = true
                    } else {
                      imgSmoothList[i+1] = false;
                    }
                  }
                }


                // fix up hidden overlay initial states.....
                for (var n:int=0; n<numOverlayLabels; n++) {
                  if (overlayLinks[n+1] > 0) {
                    for (var m:int=0; m<numOverlayLabels; m++) {
                      if (overlayLinks[m+1] == -overlayLinks[n+1]) {
                        if (overlayHidden[m+1]) overlay[m+1].selected = overlay[n+1].selected;
                      }
                    }
                  }  
                }


                isOverlay = true;

              } else {
                Alert.show("Missing 'overlay_labels' parameter!");
              }


            } else {
              debug("******** The control parameter '"+s[cn]+"' is not recognized!");
            }
          }

          // now add the controls, overalys, and toggles if present

          if (gotControls) vbc.addChild(controlBox);

          if (overlayControlBox != null) {
            overlayControlContainer.addChild(overlayControlBox);
            vbc.addChild(overlayControlContainer);
          }

          if (onOffUI != null) vbc.addChild(onOffUI);

          // if top of view, add now; otherwise, defer
          if (ctb == 0) {
            if (!noControls) vb.addChild(vbc);
            useBottomControls = false;
          } else {
            useBottomControls = true;
          }

        } 

      }

      if (isAutoRefresh && autoState) refreshTimer.start();

    }


/** cbclick(MouseEvent)
*
* handle events for the overlay checkboxes
*
* complicated by the linking....hence the wazoo-nesting...
*
*/
    private function cbclick(event:MouseEvent): void {
      // we are here because an overlay checkbox was clicked upon

      for (var i:int = 0; i<numOverlayLabels; i++) {
        if (event.currentTarget == overlay[i+1]) {
          if (overlayLinks[i+1] > 0) {
            for (var k:int = 0; k<numOverlayLabels; k++) {
              if (overlayLinks[k+1] == -overlayLinks[i+1]) {
                if (overlayHidden[k+1]) {
                  overlay[k+1].selected = overlay[i+1].selected;
                } else {
                  if (overlay[i+1].selected) overlay[k+1].selected=true;

                }
              }
            }
          }
        }

        if (overlay[i+1] is RadioButton) {
          for (var m:int = 0; m<numOverlayLabels; m++) {
            if (overlayLinks[m+1] > 0) {
              for (k = 0; k<numOverlayLabels; k++) {
                if ( (overlayLinks[k+1] == -overlayLinks[m+1]) &&
                                               overlayHidden[k+1] ) {
                     overlay[k+1].selected = overlay[m+1].selected;
                }
              }
            }
          }
        }
       
      }

      showFrames(null);
      //event.updateAfterEvent();
    }



/** ooclick(MouseEvent)
*
* handle events for the "toggle boxes"
*
*/

    private function ooclick(event:MouseEvent): void {
      var wf:int = event.localX/(onOffWidth + onOffSpacing);
      if (event.shiftKey) {
        onOffDoingRange = false;
        onOffMin = 0;
        onOffMax = numFrames -1;
        for (var i:int=0; i<onOffState.length; i++) {
          onOffState[i] = 0;
        }
        stopLooping();
        setCurrentFrame(true, wf, false);

      } else if (event.altKey) {
      
        if (onOffDoingRange) {        // do the hi end
          onOffMax = wf;
          for (i = 0; i<onOffState.length; i++) {
            if (i > wf) {
              onOffState[i] = -1; 
            }
          }
          onOffDoingRange = false;

        } else {           // do the low end; enable all above
          onOffMin = wf;
          for (i = 0; i<onOffState.length; i++) {
            if (i < wf) {
              onOffState[i] = -1;
            } else {
              onOffState[i] = 0;
            }
          }
          onOffDoingRange = true;
          setCurrentFrame(false, 1, false);
        }

      } else {
        if (onOffState[wf] == -1) {
          onOffState[wf] = 0;
        } else {
          onOffState[wf] = -1;
        }
        onOffDoingRange = false;
        onOffMin = 0;
        onOffMax = numFrames -1;
      }
      drawOnOff();
      
    }



/** changeFrame(SliderEvent)
*
* handle events for the "setframe" Slider
*
*/

    private function changeFrame(event:SliderEvent): void {
      var inx:int = setFrameText.indexOf("*");
      if (inx >= 0) {
        setFrameScrollbar.labels = [" ",
        (setFrameText.substring(0,inx)+(Math.round(setFrameScrollbar.value)+1)+setFrameText.substring(inx+1)),
        " "];
      }
      stopLooping();
      setCurrentFrame(true, Math.round(setFrameScrollbar.value), false);
    }


/** changeSpeed(SliderEvent)
*
* handle events for the speed changer Slider
*
*/

    private function changeSpeed(event:SliderEvent): void {
      if (event.currentTarget != speed) return;
      //dwell = 1000 + minDwell - speed.value;
      dwell = 10000/speed.value;
      if (canResetDwell) timer.delay = dwell;
    }



/** changeFade(SliderEvent)
*
* handle events for the fader Slider
*
*/ 
    private function changeFade(event:SliderEvent): void {
      if (event.currentTarget != setFaderScrollbar) return;
      timer.stop();  // no longer needed....
      setCurrentFrame(false, 0, false);
      if (!isShowingFrames) showFrames(null);
    }



/** bdrag(MouseEvent)
*
* handle mouse drag events.
*
* if roaming, then cause the image to (xy)Move
*
* if drawing The Line, just define the endpoints
*/


    private function bdrag(event:MouseEvent) : void {
      xMouse = event.localX;
      yMouse = event.localY;

      if (probeEnabled) {
        xProbe = event.stageX - imgUIBack.x - contentX;
        yProbe = event.stageY - imgUIBack.y - contentY;
      }

      if (isExtrap) return;

      //debug("Event="+event+"  Target = "+event.target+" CurTaget="+event.currentTarget);

      //if (event.target != drawingPaper) return;

      if (event.buttonDown == true) {

        if (event.shiftKey) {
          //xLineEnd = event.localX;
          //yLineEnd = event.localY;
          xLineEnd = event.stageX - imgUIBack.x - contentX;
          yLineEnd = event.stageY - imgUIBack.y - contentY;

          if (xLineEnd < 0 || yLineEnd < 0 ||
              xLineEnd > bmWidth || yLineEnd > bmHeight) {
            isDrawingLine = false;
            if (!isShowingFrames) showFrames(null);
            return;
          }

          if (hasCoordinates) {
            endLat = DTR * (location[0] - ( (location[0] - location[2])* 
                        (yLineEnd-yMove) )/bmHeight/zoomYFactor);
            endLon = DTR * (location[1] - ( (location[1] - location[3])*
                        (xLineEnd-xMove) )/bmWidth/zoomXFactor);

            if (distUnit == "pixel") {
              distance = Math.sqrt( (endLat-begLat)/DTR*(endLat-begLat)/DTR +
                                    (endLon-begLon)/DTR*(endLon-begLon)/DTR );
            } else {

              distance =
                Math.pow(Math.sin( (endLat-begLat)/2.),2) +
                Math.cos(begLat)*Math.cos(endLat)*
                Math.pow(Math.sin( (endLon-begLon)/2.),2) ;

                //var ddd:Number = 6367.*2.*Math.atan2(Math.sqrt(distance), Math.sqrt(1.  - distance));
              distance = 6367.* 2.* Math.asin(Math.min(1.0, Math.sqrt(distance)));
              if (distUnit == "mi") distance = distance * 0.621371192;
              if (distUnit == "nmi") distance = distance * 0.539956803;
              if (showBearing) {
                bearingTo = ( Math.atan2( Math.sin(endLon - begLon)*
                   Math.cos(endLat), Math.cos(begLat)*Math.sin(endLat) -
                   Math.sin(begLat)*Math.cos(endLat)*
                   Math.cos(endLon - begLon)) / DTR + 360.) % 360.;;
                bearingFrom = ( Math.atan2( Math.sin(begLon - endLon)*
                   Math.cos(begLat), Math.cos(endLat)*Math.sin(begLat) -
                   Math.sin(endLat)*Math.cos(begLat)*
                   Math.cos(begLon - endLon)) / DTR + 360.) % 360.;;
                //debug("bearingTo = "+bearingTo+"  from="+bearingFrom);
              }
            }

            isDrawingLine = true;
            if (isLoc) updateLocation(event);
            if (!isShowingFrames) showFrames(null);

          } else if (hasScale) {
            distance = mapScale * Math.sqrt( 
              (yLineEnd - yLineBeg)*(yLineEnd - yLineBeg)
              /zoomYFactor/zoomYFactor + 
              (xLineEnd - xLineBeg)*(xLineEnd - xLineBeg)
              /zoomXFactor/zoomXFactor ); 

            isDrawingLine = true;
            if (isLoc) updateLocation(event);
            if (!isShowingFrames) showFrames(null);
          }

          return;
        }

        if (event.target != drawingPaper) return;

        if (!isWiping && (zoomXFactor <= zoomXBase)) return;

        if ( isDragging  || ( (Math.abs(event.localX - xScreen) > 3)) || 
                ( (Math.abs(event.localY - yScreen) > 3)) ) {

           xScreen = event.localX;
           yScreen = event.localY;
           xMove = Math.round(xScreen - xImage*zoomXFactor);
           yMove = Math.round(yScreen - yImage*zoomYFactor);

           isDragging = true;
        }
      }

      if (isLoc) updateLocation(event);

      if (!isShowingFrames) showFrames(null);
    }


/** updateLocation()
*
* update the Location readout, if active...
*/
  private function updateLocation(event:MouseEvent) : void {
    var xLoc:Number = event.stageX - imgUIBack.x - contentX;
    var yLoc:Number = event.stageY - imgUIBack.y - contentY;

    if (xLoc < 0 || xLoc > bmWidth) return;
    if (yLoc < 0 || yLoc > bmHeight) return;

    lat = (location[0] - ( (location[0] - location[2])* 
                        (yLoc-yMove) )/bmHeight/zoomYFactor);
    lon = (location[1] - ( (location[1] - location[3])*
                        (xLoc-xMove) )/bmWidth/zoomXFactor);

    if (is180 && lon > 180.0) lon = lon-360.0;
    if (lon > 360.0) lon = lon - 360.0;

    locLabel.text = locLabelFirst+lat.toFixed(locLabelDigits)+"  "+locLabelSecond+lon.toFixed(locLabelDigits);
    locLabel.height = locLabel.measureText(locLabel.text).height + 3;
    locLabel.width = locLabel.measureText(locLabel.text).width + 5;

    if (xLoc+locOffset + locLabel.width > bmWidth) {
      locLabel.x = bmWidth - locLabel.width;
    } else {
      locLabel.x = xLoc+locOffset;
    }

    if (yLoc + locOffset + locLabel.height > bmHeight) {
      locLabel.y = bmHeight - locLabel.height;
    } else {
      locLabel.y = yLoc + locOffset;
    }

    locLabel.invalidateSize();
  }



/** resetZoom()
*
* reset the zoom factor to the default.  Reset the pointers
* for offset displays of the image
*/

    private function resetZoom(): void {
      zoomXFactor = zoomXBase;
      zoomYFactor = zoomYBase;

      isZooming = false;
      if (zoom != null) {
        zoom.label = zoomLabelTrue;
        setLabelColors(zoom, zoomLabelColors, false);
        enableZooming = false;
      }
      xImage = xScreen;
      yImage = yScreen;
      xMove = 0;
      yMove = 0;
    }



/** bclick(MouseEvent)
*
* handle button clicking events
*/

    private function bclick(event:MouseEvent): void {

      //debug("Event="+event+"  Target = "+event.target+" CurTaget="+event.currentTarget);

      if (event.target == startstop) {

        if (isLooping) {
          timer.stop();
          stopLooping();
        } else {
          startLooping();
          timer.start();
        }

      } else if (event.target == showButt) {
        try {
          var fnshow:String = fnList[0][currentFrame];
          if (imageBase != null) fnshow = imageBase+fnList[0][currentFrame];
          debug("calling ExInt with fn = "+fnshow);
          flash.external.ExternalInterface.call("flanis_show", fnshow);

        } catch (e:Error) {
          debug("ExternInterface error = "+e);
        }

      } else if (event.target == wiperButt) {
        isWiping = !isWiping;
        if (isWiping) {
          wiperButt.label=wiperLabelOn;
          setLabelColors(wiperButt, wiperLabelColors, true);
          wasLooping = isLooping;
          stopLooping();
          backSprite.useHandCursor = true;
        } else {
          wiperButt.label=wiperLabelOff;
          setLabelColors(wiperButt, wiperLabelColors, false);
          if (wasLooping) startLooping();
          backSprite.useHandCursor = false;
        }


      } else if (event.target == printButt) {
         try {
           var pj:PrintJob = new PrintJob();
           var pjo:PrintJobOptions = new PrintJobOptions();
           pjo.printAsBitmap = true;
           pj.start();
           pj.addPage(backSprite, null, pjo);
           pj.send();
           pj = null;
         } catch (e:Error) {
           debug("printButt error = "+e);
         }

      } else if (event.target == stepForward) {

        loopDirection = 1;
        setCurrentFrame(false, loopDirection, true);

      } else if (event.target == stepBack) {

        loopDirection = -1;
        setCurrentFrame(false, loopDirection, true);


      } else if (event.target == stepFirst) {
        stopLooping();
        setCurrentFrame(true, 0, true);

      } else if (event.target == stepLast) {
        stopLooping();
        setCurrentFrame(true, lastFrame, true);

      } else if (event.target == extrap) {

        if (isExtrap) {
          isExtrap = false;
          drawingPaper.graphics.clear();
          drawingPaper.removeAllChildren();
          showExtrapResults = false;
          extrap.label = extrapLabelTrue;
          setLabelColors(extrap, extrapLabelColors, false);
          if (zoom != null) {
            zoom.enabled = true;
            zoom.label = zoomLabelTrue;
            setLabelColors(zoom, zoomLabelColors, false);
          }
          enableZooming = activeZoom;
          if (startstop != null) startstop.enabled=true;
          isLooping = wasLooping;
          // re-enable hotspots
          if (doingHotspots) {
            imgUIBack.addChild(hsCan);
          }

        } else {
          isExtrap = true;
          isDrawingLine = false;
          showExtrapResults = false;
          extrap.label = extrapLabelFalse;
          setLabelColors(extrap, extrapLabelColors, true);
          extrapX = new Array();
          extrapY = new Array();
          for (var i:int=0; i<numFrames; i++) {
            extrapX.push(-1);
            extrapY.push(-1);
          }
          if (zoom != null)  zoom.enabled = false;
          enableZooming = false;
          isZooming = false;
          if (startstop != null) startstop.enabled=false;
          wasLooping = isLooping;
          isLooping = false;
          if (doingHotspots) {
            imgUIBack.removeChild(hsCan); 
          }
          setCurrentFrame(true,0,false);
          showFrames(null);
        }

      } else if (event.target == probe) {
         probeEnabled = !probeEnabled;
         if (!probeEnabled) {
          drawingPaper.graphics.clear();
          drawingPaper.removeAllChildren();
          setLabelColors(probe, probeLabelColors, false);
         } else {
          setLabelColors(probe, probeLabelColors, true);
         }

      } else if (event.target == zoom) {
         if (enableZooming) {
           resetZoom();
         } else {
           enableZooming = true;
           zoom.label = zoomLabelFalse;
           setLabelColors(zoom, zoomLabelColors, true);
         }
         if (!isShowingFrames) showFrames(null);

      } else if (event.target == looprock) {
        isRocking = !isRocking;
        if (isRocking) {
          looprock.label = looprockLabelTrue;
          setLabelColors(looprock, looprockLabelColors, true);
        } else {
          looprock.label = looprockLabelFalse;
          setLabelColors(looprock, looprockLabelColors, false);
          loopDirection = 1;
          setCurrentFrame(false, loopDirection, false);
        }

      } else if (event.target == autoOnOff) {
        if (autoState) {
          autoOnOff.label = autoOnOffLabelTrue;
          setLabelColors(autoOnOff, autoOnOffLabelColors, true);
          refreshTimer.stop();
          autoState = false;
        } else {
          autoOnOff.label = autoOnOffLabelFalse;
          setLabelColors(autoOnOff, autoOnOffLabelColors, false);
          refreshTimer.delay = refreshRate*60*1000;
          refreshTimer.start();
          autoState = true;
        }

      } else if (event.target == refresh) {
        refreshImages(null);

      } else if (event.target == faderToggle) {
        var v:int = setFaderScrollbar.value;
        v = (v+numFadeSteps)/numFadeSteps*numFadeSteps;
        if (v > setFaderScrollbar.maximum) v = 0;
        setFaderScrollbar.value = v;
        setCurrentFrame(false, 0, false);
        if (!isShowingFrames) showFrames(null);

      } else if (event.target == locButt) {
        if (isLoc) {
          isLoc = false;
          locButt.label = locLabelOff;
          setLabelColors(locButt, locLabelColors, false);
          locLabel.visible = false;
        } else {
          isLoc = true;
          locButt.label = locLabelOn;
          setLabelColors(locButt, locLabelColors, true);
          locLabel.visible = true;
        }

      } else {

        // if in extrap mode or shift key pressed, just skip hotspots
        if (!isExtrap && !event.shiftKey) {

          if (doingHotspots && (event.type == "click") ) {

            for (var n:int = 0; n<hsButton.length; n++) {

              if (event.target == hsButton[n].getChildAt(0)) {
                event.stopImmediatePropagation();

                if (hsType[n] == "fof") {
                  var mm:int = paramNames.indexOf("file_of_filenames");
                  if (mm != -1) paramValues[mm][0] = hsValue[n];
                  loadingHotspot = true;
                  refreshImages(null);
                  return;

                } else if (startsWith(hsType[n],"popup") ) {

                    showHotspotText(hsValue[n], hsButton[n], hsType[n]);

                } else if (hsType[n] == "link") {

                  flash.external.ExternalInterface.call("flanis_link", hsValue[n]);
                }
              }
            }
          } 

          if (doingBackHotspots && (event.type == "click") ) {

            for (n = 0; n<backhsButton.length; n++) {

              if (event.target == backhsButton[n]) {
                event.stopImmediatePropagation();

                if (backhsType[n] == "fof") {
                  mm = paramNames.indexOf("file_of_filenames");
                  if (mm != -1) paramValues[mm][0] = backhsValue[n];
                  loadingHotspot = true;
                  refreshImages(null);
                  return;

                } else if (startsWith(backhsType[n],"popup") ) {

                    showHotspotText(backhsValue[n], backhsButton[n], backhsType[n]);

                } else if (backhsType[n] == "link") {

                  flash.external.ExternalInterface.call("flanis_link", backhsValue[n]);
                }
              }
            }
          }
        }

        // now check for other events on the images...

        if ( (event.type == "mouseUp") && !isExtrap) {

          if (!event.shiftKey && !isDrawingLine && !isDragging) {

            if (Math.abs(event.localX - xScreen) < 3 &&
                Math.abs(event.localY - yScreen) < 3) {

               xScreen = event.localX;
               yScreen = event.localY;

              if (event.altKey) {
                resetZoom();

              } else {

                if (enableZooming) {
                  if (event.ctrlKey) {
                    zoomXFactor = zoomXFactor - .1*zoomScale;
                    zoomYFactor = zoomYFactor - .1*zoomScale;
                    if (zoomXFactor < zoomXBase || zoomYFactor < zoomYBase) {
                      zoomXFactor = zoomXBase;
                      zoomYFactor = zoomYBase;
                      xImage = xScreen;
                      yImage = yScreen;
                      xMove = 0;
                      yMove = 0;
                    }

                  } else {

                    zoomXFactor = zoomXFactor + .1*zoomScale;
                    zoomYFactor = zoomYFactor + .1*zoomScale;
                    debug("zoomX = "+zoomXFactor);
                    if (zoomXFactor > zoomFactorMax) zoomXFactor = zoomFactorMax;
                    if (zoomYFactor > zoomFactorMax) zoomYFactor = zoomFactorMax;
                  }
                }

                isZooming = true;
                xMove = Math.round(xScreen - xImage*zoomXFactor);
                yMove = Math.round(yScreen - yImage*zoomYFactor);
              }
            }

            if (isLoc) updateLocation(event);

          } else {

            isDragging = false;
            if (isDrawingLine) {
              drawingPaper.graphics.clear();
              drawingPaper.removeAllChildren();
            }

            isDrawingLine = false;
          }

          event.stopImmediatePropagation();


        } else if (event.type == "mouseDown") {

          if (isExtrap) {
            if (event.altKey) {  // extrapolate
              xExtrap = event.localX;
              yExtrap = event.localY;
              showExtrapResults = true;
              setCurrentFrame(true,numFrames-1, false);
              if (!toFromLock) {
                toFrom = true;
                if (event.shiftKey) toFrom = false;
              }

            } else if (event.shiftKey || (extrapMode == 1) ) {  // mark position
              extrapX[currentFrame] = event.localX;
              extrapY[currentFrame] = event.localY;
              showExtrapResults = false;   // new points
              showFrames(null);

              if (extrapMode == 1) {
                extrapStep.start();
              }


            } else {  // just advance frame
              loopDirection = 1;
              setCurrentFrame(false, loopDirection, false);
            }


          } else {

            xScreen = event.localX;
            yScreen = event.localY;

            xScreen = event.stageX - imgUIBack.x - contentX;
            yScreen = event.stageY - imgUIBack.y - contentY;

            xImage = Math.round( (xScreen - xMove)/zoomXFactor);
            yImage = Math.round( (yScreen - yMove)/zoomYFactor);
            if (isWiping) {
              isDragging = true;
            } else {
              isDragging = false;
            }

            //if (isDrawingLine) {
              drawingPaper.graphics.clear();
              drawingPaper.removeAllChildren();
            //}

            if (hasCoordinates || hasScale) {
              xLineBeg = xScreen;
              yLineBeg = yScreen;
              if (hasCoordinates) {
                begLat = DTR * (location[0] - ( (location[0] - location[2])* 
                          (yScreen-yMove) )/bmHeight/zoomYFactor);
                begLon = DTR * (location[1] - ( (location[1] - location[3])*
                          (xScreen-xMove) )/bmWidth/zoomXFactor);
              }
            }

          }

          event.stopImmediatePropagation();

        }

        if (!isShowingFrames) showFrames(null);
      }

      event.updateAfterEvent();
    }

/** showPopUpText(s:String)
*
* this needs to be more auto-scaled, though....
*
*/

    private function showHotspotText(s:String, butt:UIComponent, pop:String):void {
      var hotspotText:TextArea = new TextArea();

      hotspotText.editable = false;
      hotspotText.wordWrap = true;
      hotspotText.htmlText = s;
      hotspotText.horizontalScrollPolicy = "off";
      hotspotText.verticalScrollPolicy = "auto";
      hotspotText.validateNow();
      hotspotText.percentWidth = 100;
      hotspotText.percentHeight = 100;

      // locate mouse; offset for 'mom' coordinates...
      var x:int = butt.x;
      var y:int = butt.y;
      var w:int = 160;
      var h:int = 200;

      var begindex:int = pop.indexOf("[");
      if (begindex > 0) {
        var endindex:int = pop.indexOf("]");
        if (endindex > begindex) {
          var poop:String = pop.substring(begindex+1,endindex);
          debug("poop = "+poop);
          var pps:Array = poop.split("/");
          if (startsWith(pps[0],"+") || startsWith(pps[0],"-") ) {
            x = x + parseInt(pps[0]);
          } else {
            x = parseInt(pps[0]);
          }

          if (startsWith(pps[1],"+") || startsWith(pps[1],"-") ) {
            y = y + parseInt(pps[1]);
          } else {
            y = parseInt(pps[1]);
          }


          if (pps.length > 2) {
            w = parseInt(pps[2]);
            h = parseInt(pps[3]);
          }

        }
      }

      //offset for "mom" coordinates
      x = x + imgUIBack.x + contentX;
      y = y + imgUIBack.y + contentY;

      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > mom.width) x = mom.width;
      if (y > mom.height) y = mom.height;

      var hsTW:TitleWindow = new TitleWindow();
      hsTW.horizontalScrollPolicy = "auto";
      hsTW.verticalScrollPolicy = "auto";
      hsTW.layout = "vertical";
      hsTW.showCloseButton = true;
      hsTW.width = w;
      hsTW.height = h;
      hsTW.x = x;
      hsTW.y = y;
      hsTW.validateNow();
      hsTW.addChild(hotspotText);

      PopUpManager.addPopUp(hsTW, grandma, false);

      hsTW.addEventListener(CloseEvent.CLOSE,
        function (e:Event): void {
          PopUpManager.removePopUp(hsTW);
          mom.setFocus();
        }, false,0,false);
    }



/** kclick()
*
* handler for key clicks
*
*/
    private function kclick(e:KeyboardEvent):void {
     //debug("keyboard...keyCode="+e.keyCode+" charCode="+e.charCode);

      if (e.type == "keyUp") {
        activeKey = -1;
        return;
      }

      activeKey = e.keyCode;

      // back arrow...or "b" key
      if (e.keyCode == 37 || e.keyCode == 66) {
        // back one
        setCurrentFrame(false, -1, true);

      // forward arrow...or "a" key
      } else if (e.keyCode == 39 || e.keyCode == 65) {
        // forward one
        setCurrentFrame(false, 1, true);

      // X marks the spot!
      } else if (e.keyCode == 88) {
         extrapX[currentFrame] = xMouse;
         extrapY[currentFrame] = yMouse;
         showExtrapResults = false;   // new points
         showFrames(null);

      // R to reset....
      } else if ( (e.keyCode == 82) || (e.keyCode == 114) ) {
        resetZoom(); 
      }

    }




/** drawOnOff()
*
* draw the "toggle boxes" -- just set their colors based on onOffState
* values.
*
*/

    private function drawOnOff():void {
      for (var nof:int = 0; nof<numFrames; nof++) {

        onOffRect.x = nof*(onOffWidth+onOffSpacing);

        if (onOffState[nof] == -1) {
          onOffBMD.fillRect(onOffRect, 0xffff0000);
        } else if (onOffState[nof] == 1) {
          onOffBMD.fillRect(onOffRect, 0xff0000ff);
        } else {
          onOffBMD.fillRect(onOffRect, 0xff00ff00);
        }
      }
    }
    



/** setCurrentFrame(Boolean, int, Boolean)
*
* set the currentFrame value based on inputs
*
* handle toggle button changes as well (if needed)
*
* set the dwell rates as appropriate
*/

    private function setCurrentFrame(isAbsolute:Boolean, value:int, 
                                            isButton:Boolean): void {

      if (!isAbsolute) value = value * incFrame;
      if (numFrames < 0) return;

      if (isFader) {
        currentFrame = setFaderScrollbar.value;
      }

      if (isFading || isFader) {
        endFrame = numFadeSteps*(numFrames - 1);
      } else {
        endFrame = lastFrame;
      }

      if (isOnOff && currentFrame != -1) {
        if (onOffState[currentFrame] != -1) onOffState[currentFrame] = 0;
      }

      if (isAbsolute) {
        currentFrame = value;

      } else {
        deadFrames = 0;
        while (true) {
          currentFrame = currentFrame + value;
          if (currentFrame > endFrame) {
            if (isRocking && !isButton) {
              currentFrame = endFrame - incFrame;
              if (currentFrame < firstFrame) currentFrame = firstFrame;
              loopDirection = -loopDirection;
              value = -value;
            } else {
              currentFrame = firstFrame;
            }

          } else if (currentFrame < firstFrame) {
            if (isRocking && !isButton) {
              currentFrame = firstFrame + incFrame;
              loopDirection = -loopDirection;
              value = -value;
            } else {
              currentFrame = endFrame;
            }
          }

          if (!isOnOff) break;
          if (onOffState[currentFrame] != -1) break;

          deadFrames = deadFrames + 1;
          if (deadFrames > (2*numFrames) ) {
            currentFrame = 0;
            break;
          }
        }
      }

      if (isOnOff) { 
        onOffState[currentFrame] = 1;
        drawOnOff();
      }

      if (hasFrameLabel && (frameLabels != null) && (frameLabelField != null)) {
        frameLabelField.text = frameLabels[currentFrame];
      }

      addDwell = 0;
      if (useDwell) {
        dwell = fnDwell[currentFrame];
      } else {
        if (currentFrame == (numFrames - 1)) {
          if (pausePercent > 0) {
            addDwell = (dwell * pausePercent) / 100;
          } else {
            addDwell = pauseOnLast;
          }
        }
      }

      if (canResetDwell) timer.delay = (dwell + addDwell);
      if (!isLooping && !isShowingFrames) showFrames(null);
    }





/** showFrames(TimerEvent)
*
* the workhorse
*
* may be called on a timer event or asynchronously -- thus the
* "isShowingFrames" global.
*
*/

    private function showFrames(event:TimerEvent): void {

      //debug("show Frames, Timer count="+timer.currentCount+"  delay="+timer.delay+" frame="+currentFrame+" mem="+System.totalMemory);

      if (!bmBackCreated) return;

      isShowingFrames = true;

      if (event != null && isLooping) setCurrentFrame(false,loopDirection,false);
      // initialize the background
      bgndInit = true;

      var mat:Matrix = new Matrix();
      mat.scale (zoomXFactor, zoomYFactor);
      mat.translate (xMove, yMove);
      //trace("zoomfX="+zoomXFactor+"  xMove="+xMove+"  yM="+yMove);

      // check to see if they dragged too far....

      ptt = mat.transformPoint(upperLeft);
      if (ptt.x > 0) {
        mat.translate(-ptt.x,0);
        xMove = xMove - ptt.x;
      }
      if (ptt.y > 0) {
        mat.translate(0, -ptt.y);
        yMove = yMove - ptt.y;
      }

      ptt = mat.transformPoint(lowerRight);
      if (ptt.x < bmWidth) {
        mat.translate(bmWidth - ptt.x,0);
        xMove = xMove + (bmWidth - ptt.x);
      }

      if (ptt.y < bmHeight) {
        mat.translate(0,bmHeight - ptt.y);
        yMove = yMove + (bmHeight - ptt.y);
      }

      if (doingHotspots ) {
        for (var m:int=0; m<hsButton.length; m++) {
          if (hsPan[m] == "pan") {
            ptxy.x = hsPoint[m].x + hsButton[m].getChildAt(0).width/2;
            ptxy.y = hsPoint[m].y + hsButton[m].getChildAt(0).height/2;
            ptxy = mat.transformPoint(ptxy);
            hsButton[m].x = ptxy.x - hsButton[m].getChildAt(0).width/2;
            hsButton[m].y = ptxy.y - hsButton[m].getChildAt(0).height/2;
          }
        }
      }


      // Now the special forms -- first, "fader"
      if (isFader || isFading) {
        
        if (faderImages == null) faderImages = new Array(numFadeSteps*numFrames);

        its = currentFrame / numFadeSteps;
        scale = (256 * (currentFrame % numFadeSteps) )/numFadeSteps;

        if (bmBackLoaded[0][its] != false) {

          if (bgndInit) {
            bmBack.bitmapData.fillRect(bmRect,mom.getStyle("backgroundColor") );
            bgndInit = false;
          }

          canResetDwell = true;

          if (faderImages[currentFrame] == null) {

             faderImages[currentFrame] = new BitmapData(imgWidth,imgHeight,
                                    false,mom.getStyle("backgroundColor"));

             if (imgList[0][its] != null) {
                  faderImages[currentFrame].copyPixels(imgList[0][its],
                                    imgRect,upperLeft);
             }

             if (currentFrame % numFadeSteps != 0) {
               if (imgList[0][its+1] != null) 
                     faderImages[currentFrame].merge(imgList[0][its+1], 
                            imgRect,upperLeft, scale, scale, scale, scale); 
             }

          }

          bmBack.bitmapData.draw(faderImages[currentFrame], mat, 
                         null, null, bmRect);
        }


      // now if "wiping"

      } else if (isWiping) {

        if (bmBackLoaded[0][0] == true && bmBackLoaded[0][1] == true) {
          wRect = new Rectangle(0,0,xScreen,imgList[0][0].height);
          wPoint = new Point(0,0);
          bmBack.bitmapData.copyPixels(imgList[0][0],wRect, wPoint);
          wRect.x = xScreen;
          wRect.width = imgList[0][0].width;
          wPoint.x = xScreen;
          bmBack.bitmapData.copyPixels(imgList[0][1],wRect, wPoint);

          if (wiperLine) {
            drawingPaper.removeAllChildren();
            drawingPaper.graphics.clear();
            drawingPaper.graphics.lineStyle(1,wiperLineColor);
            drawingPaper.graphics.moveTo(xScreen,0);
            drawingPaper.graphics.lineTo(xScreen,bmHeight);

            drawingPaper.graphics.moveTo(xScreen+15,bmHeight/2);
            drawingPaper.graphics.lineTo(xScreen+5,bmHeight/2+8);
            drawingPaper.graphics.lineTo(xScreen+5,bmHeight/2-8);
            drawingPaper.graphics.lineTo(xScreen+15,bmHeight/2);

            drawingPaper.graphics.lineStyle(1,wiperLineColor);
            drawingPaper.graphics.moveTo(xScreen-15,bmHeight/2);
            drawingPaper.graphics.lineTo(xScreen-5,bmHeight/2+8);
            drawingPaper.graphics.lineTo(xScreen-5,bmHeight/2-8);
            drawingPaper.graphics.lineTo(xScreen-15,bmHeight/2);
          }

        }

      // otherwise, just "regular" stuff (background, overlays...)
      } else {

        probePix = 0;
        probeVal = Number.NaN;
        pixUnits = "";
        pixPrefix = "";
        pixLabel = "";
        probePrecision = probeOneDecimal;

        for (var i:int=0; i<imgList.length; i++) {
          its = currentFrame;

          if ( ( overlayOrder != null) && (i != 0)) {
            oo = overlayOrder[i];
          } else {
            oo = i;
          }

          if (singleImage[oo]) its = 0;
          if (its > imgList[oo].length-1) its = imgList[oo].length - 1;

          if (bmBackLoaded[oo][its] == false) continue;
          if (bgndInit) {
            bmBack.bitmapData.fillRect(bmRect,mom.getStyle("backgroundColor") );
            bgndInit = false;
          }
          canResetDwell = true;

          if (i == 0 || ( (oo != 0) && isOverlay && 
                           overlay[oo].selected == true)) {

            // masking...not used any more (?)
            if (overlayMask[oo] && 
                   !doneOverlayMask[oo][its] && bmBackLoaded[oo-1][its]) {

              var bmdm:BitmapData = imgList[oo-1][its].clone();

              var knt:int = bmdm.threshold(imgList[oo][its], imgRect,
                  upperLeft, "!=", 0xffffffff, 0x00000000, 0x00ffffff, false);
              imgList[oo][its] = bmdm;
              doneOverlayMask[oo][its] = true;
            }



            // if zoomable, apply zoom and pan; otherwise, just do it...

            if (imgZoomableList[oo] == true) {
               if (imgList[oo][its] != null) 

                 if (overlayEnhance != null && overlayEnhance[oo] != -1) {
                   bmPal.fillRect(bmRect,transparency);
                   bmPal.draw(imgList[oo][its],mat,
                               null,null,bmRect,imgSmoothList[oo]);

                   if (probeEnabled) {
                     probePix = bmPal.getPixel(xProbe, yProbe) & 0xff;
                     probeVal = probeValues[overlayEnhance[oo]][probePix];
                     pixUnits = probeUnits[overlayEnhance[oo]][probePix];
                     pixLabel = probeLabels[overlayEnhance[oo]][probePix];
                     pixPrefix = probePrefixes[overlayEnhance[oo]][probePix];
                     probePrecision = probeDecimals[overlayEnhance[oo]][probePix];

                   }

                   bmPal.paletteMap(bmPal, bmRect, upperLeft, 
                     enh[overlayEnhance[oo]][0], 
                     enh[overlayEnhance[oo]][1], 
                     enh[overlayEnhance[oo]][2], 
                     enh[overlayEnhance[oo]][3]);

                   bmBack.bitmapData.copyPixels(bmPal, bmRect, upperLeft);

                 } else {

                    bmBack.bitmapData.draw(imgList[oo][its],mat,
                               null,null,bmRect,imgSmoothList[oo]);
                 }
            
            } else {

               if (imgList[oo][its] != null) 
                      bmBack.bitmapData.draw(imgList[oo][its],null,
                               null,null,bmRect,imgSmoothList[oo]);
              
            }


          }
        }
          
        // now do any image preserves....
        if (preserve != null || preserveOlay != null) {

          for (i=0; i<imgList.length; i++) {
            its = currentFrame;

            if ( ( overlayOrder != null) && (i != 0)) {
              oo = overlayOrder[i];
            } else {
              oo = i;
            }

            if (singleImage[oo]) its = 0;
            if (its > imgList[oo].length-1) its = imgList[oo].length - 1;

            if (bmBackLoaded[oo][its] == false) continue;

            if (i == 0 || ( (oo != 0) && isOverlay && 
                             overlay[oo].selected == true)) {

              // if part is preserved, draw it....

              if ( i == 0 && preserve != null && imgList[oo][its] != null) {
                for (var p:int=0; p<preserve.length; p=p+4) {
                  preRect.x = preserve[p];
                  preRect.y = preserve[p+1];
                  preRect.right = preserve[p+2];
                  preRect.bottom = preserve[p+3];
                  prePoint.x = preserve[p];
                  prePoint.y = preserve[p+1];
                  bmBack.bitmapData.copyPixels(imgList[oo][its], preRect, prePoint,null, null, true);
                }

              } else if (i != 0 && overlayPreserve != null && 
                      imgList[oo][its] != null && 
                      overlayPreserve[oo] != -1) {
                for (p=0; p<preserveOlay[overlayPreserve[oo]].length; p=p+4) {
                  preRect.x = preserveOlay[overlayPreserve[oo]][p];
                  preRect.y = preserveOlay[overlayPreserve[oo]][p+1];
                  preRect.right = preserveOlay[overlayPreserve[oo]][p+2];
                  preRect.bottom = preserveOlay[overlayPreserve[oo]][p+3];
                  prePoint.x = preserveOlay[overlayPreserve[oo]][p];
                  prePoint.y = preserveOlay[overlayPreserve[oo]][p+1];

                  // if this overlay is marked as an overlayEnhanced
                  //one, then use the transparency= value for diddling it.
                  
                  if (overlayEnhance != null && overlayEnhance[oo] != -1) {
                    bmdp = new BitmapData(preRect.right,preRect.bottom, true);

                    bmdp.threshold(imgList[oo][its], preRect, upperLeft, 
                           "==", transparency, 0x00000000, 0x00ffffff, true);

                    // the following used the oE values instead -- not good
                    //bmdp.paletteMap(imgList[oo][its], preRect, upperLeft, enh[overlayEnhance[oo]][0], enh[overlayEnhance[oo]][1], enh[overlayEnhance[oo]][2], enh[overlayEnhance[oo]][3]),

                    preRect.x = 0;
                    preRect.y = 0;
                    bmBack.bitmapData.copyPixels(bmdp, preRect, prePoint, 
                                            null, null, true);
                  } else {
                    bmBack.bitmapData.copyPixels(imgList[oo][its], 
                                     preRect, prePoint, null, null, true);
                  }
                }
              }
            }
          }
        }
      }


      // if the 'extrap' mode is active

      if (isExtrap) {

        // here we show results -- complicated!
        if (showExtrapResults) {
          drawingPaper.removeAllChildren();
          drawingPaper.graphics.clear();
          drawingPaper.graphics.lineStyle(1,0xffffff);
          var x:int = xExtrap;
          var y:int = yExtrap;

          var sumdx:Number = 0.0;
          var sumdy:Number = 0.0;
          var sumdt:Number = 0.0;
          var count:Number = 0.0;
          var last:int = -1;
          var dt:Number = 0.0;
          for (m=0; m<minutes.length; m++) {
            // need to find out if a frame is off
            if (last == -1) {
              last = m;
            } else {
              dt = (minutes[m] - minutes[last]);
              if (dt > 1.0) {
                sumdt = sumdt + dt;
                sumdx = sumdx + (extrapX[m] - extrapX[last]) / dt;
                sumdy = sumdy + (extrapY[m] - extrapY[last]) / dt;
                last = m;
                count = count + 1.0;
              }
            }

          }

          if (count > 1.0 && sumdt != 0.0 && sumdx != 0.0 && sumdy != 0.0) {

            var gotX:int = 0;
            var gotY:int = 0;
            var accumTime:int = minutes[last] ;  // at last image
            var dxdt:Number = sumdx/count;
            var dydt:Number = sumdy/count;

            //debug("dxdt = "+dxdt+"  dydt="+dydt);

            var nmin:int = Math.round(Math.abs((timeFontSize+4)*4/dxdt));  // approx 14pt x 4 digits
            var tmin:int = Math.round(Math.abs((timeFontSize+4)*2/dydt));  // approx 14pt x 2 height
            //debug("nmin = "+nmin+"  tmin = "+tmin);
            if (tmin < nmin) nmin = tmin;

            if (nmin > 120) {
              nmin = 120*int(nmin/120)+60;
            } else if (nmin > 90) {
              nmin = 120;
            } else if (nmin > 60) {
              nmin = 90;
            } else if (nmin > 30) {
              nmin = 60;
            } else if (nmin > 15) {
              nmin = 30;
            } else if (nmin > 10) {
              nmin = 15;
            } else if (nmin > 5) {
              nmin = 10;
            } else if (nmin > 2) {
              nmin = 5;
            } else {
              if (nmin == 0) nmin = 1;
            } 

            tmin = (accumTime/nmin*nmin) + nmin;
            //debug("after....nmin = "+nmin+"  tmin = "+tmin);


            var sign:int = 1;
            if (toFrom) sign = -1;
            var endX:int = Math.round(x + sign*(dxdt*(tmin - accumTime)));
            var endY:int = Math.round(y + sign*(dydt*(tmin - accumTime)));
            drawingPaper.graphics.moveTo(x,y);
            drawingPaper.graphics.beginFill(0xffffff);
            drawingPaper.graphics.drawRect(x-2, y-2, 5, 5);
            drawingPaper.graphics.endFill();
            drawingPaper.graphics.moveTo(x,y);

            var xInc:Number = dxdt * nmin;
            var yInc:Number = dydt * nmin;
            accumTime = tmin;

            // fillRect(x-2,y-2,5,5)
            for (var gasp:int=0; gasp < 300; gasp++) {  // tiny increments?

              if (endX < 3 || (endX+3) > drawingPaper.width || 
                  endY < 3 || (endY+3) > drawingPaper.height) break;

              drawingPaper.graphics.lineStyle(3,0x000000);
              drawingPaper.graphics.lineTo(endX, endY);
              drawingPaper.graphics.drawRect(endX-2, endY-2, 5, 5);
              drawingPaper.graphics.moveTo(x,y);

              drawingPaper.graphics.lineStyle(1,0xffffff);
              drawingPaper.graphics.lineTo(endX, endY);
              drawingPaper.graphics.drawRect(endX-2, endY-2, 5, 5);
              drawingPaper.graphics.moveTo(endX, endY);

              var hm:int = startingMinute + accumTime;
              hm = 100*int(hm/60) + (hm % 60);
              hm = hm % 2400;

              var shm:String;
              if (extrapAMPM) {

                var hampm:String = "AM";
                if (hm >= 1200) {
                  if (hm >= 1300) hm = hm - 1200;
                  hampm = "PM";
                }
                shm = int(hm/100)+":";
                shm = shm + int(int(hm % 100)/10) + int(hm % 10) + " "+hampm;

              } else {
                shm = hm+" ";
                if (hm < 1000) shm = "0"+hm;
                if (hm < 100) shm = "00"+hm;
                if (hm < 10) shm = "000"+hm;
              }
              var lab:Label = new Label();

              lab.setStyle("color", timeColor);
              if (timeBack >= 0) {
                lab.opaqueBackground = timeBack;
              }

              lab.setStyle("embedFonts", true);

              lab.setStyle("fontFamily","OpenSans");
              lab.setStyle("fontWeight", timeFontWeight);
              lab.setStyle("fontSize", timeFontSize);

              if (Math.abs(yInc) < timeFontSize+5) {
                lab.rotation = 45;
              } else {
                lab.rotation = 0;
              }

              lab.text = StringUtil.trim(shm+" "+tzLabel);
              lab.x = endX+3;

              if (xInc * yInc >= 0 && lab.rotation == 0) {
                lab.y = endY-4-timeFontSize;
              } else {
                lab.y = endY-4;
              }
              if (lab.y < 5) lab.y = 5;
              drawingPaper.addChild(lab);
              lab.height = lab.measureText(lab.text).height + 3;
              lab.width = lab.measureText(lab.text).width + 5;

              x = endX;
              y = endY;
              endX = Math.round(x + sign*xInc);
              endY = Math.round(y + sign*yInc);
              accumTime = accumTime + nmin;
            }
          }


        } else {

          drawingPaper.graphics.clear();
          drawingPaper.removeAllChildren();

          drawingPaper.graphics.lineStyle(3,0x000000);
          for (var ls:int=0;  ls < 2; ls++) {
            drawingPaper.graphics.moveTo(extrapX[0], extrapY[0]);
            for (var ks:int=0; ks <= currentFrame; ks++) {
              if (extrapX[ks] >= 0) 
                   drawingPaper.graphics.lineTo(extrapX[ks], extrapY[ks]);
            }
            drawingPaper.graphics.lineStyle(1,0xffffff);
          }

          if (extrapX[currentFrame] >= 0) {
            drawingPaper.graphics.lineStyle(3,0x000000);
            for (ls=0; ls<2; ls++) {
              drawingPaper.graphics.moveTo(extrapX[currentFrame]-10,
                   extrapY[currentFrame]);
              drawingPaper.graphics.lineTo(extrapX[currentFrame]+10,
                   extrapY[currentFrame]);
              drawingPaper.graphics.moveTo(extrapX[currentFrame],
                   extrapY[currentFrame]-10);
              drawingPaper.graphics.lineTo(extrapX[currentFrame],
                   extrapY[currentFrame]+10);
              drawingPaper.graphics.lineStyle(1,0xffffff);
            }
          }
        }
      } 

      // when will probes every be enabled, eh?
      if (probeEnabled) {
        drawingPaper.removeAllChildren();
        drawingPaper.graphics.clear();
        var labVal:Label = new Label();
        labVal.opaqueBackground = probeBgColor;
        labVal.setStyle("color", probeFgColor);
        labVal.setStyle("fontSize", probeFontSize);
        probeFormatter.precision = probePrecision;

        if (pixLabel != null && pixLabel != "") {
          labVal.text = pixLabel;
        } else if (isNaN(probeVal)) {
          labVal.text = "No Data";
        } else {
          labVal.text = pixPrefix+" " +
                probeFormatter.format(probeVal)+" "+pixUnits;
        }

        labVal.x = xProbe -50;
        labVal.y = yProbe +20;
        if (labVal.x < 2) labVal.x = 2;
        if (labVal.y < 2) labVal.y = 2;
        drawingPaper.addChild(labVal);

        labVal.height = labVal.measureText(labVal.text).height + 3;
        labVal.width = labVal.measureText(labVal.text).width + 5;
        if ( (labVal.x + labVal.width) > bmWidth) {
          labVal.x = bmWidth - labVal.width - 2;
        }
        if ( (labVal.y + labVal.height) > bmHeight) {
          labVal.y = bmHeight - labVal.height - 2;
        }
      }
      // if drawing the "distance" line

      if (isDrawingLine) {
        drawingPaper.graphics.clear();
        drawingPaper.removeAllChildren();
        if (showGC) {

/* and if we ever want to plot values along a great circle arc...
          lat2 = asin(sin(lat1)*cos(d/R) + cos(lat1)*sin(d/R)*cos(bearingFrom))
          lon2 = lon1 + atan2(sin(bearingFrom)*sin(d/R)*cos(lat1), cos(d/R)-sin(lat1)*sin(lat2))
    d/R is the angular distance (in radians), where d is the distance travelled and R is the earth's radius
*/
        } else {
          drawingPaper.graphics.lineStyle(3,0x000000);
          drawingPaper.graphics.moveTo(xLineBeg, yLineBeg);
          drawingPaper.graphics.lineTo(xLineEnd, yLineEnd);
          drawingPaper.graphics.lineStyle(1,0xffffff);
          drawingPaper.graphics.moveTo(xLineBeg, yLineBeg);
          drawingPaper.graphics.lineTo(xLineEnd, yLineEnd);
        }

        // label for showing the distance values
        var labdist:Label = new Label();
        labdist.opaqueBackground = distBgColor;
        labdist.setStyle("color", distFgColor);
        labdist.setStyle("fontSize", distFontSize);
        labdist.text = distFormatter.format(distance) +" "+distUnit;
        //labdist.text = String(Math.round(distance)+" "+distUnit);
        if (showBearing) {
          if (bearingType.indexOf("t") != -1 && 
                     bearingType.indexOf("f") != -1) {
            labdist.text = labdist.text+"  ("+(Math.round(bearingTo))+"\xB0/"+
               (Math.round(bearingFrom))+"\xB0)";
          } else if (bearingType.indexOf("t") != -1) {
            labdist.text = labdist.text+"  ("+(Math.round(bearingTo))+"\xB0)";
          } else {
            labdist.text = labdist.text+"  ("+(Math.round(bearingFrom))+"\xB0)";
          }
        }
        labdist.x = xLineEnd + 10;
        labdist.y = yLineEnd - 5;
        if (labdist.y < 1) labdist.y = 5;
        drawingPaper.addChild(labdist);

        labdist.height = labdist.measureText(labdist.text).height + 3;
        labdist.width = labdist.measureText(labdist.text).width + 5;
        if ( (labdist.x + labdist.width) > bmWidth) {
          labdist.x = bmWidth - 2*labdist.width;
        }
        if ( (labdist.y + labdist.height) > bmHeight) {
          labdist.y = bmHeight - 2*labdist.height;
        }
      }

      mat = null;
      event = null;
      isShowingFrames = false;
    }



      

/** getImages()
*
* continue the chain of events in setting this up.
*
* here, create the Loaders and begin the loading operations
*
* event handler is called "doneLoading"
*/

    public function getImages() :void {

      var fName:String = " ";
      totalFrames = 0;
      isLoading = true;
      countFrames = 0;
      faderImages = null;

      for (var i:int=0; i<fnList.length; i++) {

        if (initialLoad) {
          imgLoaderList[i] = new Array(fnList[i].length);
          imgLoaderInfoList[i] = new Array(fnList[i].length);
          imgList[i] = new Array(fnList[i].length);

        } else if (!loadingHotspot && overlayStatic[i]) {
          if (i == 0) {
            bmBackCreated = true;
            doLayoutControls = false;  // only the first time...

            // now restart as required...
            isLooping = wasLooping;
            if (isLooping) {
              startLooping();
            } else {
              stopLooping();
            }
            timer.start();
          }
          continue;
        }


        for (var k:int=0; k<fnList[i].length; k++) {
          if (singleImage[i] && (k != 0) ) continue;

          try {

            if (imgLoaderList[i][k] != null) {
              (imgLoaderList[i][k].content as Bitmap).bitmapData.dispose();
              imgLoaderList[i][k].unload();
              imgLoaderList[i][k] = null;
            }

            imgLoaderList[i][k] = new Loader();
            imgLoaderInfoList[i][k] = imgLoaderList[i][k].contentLoaderInfo;
            imgLoaderInfoList[i][k].addEventListener(Event.COMPLETE, 
                                  doneLoading, false, 0, true);
            imgLoaderInfoList[i][k].addEventListener(IOErrorEvent.IO_ERROR, 
                                  errorLoading, false, 0, true);
            fName = fnList[i][k];
            if (imageBase != null) fName = imageBase+fName;

            var request:URLRequest;

            if (!useCaching || (doExcludeCaching && 
                           (fName.indexOf(excludeCaching) != -1) ) ) {

              if (useAntiCaching && fName.indexOf("?") == -1) {
                antiCacheIndex = Math.random()*1677216.0;
                fName = fName+"?"+antiCacheIndex;
              }

              request = new URLRequest(fName);

              request.requestHeaders.push(new URLRequestHeader("Cache-Control","no-store,max-age=0,no-cache,must-revalidate"));
              request.requestHeaders.push(new URLRequestHeader("Expires","Mon, 26 Jul 1997 05:00:00 GMT"));
              request.requestHeaders.push(new URLRequestHeader("Pragma","no-cache"));

            } else {
              request = new URLRequest(fName);
            }

            debug("Read file: URL="+request.url);

            totalFrames = totalFrames + 1;
            imgLoaderList[i][k].load(request);

          } catch (ioe:Error) {

            debug("******** Error in getImages for "+fName+":"+ioe);
            imgList[i][k] = null;
            countFrames = countFrames + 1;
          }

        }
      }

      if (hiresFnList != null) {
        for (i=0; i<hiresFnList.length; i++) {
          if (hiresFnList[i] != null && (hiresFnList[i].length > 3) ) {
            //trace("would read hires = "+hiresFnList[i]);
          }
        }
      }

      loadingHotspot = false;
      
    }



/** errorLoadingFilenames(IOErrorEvent)
*
* come here if there is a problem reading file_of_filenames
*
*/
    public function errorLoadingFilenames(e:IOErrorEvent) : void {
      if (fofErrorCount < 20) {
        fofErrorCount = fofErrorCount + 1;
        debug("File_of_Filenames read error, count="+fofErrorCount);
        fofTimer.start();

      } else {

        fofTimer.stop();
        isLoading = false;
        if (refresh != null) refresh.enabled = true;
        Alert.show("Could not load file_of_filenames!! "+e);
      }
    }

/** errorLoadingConfigFile(IOErrorEvent)
*
* come here if there is a problem reading file_of_filenames
*
*/
    public function errorLoadingConfigFile(e:IOErrorEvent) : void {
      Alert.show("Could not read config file! Error="+e);
    }



/** errorLoading(IOErrorEvent)
*
* if there was an error loading images, come here -- 
*
* null out the BitmapData reference 
*/
    public function errorLoading(e:IOErrorEvent) : void {

      for (var i:int=0; i<imgLoaderList.length; i++) {
        // now scan each element of the overlay list
        for (var k:int=0; k<imgLoaderList[i].length; k++) {
          if (e.target == imgLoaderInfoList[i][k]) {
            debug("******** Error loading frame "+k+" from overlay "+i);
            imgLoaderInfoList[i][k].removeEventListener(IOErrorEvent.IO_ERROR, errorLoading, false);
            imgLoaderInfoList[i][k].removeEventListener(Event.COMPLETE, doneLoading, false);
            imgList[i][k] = null;
          }
        }
      }
      updatePBar();
    }


/** updatePBar()
*
* update the value of the Progress Bar.  Test whether we're done
*/
    private function updatePBar():void {
      countFrames = countFrames + 1;
      debug("countFrames = "+countFrames+"  totFrames="+totalFrames);
      if (countFrames >= totalFrames) {
        if (pbar != null) {
          mom.removeChild(pbar);
          pbar = null;
        }

        isLoading = false;
        if (refresh != null) refresh.enabled = true;
        if (startstop != null) startstop.enabled = true;
        canResetDwell = true;
        timer.delay = (dwell + addDwell);

      } else if ( (pbar != null) && useProgressBar) {

        pbar.setProgress(countFrames, totalFrames);
        pbar.validateNow();
      }

    }



/** doneLoading(Event)
*
* event handler -- after an image is loaded, this will be
* called.  Search thru the list of Loaders and find the right
* one.  Get the BitmapData for that image and store it away.
*
* Also, set the stage for displaying, make the Sprite for all
* this.  Finish the GUI if appropriate (bottom_controls).  Add
* in the "paper" UIComps for drawing and readouts.
*
* layers: imgUIBack <-  backSprite <- bmBack 
*                   <- drawingPaper & locLabel & hsCan
*
*/
    public function doneLoading(e:Event):void {

      updatePBar();
      imgHeight = e.target.content.bitmapData.height;
      imgWidth = e.target.content.bitmapData.width;
      imgRect = new Rectangle(0,0,imgWidth, imgHeight);

      // look through imgLoaderList for match...which image is this?
      for (var i:int=0; i<imgLoaderList.length; i++) {

        // now scan each element of the overlay list
        for (var k:int=0; k<imgLoaderList[i].length; k++) {

          if (e.target.loader == imgLoaderList[i][k]) {

            debug("MATCHED LOADER for i="+i+"  k="+k);
            imgLoaderList[i][k].contentLoaderInfo.removeEventListener(Event.COMPLETE, doneLoading);
            imgLoaderList[i][k].contentLoaderInfo.removeEventListener(IOErrorEvent.IO_ERROR, errorLoading);

            // element 0 is special = background image

            if (i == 0) {
            
              if (initialLoad && imgHeight > 0 && imgWidth > 0) {
                if (!userWindowSize) {
                  bmHeight = imgHeight;
                  bmWidth = imgWidth;
                  bmRect = new Rectangle(0,0,bmWidth, bmHeight);

                } else {
                  zoomXBase = bmWidth/imgWidth;
                  zoomYBase = bmHeight/imgHeight;
                  zoomXFactor = zoomXBase;
                  zoomYFactor = zoomYBase;
                }

                if (isInitialZoom) {
                  xMove = (bmWidth/2. - xScreen*initialZoom);
                  yMove = (bmHeight/2. - yScreen*initialZoom);
                  zoomXFactor = initialZoom;
                  zoomYFactor = initialZoom;
                }

                isInitialZoom = false;
                if (isWiping) xScreen = bmWidth/2;

                bmBackground = new BitmapData(bmWidth, bmHeight, 
                              false, mom.getStyle("backgroundColor") );
                bmBack = new Bitmap(bmBackground);
                bmPal = new BitmapData(bmWidth, bmHeight,true,transparency);
                initialLoad = false;
              }


              if (imgList[i][k] != null) imgList[i][k].dispose();
              imgList[i][k] = new BitmapData(imgWidth, imgHeight, false);
              imgList[i][k].copyPixels(e.target.content.bitmapData, 
                           imgRect, upperLeft);

              // if need to apply enhancement to base images,...
              if (baseEnhance >= 0) {
                debug(" baseEnhance = "+baseEnhance);

                madeEnhBitmaps = true;
                enhBitmaps[k] = imgList[i][k].clone();
                imgList[i][k].paletteMap(enhBitmaps[k], imgRect, 
                         upperLeft, enh[baseEnhance][0], 
                         enh[baseEnhance][1], enh[baseEnhance][2]);
              }


              // if first image, then make a UIComponent & Sprite for it
              if (k == 0) {
                lowerRight = new Point(imgWidth, imgHeight);

                if (backSprite != null) {
                  backSprite.removeChild(bmBack);
                  backSprite.removeEventListener(MouseEvent.MOUSE_DOWN, bclick);
                  backSprite.removeEventListener(MouseEvent.MOUSE_UP, bclick);
                }

                debug("defined bmBack "+i+" width="+bmBack.bitmapData.width);
                backSprite = new Sprite();
                backSprite.addChild(bmBack);

                if (imgUIBack != null) vb.removeChild(imgUIBack);

                imgUIBack = new UIComponent();
                imgUIBack.height = bmHeight;
                imgUIBack.width = bmWidth;
                imgUIBack.addChild(backSprite);

                backSprite.addEventListener(MouseEvent.MOUSE_DOWN, bclick);
                backSprite.addEventListener(MouseEvent.MOUSE_UP, bclick);
                backSprite.addEventListener(MouseEvent.MOUSE_MOVE, bdrag);

                // now add background image...
                //drawingPaper = new UIComponent();
                if (drawingPaper != null) {
                  drawingPaper.removeAllChildren();
                  drawingPaper.removeEventListener(MouseEvent.MOUSE_DOWN, bclick);
                  drawingPaper.removeEventListener(MouseEvent.MOUSE_UP, bclick);
                  drawingPaper.removeEventListener(MouseEvent.MOUSE_MOVE, bdrag);
                }

                drawingPaper = new Canvas();
                drawingPaper.x = 0;
                drawingPaper.y = 0;
                drawingPaper.width = bmWidth;
                drawingPaper.height = bmHeight;
                drawingPaper.horizontalScrollPolicy=ScrollPolicy.OFF;
                drawingPaper.verticalScrollPolicy=ScrollPolicy.OFF;

                drawingPaper.addEventListener(MouseEvent.MOUSE_DOWN, bclick,
                       false,0,true);
                drawingPaper.addEventListener(MouseEvent.MOUSE_UP, bclick,
                       false,0,true);
                drawingPaper.addEventListener(MouseEvent.MOUSE_MOVE, bdrag,
                       false,0,true);
                imgUIBack.addChild(drawingPaper);

                probePaper = new UIComponent();
                probePaper.x = 0;
                probePaper.y = 0;
                probePaper.width = bmWidth;
                probePaper.height = bmHeight;
                imgUIBack.addChild(probePaper);
                if (doingLoc) imgUIBack.addChild(locLabel);

                if (doingHotspots) {
                  if (hsCan != null) hsCan.removeAllChildren();
                  hsCan = new Canvas();
                  hsCan.width = bmWidth;
                  hsCan.height = bmHeight;
                  hsCan.autoLayout = false;
                  hsCan.clipContent = true;
                  hsCan.horizontalScrollPolicy = "off"; 
                  hsCan.verticalScrollPolicy = "off";

                  ////// maybe the UIComp needs to have its location fixed....

                  debug("...ADDING hotspots to new bgnd....."+hsButton.length);
                  for (var m:int = 0; m<hsButton.length; m++) {
                    hsCan.addChild(hsButton[m]);
                  }

                  imgUIBack.addChild(hsCan);
                }

                vb.addChild(imgUIBack);

                bmBackCreated = true;

                if (!doLayoutControls && useBottomControls) {
                  vb.removeChild(vbc);
                  doLayoutControls = true;
                }

                if (doLayoutControls && useBottomControls) {
                  if (!noControls) vb.addChild(vbc);
                }

                doLayoutControls = false;  // only the first time...

                // now restart as required...
                isLooping = wasLooping;
                if (isLooping) {
                  startLooping();
                } else {
                  stopLooping();
                }
                timer.start();
              }

            } else {

              var bmd:BitmapData = new BitmapData(imgWidth,imgHeight,true);

              if (overlayEnhance[i] != -1) {
                // here we need to set the alpa to be the gray level
                var cmf:ColorMatrixFilter = new ColorMatrixFilter();
                for (var ii:int=0; ii<20; ii++) {
                  cmf.matrix[ii] = 0;
                }
                cmf.matrix[0] = 1;
                cmf.matrix[6] = 1;
                cmf.matrix[12] = 1;
                cmf.matrix[15] = 1;
                bmd.applyFilter(e.target.content.bitmapData, imgRect, 
                      upperLeft, cmf);
                
              } else {

                // fix the transparent level
                bmd.threshold(e.target.content.bitmapData, imgRect, 
                    upperLeft, "==", transparency, 0x00000000, 0x00FFFFFF, true);

                if  (overlayTransparentAmount != null) {
                  ct.alphaMultiplier = overlayTransparentAmount[i]/100.0;
                  bmd.colorTransform(imgRect, ct);
                }

              }

              imgList[i][k] = bmd;
              
            }  

            bmBackLoaded[i][k] = true;
            try {
              (imgLoaderList[i][k].content as Bitmap).bitmapData.dispose();
              imgLoaderList[i][k].unload();
              imgLoaderInfoList[i][k].removeEventListener(IOErrorEvent.IO_ERROR, errorLoading, false);
              imgLoaderInfoList[i][k].removeEventListener(Event.COMPLETE, doneLoading, false);
            } catch (e:Error) {debug("Error unloading"+e); }

            try {imgLoaderList[i][k].close(); 
            } catch(e:Error) {debug("Connection already closed"); }

            imgLoaderList[i][k] = null;
            break;
          }
        }

      }
      
    }





/** refreshImages(Event)
*
* prepare to refresh images - either from the Refresh button
* having been pressed, or the refreshTimer ticked...
*/

    private function refreshImages(event:TimerEvent) :void {
      
      if (isLoading) return;

      if (isExtrap) return;  // don't do update if in Extrap mode...?

      timer.stop();
      canResetDwell = false;
      timer.delay = 50;
      bmBackCreated = false;
      if (refresh != null) refresh.enabled = false;
      if (startstop != null) startstop.enabled = false;
      if (!isExtrap) wasLooping = isLooping;
      stopLooping();
      currentFrame = startFrame;
      if (isOnOff) {
        for (var n:int=0; n<onOffState.length; n++) {
          onOffState[n] = 0;
        }
        onOffState[currentFrame] = 1;
        drawOnOff();
      }

      if (printButt != null) printButt.enabled = false;
      if (showButt != null) showButt.enabled = false;
      if (loadingHotspot || !keepZoom) {
        isZooming = false;
        if (zoom != null) {
          zoom.label=zoomLabelTrue;
          setLabelColors(zoom, zoomLabelColors, false);
        }
        zoomXFactor = zoomXBase;
        zoomYFactor = zoomYBase;
        xMove = 0;
        yMove = 0;
        enableZooming = activeZoom;
      }

      isDragging = false;
      if (isDrawingLine) {
        drawingPaper.graphics.clear();
        drawingPaper.removeAllChildren();
      }
      isDrawingLine = false;
      incFrame = 1;
      numFrames = 0;
      if (isExtrap) {
        isExtrap = false;
        extrap.label = extrapLabelTrue;
        if (zoom != null) zoom.enabled = true;
        drawingPaper.graphics.clear();
        drawingPaper.removeAllChildren();
        if (startstop != null) startstop.enabled=true;
      }
      fofErrorCount = 0;
      getImageFilenames();
    }
    
/** getParameter(String)
*
* get the (array of) values for the named parameter
*/
    private function getParameter(s:String):Array {
      for (var m:int=0; m<paramNames.length; m++) {
        if (paramNames[m] == s) {
          return paramValues[m];
        }
      }
      return null;
    }



/** stopLooping()
*
* stop the looping and reset the button labels
*/
    private function stopLooping():void {
      // stop the looping
      if (startstop != null) {
        startstop.label=startstopLabelFalse;
        setLabelColors(startstop, startstopLabelColors, false);
      }
      if (printButt != null) printButt.enabled = true;
      if (showButt != null) showButt.enabled = true;
      isLooping = false;
    }



/** startLooping()
*
* reset the button labels and activate looping mode
*/
    private function startLooping(): void {
      // start the looping
      if (startstop != null) {
        startstop.label=startstopLabelTrue;
        setLabelColors(startstop, startstopLabelColors, true);
      }
      if (printButt != null) printButt.enabled = false;
      if (showButt != null) showButt.enabled = false;
      isLooping = true;
    }



/** parseHex(String)
*
* parse the hex value that starts with 0x, 0X, or # (or anything
* else, actually) are retunr an int
*/
    private function parseHex(v:String):int {
      if (startsWith(v,"0x") || startsWith(v,"0X") ) {
        return parseInt(v);
        
      } else {
        return parseInt(v.substring(1),16);
      }
    }



/** getFirstChar(String)
*
* simply returns the first character of a String
*/
    private function getFirstChar(s:String):String {
      return (StringUtil.trim(s).charAt(0) );
    }

/** startsWith(String, String)
*
* tests if the given String begins with the match string
*
*/
    private function startsWith(s:String, match:String):Boolean {
      return !StringUtil.trim(s).indexOf(match);
    }


/** endsWith(String, String)
*
* tests if the given String ends with the match string
*
*/
    private function endsWith(s:String, match:String):Boolean {

      return ( (StringUtil.trim(s).lastIndexOf(match) > 0) && 
         (StringUtil.trim(s).lastIndexOf(match) == 
         (StringUtil.trim(s).length - match.length)));
    }




/** getNamesUsingBaseName(String, int)
*
* from this wild-carded list of basenames, this creates actual file
* names by replacing the * or ? with monotonically increasing numbers.
*
*/
    private function getNamesUsingBaseName(fn:String, count:int): Array {
      var filenames:Array = new Array(count);
      for (var i:int=0; i<count; i++) {
        var val:int = i+baseNumber;
        if (fn.indexOf("*") >= 0) {
          filenames[i] = fn.replace("*",String(val));


        } else if (fn.indexOf("?") >= 0) {
          var substitute:String = fn;
          var li:int;
          while ( (li=substitute.lastIndexOf("?")) >= 0) {
            var ts:String = substitute.substring(0,li)+(val % 10) + substitute.substring(li+1);
            substitute = ts;
            val = val /10;
          }
          filenames[i] = substitute;

        } else {
          filenames[i] = fn+i;
        }

      }
      return filenames;
    }



/** doneGettingEnhTab(Event)
*
* This event handler is called when the file (enh.tab) containing the
* enhancement tables is read.  It parses this file and populates
* the Combobox list as well as creating the RGB look-up tables.
*
*/

    private function doneGettingEnhTab(event:Event) : void {
      var fne:URLLoader = URLLoader(event.target);
      fne.removeEventListener(Event.COMPLETE, doneGettingEnhTab);
      var lines:Array = fne.data.split("\n");
      var stuff:Array = new Array();
      var m:int;
      var ienh:int = -1;
      enh = new Array();

      enhNames = new Array();
      probeValues = new Array();
      probeUnits = new Array();
      probePrefixes = new Array();
      probeDecimals = new Array();
      probeLabels = new Array();

      var re:RegExp = / +/;
      debug("......Done loading enh table....");
      var gotAlpha:Boolean = false;
      var gotValues:Boolean = false;
      var valUnits:String = probeOneUnit;
      var valPrefixes:String = probeOnePrefix;
      var valDecimals:int = probeOneDecimal;
      var valLabels:String="";

      for (var i:int=0; i<lines.length; i++) {

        if (lines[i].length < 2) continue;
        m = StringUtil.trim(lines[i]).indexOf("#");
        if (m == 0) continue;
        if (m > 0) lines[i] = lines[i].substring(0,m);

        if (startsWith(lines[i],"*")) {

          // if the previous table had no alpha info, null it out...
          if (ienh != -1 && !gotAlpha) enh[ienh][3] = null;
          gotAlpha = false;

          ienh = ienh + 1;
          enh[ienh] = new Array(4);
          probeValues[ienh] = new Array(256);
          probeUnits[ienh] = new Array(256);
          probePrefixes[ienh] = new Array(256);
          probeDecimals[ienh] = new Array(256);
          probeLabels[ienh] = new Array(256);

          enhNames[ienh] = StringUtil.trim(lines[i].substring(1));

          for (var k:int=0; k<4; k++) {
            enh[ienh][k] = new Array(256);
            for (var n:int=0; n<256; n++) {
              if (k == 3) {
                  enh[ienh][k][n] = 0;  // make sure all zeroes...
              } else {
                  enh[ienh][k][n] = n<<(8*(2-k));
              }
            }
          }

        } else {
          // inLo inHi rL rH gL gH bL bH [aL aH] [value = beg,end[,unit]]

          var valInx:int = lines[i].indexOf("value");
          if (valInx < 0) valInx = lines[i].indexOf("probe");
          var valString:String = "";
          var bval:Number = 0;
          var eval:Number = 0;
          var valinc:Number = 1;
          gotValues = false;

          if (valInx > 0) {
            valString = lines[i].substring(valInx+1,lines[i].length);
            lines[i] = lines[i].substring(0,valInx);
            debug("lines = "+lines[i]);
            var inxEq:int = valString.indexOf("=");
            valString = valString.substring(inxEq+1, valString.length);
            var valItems:Array = valString.split(",");
            if (valItems.length == 1) {
              valLabels = StringUtil.trim(valItems[0]);
              gotValues = false;
            } else {
              bval = parseFloat(valItems[0]);
              eval = parseFloat(valItems[1]);
              if (valItems.length > 2) {
                valDecimals = parseInt(valItems[2]);
              }
              if (valItems.length > 3) {
                valUnits = StringUtil.trim(valItems[3]);
              }
              if (valItems.length > 4) {
                valPrefixes = StringUtil.trim(valItems[4]);
              }

              gotValues = true;
            }
          }

          var vx:Array = StringUtil.trim(lines[i]).split(re);
          var a:Array = new Array();
          for (k=0; k<vx.length; k++) {
            a[k] = parseInt(StringUtil.trim(vx[k]));
          }
          var num:int = a[1] - a[0];
          var bred:Number = a[2];
          var ered:Number = a[3];
          var redinc:Number = (ered - bred)/(num);
          var bgreen:Number = a[4];
          var egreen:Number = a[5];
          var greeninc:Number = (egreen - bgreen)/(num);
          var bblue:Number = a[6];
          var eblue:Number = a[7];
          var blueinc:Number = (eblue - bblue)/(num);
          var balpha:Number = 255;
          var ealpha:Number = 255;
          var alphainc:Number = 0;
          valinc = (eval - bval)/num;
          if (a.length == 10) {
            balpha = a[8];
            ealpha = a[9];
            alphainc = (ealpha - balpha)/(num);
            gotAlpha = true;

          }
          for (k = a[0]; k<=a[1]; k++) {
            if (!gotAlpha) {
              enh[ienh][0][k] = int(Math.round(bred)) << 16;
            } else {
              enh[ienh][0][k] = ( (int(Math.round(balpha)) << 8) +
              int(Math.round(bred)) ) << 16;
            }
            enh[ienh][1][k] = int(Math.round(bgreen)) << 8;
            enh[ienh][2][k] = int(Math.round(bblue));

            if (gotValues) {
              probeValues[ienh][k] = bval;
              probeUnits[ienh][k] = valUnits;
              probePrefixes[ienh][k] = valPrefixes;
              probeDecimals[ienh][k] = valDecimals;
              probeLabels[ienh][k] = "";
            } else {
              probeValues[ienh][k] = Number.NaN;
              probeUnits[ienh][k] = "";
              probePrefixes[ienh][k] = "";
              probeDecimals[ienh][k] = 0;
              probeLabels[ienh][k] = valLabels;
            }

            bred = bred + redinc;
            bgreen = bgreen + greeninc;
            bblue = bblue + blueinc;
            balpha = balpha + alphainc;
            bval = bval + valinc;
          }

        }

      }

      // get the last one...
      if (ienh != -1 && !gotAlpha) enh[ienh][3] = null;

      getImageFilenames();
    }

/** makeTimes(Array)
*
* create the extrapTimes array of "minutes" for each image
*
*/

    private function makeTimes(s:Array) : void {
      
      var ds:int = 0;
      minutes = new Array(s.length);
      for (var i:int=0; i<s.length; i++) {

        s[i] = 60*int(s[i]/100) + int(s[i]) % 100;
        if (i == 0) startingMinute = s[i];
        ds = s[i] - startingMinute;
        if (ds < 0) {  // test if gone over 00Z -- only allowed once!
          ds = s[i] + 24*60 - startingMinute;
        }
        minutes[i] = ds;
        debug("times s="+s[i]+"  min="+minutes[i]);
      }
      startingMinute = startingMinute + utcOffset;
      if (startingMinute >= 1440) startingMinute = startingMinute - 1440;
      if (startingMinute < 0) startingMinute = startingMinute + 1440;
      debug("Starting minute = "+startingMinute);
    }


/** makeCoordinates(Array)
*
* create the location array of lat,lon values for image corner points
* if no "coordinates" parameter given, scale from 0-100;
*
*/
    private function makeCoordinates(s:Array) : void {

      locLabel = new Label();
      locLabelDigits = 2;
      locLabelFirst="Lin=";
      locLabelSecond="Ele=";
      locLabel.opaqueBackground = background;
      locLabel.setStyle("color", foreground);
      locLabel.x = 0;
      locLabel.y = 0;

      if (s == null) {
        location = new Array(4);
        location[0] = 0;
        location[1] = 0;
        location[2] = 100;
        location[3] = 100;
        hasCoordinates = false;
        locLabel.visible = true;
        doingLoc = true;
	      is180 = false;
        //isLoc = true;

      } else {

        if (s.length != 4) {
          debug("******** navigation -- incorrect number of parameters!");
          location = null;
        } else {
          location = new Array(s.length);
          for (var i:int = 0; i<s.length; i++) {
            location[i] = parseFloat(s[i]);
          }
          hasCoordinates = true;
          //isLoc = true;
          doingLoc = true;
	        is180 = false;
	        if (location[1] > 0. && location[3] < 0.) {
	          is180 = true;
	          location[3] = location[3] + 360.0;
	        }
	        if (location[1] > location[3]) location[3] = location[3] + 360.0;

          locLabelFirst="Lat=";
          locLabelSecond="Lon=";

          var ls:Array = getParameter("coordinates_style");
          if (ls != null) {
            locLabel.opaqueBackground = parseInt(ls[0] );
            locLabel.setStyle("color", parseInt(ls[1]) );
            if (ls.length > 2) {
              if (ls[2].length > 0)  
                       locLabel.setStyle("fontSize", parseInt(ls[2]) );
              if (ls.length > 3) {
                locLabelFirst = ls[3];
                locLabelSecond = ls[4];
                if (ls.length > 5) locLabelDigits = parseInt(ls[5]);
              }
            }
          }

          locLabel.visible = true;
        }
      }
    }


/** makeHotspot(String[])
*
* make a hotspot and add to list
*
* hsButton, hsType, hsValue are all defined prior to calling this!!
*
* hotspot = x,y, w, h, pan, type, value
* hotspot = x,y,icon,filename, pan, type, value [,tooltip]
*/
 
    private function makeHotspot(s:Array) : void {
      hsPan.push(StringUtil.trim(s[4]));
      hsType.push(StringUtil.trim(s[5]));
      hsValue.push(StringUtil.trim(s[6]));

      var hsb:SimpleButton;
      if (StringUtil.trim(s[2]).toLowerCase() == "icon") {
        var gotit:Boolean = false;

        /*
        for (var i:int = 0; i<hsImageNames.length; i++) {
          if (StringUtil.trim(s[3]) == hsImageNames[i]) {
            //debug(" ------ found a match at i="+i);
            gotit = true;
           // trace("found hs image match for hs = "+i);
            hsb = new SimpleButton(hsBitmaps[i], hsBitmaps[i],
                       hsBitmaps[i], hsBitmaps[i]);
            hsb.width = hsBitmaps[i].width;
            hsb.height = hsBitmaps[i].height;
          }
        }
        */

        if (!gotit) {
          //debug("no icon match for "+s[3]);
          hsImageNames.push(StringUtil.trim(s[3]));
          hsBitmaps.push(new Bitmap());
          hsb =new SimpleButton( hsBitmaps[hsBitmaps.length-1],
                   hsBitmaps[hsBitmaps.length-1], 
                   hsBitmaps[hsBitmaps.length-1],
                   hsBitmaps[hsBitmaps.length-1]);

          hsSimButts.push(hsb);
          hsLoaders.push(new Loader());
          hsLoaderInfo.push(hsLoaders[hsLoaders.length-1].contentLoaderInfo);

          hsLoaderInfo[hsLoaderInfo.length-1].addEventListener(Event.COMPLETE, 
            function(e:Event):void {
              for (var ii:int=0; ii<hsLoaders.length; ii++) {
                if (e.target.loader == hsLoaders[ii]) {
                //debug("  +++++ loader match = "+ii);
                  hsBitmaps[ii].bitmapData = e.target.content.bitmapData;
                  hsSimButts[ii].width = hsBitmaps[ii].bitmapData.width;
                  hsSimButts[ii].height = hsBitmaps[ii].bitmapData.height;

                }
              }
            } );

          hsLoaderInfo[hsLoaderInfo.length-1].addEventListener(
                                               IOErrorEvent.IO_ERROR, 
            function(e:Event):void {
              debug("Error loading icon image");
            } );
           
          try {
            hsLoaders[hsLoaders.length-1].load(
                 new URLRequest(hsImageNames[hsImageNames.length-1]));
          } catch (ice:Error) {
            debug("Unable to load icon image..."+ice);
          }

        }

      } else {
        var hsw:int = parseInt(s[2]);
        var hsh:int = parseInt(s[3]);
        var hsbmd:BitmapData = new BitmapData(hsw, hsh,true,hsColor);
        var hsbm:Bitmap = new Bitmap(hsbmd);
        hsb = new SimpleButton(hsbm,hsbm,hsbm,hsbm);
        hsb.height = hsh;
        hsb.width = hsw;
      }

      hsb.useHandCursor = true;
      hsUI = new UIComponent();
      hsUI.addChild(hsb);
      hsUI.x = parseInt(s[0]);
      hsUI.y = parseInt(s[1]);
      hsUI.width = hsb.width;
      hsUI.height = hsb.height;
      //debug(" #### added hsb w/h = "+hsb.width+"  "+hsb.height);
      hsUI.addEventListener(MouseEvent.CLICK, bclick, false, 0, true);
      hsUI.addEventListener(MouseEvent.MOUSE_DOWN, bclick, false, 0, true);
      hsUI.addEventListener(MouseEvent.MOUSE_UP, bclick, false, 0, true);
      hsUI.addEventListener(MouseEvent.MOUSE_MOVE, bdrag, false, 0, true);
      if (s.length == 8) hsUI.toolTip = StringUtil.trim(s[7]);
      hsButton.push(hsUI);
      var hsp:Point =new Point(hsUI.x, hsUI.y);
      hsPoint.push(hsp);
    }


/** makeBackHotspot(String[])
*
* make a background_image hotspot and add to list
*
* hsButton, hsType, hsValue are all defined prior to calling this!!
*
* hotspot = x,y, w, h, type, value
* hotspot = x,y,image,filename, type, value
*/

    private function makeBackHotspot(s:Array) : void {
      backhsType.push(StringUtil.trim(s[4]));
      backhsValue.push(StringUtil.trim(s[5]));
      var hsw:int = parseInt(s[2]);
      var hsh:int = parseInt(s[3]);
      var hsbmd:BitmapData = new BitmapData(hsw, hsh,true,hsColor);
      var hsbm:Bitmap = new Bitmap(hsbmd);
      var hsb:SimpleButton = new SimpleButton(hsbm,hsbm,hsbm,hsbm);
      hsb.x = parseInt(s[0]);
      hsb.y = parseInt(s[1]);
      hsb.width = hsw;
      hsb.height = hsh;
      hsb.useHandCursor = true;
      hsb.addEventListener(MouseEvent.CLICK, bclick, false, 0, true);
      backhsButton.push(hsb);
    }


/** changeEnh(Event)
*
* When the user selects an ehnacmenet from the list this
* sets the selected palette into the sequence of bitmaps.
*
* Note that the first time, a backup set of bitmaps are cloned
* from the originals...
*
*/
    private function changeEnh(e:Event):void {

      if (e.target == enhanceChoice) {
        var sel:int = enhanceChoice.selectedIndex - 1;

        if (!madeEnhBitmaps) {
          enhBitmaps = new Array();
          for (var ie:int = 0; ie<imgList[enhOverlay].length; ie++) {
            enhBitmaps[ie] = imgList[enhOverlay][ie].clone();
          }

        }
        madeEnhBitmaps = true;

        if (sel < 0) {
          for (ie = 0; ie<imgList[enhOverlay].length; ie++) {
            imgList[enhOverlay][ie] = enhBitmaps[ie].clone();
          }

        } else {

          for (ie = 0; ie<imgList[enhOverlay].length; ie++ ) {
            imgList[enhOverlay][ie].paletteMap(enhBitmaps[ie], imgRect, 
                         upperLeft, enh[sel][0], enh[sel][1], enh[sel][2]);
          }
        }

        showFrames(null);
      }
    }

/** 
* getLabelColors
* get the 6 colors for the button label
*
*/
  public function getLabelColors(name:String) :Array {
    var a:Array = [0x0, 0xffffff, 0xcccccc, 0x0, 0xffffff, 0xcccccc]; 
    var s:Array = getParameter(name+"_labels_colors");
    if (s == null) {
      s = getParameter(name+"_labels_color");
    }

    if (s != null) {
      for (var i:int=0; i<s.length; i++) {
        a[i] = parseHex(s[i]);
      }
    }
    return a;
  }


/**
* setLabelColors
*
*/
  public function setLabelColors(b:Button, c:Array, s:Boolean) :void {
    if (s) {
      b.setStyle("color", c[0]);
      b.setStyle("fillColors", [c[1], c[2]]);
    } else {
      b.setStyle("color", c[3]);
      b.setStyle("fillColors", [c[4], c[5]]);
    }
  }


/**
*
*
*/

  public function soundLoaded(e:Event) : void {
    soundClip.play();
  }

/**
*
*
*/

  public function getUserIP() :String { 
     var js:String="function get_userIP() {var ip = '<!--#echo var=\"REMOTE_ADDR\"-->'; return ip"; 

    var userIPInfo:String=flash.external.ExternalInterface.call(js).toString(); 
    return userIPInfo; 
  }

/** debug(String)
*
* append the string onto the debugTextArea.text preceded by "\n"
*
* also, trace the string
*/
   private function debug(s:String):void {
     if (isDebug) {
       debugTextArea.text = debugTextArea.text + "\n"+s;
       trace(s);
     }
   }


  }

}

