## 1. Landing Page Component

- [x] 1.1 Create `LandingPage` component at `src/webapp/pages/landing/LandingPage.tsx` with a "Start new export" primary button that navigates to `/wizard` using `useHistory().push("/wizard")`

## 2. Router Update

- [x] 2.1 Update `src/webapp/pages/Router.tsx` to render `LandingPage` at the default route (`/`) and keep `WizardPage` at `/wizard` only

## 3. Wizard Finish Navigation

- [x] 3.1 Update the `onFinish` handler in `WizardContent` to navigate to `/` using `useHistory().push("/")` instead of the current no-op behavior, ensuring wizard state resets via provider unmount/remount

## 4. Hide Back Button on First Step

- [x] 4.1 Update `WizardShell` to not render the Back button when `currentStep === 0` instead of rendering it disabled

## 5. Exit Action in Page Header with Confirmation Modal

- [x] 5.1 Add `PageHeader` with a back/exit action to `WizardContent`, with a confirmation modal (DHIS2 `Modal`) that warns all progress will be lost. On confirm, navigate to `/`. Disable the exit action while execution is running
- [x] 5.2 `isExecutionRunning` accessed directly in `WizardContent` via `useWizardStepController` — no prop lifting needed

## 6. Verification

- [x] 6.1 Verify: back button hidden on step 1, visible on step 2+; header exit shows modal on every step; confirming exit returns to landing page; dismissing modal preserves state; exit disabled during execution
