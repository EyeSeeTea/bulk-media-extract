import React from "react";

type StepIntroProps = {
    title: string;
    description?: string;
};

export const StepIntro: React.FC<StepIntroProps> = ({ title, description }) => {
    return (
        <div className="wizard-step-intro" data-testid="wizard-step-intro">
            <h3 className="wizard-step-intro-title">{title}</h3>
            {description ? <p className="wizard-step-intro-description">{description}</p> : null}
        </div>
    );
};
