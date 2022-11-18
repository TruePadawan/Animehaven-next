import styles from "./style.module.css";

const Input = ({ className = "", compRef, ...inputAttr }) => {
  return (
    <input
      type="text"
      className={`${styles.searchInput} ${className}`}
      aria-label="Search"
      ref={compRef}
      {...inputAttr}
    />
  );
};

export default Input;