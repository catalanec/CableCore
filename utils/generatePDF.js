import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function generatePDF(data){

const {
client,
points,
cable,
installation,
rack,
switchInstall,
routerInstall,
config,
subtotal,
iva,
total
} = data

const doc = new jsPDF()

const presupuestoID = "CC-" + Date.now()

doc.setFontSize(22)
doc.text("CableCore",20,20)

doc.setDrawColor(200,160,40)
doc.line(20,26,190,26)

doc.setFontSize(11)

doc.text(`Presupuesto ID: ${presupuestoID}`,20,36)
doc.text(`Cliente: ${client?.name || ""}`,20,43)
doc.text(`Teléfono: ${client?.phone || ""}`,20,50)


// TABLA

let rows = []

rows.push([
`Puntos ${cable}`,
points,
"-",
(points * (cable==="Cat6"?95:cable==="Cat6A"?110:140))
])

if(rack){
rows.push(["Rack",1,rack,rack])
}

if(switchInstall){
rows.push(["Instalación switch",1,60,60])
}

if(routerInstall){
rows.push(["Instalación router",1,60,60])
}

if(config){
rows.push(["Configuración red",1,120,120])
}


autoTable(doc,{
startY:60,
head:[["Concepto","Cantidad","Precio (€)","Total (€)"]],
body:rows,
theme:"grid",
headStyles:{
fillColor:[200,160,40]
}
})


let finalY = doc.lastAutoTable.finalY + 10


doc.text(`Subtotal: ${subtotal.toFixed(2)} €`,20,finalY)
doc.text(`IVA (21%): ${iva.toFixed(2)} €`,20,finalY+7)

doc.setFontSize(14)

doc.text(`Total: ${total.toFixed(2)} €`,20,finalY+16)


doc.line(20,finalY+25,190,finalY+25)

doc.setFontSize(10)

doc.text("Validez del presupuesto: 15 días",20,finalY+35)
doc.text("Garantía: 3 meses sobre trabajos realizados.",20,finalY+41)

doc.text("Anton Shapoval",20,finalY+52)
doc.text("Badalona, Cataluña",20,finalY+58)

doc.save("presupuesto-cablecore.pdf")

}
