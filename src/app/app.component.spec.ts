import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ReactiveFormsModule,
        CommonModule,
        DynamicFormComponent,
      ],
      providers: [provideHttpClientTesting(),provideHttpClient()]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the formJson correctly', () => {
    expect(component.formJson.length).toBeGreaterThan(0);  // Ensure there are elements in formJson
  });

  it('should have a valid initial JSON value in inputJson FormControl', () => {
    expect(component.inputJson.valid).toBeTrue(); // Check if inputJson FormControl is valid initially
    expect(component.inputJson.value).toBe(JSON.stringify(component.formJson, null, 3)); // Check if initial value matches the formJson
  });

  it('should format the JSON properly when formatJson() is called', () => {
    component.inputJson.setValue('{"userType":"Individual","gender":"Male"}');  // Set some dummy value
    component.formatJson();
    fixture.detectChanges();

    const formattedJson = JSON.stringify({ userType: 'Individual', gender: 'Male' }, null, 3);
    expect(component.inputJson.value).toBe(formattedJson);  // Check if the JSON is properly formatted
  });

  it('should update formJson on valid input JSON change', () => {
    const newJson = `[{
      "name": "userType",
      "type": "dropdown",
      "label": "User Type",
      "options": ["Individual", "Business"],
      "required": true
    }]`;

    const inputJsonControl = component.inputJson;
    inputJsonControl.setValue(newJson);
    fixture.detectChanges();

    component.inputJson.valueChanges.subscribe(value => {
      if (inputJsonControl.valid) {
        const parsedJson = JSON.parse(value!);
        expect(parsedJson).toEqual(jasmine.any(Array));  // Ensure the value is parsed as an array of form bases
        expect(parsedJson[0].name).toBe('userType');  // Ensure specific field validation
      }
    });
  });

  it('should show an error message when the JSON is invalid', () => {
    const inputElement: HTMLTextAreaElement = fixture.debugElement.query(By.css('.json-textarea')).nativeElement;

    inputElement.value = '{"invalidJson":}';  // Invalid JSON
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('small')).nativeElement;
    expect(errorMessage).toBeTruthy();  // Check if error message is displayed when JSON is invalid
    expect(errorMessage.textContent).toBe('Please format JSON correctly!');  // Make sure the error message is as expected
  });

  it('should call the dynamic form component with correct form data', () => {
    const dynamicFormComponent = fixture.debugElement.query(By.directive(DynamicFormComponent)).componentInstance;
    expect(dynamicFormComponent.formData).toEqual(component.formJson);  // Check if the dynamic form receives the correct data
  });

  it('should show error message if required JSON field is missing', () => {
    const inputElement: HTMLTextAreaElement = fixture.debugElement.query(By.css('.json-textarea')).nativeElement;
    inputElement.value = '';  // Empty input, which should trigger the required error
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('small')).nativeElement;
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toBe('JSON is required!');  // Error message when JSON is empty
  });
});
