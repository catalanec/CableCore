import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import CableCalculator from "../../components/CableCalculator";

export default function ClientPage() {

const router = useRouter();
const { id } = router.query;

const [client,setClient] = useState(null);
const [jobs,setJobs] = useState([]);

const [title,setTitle] = useState("");
const [description,setDescription] = useState("");

useEffect(()=>{

if(!id) return;

loadClient();
loadJobs();

},[id]);

async function loadClient(){

const { data } = await supabase
.from("clients")
.select("*")
.eq("id",id)
.single();

setClient(data);

}

async function loadJobs(){

const { data } = await supabase
.from("jobs")
.select("*")
.eq("client_id",id)
.order("created_at",{ascending:false});

setJobs(data || []);

}

async function addJob(e){

e.preventDefault();

if(!title) return;

await supabase
.from("jobs")
.insert([
{
title,
description,
client_id:id
}
]);

setTitle("");
setDescription("");

loadJobs();

}

if(!client) return <p>Loading...</p>;

return (

<div style={{padding:"40px",color:"white"}}>

<h1 style={{fontSize:"40px"}}>{client.name}</h1>

<p>
<strong>Address:</strong> {client.address}
</p>

<p>
<strong>Phone:</strong> {client.phone}
</p>


{/* ADD JOB */}

<h2 style={{marginTop:"40px"}}>Add Job</h2>

<form
onSubmit={addJob}
style={{
display:"flex",
gap:"10px",
marginBottom:"40px"
}}
>

<input
placeholder="Job title"
value={title}
onChange={e=>setTitle(e.target.value)}
style={{padding:"8px"}}
/>

<input
placeholder="Description"
value={description}
onChange={e=>setDescription(e.target.value)}
style={{padding:"8px"}}
/>

<button type="submit">
Add
</button>

</form>


{/* CALCULATOR */}

<CableCalculator client={client} />


{/* JOB LIST */}

<h2 style={{marginTop:"40px"}}>Jobs</h2>

{jobs.map(job=>(
<div
key={job.id}
style={{
background:"#102a43",
padding:"15px",
borderRadius:"10px",
marginBottom:"10px"
}}
>

<strong>{job.title}</strong>

<p>{job.description}</p>

</div>
))}

</div>

)

}
