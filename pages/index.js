"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProject, setNewProject] = useState("");

  // Получение проектов
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("ERROR:", error);
    } else {
      setProjects(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Добавление проекта
  const addProject = async () => {
    if (!newProject.trim()) return;

    const { error } = await supabase
      .from("projects")
      .insert([{ name: newProject }]);

    if (error) {
      console.log("Insert error:", error);
      return;
    }

    setNewProject("");
    fetchProjects();
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        CableCore
      </h1>

      <h2>Projects:</h2>

      {/* Форма добавления */}
      <div style={{ marginBottom: "20px" }}>
        <input
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          placeholder="New project name"
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        />

        <button
          onClick={addProject}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Project
        </button>
      </div>

      {/* Список проектов */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/project/${project.id}`)}
            style={{
              cursor: "pointer",
              marginBottom: "8px",
              padding: "10px",
              borderRadius: "6px",
              background: "#1e293b",
            }}
          >
            {project.name}
          </div>
        ))
      )}
    </div>
  );
}
