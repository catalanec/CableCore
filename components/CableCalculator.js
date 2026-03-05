import { useState } from "react"
import { generatePDF } from "../utils/generatePDF"

export default function CableCalculator({ client }) {

const [points,setPoints] = useState(1)
const pricePerPoint = 95

const subtotal = points * pricePerPoint
const iva = +(subtotal * 0.21).toFixed(2)
const total = +(subtotal + iva).toFixed(2)

function downloadPDF(){

generatePDF(client,{
points:points,
price:pricePerPoint,
subtotal:subtotal,
iva:iva,
total:total
})

}

return(

<div style={{
background:"#0b1d33",
padding:"40px",
borderRadius:"20px",
maxWidth:"900px",
margin:"40px auto",
color:"white"
}}>

<h2 style={{
textAlign:"center",
marginBottom:"30px"
}}>
Calculadora profesional
</h2>


<div style={{
display:"flex",
flexWrap:"wrap",
gap:"40px"
}}>

<div style={{flex:"1"}}>

<label>Puntos de red</label>

<input
type="number"
value={points}
onChange={(e)=>setPoints(Number(e.target.value))}
style={{
width:"100%",
padding:"10px",
borderRadius:"8px",
marginTop:"5px"
}}
/>

</div>


<div style={{flex:"1"}}>

<h3>Resumen</h3>

<p>Subtotal: {subtotal.toFixed(2)}€</p>

<p>IVA (21%): {iva.toFixed(2)}€</p>

<h2 style={{color:"#d4af37"}}>
Total: {total.toFixed(2)}€
</h2>

</div>

</div>


<div style={{
marginTop:"30px",
display:"flex",
gap:"20px"
}}>

<button
onClick={downloadPDF}
style={{
background:"#22c55e",
border:"none",
padding:"14px 25px",
borderRadius:"10px",
color:"white",
fontWeight:"bold",
cursor:"pointer"
}}
>
Descargar PDF
</button>

</div>

</div>

)

}
