import { Alert, Button } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  Fragment,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import Input from "../../components/Input/Input";
import TextArea from "../../components/Input/TextArea";
import Select from "../../components/Select/Select";
import { UserAuthContext } from "../../context/authentication/UserAuthContext";
import styles from "../../styles/create-discussion.module.css";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { DISCUSSION_TAGS } from "../../utilities/global-constants";
import { Database } from "../../database.types";
import { getErrorMessage } from "../../utilities/app-utilities";

const allowed_tags = DISCUSSION_TAGS.map((tag) => tag.toLowerCase());
export default function Create() {
  const supabase = useSupabaseClient<Database>();
  const { profileID } = useContext(UserAuthContext);
  const [errorText, setErrorText] = useState("");
  const [createBtnDisabled, setCreateBtnDisabled] = useState(false);
  const [discussionData, setDiscussionData] = useState({
    title: "",
    body: "",
    tag: "",
  });
  const router = useRouter();

  useEffect(() => {
    const cachedTitle = window.localStorage.getItem("discussion_title");
    const cachedBody = window.localStorage.getItem("discussion_body");
    setDiscussionData({
      title: cachedTitle || "",
      body: cachedBody || "",
      tag: DISCUSSION_TAGS[0].toLowerCase(),
    });
  }, []);

  useEffect(() => {
    if (profileID === undefined) {
      setCreateBtnDisabled(true);
      setErrorText("You need to be signed in to create a discussion!");
    } else {
      setCreateBtnDisabled(false);
      setErrorText("");
    }
  }, [profileID]);

  function onDiscussionCreated() {
    window.localStorage.removeItem("discussion_title");
    window.localStorage.removeItem("discussion_body");
    router.push("/discussions");
  }

  async function formSubmitHandler(event: React.FormEvent) {
    event.preventDefault();

    if (profileID !== undefined) {
      setCreateBtnDisabled(true);
      const data = {
        ...discussionData,
        creator_id: "",
      };
      data.creator_id = profileID;
      try {
        if (!allowed_tags.includes(data.tag)) {
          setErrorText("Failed to create discussion - Invalid tag specified!");
        } else {
          await supabase.from("discussions").insert(data).throwOnError();
          onDiscussionCreated();
        }
      } catch (error) {
        setErrorText(`Failed to create discussion - ${getErrorMessage(error)}`);
      }
      setCreateBtnDisabled(false);
    }
  }

  function onCancelBtnClicked() {
    const { title, body } = discussionData;
    const titleTrimmed = title.trim();
    const bodyTrimmed = body.trim();

    if (titleTrimmed.length > 0) {
      window.localStorage.setItem("discussion_title", titleTrimmed);
    }
    if (bodyTrimmed.length > 0) {
      window.localStorage.setItem("discussion_body", bodyTrimmed);
    }

    router.push("/discussions");
  }

  function onTitleInputValueChanged(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setDiscussionData((snapshot) => {
      return { ...snapshot, title: event.target.value };
    });
  }

  function onBodyInputValueChanged(
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    setDiscussionData((snapshot) => {
      return { ...snapshot, body: event.target.value };
    });
  }

  function onSelectChanged(event: React.ChangeEvent<HTMLSelectElement>) {
    setDiscussionData((snapshot) => {
      return { ...snapshot, tag: event.target.value };
    });
  }

  const createBtnStyles = {
    backgroundColor: "#1E1E1E",
    "&:hover": {
      backgroundColor: "#313131",
    },
  };
  return (
    <Fragment>
      <Head>
        <title>Animehaven | Create a Discussion</title>
      </Head>
      <div className={styles["create-discussion-container"]}>
        {errorText.length > 0 && <Alert severity="warning">{errorText}</Alert>}
        <h2 className="fs-3 mt-3">Create a Discussion</h2>
        <form onSubmit={formSubmitHandler} className="d-flex flex-column gap-2">
          <div className="d-flex flex-column">
            <label htmlFor="title-field" className={styles.label}>
              Title
            </label>
            <Input
              className={styles["title-field"]}
              spellCheck="false"
              id="title-field"
              minLength={4}
              value={discussionData.title}
              onChange={onTitleInputValueChanged}
              required
            />
          </div>
          <div className="d-flex flex-column">
            <label htmlFor="body-field" className={styles.label}>
              Body
            </label>
            <TextArea
              minRows={6}
              id="body-field"
              value={discussionData.body}
              onChange={onBodyInputValueChanged}
              required
            />
          </div>
          <div className="d-flex flex-column gap-1">
            <span className={styles.label}>Tags</span>
            <Select value={discussionData.tag} onChange={onSelectChanged}>
              {DISCUSSION_TAGS.map((tag, index) => {
                return (
                  <option key={index} value={tag.toLowerCase()}>
                    {tag}
                  </option>
                );
              })}
            </Select>
          </div>
          <div className="mt-2 d-flex flex-column gap-2">
            <Button
              variant="contained"
              sx={createBtnStyles}
              type="submit"
              disabled={createBtnDisabled}
            >
              Create
            </Button>
            <Button type="button" color="warning" onClick={onCancelBtnClicked}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Fragment>
  );
}

Create.getLayout = (page: ReactElement) => <HeaderLayout>{page}</HeaderLayout>;
