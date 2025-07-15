import React, {
  Fragment,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { Masonry } from "@mui/lab";
import Add from "@mui/icons-material/Add";
import {
  Button as MUIButton,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";
import BodyLayout from "../../components/BodyLayout/BodyLayout";
import Button from "../../components/Button/Button";
import Select from "../../components/Select/Select";
import Checkbox from "../../components/Checkbox/Checkbox";
import ListItem from "../../components/Items/ListItem/ListItem";
import { UserAuthContext } from "../../context/authentication/UserAuthContext";
import CreateList from "../../components/CreateList/CreateList";
import Loading from "../../components/Loading/Loading";
import Head from "next/head";
import CheckboxList from "../../components/CheckboxList/CheckboxList";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { LIST_GENRES } from "../../utilities/global-constants";
import { Database, Tables } from "../../database.types";
import { ListGenres } from "../../components/CreateList/CreateList.types";
import { NotificationContext } from "../../context/notifications/NotificationContext";
import { HasErrorMessage } from "../../utilities/global.types";
import Input from "../../components/Input/Input";

const Lists = () => {
  const supabase = useSupabaseClient<Database>();
  const { profileID } = useContext(UserAuthContext);
  const [showCreateListDialog, setShowCreateListDialog] = useState(false);
  const [lists, setLists] = useState<Tables<"anime_lists">[]>([]);
  const [listFilter, setListFilter] = useState("all");
  const [queryOngoing, setQueryOngoing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [acceptedGenres, setAcceptedGenres] = useState(() => {
    const genres: ListGenres = {};
    LIST_GENRES.forEach((genre) => {
      genres[genre.toUpperCase()] = true;
    });
    return genres;
  });
  const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
  const matchesSmallDevice = useMediaQuery("(max-width: 600px)");
  const { showNotification } = useContext(NotificationContext);

  // Handle searching for lists and filtering the results
  useEffect(() => {
    const timeoutID = setTimeout(async () => {
      setQueryOngoing(true);
      try {
        if (listFilter === "all") {
          const { data: searchResults } = await supabase
            .from("anime_lists")
            .select()
            .ilike("title", `%${searchText.trim()}%`)
            .throwOnError();

          if (searchResults !== null) {
            const filteredSearchResults = applyGenreFilter(
              searchResults,
              acceptedGenres,
            );
            setLists(filteredSearchResults);
          }
        } else if (listFilter === "your_lists" && profileID !== undefined) {
          const { data: searchResults } = await supabase
            .from("anime_lists")
            .select()
            .eq("creator_id", profileID)
            .ilike("title", `%${searchText.trim()}%`)
            .throwOnError();

          if (searchResults !== null) {
            const filteredSearchResults = applyGenreFilter(
              searchResults,
              acceptedGenres,
            );
            setLists(filteredSearchResults);
          }
        }
      } catch (error) {
        showNotification("Error while trying to search", {
          severity: "error",
          error: error as HasErrorMessage,
        });
      }
      setQueryOngoing(false);
    }, 300);
    return () => clearTimeout(timeoutID);
  }, [profileID, listFilter, acceptedGenres, searchText]);

  const updateAcceptedGenres = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedGenres((current) => {
      current[e.target.name] = e.target.checked;
      return { ...current };
    });
  };
  const onListFilterChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setListFilter(e.target.value);
  };
  const toggleFilterDrawer = (open: boolean) => {
    setFilterDrawerIsOpen(open);
  };

  const genreElements = LIST_GENRES.map((genre) => (
    <li key={genre}>
      <Checkbox
        id={genre}
        label={genre}
        name={genre.toUpperCase()}
        onChange={updateAcceptedGenres}
        checked={acceptedGenres[genre.toUpperCase()]}
      />
    </li>
  ));

  const transformedLists = lists.map((list) => {
    return <ListItem key={list.id} listId={list.id} />;
  });

  return (
    <Fragment>
      <Head>
        <title>Animehaven | Lists</title>
        <meta
          name="description"
          content="Create, share or browse compilations of different animes."
        />
        <meta property="og:title" content="Animehaven | Lists" />
        <meta
          property="og:description"
          content="Create, share or browse compilations of different animes."
        />
        <meta property="og:url" content="https://animehaven.vercel.app/lists" />
        <meta name="twitter:title" content="Animehaven | Lists" />
        <meta
          name="twitter:description"
          content="Create, share or browse compilations of different animes."
        />
      </Head>
      {profileID && (
        <CreateList
          open={showCreateListDialog}
          onClose={() => setShowCreateListDialog(false)}
          profileId={profileID}
        />
      )}
      {!matchesSmallDevice && (
        <div className="d-flex flex-column gap-3">
          <Select
            title="Filter lists"
            onChange={onListFilterChanged}
            value={listFilter}
          >
            <option value="all">All</option>
            {profileID && <option value="your_lists">My Lists</option>}
          </Select>
          <CheckboxList
            className="mt-2"
            label="Genre"
            checkboxes={genreElements}
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
            <Select
              title="Sort and filter lists"
              onChange={onListFilterChanged}
              value={listFilter}
            >
              <option value="all">All</option>
              {profileID && <option value="your_lists">My Lists</option>}
            </Select>
            <CheckboxList
              className="mt-2"
              label="Genre"
              checkboxes={genreElements}
            />
          </div>
        </SwipeableDrawer>
      )}
      <div className="d-flex flex-column gap-2 flex-grow-1">
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
              text="New List"
              className="ms-auto"
              icon={<Add />}
              onClick={() => setShowCreateListDialog(true)}
            />
          )}
        </div>
        <div className="d-flex flex-column flex-grow-1">
          <Input
            className="py-2"
            placeholder="Search Lists"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            spellCheck={false}
          />
          {queryOngoing && <Loading sx={{ marginTop: "10px" }} />}
          {!queryOngoing && (
            <Masonry
              columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
              spacing={1}
              sx={{ marginTop: "10px" }}
            >
              {transformedLists}
            </Masonry>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Lists;

Lists.getLayout = (page: ReactElement) => {
  return (
    <HeaderLayout>
      <BodyLayout className="d-flex gap-2" recentItems="lists">
        {page}
      </BodyLayout>
    </HeaderLayout>
  );
};

const applyGenreFilter = (
  lists: Tables<"anime_lists">[],
  acceptedGenres: ListGenres,
) => {
  return lists.filter((list) => {
    let accepted = false;
    const { genres } = list;
    for (const genre in genres) {
      if (genres[genre] && acceptedGenres[genre]) {
        accepted = true;
        break;
      }
    }
    return accepted;
  });
};
