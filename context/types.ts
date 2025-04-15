import {ReactElement, ReactNode} from "react";
import {SupabaseClient} from "@supabase/supabase-js";

export interface UserAuthContextType {
    profileID?: string;
    handleGoogleAuth: (supabaseClient: SupabaseClient) => Promise<void>;
}

export interface UserAuthContextProviderProps {
    children: ReactNode;
}