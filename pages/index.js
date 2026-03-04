import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessionAndClients = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setClients(data || []);
      }

      setLoading(false);
    };

    loadSessionAndClients();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#001833",
        color: "white",
        padding: "40px",
        fontFamily: "serif",
      }}
    >
      <h1 style={{ fontSize: "36px" }}>CableCore</h1>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <div
          style={{
            background: "#2b2b2b",
            padding: "12px 20px",
            borderRadius: "8px",
            display: "inline-block",
            marginTop: "20px",
          }}
        >
          USER NOT LOGGED IN
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h2>Clients</h2>

        {clients.length === 0 ? (
          <p>No clients yet</p>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#0b2545",
                borderRadius: "6px",
              }}
            >
              <strong>{client.name}</strong>
              <div>{client.address}</div>
              <div>{client.phone}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
