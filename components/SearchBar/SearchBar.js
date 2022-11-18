import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import SearchInput from "../Input/SearchInput/SearchInput";
import styles from "./SearchBar.module.css";

const SearchBar = ({ searchCategories, searchText, searchCategory }) => {
	const router = useRouter();
	const [inputVal, setInputVal] = useState(searchText || "");
	const [selectVal, setSelectVal] = useState(searchCategories[0]);
	const selectRef = useRef();

	const updatePageURL = (searchText, searchCategory) => {
		router.push(`/search?cat=${searchCategory}&text=${searchText}`);
	};

	useEffect(() => {
		setInputVal(searchText || "");
		setSelectVal(() => {
			if (searchCategory) return searchCategory.toUpperCase();
			return searchCategories[0].toUpperCase();
		});
	}, [searchCategory, searchCategories, searchText]);

	const searchHandler = (e) => {
		e.preventDefault();
		updatePageURL(
			inputVal.toLowerCase(),
			selectRef.current.value.toLowerCase()
		);
	};

	return (
		<div className={styles.searchBar}>
			<select
				title="Search Category"
				ref={selectRef}
				value={selectVal}
				onChange={(e) => setSelectVal(e.target.value)}>
				{searchCategories.map((option) => (
					<option key={uuid()} value={option.toUpperCase()}>
						{option}
					</option>
				))}
			</select>
			<SearchInput
				searchFunc={searchHandler}
				value={inputVal}
				onChange={(e) => setInputVal(e.target.value)}
				minLength={3}
			/>
		</div>
	);
};

export default memo(SearchBar);
