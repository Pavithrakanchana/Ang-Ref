export class DropDown {
   value!: string;
   viewValue!: string;
   constructor(values: Object = {}) {
      Object.assign(this, values);
   }
}