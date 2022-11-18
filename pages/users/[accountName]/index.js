import { getProfileData, getProfileID } from "../../../utilities/app-utilities";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import { UserLists } from "../../../components/Profile/ProfileSections/ProfileSections";

export default function Profile(props) {
	return (
		<ProfileLayout {...props}>
			<UserLists accountName={props.accountName} />
		</ProfileLayout>
	);
}

export async function getServerSideProps(context) {
	const { accountName } = context.params;
	const id = await getProfileID(accountName);
	if (id === null) {
		return {
			props: {
				profileExists: false,
				accountName,
			},
		};
	}
	const { avatar_url, display_name, bio } = await getProfileData("*", id);
	return {
		props: {
			profileExists: true,
			accountName,
			data: {
				avatar_url,
				display_name,
				bio,
			},
		},
	};
}
