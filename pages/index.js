useEffect(() => {
  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*");

    if (error) {
      console.log("ERROR:", error);
      alert(JSON.stringify(error));
    } else {
      setProjects(data);
    }

    setLoading(false);
  }

  fetchProjects();
}, []);
