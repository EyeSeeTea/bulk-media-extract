import { ExportExecutionReport } from "$/application/export/ExportExecution";
import { ExecutionReportDownloader } from "$/application/export/ports/ExecutionReportDownloader";

export class BrowserExecutionReportDownloader implements ExecutionReportDownloader {
    constructor(
        private options: {
            buildFilename: (selectedProgramId: string, startedAt: string) => string;
        }
    ) {}

    public download(report: ExportExecutionReport, filename?: string): void {
        const resolvedFilename =
            filename ??
            this.options.buildFilename(report.configuration.scope.program.id, report.startedAt);
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = resolvedFilename;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
