import { TextareaAutosize } from "@mui/material";
import styles from "./style.module.css";

export default function TextArea({ className = "", ...otherProps }) {
	const textareaClassName = `${styles.input} ${className}`;
	return <TextareaAutosize className={textareaClassName} {...otherProps} />;
}
