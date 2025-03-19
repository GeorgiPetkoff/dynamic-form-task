import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormBase } from '../../models/form-base';
import { ApiService } from '../../services/api.service';
import { distinctUntilChanged, Observable, shareReplay } from 'rxjs';
import { Country } from '../../models/country';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { KeysPipe } from "../../pipes/keys.pipe";
import { Store } from '@ngrx/store';
import { autoSaveForm, saveSubmitedtData } from '../../state/actions';
import { selectFormData, selectSubmittedData } from '../../state/selector';
import { cloneDeep } from 'lodash';


@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, MatSelectModule, CommonModule, KeysPipe],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})

export class DynamicFormComponent implements OnInit, OnChanges{
  @Input() formData!: FormBase[]; // JSON field which come form app.component to apply dynamic form logic
  dynamicForm!: FormGroup;
  lstCountries!: Observable<Country[]>
  formData$: Observable<FormBase[]>;
  submittedData$: Observable<any>;
  submitError = false;
  constructor(private apiService: ApiService, private fb: FormBuilder, private store: Store){
    this.formData$ = this.store.select(selectFormData); // initilize my observables from selectors which will get the data when some data is provided
    this.submittedData$ = this.store.select(selectSubmittedData);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formData'] && changes['formData'].currentValue !== changes['formData'].previousValue) { // here is double check with distinctUntilChanged not to rebuild my form until the JSON is really changed
      this.store.dispatch(autoSaveForm({ formData: cloneDeep(changes['formData'].currentValue) })); // dispatch the auto save to the global store when the JSON is changed, using to cloneDeep because i override some fields messages to show on form to the global state management and not to cause reference changes
      this.buildForm();
      this.dynamicForm.updateValueAndValidity();
    }
  }

  ngOnInit(): void {
    this.buildForm();

    this.formData$.subscribe( // only for demonstrations for the subscriptions which will show datas when they are changed
      result => {
        console.log('Form Data Result',result);
      }
    )
    this.submittedData$.subscribe(
      result => {
        console.log('Form Submission Data Result',result);
      }
    )
  }
    buildForm() {
    let group: any = {};
    this.formData.forEach((field: FormBase) => {
      if(field.optionsFromApi){
        if(field.name == 'country'){ // becouse i know that there is options from api for country i use 
          this.lstCountries = this.apiService.getCountries(field.optionsFromApi).pipe(shareReplay(1)); // I assign to observable lstCountry which will hold countries and i use shareReplay operator to prevent call multuple api request if from JSON came duplicating urls.
        } else if(!field.visibleIf && !field.validations?.dependsOn){ // here will be dynamic call to get options for api
          this.apiService.getOptions(field.optionsFromApi).pipe(shareReplay(1)).subscribe(
            result => {
              if(result) {
                field.options = result;
              }
            }
          )
        }
      }
      if (field.type === 'group') {
        let nestedGroup: any = {};
        field.fields?.forEach((nestedField: FormBase) => { 
          nestedGroup[nestedField.name] = new FormControl('', this.getValidations(nestedField)); //set controls with basic validations
        });
        group[field.name] = this.fb.group(nestedGroup);
      } else {
        group[field.name] = new FormControl('', this.getValidations(field));
      }
    });
    this.dynamicForm = this.fb.group(group);
    this.addConditionalLogic(); // function which will apply dynamic conditional logic
  }

  addConditionalLogic() {
    this.formData.forEach(field => {
      if (field.visibleIf) { // check for not nested fields for having visibleIf rule
        const conditionKey = Object.keys(field.visibleIf)[0];  // get dependent name of the control 
        const conditionControl = this.dynamicForm.get(conditionKey) ? this.dynamicForm.get(conditionKey) : this.dynamicForm.get(field.name)?.get(conditionKey); // searching for this control in fields or in nested fields
        if (conditionControl) { // if control is found
          conditionControl.valueChanges.pipe(distinctUntilChanged()).subscribe(value => { // subscribe to this control to get the value which will be depenand
            const expectedValue = field.visibleIf?.[conditionKey];  // expected dependent field
            const shouldBeVisible = value === expectedValue;  // if the value equals search dependent field value for showing the control
            this.toggleFieldValidationByVisabillity(field, shouldBeVisible); // function to add validations for new shown control
          });
        }
      }
      if(field.type != 'group'){
        if (field.validations?.dependsOn) { // check to add dynamic validation to control based on other field on not nested fields
          const control = this.dynamicForm.get(field.validations?.dependsOn); // find control of dependent field 
          if (control) {
            control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => { // subscribe to the values of dependent field
              this.applyDynamicLogic(field, value); // function to apply conditional dynamic validation based on dependent field
            });
          }
        } 
      } else {
        field.fields?.forEach(nestedField => {
          if (nestedField.visibleIf) { // check for nested fields for having visibleIf rule
            const conditionKey = Object.keys(nestedField.visibleIf)[0];
            const conditionControl = this.dynamicForm.get(conditionKey) ? this.dynamicForm.get(conditionKey) : this.dynamicForm.get(field.name)?.get(conditionKey);
            if (conditionControl) {
              conditionControl.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
                const expectedValue = nestedField.visibleIf?.[conditionKey];  
                const shouldBeVisible = value === expectedValue;
                this.toggleFieldValidationByVisabillity(nestedField, shouldBeVisible, field.name );
              });
            }
          } 
          if (nestedField.validations?.dependsOn) {  // check to add dynamic validation to control based on other field on nested fields
            const control = this.dynamicForm.get(field.name)?.get(nestedField.validations?.dependsOn);
            if (control) {
              control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
                this.applyDynamicLogic(field, value, nestedField);
              });
            }
          }

        })
      }
    });
  }

  toggleFieldValidationByVisabillity(field: FormBase, shouldBeVisible: boolean, parentGroup?: string) {
    const controlPath = parentGroup ? `${parentGroup}.${field.name}` : field.name;
    const control = this.dynamicForm.get(controlPath);
  
    if (control) {
      if (shouldBeVisible) { // applying validation for new shown fields
          if(control instanceof FormGroup){  // if it is group
            Object.keys(control.controls).forEach(key => {
              const nestedField = field.fields?.find(field =>field.name == key);
              if(nestedField?.required){
                control.controls[key].addValidators(Validators.required);
                control.controls[key].updateValueAndValidity({ onlySelf: true, emitEvent: false });
              }
              if(nestedField?.validations?.pattern){
                control.controls[key].addValidators(Validators.pattern(nestedField?.validations?.pattern));
                control.controls[key].updateValueAndValidity({ onlySelf: true, emitEvent: false });
              }
            });
          } else {
            if(field.required){
              control.addValidators(Validators.required);
              control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            }
            if(field.validations?.pattern){
              control.addValidators(Validators.pattern(field.validations?.pattern));
              control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            }
          }
      } else { // new hidden controls will be reset and clear validation not to cause problem on background with validity
        control.reset();
        if(control instanceof FormGroup){
          control.reset();
          control.clearValidators();
          control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
          Object.keys(control.controls).forEach(key => {
            control.controls[key].clearValidators();
            control.controls[key].reset();
            control.controls[key].updateValueAndValidity({ onlySelf: true, emitEvent: false });;
          });
        } else {
          control.clearValidators();
          control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
      }
    }
  }

  // function to apply conditional dynamic validation based on dependent field
  applyDynamicLogic(field: FormBase, value: any, nestedFieldForValidation?: FormBase){
    if(field.type != 'group'){
      if(field.validations?.rules?.[value]){
        if(field.validations?.rules?.[value].pattern){
          this.dynamicForm.get(field.name)?.addValidators(Validators.pattern(field.validations?.rules?.[value].pattern));
          field.validations.message = field.validations?.rules?.[value].message;
          this.dynamicForm.get(field.name)?.updateValueAndValidity({ onlySelf: true, emitEvent: false }); // update only changed control, and not to trigger value and status changes
        }
      }
      if(field.optionsFromApi){ // condition for dropdowns which depends on other field and have his options from api request
        if(field.required){ // check and set if dropdown is required
          this.dynamicForm.get(field.name)?.addValidators(Validators.required);
          this.dynamicForm.get(field.name)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this.apiService.getOptions(field.optionsFromApi.replace('{value}', value)).subscribe(
          result => {
            if(result){
              field.options = result.map(result => result.name); // mapping only name to keep dynamism
            }
          }
        )
      } 
    } else {
      if(nestedFieldForValidation?.validations?.rules?.[value]){
        if(nestedFieldForValidation?.validations?.rules?.[value].pattern){
          this.dynamicForm.get(field.name)?.get(nestedFieldForValidation.name)?.addValidators(Validators.pattern(nestedFieldForValidation?.validations?.rules?.[value].pattern));
          nestedFieldForValidation.validations.message = nestedFieldForValidation?.validations?.rules?.[value].message;
          this.dynamicForm.get(field.name)?.get(nestedFieldForValidation.name)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
      }
      if(nestedFieldForValidation?.optionsFromApi){ // condition for nested dropdowns which depends on other field and have his options from api request
        if(nestedFieldForValidation?.required){ 
          this.dynamicForm.get(`${field.name}.${nestedFieldForValidation.name}`)?.addValidators(Validators.required);
          this.dynamicForm.get(`${field.name}.${nestedFieldForValidation.name}`)?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        }
        this.apiService.getOptions(nestedFieldForValidation.optionsFromApi.replace('{value}', value)).subscribe(
          result => {
            if(result){
              nestedFieldForValidation.options = result.map(result => result.name);
            }
          }
        )
      } 
    }

  }
  //function for simple validations without dependencies like dependsOn and visibleIf
  getValidations(field: FormBase) {
    let validations: ValidatorFn[] = [];
    if(!field.validations?.dependsOn && !field.visibleIf){
      if (field.required) validations.push(Validators.required);
      if (field.validations?.pattern) validations.push(Validators.pattern(field.validations.pattern));
    }
    return validations;
  }

  submit(){
    this.submitError = true;
    if(this.dynamicForm.valid){
      this.store.dispatch(saveSubmitedtData({ formSubmissionData: this.dynamicForm.getRawValue() }));
      this.submitError = false;
    }
  }
}
