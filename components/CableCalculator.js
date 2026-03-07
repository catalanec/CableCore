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

let cost = points * cable

if(installation==="superficial"){
cost += canaleta * 8
}

if(installation==="techo"){
cost += points * 12
cost += corrugado * 4.5
}

if(installation==="empotrado"){
cost += regata * 22
cost += corrugado * 4.5
}

if(installation==="industrial"){
cost += points * 25
}

if(rack>0){
cost += rack
}

if(switchInstall){
cost += 60
}

if(routerInstall){
cost += 60
}

if(config){
cost += 120
}

cost *= urgency

setSubtotal(cost)

const ivaCalc = cost * 0.21
setIva(ivaCalc)

setTotal(cost + ivaCalc)

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

return(

<div className="mt-8 bg-[#142c44] p-8 rounded-xl">

<h2 className="text-2xl mb-6 text-center">
Calculadora profesional
</h2>

<div className="grid grid-cols-2 gap-6">

<div>
<label>Puntos de red</label>
<input
type="number"
value={points}
onChange={(e)=>setPoints(Number(e.target.value))}
className="w-full p-2 rounded text-black"
/>
</div>

<div>
<label>Tipo de cable</label>
<select
value={cableType}
onChange={(e)=>{

setCableType(e.target.value)

if(e.target.value==="Cat6") setCable(95)
if(e.target.value==="Cat6a") setCable(120)
if(e.target.value==="Cat7") setCable(140)

}}
className="w-full p-2 rounded text-black"
>

<option value="Cat6">Cat6</option>
<option value="Cat6a">Cat6a</option>
<option value="Cat7">Cat7</option>

</select>
</div>

<div>
<label>Tipo instalación</label>
<select
value={installation}
onChange={(e)=>setInstallation(e.target.value)}
className="w-full p-2 rounded text-black"
>

<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado">Empotrado</option>
<option value="industrial">Industrial</option>

</select>
</div>

<div>
<label>Metros canaleta</label>
<input
type="number"
value={canaleta}
onChange={(e)=>setCanaleta(Number(e.target.value))}
className="w-full p-2 rounded text-black"
/>
</div>

<div>
<label>Metros regata</label>
<input
type="number"
value={regata}
onChange={(e)=>setRegata(Number(e.target.value))}
className="w-full p-2 rounded text-black"
/>
</div>

<div>
<label>Metros tubo corrugado</label>
<input
type="number"
value={corrugado}
onChange={(e)=>setCorrugado(Number(e.target.value))}
className="w-full p-2 rounded text-black"
/>
</div>

<div>
<label>Rack</label>
<select
value={rack}
onChange={(e)=>setRack(Number(e.target.value))}
className="w-full p-2 rounded text-black"
>

<option value="0">No incluido</option>
<option value="250">Rack 6U</option>
<option value="400">Rack 9U</option>

</select>
</div>

<div>
<label>Urgencia</label>
<select
value={urgency}
onChange={(e)=>setUrgency(Number(e.target.value))}
className="w-full p-2 rounded text-black"
>

<option value="1">Normal</option>
<option value="1.3">Urgente</option>
<option value="1.5">Muy urgente</option>

</select>
</div>

</div>

<div className="mt-8">

<h3 className="mb-2">Equipos</h3>

<label className="block">
<input
type="checkbox"
checked={switchInstall}
onChange={(e)=>setSwitchInstall(e.target.checked)}
/>
Switch instalación (60€)
</label>

<label className="block">
<input
type="checkbox"
checked={routerInstall}
onChange={(e)=>setRouterInstall(e.target.checked)}
/>
Router instalación (60€)
</label>

<label className="block">
<input
type="checkbox"
checked={config}
onChange={(e)=>setConfig(e.target.checked)}
/>
Configuración red (120€)
</label>

</div>

<hr className="my-6"/>

<p>Subtotal: {subtotal.toFixed(2)} €</p>
<p>IVA (21%): {iva.toFixed(2)} €</p>

<h3 className="text-xl mt-2">
Total: {total.toFixed(2)} €
</h3>

<div className="flex gap-4 mt-6">

<button
onClick={()=>generatePDF({
client,
points,
cable,
subtotal,
iva,
total
})}
className="bg-green-500 px-4 py-2 rounded"
>

Descargar PDF

</button>

</div>

</div>

)

}
