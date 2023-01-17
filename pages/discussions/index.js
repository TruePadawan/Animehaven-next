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
import BodyLayout from "../../components/BodyLayout/BodyLayout";
import Select from "../../components/Select/Select";
import { UserAuthContext } from "../../context/UserAuthContext";
import { DISCUSSION_TAGS } from "../../utilities/app-utilities";
import { getDiscussionsByTags } from "../../utilities/app-utilities";
import DiscussionItem from "../../components/Items/DiscussionItem/DiscussionItem";
import Loading from "../../components/Loading/Loading";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";

export default function Discussions() {
	const { profileID } = useContext(UserAuthContext);
	const [discussionsList, setDiscussionsList] = useState([]);
	const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
	const [filter, setFilter] = useState("all");
	const [discussionTags, setDiscussionTags] = useState(() => {
		const value = {};
		DISCUSSION_TAGS.forEach((tag) => (value[tag] = true));
		return value;
	});
	const [queryingDB, setQueryingDB] = useState(false);
	const router = useRouter();
	const matchesSmallDevice = useMediaQuery("(max-width: 640px)");

	useEffect(() => {
		const selectedTags = [];
		for (const tag in discussionTags) {
			if (discussionTags[tag] === true) {
				selectedTags.push(tag.toLowerCase());
			}
		}
		setQueryingDB(true);
		if (filter === "all") {
			getDiscussionsByTags(selectedTags).then((data) => {
				setDiscussionsList(data);
				setQueryingDB(false);
			});
		} else if (filter === "your_discussions" && profileID !== null) {
			getDiscussionsByTags(selectedTags, profileID).then((data) => {
				setDiscussionsList(data);
				setQueryingDB(false);
			});
		}
	}, [discussionTags, filter, profileID]);

	function toggleFilterDrawer(open) {
		setFilterDrawerIsOpen(open);
	}

	function onSelectValueChanged(event) {
		setFilter(event.target.value);
	}

	function onCheckboxValueChanged(event) {
		setDiscussionTags((snapshot) => {
			snapshot[event.target.name] = event.target.checked;
			return { ...snapshot };
		});
	}

	const tagsElements = useMemo(() => {
		return DISCUSSION_TAGS.map((tag) => (
			<li key={tag}>
				<Checkbox
					id={tag}
					label={tag}
					name={tag}
					checked={discussionTags[tag]}
					onChange={onCheckboxValueChanged}
				/>
			</li>
		));
	}, [discussionTags]);

	const discussions = useMemo(() => {
		return discussionsList.map((discussion) => {
			return (
				<DiscussionItem
					key={discussion.id}
					id={discussion.id}
					title={discussion.title}
					tag={discussion.tag}
					creatorID={discussion.creator_id}
				/>
			);
		});
	}, [discussionsList]);

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
			{!matchesSmallDevice && (
				<div className="d-flex flex-column gap-3">
					<Select
						title="Filter discussions"
						value={filter}
						onChange={onSelectValueChanged}>
						<option value="all">All</option>
						{profileID && (
							<option value="your_discussions">Your Discussions</option>
						)}
					</Select>
					<CheckboxList
						className="mt-2"
						label="Tags"
						checkboxes={tagsElements}
					/>
				</div>
			)}
			{matchesSmallDevice && (
				<SwipeableDrawer
					anchor="right"
					PaperProps={{ sx: { backgroundColor: "#1E1E1E" } }}
					open={filterDrawerIsOpen}
					onClose={toggleFilterDrawer.bind(this, false)}
					onOpen={toggleFilterDrawer.bind(this, true)}>
					<div className="d-flex flex-column gap-3 p-2">
						<Select title="Filter discussions">
							<option value="all">All</option>
							{profileID && (
								<option value="your_discussions">Your Discussions</option>
							)}
						</Select>
						<CheckboxList
							className="mt-2"
							label="Tags"
							checkboxes={tagsElements}
						/>
					</div>
				</SwipeableDrawer>
			)}
			<div className="flex-grow-1 d-flex flex-column gap-2">
				<div className="d-flex justify-content-between">
					{matchesSmallDevice && (
						<MUIButton
							onClick={toggleFilterDrawer.bind(this, true)}
							sx={{ color: "whitesmoke" }}>
							Filter
						</MUIButton>
					)}
					{profileID && (
						<Button
							text="New Discussion"
							className="ms-auto"
							icon={<Add />}
							onClick={() => router.push("/discussions/create")}
						/>
					)}
				</div>
				<div className="d-flex flex-column flex-grow-1">
					<SearchInput
						placeholder="Search Discussions"
						minLength={4}
						spellCheck={false}
					/>
					{queryingDB && <Loading sx={{ marginTop: "10px" }} />}
					{!queryingDB && <ul style={{ marginTop: "10px" }}>{discussions}</ul>}
				</div>
			</div>
		</Fragment>
	);
}

Discussions.getLayout = (page) => (
	<HeaderLayout>
		<BodyLayout className="d-flex gap-2" recentItems="discussions">
			{page}
		</BodyLayout>
	</HeaderLayout>
);
