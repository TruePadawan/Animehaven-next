import {ReactElement} from "react";
import {SupabaseClient} from "@supabase/supabase-js";

export interface UserAuthContextType {
    profileID: string | null;
    handleGoogleAuth: (supabaseClient: SupabaseClient) => Promise<void>;
}

export interface UserAuthContextProviderProps {
    children: ReactElement;
}