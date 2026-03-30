import { Injectable } from "@angular/core";

@Injectable()
export class BBPluginMetadata {  

  dataMap: any = {};

  constructor() { }

  put( key : string, value : string ) : string
	{
    //console.log( 'this.dataMap : ', this.dataMap );
    return this.dataMap[key] = value;
	}
  
  get( key : string ) : string
	{
		return this.dataMap[key];
  }

  remove( key : string ) 
	{
		delete this.dataMap[key];
  }

  print() {
    console.log( 'this.dataMap : ', this.dataMap );
  }

}

