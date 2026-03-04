// components/CableCalculator.js

import { useState } from "react"
import jsPDF from "jspdf"

export default function CableCalculator({ onSave, client }) {

const [points,setPoints] = useState(1)
const [cable,setCable] = useState(95)
const [installation,setInstallation] = useState("superficial")
const [rack,setRack] = useState(0)

const [switchEquip,setSwitch] = useState(false)
const [routerEquip,setRouter] = useState(false)
const [configEquip,setConfig] = useState(false)

const [urgency,setUrgency] = useState(1)

function calculate(){

let subtotalPoints = points * cable
let installCost = 0

if(installation==="techo") installCost += points * 12
if(installation==="empotrado_existente") installCost += points * 20
if(installation==="industrial") subtotalPoints *= 1.2

let equip = 0

if(switchEquip) equip += 60
if(routerEquip) equip += 60
if(configEquip) equip += 120

let subtotal = (subtotalPoints + installCost + rack + equip) * urgency
let iva = subtotal * 0.21
let total = subtotal + iva

return{
subtotal: subtotal.toFixed(2),
iva: iva.toFixed(2),
total: total.toFixed(2)
}

}

const result = calculate()

function generatePDF(){

const doc = new jsPDF()

const today = new Date()

const presupuestoID =
"CC-" +
today.getFullYear() +
(today.getMonth()+1) +
today.getDate() +
today.getHours() +
today.getMinutes()

const date = today.toLocaleDateString()

const pageWidth = doc.internal.pageSize.getWidth()

doc.setFont("helvetica","bold")
doc.setFontSize(28)
doc.text("CableCore",20,30)

doc.setDrawColor(201,164,39)
doc.setLineWidth(0.8)
doc.line(20,36,pageWidth-20,36)

doc.setFontSize(11)
doc.setFont("helvetica","normal")

doc.text(`Presupuesto ID: ${presupuestoID}`,20,55)

if(client){

doc.text(`Cliente: ${client.name}`,20,65)
doc.text(`Teléfono: ${client.phone}`,20,73)

}

doc.text(`Fecha: ${date}`,20,83)

const tableStart = 105

doc.setFillColor(201,164,39)
doc.rect(20,tableStart,170,10,"F")

doc.setTextColor(255,255,255)
doc.setFontSize(11)

doc.text("Concepto",22,tableStart+7)
doc.text("Cantidad",85,tableStart+7)
doc.text("Precio Unitario (€)",110,tableStart+7)
doc.text("Total (€)",165,tableStart+7)

doc.setTextColor(0,0,0)

let y = tableStart + 18

const puntosTotal = points * cable

doc.text("Puntos de red Cat",22,y)
doc.text(String(points),90,y)
doc.text(`${cable}`,120,y)
doc.text(`${puntosTotal}`,170,y)

y += 12

if(installation !== "superficial"){

doc.text("Instalación",22,y)
doc.text("-",90,y)
doc.text("-",120,y)
doc.text("120",170,y)

y += 12

}

if(rack>0){

doc.text("Rack mural",22,y)
doc.text("1",90,y)
doc.text(`${rack}`,120,y)
doc.text(`${rack}`,170,y)

y += 12

}

doc.setDrawColor(200,200,200)
doc.line(20,y+6,190,y+6)

doc.setFontSize(12)

doc.text(`Subtotal: ${result.subtotal} €`,20,y+20)
doc.text(`IVA (21%): ${result.iva} €`,20,y+30)

doc.setFont("helvetica","bold")
doc.setFontSize(18)

doc.text(`Total: ${result.total} €`,20,y+45)

doc.setDrawColor(201,164,39)
doc.line(20,y+60,pageWidth-20,y+60)

doc.setFontSize(10)
doc.setFont("helvetica","normal")

doc.text("Validez del presupuesto: 15 días",20,y+80)
doc.text("Garantía: 3 meses sobre trabajos realizados.",20,y+88)

doc.text("Anton Shapoval",20,y+105)
doc.text("CIF: Y3806392K",20,y+113)
doc.text("Badalona, Cataluña",20,y+121)

doc.save(`CableCore_Presupuesto_${presupuestoID}.pdf`)

}

return(

<div style={{
background:"#111827",
padding:"50px",
borderRadius:"16px",
marginTop:"40px",
maxWidth:"950px",
marginLeft:"auto",
marginRight:"auto"
}}>

<h2 style={{
textAlign:"center",
marginBottom:"40px"
}}>
Calculadora profesional
</h2>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"60px"
}}>

<div>

<label>Puntos de red</label>

<input
type="number"
value={points}
onChange={e=>setPoints(Number(e.target.value))}
style={{width:"100%",marginBottom:"20px"}}
/>

<label>Tipo de cable</label>

<select
onChange={e=>setCable(Number(e.target.value))}
style={{width:"100%",marginBottom:"20px"}}
>

<option value="95">Cat6 – 95€</option>
<option value="110">Cat6A – 110€</option>
<option value="130">Cat7 – 130€</option>

</select>

<label>Tipo instalación</label>

<select
onChange={e=>setInstallation(e.target.value)}
style={{width:"100%",marginBottom:"20px"}}
>

<option value="superficial">Superficial</option>
<option value="techo">Techo técnico</option>
<option value="empotrado_existente">Empotrado existente</option>
<option value="industrial">Industrial</option>

</select>

<label>Rack</label>

<select
onChange={e=>setRack(Number(e.target.value))}
style={{width:"100%",marginBottom:"20px"}}
>

<option value="0">No incluido</option>
<option value="150">Rack 6U – 150€</option>
<option value="220">Rack 9U – 220€</option>
<option value="290">Rack 12U – 290€</option>

</select>

</div>

<div>

<h4>Equipos</h4>

<label>
<input
type="checkbox"
onChange={e=>setSwitch(e.target.checked)}
/>
 Switch instalación
</label>

<br/>

<label>
<input
type="checkbox"
onChange={e=>setRouter(e.target.checked)}
/>
 Router instalación
</label>

<br/>

<label>
<input
type="checkbox"
onChange={e=>setConfig(e.target.checked)}
/>
 Configuración red
</label>

<br/><br/>

<label>Urgencia</label>

<select
onChange={e=>setUrgency(Number(e.target.value))}
style={{width:"100%",marginBottom:"25px"}}
>

<option value="1">Normal</option>
<option value="1.2">Urgente +20%</option>
<option value="1.4">Muy urgente +40%</option>

</select>

<hr/>

<p>Subtotal: {result.subtotal}€</p>
<p>IVA (21%): {result.iva}€</p>

<h2 style={{color:"#facc15"}}>
Total: {result.total}€
</h2>

<button
onClick={()=>onSave(result)}
style={{
marginTop:"20px",
padding:"12px 20px",
background:"#facc15",
border:"none",
borderRadius:"6px",
fontWeight:"600",
marginRight:"10px"
}}
>
Guardar presupuesto
</button>

<button
onClick={generatePDF}
style={{
marginTop:"20px",
padding:"12px 20px",
background:"#22c55e",
border:"none",
borderRadius:"6px",
color:"white",
fontWeight:"600"
}}
>
Descargar PDF
</button>

</div>

</div>

</div>

)

}
