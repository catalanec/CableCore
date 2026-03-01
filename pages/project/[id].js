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
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    setProject(data);
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    setTasks(data || []);
  }

  async function addTask() {
    if (!newTask.trim()) return;

    await supabase.from("tasks").insert([
      {
        title: newTask,
        project_id: id,
      },
    ]);

    setNewTask("");
    fetchTasks();
  }

  async function toggleTask(task) {
    await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id);

    fetchTasks();
  }

  async function deleteTask(taskId) {
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  }

  if (!project) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => router.push("/")}>← Back</button>

      <h1 style={{ marginTop: 20 }}>{project.name}</h1>
      <p>Created at: {new Date(project.created_at).toLocaleString()}</p>

      <div style={{ marginTop: 30 }}>
        <input
          placeholder="New task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: 10 }}>
            <span
              onClick={() => toggleTask(task)}
              style={{
                cursor: "pointer",
                textDecoration: task.done ? "line-through" : "none",
                marginRight: 10,
              }}
            >
              {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
