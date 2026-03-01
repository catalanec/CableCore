// pages/login.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/");
      }
    };

    checkUser();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://cablecoreapp.vercel.app/auth/callback",
      },
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#001833",
        color: "white",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>Login</h1>

      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
