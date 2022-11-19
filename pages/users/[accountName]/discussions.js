import { useRouter } from "next/router";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import { UserDiscussions } from "../../../components/Profile/ProfileSections/ProfileSections";

export default function Discussions() {
	const router = useRouter();
	const { accountName } = router.query;
	return (
		<ProfileLayout router={router}>
			<UserDiscussions accountName={accountName} />
		</ProfileLayout>
	);
}
