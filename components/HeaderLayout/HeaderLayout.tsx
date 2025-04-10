import {Fragment, ReactNode} from "react";
import Header from "../Header/Header";

interface HeaderLayoutProps {
    children: ReactNode;
}
export default function HeaderLayout({ children }: HeaderLayoutProps) {
    return (
        <Fragment>
            <Header />
            {children}
        </Fragment>
    )
}