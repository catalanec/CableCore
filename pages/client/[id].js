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

async function addJob(){

if(!title) return;

await supabase
.from("jobs")
.insert([
{
client_id:id,
title,
description
}
]);

setTitle("");
setDescription("");

loadJobs();

}

if(!client) return <div style={{padding:40}}>Loading...</div>;

return(

<div style={{
minHeight:"100vh",
background:"#001833",
color:"white",
padding:"40px"
}}>

<h1>{client.name}</h1>

<p><b>Address:</b> {client.address}</p>
<p><b>Phone:</b> {client.phone}</p>

<h2 style={{marginTop:"40px"}}>Add Job</h2>

<input
placeholder="Job title"
value={title}
onChange={e=>setTitle(e.target.value)}
/>

<input
placeholder="Description"
value={description}
onChange={e=>setDescription(e.target.value)}
style={{marginLeft:"10px"}}
/>

<button
onClick={addJob}
style={{marginLeft:"10px"}}
>
Add
</button>

<CableCalculator
client={client}
onSave={(result)=>{
console.log("Presupuesto:",result);
}}
/>

<h2 style={{marginTop:"40px"}}>Jobs</h2>

{jobs.length===0 ? (
<p>No jobs yet</p>
):(

jobs.map(job=>(
<div
key={job.id}
style={{
marginTop:"10px",
padding:"12px",
background:"#0b2545",
borderRadius:"6px"
}}
>

<strong>{job.title}</strong>

<div>{job.description}</div>

</div>
))

)}

</div>

)

}
