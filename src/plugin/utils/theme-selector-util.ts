import { ComponentRef, EventEmitter } from '@angular/core';

import { BBPlugin } from '../core/bb-plugin';
import { BBPluginMetadata } from '../core/bb-plugin.metadata';
import { BBPluginLoader } from '../core/bb-plugin-loader';
import { getOS } from 'src/components/shared/hostUrl';

// 
export const PluginMetadata = BBPluginMetadata;

//

var themes: any = {
        "blue" : "#7bc6ff",
        "gray" : "#666666",
        "purple" : "#ccb4fc",
        "green" : "#5fdeb2",
        "orange" : "#ffaf84",
        "violet" : "#b4adee",
        "red" : "#ffaf84"
 }

//Added by Prasad [To apply gradient effect] on 16-07-19
var gradientThemes: any = {
    "blue" : "#68beff",
    "orange" : "#fb9f6e",
    "violet" : "#a79fec",
    "green" : "#38c796",
    "gray" : "#555555",
    "purple" : "#a79fec",
    "red" : "#fb9f6e"
}

var darkThemes: any = {
    "blue" : "#1556C2",
    "orange" : "#CE8A00", 
    "violet" : "#8E6FB3",
    "green" : "#158E6A",
    "gray" : "#252525",
    "purple" : "#8E6FB3",
    "red" : "#CF3E33"
}

export function changeTheme(color: any){
    //console.log(event.target.value);
    //var color = event.target.value;
    var themeColor= color ? color.toLowerCase() : 'blue';
    console.log("themeColor ============>",themeColor);
    var rootElem = <HTMLElement>document.querySelector(':root')
    rootElem.style.setProperty('--primary', themes[themeColor])
    //Added by Prasad [To apply gradient effect] on 16-07-19
    rootElem.style.setProperty('--primaryGradient', gradientThemes[themeColor]);
    //Added by Sainath T. on 27-06-19 [To get the theme color if angular component called from JSP]
    localStorage.setItem('themeColor',themes[themeColor]);
    localStorage.setItem('themeColorCode',themeColor);
    /* Added by Sainath T. on 30-9-2020 [for angular footer component text color] */
    rootElem.style.setProperty('--primaryDark', darkThemes[themeColor]);
}

export function changeThemeColor(colorCode: any){
    //console.log(event.target.value);
    //var color = event.target.value;
    //Added by Prasad [To apply gradient effect] on 16-07-19
    //Chnaged by Sainath T. on 18-SEp-2019 [ To set themecolor if colorcode is undefined] - Start
    console.log("changeThemeColor is called =======");
    var themeColorCode : string | any= localStorage.getItem('themeColorCode');
    if(themeColorCode)
    {
        themeColorCode = themeColorCode.toLowerCase();
    }
    else{
        themeColorCode = 'blue';
    }
    console.log("themeColorCode ============>",themeColorCode);
    var colorCode_ = colorCode;
    console.log("colorCode============>",colorCode);
    if(!colorCode || colorCode == undefined || colorCode == 'undefined')
    {
        colorCode_ = themes[themeColorCode];
    }
    console.log("colorCode_ ============>",colorCode_);
    //Chnaged by Sainath T. on 18-SEp-2019 [ To set themecolor if colorcode is undefined] - End
    var rootElem = <HTMLElement>document.querySelector(':root')
    rootElem.style.setProperty('--primary', colorCode_);
    //Added by Prasad on 23/08/19 [to set color in ios] START
    var tempThemeColor = getOS() == 'iOS' ? 'blue' : 'blue';
    console.log("tempThemeColor ============>",tempThemeColor);
    themeColorCode = (themeColorCode != null && themeColorCode != "")? themeColorCode : tempThemeColor;
    //Added by Prasad on 23/08/19 [to set color in ios] END
    rootElem.style.setProperty('--primaryGradient', gradientThemes[themeColorCode]);
    /* Added by Sainath T. on 30-9-2020 [for angular footer component text color] */
    rootElem.style.setProperty('--primaryDark', darkThemes[themeColorCode]);
}
