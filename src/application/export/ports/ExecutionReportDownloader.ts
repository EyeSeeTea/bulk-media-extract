import { ExportExecutionReport } from "$/application/export/ExportExecution";

export interface ExecutionReportDownloader {
    download(report: ExportExecutionReport, filename?: string): void;
}
