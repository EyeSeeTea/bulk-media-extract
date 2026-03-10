import { ProgramType } from "$/domain/entities/FileExportProgram";
import i18n from "$/utils/i18n";

export function getProgramTypeLabel(programType: ProgramType): string {
    switch (programType) {
        case "WITH_REGISTRATION":
            return i18n.t("Tracker Program");
        case "WITHOUT_REGISTRATION":
            return i18n.t("Event Program");
        default:
            return programType;
    }
}
