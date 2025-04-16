import React from "react";
import { RecentProps } from "./Recent.types";

export interface BodyLayoutProps {
  children: React.ReactNode;
  className?: string;
  recentItems?: RecentProps["type"];
}
