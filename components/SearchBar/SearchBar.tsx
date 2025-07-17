import { memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import SearchInput from "../Input/SearchInput/SearchInput";
import styles from "./SearchBar.module.css";
import { useMediaQuery } from "@mui/material";
import Select from "../Select/Select";

interface SearchBarProps {
  searchText: string;
  searchCategory: string;
  searchCategories: string[];
}

const SearchBar = ({
  searchCategories,
  searchText,
  searchCategory,
}: SearchBarProps) => {
  const router = useRouter();
  const [inputVal, setInputVal] = useState(searchText);
  const [selectVal, setSelectVal] = useState(searchCategories[0]);
  const matchesSmallDevice = useMediaQuery("(max-width: 500px)");

  const updatePageURL = (searchText: string, searchCategory: string) => {
    router.push(`/search?cat=${searchCategory}&text=${searchText}`);
  };

  useEffect(() => {
    setInputVal(searchText);
    setSelectVal(searchCategory.toUpperCase());
  }, [searchCategory, searchText]);

  const searchHandler = () => {
    updatePageURL(inputVal.toLowerCase(), selectVal.toLowerCase());
  };

  const componentClassName = matchesSmallDevice
    ? "d-flex flex-column w-100 gap-2"
    : styles.searchBar;

  const selectOptionsEl = searchCategories.map((option) => (
    <option key={uuid()} value={option.toUpperCase()}>
      {option}
    </option>
  ));
  return (
    <div className={componentClassName}>
      {matchesSmallDevice && (
        <Select
          className="align-self-start"
          title="Search Category"
          value={selectVal}
          onChange={(e) => setSelectVal(e.target.value)}
        >
          {selectOptionsEl}
        </Select>
      )}
      {!matchesSmallDevice && (
        <select
          className={styles.searchCategory}
          title="Search Category"
          value={selectVal}
          onChange={(e) => setSelectVal(e.target.value)}
        >
          {selectOptionsEl}
        </select>
      )}
      <SearchInput
        className="flex-grow-1"
        searchFunc={searchHandler}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        minLength={3}
      />
    </div>
  );
};

export default memo(SearchBar);
