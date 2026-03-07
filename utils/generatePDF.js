import jsPDF from "jspdf"

export function generatePDF(data){

const doc = new jsPDF()

doc.setFontSize(22)
doc.text("CableCore",20,20)

doc.setFontSize(12)

doc.text(`Cliente: ${data.client || ""}`,20,40)

doc.text(`Puntos de red`,20,70)
doc.text(`${data.points}`,100,70)
doc.text(`${data.cablePrice}€`,130,70)
doc.text(`${data.points * data.cablePrice}€`,160,70)

doc.text(`Subtotal: ${data.subtotal.toFixed(2)} €`,20,120)
doc.text(`IVA (21%): ${data.iva.toFixed(2)} €`,20,130)

doc.setFontSize(16)
doc.text(`Total: ${data.total.toFixed(2)} €`,20,150)

doc.save("presupuesto.pdf")

}
