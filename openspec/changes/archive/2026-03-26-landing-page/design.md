## Context

The app currently boots directly into the export wizard via React Router. The `Router` component renders `WizardPage` for both `/wizard` and the default route. Wizard state lives in `WizardContext` and is initialized via `useState(initialWizardState)` inside `WizardProvider`, which means state resets naturally when `WizardProvider` unmounts.

The existing `landing-page-components` spec describes a different landing page concept (ProgramPicker, ProgramDetails, EventPreview). This change replaces that concept with a simpler landing page that serves purely as a launch point for new exports.

## Goals / Non-Goals

**Goals:**
- Provide a clean entry point that separates "deciding to export" from "configuring an export"
- Reset wizard state completely when returning from a finished export
- Keep the landing page minimal — a single action to start a new export

**Non-Goals:**
- Export history, saved configurations, or any dashboard-like features on the landing page
- Changing the internal wizard step flow or validation logic
- Persisting wizard state across page navigations (state should reset on each new export)

## Decisions

### 1. Landing page as a new route component at `/`

The `LandingPage` component will be a simple page rendered at the default route (`/`). The wizard moves to `/wizard` only. Navigation uses React Router's `useHistory().push()`.

**Why over alternatives:**
- Keeping the wizard at `/wizard` means existing bookmarks or deep links still work.
- A separate component (vs. a "mode" within WizardPage) keeps concerns cleanly separated.

### 2. Wizard state resets via natural unmount cycle

Since `WizardProvider` initializes state with `useState(initialWizardState)`, navigating away from `/wizard` unmounts the provider, and returning to `/wizard` remounts it with fresh state. No explicit reset method is needed.

**Why over a reset function:**
- Simpler — no new API surface on WizardContext.
- Guaranteed clean state — no risk of forgetting to reset a field.
- The wizard is already structured this way; we just need to ensure navigation triggers unmount.

### 3. Finish action navigates to `/` via React Router

The `onFinish` callback passed to `WizardShell` will use `useHistory().push("/")` to navigate back to the landing page. This replaces the current no-op or minimal finish behavior.

**Why:**
- React Router navigation triggers component unmount/remount, which handles state reset (Decision 2).
- Consistent with how the app already uses HashRouter.

### 4. Landing page uses DHIS2 UI components for visual consistency

The landing page will use `@dhis2/ui` `Button` component (primary variant) for the "Start new export" action, matching the wizard's existing component library.

### 5. Back button hidden on first step, not disabled

The `WizardShell` currently renders the Back button as disabled on step 0. Instead, it should not be rendered at all when `currentStep === 0`. This avoids a dead control that adds no value when there's nowhere to go back to.

### 6. Exit action in page header with confirmation modal

The wizard page wraps its content with the existing `PageHeader` component, using its `onBackClick` prop to trigger an exit flow. Clicking the header back button opens a DHIS2 `Modal` asking the user to confirm they want to leave. On confirm, it navigates to `/` (same mechanism as Finish — unmount resets state). On dismiss, the modal closes and the wizard continues undisturbed. The header back button is disabled while execution is running.

**Why a header action over a footer button:**
- The footer is for wizard-internal navigation (Back/Next/Finish). Adding "Cancel" there would compete with "Back" and give exit too much prominence relative to the primary flow.
- The header back button follows the "go up/out" convention (leave the wizard) vs. "go forward/backward within the flow" (footer).
- The existing `PageHeader` component already provides this pattern with a chevron-left icon button and tooltip.

**Why a confirmation modal:**
- The wizard accumulates multi-step configuration that would be lost on exit. A modal prevents accidental data loss.

## Risks / Trade-offs

- **Risk**: Users might navigate directly to `/wizard` via URL, bypassing the landing page. → **Mitigation**: This is acceptable — the wizard works standalone and starts with fresh state regardless.
- **Risk**: The existing `landing-page-components` spec describes a different, richer landing page. → **Mitigation**: That spec is from an older iteration. This change introduces a new, simpler landing page concept. The old components (ProgramPicker, ProgramDetails, EventPreview) are now part of the wizard flow, not the landing page.
