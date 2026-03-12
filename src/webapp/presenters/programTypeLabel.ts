import { ProgramType } from "$/domain/entities/ProgramType";

export function getProgramTypeLabel(programType: ProgramType): string {
    if (programType === "WITH_REGISTRATION") {
        return "With registration";
    }

    if (programType === "WITHOUT_REGISTRATION") {
        return "Without registration";
    }

    return "Unknown";
}
