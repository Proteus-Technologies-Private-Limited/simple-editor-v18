/*
 * Added by Abhishek T. on 06-OCT-2016
 * For calling AttachmentsPlugin.
 */

/**
 * Initialize the AttachmentsPlugin for given data and return the
 * plugin ui element.
 *
 * @param data The required data for creating attachments plugin.
 *
 * @returns The generated plugin ui element.
 */
// function getAttachPluginFoBB(data, caller, callback)
// {
// 	var viewUIElement = null;
// 	try
// 	{
// 		console.log('getAttachPluginFoBB:', data)
// 		var pWindow = window;
// 		if (! window.e12plugin)
// 		{
// 			pWindow = window.parent;
// 			// Changed by Abhishek T on 23-Feb-17 [For checking plugin defination is present or not in current browser document] START
// 			if (! pWindow.e12plugin) return null;
// 			// Changed by Abhishek T on 23-Feb-17 [For checking plugin defination is present or not in current browser document] END
// 		}
//
// 		if (! data) throw "Given data is null.";
//
// 		var MetadataKey        = pWindow.e12plugin.enums.MetadataKey,
// 			MetadataValue      = pWindow.e12plugin.metadata.MetadataValue,
// 			PluginMetadata     = pWindow.e12plugin.metadata.PluginMetadata,
// 			AttachmentsPlugin  = pWindow.e12plugin.plugins.AttachmentsPlugin,
// 			Layout             = pWindow.e12plugin.enums.Layout,
// 			Widget             = pWindow.e12plugin.gwtwidgets.Widget,
// 			HandlerType        = pWindow.e12plugin.enums.HandlerType,
// 			metadata           = new PluginMetadata(),
// 			ContentType        = pWindow.e12plugin.enums.ContentType;
//
// 		metadata.put(MetadataKey.OBJ_NAME, new MetadataValue(data.OBJ_NAME));
// 		metadata.put(MetadataKey.REF_SERIES, new MetadataValue(data.REF_SER));
// 		metadata.put(MetadataKey.REF_ID, new MetadataValue(data.REF_ID));
// 		metadata.put(MetadataKey.DOC_TYPE, new MetadataValue(data.DOC_TYPE));
// 		metadata.put(MetadataKey.HOST_URL, new MetadataValue(data.HOST_URL));
// 		metadata.put(MetadataKey.IS_HOSTED_MODE, new MetadataValue(!! data.IS_HOSTED_MODE));
// 		//metadata.put(MetadataKey.ENABLE_SIGNLE_IMAGE, new MetadataValue(data.ENABLE_SINGLE_IMAGE));
// 		/*
// 		if (data.MIN_REQUIRED)
// 			metadata.put(MetadataKey.MIN_REQUIRED, new MetadataValue(data.MIN_REQUIRED));
// 		if (data.MAX_ALLOWED)
// 			metadata.put(MetadataKey.MAX_ALLOWED, new MetadataValue(data.MAX_ALLOWED));
//
// 		var layout = data.LAYOUT === 'F' ? Layout.FULLVIEW : Layout.THUMBNAIL;
//
// 		metadata.put(MetadataKey.LAYOUT, new MetadataValue(layout));
// 		metadata.put(MetadataKey.THUMBNAIL_WIDTH, new MetadataValue(data.THUMBNAIL_WIDTH));
// 		metadata.put(MetadataKey.THUMBNAIL_HEIGHT, new MetadataValue(data.THUMBNAIL_HEIGHT));
//
//
// 		if (data.CONTENT_TYPE && data.CONTENT_TYPE instanceof Array)
// 			metadata.put(MetadataKey.CONTENT_TYPE, new MetadataValue(data.CONTENT_TYPE));
// 		*/
//
// 		attchPlugin = new AttachmentsPlugin();
// 		attchPlugin.init(metadata);
//
// 		var viewUI = null;
// 		/*
// 		if (data.UI)
// 			if (data.UI === 'A')
// 				viewUI = attchPlugin.getAddUI();
// 			else if (data.UI === 'E')
// 				viewUI = attchPlugin.getEditUI();
// 			else // if data.UI === 'V' No need to check here
// 				viewUI = attchPlugin.getViewUI();
// 		else // else default UI
// 		*/
// 		viewUI = attchPlugin.getViewUI();
//
// 		var widget = new Widget(viewUI);
// 		var width = data.MAX_WIDTH ? data.MAX_WIDTH : "95%";
// 		widget.setWidth(width);
//
// 		viewUIElement = widget.getElement();
// 	}
// 	catch (ex)
// 	{
// 		window.alert("Exception in getAttachmentsPluginUI() : " + ex);
// 	}
// 	console.log('caller', caller,'callback', callback,'viewUIElement',viewUIElement);
// 	caller[callback](viewUIElement);
// 	return viewUIElement;
// }


// View Single Image //
function previewSingleDocument(data) {

	console.log('previewSingleDocument data',data);
	var serverIP = getBBHostURL();
	if(serverIP){
	  data.HOST_URL = serverIP;
	  data.IS_HOSTED_MODE = false;
	}



       if (window.e12plugin && window.e12plugin.misc && window.e12plugin.misc.previewSingleDocument) {
		window.e12plugin.misc.previewSingleDocument(data);
	}
}

// Show Images //
function showImages() {
	if (window.e12plugin && window.e12plugin.misc && window.e12plugin.misc.requestImageArray) {
		window.e12plugin.misc.requestImageArray (
			{
				REF_SERIES: 'COLPST',
				REF_ID: 'TRD',
				OBJ_NAME: 'colab_post_gwt',
				DOC_TYPE: '$Attachment$',
				//Changed By Pankaj . on 01-12-2021 removed static ip for ip disclosure vulnerability reported by novartis.
				//HOST_URL: 'http://192.168.0.183:9090',
				HOST_URL: getBBHostURL(),
				IS_HOSTED_MODE: true,
				ENABLE_SINGLE_IMAGE: true,
				VIEW_ONLY: true,
				DOC_TYPE_ATTACH_FILTER: 'Passport0, Passport1',
				ENTERPRISE: "Driver"
			},
			function(imagesArray) {
				var container = document.querySelector('div.img-container');
	            for (var i in imagesArray) {
	                var img = imagesArray[i];
	                img.style.marginLeft = '10px';
	                img.style.marginTop = '10px';
	                img.classList.add('_image');
	                container.appendChild(img);
	            }
			},
			function(reason) {
				console && console.error && console.error(reason);
			}
		);
	}
}

// Add Document //
function saveDocInContentLibrary(caller, callback, contentConfig, componentConfig) {

	var MetadataKey = window.e12plugin.enums.MetadataKey,
		MetadataValue = window.e12plugin.metadata.MetadataValue,
		PluginMetadata = window.e12plugin.metadata.PluginMetadata,
		ContentPlugin = window.e12plugin.plugins.ContentPlugin,
		PopupPanel = window.e12plugin.gwtwidgets.PopupPanel,
		ContentType = window.e12plugin.enums.ContentType,
		HandlerType = window.e12plugin.enums.HandlerType;

	var metadata = new PluginMetadata();
	var serverIP = getBBHostURL();
	var IS_HOSTED_MODE = true;
	if(serverIP){
      IS_HOSTED_MODE = false;
    }
	metadata.put(MetadataKey.HOST_URL, new MetadataValue(serverIP));
	//metadata.put(MetadataKey.REF_ID, new MetadataValue("TRD"));
	metadata.put(MetadataKey.REF_ID, new MetadataValue( contentConfig && contentConfig.refId ? contentConfig.refId : "TRD"));
	//metadata.put(MetadataKey.REF_SERIES, new MetadataValue("COLPST"));
	metadata.put(MetadataKey.REF_SERIES, new MetadataValue( contentConfig && contentConfig.refSer ? contentConfig.refSer : "COLPST"));
	metadata.put(MetadataKey.OBJ_NAME, new MetadataValue( contentConfig ? contentConfig.objName : "content_library"));

	metadata.put(MetadataKey.IS_HOSTED_MODE, new MetadataValue(IS_HOSTED_MODE));
	metadata.put(MetadataKey.DOC_TYPE, new MetadataValue( contentConfig ? contentConfig.title : "Content Library"));
	//metadata.put(MetadataKey.DOC_LINK_OPT, new MetadataValue("DOC_CONTENT"));
	metadata.put(MetadataKey.DOC_LINK_OPT, new MetadataValue( contentConfig && contentConfig.docLinkOpt ? contentConfig.docLinkOpt : "DOC_CONTENT"));
    metadata.put(MetadataKey.EXPIRY_DATE_REQUIRED, new MetadataValue("Y"));
	metadata.put(MetadataKey.CACHE_OPT, new MetadataValue("Y"));
	metadata.put(MetadataKey.REF_DESCR_PLACEHOLDER, new MetadataValue("Description (For tags use #)"));
	metadata.put(MetadataKey.IS_CLM, new MetadataValue(true)); //Added by Sonam K on 05-Sept-19 [To get exact count of active documents in CLM]

	var contentTypes = [ ContentType.IMAGE, ContentType.PDF, ContentType.VIDEO, ContentType.ZIP ];
	metadata.put(MetadataKey.CONTENT_TYPE, new MetadataValue(contentTypes));

	var contentPlugin = new ContentPlugin();
	contentPlugin.init(metadata);

	contentPlugin.addHandler(function(data) {
		/*
		* data contains following key
		*
		*  ACTION: "ADD",
		*  DOC_ID: "0000023438",
		*  DOC_TYPE: "Content Library",
		*  FILE_NAME: "Social Chat.jpg",
		*  FILE_TYPE: "jpg",
		*  FILE_URL: "", // In case of image contains data url otherwise undefined
		*/
		console.log("Done handler data : ", data);

		try
		{
			if(componentConfig && componentConfig.targetId)
			{
				data["objName"]= contentConfig.objName;
				data["transMode"]= contentConfig.transMode;
				createImpPopup({'targetId':componentConfig.targetId,'componentName':componentConfig.componentName, 'contentData':data},'popup');
			}
		   	else
		   	{
		   		caller[callback](data);
		   	}
		}
		catch(e)
		{
			console.log(' caller[callback]()' + e);
		}

	}, HandlerType.DONE_HANDLER);

	var addUI = contentPlugin.getAddUI();

	var popupPanel = new PopupPanel(addUI);
	popupPanel.setModal(false);
	popupPanel.show();
}
/**
 * For downloading file using cordova
 */
var selDocs = [];
var tempDocId;
var tempFileName;
var tempDocType;
var dwnldInBatchCallback;
function downloadInBatch(_selDocs, callback) {

    console.log('selDocs in downloadInBatch', selDocs);
	if( _selDocs )
	{
		selDocs = _selDocs;
		dwnldInBatchCallback = callback;
	}
    console.log('files in downloadInBatch',this.selDocs);
    if (selDocs.length == 0) {
    	dwnldInBatchCallback && dwnldInBatchCallback();
        return;
    };

    var obj = selDocs.pop();
    tempDocId = obj.DOC_ID;
    tempFileName = obj.FILE_NAME;
    tempDocType = obj.DOC_TYPE;
    console.log('DOWNLOADING.. :['+tempDocId+']');
    //Added by Sunny Soni for resolving file downloading while open presentation on 01-MARCH-21 [START]
    var isNative = '';
    var userAgent = window.navigator.userAgent;
    if (window["NATIVE"])
    {
        isNative = window["NATIVE"]["ISNATIVE"];
        isNative = !isNative;
    }
    if (isNative && userAgent.indexOf("Android") != -1)
    {
        var delayInMilliseconds = 1000; //1 second
        setTimeout(function() {
            //your code to be executed after 1 second
            downloadFile(tempDocId, tempFileName, tempDocType, true, recallFunc);
        }, delayInMilliseconds);
    }
    else
    {
        downloadFile(tempDocId, tempFileName, tempDocType, true, recallFunc);
    }
    //Added by Sunny Soni for resolving file downloading while open presentation on 01-MARCH-21 [END]
    //downloadFile(tempDocId, tempFileName, tempDocType, true, recallFunc);
}

function recallFunc(res){
    console.log('recallFunc result',res);
    res ? (console.log('File downloaded')) : (console.log('File download failed'));
    downloadInBatch();
}

function downloadFile(docId, fileName, docType, isPreview, callback, forceDownload) {

	console.log('downloadFile data: docId['+docId+'], fileName:['+fileName+'] docType ['+docType+']');

	if (typeof window._getHostURL === 'function')
	{
		// Added by Abhishek T on 24-Aug-19 [Implemented force download] START
		/*
		* if forceDownload is a truthy value, then
		* bypass file exists checking
		* for forcefully download file to file system
		*/
		var fileExist = forceDownload ? function (directory, fileName, _callback) {
			_callback({ code: 0 });
		} : window.e12plugin.cordova.file.fileExists,
		// Added by Abhishek T on 24-Aug-19 [Implemented force download] END
			downloadFile = window.e12plugin.cordova.file.downloadFile;

		// directory is optional
		// pass directory as null, it will take "base/downloads" by default
		var directory = 'base/cache/downloads/files';

		var onFileDownloaded = function(filePath) {
			// handle downloaded file here..
			if (!isPreview) {
				alert('Downloaded file "' + fileName + '"');
			}
		};

		var onError = function(error) {
			callback && callback(false)

			console.log('Error in downloadFile',error);
			if (!isPreview) {
				alert('Download Failed');
			}
		};

		// check if file exists
		fileExist(directory, fileName, function(error, result) {
			// if error is present,
			// then file is not exists in given directory
			if (error) {
				// download file
				var documentId = docId;
				downloadFile(documentId, directory, fileName, function(error, result) {
					callback && callback(result)
					// error in downloading file
					if (error) {
						// handle error
						onError(error);
						return;
					}

					// file downloaded successfully
					// "result" will contains the absolute path of file in file system
					onFileDownloaded(result);
				});

				return;
			}

			callback && callback(result)

			if( !isPreview )
			{
				alert('File already exists');
			}

			// "result" will contains the absolute path of file in file system
			//onFileDownloaded(result);
		});
	}
	else
	{
		// Download File in Browser
		// Changed by Abhishek T on 18-Mar-2019 [Resolved file downloading issue from CLM dashboard] START
		var downloadUri = "/ibase/WebITMDocumentHandlerServlet?ACTION=GET_DOCUMENT&DOC_ID=" + docId + "&DOC_TYPE=" + docType;
		// Changed by Abhishek T on 18-Mar-2019 [Resolved file downloading issue from CLM dashboard] END

		downloadURI(downloadUri, fileName);
	}
}

function downloadURI(uri, name) {
	  var link = document.createElement("a");
	  link.download = name;
	  link.href = uri;
	  document.body.appendChild(link);
	  link.click();
	  document.body.removeChild(link);
	  delete link;
}

// Opne Share //
function openSharePlugin(post_descr, data) {
	var SharePlugin = window.e12plugin.plugins.SharePlugin;
	var PopupPanel = window.e12plugin.gwtwidgets.PopupPanel;
	var PluginMetadata = window.e12plugin.metadata.PluginMetadata;
	var MetadataKey = window.e12plugin.enums.MetadataKey;
	var MetadataValue = window.e12plugin.metadata.MetadataValue;

	var sharePlugin = new SharePlugin();
	var metadata = new PluginMetadata();
	var serverIP = getBBHostURL();

	metadata.put(MetadataKey.HOST_URL, new MetadataValue(serverIP));
	metadata.put(MetadataKey.POST_DESCR, new MetadataValue(post_descr));
	metadata.put(MetadataKey.CONTENTS, new MetadataValue(data));
	metadata.put(MetadataKey.IS_CLM, new MetadataValue(true));

	sharePlugin.init(metadata);

	var sharePluginPopup = sharePlugin.getAddUI();

	console.log(sharePluginPopup);
	var sharePluginPopupWrapper = new PopupPanel(sharePluginPopup);
	console.log(sharePluginPopupWrapper);
	setTimeout(function() {
		sharePluginPopupWrapper.center();
	}, 10);
}


// Open Doc Details //
// function displayUsageDetailsLog(docIdList) {
// 	window.e12plugin.misc.getDocUsageLogDetailsWidget(docIdList, '', function(error, divNode) {
// 	  if (error) {
// 	    console.error(error);
// 	    return;
// 	  }
//
// 	  var usageLogContainer = document.getElementById('usage-documents-container');
// 	  usageLogContainer && usageLogContainer.appendChild(divNode);
// 	});
// }


function displayUsageDetailsLog(docId) {

      var UsagePlugin = window.e12plugin.plugins.UsagePlugin;
      var PopupPanel = window.e12plugin.gwtwidgets.PopupPanel;
      var PluginMetadata = window.e12plugin.metadata.PluginMetadata;
      var MetadataKey = window.e12plugin.enums.MetadataKey;
      var MetadataValue = window.e12plugin.metadata.MetadataValue;

      var usagePlugin = new UsagePlugin();
      var metadata = new PluginMetadata();
      var serverIP = getBBHostURL();

      metadata.put(MetadataKey.HOST_URL, new MetadataValue(serverIP));
      metadata.put(MetadataKey.DOC_IDS, new MetadataValue(docId));

      usagePlugin.init(metadata);

      var usagePluginPopup = usagePlugin.getAddUI();

      console.log(usagePluginPopup);
      var usagePluginPopupWrapper = new PopupPanel(usagePluginPopup);
      console.log(usagePluginPopupWrapper);
      setTimeout(function() {
      usagePluginPopupWrapper.center();
      }, 10)

}

function previewMultipleDocuments(contents) {

	console.log('content in previewMultipleDocuments',contents);

	var 	MetadataKey = window.e12plugin.enums.MetadataKey,
		MetadataValue = window.e12plugin.metadata.MetadataValue,
		PluginMetadata = window.e12plugin.metadata.PluginMetadata,
		ContentPlugin = window.e12plugin.plugins.ContentPlugin,
		PopupPanel = window.e12plugin.gwtwidgets.PopupPanel,
		ContentType = window.e12plugin.enums.ContentType,
		HandlerType = window.e12plugin.enums.HandlerType;

	var contentPlugin = new ContentPlugin();
        var serverIP = getBBHostURL();

	var metadata = new PluginMetadata();
	metadata.put(MetadataKey.OBJ_NAME, new MetadataValue(""));
	metadata.put(MetadataKey.REF_SERIES, new MetadataValue(""));
	metadata.put(MetadataKey.REF_ID, new MetadataValue(""));
	metadata.put(MetadataKey.HOST_URL, new MetadataValue(serverIP));
	metadata.put(MetadataKey.IS_HOSTED_MODE, new MetadataValue(true));
	metadata.put(MetadataKey.VIEW_ONLY, new MetadataValue(false));
	metadata.put(MetadataKey.ENTERPRISE, new MetadataValue("Driver"));

// 	var contents = [
// 		{
// 			ID: '0000023162',
// 			TYPE: 'jpg'
// 		},
// 		{
// 			ID: '0000013823',
// 			TYPE: 'jpg'
// 		},
// 		{
// 			ID: '0000013824',
// 			TYPE: 'png'
// 		},
// 		{
// 			ID: '0000013826',
// 			TYPE: 'png'
// 		}
// 	];

	metadata.put(MetadataKey.CONTENTS, new MetadataValue(contents));

	contentPlugin.init(metadata);

	var viewUI = contentPlugin.getViewUI();
	var popupPanel = new PopupPanel(viewUI);
	popupPanel.center();
}


function callDataModel(dmConfig,loadFromDM, loadFromServer) {
	//dataModelName : content_library_dm
	var scopeKey=getScopeKey(dmConfig.scopeKey,dmConfig.scopeParams);
	var scopeParm = dmConfig.scopeParams + '&';
	console.log('dataModelName: ',dmConfig,scopeParm,'startTime',new Date());
	if ( window.datamodel && window.datamodel.getDefaultDataModel )
	{
		window.datamodel.getDefaultDataModel(dmConfig.dataModelName,scopeKey, scopeParm, dmConfig.isRefresh, function(resp) {
			console.log("callDataModel resp", loadFromDM,'endTime',new Date());
			loadFromDM(dmConfig.datasourceKey,resp);
		}, function(err) {
			console.log("callDataModel err", err, loadFromServer);
			loadFromServer();
		});
	}
	else
	{
		console.log("callDataModel err", loadFromServer);
		loadFromServer();
	}
}

function getScopeKey(scopeKey,scopeParams){
    var scopeKeyFinal ='';
    if(scopeKey){

		var scopeKeyArray = scopeKey.split("&");
		var scopeParamsArray = scopeParams.split("&");

		for (var i in scopeParamsArray) {
		  var scopeParam = scopeParamsArray[i];
		  var splitScopeParam =scopeParam.split("=");
		  var key= splitScopeParam[0];
		  for(var j in scopeKeyArray){
		     var scopeKey = scopeKeyArray[j];
		    if(key==scopeKey)
		    {
		      var value= splitScopeParam[1];
		      value=  value.split('/').join('~');
		      console.log('scopeKey:::',scopeKey);
		      console.log('value:::',value);
		      scopeKeyFinal=scopeKeyFinal+key+'='+value+'&';
		    }
		  }
		}
		scopeKeyFinal=scopeKeyFinal.slice(0, -1);
	    console.log('scopeKeyFinal::::::::::',scopeKeyFinal)
    }

	return scopeKeyFinal;

}

function exportToFile(data) {
    console.log('exportToFile', data, window.requestFileSystem);
    if( window.requestFileSystem )
    {
    /*
      window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

		  console.log('file system open: ' + fs.name);
		  var fileName = data.h6;
		  var fileData = data.data;
		  var fileDataType = data.type;
		  var dirEntry = fs.root;
		  saveFile(dirEntry, fileData, fileName, 'application/vnd.ms-excel');
      }, onErrorLoadFs);
      */
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
		    function (fs) {
		        fs.root.getDirectory("/Download", {
		            create : false,
		            exclusive : false
		        }, function (dirEntry) { //success
		            //do here what you need to do with Download folder
		            var fileName = data.h6 || data.n6 || 'export.xlsx';
					var fileData = data.data;
					var fileDataType = data.type;
		            saveFile(dirEntry, fileData, fileName, 'application/vnd.ms-excel');
		        }, function () {
		            //error getDirectory

		            alert('Error while getting Download directory access');
		        });
		    },
		    onErrorLoadFs
		);

	}
}

function saveFile(dirEntry, fileData, fileName, fileDataType) {
    console.log('saveFile', fileData, fileName, fileDataType);
    dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

        writeFile(fileName, fileEntry, fileData, fileDataType);

    }, onErrorCreateFile);
}

function writeFile(fileName, fileEntry, dataObj, dataObjType, isAppend) {
    console.log('writeFile', dataObj, dataObjType, isAppend);
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...", fileEntry, fileEntry.path);
            alert( fileName + ' exported successfully.');
        };

        fileWriter.onerror = function(e) {
            console.log("Failed file write: " + e.toString());
        };
        console.log("Creating ...blob ", new Uint8Array(dataObj));
	    if (dataObj) {
           var blob = new Blob( [new Uint8Array(dataObj)] , { type: dataObjType } );
           console.log("File writing...", blob);
           fileWriter.write(blob);
        }
    });
}

function onErrorLoadFs(err){
    console.log('onErrorLoadFs: ' + err);
}
function onErrorCreateFile(err){
    console.log('onErrorCreateFile: ' + err);
}
function removeClass(parentId,className){
   try
   {
   	 console.log('removeClass: ' , parentId,className);
	  $('#'+parentId).parents().find('.'+className).removeClass(className);
   }
   catch(e)
   {
    	console.log('Error in removeClass');
   }
}


function getItemByKey(arr, key, value){
	// here we look for existing group item in the result array
    // console.log('GET ITEM BY KEY',arr, key, value);
	return arr.reduce(function (prev, cur) {
		if (prev == null && cur[key] == value) {
			return cur;
		}
		return prev;
	}, null);
}

function checkPropForGroup(prop, key){
	// here we check which columns should stay in the group,
	// and which should go down to group items.
	 return  prop == key ||  prop.includes( key.concat('_'));
}

function cloneSuperItem(src, key){
	// create super item by copying only group related fields
	var item = {};
	//item['key'] = [];
	for (prop in src){
		if (checkPropForGroup(prop, key)){
			item[prop] = src[prop];
		}
	}
	item['children'] = [];
	item['collapsed']=colProperty;
	return item;
}

function cloneSubItem(src, key){
	var item = {};
	for (prop in src){
		if (!checkPropForGroup(prop, key)){
			item[prop] = src[prop];
			item['collapsed']=colProperty;
		}
	}
	// console.log('cloneSubItem item',item);
	return item;
}

function groupArray(arr, args, lvl){
	var key = args[lvl];
	var result = [];
	arr.forEach(function (item, ind, a){
		var keyItem = getItemByKey(result, key, item[key]);
		if (!keyItem){
			keyItem = cloneSuperItem(item, key);
			result.push(keyItem);
		}
		subItem = cloneSubItem(item, key);
		keyItem['children'].push(subItem);
		keyItem['id']=lvl-1;

	});
	if (args[lvl+1]){
		// recursively make grouping on lower level
		for (var i = 0; i < result.length; i++){
			result[i]['children'] = groupArray(result[i]['children'], args, lvl + 1);
		}
	}
		for (var i = 0; i < result.length; i++){
            if(args[lvl+1] && args[lvl+1].includes('DATE'))
            {
                result[i]['children'] = SORT(result[i]['children'], args[lvl + 1],'number');
            }
		}

	 console.log('groupArray result ',result);
	return result;
}

var colProperty;
function groupArrayMain(arr, keysArray,collapsed){
	// keys should be simply listed as parameters in order from top group to lower
	colProperty=collapsed;
	return groupArray(arr, keysArray, 1)
}

function SORT(array, key,typeOfColumn)
{
   var sortedArray = Object.assign([], array);
   if( sortedArray )
   {
       if(typeOfColumn=='number'){
           console.log('SORT function number>>');
           sortedArray.sort( function(a, b) {
           return parseInt(a[key]) - parseInt(b[key]);
           } )

       }
       else{
           sortedArray.sort( function(a, b) {
           console.log('SORT:::',a[key],b[key]);
           return a[key] > b[key]
               } )
       }
   }
   return sortedArray;
}



function getCurrentLatLongPosition(callback)
{
	console.log("In getCurrentLatLongPosition window.plugins[", window.plugins, "]");
    if( window.plugins && window.plugins.gpstracking )
    {
    	plugins.gpstracking.getCurrentLatLong(
    			function onSuccess(resultXML)
    			{
    				console.log("In getCurrentLatLongPosition["+resultXML+"]");
    				var xmlDoc = $.parseXML(resultXML), $xml = $(xmlDoc);
    				var latitude = $xml.find("LATITUDE").text() || 0.0;
    				var longitude = $xml.find("LONGITUDE").text() || 0.0;
    				var position = {
    						'latitude' : latitude,
    						'longitude' : longitude
    				};
    				callback(position);
    			},
    			function onError(error)
    			{
    				console.log( "Exception in getCurrentLatLongPosition: [",error,"]" );
    			},
    			[]
    	);
    }
    else
    {
    	//navigator.geolocation.getCurrentPosition((position) => {
   		navigator.geolocation.getCurrentPosition( function (position){
            console.log("setCurrentPosition...");
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
			var position = {
					'latitude' : latitude,
					'longitude' : longitude
			};
			callback(position);
    	});
    }
}

function callPresDataModel(isRefresh)
{
   console.log("In callPresDataModel function ::"+isRefresh);
   window.datamodel.getDefaultDataModel('brands_index_dm','', '&', isRefresh, function(resp) {
   console.log("callDataModel resp", resp);

   _downloadFiles(resp);

   var jsonArr = [];
   jsonArr.push(resp);

   plugins.PresentationPlayer.getIndexData(jsonArr);
   }, function(err) {
   console.log("callDataModel err", err);
   });
}

function openSurveyGWT()
{
	var id = '',
	objName = 'emp_survey',
	objType = 'S',
	title = 'Survey';
	if( window.openTransactionGWT )
	{
		window.openTransactionGWT(id, objName, objType, title );
	}
}

function openSurveyLINK()
{
	var serverIP = getBBHostURL();
	window.location.href = serverIP + '/ibase/webitm/jsp/PresentationSurvey.jsp';
}

// Added by Prajyot for download brand image files from server url
function _downloadFiles(resp)
{
	if( typeof window._getHostURL === 'function' )
	{
	   var respObj = JSON.parse(resp);
	   if( respObj && respObj.result.status == 'Success')
	   {
		   var brands = respObj.INDEX.BRANDS;
		   for(var brand of brands)
		   {
			   console.log('BRAND_CODE', brand.BRAND_CODE);
		   	   console.log('IMG_URL', brand.IMG_URL);
		   	   console.log('IMG_FOLDER', brand.IMG_FOLDER);
			   console.log('DOWNLOAD_IMG_URL', brand.DOWNLOAD_IMG_URL);
			   downloadFileFromURL(brand.DOWNLOAD_IMG_URL, brand.IMG_FOLDER, brand.BRAND_CODE);
		   }
	   }
	}
}

// Added by Prajyot for download any file from serverFileUrl provided
// serverFileUrl : /ibase/WebITMDocumentHandlerServlet?ACTION=GET_DOCUMENT&DOC_ID=' + documentId + '&DOC_TYPE=png'
// serverFileUrl : /ibase/CustomMenuImageServlet?fldValue=<REF_ID>&ALT_FLD_VALUE=<REF_VALUE>&objName=<REF_OBJ>&docAttachType=<DOC_TYPE>";

function downloadFileFromURL(serverURL, folderID, fileID)
{
	console.log('downloadFile data: fileID['+fileID+'], folderID:['+folderID+'] serverURL ['+serverURL+']');
    var fileExist = window.e12plugin.cordova.file.fileExists,
        _downloadFileURL = window.e12plugin.cordova.file.downloadFileURL;

    // directory is optional
    // pass directory as null, it will take "base/downloads" by default
    var directory = 'base/cache/downloads/files';
    if( folderID )
    {
        directory = directory + '/' + folderID;
    }
    var fileName = fileID + '.png';

    // check if file exists
    fileExist(directory, fileName, function(error, result) {
        // if error is present,
        // then file is not exists in given directory
        if (error) {
            // download file from server url
            _downloadFileURL(serverURL, directory, fileName, function(error, result) {
                // error in downloading file
                if (error) {
                    // handle error
                	console.log('_downloadFileURL Error in downloadFile',error);
                    return;
                }
                // file downloaded successfully
                // "result" will contains the absolute path of file in file system
                console.log('_downloadFileURL result in downloadFile',result);
            });
            return;
        }
        // "result" will contains the absolute path of file in file system
        console.log('fileExist result in downloadFile',result);
    });
}

//Added By Prajyot 09FEB19 - For checking network availability -Starts
function checkNetwork(callback)
{
	if( window.plugins && window.plugins.appBandwith )
	{
		window.plugins.appBandwith.checkBandwidth(
			function (success){
				console.log('checkBandwidth success>', success);
				if( success && success.indexOf('POOR') != -1 )
				{
					callback(false);
				}
				else
				{
					callback(true);
				}
			},
			function (error){
				console.log('checkBandwidth error>', error);
				callback(false);
			}
		);
	}
	else
	{
		callback(true);
	}
}
//Added By Prajyot 09FEB19 - For checking network availability -Ends

function checkSyncStatus()
{
	var offlineTransCnt = 0;
	var offlineDataIds = localStorage.getItem( "offlineDataIDList" );
	if ( offlineDataIds )
	{
		var offlineIdList = offlineDataIds.split( "," );
		offlineTransCnt = offlineIdList.length;
		console.log('offlineTransCnt:::', offlineTransCnt);
	}
	return offlineTransCnt;
}

function getAutoSyncStatus(status)
{
	var autoSyncStatus = '';
	var offlineTransCnt = 0;
	if( 'PENDING' == status )
	{
		var offlineDataIds = localStorage.getItem( "offlineDataIDList" );
		//console.log("From PluginWrapper : getOfflineTransCnt ["+ offlineDataIds +"]");
		if ( offlineDataIds )
		{
			var offlineIdList = offlineDataIds.split( "," );
			offlineTransCnt = offlineIdList.length;
			console.log('offlineIdList', offlineIdList);
		}
		if(offlineTransCnt > 0 )
		{
			autoSyncStatus = offlineTransCnt + ' Transaction(s) Pending';
		}
		else
		{
			autoSyncStatus = 'No Pending Transaction';
		}
	}
	if( 'FAILED' == status )
	{
		//Added Logic For Failed Transaction  -- offlineDataIDResultList
		var offlineDataIds = localStorage.getItem( "offlineDataIDResultList" );
		//console.log("From PluginWrapper : getOfflineTransCnt ["+ offlineDataIds +"]");
		if ( offlineDataIds )
		{
			var offlineIdList = offlineDataIds.split( "," );
			offlineTransCnt = offlineIdList.length;
			console.log('offlineIdList', offlineIdList);
		}
		if(offlineTransCnt > 0 )
		{
			autoSyncStatus = offlineTransCnt + ' Transaction Failed';
		}
		else
		{
			autoSyncStatus = 'No Failed Transaction';
		}
	}
	return autoSyncStatus;
}


function getTodaysDashboardStatus(status)
{
	var todaysDashboardStatus = '';
	var username = localStorage.getItem('userName');
	var jsonData = localStorage.getItem('TodaysServlet_'+ username);
	var counterObj = {
		'Listed' : 0,
		'Unlisted' : 0,
		'Distributer' : 0,
		'Doctor' : 0,
		'Retailer' : 0,
		'Wholesaler' : 0
	};

	if( jsonData )
	{
		var todaysData = JSON.parse(jsonData);
		//todaysData.CALL_DETAILS.map((callDetail)=> {
		if(todaysData && todaysData.CALL_DETAILS)
		{
			todaysData.CALL_DETAILS.map(function (callDetail) {
				//console.log( callDetail);
				//callDetail.PLACES = callDetail.PLACES.map((placeDetail)=> {
				callDetail.PLACES = callDetail.PLACES.map(function (placeDetail) {
					//placeDetail.CUSTOMERS = placeDetail.CUSTOMERS.map((custDetail)=> {
					placeDetail.CUSTOMERS = placeDetail.CUSTOMERS.map(function (custDetail) {
							//console.log( 'custDetail', custDetail);
							if( custDetail.LISTED == 'Y' )
							{
								counterObj.Listed ++;
							}
							else
							{
								counterObj.Unlisted ++;
							}
	
							switch(custDetail.CUST_TYPE)
							{
								case 'C': counterObj.Retailer ++; break;
								case 'D': counterObj.Doctor ++; break;
								case 'S': counterObj.Distributer ++; break;
								case 'W': counterObj.Wholesaler ++; break;
							}
							return custDetail;
						});
						return placeDetail;
					});
				return callDetail;
			});
		}
	}

	if( "LISTED" == status )
	{
		if( counterObj.Listed > 0 )
		{
			todaysDashboardStatus += ' Listed : ' + counterObj.Listed;
		}
		if( counterObj.Unlisted > 0 )
		{
			todaysDashboardStatus += ' Unlisted : ' + counterObj.Unlisted;
		}
	}

	if( "CUST_TYPE" == status )
	{
		if( counterObj.Doctor > 0 )
		{
			todaysDashboardStatus += ' Doctors : ' + counterObj.Doctor + ', ';
		}
		if( counterObj.Retailer > 0 )
		{
			todaysDashboardStatus += ' Retailers : ' + counterObj.Retailer + ', ';
		}
		if( counterObj.Distributer > 0 )
		{
			todaysDashboardStatus += ' Distributers : ' + counterObj.Distributer + ', ';
		}
		if( counterObj.Distributer > 0 )
		{
			todaysDashboardStatus += ' Wholesaler : ' + counterObj.Wholesaler + ', ';
		}
		if(todaysDashboardStatus.length == 0)
		{
			todaysDashboardStatus = 'Not visited yet';
		}
	}
	return todaysDashboardStatus;
}


function getCallListCount(status)
{
     console.log('status :::::: ', status);
	var todaysDashboardStatus = '';
	var username = localStorage.getItem('userName');
	var jsonData = localStorage.getItem('TodaysServlet_'+ username);
	var counterObj = {
		'Stockist' : 0,
		'Doctor' : 0,
		'Retailer' : 0,
		'Wholesaler' : 0,
        'Customer' : 0
	};

	if( jsonData )
	{
		var todaysData = JSON.parse(jsonData);
       // console.log('todaysData :::::: ', todaysData);
		//todaysData.CALL_DETAILS.map((callDetail)=> {
			if( todaysData )
			{
				todaysData.MY_CALLLIST_COUNT = todaysData.MY_CALLLIST_COUNT.map(function (custDetail) {
						console.log( 'custDetail', custDetail);
						//console.log( 'inside the switch', custDetail.OPTION_TYPE);
                        //console.log( 'inside the switch', custDetail.OPTION_VALUE);

						switch(custDetail.OPTION_TYPE)
						{

							case 'CUSTOMER': counterObj.Customer = custDetail.OPTION_VALUE ; break;

						}
						return custDetail;
					});
			}
	}


	if( "Customer" == status )
	{
		if( counterObj.Customer > 0 )
		{
			todaysDashboardStatus += ' Total Call List : ' + counterObj.Customer + ', ';
		}

		if(todaysDashboardStatus.length == 0)
		{
			todaysDashboardStatus = 'No Customers';
		}
	}
     console.log('todaysDashboardStatus :::::: ', todaysDashboardStatus);
     var desiredData = replaceCommaLine(todaysDashboardStatus);
	 return desiredData;
}

function replaceCommaLine(data) {
    //convert string to array and remove whitespace
    let dataToArray = data.split(',').map(item => item.trim());
    //convert array to string replacing comma with new line
    return dataToArray.join("\n");
}

function getAutoSyncImgClass()
{
	var isAutoSyncStarted = localStorage.getItem( "isAutoSyncStarted" );
	if( isAutoSyncStarted && isAutoSyncStarted == 'true' )
	{
		return 'rotate';
	}
	else
	{
		return '';
	}
}

//Added By Prajyot on 23/02/19 to Update Cache DCR Data by referring Todays Dashboard Data - Starts
function updateCacheDCRData()
{
	try
	{
		var username = localStorage.getItem('userName');
		var jsonData = localStorage.getItem('TodaysServlet_'+ username);
		if( jsonData )
		{
			var todaysData = JSON.parse(jsonData);
			console.log('todaysData', todaysData);
			if( todaysData )
			{
				if(todaysData.CALL_DETAILS && todaysData.CALL_DETAILS.length == 0)
				{
					console.log('Resetting data... of ');
					var keySuffix = ['_StrgCode', '_ActivityType', '_OthParticipant',
									'_LocalityDetails', '_LocalityCode', '_OrderOfVisit'];
					for( var ls_item in localStorage )
					{
						//keySuffix.map( key => {
						keySuffix.map(function(key) {
							if( ls_item && ls_item.endsWith(key) )
							{
								console.log('Removing data... of ', ls_item);
								localStorage.removeItem(ls_item);
							}
						});
					}
				}
				else
				{
					//todaysData.CALL_DETAILS.map((callDetail)=> {
					todaysData.CALL_DETAILS.map(function (callDetail) {
						console.log( callDetail.EVENT_DATE );
						var eventDateNew = callDetail.EVENT_DATE;
						var oldStrgCode = localStorage.getItem(eventDateNew+'_StrgCode');
						var newStrgCode = [];
						if(oldStrgCode != null && oldStrgCode.trim().length != 0)
						{
							newStrgCode = oldStrgCode.split(',');
						}
						//callDetail.PLACES = callDetail.PLACES.map((placeDetail)=> {
						//	placeDetail.CUSTOMERS = placeDetail.CUSTOMERS.map((custDetail)=> {
						callDetail.PLACES = callDetail.PLACES.map(function (placeDetail) {
							placeDetail.CUSTOMERS = placeDetail.CUSTOMERS.map(function (custDetail) {
									var custCode = custDetail.CUST_CODE;
									console.log( 'custDetail custCode --', custCode);
									if( !newStrgCode.includes(custCode) )
									{
										newStrgCode.push(custCode);
									}
									return custDetail;
								});
								return placeDetail;
							});
	
						console.log('oldStrgCode', oldStrgCode, 'newStrgCode', newStrgCode.join(','));
						localStorage.setItem(eventDateNew+'_StrgCode', newStrgCode.join(','));
						return callDetail;
					});
				}
			}
		}
		//localStorage.setItem(eventDateNew+'_StrgCode', strgCode);
	}
	catch(e)
	{
		console.log('updateCustomerCode...', e);
	}
}
//Added By Prajyot on 23/02/19 to Update Cache DCR Data by referring Todays Dashboard Data - Ends

//Added by shrutika on 13-08-19 [Start] for Explore option to be added in home screen and report.
// Added By Saitej D [To Redirect To Dashboard & Open Angular Component on Pop Up]
function openComponentANG(compName, compType)
{
    openComponentANG(compName, compType, null);
}

function openComponentANG(compName,compType,exploreData)
{
	console.log('Inside openComponentAng 1126!!! ['+compType+']');
    var dashboardFound = false;
    if(compType == 'dashboard')
    {
        var userName = localStorage.getItem('userName');
        var dashboardList = localStorage.getItem('dashboard_list_'+userName);
        var dbFound = false;
        if(dashboardList && dashboardList != null)
        {
            dashboardList = JSON.parse(dashboardList);
            console.log('dashboardList::',dashboardList);

            //var dashboard = dashboardList.filter( db => db.dbrResource == compName);
            var dashboard = dashboardList.filter( function(db) { db.dbrResource == compName } );
            console.log('dashboard::',dashboard);

            if(dashboard && dashboard.length > 0)
            {
                dashboardFound = true;
                redirectDashboard(dashboard[0].pageIndex);
            }
        }
    }
	else if( compType == 'explore' && exploreData != null )
	{
		console.log('Inside pluginWrapper js 1149!!!! ');
		var componentData = {};
		var compId = 'ang-popup-'+compName;
		componentData['targetId'] = compId;
		componentData['componentName'] = compName;
		componentData['data'] = exploreData;
		createPopup(componentData, compType);
		dashboardFound = true;
	}
	//Added by vikas and Nikhil on 23-01-23 for Creating Seperate pop For Vision assistant open through Link [Start]
	else if( compType == 'assistant' && exploreData != null )
	{
		console.log('Inside pluginWrapper js 1243!!!! ',exploreData);
		console.log('Inside original pluginWrapper js after changes of vision assistane line 1240!!!! ',exploreData);
		var componentData = {};
		var compId = 'ang-popup-'+compName;
		componentData['targetId'] = compId;
		componentData['componentName'] = compName;
		componentData['intentID'] = exploreData['intentID'];
		componentData['linkArgument'] = exploreData['linkArgument'];
		console.log('Inside pluginWrapper js 1250!!!! ',componentData);
		createAssistantPopup(componentData, compType)
		dashboardFound = true;
	}
	//Added by vikas and Nikhil on 23-01-23 for Creating Seperate pop For Vision assistant open through Link [End]
    if(!dashboardFound)
    {
        var compId =  'ang-popup-'+compName;
        //Added By Pratheek on 05-Aug-19[passing the userID so to get the tag data of specific users ]-Start
		var componentData = {};
		var userName = localStorage.getItem('userName');
        componentData['targetId'] = compId;
		componentData['componentName'] = compName;
		componentData['userID'] = userName;
		componentData['showHeader'] = true;
		//Added By Pratheek on 05-Aug-19[passing the userID so to get the tag data of specific users ]-End
        createPopup(componentData, compType);
    }
}

//Added by vikas on 23-01-23 for Creating Seperate pop For Vision assistant open through Link [Start]
function createAssistantPopup(componentData, compType)
{
	var index = window.location.pathname.indexOf('E12BROWSER');
    var containerClass='angPopupContainer',contentClass='angPopupContent',headerClass = 'angPopupHeader-assistant',maximizeClass = 'angPopupMaximize-assistant',popupHeadTitleClass='angPopupHeadTitle-assistant',closeButtonClass = 'angPopupClose-assistant',popupBodyClass = 'angPopupBody-assistant',closeBtnClass='angPopupclose';
	if(index == -1)
    {
        containerClass='angMobPopupContainer';contentClass='angMobPopupContent';closeBtnClass='angMobPopupclose';
    }
	containerClass ='angPopupContainer-assistant';
	contentClass ='angPopupContent-assistant';
	headerClass = 'angPopupHeader-assistant';
	maximizeClass = 'angPopupMaximize-assistant'
	popupHeadTitleClass='angPopupHeadTitle-assistant';
	closeButtonClass = 'angPopupClose-assistant';
	popupBodyClass = 'angPopupBody-assistant';
	let isleftSidePanelOpen = false;
	//HTML FOR VISION ASSISTANT POPUP STARTS BELOW
	var popupContainer = document.createElement("div");
    popupContainer.className = containerClass;
    var popupContent = document.createElement("div");
    popupContent.className = contentClass;
	popupContent.setAttribute("id","popupContentID")
	//HEADER CONTAINER CODE START
	var popupHeader = document.createElement("div");
	popupHeader.className = headerClass;
	var popupMaximize  = document.createElement("div")
	popupMaximize.className = maximizeClass
	var popupMaximizeImg = document.createElement("img")
	popupMaximizeImg.src = "simpleditorplugin/assets/images/svg/Maximize.svg";
	popupMaximizeImg.setAttribute('height','12px');
	popupMaximizeImg.setAttribute('width','12px');
	popupMaximizeImg.setAttribute('margin','0px');
	popupMaximize.onclick = function()
	{
		console.log('I have been clicked on popupMaximize');
		if(document.getElementById("popupContentID") != null && isleftSidePanelOpen == false)
		{
			isleftSidePanelOpen = true
			var element = document.getElementById("popupContentID").style.width = "calc(100% - 40px)";
		}
		else if(document.getElementById("popupContentID") != null && isleftSidePanelOpen == true)
		{
			isleftSidePanelOpen = false
			var element = document.getElementById("popupContentID").style.width = "320px";
		}
	}
	var popupHeaderContent = document.createElement("div");
	var popupHeadTitle = document.createElement("div");
	popupHeadTitle.innerHTML = 'Assistant';
	popupHeadTitle.setAttribute('id','headTitle');
	popupHeadTitle.className = popupHeadTitleClass;
	var popupClose = document.createElement("div");
	popupClose.className = closeButtonClass;
	var popupCloseImg = document.createElement("img");
	popupCloseImg.src = "simpleditorplugin/assets/images/Close.svg";
	popupCloseImg.setAttribute('height','12px');
	popupCloseImg.setAttribute('width','12px');
	popupCloseImg.setAttribute('margin','0px');
    popupCloseImg.innerHTML = '&times;';
	//BODY CONTAINER CODE START
	var popupBody = document.createElement("div")
	popupBody.className = popupBodyClass
	popupBody.setAttribute("id","Assistant");
    var popupContentTarget = document.createElement("div");
    popupContentTarget.id = componentData.targetId;
   	popupCloseImg.innerHTML = '&times;'
	// popupCloseImg.onclick = function() 
	popupClose.onclick = function() 
	{
		popupContainer.remove();
		if(compType != 'dashboard')
		{
		  destroyComponent(componentData.componentName);
		}
	}
	if(index == -1)
    {
        var popupCloseBtnCont = document.createElement("div");
        popupCloseBtnCont.className = 'angMobPopupCloseCont';
        popupCloseBtnCont.appendChild(popupCloseBtn);
        popupContainer.appendChild(popupCloseBtnCont);
    }
    else
    {
		popupContent.appendChild(popupHeader);
		popupHeader.appendChild(popupClose);
		popupHeader.appendChild(popupMaximize);
		popupMaximize.appendChild(popupMaximizeImg);
		popupHeader.appendChild(popupHeaderContent);
		popupHeaderContent.appendChild(popupHeadTitle);
		popupClose.appendChild(popupCloseImg);
		popupContent.appendChild(popupBody);
    }
	popupBody.appendChild(popupContentTarget);
    popupContainer.appendChild(popupContent);
	document.getElementsByTagName('body')[0].appendChild(popupContainer);
	if(compType != 'dashboard')
    {
		loadSimpleEditorComponent(componentData.targetId, JSON.stringify(componentData), null) 
    }
}
//Added by vikas on 23-01-23 for Creating Seperate pop For Vision assistant open through Link [End]
//Added by shrutika on 13-08-19 [End] for Explore option to be added in home screen and report.
function createPopup(componentData, compType)
{
    var index = window.location.pathname.indexOf('E12BROWSER');
    var containerClass='angPopupContainer',contentClass='angPopupContent',closeBtnClass='angPopupclose';
    if(index == -1)
    {
        containerClass='angMobPopupContainer';contentClass='angMobPopupContent';closeBtnClass='angMobPopupclose';
    }
    if(compType == 'explore')
	{
       containerClass='angPopupContainer-explore';
       contentClass='angPopupContent-explore';
       closeBtnClass='angPopupclose-explore';
	}

    var popupContainer = document.createElement("div");
    popupContainer.className = containerClass;
    var popupContent = document.createElement("div");
    popupContent.className = contentClass;
    //popupContent.id = componentData.targetId;
    var popupContentTarget = document.createElement("div");
    popupContentTarget.id = componentData.targetId;

    var popupCloseBtn = document.createElement("button");
    popupCloseBtn.innerHTML = '&times;';
    popupCloseBtn.className = closeBtnClass;
    popupCloseBtn.onclick = function() {
		popupContainer.remove();
		if(compType == 'dashboard')
		{
			detroyDashboard(componentData.componentName);
		}
		else
		{
			destroyComponent(componentData.componentName);
		}
		if(componentData.contentData)
		{
			if(componentData.contentData.objName)
			{
				destroyComponent(componentData.contentData.objName);
			}
			else if(componentData.contentData.OBJ_NAME__IMP)
			{
				destroyComponent(componentData.contentData.OBJ_NAME__IMP);
			}
		}
	}

    if(index == -1)
    {
        var popupCloseBtnCont = document.createElement("div");
        popupCloseBtnCont.className = 'angMobPopupCloseCont';
        popupCloseBtnCont.appendChild(popupCloseBtn);
        popupContainer.appendChild(popupCloseBtnCont);
    }
    else
    {
        //popupContainer.appendChild(popupCloseBtn);
        popupContent.appendChild(popupCloseBtn);
    }
    popupContent.appendChild(popupContentTarget);

    popupContainer.appendChild(popupContent);

    document.getElementsByTagName('body')[0].appendChild(popupContainer);
    if(compType == 'dashboard')
    {
        loadAngularDashboard(componentData.componentName, JSON.stringify(componentData), null);
    }
    else
    {
        try 
		{
			loadSimpleEditorComponent(componentData.targetId, JSON.stringify(componentData), null);
        } 
		catch (error) 
		{
	        console.log('error in loadSimpleEditorComponent:::',error);
			popupContainer.remove();
			alert('Unable to load the option. <br /> Please contact the system administrator.');
        }
    }
}
// Added By Saitej D [To Redirect To Dashboard & Open Angular Component on Pop Up]

// Added By Kamal P [To get total docContents and No of Places in Place Time Entity] Start

function getUserActSummary(status){

	var userStatus = '';
	var username = localStorage.getItem('userName');
	var jsonDataStr = localStorage.getItem('UserActSummary_'+ username);
    var jsonData;

	if( jsonDataStr )
	{
		jsonData = JSON.parse(jsonDataStr);
		//console.log('jsonData', jsonData);
	}


    if( jsonData )
    {
	    if( "CLM_COUNT" == status )
        {
          var noOfDocContents = jsonData.userActSummary.NO_OF_CONTENTS;
          //console.log('noOfDocContents ',noOfDocContents);
          if(noOfDocContents && noOfDocContents > 0)
          {
            userStatus = noOfDocContents;
          }
        }
	    else if( "PTE_COUNT" == status )
        {
          var noOfPlaces = jsonData.userActSummary.NO_OF_PLACES;
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfPlaces && noOfPlaces > 0)
          {
            userStatus = noOfPlaces;
          }
        }
	    else if( "JOBS_COUNT" == status )
        {
          var noOfJobs = jsonData.userActSummary.NO_OF_JOBS;
          //console.log('noOfDocContents ',noOfDocContents);
          if(noOfJobs && noOfJobs > 0)
          {
            userStatus = noOfJobs;
          }
        }
	    else if( "TAGS_COUNT" == status )
        {
          var noOfTags = jsonData.userActSummary.NO_OF_TAGS;
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfTags && noOfTags > 0)
          {
            userStatus = noOfTags;
          }
        }
	    else if( "CLM_MSG" == status )
        {
          var noOfDocContents = jsonData.userActSummary.NO_OF_CONTENTS;
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfDocContents && noOfDocContents > 0)
          {
            userStatus = 'content(s)';
          }
          else
          {
            userStatus = 'No Contents';
          }
        }
	    else if( "PTE_MSG" == status )
        {
          var noOfPlaces = jsonData.userActSummary.NO_OF_PLACES;
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfPlaces && noOfPlaces > 0)
          {
            userStatus = 'place(s)';
          }
          else
          {
            userStatus = 'No Places';
          }
        }
	    else if( "JOBS_MSG" == status )
        {
          var noOfJobs = jsonData.userActSummary.NO_OF_JOBS;
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfJobs && noOfJobs > 0)
          {
            userStatus = 'job(s)';
          }
          else
          {
            userStatus = 'No Background Job';
          }
        }
	    else if( "TAGS_MSG" == status )
        {
          var noOfTags = jsonData.userActSummary.NO_OF_TAGS;
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfTags && noOfTags > 0)
          {
            userStatus = 'tag(s)';
          }
          else
          {
            userStatus = 'No Tags';
          }
        }
        else if( "CALL_LIST_COUNT" == status )
        {
          var noOfCusts =  localStorage.getItem('SPRS_CUST_INFO_COUNT_'+ username);
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfCusts && noOfCusts > 0)
          {
            userStatus = noOfCusts + ' customer(s)';
          }
          else
          {
            userStatus = 'No Customers';
          }
        }
        else if( "CALL_LIST_COUNT_INT" == status )
        {
          var noOfCusts =  localStorage.getItem('SPRS_CUST_INFO_COUNT_'+ username);
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfCusts && noOfCusts > 0)
          {
            userStatus = noOfCusts ;
          }
        }
        else if( "CALL_LIST_MSG" == status )
        {
          var noOfCusts =  localStorage.getItem('SPRS_CUST_INFO_COUNT_'+ username);
          //console.log('noOfPlaces',noOfPlaces);

          if(noOfCusts && noOfCusts > 0)
          {
            userStatus = 'customer(s)';
          }
          else
          {
            userStatus = 'No Customers';
          }
        }

    }
    return userStatus;
}

function deactivateDevice() {
      console.log('deviceId is==>');
}

// Added By Kamal P [To get total docContents and No of Places in Place Time Entity] End

//Added by Prajyot [To update]
function updateCacheDatamodel(datasource, jsonData, ngZone)
{
	try
	{
		console.log('updateCacheDatamodel ..', datasource);
		var username = localStorage.getItem('userName');
		console.log('jsonData', jsonData);
		if( jsonData )
		{
			var _count = Object.keys(jsonData).length;
			if( jsonData.reponse == 'loading' )
			{
				_count = 0;
			}
			else if( jsonData.status == 'Success' )
			{
		    	_count = _count - 1;
			}
			localStorage.setItem(datasource+'_COUNT_'+ username, _count);
			if( ngZone )
			{
				//ngZone.run(() => {
				ngZone.run( function() {
	    	      console.log( 'view refreshed' );
	      		} );
	      	}
		}
	}
	catch(e)
	{
		console.log('updateCacheDatamodel...', e);
	}
}

//Added by Sainath T. on 25-SEP-2019 [to call opentransaction]-START
function callOpenTransaction(objName, isBrowser)
{
	if( isBrowser )
	{
		window.openTransactionsGWT(objName);
	}
	else if( !isBrowser )
	{
		window.openTransactionGWT(Math.random(),objName,'T',objName);
	}
}
//Added by Sainath T. on 25-SEP-2019 [to call opentransaction]-END

//Added by Prajyot R. on 24-MAR-2020 [To get formatted value] Start
function formattedValue(value, format)
{
	//console.log('value >>>',value);

	var formattedValue = value;
	if( format == 'RS' )
	{
		var convertedValue = value;
		if (value >= 10000000) convertedValue = (value / 10000000).toFixed(2) + ' Cr';
		else if (value >= 100000) convertedValue = (value / 100000).toFixed(2) + ' L';
		else if (value >= 1000) convertedValue = (value / 1000).toFixed(2) + ' K';
		//console.log('convertedValue #2 >>>', convertedValue);

		formattedValue =  '\u20B9 ' + convertedValue;
	}
	else if( format.indexOf('MAX_FR_DIG_') == 0 ) //MAX_FR_DIG_2 or MAX_FR_DIG_4
	{
		var decimalPoints = format.replace('MAX_FR_DIG_', '');
		formattedValue = '\u20B9 ' + numFormat(value, decimalPoints);
	}
	else if( format == '%' )
	{
		formattedValue = (value / 1).toFixed(2) + ' %';
	}
	//console.log('formattedValue >>>',formattedValue);
    else
    {
        if( value > 0 ) {
            formattedValue = value;
        }
        else {
            formattedValue = ' ';
        }
    }
	return formattedValue;
}
function numFormat(val, maxDecimalPoints) {
	var numFormatter = new Intl.NumberFormat('en-IN', {
	  maximumFractionDigits: maxDecimalPoints,
	  minimumFractionDigits: 0
	})
    return numFormatter.format(val);
}
//Added by Prajyot R. on 24-MAR-2020 [To get formatted value] End


// Added by Vikas Lagad on 28-Mar-20 [START]
function showAttachment(data)
{
	var refId = data.getAttribute('name');
	if(!refId)
	{
		window.alert("No attachment found");
		return;
	}
    var serverIP = getBBHostURL();
	var hostedMode = true;
	if(serverIP){
      hostedMode = false;
    }
	console.log('Inside showAttachment Method..............',data.getAttribute('id'));
	var attchPluginViewUI = window.getAttachmentsPluginUI({
			OBJ_NAME : "sell_planning",
			REF_SER :'PAT-F',
			REF_ID : refId,
			HOST_URL : getBBHostURL(),
			DOC_TYPE : "",
			UI : "V",
			THUMBNAIL_WIDTH : "30px",
			THUMBNAIL_HEIGHT : "30px",
			MAX_WIDTH : "100px",
			IS_HOSTED_MODE : true
     });

	 setTimeout(function()
	 {
		 try
		  {
				console.log('showAttachment   .......     ',attchPluginViewUI);
				if(document.getElementById("attPluginMainPanel"))
				{
					document.getElementById("attPluginMainPanel").remove();
				}
				if(attchPluginViewUI)
				{
					document.getElementById('attachment-content').appendChild(attchPluginViewUI);
				}
				console.log('#Div   ',document.getElementById("hiddenAttachDiv_"));
				var childDiv = document.getElementById("hiddenAttachDiv_") || window.parent.document.getElementById('hiddenAttachDiv_') ;
				if(childDiv)
				{
					//childDiv.style.display = "block";
					var x = document.getElementsByClassName('attachedFile card-img');
   					if(x[0])
					{
						x[0].click();
					}
				}
				var id = data.getAttribute('id');
				var image = document.getElementById(id);
        		console.log('image    ',image);
			 	if (image && image.getAttribute('src') == "simpleditorplugin/assets/images/svg/doc-white.svg")
				{
					 image.src = "simpleditorplugin/assets/images/svg/doc-blue.svg";
				}
		  }
		  catch (error)
		  {
				console.log('Error  ',error);
		  }
	   }, 100);
}

function updateApptStatus( updateData )
{
	var url = getBBHostURL();
	console.log('Inside updateApptStatus', updateData.getAttribute('id') ,url);
	var apptId = updateData.getAttribute('id');
	url = url + '/ibase/rest/appointmentService/updateApptStatus/' + apptId;
	console.log('url       ::  ',url);
	$.get(url,
    function (data, textStatus, jqXHR)
    {
        console.log('status: ' + textStatus + ', data:' + data['type']);
		if(data['type'] === 'P' || data['type'] === 'W' )
		{
				//alert(data['trace']  + '<br>For Patient With <br>Id : '+  data['patient_code'][0]  +'& Name : ' + data['patient_name'][0]);
				alert('<span style="font-size : 18px;font-weight : bold;"> '+data['description']+' </span> <br>For ' + data['patient_name'][0]);
				var popUpDiv = document.getElementById('popup_img_content');
                if(popUpDiv) {
	                 popUpDiv.style.color = '#3fa75f';
				}
				var image = document.getElementById(apptId);
			 	if (image && image.getAttribute('src') == "simpleditorplugin/assets/images/svg/white-tick.svg") {
					 image.src = "simpleditorplugin/assets/images/svg/green-tick.svg";
				}
		}
     });
}
// Added by Vikas Lagad on 28-Mar-20 [END]
function updateMyApptStatus( updateData )
{
	var url = getBBHostURL();
	console.log('Inside updateApptStatus', updateData.getAttribute('id') ,url);
	var apptId = updateData.getAttribute('id');
	url = url + '/ibase/rest/appointmentService/updateMyApptStatus/' + apptId;
	console.log('url       ::  ',url);
	$.get(url,
    function (data, textStatus, jqXHR)
    {
        console.log('status: ' + textStatus + ', data:' + data['type']);
		if(data['type'] === 'P' || data['type'] === 'W' )
		{
			    /*Commented & added By Vikas Lagad on 27-04-2020[To replace alert to snackbar & auto refresh dashboard data.]Start*/
				//alert(data['trace']  + '<br>For Patient With <br>Id : '+  data['patient_code'][0]  +'& Name : ' + data['patient_name'][0]);
				/* alert('<span style="font-size : 18px;font-weight : bold;"> '+data['description']+' </span> <br>with Dr. ' + data['doctor_name'][0]);
				var popUpDiv = document.getElementById('popup_img_content');
                if(popUpDiv) {
	                 popUpDiv.style.color = '#3fa75f';
				}
				var image = document.getElementById(apptId);
			 	if (image && image.getAttribute('src') == "simpleditorplugin/assets/images/svg/white-tick.svg") {
					 image.src = "simpleditorplugin/assets/images/svg/green-tick.svg";
				}*/
				 var displayMsg = data['description'] + ' with Dr. ' + data['doctor_name'][0];
				 var snackBarDiv = document.getElementById('snackbar');
				 console.log('snackBarDiv    ', snackBarDiv);
				 snackBarDiv.innerHTML = displayMsg;
				 snackBarDiv.className = 'show';
				 setTimeout(function () {
					 snackBarDiv.className = snackBarDiv.className.replace('show', '');
					 snackBarDiv.innerHTML = '';
				 }, 3000);

				try {
					var refreshIcon = document.getElementById('bbRefreshIcon');
					var click_event = new CustomEvent('click');
					refreshIcon.dispatchEvent(click_event);
				}
				catch (error) {
					console.log('updateMyApptStatus  ..... ', error);
				}
				/*Commented & added By Vikas Lagad on 27-04-2020[To replace alert to snackbar & auto refresh dashboard data.]End*/
		}
     });
}

// Added by Saiprasad G. on for adding attachment -START
function addAttachment(objName,refSer,refId)
{
	var serverIP = getBBHostURL();
	var IS_HOSTED_MODE = true;
	if(serverIP){
      IS_HOSTED_MODE = false;
    }
    console.log('Inside addAttachment Method..............');
    	var attchPluginViewUI = window.getAttachmentsPluginUI({
		OBJ_NAME : objName,
		REF_SER :refSer,
		REF_ID : refId,
		HOST_URL : getBBHostURL(),
		DOC_TYPE : "",
		UI : "A",
		THUMBNAIL_WIDTH : "30px",
		THUMBNAIL_HEIGHT : "30px",
		MAX_WIDTH : "100px",
		IS_HOSTED_MODE : IS_HOSTED_MODE,
		MAX_WIDTH: '100%'
	});
	return attchPluginViewUI;
}
// Added by Saiprasad G. for adding attachment -END
// Added by Saiprasad G. for changing status -START
function updatePatientFamilyStatus( updateData )
{
	var confirmFlag = window.confirm("Do you want delete?");
	console.log('confirm:',confirmFlag);
    if (confirmFlag == true)
	{
		var url = getBBHostURL();
		console.log('Inside updatePatientFamiyStatus', updateData.getAttribute('id') ,url);
		var lineNo = updateData.getAttribute('id');
		url = url + '/ibase/rest/PatientService/updatePatientFamiyStatus/' + lineNo;
		console.log('url       ::  ',url);
		$.get(url,
    	function (data, textStatus, jqXHR)
   		 {
    		console.log('status: ' + textStatus + ', data:' + data['type']);
			if(data['type'] === 'P' || data['type'] === 'W' )
			{
				//alert(data['member_name']+' '+data['description']);
				/*Commented & added By Vikas Lagad on 27-04-2020[To replace alert to snackbar & auto refresh dashboard data.]Start*/
                //alert(data['description']+' with Dr. '+data['doctor_name']);
                 var displayMsg = data['member_name']+' '+data['description'];
                 var snackBarDiv = document.getElementById('snackbar');
                 console.log('snackBarDiv    ', snackBarDiv);
                 snackBarDiv.innerHTML = displayMsg;
                 snackBarDiv.className = 'show';
                 setTimeout(function () {
                     snackBarDiv.className = snackBarDiv.className.replace('show', '');
                     snackBarDiv.innerHTML = '';
                 }, 3000);

                try {
                    var refreshIcon = document.getElementById('bbRefreshIcon');
                    var click_event = new CustomEvent('click');
                    refreshIcon.dispatchEvent(click_event);
                }
                catch (error) {
                    console.log('updateMyApptStatusDelete .. ', error);
                }
                /*Commented & added By Vikas Lagad on 27-04-2020[To replace alert to snackbar & auto refresh dashboard data.]End*/
			}
    	});
	}
	else
	{
		console.log('confirm false condition:',confirmFlag);
	}
 }
// Added by Saiprasad G. for changing status -END

//Added by Amey W. [Update status on Delete] on 20-4-2020 START
function updateMyApptStatusDelete( updateData )
{
	var confirmFlag = window.confirm("Do you want delete?");
	console.log('confirm:',confirmFlag);
    if (confirmFlag == true)
	{
		console.log('Inside updateMyApptStatusDeleteupdateMyApptStatusDeleteupdateMyApptStatusDelete', updateData.getAttribute('id') ,url);
		var url = getBBHostURL();
		console.log('Inside updatePatientFamiyStatus', updateData.getAttribute('id') ,url);
		var apptId = updateData.getAttribute('id');
		url = url + '/ibase/rest/appointmentService/updateMyApptStatusDelete/' + apptId;
		console.log('url       ::  ',url);
		$.get(url,
    	function (data, textStatus, jqXHR)
   		{
    		console.log('status: ' + textStatus + ', data:' + data['type']);
			if(data['type'] === 'P' || data['type'] === 'W' )
			{
				/*Commented & added By Vikas Lagad on 27-04-2020[To replace alert to snackbar & auto refresh dashboard data.]Start*/
				//alert(data['description']+' with Dr. '+data['doctor_name']);
				 var displayMsg = data['description']+' with Dr. '+data['doctor_name'];
				 var snackBarDiv = document.getElementById('snackbar');
				 console.log('snackBarDiv    ', snackBarDiv);
				 snackBarDiv.innerHTML = displayMsg;
				 snackBarDiv.className = 'show';
				 setTimeout(function () {
					 snackBarDiv.className = snackBarDiv.className.replace('show', '');
					 snackBarDiv.innerHTML = '';
				 }, 3000);

				try {
					var refreshIcon = document.getElementById('bbRefreshIcon');
					var click_event = new CustomEvent('click');
					refreshIcon.dispatchEvent(click_event);
				}
				catch (error) {
					console.log('updateMyApptStatusDelete .. ', error);
				}
				/*Commented & added By Vikas Lagad on 27-04-2020[To replace alert to snackbar & auto refresh dashboard data.]End*/
			}
    	});
	}
	else
	{
		console.log('confirm false condition:',confirmFlag);
	}
}
//Added by Amey W. [Update status on Delete] on 20-4-2020 END

//Added by shrutika on 26-05-2020 [Start] for close panel in case of extract template.
/*function closeExtractTemplate()
{
	window.closePopup();
}*/
//Added by shrutika on 26-05-2020 [End] for close panel in case of extract template.
//Added by nikhil on 30-06-2022 for edit issue in manege visual[Start]
function closeEditor(compName)
{
	window.closePopup();
	destroyComponent(compName);
}
//Added by nikhil on 30-06-2022 for edit issue in manege visual[End]
//Added by pankaj p for Open Dashboard in MyCalendar through Obj_links on 23-May-2022 [START]
function openComponentANGDashboard(compName, compType)
{
    var dashboardFound = false;
    console.log("In openComponentANGDashbrd", compType);
   // openComponentANG(compName, compType, null);
    if(compType == 'dashboard')
    {
        var userName = localStorage.getItem('userName');
        var dashboardList = localStorage.getItem('dashboard_list_'+userName);
        var dbFound = false;
        if(dashboardList && dashboardList != null)
        {
            dashboardList = JSON.parse(dashboardList);
            console.log('dashboardList::',dashboardList);

            //var dashboard = dashboardList.filter( db => db.dbrResource == compName);
            var dashboard = dashboardList.filter( function(db) { db.dbrResource == compName } );
            console.log('dashboard::',dashboard);
            console.log("In dashboardFound",dashboardFound);
            if(dashboard && dashboard.length > 0)
            {
                dashboardFound = true;
                redirectDashboard(dashboard[0].pageIndex);
            }
        }
    }
    if(!dashboardFound)
    {
        console.log("In dashboardFound",dashboardFound);
        var compId =  'ang-popup-'+compName;
        //Added By Pratheek on 05-Aug-19[passing the userID so to get the tag data of specific users ]-Start
		var componentData = {};
        console.log("In componentData",componentData);
		var userName = localStorage.getItem('userName');
        console.log("In userName",userName);
        componentData['targetId'] = compId;
		componentData['componentName'] = compName;
		componentData['userID'] = userName;
		componentData['showHeader'] = true;
		//Added By Pratheek on 05-Aug-19[passing the userID so to get the tag data of specific users ]-End
        console.log("Create POPUP called");
       // createPopup(componentData, compType);
        createDashboardPopup(componentData, compType);
        console.log("Create POPUP after ");
        return true;
    }
}

function createDashboardPopup(componentData, compType)
{
    console.log("In Createdashboard");
    var index = window.location.pathname.indexOf('E12BROWSER');
    var dashboardView = false;
    var containerClass='angPopupContainer',contentClass='angPopupContent',closeBtnClass='angPopupclose';
    console.log("Index", index);

    if(index == -1)
    {
        containerClass='angMobPopupContainer';contentClass='angMobPopupContent';closeBtnClass='angMobPopupclose';
    }
    console.log("compType",compType);
    if(compType == 'dashboard')
	{
       containerClass='angPopupDContainer';
       contentClass='angPopupDContent';
       closeBtnClass='angularDclosebtn';

	}

    var popupContainer = document.createElement("div");
    popupContainer.className = containerClass;
    var popupContent = document.createElement("div");
    popupContent.className = contentClass;

    var popupContentTarget = document.createElement("div");
    popupContentTarget.id = componentData.targetId;

    var popupCloseBtn = document.createElement("button");
    popupCloseBtn.innerHTML = '<img src = simpleditorplugin/assets/images/svg/Close.svg>';
    popupCloseBtn.className = closeBtnClass;
    popupCloseBtn.onclick = function() {
      dashboardView = true;
      localStorage.setItem('DashboardView_',dashboardView);
      var dashboardValue = localStorage.getItem("DashboardView_");
      console.log("Dashboard140222:",dashboardValue);
      popupContainer.remove();
    }

    if(index == -1)
    {
        var popupCloseBtnCont = document.createElement("div");
        popupCloseBtnCont.className = 'angMobPopupCloseCont';
        popupCloseBtnCont.appendChild(popupCloseBtn);
        popupContainer.appendChild(popupCloseBtnCont);
    }
    else
    {
        popupContent.appendChild(popupCloseBtn);

    }
    popupContent.appendChild(popupContentTarget);

    popupContainer.appendChild(popupContent);

    document.getElementsByTagName('body')[0].appendChild(popupContainer);
    if(compType == 'dashboard')
    {
        loadAngularDashboard(componentData.componentName, JSON.stringify(componentData), null);
    }
    else
    {
        loadSimpleEditorComponent(componentData.targetId, JSON.stringify(componentData), null)
    }

    var divId = "ang-popup-"+componentData.componentName;
    console.log("divid23022",divId);
    var dbElemnt = document.getElementById(divId);
    console.log("dbElemnt",dbElemnt);
    dbElemnt.setAttribute("style","height:100%; position:absolute");

}
//Added by pankaj p for Open Dashboard in MyCalendar through Obj_links on 23-May-2022 [End]

// Added by Samruddhi to show dyanamic response in a popup window [Start]
function openPopup(componentHeader, componentResponse, popupPosition)
{
	var componentData = {};
	componentData['componentName'] = "open-popup";
	componentData['OBJ_NAME'] = "open-popup";
	componentData['targetId'] = "open-popup";
	componentData['popupData'] = componentResponse;
    var containerClass='popupContainer',contentClass='popupContent',headerClass = 'popupContent-assistant',maximizeClass = 'angPopupMaximize-assistant',popupHeadTitleClass='angPopupHeadTitle-assistant',closeButtonClass = 'angPopupClose-assistant',popupBodyClass = 'angPopupBody-assistant',closeBtnClass='angPopupclose';
	containerClass ='popupContainer-assistant';
	if(popupPosition == 'Right')
	{
		contentClass ='popupContent-assistant-right';
	}
	else if(popupPosition == 'Left')
	{
		contentClass ='popupContent-assistant-left';
	}
	else
	{
		contentClass ='popupContent-assistant';
	}
	headerClass = 'popupHeader-assistant';
	maximizeClass = 'popupMaximize-assistant'
	popupHeadTitleClass='popupHeadTitle-assistant';
	closeButtonClass = 'popupClose-assistant';
	popupBodyClass = 'popupBody-assistant';
	let isleftSidePanelOpen = false;
	var popupContainer = document.createElement("div");
    popupContainer.className = containerClass;
    var popupContent = document.createElement("div");
    popupContent.className = contentClass;
	popupContent.setAttribute("id","popupContentID")
	var popupHeader = document.createElement("div");
	popupHeader.className = headerClass;
	var popupMaximize  = document.createElement("div")
	popupMaximize.className = maximizeClass
	var popupMaximizeImg = document.createElement("img")
	popupMaximizeImg.src = "simpleditorplugin/assets/images/svg/Maximize.svg";
	popupMaximizeImg.setAttribute('height','12px');
	popupMaximizeImg.setAttribute('width','12px');
	popupMaximizeImg.setAttribute('margin','0px');
	popupMaximize.onclick = function()
	{
		if(document.getElementById("popupContentID") != null && isleftSidePanelOpen == false)
		{
			isleftSidePanelOpen = true
			var element = document.getElementById("popupContentID").style.width = "calc(100% - 40px)";
		}
		else if(document.getElementById("popupContentID") != null && isleftSidePanelOpen == true)
		{
			isleftSidePanelOpen = false
			var element = document.getElementById("popupContentID").style.width = "320px";
		}
	}
	var popupHeaderContent = document.createElement("div");
	popupHeaderContent.setAttribute('id','popupHeaderContentID');
	popupHeaderContent.setAttribute('style', 'width: calc(100% - 60px) !important;');
	var popupHeadTitle = document.createElement("div");
	popupHeadTitle.innerHTML = componentHeader;
	popupHeadTitle.setAttribute('id','popupHeadTitle');
	popupHeadTitle.className = popupHeadTitleClass;
	var popupClose = document.createElement("div");
	popupClose.className = closeButtonClass;
	var popupCloseImg = document.createElement("img");
	popupCloseImg.src = "simpleditorplugin/assets/images/Close.svg";
	popupCloseImg.setAttribute('height','12px');
	popupCloseImg.setAttribute('width','12px');
	popupCloseImg.setAttribute('margin','0px');
    popupCloseImg.innerHTML = '&times;';
	var popupBody = document.createElement("div")
	popupBody.className = popupBodyClass;
	popupBody.setAttribute("id",componentHeader);
    var popupContentTarget = document.createElement("div");
    popupContentTarget.id = componentData.targetId;
   	popupCloseImg.innerHTML = '&times;'
	popupClose.onclick = function() 
	{
		popupContainer.remove();
		if(compType != 'dashboard')
		{
			destroyComponent(componentData.componentName);
		}
	}
	popupContent.appendChild(popupHeader);
	popupHeader.appendChild(popupClose);
	popupHeader.appendChild(popupMaximize);
	popupMaximize.appendChild(popupMaximizeImg);
	popupHeader.appendChild(popupHeaderContent);
	popupHeaderContent.appendChild(popupHeadTitle);
	popupClose.appendChild(popupCloseImg);
	popupContent.appendChild(popupBody);
	popupBody.appendChild(popupContentTarget);
    popupContainer.appendChild(popupContent);
	document.getElementsByTagName('body')[0].appendChild(popupContainer);
	loadSimpleEditorComponent(componentData.targetId, JSON.stringify(componentData), null) 
}
// Added by Samruddhi to show dyanamic response in a popup window [Start]



//Added by pramod Shirke.
function XmlDoc(allFormResponseData)
{  
    var xmlDoc = '';
    if (window.DOMParser)
	{
	console.log('inside if XMLDOC function -> 1946',xmlDoc);
		parser=new DOMParser(); 
	    console.log('inside XMLDOC function -> 1948');		
		try
		{
			if(allFormResponseData != null && allFormResponseData.trim().length > 0)
			{
			    console.log('allFormResponseData ==> 1953'+allFormResponseData);
				xmlDoc = parser.parseFromString(allFormResponseData,"text/xml");
				console.log("xmlDoc =[",xmlDoc,"]");
			}

		}
		catch(ex)
		{
			alert("Exception occurs while parsing xml data");
		}
	}
	else // Internet Explorer
	{
	    console.log('inside else XMLDOC function');
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async=false;
		xmlDoc.loadXML(txt);
		console.log('inside else XMLDOC function',xmlDoc);
	}
	return xmlDoc;
}
//Added by pramod s for printLogic 
function updatePrintLog(xmlDoc, allFormResponseData, dataModelFileName, recvdBy) 
{
        console.log('inside Pluginwrapper js xmlDoc ==>',xmlDoc);
		console.log('allFormResponseData ==>',allFormResponseData);
		console.log('recvdBy ==>',recvdBy);
    var strgCode = '';
	var eventDate = '';
	var userId = localStorage.getItem('userName');
	console.log("user id: ",userId);
	var onSuccess = function(result)
	{
		console.log('result on success of data model :::', result);
		var dmList = localStorage.getItem('PRINT_DM_LIST');
		if(dmList != null && dmList.indexOf(dataModelFileName) == -1)
		{
			dmList = dmList + ',' + dataModelFileName;
		}
		else
		{
			dmList = dataModelFileName;
		}
		localStorage.setItem('PRINT_DM_LIST',dmList);
		var detailElement = xmlDoc.getElementsByTagName("Detail1");
		for (var i = 0; i < detailElement.length; i++)
		{
			var detail = detailElement[i];
			if( detail.getElementsByTagName("strg_code")[0] != null && detail.getElementsByTagName("strg_code")[0].childNodes[0] != null )
			{
				strgCode = detail.getElementsByTagName("strg_code")[0].childNodes[0].nodeValue;
				console.log('strgcode is:',strgCode);
			}
			if( detail.getElementsByTagName("event_date")[0] != null && detail.getElementsByTagName("event_date")[0].childNodes[0] != null )
			{
				eventDate = detail.getElementsByTagName("event_date")[0].childNodes[0].nodeValue;
				console.log('eventDate is:',eventDate);
			}
		}
		
		const dataModelJSONObj = JSON.parse(result);
		console.log("dataModelJSONObj:: ",dataModelJSONObj);

		var dataModelJSONArray = dataModelJSONObj.DETAILS
		
		for(var i = 0; i < dataModelJSONArray.length; i++)
		{
			const jsonObj = dataModelJSONArray[i];
			
			var customerID = jsonObj.Customer_Id != undefined ? jsonObj.Customer_Id : '';

			if(customerID == strgCode)
			{
				console.log('matched customerID::',customerID);
				let onPrintFailure = function(printErr)
				{
					console.log('Failure in getPrintData printErr:::', printErr);
				}

				let onPrintSuccess = function(printSuccess)
				{
					console.log('Success in getPrintData printSuccess:::', printSuccess);	
					if(jsonObj.Is_Printed == 'Y' && jsonObj.Event_Date == eventDate)
					{
						console.log("Inside if condition when printed second time");
						// var addDuplicateWaterMark = document.getElementById('water-mark-icon');
						// addDuplicateWaterMark.setAttribute('style','display:block;');
					}
					else
					{
						console.log("Inside if condition to update datamodel");
						jsonObj.Is_Printed = "Y";
						jsonObj.Event_Date = eventDate;
						var filePath = 'file:///data/user/0/ibase.android.Proteus/base/scopeData/'+userId+'/'+dataModelFileName; 	
						var updatedDataModel = JSON.stringify(dataModelJSONObj);
						console.log(" pluginerapper.js 2011 ");
						backUpAndWriteFile(filePath, updatedDataModel);//This will update the datamodel's data
						console.log(" pluginerapper.js 2013 ");
						// var addDuplicateWaterMark = document.getElementById('water-mark-icon');
						// addDuplicateWaterMark.setAttribute('style','display:none;');
					}
					
				}
				let printedTag = '<is_printed><![CDATA['+ (jsonObj.Is_Printed == 'Y' ? 'true' : 'false') +']]></is_printed>';
				let splitArr = allFormResponseData.split('</Detail1>');
				splitArr[1] = '</Detail1>'+splitArr[1];
				allFormResponseData = splitArr[0] + printedTag + recvdBy + splitArr[1];
				let formattedXML = allFormResponseData.replaceAll('"',"'");
				console.log('FormattedXML :::', formattedXML);
				window.plugins.printDocument.getPrintData(onPrintSuccess, onPrintFailure, formattedXML);
			}
		}	
	}
	
	var onFail = function(error)
	{
		console.log('error :::', error);
	}

	var getDataModelData = readFile('file:///data/user/0/ibase.android.Proteus/base/scopeData/'+userId+'/'+dataModelFileName,onSuccess,onFail);

}
//Added by pramod s for printLogic 
function createImpPopup(componentData, compType)
{
	var index = window.location.pathname.indexOf('E12BROWSER');
    var containerClass='angPopupContainer-import',contentClass='angPopupContent-import',closeBtnClass='angPopupclose-import';
    if(index == -1)
    {
        containerClass='angMobPopupContainer';contentClass='angMobPopupContent';closeBtnClass='angMobPopupclose';
    }
    if(compType == 'explore')
	{
       containerClass='angPopupContainer-explore';
       contentClass='angPopupContent-explore';
       closeBtnClass='angPopupclose-explore';
	}
	var closeImg ="closeImg-import"
    var popupContainer = document.createElement("div");
    popupContainer.className = containerClass;
    var popupContent = document.createElement("div");
    popupContent.className = contentClass;
    var popupContentTarget = document.createElement("div");
    popupContentTarget.id = componentData.targetId;

    var popupCloseBtn = document.createElement("div");
	var imgIcon = document.createElement("img");
	imgIcon.src = 'simpleditorplugin/assets/images/svg/VectorClose.svg'
	imgIcon.className = closeImg
	popupCloseBtn.appendChild(imgIcon);
    popupCloseBtn.className = closeBtnClass;
	popupCloseBtn.id = closeBtnClass;
    popupCloseBtn.onclick = function() {
      popupContainer.remove();
      if(compType == 'dashboard')
      {
        detroyDashboard(componentData.componentName);
      }
      else
      {
        destroyComponent(componentData.componentName);
      }

		if(componentData.contentData.objName)
	  {
			destroyComponent(componentData.contentData.objName);
		}
		else if(componentData.contentData.OBJ_NAME__IMP)
		{
			destroyComponent(componentData.contentData.OBJ_NAME__IMP);
	  }
    }

    if(index == -1)
    {
        var popupCloseBtnCont = document.createElement("div");
        popupCloseBtnCont.className = 'angMobPopupCloseCont';
        popupCloseBtnCont.appendChild(popupCloseBtn);
        popupContainer.appendChild(popupCloseBtnCont);
    }
    else
    {
        popupContent.appendChild(popupCloseBtn);
    }
    popupContent.appendChild(popupContentTarget);

    popupContainer.appendChild(popupContent);

    document.getElementsByTagName('body')[0].appendChild(popupContainer);
    if(compType == 'dashboard')
    {
        loadAngularDashboard(componentData.componentName, JSON.stringify(componentData), null);
    }
    else
    {
        try 
		{
			loadSimpleEditorComponent(componentData.targetId, JSON.stringify(componentData), null);
        } 
		catch (error) 
		{
	        console.log('error in loadSimpleEditorComponent:::',error);
			popupContainer.remove();
			alert('Unable to load the option. <br /> Please contact the system administrator.');
        }
    }
}