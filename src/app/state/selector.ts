import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FormBase } from '../models/form-base';

export interface AutoSaveState {
  formData: FormBase[];
  formSubmissionData: any;
}

export const selectAutoSaveState = createFeatureSelector<AutoSaveState>('autoSave'); // create feature selector to get access to the state

export const selectFormData = createSelector( // here I create selector to get last formData from the global store
  selectAutoSaveState,
  (state: AutoSaveState) => state.formData
);

export const selectSubmittedData = createSelector( // here I create selector to get last submitted data from the global store
  selectAutoSaveState,
  (state: AutoSaveState) => state.formSubmissionData
);