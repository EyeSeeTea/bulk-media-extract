## ADDED Requirements

### Requirement: InfoIconPopover displays contextual help on click
The system SHALL provide a reusable `InfoIconPopover` component that renders a small info icon button. When the user clicks the icon, a dhis2/ui `Popover` SHALL appear anchored to the icon, displaying the content passed as children. Clicking outside the popover or clicking the icon again SHALL dismiss it.

#### Scenario: Info icon renders as a small button
- **WHEN** the `InfoIconPopover` component is rendered
- **THEN** it displays a small icon button using `IconInfo16` that is visually unobtrusive next to adjacent controls

#### Scenario: Clicking the icon opens the popover
- **WHEN** the user clicks the info icon button
- **THEN** a `Popover` appears anchored to the icon, displaying the children content

#### Scenario: Clicking outside dismisses the popover
- **WHEN** the popover is open and the user clicks outside of it
- **THEN** the popover closes

#### Scenario: Clicking the icon again dismisses the popover
- **WHEN** the popover is open and the user clicks the info icon button
- **THEN** the popover closes
