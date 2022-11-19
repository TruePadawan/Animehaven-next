import { useRouter } from "next/router";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import { UserSavedLists } from "../../../components/Profile/ProfileSections/ProfileSections";

export default function SavedLists() {
	const router = useRouter();
	const { accountName } = router.query;
	return (
		<ProfileLayout router={router}>
			<UserSavedLists accountName={accountName} />
		</ProfileLayout>
	);
}
