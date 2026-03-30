import { Injectable } from "@angular/core";
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from "@angular/material/core";

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {

    // parse(value: any): Date | null {
    override parse(value: any): Date | null {
        console.log('Inside parse in dateAdapter:::9 ', value);
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
            const str = value.split('/');
            // console.log('Inside parse in dateAdapter::: str  ', str);
            const year = Number(str[2]);
            // console.log('Inside parse in dateAdapter::: year  ', year);
            const month = Number(str[1]) - 1;
            // console.log('Inside parse in dateAdapter::: month  ', month);
            const date = Number(str[0]);
            // console.log('Inside parse in dateAdapter::: date  ', date);
            return new Date(year, month, date);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        // console.log('Inside parse in dateAdapter::: 22  ', isNaN(timestamp) ? null : new Date(timestamp));
        return isNaN(timestamp) ? null : new Date(timestamp);
    }
    // format(date: Date, displayFormat: string): string {
    override format(date: Date, displayFormat: string): string {
        // console.log('Inside format in dateAdapter::: date & displayFormat  ',date ,' ', displayFormat );
        if (displayFormat == "input") {
            let day = date.getDate();
            // console.log('Inside format in dateAdapter::: day  ', day);
            let month = date.getMonth() + 1;
            // console.log('Inside format in dateAdapter::: month  ', month);
            let year = date.getFullYear().toString();
            // console.log('year.dt class==', year);
            year = year.toString().substring(2);
            // console.log('Inside format in dateAdapter::: year', year);
            // console.log('Inside format in dateAdapter::: 43', this._to2digit(day) + '/' + this._to2digit(month) + '/' + year);
            return this._to2digit(day) + '/' + this._to2digit(month) + '/' + year;
        } 
        else if (displayFormat == "inputMonth") {
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            // console.log('Inside format in dateAdapter::: 49', this._to2digit(month) + '/' + year);

            return this._to2digit(month) + '/' + year;
        } 
        else 
        {
            // console.log("'Inside format in dateAdapter::: 55", date)
            return date.toDateString();
        }
    }

    private _to2digit(n: number) {
        return ('00' + n).slice(-2);
    }
}

export const APP_DATE_FORMATS =
{
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
    },
    display: {
        // dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
        dateInput: 'input',
        // monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        monthYearLabel: 'inputMonth',
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
}