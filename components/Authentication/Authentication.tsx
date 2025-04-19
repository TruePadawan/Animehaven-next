import { Fragment, useContext } from "react";
import { UserAuthContext } from "../../context/authentication/UserAuthContext";
import ProfileMenuButton from "./ProfileMenuButton";
import OAuthButton from "./OAuthButton";

const Authentication = () => {
  const { profileID } = useContext(UserAuthContext);

  const userSignedIn = profileID !== undefined;
  return (
    <>
      {userSignedIn && <ProfileMenuButton profileID={profileID} />}
      {!userSignedIn && (
        <Fragment>
          <OAuthButton />
        </Fragment>
      )}
    </>
  );
};

export default Authentication;
