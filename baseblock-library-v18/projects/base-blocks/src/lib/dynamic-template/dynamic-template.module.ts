import { Compiler, COMPILER_OPTIONS, CompilerFactory, NgModule } from '@angular/core';

import { DynamicTemplateComponent } from './dynamic-template.component';
import {JitCompilerFactory} from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';

export function createCompiler(compilerFactory: CompilerFactory) {
   console.log('compilerFactory',compilerFactory)
   return compilerFactory.createCompiler();
}

@NgModule({
  declarations: [DynamicTemplateComponent],
  imports: [BrowserModule],
  exports: [DynamicTemplateComponent],
  providers: [
     { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
     { provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS] },
     { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] }
  ]
})
export class DynamicTemplateModule { }
