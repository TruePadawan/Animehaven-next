import {HasErrorMessage} from "../../../utilities/global.types";

export interface AccountMenuButtonProps {
    profileID: string;
    errorHandler: (text: string, error: HasErrorMessage) => void;
}