import styles from "./style.module.css";

export default function Select({children, className, compRef, ...selectAttr}) {
  return (
    <select className={`${styles.select} ${className || ""}`} {...selectAttr} ref={compRef}>
        {children}
    </select>
  );
}
