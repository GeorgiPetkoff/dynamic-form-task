import { Component, OnInit } from '@angular/core';
import { DynamicFormComponent } from "./components/dynamic-form/dynamic-form.component";
import { FormBase } from './models/form-base';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { jsonValidator } from './services/json.validator';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [DynamicFormComponent,  ReactiveFormsModule, CommonModule]
})
export class AppComponent implements OnInit{
  formJson: FormBase[] = [ // I initilizing here one JSON for testing purpose
    {
      name: "userType",
      type: "dropdown",
      label: "User Type",
      options: ["Individual", "Business"],
      required: true
    },
    {
      name: "gender",
      type: "radio",
      label: "Gender",
      options: ["Male", "Female"],
      required: true
    },
    {
      name: "personalDetails",
      type: "group",
      label: "Personal Details",
      visibleIf: { userType: "Individual" },
      required: true,
      fields: [
        {
          name: "firstName",
          type: "input",
          label: "First Name",
          required: true
        },
        {
          name: "lastName",
          type: "input",
          label: "Last Name",
          required: true
        },
        {
          name: "identificationType",
          type: "dropdown",
          label: "Identification Type",
          options: ["Personal ID", "Passport"],
          required: true
        },
        {
          name: "idNumber",
          type: "input",
          label: "ID Number",
          validations: {
            dependsOn: "identificationType",
            rules: {
              "Personal ID": { pattern: "^[0-9]{10}$", message: "Must be 10-digit number" },
              "Passport": { pattern: "^[a-zA-Z0-9]{6,9}$", message: "Must be alphanumeric (6-9 chars)" }
            }
          },
          required: true
        }
      ]
    },
    {
      name: "businessDetails",
      type: "group",
      label: "Business Details",
      visibleIf: { userType: "Business" },
      required: true,
      fields: [
        {
          name: "businessName",
          type: "input",
          label: "Business Name",
          required: true
        },
        {
          name: "taxId",
          type: "input",
          label: "Tax ID",
          required: true,
          validations: { pattern: "^[a-zA-Z0-9]{9}$", message: "Must be 9 alphanumeric characters" }
        }
      ]
    },
    {
      name: "contactDetails",
      type: "group",
      label: "Contact Details",
      required: true,
      fields: [
        {
          name: "email",
          type: "input",
          label: "Email",
          required: true,
          validations: { pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message: "Invalid email format" }
        },
        {
          name: "phone",
          type: "input",
          label: "Phone Number",
          required: true,
          validations: { pattern: "^[0-9]{10}$", message: "Must be a 10-digit number" }
        },
        {
          name: "additionalComments",
          type: "textarea",
          label: "Additional Comments",
          required: false
        }
      ]
    },
    {
      name: "country",
      type: "dropdown",
      label: "Country",
      optionsFromApi: "http://localhost:8080/countries",
      required: true
    },
    {
      name: "city",
      type: "dropdown",
      label: "City",
      optionsFromApi: "http://localhost:8080/cities?countryId={value}",
      required: true,
      validations: {
         dependsOn: "country"
      }
    },
    {
      name: "terms",
      type: "checkbox",
      label: "Agree to Terms and Conditions",
      required: true
    }
  ];

  inputJson = new FormControl(JSON.stringify(this.formJson, null, 3), [jsonValidator, Validators.required]); // init FormControl for the textarea where JSON would be held, with formatting like JSON + custom validation for JSON format

  ngOnInit(): void {
    this.inputJson.valueChanges.pipe( // everytime JSON is changed
      distinctUntilChanged(), // rxjs operator to compare last changed value if equal to last emitted one and if is the same it wont emit new value
      debounceTime(800), // rxjs operator to wait for 800ms after last change not overflowing on every typed symbol
    ).subscribe(
      value => {
        if(this.inputJson.valid){
          this.formJson = JSON.parse(value!) as FormBase[]; // will be assigned new value and it will cause change to the child component
        }
      }
    )
  }

  formatJson() { // enters on blur to make JSON looks pretty
    if (this.inputJson.valid) {
        const parsed = JSON.parse(this.inputJson.value || '');
        this.inputJson.setValue(JSON.stringify(parsed, null, 3)); 
    }
  }
  
}
