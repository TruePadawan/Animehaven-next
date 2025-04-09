import {TextareaAutosize} from "@mui/material";
import styles from "./style.module.css";
import {HTMLAttributes} from "react";

type TextAreaProps = HTMLAttributes<HTMLTextAreaElement>;
export default function TextArea({className = "", ...textAreaAttributes}: TextAreaProps) {
    const textareaClassName = `${styles.input} ${className}`;
    return <TextareaAutosize className={textareaClassName} {...textAreaAttributes} />;
}
