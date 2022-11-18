import ProfileLayout from "../../../components/Profile/ProfileLayout"
import { UserSavedLists } from "../../../components/Profile/ProfileSections/ProfileSections"
import { getProfileData, getProfileID } from "../../../utilities/app-utilities";

export default function SavedLists(props) {
    return (
        <ProfileLayout {...props}>
            <UserSavedLists accountName={props.accountName} />
        </ProfileLayout>
    )
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
