## Why

The wizard now works functionally, but its shell still feels inconsistent across steps and underuses DHIS2 interaction patterns. Step progress, step-state feedback, footer actions, and content hierarchy all vary enough that the flow feels less guided than it should.

## What Changes

- Remove the `Step X of Y: Title` subtitle and make the step tabs carry the step context instead of duplicating it in page copy.
- Redesign the wizard step tabs to better match DHIS2 visual language, including blue-accented active state, clearly disabled upcoming steps, numbered labels, and completed-state reinforcement with a tick icon.
- Introduce a shared step-content hierarchy so each step uses comparable title, support copy, and section rhythm instead of mixing oversized hero headings in some steps with plain paragraphs in others.
- Redesign the wizard footer actions so Back and Next feel intentional, well-spaced, and visually prominent instead of small buttons pinned to the left edge.
- Add bottom breathing room to the wizard page so the final content section and action bar do not end too abruptly.
- Preserve the existing five-step order, validation gates, and state retention behavior while refining shell and presentation consistency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `file-export-wizard`: Wizard shell requirements change to mandate DHIS2-aligned step navigation, consistent cross-step content hierarchy, and a more prominent footer action layout.

## Impact

- Affected code: `src/webapp/pages/wizard/WizardPage.tsx`, `src/webapp/pages/wizard/WizardPage.css`, and wizard rendering tests.
- UI dependencies: likely use of existing DHIS2 icon assets for completed-step reinforcement.
- Behavioral impact: no domain, repository, or use-case changes; this proposal is limited to presentation structure and interaction affordances.
