import styles from "./style.module.css";
import {ButtonProps} from "./Button.types";

export default function Button(props: ButtonProps) {
    const {text, className, icon, ...btnAttr} = props
    return (
        <button className={`${styles.button} ${className || ""}`} {...btnAttr} type="button">
            {icon && icon}
            {text}
        </button>
    )
}