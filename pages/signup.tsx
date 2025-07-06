import { FormEvent, useRef } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../database.types";

export default function Signup() {
  const supabase = useSupabaseClient<Database>();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailRef.current!.value;
    const password = passwordRef.current!.value;
    await supabase.auth.signUp({ email, password });
  }

  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" ref={emailRef} required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            ref={passwordRef}
            required
          />
        </div>
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}
