import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("Current user:", user);

    if (!user) {
      alert("USER NOT LOGGED IN");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Error loading projects");
    } else {
      setProjects(data);
    }
  }

  async function addProject() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    alert("Current user: " + JSON.stringify(user));

    if (!user) {
      alert("USER IS NULL — NOT AUTHORIZED");
      return;
    }

    if (!newProjectName.trim()) {
      alert("Project name is empty");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name: newProjectName,
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("INSERT ERROR:", error);
      alert("Insert error: " + error.message);
    } else {
      alert("Project created!");
      setNewProjectName("");
      fetchProjects();
    }
  }

  return (
    <div style={{ padding: 40, background: "#0a1a33", minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: 48 }}>CableCore</h1>

      <h2>Projects:</h2>

      <input
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        placeholder="New project name"
        style={{ padding: 8, marginRight: 10 }}
      />

      <button onClick={addProject} style={{ padding: 8 }}>
        Add Project
      </button>

      <ul style={{ marginTop: 30 }}>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
