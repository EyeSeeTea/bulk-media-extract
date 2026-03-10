## Context

The Storage step in [WizardPage.tsx](/home/m/Documentos/eyeseetea/file-export/src/webapp/pages/wizard/WizardPage.tsx) already includes the right underlying pieces: a WebDAV-only form, connection-test state, setup guidance, and validation notices. The problem is presentation. The step currently spreads introductory guidance across a subtitle, a compatibility notice, a separate checklist, and an incomplete-details notice, which makes the top of the step feel busy before the user starts the main task.

This proposal is intentionally UI-only. It must preserve the current WebDAV validation flow, field requirements, and progression gate while simplifying the copy hierarchy.

## Goals / Non-Goals

**Goals:**
- Reduce redundant Storage-step messaging without weakening the WebDAV setup guidance.
- Consolidate compatibility examples and setup prerequisites into a single notice block.
- Remove the incomplete-details notice and rely on existing disabled-state and validation feedback patterns.
- Keep the step's connection-test lifecycle and gating behavior unchanged.

**Non-Goals:**
- Changing storage providers or the wording of validation success and failure states beyond what is needed for consistency.
- Modifying domain use cases, repository integrations, or wizard state shape.
- Redesigning the rest of the wizard shell or the execution gate.

## Decisions

### Consolidate setup guidance into one notice above the form

The Storage step will replace the current `Compatible software` notice and `Before you test` checklist with a single setup notice that contains both kinds of information. This keeps the user’s attention on one high-signal guidance block instead of scanning multiple adjacent notices.

Alternative considered: keep both sections and only tighten the wording.  
Why not: the issue is structural duplication, not only copy length.

### Remove redundant introductory and incomplete-details notices

The standalone `WebDAV is the only available export target for now.` subtitle and the `Complete the connection details` notice will be removed. The step intro already frames the task as WebDAV validation, and the disabled `Test connection` button plus later validation messages already communicate when the form is incomplete.

Alternative considered: keep the notices but reduce their visual weight.  
Why not: even visually softer notices still repeat information the step already communicates elsewhere.

### Preserve existing validation-state notices

The `Ready to test`, `Testing connection`, success, and failure notices will remain in place because they communicate state transitions rather than static setup guidance. This keeps the simplification scoped to redundant introductory copy and avoids changing the proven validation flow.

Alternative considered: collapse all notices into a single dynamic panel.  
Why not: it would increase implementation scope and risk unrelated regressions in the validation feedback experience.

## Risks / Trade-offs

- [Risk] The consolidated notice may become too dense if it absorbs every existing sentence. -> Mitigation: keep it short, use a compact list or paragraph grouping, and retain only the most actionable setup points.
- [Risk] Removing the incomplete-details notice could reduce discoverability for first-time users. -> Mitigation: keep field labels clear and preserve the disabled test button plus blocking validation message on Next.
- [Risk] Tests may become brittle because copy and DOM structure change together. -> Mitigation: update tests to assert the new consolidated guidance and the absence of removed notices.

## Migration Plan

1. Replace the current Storage-step subtitle, compatibility notice, checklist, and incomplete-details notice with the simplified copy structure.
2. Keep the existing connection-test action, state notices, and progression validation unchanged.
3. Update Storage-step rendering tests to match the new guidance structure and removed copy.

Rollback strategy: revert the Storage-step JSX and related test assertions; no data migration or behavioral rollback is required beyond the UI.

## Open Questions

- Whether the consolidated setup notice should be a short paragraph block or a compact checklist with a single title.
