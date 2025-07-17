import { Add } from "@mui/icons-material";
import {
  Button as MUIButton,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  Fragment,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Button from "../../components/Button/Button";
import Checkbox from "../../components/Checkbox/Checkbox";
import CheckboxList from "../../components/CheckboxList/CheckboxList";
import Input from "../../components/Input/Input";
import BodyLayout from "../../components/BodyLayout/BodyLayout";
import Select from "../../components/Select/Select";
import { UserAuthContext } from "../../context/authentication/UserAuthContext";
import { getDiscussionsByTags } from "../../utilities/app-utilities";
import DiscussionItem from "../../components/Items/DiscussionItem/DiscussionItem";
import Loading from "../../components/Loading/Loading";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { DISCUSSION_TAGS } from "../../utilities/global-constants";
import { Database, Tables } from "../../database.types";
import { NotificationContext } from "../../context/notifications/NotificationContext";
import { HasErrorMessage } from "../../utilities/global.types";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

export default function Discussions() {
  const supabase = useSupabaseClient<Database>();
  const { profileID } = useContext(UserAuthContext);
  const [discussionsList, setDiscussionsList] = useState<
    Tables<"discussions">[]
  >([]);
  const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [discussionTags, setDiscussionTags] = useState(() => {
    const value: { [key: string]: boolean } = {};
    DISCUSSION_TAGS.forEach((tag) => (value[tag] = true));
    return value;
  });
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const matchesSmallDevice = useMediaQuery("(max-width: 640px)");
  const { showNotification } = useContext(NotificationContext);

  useEffect(() => {
    const selectedTags: Array<string> = [];
    for (const tag in discussionTags) {
      if (discussionTags[tag]) {
        selectedTags.push(tag.toLowerCase());
      }
    }
    const timeoutID = setTimeout(async () => {
      setSearching(true);

      try {
        if (filter === "all") {
          const { data: searchResults } = await supabase
            .from("discussions")
            .select()
            .in("tag", selectedTags)
            .ilike("title", `%${searchText.trim()}%`)
            .throwOnError();

          if (searchResults !== null) {
            setDiscussionsList(searchResults);
          }
        } else if (filter === "your_discussions" && profileID !== undefined) {
          const { data: searchResults } = await supabase
            .from("discussions")
            .select()
            .in("tag", selectedTags)
            .eq("creator_id", profileID)
            .ilike("title", `%${searchText.trim()}%`)
            .throwOnError();

          if (searchResults !== null) {
            setDiscussionsList(searchResults);
          }
        }
      } catch (error) {
        showNotification("Error while trying to search", {
          severity: "error",
          error: error as HasErrorMessage,
        });
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeoutID);
  }, [discussionTags, filter, profileID, supabase, searchText]);

  function toggleFilterDrawer(open: boolean) {
    setFilterDrawerIsOpen(open);
  }

  function onSelectValueChanged(event: React.ChangeEvent<HTMLSelectElement>) {
    setFilter(event.target.value);
  }

  function onCheckboxValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
    setDiscussionTags((snapshot) => {
      snapshot[event.target.name] = event.target.checked;
      return { ...snapshot };
    });
  }

  const tagsElements = DISCUSSION_TAGS.map((tag) => (
    <li key={tag}>
      <Checkbox
        id={tag}
        label={tag}
        name={tag}
        checked={discussionTags[tag]}
        onChange={onCheckboxValueChanged}
      />
    </li>
  ));

  return (
    <Fragment>
      <Head>
        <title>Animehaven | Discussions</title>
        <meta
          property="og:url"
          content="https://animehaven.vercel.app/discussions"
        />
        <meta
          name="description"
          content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
        />
        <meta property="og:title" content="Animehaven | Discussions" />
        <meta
          property="og:description"
          content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
        />
        <meta name="twitter:title" content="Animehaven | Discussions" />
        <meta
          name="twitter:description"
          content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
        />
      </Head>
      {!matchesSmallDevice && (
        <div className="d-flex flex-column gap-3">
          <Select
            title="Filter discussions"
            value={filter}
            onChange={onSelectValueChanged}
          >
            <option value="all">All</option>
            {profileID && (
              <option value="your_discussions">Your Discussions</option>
            )}
          </Select>
          <CheckboxList
            className="mt-2"
            label="Tags"
            checkboxes={tagsElements}
          />
        </div>
      )}
      {matchesSmallDevice && (
        <SwipeableDrawer
          anchor="right"
          PaperProps={{ sx: { backgroundColor: "#1E1E1E" } }}
          open={filterDrawerIsOpen}
          onClose={() => toggleFilterDrawer(false)}
          onOpen={() => toggleFilterDrawer(true)}
        >
          <div className="d-flex flex-column gap-3 p-2">
            <Select title="Filter discussions">
              <option value="all">All</option>
              {profileID && (
                <option value="your_discussions">Your Discussions</option>
              )}
            </Select>
            <CheckboxList
              className="mt-2"
              label="Tags"
              checkboxes={tagsElements}
            />
          </div>
        </SwipeableDrawer>
      )}
      <div className="flex-grow-1 d-flex flex-column gap-2">
        <div className="d-flex justify-content-between">
          {matchesSmallDevice && (
            <MUIButton
              onClick={() => toggleFilterDrawer(true)}
              sx={{ color: "whitesmoke" }}
            >
              Filter
            </MUIButton>
          )}
          {profileID && (
            <Button
              text="New Discussion"
              className="ms-auto"
              icon={<Add />}
              onClick={() => router.push("/discussions/create")}
            />
          )}
        </div>
        <div className="d-flex flex-column flex-grow-1">
          <Input
            className="py-2"
            placeholder="Search Discussions"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            spellCheck={false}
          />
          {searching && <Loading sx={{ marginTop: "10px" }} />}
          {!searching && discussionsList.length === 0 && (
            <div className="my-5 d-flex flex-column align-items-center justify-content-center">
              <SearchOffOutlinedIcon sx={{ fontSize: "5rem" }} />
              <p className="fs-5">No discussions found</p>
            </div>
          )}
          {!searching && (
            <ul style={{ marginTop: "10px" }}>
              {discussionsList.map((discussion) => {
                return (
                  <DiscussionItem
                    key={discussion.id}
                    id={discussion.id}
                    title={discussion.title}
                    tag={discussion.tag}
                    creator_id={discussion.creator_id}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Fragment>
  );
}

Discussions.getLayout = (page: ReactElement) => (
  <HeaderLayout>
    <BodyLayout className="d-flex gap-2" recentItems="discussions">
      {page}
    </BodyLayout>
  </HeaderLayout>
);
