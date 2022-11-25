import { Add } from "@mui/icons-material";
import {
	SwipeableDrawer,
	useMediaQuery,
	Button as MUIButton,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useContext, useMemo, useState } from "react";
import Button from "../../components/Button/Button";
import { useEffect } from "react";
import Checkbox from "../../components/Checkbox/Checkbox";
import CheckboxList from "../../components/CheckboxList/CheckboxList";
import SearchInput from "../../components/Input/SearchInput/SearchInput";
import PageContainer from "../../components/PageContainer/PageContainer";
import Select from "../../components/Select/Select";
import { UserAuthContext } from "../../context/UserAuthContext";
import { DISCUSSION_TAGS } from "../../utilities/app-utilities";
import { getDiscussionsByTags } from "../../utilities/app-utilities";
import DiscussionItem from "../../components/Items/DiscussionItem/DiscussionItem";
import Loading from "../../components/Loading/Loading";

export default function Discussions() {
	// const { profileID } = useContext(UserAuthContext);
	// const [discussionsList, setDiscussionsList] = useState([]);
	// const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
	// const [filter, setFilter] = useState("all");
	// const [discussionTags, setDiscussionTags] = useState(() => {
	// 	const value = {};
	// 	DISCUSSION_TAGS.forEach((tag) => (value[tag] = true));
	// 	return value;
	// });
	// const [queryingDB, setQueryingDB] = useState(false);
	// const router = useRouter();
	// const matchesSmallDevice = useMediaQuery("(max-width: 600px)");

	// useEffect(() => {
	// 	const selectedTags = [];
	// 	for (const tag in discussionTags) {
	// 		if (discussionTags[tag] === true) {
	// 			selectedTags.push(tag.toLowerCase());
	// 		}
	// 	}
	// 	setQueryingDB(true);
	// 	getDiscussionsByTags(selectedTags)
	// 		.then((data) => {
	// 			setDiscussionsList(data);
	// 		})
	// 		.finally(() => {
	// 			setQueryingDB(false);
	// 		});
	// }, [discussionTags]);

	// function toggleFilterDrawer(open) {
	// 	setFilterDrawerIsOpen(open);
	// }

	// function onSelectValueChanged(event) {
	// 	setFilter(event.target.value);
	// }

	// function onCheckboxValueChanged(event) {
	// 	setDiscussionTags((snapshot) => {
	// 		snapshot[event.target.name] = event.target.checked;
	// 		return { ...snapshot };
	// 	});
	// }

	// const tagsElements = useMemo(() => {
	// 	return DISCUSSION_TAGS.map((tag) => (
	// 		<li key={tag}>
	// 			<Checkbox
	// 				id={tag}
	// 				label={tag}
	// 				name={tag}
	// 				checked={discussionTags[tag]}
	// 				onChange={onCheckboxValueChanged}
	// 			/>
	// 		</li>
	// 	));
	// }, [discussionTags]);

	// const discussions = useMemo(() => {
	// 	return discussionsList.map((discussion) => {
	// 		return (
	// 			<DiscussionItem
	// 				id={discussion.id}
	// 				title={discussion.title}
	// 				tag={discussion.tag}
	// 				creatorID={discussion.creator_id}
	// 			/>
	// 		);
	// 	});
	// }, [discussionsList]);

	return (
		<Fragment>
			<Head>
				<title>Animehaven | Discussions</title>
				<meta
					property="og:url"
					content="https://animehaven.vercel.app/discussions"
				/>
				<meta
					name="description"
					content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
				/>
				<meta property="og:title" content="Animehaven | Discussions" />
				<meta
					property="og:description"
					content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
				/>
				<meta name="twitter:title" content="Animehaven | Discussions" />
				<meta
					name="twitter:description"
					content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
				/>
			</Head>
			<PageContainer className="d-flex gap-2 justify-content-center">
				<h2>COMING SOON</h2>
			</PageContainer>
		</Fragment>
	);
}
