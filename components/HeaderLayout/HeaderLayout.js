import { Fragment } from "react";
import Header from "../Header/Header";

export default function HeaderLayout({ children }) {
    return (
        <Fragment>
            <Header />
            {children}
        </Fragment>
    )
}