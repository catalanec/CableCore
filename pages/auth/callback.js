import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } =
        await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

      console.log("SESSION DATA:", data);
      console.log("SESSION ERROR:", error);

      router.replace("/");
    };

    handleAuth();
  }, []);

  return <p style={{ padding: 40 }}>Completing login...</p>;
}
