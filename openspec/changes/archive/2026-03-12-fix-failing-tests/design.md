## Context

`yarn test` currently fails in four webapp test files because the landing-page and wizard UI render `With registration` and `Without registration` where the product contract requires `Tracker Program` and `Event Program`. The break is therefore a runtime presentation regression that the tests are correctly detecting.

The change is small in implementation terms, but it touches both OpenSpec requirements and multiple UI test suites. The design needs to keep the scope narrow so the team can restore a passing baseline without reopening broader product-copy decisions.

## Goals / Non-Goals

**Goals:**

- Reconcile the landing page and wizard UI with the documented `Tracker Program` and `Event Program` labels.
- Keep the failing tests aligned with that contract across the affected surfaces.
- Verify that the suite passes after restoring the expected UI copy.

**Non-Goals:**

- Redesign the program-type copy or introduce a new labeling strategy.
- Expand this work into broader UI copy cleanup beyond the failing assertions.

## Decisions

### Decision: Treat the documented friendly labels as the source of truth

The change will restore `Tracker Program` and `Event Program` in the relevant UI surfaces and keep the tests and specs anchored to those labels.

Rationale:

- The existing specs already require `Tracker Program` and `Event Program`.
- The failing tests are asserting the intended contract, so the implementation should move back toward the contract instead of weakening verification.

Alternatives considered:

- Update specs and tests to accept `With registration` and `Without registration`. Rejected because that would codify the regression instead of fixing it.

### Decision: Limit production changes to program-type label mapping surfaces

Implementation should update the label-mapping code paths that feed the landing page and wizard, then keep the affected tests consistent with that restored copy.

Rationale:

- The failures all point to the same user-visible mapping regression rather than broader workflow behavior.
- Keeping the production change narrow reduces regression risk while restoring the intended UI.

Alternatives considered:

- Sweep all copy-related UI text in the repo regardless of failure status. Rejected because it increases scope without evidence that other copy is wrong.

## Risks / Trade-offs

- [A hidden production inconsistency might remain outside the failing tests] → Mitigate by rerunning the full unit suite after updates and checking both landing and wizard expectations together.
- [The label mapping may be duplicated across surfaces] → Mitigate by updating all observed rendering paths in the same change and keeping tests in both areas.
- [Future contributors may reintroduce label drift across surfaces] → Mitigate by preserving the same wording in both capability specs and tests.

## Migration Plan

1. Update the landing-page and wizard capability deltas so they preserve `Tracker Program` and `Event Program` as the required labels.
2. Restore the corresponding program-type label rendering in the landing page and wizard code paths.
3. Adjust any affected tests or fixtures so they continue asserting the same contract.
4. Run `yarn test` to confirm the suite is green.

Rollback strategy:

- Revert the change set if verification shows another pending product decision changed the copy intentionally and this restoration should not ship yet.

## Open Questions

- None at proposal time; the observed failures and current UI output point to a single narrow update path.
