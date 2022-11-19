import Head from "next/head";
import { Fragment } from "react";

export default function NoAccount({ accountName }) {
	return (
		<Fragment>
			<Head>
				<title>Animehaven</title>
			</Head>
			<div className="text-white d-flex justify-content-center align-items-center flex-column h-100">
				<span className="fs-3">{`Account '${accountName}' doesn't exist`}</span>
			</div>
		</Fragment>
	);
}
