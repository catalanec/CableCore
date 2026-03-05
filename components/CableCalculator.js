import { useState } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)
const [cable,setCable] = useState(95)
const [installation,setInstallation] = useState(0)
const [regata,setRegata] = useState(0)
const [corrugado,setCorrugado] = useState(0)
const [rack,setRack] = useState(0)

const [switchInstall,setSwitchInstall] = useState(false)
const [routerInstall,setRouterInstall] = useState(false)
const [config,setConfig] = useState(false)

const [urgency,setUrgency] = useState(1)


const cablePrice = cable * points
const installPrice = installation * points
const regataPrice = regata * 8
const corrugadoPrice = corrugado * 5

const switchPrice = switchInstall ? 120 : 0
const routerPrice = routerInstall ? 80 : 0
const configPrice = config ? 60 : 0

const subtotal = (
cablePrice +
installPrice +
regataPrice +
corrugadoPrice +
rack +
switchPrice +
routerPrice +
configPrice
) * urgency

const iva = subtotal * 0.21
const total = subtotal + iva


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


<div>

<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={(e)=>setPoints(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px",border:"none"}}
/>

<br/><br/>

<label>Tipo de cable</label>
<select
onChange={(e)=>setCable(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>
<option value="95">Cat6 - 95€</option>
<option value="110">Cat6A - 110€</option>
<option value="130">Cat7 - 130€</option>
</select>

<br/><br/>

<label>Tipo instalación</label>
<select
onChange={(e)=>setInstallation(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>
<option value="0">Superficial</option>
<option value="30">Empotrado nuevo</option>
</select>

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

<br/><br/>

<label>Rack</label>
<select
onChange={(e)=>setRack(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>
<option value="0">No incluido</option>
<option value="290">Rack 12U - 290€</option>
<option value="420">Rack 18U - 420€</option>
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
Switch instalación
</label>

<br/>

<label>
<input
type="checkbox"
checked={routerInstall}
onChange={()=>setRouterInstall(!routerInstall)}
/>
Router instalación
</label>

<br/>

<label>
<input
type="checkbox"
checked={config}
onChange={()=>setConfig(!config)}
/>
Configuración red
</label>

<br/><br/>

<label>Urgencia</label>
<select
onChange={(e)=>setUrgency(Number(e.target.value))}
style={{width:"100%",padding:"10px",borderRadius:"8px"}}
>
<option value="1">Normal</option>
<option value="1.25">Urgente</option>
<option value="1.5">Muy urgente</option>
</select>

<hr style={{margin:"20px 0"}}/>

<p>Subtotal: {subtotal.toFixed(2)}€</p>
<p>IVA (21%): {iva.toFixed(2)}€</p>

<h2 style={{color:"#f4c542"}}>
Total: {total.toFixed(2)}€
</h2>

<button
onClick={handlePDF}
style={{
marginTop:"20px",
background:"#f1c40f",
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
