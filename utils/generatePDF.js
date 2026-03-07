import jsPDF from "jspdf"

function decodeClient(client){

if(!client) return ""

if(typeof client === "string") return client

if(client.name) return client.name
if(client.nombre) return client.nombre

try{
return atob(client)
}catch{
return ""
}

}

export function generatePDF(data){

const doc = new jsPDF()

const points = Number(data.points) || 0
const cablePrice = Number(data.cablePrice) || 0
const subtotal = Number(data.subtotal) || 0
const iva = Number(data.iva) || 0
const total = Number(data.total) || 0

const clientName = decodeClient(data.client)

const lineTotal = points * cablePrice

doc.setFontSize(22)
doc.text("CableCore",20,20)

doc.setFontSize(12)

doc.text(`Cliente: ${clientName}`,20,40)

doc.text("Concepto",20,70)
doc.text("Cantidad",90,70)
doc.text("Precio (€)",120,70)
doc.text("Total (€)",160,70)

doc.text("Puntos de red",20,80)
doc.text(String(points),90,80)
doc.text(`${cablePrice}€`,120,80)
doc.text(`${lineTotal}€`,160,80)

doc.text(`Subtotal: ${subtotal.toFixed(2)} €`,20,120)
doc.text(`IVA (21%): ${iva.toFixed(2)} €`,20,130)

doc.setFontSize(16)
doc.text(`Total: ${total.toFixed(2)} €`,20,150)

doc.save("presupuesto.pdf")

}
