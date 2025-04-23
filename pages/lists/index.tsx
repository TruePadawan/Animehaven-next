import React, {
  Fragment,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
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
import SearchInput from "../../components/Input/SearchInput/SearchInput";
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

  // SHOW PUBLIC LISTS OR USER OWN LISTS
  useEffect(() => {
    setQueryOngoing(true);
    if (listFilter === "all") {
      supabase
        .from("anime_lists")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            showNotification("Failed to retrieve public lists", {
              severity: "error",
              error,
            });
            setLists([]);
            setQueryOngoing(false);
          } else {
            const filteredLists = applyGenreFilter(data, acceptedGenres);
            setLists(filteredLists);
            setQueryOngoing(false);
          }
        });
    } else if (listFilter === "your_lists" && profileID !== undefined) {
      supabase
        .from("anime_lists")
        .select("*")
        .eq("creator_id", profileID)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            showNotification("Failed to retrieve user lists", {
              severity: "error",
              error,
            });
            setLists([]);
            setQueryOngoing(false);
          } else {
            const filteredLists = applyGenreFilter(data, acceptedGenres);
            setLists(filteredLists);
            setQueryOngoing(false);
          }
        });
    }
  }, [listFilter, profileID, acceptedGenres]);

  const openCreateListDialog = () => setShowCreateListDialog(true);
  const closeCreateListDialog = () => setShowCreateListDialog(false);
  const onListFilterChanged = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setListFilter(e.target.value);
  const updateSearchText = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(e.target.value);
  const updateAcceptedGenres = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedGenres((current) => {
      current[e.target.name] = e.target.checked;
      return { ...current };
    });
  };

  const searchForLists = async () => {
    setQueryOngoing(true);
    try {
      if (listFilter === "all") {
        const { data: searchResults } = await supabase
          .rpc("search_list", { phrase: searchText })
          .overrideTypes<
            Array<Tables<"anime_lists">>,
            {
              merge: false;
            }
          >()
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
          .rpc("search_list", {
            phrase: searchText,
            profile_id: profileID,
          })
          .overrideTypes<
            Array<Tables<"anime_lists">>,
            {
              merge: false;
            }
          >()
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
  };

  const genreElements = useMemo(() => {
    return LIST_GENRES.map((genre) => (
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
  }, [acceptedGenres]);

  const transformedLists = useMemo(() => {
    return lists.map((list) => {
      return <ListItem key={list.id} listId={list.id} />;
    });
  }, [lists]);

  const toggleFilterDrawer = (open: boolean) => {
    setFilterDrawerIsOpen(open);
  };

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
          onClose={closeCreateListDialog}
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
              onClick={openCreateListDialog}
            />
          )}
        </div>
        <div className="d-flex flex-column flex-grow-1">
          <SearchInput
            searchFunc={searchForLists}
            placeholder="Search Lists"
            value={searchText}
            onChange={updateSearchText}
            minLength={4}
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
