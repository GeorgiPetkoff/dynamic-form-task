import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FormBase } from '../../models/form-base';
import { ApiService } from '../../services/api.service';
import { Observable, shareReplay } from 'rxjs';
import { Country } from '../../models/country';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, MatSelectModule, CommonModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})

export class DynamicFormComponent implements OnInit{
  @Input() formData!: FormBase[];
  dynamicForm!: FormGroup;
  lstCountries!: Observable<Country[]>

  constructor(private apiService: ApiService, private fb: FormBuilder){}

  ngOnInit(): void {
    this.buildForm();
    console.log('form',this.dynamicForm);
  }
    buildForm() {
    let group: any = {};
    this.formData.forEach((field: FormBase) => {
      if(field.name == 'country' && field.optionsFromApi){
        this.lstCountries = this.apiService.getCountries(field.optionsFromApi).pipe(shareReplay(1))
      }
      if (field.type === 'group') {
        let nestedGroup: any = {};
        field.fields?.forEach((nestedField: FormBase) => { 
          nestedGroup[nestedField.name] = new FormControl('', this.getValidations(field));
        });
        group[field.name] = this.fb.group(nestedGroup);
      } else {
        group[field.name] = new FormControl('', this.getValidations(field));
      }
    });
    this.dynamicForm = this.fb.group(group);
    this.addConditionalLogic();
  }

  addConditionalLogic() {
    // var conditionKey = '';
    this.formData.forEach(field => {
      // console.log('which control will find',field);
      // if (field.visibleIf && conditionKey != Object.keys(field.visibleIf)[0]) {
      //   conditionKey = Object.keys(field.visibleIf)[0];
      //   console.log('visibility fileds', field.name, conditionKey)
      //   const conditionControl = this.dynamicForm.get(conditionKey) ? this.dynamicForm.get(conditionKey) : this.dynamicForm.get(field.name)?.get(conditionKey);
      //   console.log('control which depends on other but dont have other',conditionControl)
      //   if (conditionControl) {
      //     conditionControl.valueChanges.subscribe(value => {
      //       console.log('asd',field.visibleIf?.[value])
      //       if(field.visibleIf?.[value])
      //           console.log('value change',field)
      //     });
      //   }
      // }
      if(field.type != 'group'){
        if (field.validations?.dependsOn) {
          // console.log('which control will find not group',field.validations?.dependsOn);
          const control = this.dynamicForm.get(field.validations?.dependsOn);
          if (control) {
            control.valueChanges.subscribe(value => {
              this.applyDynamicLogic(field, value);
            });
          }
        } 
      } else {
        field.fields?.forEach(nestedField => {
          // if (field.visibleIf) {
          //   const conditionKey = Object.keys(field.visibleIf)[0];
          //   console.log('visibility fileds', field.name, field.visibleIf, nestedField.visibleIf)
          //   const conditionControl = conditionKey == field.name && !field.visibleIf ? this.dynamicForm.get(conditionKey) : this.dynamicForm.get(field.name)?.get(conditionKey);
          //   console.log('control which depends on other but dont have other',conditionControl)
  
          //   if (conditionControl) {
          //     conditionControl.valueChanges.subscribe(value => {
          //       console.log('value change',value)
          //     });
          //   }
          // }
          if (nestedField.validations?.dependsOn) {
            // console.log('which control will find group',nestedField.validations?.dependsOn);
            const control = this.dynamicForm.get(field.name)?.get(nestedField.validations?.dependsOn);
            if (control) {
              control.valueChanges.subscribe(value => {
                this.applyDynamicLogic(field, value, nestedField);
              });
            }
          } 
        })
      }
    });
  }
  applyDynamicLogic(field: FormBase, value: any, nestedFieldForValidation?: FormBase){
    if(field.type != 'group'){
    console.log('here to apply the validation logic not group',field.validations?.rules, value);
      if(field.validations?.rules?.[value]){
        if(field.validations?.rules?.[value].pattern){
          this.dynamicForm.get(field.name)?.setValidators(Validators.pattern(field.validations?.rules?.[value].pattern)); 
        }
      } 
    } else {
    console.log('here to apply the validation logic not group',field, value, nestedFieldForValidation);
      if(nestedFieldForValidation?.validations?.rules?.[value]){
        if(nestedFieldForValidation?.validations?.rules?.[value].pattern){
          this.dynamicForm.get(field.name)?.get(nestedFieldForValidation.name)?.setValidators(Validators.pattern(nestedFieldForValidation?.validations?.rules?.[value].pattern));
          this.dynamicForm.get(field.name)?.get(nestedFieldForValidation.name)?.updateValueAndValidity(); 
        }
      }else {
        console.log('When enter in else', field)
      }
    }

  }

  // validations: {
  //   dependsOn: "identificationType",
  //   rules: {
  //     "Personal ID": { pattern: "^[0-9]{10}$", message: "Must be 10-digit number" },
  //     "Passport": { pattern: "^[A-Z0-9]{6,9}$", message: "Must be alphanumeric (6-9 chars)" }
  //   }
  // },
  
  getValidations(field: FormBase) {
    let validations: ValidatorFn[] = [];
    if (field.required) validations.push(Validators.required);
    if (field.validations?.pattern) validations.push(Validators.pattern(field.validations.pattern));
    return validations;
  }
  submit(){
    console.log('form',this.dynamicForm)
  }
}
