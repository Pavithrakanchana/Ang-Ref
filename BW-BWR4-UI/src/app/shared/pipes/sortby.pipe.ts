import { Pipe, PipeTransform } from '@angular/core';

export type SortOrder = 'asc' | 'desc';

@Pipe({
  name: 'sort'
})
export class SortbyPipe implements PipeTransform {

  transform(value: any[], sortOrder: SortOrder | string = 'asc', sortKey?: string): any {
    sortOrder = sortOrder && (sortOrder.toLowerCase() as any);

    if (!value || (sortOrder !== 'asc' && sortOrder !== 'desc')) { return value; }

    let sortedArray = [];

    if (!sortKey) {
      // numberArray = value.filter(item => typeof item === 'number').sort();
      sortedArray = value.sort();
    } else {
      /*numberArray = value
        .filter(item => typeof item[sortKey] === 'number')
        .sort((a, b) => a[sortKey] - b[sortKey]);*/
        sortedArray = value.sort((a, b) => {

          if (a[sortKey].indexOf('/') === -1) {
            if (a[sortKey] < b[sortKey]) { return -1; }
            else if (a[sortKey] > b[sortKey]) { return 1; }
            else { return 0; }
          } else {
            const date1 = new Date(a[sortKey]);
            const date2 = new Date(b[sortKey]);


            if (date1 > date2) {
              return 1;
            } else if (date1 < date2) {
              return -1;
            } else {
              return 0;
            }
          }
        });
    }
    return sortOrder === 'asc' ? sortedArray : sortedArray.reverse();
  }

}
