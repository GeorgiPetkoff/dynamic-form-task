export interface FormBase {
  name: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  optionsFromApi?: string;
  validations?: {
    pattern?: string;
    message?: string;
    dependsOn?: string;
    rules?: { [key: string]: { pattern: string; message: string } };
  };
  visibleIf?: { [key: string]: string };
  fields?: FormBase[];
}