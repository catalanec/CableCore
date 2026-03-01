import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Проверяем сессию при загрузке
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    // Слушаем изменения авторизации
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        background: "#001833",
        color: "white",
        padding: "40px",
      }}
    >
      <h1>CableCore</h1>

      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
        </div>
      ) : (
        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            background: "#222",
            borderRadius: "12px",
            width: "300px",
          }}
        >
          USER NOT LOGGED IN
        </div>
      )}
    </div>
  );
}
