import React from "react";

export interface BodyLayoutProps {
    children: React.ReactNode;
    className?: string;
    recentItems: "animes" | "discussions" | "lists"
}