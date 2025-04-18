import { Tables } from "../../../../database.types";
import { UserAuthContextType } from "../../../../context/authentication/UserAuthContext.types";
import { NotificationContextType } from "../../../../context/notifications/NotificationContext.types";

export interface ReviewItemProps {
  reviewData: Tables<"item_reviews">;
  profileID: UserAuthContextType["profileID"];
  editReview: (text: string, ratingValue: number) => void;
  showNotification: NotificationContextType["showNotification"];
}
