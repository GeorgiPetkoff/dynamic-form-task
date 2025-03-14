import { Component } from '@angular/core';
import { DynamicFormComponent } from "./components/dynamic-form/dynamic-form.component";
import { FormBase } from './models/form-base';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [DynamicFormComponent]
})
export class AppComponent {
  title = 'dynamic-form-task';

  formJson: FormBase[] = [
      {
        name: "userType",
        type: "dropdown",
        label: "User Type",
        options: ["Individual", "Business"],
        required: true
      },
      {
        name: "personalDetails",
        type: "group",
        label: "Personal Details",
        visibleIf: { userType: "Individual" },
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
                "Passport": { pattern: "^[A-Z0-9]{6,9}$", message: "Must be alphanumeric (6-9 chars)" },
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
            validations: { pattern: "^[A-Z0-9]{9}$", message: "Must be 9 alphanumeric characters" }
          }
        ]
      },
      {
        name: "contactDetails",
        type: "group",
        label: "Contact Details",
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
        name: "terms",
        type: "checkbox",
        label: "Agree to Terms and Conditions",
        required: true
      }
    ] 
}
