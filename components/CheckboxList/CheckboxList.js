import styles from "./styles.module.css";

const CheckboxList = (props) => {
	const { checkboxes, label, className } = props;
	const componentClassName = `${styles.component} ${className || ""}`;
	return (
		<div className={componentClassName}>
			<span className={styles.title}>{label}</span>
			<ul className={styles.checkboxes}>{checkboxes}</ul>
		</div>
	);
};

export default CheckboxList;
