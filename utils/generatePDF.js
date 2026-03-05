import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function generatePDF(data){

const doc = new jsPDF()

const pageWidth = doc.internal.pageSize.width


// HEADER

doc.setFillColor(12,34,56)
doc.rect(0,0,pageWidth,35,"F")

doc.setTextColor(255,255,255)
doc.setFontSize(22)
doc.text("CableCore",20,20)

doc.setFontSize(11)
doc.text("Network Infrastructure",20,28)


// GOLD LINE

doc.setDrawColor(212,175,55)
doc.setLineWidth(1)

doc.line(20,40,pageWidth-20,40)


// CLIENT INFO

doc.setTextColor(0,0,0)

doc.setFontSize(11)

doc.text(`Presupuesto ID: CC-${data.id}`,20,55)
doc.text(`Cliente: ${data.client}`,20,65)
doc.text(`Email: ${data.email}`,20,75)


// TABLE

autoTable(doc,{
startY:90,
head:[[
"Concepto",
"Cantidad",
"Precio Unitario",
"Total"
]],
body:[
[
"Instalación punto de red",
data.points,
`${data.price} €`,
`${data.points * data.price} €`
]
],
theme:"grid",
headStyles:{
fillColor:[212,175,55]
}
})


// TOTALS

let finalY = doc.lastAutoTable.finalY + 20

doc.setFontSize(12)

doc.text(`Subtotal: ${data.subtotal} €`,20,finalY)

doc.text(`IVA (21%): ${data.iva} €`,20,finalY+10)

doc.setFontSize(16)

doc.text(`TOTAL: ${data.total} €`,20,finalY+25)


// FOOTER LINE

doc.setDrawColor(212,175,55)

doc.line(20,finalY+40,pageWidth-20,finalY+40)


// FOOTER TEXT

doc.setFontSize(10)

doc.text("Validez del presupuesto: 15 días",20,finalY+55)

doc.text("Garantía: 3 meses sobre trabajos realizados.",20,finalY+65)

doc.text("CableCore",20,finalY+85)
doc.text("Badalona, Cataluña",20,finalY+95)


// SAVE

doc.save(`CableCore_Presupuesto_${data.id}.pdf`)

}
