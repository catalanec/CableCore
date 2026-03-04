import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadSessionAndClients();
  }, []);

  async function loadSessionAndClients() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) return;

    setUser(session.user);

    const { data: clientsData } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    setClients(clientsData || []);
  }

  async function addClient() {
    if (!name) return;

    const { data } = await supabase.auth.getSession();
    const user = data.session.user;

    await supabase.from("clients").insert([
      {
        name: name,
        address: address,
        phone: phone,
        user_id: user.id,
      },
    ]);

    setName("");
    setAddress("");
    setPhone("");

    loadSessionAndClients();
  }

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

      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <p>USER NOT LOGGED IN</p>
      )}

      <h2 style={{ marginTop: "40px" }}>Add Client</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Client name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "6px" }}
        />

        <input
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ marginLeft: "10px", padding: "6px" }}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ marginLeft: "10px", padding: "6px" }}
        />

        <button
          onClick={addClient}
          style={{
            marginLeft: "10px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      <h2>Clients</h2>

      {clients.length === 0 ? (
        <p>No clients yet</p>
      ) : (
        clients.map((client) => (
          <a
            key={client.id}
            href={`/client/${client.id}`}
            style={{
              display: "block",
              marginTop: "10px",
              padding: "12px",
              background: "#0b2545",
              borderRadius: "6px",
              textDecoration: "none",
              color: "white",
            }}
          >
            <strong>{client.name}</strong>
            <div>{client.address}</div>
            <div>{client.phone}</div>
          </a>
        ))
      )}
    </div>
  );
}
