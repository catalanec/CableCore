import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Project() {
  const router = useRouter();
  const { id } = router.query;

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (id) fetchTasks();
  }, [id]);

  async function fetchTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    setTasks(data || []);
  }

  async function addTask() {
    if (!newTask) return;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("tasks").insert([
      {
        title: newTask,
        project_id: id,
        user_id: user.id
      }
    ]);

    setNewTask("");
    fetchTasks();
  }

  async function deleteTask(taskId) {
    await supabase.from("tasks").delete().eq("id", taskId);
    fetchTasks();
  }

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => router.push("/")}>Back</button>

      <h1>Project</h1>

      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task..."
      />
      <button onClick={addTask}>Add Task</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginTop: 10 }}>
            {task.title}
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
