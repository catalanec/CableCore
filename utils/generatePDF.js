import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function generatePDF(data){

const doc = new jsPDF()

doc.setFont("Helvetica")

doc.setFontSize(26)
doc.text("CableCore",25,30)

doc.setDrawColor(201,162,39)
doc.line(25,35,190,35)

doc.setFontSize(12)

const clientName = data.client?.name || "Cliente"
const clientPhone = data.client?.phone || ""

doc.text(`Presupuesto ID: CC-${Date.now()}`,25,50)
doc.text(`Cliente: ${clientName}`,25,60)
doc.text(`Teléfono: ${clientPhone}`,25,70)

let rows = []

rows.push([
`Puntos red ${data.cableType || ""}`,
data.points,
data.cable,
(data.points * data.cable).toFixed(2)
])

if(data.canaleta > 0){
rows.push([
"Canaleta",
`${data.canaleta} m`,
8,
(data.canaleta*8).toFixed(2)
])
}

if(data.regata > 0){
rows.push([
"Regata",
`${data.regata} m`,
22,
(data.regata*22).toFixed(2)
])
}

if(data.corrugado > 0){
rows.push([
"Tubo corrugado",
`${data.corrugado} m`,
4.5,
(data.corrugado*4.5).toFixed(2)
])
}

if(data.rack > 0){
rows.push([
"Rack",
1,
data.rack,
data.rack
])
}

if(data.switchInstall){
rows.push([
"Instalación switch",
1,
60,
60
])
}

if(data.routerInstall){
rows.push([
"Instalación router",
1,
60,
60
])
}

if(data.config){
rows.push([
"Configuración red",
1,
120,
120
])
}

autoTable(doc,{
startY:90,
head:[["Concepto","Cantidad","Precio (€)","Total (€)"]],
body:rows,
theme:"grid",
styles:{fontSize:11},
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
