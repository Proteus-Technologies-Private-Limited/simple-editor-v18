// customDateAdapter.ts
import { Injectable } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import moment from 'moment';

import { DateFormatService } from './date-format.service';

@Injectable()
export class CustomDateAdapter extends MomentDateAdapter
{
  constructor(private _dateFormatService: DateFormatService)
  {
    super(_dateFormatService.locale);
  }

  public override format(date: moment.Moment, displayFormat: string): string
  {
    const locale = this._dateFormatService.locale;
    const format = this._dateFormatService.format;

    const result = date.locale(locale).format(format);

    //console.log(`Reading date [local: '${ locale }'; format: '${ format }'; result: '${ result }']`);

    return result;
  }
  //Added By  Pravin K on 13-MAY-20[For mahual date entery] START
  override parse(value: any, parseFormat: string | string[]): moment.Moment | null {

    //console.log("parseFormat[",parseFormat,"],value[",value,"],_dateFormatService.format:",this._dateFormatService.format);
    if (value && typeof value === 'string') {
      return moment.utc(value, this._dateFormatService.format, this.locale, true);
    }
    return value ? moment.utc(value).locale(this.locale) : null;
  }
  //Added By  Pravin K on 13-MAY-20[For mahual date entery] START
}
