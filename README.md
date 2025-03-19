This project is an Angular Single Page Application (SPA) designed to dynamically generate forms based on a given JSON input structure. The application renders different input types, supports nested groups, integrates with external APIs, and enforces dynamic validation and visibility rules.
Features

1. Form Generation

Accepts a JSON structure defining form fields, groups, and dependencies.

Supports field types: Inputs, Textarea, Dropdown, Checkbox, Radio button, Inputs with custom validations.

Re-renders when JSON input changes.

Using NgRx to implement local auto save JSON and show it.

2. Nested Group Support

Allows forms to have nested groups visually encapsulated and distinguishable.

3. External API Integration

Some fields options are auto-filled from a mocked API.

API inputs can be based on field values.

4. Dynamic Visibility & Validation

Fields/groups dynamically appear/disappear based on user input.

Validations change based on other field values (e.g., ID format depending on document type).

5. Form Submission

On submission, returns a structured JSON object with all filled values.

Using NgRx to implement save tructured JSON object and show it.

---------------------------------------------------------------------------------------------
Example JSON for testing is provided in app.component.ts
To start the app use `ng serve`.
I crated some unit tests mostly for the dynamic form component and could be started with `ng test`.
To Run Local JSON Server use command `json-server --watch local_server\db.json --port 8080`.
