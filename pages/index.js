import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);
    await loadProjects(user.id);
    setLoading(false);
  }

  async function loadProjects(userId) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Ошибка загрузки: " + error.message);
      console.error(error);
    } else {
      setProjects(data || []);
    }
  }

  async function addProject() {
    if (!newProjectName.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Пользователь не найден");
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
      alert("Ошибка создания: " + error.message);
      console.error(error);
      return;
    }

    setNewProjectName("");
    await loadProjects(user.id);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1>CableCore</h1>

      <button onClick={logout} style={{ marginBottom: 20 }}>
        Logout
      </button>

      <h2>Projects:</h2>

      <input
        type="text"
        placeholder="New project name"
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
      />

      <button onClick={addProject} style={{ marginLeft: 10 }}>
        Add Project
      </button>

      <div style={{ marginTop: 30 }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              padding: 12,
              marginBottom: 10,
              background: "#1e2a3a",
              borderRadius: 6,
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
