import React from "react";
import { Tooltip } from "@dhis2/ui";
import { IconInfo24 } from "@dhis2/ui-icons";
import i18n from "$/utils/i18n";
import "./InfoTooltip.css";

type InfoTooltipProps = {
    children: React.ReactNode;
    "data-testid"?: string;
};

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
    children,
    "data-testid": dataTestId,
}) => {
    return (
        <span className="info-tooltip" data-testid={dataTestId}>
            <Tooltip content={children} openDelay={0} closeDelay={0} maxWidth={340}>
                <span className="info-tooltip-trigger" aria-label={i18n.t("More information")}>
                    <IconInfo24 />
                </span>
            </Tooltip>
        </span>
    );
};
