import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicFormComponent } from './dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;
  let apiServiceMock: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['getCountries', 'getOptions']);
  
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSelectModule, DynamicFormComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceMock },
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();
  
    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with given formData', () => {
    component.formData = [
      { name: 'firstName', type: 'input', label: 'First Name', required: true }
    ];
    component.ngOnInit();
    expect(component.dynamicForm.contains('firstName')).toBeTruthy();
  });

  it('should mark required field as invalid when empty', () => {
    component.formData = [
      { name: 'email', type: 'input', label: 'Email', required: true }
    ];
    component.ngOnInit();
    component.dynamicForm.get('email')?.setValue('');
    expect(component.dynamicForm.get('email')?.valid).toBeFalsy();
  });

  it('should call API for options when optionsFromApi is provided', () => {
    const mockOptions = [{ name: 'Option 1' }, { name: 'Option 2' }];
    apiServiceMock.getOptions.and.returnValue(of(mockOptions));

    component.formData = [
      { name: 'category', type: 'dropdown', label: 'Category', optionsFromApi: 'api/categories' }
    ];
    component.ngOnInit();

    expect(apiServiceMock.getOptions).toHaveBeenCalledWith('api/categories');
  });

  it('should apply validation rules dynamically based on "dependsOn" value', () => {
    component.formData = [
      {
        "name": "identificationType",
        "type": "dropdown",
        "label": "ID Type",
        "options": ["Personal ID", "Passport"]
      },
      {
        "name": "identificationNumber",
        "type": "input",
        "label": "ID Number",
        "required": true,
        "validations": {
          "dependsOn": "identificationType",
          "rules": {
            "Personal ID": { "pattern": "^[0-9]{10}$", "message": "Must be 10-digit number" },
            "Passport": { "pattern": "^[a-zA-Z0-9]{6,9}$", "message": "Must be alphanumeric (6-9 chars)" }
          }
        }
      }
    ];
    component.ngOnInit();
    const idTypeControl = component.dynamicForm.get('identificationType');
    const idNumberControl = component.dynamicForm.get('identificationNumber');
    expect(component.dynamicForm.get('identificationType')).toBeTruthy();
    expect(component.dynamicForm.get('identificationNumber')).toBeTruthy();

    idTypeControl?.setValue('Personal ID');
    idNumberControl?.setValue('123456789');
    expect(idNumberControl?.valid).toBeFalse();

    idNumberControl?.setValue('1234567890');
    expect(idNumberControl?.valid).toBeTrue();

    idTypeControl?.setValue('Passport');
    idNumberControl?.setValue('abc12'); 
    expect(idNumberControl?.valid).toBeFalse();
  });

  it('should submit the form successfully when valid', () => {
    spyOn(console, 'log');

    component.formData = [
      { name: 'firstName', type: 'input', label: 'First Name', required: true },
      { name: 'email', type: 'input', label: 'Email', required: true }
    ];
    component.ngOnInit();

    component.dynamicForm.get('firstName')?.setValue('John');
    component.dynamicForm.get('email')?.setValue('john@example.com');
    
    component.submit();

    expect(console.log).toHaveBeenCalledWith('form', component.dynamicForm);
  });
});
