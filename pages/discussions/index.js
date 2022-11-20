import { Add } from "@mui/icons-material";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useContext, useMemo } from "react";
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
	const router = useRouter();

	function routeToNewDiscussion() {
		router.push("/discussions/new");
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
				<div className="flex-grow-1 d-flex flex-column gap-2">
					<div className="d-flex justify-content-between">
						{profileID && (
							<Button
								text="New Discussion"
								className="ms-auto"
								icon={<Add />}
								onClick={routeToNewDiscussion}
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
