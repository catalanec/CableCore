import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientPage() {
  const router = useRouter();
  const { id } = router.query;

  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!id) return;

    loadClient();
  }, [id]);

  async function loadClient() {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    setClient(data);
  }

  if (!client) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#001833",
        color: "white",
        padding: "40px",
      }}
    >
      <h1>{client.name}</h1>

      <p><b>Address:</b> {client.address}</p>
      <p><b>Phone:</b> {client.phone}</p>

      <h2 style={{ marginTop: "40px" }}>Jobs</h2>
      <p>No jobs yet</p>
    </div>
  );
}
