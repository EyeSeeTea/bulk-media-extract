## MODIFIED Requirements

### Requirement: File-capable properties are listed for selected program
The system MUST display all discovered file-capable properties for the selected program using a normalized descriptor format grouped by program type and metadata source.

For tracker programs, the grouped output MUST include tracked entity section properties, program stage data element sections, and shared metadata placeholders.  
For event programs, the grouped output MUST include event data elements and shared metadata placeholders.

#### Scenario: Combined property list is rendered
- **WHEN** file-capable properties are found across multiple source types
- **THEN** the UI renders grouped sections where each property includes source type, label, and identifier

#### Scenario: No file properties for selected program
- **WHEN** a selected program has no resolvable file-capable properties at inspection time
- **THEN** the UI displays an explicit empty-state message
