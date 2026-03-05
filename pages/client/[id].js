import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import CableCalculator from "../../components/CableCalculator"

export default function ClientPage() {

const router = useRouter()
const { id } = router.query

const [client, setClient] = useState(null)
const [jobs, setJobs] = useState([])

const [title, setTitle] = useState("")
const [description, setDescription] = useState("")

useEffect(() => {

if (!id) return

loadClient()
loadJobs()

}, [id])


async function loadClient() {

const { data } = await supabase
.from("clients")
.select("*")
.eq("id", id)
.single()

setClient(data)

}


async function loadJobs() {

const { data } = await supabase
.from("jobs")
.select("*")
.eq("client_id", id)
.order("created_at", { ascending:false })

setJobs(data || [])

}


async function addJob() {

if (!title) return

await supabase
.from("jobs")
.insert([
{
client_id:id,
title:title,
description:description
}
])

setTitle("")
setDescription("")

loadJobs()

}


if (!client) return null


return(

<div style={{
background:"#071a2c",
minHeight:"100vh",
padding:"30px 20px",
color:"white"
}}>

<h1 style={{marginBottom:"10px"}}>
{client.name}
</h1>

<p style={{opacity:0.7}}>
Address: {client.address}
</p>

<p style={{opacity:0.7}}>
Phone: {client.phone}
</p>


<h2 style={{
marginTop:"40px",
marginBottom:"15px"
}}>
Add Job
</h2>


<div style={{
display:"flex",
flexWrap:"wrap",
gap:"10px",
marginBottom:"30px"
}}>

<input
placeholder="Job title"
value={title}
onChange={(e)=>setTitle(e.target.value)}
style={{
flex:"1 1 200px",
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
flex:"1 1 200px",
padding:"12px",
borderRadius:"10px",
border:"none"
}}
/>

<button
onClick={addJob}
style={{
background:"#3b82f6",
color:"white",
border:"none",
padding:"12px 20px",
borderRadius:"10px",
cursor:"pointer"
}}
>
Add
</button>

</div>


<CableCalculator client={client}/>


<h2 style={{
marginTop:"40px",
marginBottom:"15px"
}}>
Jobs
</h2>


<div style={{
display:"flex",
flexDirection:"column",
gap:"15px"
}}>

{jobs.map(job => (

<div
key={job.id}
style={{
background:"#102c4a",
padding:"20px",
borderRadius:"12px"
}}
>

<h3 style={{marginBottom:"5px"}}>
{job.title}
</h3>

<p style={{opacity:0.7}}>
{job.description}
</p>

</div>

))}

</div>


</div>

)

}
