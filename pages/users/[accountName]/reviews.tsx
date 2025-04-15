import {useRouter} from "next/router";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import {UserReviews} from "../../../components/Profile/ProfileSections/ProfileSections";

export default function Reviews() {
    const router = useRouter();
    const {accountName} = router.query;
    return (
        <ProfileLayout router={router}>
            {typeof accountName === "string" && (
                <UserReviews accountName={accountName}/>
            )}
        </ProfileLayout>
    );
}
