import { useRouter } from "next/router";
import ProfileLayout from "../../../components/Profile/ProfileLayout";
import { UserRecommendedItems } from "../../../components/Profile/ProfileSections/ProfileSections";

export default function Recommended() {
  const router = useRouter();
  const { accountName } = router.query;
  return (
    <ProfileLayout router={router}>
      {typeof accountName === "string" && (
        <UserRecommendedItems accountName={accountName} />
      )}
    </ProfileLayout>
  );
}
