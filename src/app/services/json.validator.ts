import { AbstractControl, ValidationErrors } from '@angular/forms';

export function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  try {
    JSON.parse(control.value);
    return null;
  } catch (e) {
    return { invalidJson: true };
  }
}