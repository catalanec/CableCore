"use client"

import { useState, useEffect } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)
const [cable,setCable] = useState(95)
const [installation,setInstallation] = useState("superficial")

const [canaleta,setCanaleta] = useState(0)
const [regata,setRegata] = useState(0)
const [corrugado,setCorrugado] = useState(0)

const [rack,setRack] = useState(0)

const [switchInstall,setSwitchInstall] = useState(false)
const [routerInstall,setRouterInstall] = useState(false)
const [config,setConfig] = useState(false)

const [urgency,setUrgency] = useState(1)

const [subtotal,setSubtotal] = useState(0)
const [iva,setIva] = useState(0)
const [total,setTotal] = useState(0)

useEffect(()=>{

let subtotalPoints = points * cable
let installCost = 0

if(installation==="superficial"){
installCost += canaleta * 8
}

if(installation==="techo"){
installCost += corrugado * 4.5
}

if(installation==="empotrado_existente"){
installCost += points * 20
}

if(installation==="empotrado_nuevo"){
installCost += regata * 22
installCost += corrugado * 4.5
}

let equip = 0

if(switchInstall) equip+=60
if(routerInstall) equip+=60
if(config) equip+=120

let subtotalCalc = (subtotalPoints + installCost + rack + equip) * urgency
let ivaCalc = subtotalCalc * 0.21
let totalCalc = subtotalCalc + ivaCalc

setSubtotal(subtotalCalc)
setIva(ivaCalc)
setTotal(totalCalc)

},[
points,cable,installation,
canaleta,regata,corrugado,
rack,
switchInstall,routerInstall,config,
urgency
])

const inputStyle={
width:"100%",
padding:"14px",
marginBottom:"18px",
borderRadius:"10px",
border:"1px solid #d1d5db",
background:"#e5e7eb",
color:"#111827",
fontSize:"14px",
boxSizing:"border-box"
}

return(

<div style={{
background:"#162b46",
padding:"40px",
borderRadius:"20px",
display:"flex",
gap:"40px",
flexWrap:"wrap"
}}>

{/* LEFT */}

<div style={{flex:1,minWidth:"320px"}}>

<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={e=>setPoints(Number(e.target.value))}
style={inputStyle}
/>

<label>Tipo de cable</label>
<select
value={cable}
onChange={e=>setCable(Number(e.target.value))}
style={inputStyle}
>
<option value={95}>Cat6 – 95€</option>
<option value={110}>Cat6A – 110€</option>
<option value={140}>Cat7 – 140€</option>
</select>

<label>Tipo instalación</label>
<select
value={installation}
onChange={e=>setInstallation(e.target.value)}
style={inputStyle}
>
<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado_existente">Empotrado existente</option>
<option value="empotrado_nuevo">Empotrado nuevo</option>
</select>

{installation==="superficial" && (

<>
<label>Metros canaleta</label>
<input
type="number"
value={canaleta}
onChange={e=>setCanaleta(Number(e.target.value))}
style={inputStyle}
/>
</>
)}

{installation==="empotrado_nuevo" && (

<>
<label>Metros regata</label>
<input
type="number"
value={regata}
onChange={e=>setRegata(Number(e.target.value))}
style={inputStyle}
/>

<label>Metros tubo corrugado</label>
<input
type="number"
value={corrugado}
onChange={e=>setCorrugado(Number(e.target.value))}
style={inputStyle}
/>
</>
)}

{installation==="techo" && (

<>
<label>Metros tubo corrugado</label>
<input
type="number"
value={corrugado}
onChange={e=>setCorrugado(Number(e.target.value))}
style={inputStyle}
/>
</>
)}

<label>Rack</label>
<select
value={rack}
onChange={e=>setRack(Number(e.target.value))}
style={inputStyle}
>
<option value={0}>No incluido</option>
<option value={150}>Rack 6U – 150€</option>
<option value={220}>Rack 9U – 220€</option>
<option value={290}>Rack 12U – 290€</option>
</select>

</div>

{/* RIGHT */}

<div style={{flex:1,minWidth:"320px"}}>

<h3>Equipos</h3>

<label>
<input type="checkbox" checked={switchInstall}
onChange={()=>setSwitchInstall(!switchInstall)}/>
 Switch instalación (60€)
</label>

<br/>

<label>
<input type="checkbox" checked={routerInstall}
onChange={()=>setRouterInstall(!routerInstall)}/>
 Router instalación (60€)
</label>

<br/>

<label>
<input type="checkbox" checked={config}
onChange={()=>setConfig(!config)}/>
 Configuración red (120€)
</label>

<br/><br/>

<label>Urgencia</label>
<select
value={urgency}
onChange={e=>setUrgency(Number(e.target.value))}
style={inputStyle}
>
<option value={1}>Normal</option>
<option value={1.2}>Urgente +20%</option>
<option value={1.4}>Muy urgente +40%</option>
</select>

<hr/>

<p>Subtotal: {subtotal.toFixed(2)}€</p>
<p>IVA (21%): {iva.toFixed(2)}€</p>

<h2 style={{color:"#facc15"}}>
Total: {total.toFixed(2)}€
</h2>

<br/>

<button
onClick={()=>generatePDF({client,points,cable,installation,subtotal,iva,total})}
style={{
background:"#22c55e",
border:"none",
padding:"14px 24px",
borderRadius:"10px",
color:"white",
fontWeight:"bold",
marginRight:"10px"
}}
>
Descargar PDF
</button>

<button
style={{
background:"#facc15",
border:"none",
padding:"14px 24px",
borderRadius:"10px",
fontWeight:"bold"
}}
>
Guardar presupuesto
</button>

</div>

</div>

)
}
