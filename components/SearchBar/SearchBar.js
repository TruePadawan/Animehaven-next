import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { v4 as uuid } from "uuid";
import SearchInput from "../Input/SearchInput/SearchInput";
import styles from "./SearchBar.module.css";
import { useMediaQuery } from "@mui/material";
import Select from "../Select/Select";

const SearchBar = ({ searchCategories, searchText, searchCategory }) => {
	const router = useRouter();
	const [inputVal, setInputVal] = useState(searchText || "");
	const [selectVal, setSelectVal] = useState(searchCategories[0]);
	const selectRef = useRef();
	const matchesSmallDevice = useMediaQuery("(max-width: 500px)");

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
					compRef={selectRef}
					value={selectVal}
					onChange={(e) => setSelectVal(e.target.value)}>
					{selectOptionsEl}
				</Select>
			)}
			{!matchesSmallDevice && (
				<select
					className={styles.searchCategory}
					title="Search Category"
					ref={selectRef}
					value={selectVal}
					onChange={(e) => setSelectVal(e.target.value)}>
					{selectOptionsEl}
				</select>
			)}
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
