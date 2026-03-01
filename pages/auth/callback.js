// pages/auth/callback.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      await supabase.auth.getSession();
      router.push("/");
    };

    handleAuth();
  }, []);

  return <p>Logging you in...</p>;
}
