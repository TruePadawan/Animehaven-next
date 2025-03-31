import styles from "./style.module.css";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
    text: string;
    icon: React.ReactNode;
}

export default function Button(props: ButtonProps) {
    const {text, className, icon, ...btnAttr} = props
    return (
        <button className={`${styles.button} ${className || ""}`} {...btnAttr} type="button">
            {icon && icon}
            {text}
        </button>
    )
}