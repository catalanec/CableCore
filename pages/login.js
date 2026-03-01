// pages/login.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();

  // Если уже есть сессия — сразу на главную
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
      }
    };

    checkSession();
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://cablecoreapp.vercel.app/auth/callback",
      },
    });

    if (error) {
      alert("Login error: " + error.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#001833",
        flexDirection: "column",
        gap: "24px",
        color: "white",
      }}
    >
      <h1>Login</h1>

      <button
        onClick={handleGoogleLogin}
        style={{
          padding: "12px 28px",
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
