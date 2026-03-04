import { useState } from "react"
import generatePDF from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)
const [cablePrice,setCablePrice] = useState(95)
const [installation,setInstallation] = useState("superficial")
const [rack,setRack] = useState(0)

const [switchInstall,setSwitchInstall] = useState(false)
const [routerInstall,setRouterInstall] = useState(false)
const [config,setConfig] = useState(false)

const [urgency,setUrgency] = useState(1)


// CALCULATION

let subtotalPoints = points * cablePrice

let installCost = 0

if(installation === "techo") installCost += points * 12
if(installation === "empotrado_existente") installCost += points * 20
if(installation === "industrial") subtotalPoints *= 1.2

let equip = 0

if(switchInstall) equip += 60
if(routerInstall) equip += 60
if(config) equip += 120

let subtotal = (subtotalPoints + installCost + rack + equip) * urgency

let iva = subtotal * 0.21

let total = subtotal + iva


function downloadPDF(){

generatePDF({
id: Date.now(),
client: client.name,
email: client.email || "cliente@email.com",
points,
price:cablePrice,
subtotal: subtotal.toFixed(2),
iva: iva.toFixed(2),
total: total.toFixed(2)
})

}


return (

<div
style={{
background:"#111827",
padding:"40px",
borderRadius:"20px",
marginTop:"40px"
}}
>

<h2
style={{
textAlign:"center",
marginBottom:"30px"
}}
>
Calculadora profesional
</h2>

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"40px"
}}
>

{/* LEFT */}

<div>

<label>Puntos de red</label>

<input
type="number"
value={points}
onChange={e=>setPoints(Number(e.target.value))}
style={{width:"100%",marginBottom:"15px"}}
/>


<label>Tipo de cable</label>

<select
value={cablePrice}
onChange={e=>setCablePrice(Number(e.target.value))}
style={{width:"100%",marginBottom:"15px"}}
>

<option value={95}>Cat6 – 95€</option>
<option value={110}>Cat6A – 110€</option>
<option value={130}>Cat7 – 130€</option>

</select>


<label>Tipo instalación</label>

<select
value={installation}
onChange={e=>setInstallation(e.target.value)}
style={{width:"100%",marginBottom:"15px"}}
>

<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado_existente">Empotrado existente</option>
<option value="industrial">Industrial</option>

</select>


<label>Rack</label>

<select
value={rack}
onChange={e=>setRack(Number(e.target.value))}
style={{width:"100%"}}
>

<option value={0}>No incluido</option>
<option value={150}>Rack 6U – 150€</option>
<option value={220}>Rack 9U – 220€</option>
<option value={290}>Rack 12U – 290€</option>

</select>

</div>


{/* RIGHT */}

<div>

<h3>Equipos</h3>

<label>
<input
type="checkbox"
checked={switchInstall}
onChange={e=>setSwitchInstall(e.target.checked)}
/>
 Switch instalación
</label>

<br/>

<label>
<input
type="checkbox"
checked={routerInstall}
onChange={e=>setRouterInstall(e.target.checked)}
/>
 Router instalación
</label>

<br/>

<label>
<input
type="checkbox"
checked={config}
onChange={e=>setConfig(e.target.checked)}
/>
 Configuración red
</label>


<br/><br/>


<label>Urgencia</label>

<select
value={urgency}
onChange={e=>setUrgency(Number(e.target.value))}
style={{width:"100%",marginBottom:"20px"}}
>

<option value={1}>Normal</option>
<option value={1.2}>Urgente (+20%)</option>
<option value={1.4}>Muy urgente (+40%)</option>

</select>


<hr/>


<p>Subtotal: {subtotal.toFixed(2)}€</p>

<p>IVA (21%): {iva.toFixed(2)}€</p>

<h2
style={{
color:"#facc15"
}}
>
Total: {total.toFixed(2)}€
</h2>


<div
style={{
display:"flex",
gap:"15px",
marginTop:"20px"
}}
>

<button
style={{
background:"#facc15",
border:"none",
padding:"12px 20px",
borderRadius:"8px",
fontWeight:"600",
cursor:"pointer"
}}
>
Guardar presupuesto
</button>


<button
onClick={downloadPDF}
style={{
background:"#22c55e",
border:"none",
padding:"12px 20px",
borderRadius:"8px",
fontWeight:"600",
color:"white",
cursor:"pointer"
}}
>
Descargar PDF
</button>

</div>

</div>

</div>

</div>

)

}
