import jsPDF from "jspdf"

export function generatePDF(data){

const doc = new jsPDF()

doc.setFontSize(22)
doc.text("CableCore",20,20)

doc.setFontSize(12)

const clientName =
typeof data.client === "string"
? data.client
: data.client?.name || ""

doc.text(`Cliente: ${clientName}`,20,40)

const lineTotal = data.points * data.cablePrice

doc.text("Concepto",20,70)
doc.text("Cantidad",90,70)
doc.text("Precio",120,70)
doc.text("Total",160,70)

doc.text("Puntos de red",20,80)
doc.text(String(data.points),90,80)
doc.text(`${data.cablePrice}€`,120,80)
doc.text(`${lineTotal}€`,160,80)

doc.text(`Subtotal: ${data.subtotal.toFixed(2)} €`,20,120)
doc.text(`IVA (21%): ${data.iva.toFixed(2)} €`,20,130)

doc.setFontSize(16)
doc.text(`Total: ${data.total.toFixed(2)} €`,20,150)

doc.save("presupuesto.pdf")

}
