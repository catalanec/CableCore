import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchProjects();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
    }
  }

  async function fetchProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    setProjects(data || []);
  }

  async function addProject() {
    if (!newProject) return;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("projects").insert([
      {
        name: newProject,
        user_id: user.id
      }
    ]);

    setNewProject("");
    fetchProjects();
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>CableCore</h1>

      <input
        value={newProject}
        onChange={(e) => setNewProject(e.target.value)}
        placeholder="New project name"
      />
      <button onClick={addProject}>Add Project</button>

      <ul>
        {projects.map((project) => (
          <li
            key={project.id}
            onClick={() => router.push(`/project/${project.id}`)}
            style={{ cursor: "pointer", marginTop: 10 }}
          >
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
