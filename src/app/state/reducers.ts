import { createReducer, on } from '@ngrx/store';
import { autoSaveForm, saveSubmitedtData } from './actions';
import { AutoSaveState } from './selector';

export const initialState: AutoSaveState = {
  formData: [],
  formSubmissionData: null
};

export const autoSaveReducer = createReducer(
  initialState,
  on(autoSaveForm, (state, { formData }) => ({ // create reducer to dispatch formData to be saved in the global store 
    ...state,
    formData
  })),

  on(saveSubmitedtData, (state, { formSubmissionData }) => ({ // create reducer to dispatch formSubmissionData to be saved in the global store 
    ...state,
    formSubmissionData
  })),
);
