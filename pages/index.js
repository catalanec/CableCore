import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*");

      if (error) {
        alert(JSON.stringify(error));
      } else {
        setProjects(data);
      }

      setLoading(false);
    }

    fetchProjects();
  }, []);

  return (
    <div style={{
      fontFamily: "Arial",
      padding: "40px",
      background: "#0f172a",
      color: "white",
      minHeight: "100vh"
    }}>
      <h1 style={{ fontSize: "40px", marginBottom: "20px" }}>
        CableCore
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>Projects:</h2>
          {projects.map(project => (
            <div key={project.id}>
              {project.name}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
