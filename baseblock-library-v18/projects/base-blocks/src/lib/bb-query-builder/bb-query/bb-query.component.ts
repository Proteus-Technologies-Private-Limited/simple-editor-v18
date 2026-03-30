import { Component, OnInit, Input, Injectable } from '@angular/core';

export interface Query {
  condition: string;
  rules: ({} | Query)[];
}

@Component({
  selector: 'bb-query',
  templateUrl: './bb-query.component.html',
  styleUrls: ['./bb-query.component.css']
})
export class QueryComponent implements OnInit {

  @Input() query: Query | any;
  objectKeys = Object.keys;

  constructor() { }

  ngOnInit() {
  }
  
}