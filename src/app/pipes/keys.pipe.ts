import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {

  transform(value: any): string {
    return value ? Object.keys(value)[0] : ''; // pure pipe to get the key property to get right control for the visibleIf rule
  }

}
