import { useState } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)
const [cable,setCable] = useState("cat6")
const [installation,setInstallation] = useState("surface")
const [rack,setRack] = useState(false)

const pricePerPoint = 95
const rackPrice = 120
const iva = 0.21

let subtotal = points * pricePerPoint

if(rack){
subtotal += rackPrice
}

const ivaAmount = subtotal * iva
const total = subtotal + ivaAmount

function handlePDF(){

generatePDF({
client,
points,
subtotal,
ivaAmount,
total
})

}

return(

<div
style={{
background:"#0e2744",
padding:"40px",
borderRadius:"16px",
marginTop:"30px"
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
style={{
width:"100%",
padding:"12px",
marginTop:"6px",
borderRadius:"10px",
border:"none"
}}
/>

<br/><br/>

<label>Tipo de cable</label>

<select
value={cable}
onChange={(e)=>setCable(e.target.value)}
style={{
width:"100%",
padding:"12px",
marginTop:"6px",
borderRadius:"10px",
border:"none"
}}
>

<option value="cat6">Cat6</option>
<option value="cat6a">Cat6A</option>
<option value="cat7">Cat7</option>

</select>

<br/><br/>

<label>Tipo instalación</label>

<select
value={installation}
onChange={(e)=>setInstallation(e.target.value)}
style={{
width:"100%",
padding:"12px",
marginTop:"6px",
borderRadius:"10px",
border:"none"
}}
>

<option value="surface">Superficial</option>
<option value="wall">Empotrado</option>

</select>

<br/><br/>

<label>
<input
type="checkbox"
checked={rack}
onChange={(e)=>setRack(e.target.checked)}
style={{marginRight:"8px"}}
/>

Instalar Rack
</label>

</div>

<div>

<h3>Resumen</h3>

<p>Subtotal: {subtotal.toFixed(2)}€</p>

<p>IVA (21%): {ivaAmount.toFixed(2)}€</p>

<h2 style={{color:"#f4c542"}}>
Total: {total.toFixed(2)}€
</h2>

<button
onClick={handlePDF}
style={{
marginTop:"20px",
background:"#2ecc71",
border:"none",
padding:"14px 24px",
borderRadius:"12px",
color:"white",
fontWeight:"bold",
cursor:"pointer"
}}
>
Descargar PDF
</button>

</div>

</div>

</div>

)

}
