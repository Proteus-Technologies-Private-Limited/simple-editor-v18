var bbHostURL = '';
var isMobile = window.location.pathname.indexOf('E12BROWSER') == -1;
//setTimeout(() => {
		setBBHostURL();
		//addElement("proteus-components");
		/*
		if( !bbHostURL || bbHostURL == '' )
		{
			console.log('Adding e12riaExt...' );
	  		addScript("assets/js/e12riaExt/e12riaExt.nocache.js");
		}
		*/
		addCssLink("material-theme.css");

        addScript("assets/js/pluginWrapper.js");
		//addScript("inline.bundle.js");
if(isMobile)
{
		// addScript("polyfills.js");
		// addScript("main.js");
		// addScript("runtime.js");

		//Chnaged by sainath t. -Start
		// addScript("runtime-es2015.js");
		// addScript("runtime-es5.js");
        // addScript("polyfills-es5.js");
		// addScript("polyfills-es2015.js");
		// addScript("main-es2015.js");
        // addScript("main-es5.js");
		//Chnaged by sainath t. -End

		
		// addScript("runtime-es5.js");
        // addScript("polyfills-es5.js");
		// addScript("main-es5.js");

		addScript("runtime.js");
		addScript("polyfills.js");
		addScript("main.js");
}
		addCssLink("foundation.min.css");
		addCssLink("styles.css");
        addCssLink("visionicon.css");
        //addCssLink("vision_ui.css");//Unused css
        addCssLink("dragula.css");

		addScript2("./simpleditorplugin/assets/flexmonster/","flexmonster.js");
		//addCssLink2("./simpleditorplugin/assets/flexmonster/","flexmonster.css");

		if( !HTMLElement.prototype.createShadowRoot ){
			HTMLElement.prototype.createShadowRoot = function(){
				return this;
			}
		}

//}, 200);

function addScript(fileName)
{
    console.log('addScript:',fileName);
    addScript2("./simpleditorplugin/", fileName);
}

function addScript2(path, fileName)
{
    console.log('addScript:',path);
    var script=document.createElement('script');
    script.type='text/javascript';
    script.src= path + fileName;

    // $("head").append(script);
    document.head.appendChild(script);
}

function addCssLink( fileName)
{
    try {
    var cssLink=document.createElement('link');
    cssLink.rel='stylesheet';
    cssLink.href= "./simpleditorplugin/assets/css/" + fileName;

    // $("head").append(cssLink);
    document.head.appendChild(cssLink);
    } catch(e){
    console.log('Errorrr--');
  }
}

function addCssLink2( path,fileName)
{
    try {
    var cssLink=document.createElement('link');
    cssLink.rel='stylesheet';
    cssLink.href= path + fileName;

    //$("head").append(cssLink);
    document.head.appendChild(cssLink);
    } catch(e){
    console.log('Errorrr--');
  }
}

function addElement(elName){
   var el = document.createElement(elName);
   //$("body").append(el);
   document.body.appendChild(el);
}

// Changed by Sonam K [Added new parameter "callback", for passing "callback function" to component] START
function loadSimpleEditorComponent(targetId, componentData, callback)
{
	//Changed by Sonam K [Added "compRef", for getting "component reference"] START
	var compRef;
    console.log('Load window.SimpEditPlugin:::', window.SimpEditPlugin, targetId);
    setBBHostURL();

    if( window.SimpEditPlugin )
    {
	    var pluginEmitter = window.SimpEditPlugin.pluginEvtEmitter;
	    var pluginConfig = window.SimpEditPlugin.pluginConfig;
	    var evtEmit = new pluginEmitter();
	    //evtEmit.subscribe((pluginEvent) => {
	    evtEmit.subscribe( function(pluginEvent) {
		    // Changed by Sonam K [For calling callback after event emitted from component] START
	        (typeof callback === 'function') && callback(pluginEvent);
	        // Changed by Sonam K [For calling callback after event emitted from component] END
	    });

	    var compData = {};
	    var componentName = "";
	    try {
			compData = JSON.parse(componentData);
			componentName = compData.componentName;
		}
		catch(e) {
			componentName = componentData;
		}
	    console.log( 'componentData 138>>', componentData, ' componentName >>', componentName );
        if(typeof(compData.cacheComp) == "string"){
            if(compData.cacheComp && compData.cacheComp.trim() == "true"){
                compData.cacheComp = true;
            }else {
                compData.cacheComp = false;
            }
        }
	    var data = {
	    	"target-id" : compData.targetId,
	    	"compData" : compData,
	    	"cacheComp" : compData.cacheComp ? true : false
	    };
		console.log( 'window.SimpEditPlugin 151>>', window.SimpEditPlugin);
	    var angPlugin = window.SimpEditPlugin.loadPlugin(componentName, data, window.SimpEditPlugin.pluginMI, evtEmit);
	    console.log( 'angPlugin 153>>', angPlugin );
	    compRef = angPlugin.instance;
    }

	return compRef;
//Changed by Sonam K [Added "compRef", for getting "component reference"] END
}
// Changed by Sonam K [Added new parameter "callback", for passing "callback function" to component] END

function destroyComponent(componentName)
{
	if( window.SimpEditPlugin )
	{
		window.SimpEditPlugin.destroyPlugin(componentName);
	}
}


function detachComponent(componentName)
{
	if( window.SimpEditPlugin )
	{
		window.SimpEditPlugin.detachPlugin(componentName);
	}
}


function detachPlugin(componentName)
{
    console.log('Inside detach plugin');
	if( window.SimpEditPlugin )
	{
		window.SimpEditPlugin.detachPlugin(componentName);
	}
}

function setBBHostURL()
{
	console.log('window._getHostURL[' , window._getHostURL, ']');
	if(window._getHostURL)
	{
     	bbHostURL = window._getHostURL();
 	}
 	else
 	{
		bbHostURL = localStorage.getItem('hostUrl');
		if(bbHostURL == null){
			bbHostURL = '';
		}

		console.log('bbHostURL:: '+bbHostURL);
	}

	localStorage.setItem('HOST_URL', bbHostURL);
	console.log('setBBHostURL[' , bbHostURL, ']');
}



function getBBHostURL(){
 console.log('getBBHostURL[' , bbHostURL, ']');
 return bbHostURL;
}

function loadAngularFilter(jsonData, evtEmit)
{
   if( window.SimpEditPlugin )
   {
	   var pluginEmitter = window.SimpEditPlugin.pluginEvtEmitter;
	   var pluginConfig = window.AngDashboard.pluginConfig;
	   jsonData["cacheComp"]=true;
	   var angDashboard = window.AngDashboard.loadDashboard('dashboard-filter', jsonData, window.AngDashboard.pluginMI, evtEmit);
	   console.log( 'angDashboard >>', angDashboard );
   }
}

function loadAngularDashboard(metadataname, componentData, evtEmit)
{
    console.log('----loadAngularDashboard---' , metadataname, componentData );
    if( window.AngDashboard )
    {
    	setBBHostURL();

	    var pluginEmitter = window.AngDashboard.pluginEvtEmitter;
	    var pluginConfig = window.AngDashboard.pluginConfig;
        if(!evtEmit){
    	    evtEmit = new pluginEmitter();
        }
	    var jsonData = new pluginConfig();
	    var compData = {};
	    try {
			compData = JSON.parse(componentData);
		}
		catch(e) {
		}
		//For Backward Compatibility SerdiaStars App - E12MOBILE v17-79-0-1
		if( !compData.targetId ) 
        {
            compData = {
                    "targetId": metadataname, 
                    "cacheComp":"false",
                    "componentName":metadataname
            };
        }
	    jsonData.put('compData', compData);
	    jsonData.put('target-id', compData.targetId);
	    if(compData.cacheComp !== undefined)
	    {
	    	jsonData.put('cacheComp' , compData.cacheComp ? true : false);
	    }
	    else
	    {
	    	jsonData["cacheComp"]=true;
	    }
	    jsonData.put('metadataname', metadataname);
	    //TODO: Todays dashboard updation check 
	    // jsonData["cacheComp"]=true;
	    var angDashboard = window.AngDashboard.loadDashboard('dashboard', jsonData, window.AngDashboard.pluginMI, evtEmit);
	    console.log( 'angDashboard >>', angDashboard );
    }
}

function detachDashboard(metadataname)
{
	if( window.AngDashboard )
	{
		window.AngDashboard.detachDashboard('dashboard', metadataname);
	}
}

function detroyDashboard(metadataname)
{
	if( window.AngDashboard )
	{
		window.AngDashboard.destroyDashboard('dashboard', metadataname);
	}
}

function onTabChange(metadataname)
{
	if( window.AngDashboard )
	{
		window.AngDashboard.onTabChange.emit(metadataname);
	}
}