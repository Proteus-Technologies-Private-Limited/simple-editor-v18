import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calculateTotal',
  pure: true
})
export class CalculateTotal implements PipeTransform {
  
    //added defineCellsTotalIndxArrForQty by sainath T. to calculate Qty footer total in case of sell plan
    transform(changeval:any,startRow: number,dataSource:any,defineCellsTotalIndxArr:any[],displayColNameLst:any[], freezColumns:any, definedCellTotalUpdates:boolean, defineCellsTotalIndxArrForQty:any[]): any {
      var endRow = startRow;
      var value: any = null;
      var defineCellsTotalFlag = false;
      var defineCellsTotalFlagForQTY = false;
      var footerTotalValueFlag = false;

      const dataCopy : any[] = dataSource;
       if(defineCellsTotalIndxArr.length > 0 && displayColNameLst.toString().indexOf('_TOTAL') != -1)
       {
          defineCellsTotalFlag = true;
       }
       
       for(let i = startRow; i <= endRow; i++)
        {
          for(let j = freezColumns; j <= displayColNameLst.length -2 ; j++) 
          {
            if( defineCellsTotalFlag && defineCellsTotalIndxArr.includes(j))
            {
              defineCellsTotalFlagForQTY = false;
              if(startRow >= dataCopy.length-2)
              {
                footerTotalValueFlag = true;
              }

              if(dataCopy[i][displayColNameLst[j]] != undefined)
              {
                value = value + Number(dataCopy[i][displayColNameLst[j]]);
              } 
            }
            //Sainath T on 10/04/2020 - for Qty footer Total -Start
            else if(defineCellsTotalFlag && (startRow >= dataCopy.length-4 && startRow <= dataCopy.length-3 ) && defineCellsTotalIndxArrForQty.includes(j))
            {
              footerTotalValueFlag = false;
              defineCellsTotalFlagForQTY = true;
              if(dataCopy[i][displayColNameLst[j]] != undefined)
              {
                value = value + Number(dataCopy[i][displayColNameLst[j]]);
              }
            }
            //Sainath T on 10/04/2020 - for Qty footer Total -End
            else if(!defineCellsTotalFlag)
            {
              footerTotalValueFlag = false;
              defineCellsTotalFlagForQTY = false;
              if(dataCopy[i][displayColNameLst[j]] != undefined)
              {
                value = value + Number(dataCopy[i][displayColNameLst[j]]);
              } 
            }
          }
        }
        if(defineCellsTotalFlagForQTY)
        {
          return Number(value);
        }
        else
        {
          value = definedCellTotalUpdates && !footerTotalValueFlag? (Number(value)/1000) : Number(value);
          return (Number(value)).toFixed(2);
        }
      }
    
}
