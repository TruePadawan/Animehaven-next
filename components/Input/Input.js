import styles from "./style.module.css";

const Input = ({ className = "", compRef, ...inputAttr }) => {
  return (
    <input
      type="text"
      className={`${styles.input} ${className}`}
      ref={compRef}
      {...inputAttr}
    />
  );
};

export default Input;