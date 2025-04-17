import { UserAuthContextProvider } from "../context/UserAuthContext";
import { Analytics } from "@vercel/analytics/react";
import "../styles/global.css";
import { Fragment, ReactElement, ReactNode } from "react";
import Head from "next/head";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import { NotificationContextProvider } from "../context/notifications/NotificationContext";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <Fragment>
      <Head>
        <title>Animehaven</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <NotificationContextProvider>
          <UserAuthContextProvider>
            {getLayout(<Component {...pageProps} />)}
            <Analytics />
          </UserAuthContextProvider>
        </NotificationContextProvider>
      </SessionContextProvider>
    </Fragment>
  );
}

export default MyApp;
