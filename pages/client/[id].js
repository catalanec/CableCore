import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import CableCalculator from "../../components/CableCalculator"

export default function ClientPage(){

const router = useRouter()
const { id } = router.query

const [client,setClient] = useState(null)
const [jobs,setJobs] = useState([])

const [title,setTitle] = useState("")
const [description,setDescription] = useState("")

useEffect(()=>{
if(!id) return
loadClient()
loadJobs()
},[id])

async function loadClient(){

const { data } = await supabase
.from("clients")
.select("*")
.eq("id",id)
.single()

setClient(data)

}

async function loadJobs(){

const { data } = await supabase
.from("jobs")
.select("*")
.eq("client_id",id)
.order("created_at",{ascending:false})

setJobs(data || [])

}

async function addJob(){

if(!title) return

await supabase
.from("jobs")
.insert([
{
client_id:id,
title,
description
}
])

setTitle("")
setDescription("")

loadJobs()

}

if(!client) return null


return(

<div
style={{
background:"#071a2c",
minHeight:"100vh",
padding:"40px 20px",
color:"white"
}}
>

<div
style={{
maxWidth:"900px",
margin:"0 auto"
}}
>

<h1>{client.name}</h1>

<p style={{opacity:0.7}}>Address: {client.address}</p>
<p style={{opacity:0.7}}>Phone: {client.phone}</p>


<h2 style={{marginTop:"40px"}}>Add Job</h2>


<div
style={{
display:"flex",
gap:"10px",
marginTop:"15px",
maxWidth:"650px"
}}
>

<input
placeholder="Job title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
style={{
width:"200px",
padding:"12px",
borderRadius:"10px",
border:"none"
}}
/>

<input
placeholder="Description"
value={description}
onChange={(e)=>setDescription(e.target.value)}
style={{
flex:1,
padding:"12px",
borderRadius:"10px",
border:"none"
}}
/>

<button
onClick={addJob}
style={{
background:"#3b82f6",
border:"none",
padding:"12px 18px",
borderRadius:"10px",
color:"white",
cursor:"pointer"
}}
>
Add
</button>

</div>


<div style={{marginTop:"40px"}}>
<CableCalculator client={client}/>
</div>


<h2 style={{marginTop:"40px"}}>Jobs</h2>


<div
style={{
display:"flex",
flexDirection:"column",
gap:"20px",
marginTop:"20px"
}}
>

{jobs.map(job=>(
<div
key={job.id}
style={{
background:"#102c4a",
padding:"25px",
borderRadius:"14px"
}}
>

<h3>{job.title}</h3>

<p style={{opacity:0.7}}>{job.description}</p>

</div>
))}

</div>

</div>

</div>

)

}
