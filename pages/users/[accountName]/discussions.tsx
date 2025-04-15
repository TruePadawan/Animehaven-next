import {useRouter} from "next/router";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import {UserDiscussions} from "../../../components/Profile/ProfileSections/ProfileSections";

export default function Discussions() {
    const router = useRouter();
    const {accountName} = router.query;
    // TODO: implement a loader here
    return (
        <ProfileLayout router={router}>
            {typeof accountName === "string" && (
                <UserDiscussions accountName={accountName}/>
            )
            }
        </ProfileLayout>
    );
}
