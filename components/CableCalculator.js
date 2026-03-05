import { useState } from "react"
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


// CALCULATION

let subtotalPoints = points * cable
let installCost = 0

if(installation==="superficial"){
installCost += canaleta * 8
}

if(installation==="techo"){
installCost += points * 12
}

if(installation==="empotrado_existente"){
installCost += points * 20
}

if(installation==="empotrado_nuevo"){
installCost += regata * 22
installCost += corrugado * 4.5
}

if(installation==="industrial"){
subtotalPoints *= 1.2
}

let equip = 0

if(switchInstall) equip += 60
if(routerInstall) equip += 60
if(config) equip += 120

let subtotal = (subtotalPoints + installCost + rack + equip) * urgency
let iva = subtotal * 0.21
let total = subtotal + iva


function handlePDF(){

generatePDF({
client,
subtotal,
iva,
total
})

}


return(

<div
style={{
background:"#0e2744",
padding:"40px",
borderRadius:"18px"
}}
>

<h2 style={{textAlign:"center",marginBottom:"30px"}}>
Calculadora profesional
</h2>

<div
style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"40px"
}}
>


{/* LEFT COLUMN */}

<div>

<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={(e)=>setPoints(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
/>


<br/><br/>

<label>Tipo de cable</label>
<select
onChange={(e)=>setCable(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>

<option value="95">Cat6 – 95€</option>
<option value="110">Cat6A – 110€</option>

</select>


<br/><br/>

<label>Tipo instalación</label>
<select
value={installation}
onChange={(e)=>setInstallation(e.target.value)}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>

<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado_existente">Empotrado existente</option>
<option value="empotrado_nuevo">Empotrado nuevo</option>
<option value="industrial">Industrial</option>

</select>


{/* CANALETA */}

{installation==="superficial" && (

<>
<br/><br/>

<label>Metros canaleta</label>
<input
type="number"
value={canaleta}
onChange={(e)=>setCanaleta(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
/>
</>

)}


{/* REGATA */}

{installation==="empotrado_nuevo" && (

<>
<br/><br/>

<label>Metros regata</label>
<input
type="number"
value={regata}
onChange={(e)=>setRegata(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
/>

<br/><br/>

<label>Metros corrugado</label>
<input
type="number"
value={corrugado}
onChange={(e)=>setCorrugado(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
/>

</>

)}


<br/><br/>

<label>Rack</label>
<select
onChange={(e)=>setRack(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>

<option value="0">No incluido</option>
<option value="150">Rack 6U – 150€</option>
<option value="220">Rack 9U – 220€</option>

</select>

</div>



{/* RIGHT COLUMN */}

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

<br/>

<label>
<input
type="checkbox"
checked={routerInstall}
onChange={()=>setRouterInstall(!routerInstall)}
/>
Router instalación (60€)
</label>

<br/>

<label>
<input
type="checkbox"
checked={config}
onChange={()=>setConfig(!config)}
/>
Configuración red (120€)
</label>


<br/><br/>

<label>Urgencia</label>
<select
onChange={(e)=>setUrgency(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>

<option value="1">Normal</option>
<option value="1.2">Urgente (+20%)</option>
<option value="1.4">Muy urgente (+40%)</option>

</select>


<hr style={{margin:"25px 0"}}/>


<p>Subtotal: {subtotal.toFixed(2)}€</p>

<p>IVA (21%): {iva.toFixed(2)}€</p>


<h2 style={{color:"#facc15"}}>
Total: {total.toFixed(2)}€
</h2>


<button
onClick={handlePDF}
style={{
marginTop:"20px",
background:"#facc15",
border:"none",
padding:"14px 24px",
borderRadius:"10px",
cursor:"pointer",
fontWeight:"bold"
}}
>
Guardar presupuesto
</button>


</div>

</div>

</div>

)

}
