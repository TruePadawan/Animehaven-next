import {Tables} from "../../database.types";

export interface CreateListProps {
    open: boolean;
    defaultValues?: Omit<Tables<"anime_lists">, "genres" | "description" | "creator_id" | "created_at"> & {
        genres: ListGenres;
        desc: string;
        creator: string;
    };
    profileId: string;
    onClose: VoidFunction;
}

export interface ListGenres {
    [key: string]: boolean;
}