import { HasErrorMessage } from "../../../utilities/global.types";

export interface ProfileMenuButtonProps {
  profileID: string;
  errorHandler: (text: string, error: HasErrorMessage) => void;
}
