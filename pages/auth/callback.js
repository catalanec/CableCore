import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace("/");
      } else {
        router.replace("/login");
      }
    };

    checkSession();
  }, []);

  return <p style={{ padding: 40 }}>Completing login...</p>;
}
