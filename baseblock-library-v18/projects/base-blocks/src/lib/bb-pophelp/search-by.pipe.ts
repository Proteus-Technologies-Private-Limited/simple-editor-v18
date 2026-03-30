import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchBy'
})
export class SearchByPipe implements PipeTransform {
  
    
    transform(fields: any[], searchText: string, searchByValue?:boolean): any[] {
            
            if (!fields || fields.length == 0) return [];
            if(!searchText) return fields;
            return fields.filter(
                  field => {
                    //Old Commented
                    // return ( ( field.value.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ) );
                    //Added by Sainath T. [To filter on label] - Start
                    if(searchByValue)
                    return  ( field.label.toLowerCase().indexOf(searchText.toLowerCase()) > -1 );
                    else if(field.label)
                    return  ( field.label.toLowerCase().indexOf(searchText.toLowerCase()) > -1 );
                    else
                    return  ( field.value.toLowerCase().indexOf(searchText.toLowerCase()) > -1 );
                    //Added by Sainath T.[To filter on label] - End
                 }
            );
    }
}
