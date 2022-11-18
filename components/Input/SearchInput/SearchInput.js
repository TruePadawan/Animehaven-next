import SearchIcon from '@mui/icons-material/Search';
import Input from "../Input";
import styles from "./style.module.css";

const SearchInput = ({ searchFunc, className, ...inputAttr }) => {
  return (
    <form className="input-group flex-nowrap" onSubmit={searchFunc}>
      <Input {...inputAttr} className={`${className || ""}`} required />
      <span className="input-group-text">
        <button className={styles.btn} type="submit" title="search">
          <SearchIcon />
        </button>
      </span>
    </form>
  );
};

export default SearchInput;