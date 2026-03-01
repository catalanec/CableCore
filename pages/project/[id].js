"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log("Error loading project:", error);
    } else {
      setProject(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  if (!project)
    return <div style={{ padding: "40px" }}>Project not found</div>;

  return (
    <div
      style={{
        padding: "40px",
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <button
        onClick={() => router.push("/")}
        style={{
          marginBottom: "20px",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        {project.name}
      </h1>

      <p style={{ opacity: 0.7 }}>
        Created at: {new Date(project.created_at).toLocaleString()}
      </p>
    </div>
  );
}
