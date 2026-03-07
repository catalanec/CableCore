import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function generatePDF(data){

const doc = new jsPDF()

doc.setFontSize(26)
doc.text("CableCore",25,30)

doc.setDrawColor(201,162,39)
doc.line(25,35,190,35)

doc.setFontSize(12)

const clientName = String(data.client?.name || "Cliente")
const clientPhone = String(data.client?.phone || "")

doc.text(`Presupuesto ID: CC-${Date.now()}`,25,50)
doc.text(`Cliente: ${clientName}`,25,60)
doc.text(`Teléfono: ${clientPhone}`,25,70)

autoTable(doc,{
startY:90,
head:[["Concepto","Cantidad","Precio (€)","Total (€)"]],
body:[[
"Puntos red",
data.points,
data.cable,
(data.points * data.cable).toFixed(2)
]],
theme:"grid",
headStyles:{fillColor:[201,162,39]}
})

let y = doc.lastAutoTable.finalY + 20

doc.text(`Subtotal: ${data.subtotal.toFixed(2)} €`,25,y)
doc.text(`IVA (21%): ${data.iva.toFixed(2)} €`,25,y+10)

doc.setFontSize(16)
doc.text(`Total: ${data.total.toFixed(2)} €`,25,y+25)

doc.setDrawColor(201,162,39)
doc.line(25,y+35,190,y+35)

doc.setFontSize(11)

doc.text("Validez del presupuesto: 15 días",25,y+50)
doc.text("Garantía: 3 meses sobre trabajos realizados.",25,y+60)

doc.text("Anton Shapoval",25,y+80)
doc.text("Badalona, Cataluña",25,y+90)

doc.save("presupuesto.pdf")

}
