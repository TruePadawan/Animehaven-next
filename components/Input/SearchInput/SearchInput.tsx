import SearchIcon from "@mui/icons-material/Search";
import Input, { InputProps } from "../Input";
import styles from "./style.module.css";
import { FormEvent } from "react";

interface SearchInputProps extends InputProps {
  searchFunc?: Function;
}

const SearchInput = ({
  searchFunc,
  className = "",
  ...inputProps
}: SearchInputProps) => {
  const inputClassName = `flex-grow-1 ${className}`;

  function formSubmitHandler(e: FormEvent) {
    e.preventDefault();
    if (searchFunc) searchFunc();
  }

  return (
    <form className="input-group flex-nowrap" onSubmit={formSubmitHandler}>
      <Input
        {...inputProps}
        className={inputClassName}
        aria-label="Search"
        title="Search"
        required
      />
      <span className="input-group-text">
        <button className={styles.btn} type="submit" title="search">
          <SearchIcon />
        </button>
      </span>
    </form>
  );
};

export default SearchInput;
