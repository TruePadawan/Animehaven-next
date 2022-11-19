import ProfileLayout from "../../../components/Profile/ProfileLayout";
import { UserLists } from "../../../components/Profile/ProfileSections/ProfileSections";
import { useRouter } from "next/router";

export default function Profile() {
	const router = useRouter();
	const { accountName } = router.query;
	return (
		<ProfileLayout router={router}>
			<UserLists accountName={accountName} />
		</ProfileLayout>
	);
}
