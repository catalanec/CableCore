"use client"

import { useState, useEffect } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)

const [cable,setCable] = useState(95)
const [cableType,setCableType] = useState("Cat6")

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
installCost += points * 12
installCost += corrugado * 4.5
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

let subtotalCalc = (subtotalPoints + installCost + rack + equip) * urgency
let ivaCalc = subtotalCalc * 0.21
let totalCalc = subtotalCalc + ivaCalc

setSubtotal(subtotalCalc)
setIva(ivaCalc)
setTotal(totalCalc)

},[
points,
cable,
installation,
canaleta,
regata,
corrugado,
rack,
switchInstall,
routerInstall,
config,
urgency
])


function downloadPDF(){

generatePDF({

client:{
name:String(client?.name || ""),
phone:String(client?.phone || "")
},

points:Number(points),

cable:Number(cable),

cableType:String(cableType),

canaleta:Number(canaleta),

regata:Number(regata),

corrugado:Number(corrugado),

rack:Number(rack),

switchInstall:Boolean(switchInstall),
routerInstall:Boolean(routerInstall),
config:Boolean(config),

subtotal:Number(subtotal),
iva:Number(iva),
total:Number(total)

})

}


return(

<div className="calculator">

<div className="grid grid-cols-2 gap-10">

<div>

<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={(e)=>setPoints(Number(e.target.value))}
/>

<label>Tipo de cable</label>
<select
onChange={(e)=>{
const val=e.target.value
setCableType(val)

if(val==="Cat6") setCable(95)
if(val==="Cat6A") setCable(110)
if(val==="Cat7") setCable(140)
}}
>

<option>Cat6</option>
<option>Cat6A</option>
<option>Cat7</option>

</select>


<label>Tipo instalación</label>
<select
value={installation}
onChange={(e)=>setInstallation(e.target.value)}
>

<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado_existente">Empotrado existente</option>
<option value="empotrado_nuevo">Empotrado nuevo</option>
<option value="industrial">Industrial</option>

</select>


{installation==="superficial" && (
<>
<label>Metros canaleta</label>
<input
type="number"
value={canaleta}
onChange={(e)=>setCanaleta(Number(e.target.value))}
/>
</>
)}


{installation==="empotrado_nuevo" && (
<>
<label>Metros regata</label>
<input
type="number"
value={regata}
onChange={(e)=>setRegata(Number(e.target.value))}
/>

<label>Metros tubo corrugado</label>
<input
type="number"
value={corrugado}
onChange={(e)=>setCorrugado(Number(e.target.value))}
/>
</>
)}


{installation==="techo" && (
<>
<label>Metros tubo corrugado</label>
<input
type="number"
value={corrugado}
onChange={(e)=>setCorrugado(Number(e.target.value))}
/>
</>
)}


<label>Rack</label>
<select
onChange={(e)=>setRack(Number(e.target.value))}
>

<option value="0">No incluido</option>
<option value="150">Rack 6U</option>
<option value="220">Rack 9U</option>
<option value="290">Rack 12U</option>

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


<label>Urgencia</label>

<select
value={urgency}
onChange={(e)=>setUrgency(Number(e.target.value))}
>

<option value="1">Normal</option>
<option value="1.2">Urgente +20%</option>
<option value="1.4">Muy urgente +40%</option>

</select>


<hr/>

<p>Subtotal: {subtotal.toFixed(2)} €</p>
<p>IVA (21%): {iva.toFixed(2)} €</p>

<h2>Total: {total.toFixed(2)} €</h2>


<div className="flex gap-4 mt-6">

<button
onClick={downloadPDF}
className="bg-green-500 text-white px-5 py-3 rounded"
>
Descargar PDF
</button>

<button
className="bg-yellow-400 px-5 py-3 rounded"
>
Guardar presupuesto
</button>

</div>

</div>

</div>

</div>

)

}
