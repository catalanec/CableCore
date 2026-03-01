import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("SESSION AFTER REDIRECT:", session);

      router.push("/");
    };

    checkSession();
  }, []);

  return <p>Авторизация...</p>;
}
