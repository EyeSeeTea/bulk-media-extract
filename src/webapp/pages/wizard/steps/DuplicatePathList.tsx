import React from "react";
import { DuplicateTargetPathDetail } from "$/application/export/ExportPreview";
import i18n from "$/utils/i18n";

const DUPLICATE_PATH_DISPLAY_LIMIT = 10;

export const DuplicatePathList: React.FC<{ details: DuplicateTargetPathDetail[] }> = ({
    details,
}) => {
    const visible = details.slice(0, DUPLICATE_PATH_DISPLAY_LIMIT);
    const overflowCount = details.length - visible.length;

    return (
        <ul className="wizard-preview-duplicate-list">
            {visible.map(detail => (
                <li key={detail.path}>
                    <code>{detail.path}</code>
                    <ul>
                        {detail.rows.map(row => (
                            <li key={`${row.eventId}:${row.fileDataValueName}`}>
                                {i18n.t("Event {{eventId}} — {{dataElement}}", {
                                    eventId: row.eventId,
                                    dataElement: row.fileDataValueName,
                                    nsSeparator: false,
                                })}
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
            {overflowCount > 0 ? (
                <li>
                    {i18n.t("…and {{count}} more conflicting paths.", {
                        count: String(overflowCount),
                    })}
                </li>
            ) : null}
        </ul>
    );
};
