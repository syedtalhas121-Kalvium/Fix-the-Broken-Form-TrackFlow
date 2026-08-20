# TrackFlow Bug Report Form — Baseline Investigation

## Scope

This report records the behavior of the unmodified starter form before any fix was written. The investigation was performed in the browser at `http://localhost:5173/`, as required by the assignment.

| Bug | Observed behavior | Root cause | Intended correction |
|---|---|---|---|
| 1. Empty submissions | Clicking **Submit Bug Report** with every field empty created a success banner and a bug entry with blank values. | `validate()` always returned `true`, and `handleSubmit` discarded its return value, so there was no gate before the API call. | Return a field-to-message error map, store it in `errors`, and return early when the map is non-empty. |
| 2. Duplicate submissions | The submit button stayed active during the 1.8-second request. Two rapid clicks produced two separate bug IDs in the session list. | No loading state was set before `await submitBugReport(form)`, and the button did not read a disabled state. | Set `loading` before the request, bind `disabled` to it, and show a submitting label while the request is in flight. |
| 3. Form not cleared | After a successful submission, all entered values remained in the form. | The success path added the result but never reset the controlled form state. | Reset the form to `EMPTY_FORM` after a successful response. |
| 4. Silent server error | Submitting a title containing `login` triggered the mock API's structured 409 conflict, but no user-visible error appeared. | The `catch` block was empty, so the rejected request was swallowed without routing its message to the UI. | Route field-specific errors to `errors` and general failures to the server-error banner. |
| 5. Missing field messages | Leaving a required field blank produced no message next to that field. | Although `errors` state existed, it was never populated by validation and no `errors.<field>` values were rendered in JSX. | Render a message and invalid visual treatment for each field with an error, and clear that field's error while editing. |
| 6. Invalid step count | The `stepsCount` input accepted `-5` and provided no validation feedback. | `validate()` contained no rule requiring a positive step count. | Reject empty, non-numeric, zero, and negative values with a field-level error. |

## Verification Notes

The baseline app rendered and accepted input, but it did not provide the lifecycle guarantees expected of a production form. Empty input reached the mock API, duplicate clicks created duplicate session entries, successful values persisted, the `login` conflict disappeared silently, field errors were invisible, and a negative steps count was accepted.

## Live Deployment

The live deployment URL will be added after the corrected application is built and deployed.
