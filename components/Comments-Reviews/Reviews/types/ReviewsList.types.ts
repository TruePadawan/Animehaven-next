import { UserAuthContextType } from "../../../../context/authentication/UserAuthContext.types";
import { NotificationContextType } from "../../../../context/notifications/NotificationContext.types";

export interface ReviewsListProps {
  profileID: UserAuthContextType["profileID"];
  animeID: string;
  showNotification: NotificationContextType["showNotification"];
}
