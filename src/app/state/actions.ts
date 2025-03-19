import { createAction, props } from '@ngrx/store';
import { FormBase } from '../models/form-base';

// Decribe all actions which are dispatched by component
export const autoSaveForm = createAction(
  '[Form] Auto Save',
  props<{ formData: FormBase[] }>()
);

export const saveSubmitedtData = createAction(
  '[Form] Submit Values',
  props<{ formSubmissionData: any }>()
)