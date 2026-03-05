import { useState } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)

const pricePerPoint = 95
const iva = 0.21

const subtotal = points * pricePerPoint
const ivaAmount = subtotal * iva
const total = subtotal + ivaAmount

function downloadPDF(){

generatePDF({
client,
points,
subtotal,
ivaAmount,
total
})

}

return (

<div
style={{
background:"#0e2744",
padding:"40px",
borderRadius:"18px",
marginTop:"20px"
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

</div>


<div>

<h3>Resumen</h3>

<p>Subtotal: {subtotal.toFixed(2)}€</p>

<p>IVA (21%): {ivaAmount.toFixed(2)}€</p>

<h2
style={{
color:"#f4c542"
}}
>
Total: {total.toFixed(2)}€
</h2>

<button
onClick={downloadPDF}
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
