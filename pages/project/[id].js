import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProjectPage() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchProject();
    fetchTasks();
  }, [id]);

  async function fetchProject() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setProject(data);
  }

  async function fetchTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    if (!error) setTasks(data || []);
  }

  async function addTask() {
    if (!newTask.trim()) return;

    const { error } = await supabase.from("tasks").insert([
      {
        title: newTask,
        project_id: id,
      },
    ]);

    if (!error) {
      setNewTask("");
      fetchTasks();
    }
  }

  async function toggleTask(task) {
    const { error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id);

    if (!error) fetchTasks();
  }

  async function deleteTask(taskId) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (!error) fetchTasks();
  }

  if (!project) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "40px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "40px",
      }}
    >
      <button
        onClick={() => router.push("/")}
        style={{
          marginBottom: "20px",
          padding: "6px 12px",
          background: "#1e293b",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1>{project.name}</h1>
      <p style={{ opacity: 0.7 }}>
        Created at: {new Date(project.created_at).toLocaleString()}
      </p>

      <div style={{ marginTop: "30px" }}>
        <input
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "none",
          }}
        />
        <button
          onClick={addTask}
          style={{
            padding: "8px 14px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Add Task
        </button>
      </div>

      <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              background: "#1e293b",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              onClick={() => toggleTask(task)}
              style={{
                cursor: "pointer",
                textDecoration: task.done ? "line-through" : "none",
              }}
            >
              {task.title}
            </span>

            <button
              onClick={() => deleteTask(task.id)}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
