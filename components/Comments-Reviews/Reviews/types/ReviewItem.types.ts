import {Tables} from "../../../../database.types";

export interface ReviewItemProps {
    reviewData: Tables<"item_reviews">;
    profileID?: string;
    editReview: (text: string, ratingValue: number) => void;
    handleError: (errorText: string, error: any) => void;
}
