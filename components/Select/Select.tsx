import styles from "./style.module.css";
import { ComponentProps, LegacyRef } from "react";

interface SelectProps extends ComponentProps<"select"> {
  compRef?: LegacyRef<HTMLSelectElement>;
}

export default function Select(props: SelectProps) {
  const { children, className = "", compRef, ...selectAttr } = props;
  return (
    <select
      className={`${styles.select} ${className}`}
      {...selectAttr}
      ref={compRef}
    >
      {children}
    </select>
  );
}
