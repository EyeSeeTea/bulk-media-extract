import { ProgramType } from "$/domain/entities/ProgramType";

export function getProgramTypeLabel(programType: ProgramType): string {
    if (programType === "WITH_REGISTRATION") {
        return "Tracker Program";
    }

    if (programType === "WITHOUT_REGISTRATION") {
        return "Event Program";
    }

    return "Unknown";
}
