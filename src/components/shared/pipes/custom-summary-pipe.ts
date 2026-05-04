import { HttpClient }          from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'customSummary'
})
export class CustomSummaryPipe implements PipeTransform {
  private cachedData: any = null;
  private cachedUrl = '';

  constructor(private http: HttpClient) { }

  transform(list?: any[], typeStr?: string, column?: string | any, columnDesc?: string | any ): any {
    console.log(':: list in SummaryCountPipe',list,typeStr,column,columnDesc);

    var countList:any = {};
    var types:any;
    var summaryStr:any = '';
    
    if(typeStr){
        types = typeStr.split(',');
    }

    if(list && types) {
          types.forEach(
            (type: any) => {
              var typeList:any = list.filter((meet: any) => meet[column] == type);
              var typeCount = 0;
              var typeDesc='';
              if(typeList){
                  typeCount = typeList.length;
              }
              countList[type] = typeCount;

              if(typeCount > 0){
                typeDesc=(typeList[0])[columnDesc];
                if(summaryStr){
                  summaryStr = summaryStr + ', ';
                }
                if(typeCount > 1 && type != 'MISSED'){
                  summaryStr = summaryStr + typeCount + ' ' + typeDesc  + 'S';
                }else {
                  summaryStr = summaryStr + typeCount + ' ' + typeDesc;
                }
              }

            }
          );
          console.log('Final List',countList);
          console.log('Final summaryStr :['+summaryStr+']');
      }

      return summaryStr;
  }
}
