// pages/index.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
    } else {
      setUser(data.session.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div style={styles.container}>
      <h1>Добро пожаловать в CableCore</h1>
      <p>{user.email}</p>

      <button onClick={logout} style={styles.button}>
        Выйти
      </button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#0b1623",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: "20px",
    padding: "10px 15px",
    backgroundColor: "#ff4d4d",
    border: "none",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
