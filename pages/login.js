// pages/login.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/");
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // ВАЖНО
      },
    });

    if (error) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>CableCore</h1>
        <p>Вход в систему</p>

        <button onClick={handleGoogleLogin} style={styles.button}>
          Войти через Google
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b1623",
    color: "white",
  },
  card: {
    padding: "40px",
    background: "#142233",
    borderRadius: "10px",
    textAlign: "center",
  },
  button: {
    marginTop: "20px",
    padding: "12px 20px",
    backgroundColor: "#4285F4",
    border: "none",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
