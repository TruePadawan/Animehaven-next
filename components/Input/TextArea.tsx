import { TextareaAutosize, TextareaAutosizeProps } from "@mui/material";
import styles from "./style.module.css";

export default function TextArea({
  className = "",
  ...textAreaAttributes
}: TextareaAutosizeProps) {
  const textareaClassName = `${styles.input} ${className}`;
  return (
    <TextareaAutosize className={textareaClassName} {...textAreaAttributes} />
  );
}
