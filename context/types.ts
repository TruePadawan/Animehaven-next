import { ReactNode } from "react";

export interface UserAuthContextType {
  profileID?: string;
  handleGoogleAuth: () => Promise<void>;
}

export interface UserAuthContextProviderProps {
  children: ReactNode;
}
