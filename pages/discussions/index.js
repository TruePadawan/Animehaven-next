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
import Checkbox from "../../components/Checkbox/Checkbox";
import CheckboxList from "../../components/CheckboxList/CheckboxList";
import SearchInput from "../../components/Input/SearchInput/SearchInput";
import PageContainer from "../../components/PageContainer/PageContainer";
import Select from "../../components/Select/Select";
import { UserAuthContext } from "../../context/UserAuthContext";

const TAGS = ["Announcement", "Support"];

export default function Discussions() {
	const { profileID } = useContext(UserAuthContext);
	const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
	const router = useRouter();
	const matchesSmallDevice = useMediaQuery("(max-width: 600px)");

	function toggleFilterDrawer(open) {
		setFilterDrawerIsOpen(open);
	}

	const tagsElements = useMemo(() => {
		return TAGS.map((tag) => (
			<li key={tag}>
				<Checkbox id={tag} label={tag} name={tag.toUpperCase()} />
			</li>
		));
	}, []);

	return (
		<Fragment>
			<Head>
				<title>Animehaven | Discussions</title>
				<meta
					property="og:url"
					content="https://animehaven.vercel.app/discussions"
				/>
				<meta name="description" content="COMING SOON" />
				<meta property="og:title" content="Animehaven | Discussions" />
				<meta property="og:description" content="COMING SOON" />
				<meta name="twitter:title" content="Animehaven | Discussions" />
				<meta name="twitter:description" content="COMING SOON" />
			</Head>
			<PageContainer className="d-flex gap-2">
				{!matchesSmallDevice && (
					<div className="d-flex flex-column gap-3">
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
					</div>
				</div>
			</PageContainer>
		</Fragment>
	);
}
