import React from "react";
import ReactDOM from "react-dom/client";
import {
    Button,
    CheckboxField,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from "@dhis2/ui";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { createAdminUser } from "$/domain/entities/__tests__/userFixtures";
import { AppContext } from "$/webapp/contexts/app-context";
import { WizardPage } from "$/webapp/pages/wizard/WizardPage";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Review root not found");
}

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") ?? "current";

const context = {
    currentUser: createAdminUser(),
    compositionRoot: getTestCompositionRoot(),
    baseUrl: "http://localhost:8081/dhis2",
};

const reviewShellStyle: React.CSSProperties = {
    minHeight: "100vh",
    padding: "24px",
    background: "linear-gradient(180deg, #f6f8fb 0%, #edf2f7 56%, #eef4f2 100%)",
    color: "#1f2937",
};

function ReviewShell(props: { children: React.ReactNode; title: string; note: string }) {
    return (
        <div style={reviewShellStyle}>
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "grid",
                    gap: "16px",
                }}
            >
                <header
                    style={{
                        display: "grid",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#205b46",
                        }}
                    >
                        OpenSpec UI review
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "28px",
                            lineHeight: 1.15,
                        }}
                    >
                        {props.title}
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            maxWidth: "78ch",
                            color: "#4b5563",
                            lineHeight: 1.5,
                        }}
                    >
                        {props.note}
                    </p>
                </header>
                {props.children}
            </div>
        </div>
    );
}

function ProgramStepProposalPreview() {
    return (
        <ReviewShell
            title="Proposed Step 1 layout"
            note="This mock demonstrates the proposed hierarchy: a constrained content column, a filterable DHIS2 program selector, and file selection cards that emphasize decision-making over raw tabular metadata."
        >
            <section
                style={{
                    maxWidth: "900px",
                    background: "#ffffff",
                    border: "1px solid #d8e1ea",
                    borderRadius: "18px",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                    padding: "28px",
                    display: "grid",
                    gap: "24px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.5fr) minmax(240px, 0.9fr)",
                        gap: "16px",
                        alignItems: "start",
                    }}
                >
                    <div style={{ display: "grid", gap: "12px" }}>
                        <div style={{ display: "grid", gap: "6px" }}>
                            <div
                                style={{
                                    fontSize: "30px",
                                    fontWeight: 700,
                                    lineHeight: 1.15,
                                }}
                            >
                                Choose a program and the files to export
                            </div>
                            <div
                                style={{
                                    color: "#4b5563",
                                    lineHeight: 1.5,
                                }}
                            >
                                Start by picking the tracker program. Then confirm which file data
                                values should be included in the export plan.
                            </div>
                        </div>
                        <SingleSelectField
                            selected="prog-a"
                            label="Program"
                            filterable
                            placeholder="Choose a program"
                            helpText="Only programs with file-capable data values are listed."
                            onChange={() => undefined}
                        >
                            <SingleSelectOption value="prog-a" label="Antenatal Visit" />
                            <SingleSelectOption value="prog-b" label="Community Outreach" />
                        </SingleSelectField>
                    </div>
                    <aside
                        style={{
                            border: "1px solid #d6e7de",
                            borderRadius: "14px",
                            background: "linear-gradient(180deg, #f8fcfa 0%, #eef7f2 100%)",
                            padding: "16px",
                            display: "grid",
                            gap: "12px",
                        }}
                    >
                        <div style={{ fontSize: "13px", color: "#205b46", fontWeight: 700 }}>
                            Selection summary
                        </div>
                        <div style={{ display: "grid", gap: "8px" }}>
                            <SummaryRow label="Program type" value="Tracker Program" />
                            <SummaryRow label="File fields found" value="2" />
                            <SummaryRow label="Program stages" value="Main Stage" />
                        </div>
                        <NoticeBox title="Why this matters">
                            File selection here controls which template editors and preview rows
                            appear in the next steps.
                        </NoticeBox>
                    </aside>
                </div>

                <section
                    style={{
                        display: "grid",
                        gap: "14px",
                    }}
                >
                    <div style={{ display: "grid", gap: "6px" }}>
                        <div style={{ fontSize: "20px", fontWeight: 700 }}>
                            File data values to sync
                        </div>
                        <div style={{ color: "#4b5563", lineHeight: 1.5 }}>
                            Each file field is shown as a selectable card. Secondary metadata moves
                            into compact chips so the decision stays focused on what to sync.
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "14px",
                        }}
                    >
                        <FileOptionCard
                            checked
                            name="Visit Form"
                            valueType="FILE_RESOURCE"
                            stage="Main Stage"
                            description="Primary clinical document uploaded during the visit."
                        />
                        <FileOptionCard
                            checked={false}
                            name="Consent Form"
                            valueType="FILE_RESOURCE"
                            stage="Main Stage"
                            description="Supplementary signed consent uploaded when available."
                        />
                    </div>
                </section>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        paddingTop: "8px",
                        borderTop: "1px solid #e5e7eb",
                    }}
                >
                    <div style={{ color: "#4b5563", fontSize: "14px" }}>
                        1 of 2 file data values selected
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <Button secondary>Back</Button>
                        <Button primary>Next</Button>
                    </div>
                </div>
            </section>
        </ReviewShell>
    );
}

function SummaryRow(props: { label: string; value: string }) {
    return (
        <div
            style={{
                display: "grid",
                gap: "2px",
            }}
        >
            <div style={{ fontSize: "12px", color: "#6b7280" }}>{props.label}</div>
            <div style={{ fontWeight: 600 }}>{props.value}</div>
        </div>
    );
}

function MetaPill(props: { children: React.ReactNode }) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                width: "fit-content",
                minHeight: "28px",
                padding: "0 10px",
                borderRadius: "999px",
                background: "#eef2f7",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 600,
            }}
        >
            {props.children}
        </span>
    );
}

function FileOptionCard(props: {
    checked: boolean;
    name: string;
    valueType: string;
    stage: string;
    description: string;
}) {
    return (
        <label
            style={{
                display: "grid",
                gap: "14px",
                border: props.checked ? "2px solid #0a6b50" : "1px solid #d7dee7",
                borderRadius: "16px",
                padding: "16px",
                background: props.checked
                    ? "linear-gradient(180deg, #f7fcfa 0%, #eff8f3 100%)"
                    : "#ffffff",
                boxShadow: props.checked
                    ? "0 10px 24px rgba(10, 107, 80, 0.10)"
                    : "0 8px 20px rgba(15, 23, 42, 0.04)",
                cursor: "pointer",
            }}
        >
            <CheckboxField
                checked={props.checked}
                label={props.name}
                helpText={props.description}
                onChange={() => undefined}
            />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <MetaPill>{props.valueType}</MetaPill>
                <MetaPill>{props.stage}</MetaPill>
            </div>
        </label>
    );
}

function App() {
    if (mode === "proposed") {
        return <ProgramStepProposalPreview />;
    }

    return (
        <ReviewShell
            title="Current Step 1 layout"
            note="This renders the real wizard against the test composition root. Use it to review the current hierarchy and interaction cost before drafting the OpenSpec change."
        >
            <div
                style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #d8e1ea",
                    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
                    overflow: "hidden",
                }}
            >
                <AppContext.Provider value={context}>
                    <SnackbarProvider>
                        <WizardPage />
                    </SnackbarProvider>
                </AppContext.Provider>
            </div>
        </ReviewShell>
    );
}

ReactDOM.createRoot(root).render(<App />);
