// pages/auth/callback.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Это важно для OAuth
      await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      router.replace("/");
    };

    handleAuth();
  }, []);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      Completing login...
    </div>
  );
}
