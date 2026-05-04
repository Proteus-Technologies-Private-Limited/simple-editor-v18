import { HttpClient }          from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'currencyformat'
})
export class CurrencyFormatPipe implements PipeTransform {

  constructor(private http: HttpClient) { }

  formattedCurrency:any;

  transform(val?: any[], typeStr?: string, column?: string, columnDesc?: string): any {
      console.log('In currencyformat pipe transform >>', val, typeStr,  column, columnDesc);

      if( val ) {
         this.formattedCurrency =  '\u20B9 ' + this.numConversion( val );
      }
      console.log('formattedCurrency >>>',this.formattedCurrency);

      return this.formattedCurrency;
  }

  numConversion(val:any) {
      console.log('val >>>',val);
      if (val >= 10000000) val = (val / 10000000).toFixed(2) + ' Cr';
      else if (val >= 100000) val = (val / 100000).toFixed(2) + ' Lac';
      else if (val >= 1000) val = (val / 1000).toFixed(2) + ' K';
      console.log('val #2 >>>', val);

      return val;
  }

}
