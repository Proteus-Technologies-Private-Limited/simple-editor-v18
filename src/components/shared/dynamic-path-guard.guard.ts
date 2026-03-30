import { Injectable, Component } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { parseUrlPathInSegments } from './url-path-parser';

@Injectable({
  providedIn: 'root'
})
export class DynamicPathGuard  {
    constructor(private router: Router) { }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

      const segments = parseUrlPathInSegments(state.url);   
      const lastPath = segments.pop();
      const authPaths: any = ['assocObjects', 'assocTransactions', 'ManagerComponent'];
      
      console.log('In DynamicPathGuardGuard',lastPath);

      // if (authPaths.indexOf(lastPath) > -1) { 
        if (authPaths.indexOf(lastPath) > -1) {       
        setTimeout(()=>{
           this.router.navigateByUrl(state.url);  
        },0);
      } else {
        console.log('Path Not Available');
      }

      return false;
    }
}
