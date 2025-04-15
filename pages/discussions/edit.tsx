import {Alert, Button} from "@mui/material";
import Head from "next/head";
import {useRouter} from "next/router";
import React, {Fragment, ReactElement, useContext, useEffect, useState} from "react";
import Input from "../../components/Input/Input";
import TextArea from "../../components/Input/TextArea";
import Select from "../../components/Select/Select";
import {UserAuthContext} from "../../context/UserAuthContext";
import styles from "../../styles/create-discussion.module.css";
import Loading from "../../components/Loading/Loading";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {DISCUSSION_TAGS} from "../../utilities/global-constants";
import {Database} from "../../database.types";
import {getErrorMessage} from "../../utilities/app-utilities";

export default function Edit() {
    const supabase = useSupabaseClient<Database>();
    const {profileID} = useContext(UserAuthContext);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState("");
    const [updateBtnDisabled, setUpdateBtnDisabled] = useState(true);
    const [discussionData, setDiscussionData] = useState({
        title: "",
        body: "",
        tag: "",
    });
    const router = useRouter();
    const discussionID = router.query?.id;

    // TODO: use notification system to notify user of errors in this useEffect
    useEffect(() => {
        if (router.isReady && profileID) {
            const discussionID = router.query?.id;
            if (discussionID === undefined) {
                router.replace("/discussions");
            } else {
                supabase
                    .from("discussions")
                    .select()
                    .eq("id", discussionID)
                    .then((response) => {
                        const {data, error} = response;
                        if (error) {
                            throw new Error(`Failed to get data for discussion! - ${getErrorMessage(error)}`);
                        }
                        const {title, body, tag, creator_id} = data[0];
                        if (creator_id !== profileID) {
                            router.replace("/discussions");
                        }
                        setDiscussionData({title, body, tag});
                        setUpdateBtnDisabled(false);
                        setLoading(false);
                    });
            }
        }
    }, [router, profileID, supabase]);

    if (!router.isReady || loading) {
        return (
            <Fragment>
                <Head>
                    <title>Animehaven | Edit Discussion</title>
                </Head>
                <Loading/>
            </Fragment>
        );
    }

    function onDiscussionEdited() {
        router.push(`/discussions/${discussionID}`);
    }

    async function formSubmitHandler(event: React.FormEvent) {
        event.preventDefault();

        if (profileID !== undefined) {
            setUpdateBtnDisabled(true);
            try {
                await supabase
                    .from("discussions")
                    .update(discussionData)
                    .eq("id", discussionID)
                    .throwOnError();
                onDiscussionEdited();
            } catch (error) {
                setErrorText(
                    `Failed to complete action - ${getErrorMessage(error)}`
                );
                setUpdateBtnDisabled(false);
            }
        }
    }

    async function onDeleteButtonClicked() {
        if (profileID !== undefined) {
            try {
                await supabase
                    .from("discussions")
                    .delete()
                    .eq("id", discussionID)
                    .throwOnError();
                router.replace("/discussions");
            } catch (error) {
                setErrorText("Failed to delete discussion!");
            }
        }
    }

    function onCancelButtonClicked() {
        router.push("/discussions");
    }

    function onTitleInputValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
        setDiscussionData((snapshot) => {
            return {...snapshot, title: event.target.value};
        });
    }

    function onBodyInputValueChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setDiscussionData((snapshot) => {
            return {...snapshot, body: event.target.value};
        });
    }

    function onSelectChanged(event: React.ChangeEvent<HTMLSelectElement>) {
        setDiscussionData((snapshot) => {
            return {...snapshot, tag: event.target.value};
        });
    }

    const updateBtnStyles = {
        backgroundColor: "#1E1E1E",
        "&:hover": {
            backgroundColor: "#313131",
        },
    };

    return (
        <Fragment>
            <Head>
                <title>Animehaven | Edit Discussion</title>
            </Head>
            <div className={styles["create-discussion-container"]}>
                {errorText.length > 0 && <Alert severity="warning">{errorText}</Alert>}
                <h2 className="fs-3 mt-3">Edit Discussion</h2>
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
                            type="submit"
                            sx={{updateBtnStyles}}
                            disabled={updateBtnDisabled}>
                            Update
                        </Button>
                        <Button type="button" color="error" onClick={onDeleteButtonClicked}>
                            Delete
                        </Button>
                        <Button
                            type="button"
                            color="warning"
                            onClick={onCancelButtonClicked}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}

Edit.getLayout = (page: ReactElement) => <HeaderLayout>{page}</HeaderLayout>;
