## MODIFIED Requirements

### Requirement: File-capable properties are listed for selected program
The system MUST display all discovered file-capable properties for the selected program using a normalized descriptor format grouped by program type and source.  
For tracker programs, the grouped output MUST include a dedicated organisation unit section, a dedicated event section, tracked entity attribute sections, and program stage data element sections.  
For event programs, the grouped output MUST include a dedicated organisation unit section, a dedicated event section, and event data element sections.  
The organisation unit section MUST include standard organisation unit metadata placeholders and any available custom organisation unit attributes discovered from the program's selectable organisation units.  
The event section MUST contain only event/enrollment placeholders that can be resolved consistently for the selected program type.

#### Scenario: Combined property list is rendered
- **WHEN** file-capable properties are found across multiple source types
- **THEN** the UI renders grouped sections where each property includes source type, label, and identifier

#### Scenario: Organisation unit section includes custom attributes when available
- **WHEN** the selected program has selectable organisation units with custom attributes
- **THEN** the inspected property groups include those custom attributes under the organisation unit section

#### Scenario: No file properties for selected program
- **WHEN** a selected program has no resolvable file-capable properties at inspection time
- **THEN** the UI displays an explicit empty-state message
