"use client"

import { useState, useEffect } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)
const [cable,setCable] = useState(95)
const [cableType,setCableType] = useState("Cat6")

const [installation,setInstallation] = useState("superficial")

const [canaleta,setCanaleta] = useState(0)

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

let equipCost = 0

if(switchInstall) equipCost += 60
if(routerInstall) equipCost += 60
if(config) equipCost += 120

let rackCost = Number(rack)

let sum = subtotalPoints + installCost + equipCost + rackCost

let ivaCalc = sum * 0.21
let totalCalc = sum + ivaCalc

setSubtotal(sum)
setIva(ivaCalc)
setTotal(totalCalc)

},[
points,
cable,
installation,
canaleta,
rack,
switchInstall,
routerInstall,
config
])

function downloadPDF(){

generatePDF({
client,
points,
cablePrice:cable,
subtotal,
iva,
total
})

}

return (

<div style={{
background:"#17324d",
padding:"40px",
borderRadius:"20px",
marginTop:"30px"
}}>

<h2 style={{
textAlign:"center",
marginBottom:"30px"
}}>
Calculadora profesional
</h2>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"40px"
}}>

<div>

<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={e=>setPoints(Number(e.target.value))}
style={{width:"100%"}}
/>

<label>Tipo de cable</label>
<select
value={cableType}
onChange={e=>{

let type = e.target.value
setCableType(type)

if(type==="Cat6") setCable(95)
if(type==="Cat6A") setCable(110)
if(type==="Cat7") setCable(125)

}}
>

<option value="Cat6">Cat6 – 95€</option>
<option value="Cat6A">Cat6A – 110€</option>
<option value="Cat7">Cat7 – 125€</option>

</select>

<label>Tipo instalación</label>
<select
value={installation}
onChange={e=>setInstallation(e.target.value)}
>

<option value="superficial">Superficial</option>
<option value="techo">Techo</option>

</select>

<label>Metros canaleta</label>
<input
type="number"
value={canaleta}
onChange={e=>setCanaleta(Number(e.target.value))}
/>

<label>Rack</label>
<select
value={rack}
onChange={e=>setRack(Number(e.target.value))}
>

<option value={0}>No incluido</option>
<option value={150}>Rack pequeño</option>
<option value={300}>Rack profesional</option>

</select>

</div>

<div>

<h3>Equipos</h3>

<label>
<input
type="checkbox"
checked={switchInstall}
onChange={()=>setSwitchInstall(!switchInstall)}
/>
Switch instalación (60€)
</label>

<label>
<input
type="checkbox"
checked={routerInstall}
onChange={()=>setRouterInstall(!routerInstall)}
/>
Router instalación (60€)
</label>

<label>
<input
type="checkbox"
checked={config}
onChange={()=>setConfig(!config)}
/>
Configuración red (120€)
</label>

<br/>

<label>Urgencia</label>

<select
value={urgency}
onChange={e=>setUrgency(Number(e.target.value))}
>

<option value={1}>Normal</option>
<option value={1.5}>Urgente</option>

</select>

<hr/>

<p>Subtotal: {subtotal.toFixed(2)}€</p>
<p>IVA (21%): {iva.toFixed(2)}€</p>

<h2 style={{color:"#ffd000"}}>
Total: {total.toFixed(2)}€
</h2>

<button
onClick={downloadPDF}
style={{
background:"#2ecc71",
padding:"12px 20px",
borderRadius:"8px",
marginRight:"10px",
border:"none"
}}
>
Descargar PDF
</button>

<button
style={{
background:"#f1c40f",
padding:"12px 20px",
borderRadius:"8px",
border:"none"
}}
>
Guardar presupuesto
</button>

</div>

</div>

</div>

)

}
