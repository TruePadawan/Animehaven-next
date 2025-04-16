import React from "react";

export interface CheckboxProps {
  id?: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
