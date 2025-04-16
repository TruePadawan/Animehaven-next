import styles from "./style.module.css";
import { ComponentProps } from "react";

export interface InputProps extends ComponentProps<"input"> {
  required?: boolean;
}

const Input = ({ className = "", ...inputAttributes }: InputProps) => {
  return (
    <input
      type="text"
      className={`${styles.input} ${className}`}
      {...inputAttributes}
    />
  );
};

export default Input;
