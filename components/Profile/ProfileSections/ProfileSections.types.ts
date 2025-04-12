import {ReactNode} from "react";

export interface ProfileSectionContainerProps {
    title: string;
    children: ReactNode;
}

export interface UserDiscussionsProps {
    accountName: string;
}

export interface UserListsProps {
    accountName: string;
}

export interface UserSavedListsProps {
    accountName: string;
}

export interface UserItemsProps {
    accountName: string;
    title: string;
    status: string;
}

export interface UserRecommendedItemsProps {
    accountName: string;
}

export interface UserReviewsProps {
    accountName: string;
}

export interface EditProfileProps {
    open: boolean;
    closeDialog: VoidFunction;
}