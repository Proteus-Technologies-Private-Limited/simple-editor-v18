
declare var getLoginDetails : any;
export function getAuthParams() {
    var authParams = '';
    var hostUrl = getHostURL();
    if(hostUrl)
    {
        var params = getLoginDetails();
        params = JSON.parse(params);
        authParams = 'USER=' + params.USER + '&PASSWORD=' + params.PASSWORD; 
        console.log( 'getAuthParams[', authParams, ']' );
    }
    return authParams;
}

export function getHostURL() {
        var HOST_URL: string = '';
        HOST_URL = localStorage.getItem( 'HOST_URL' );
        // HOST_URL = JSON.parse(localStorage.getItem( 'HOST_URL' )||"{}");
        if ( !HOST_URL ) HOST_URL = '';
        console.log( 'getHostURL[', HOST_URL, ']' );
        return HOST_URL;
}

export function getAssetImgUrl() {
    var ASSET_IMG_URL = "simpleditorplugin/assets/images";
    var hostUrl = getHostURL();
    if(!hostUrl){
        ASSET_IMG_URL = "/ibase/E12BROWSER/"+ASSET_IMG_URL;
    }
    console.log('ASSET_IMG_URL:: ',ASSET_IMG_URL);
    
    return ASSET_IMG_URL;
}
    
export function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os: any = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }
    
    console.log('Current OS ::',os);
    return os;
  }

export function setOverlayPos(){
    if(getHostURL() && getOS() == "iOS"){
        console.log('Setting Overlay Position in iOS');
        var rootElem = <HTMLElement>document.querySelector(':root');
        rootElem.style.setProperty('--overlay-position', 'relative');
    }
}

