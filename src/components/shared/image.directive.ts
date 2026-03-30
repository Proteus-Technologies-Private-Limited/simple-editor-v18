import { Directive, Input, OnChanges, HostBinding, HostListener,NgModule } from '@angular/core';

@Directive({
selector: "img[customImage]",
host: {
    '(error)': 'onError()'
}
})
export class ImageDirective implements OnChanges
{
/*
errorImage: '',
hostUrl : 'http://52.77.104.70:9090',
fldValue : 'A00001',
altFldValue : 'Abc Xyz',
docAttachType : 'Icon',
objName : 'product / strg_customer',
object : 'User / Product / StrgCustomer folder name'
*/
@Input('customImage') config: any;

@HostBinding('src') imagePath!: string;
//@HostBinding('onError')
public onError(){
    console.log('onError setting error image : ', this.config.errorImage);
    this.imagePath = this.config.errorImage;
}
customImagePath: string = '/ibase/CustomMenuImageServlet?';

ngOnChanges() 
{
if (this.config) 
{
var imageUrl = '';
imageUrl = imageUrl.concat(this.config.hostUrl).concat(this.customImagePath);
imageUrl = imageUrl.concat('fldValue=').concat(this.config.fldValue);
imageUrl = imageUrl.concat('&ALT_FLD_VALUE=').concat(this.config.altFldValue);
imageUrl = imageUrl.concat('&objName=').concat(this.config.objName);
imageUrl = imageUrl.concat('&object=').concat(this.config.object);
imageUrl = imageUrl.concat('&docAttachType=').concat(this.config.docAttachType);
this.imagePath = imageUrl;
//console.log('this.imagePath =', this.imagePath );
}
}
}
