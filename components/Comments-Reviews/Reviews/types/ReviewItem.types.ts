import {Tables} from "../../../../database.types";
import {UserAuthContextType} from "../../../../context/types";

export interface ReviewItemProps {
    reviewData: Tables<"item_reviews">;
    profileID: UserAuthContextType["profileID"];
    editReview: (text: string, ratingValue: number) => void;
    handleError: (errorText: string, error: any) => void;
}
