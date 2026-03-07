import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function generatePDF(data){

const doc = new jsPDF()

doc.setFontSize(26)
doc.text("CableCore",20,30)

doc.setDrawColor(201,162,39)
doc.line(20,35,180,35)

doc.setFontSize(12)

doc.text(`Presupuesto ID: CC-${Date.now()}`,20,50)
doc.text(`Cliente: ${data.client?.name || ""}`,20,60)
doc.text(`Teléfono: ${data.client?.phone || ""}`,20,70)

autoTable(doc,{
startY:90,

head:[["Concepto","Cantidad","Precio (€)","Total (€)"]],

body:[
["Puntos red",data.points,data.cable,data.points*data.cable]
],

theme:"grid",

tableWidth:160,

margin:{left:20,right:20},

styles:{
fontSize:11,
cellPadding:6
},

headStyles:{
fillColor:[201,162,39],
textColor:255
},

columnStyles:{
0:{cellWidth:75},
1:{cellWidth:25},
2:{cellWidth:30},
3:{cellWidth:30}
}

})

let y = doc.lastAutoTable.finalY + 20

doc.text(`Subtotal: ${data.subtotal.toFixed(2)} €`,20,y)
doc.text(`IVA (21%): ${data.iva.toFixed(2)} €`,20,y+10)

doc.setFontSize(16)
doc.text(`Total: ${data.total.toFixed(2)} €`,20,y+25)

doc.line(20,y+35,180,y+35)

doc.setFontSize(11)

doc.text("Validez del presupuesto: 15 días",20,y+50)
doc.text("Garantía: 3 meses sobre trabajos realizados.",20,y+60)

doc.text("Anton Shapoval",20,y+80)
doc.text("Badalona, Cataluña",20,y+90)

doc.save("presupuesto.pdf")

}
