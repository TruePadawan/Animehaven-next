import styles from "./style.module.css";

export default function Button({text, className, icon, ...btnAttr}) {
    return (
        <button className={`${styles.button} ${className || ""}`} {...btnAttr} type="button">
            {icon && icon}
            {text}
        </button>
    )
}