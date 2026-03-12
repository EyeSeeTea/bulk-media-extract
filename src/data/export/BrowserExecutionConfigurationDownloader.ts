import { ExportExecutionConfiguration } from "$/application/export/ExportExecution";

export function downloadExportExecutionConfiguration(
    configuration: ExportExecutionConfiguration,
    filename: string
): void {
    const json = JSON.stringify(configuration, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
