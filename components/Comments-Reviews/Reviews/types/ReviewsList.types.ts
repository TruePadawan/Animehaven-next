import { TriggerAlert } from "../../../../utilities/global.types";
import { UserAuthContextType } from "../../../../context/types";

export interface ReviewsListProps {
  profileID: UserAuthContextType["profileID"];
  animeID: string;
  triggerAlert: TriggerAlert;
}
