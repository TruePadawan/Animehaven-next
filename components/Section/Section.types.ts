import React from "react";

export interface SectionProps {
    title: string;
    className?: string;
    headingId?: string;
    onBtnClick?: () => void;
    refreshable?: boolean;
    children?: React.ReactNode;
}