import {useRouter} from "next/router";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import {UserItems} from "../../../components/Profile/ProfileSections/ProfileSections";

export default function Watched() {
    const router = useRouter();
    const {accountName} = router.query;
    return (
        <ProfileLayout router={router}>
            {typeof accountName === "string" && (
                <UserItems title="Watched" status="WATCHED" accountName={accountName}/>
            )}
        </ProfileLayout>
    );
}
