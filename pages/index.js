import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    } else {
      setUser(user);
      fetchProjects(user.id);
    }
  }

  async function fetchProjects(userId) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ошибка загрузки проектов:", error.message);
    } else {
      setProjects(data);
    }
  }

  async function addProject() {
    if (!newProjectName.trim()) return;

    const { error } = await supabase.from("projects").insert([
      {
        name: newProjectName,
        user_id: user.id, // 🔥 КЛЮЧЕВОЕ
      },
    ]);

    if (error) {
      console.error("Ошибка создания проекта:", error.message);
      alert("Ошибка: " + error.message);
    } else {
      setNewProjectName("");
      fetchProjects(user.id);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>CableCore</h1>

      <button onClick={logout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      <h2>Projects:</h2>

      <input
        type="text"
        placeholder="New project name"
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
      />

      <button onClick={addProject} style={{ marginLeft: "10px" }}>
        Add Project
      </button>

      <div style={{ marginTop: "30px" }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              padding: "10px",
              marginBottom: "10px",
              background: "#1e2a3a",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => router.push(`/project/${project.id}`)}
          >
            {project.name}
          </div>
        ))}
      </div>
    </div>
  );
}
