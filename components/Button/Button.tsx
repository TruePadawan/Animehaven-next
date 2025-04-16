import { ComponentProps, ReactNode } from "react";
import styles from "./style.module.css";

export interface ButtonProps extends ComponentProps<"button"> {
  text: string;
  icon: ReactNode;
}

export default function Button(props: ButtonProps) {
  const { text, className, icon, ...btnAttr } = props;
  return (
    <button
      className={`${styles.button} ${className || ""}`}
      {...btnAttr}
      type="button"
    >
      {icon && icon}
      {text}
    </button>
  );
}
