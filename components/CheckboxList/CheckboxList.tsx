import styles from "./styles.module.css";
import {CheckboxListProps} from "./CheckboxList.types";

// TODO: Get rid of the checkboxes prop, should be a children prop
const CheckboxList = (props: CheckboxListProps) => {
    const {checkboxes, label, className} = props;
    const componentClassName = `${styles.component} ${className || ""}`;
    return (
        <div className={componentClassName}>
            <span className={styles.title}>{label}</span>
            <ul className={styles.checkboxes}>{checkboxes}</ul>
        </div>
    );
};

export default CheckboxList;
