import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function generatePDF(data){

const doc = new jsPDF()

// TITLE
doc.setFontSize(26)
doc.text("CableCore",30,30)

// GOLD LINE TOP
doc.setDrawColor(201,162,39)
doc.line(30,35,180,35)

// CLIENT INFO
doc.setFontSize(12)

doc.text("Presupuesto ID: CC-" + Date.now(),30,50)
doc.text("Cliente: " + (data.client?.name || ""),30,60)
doc.text("Teléfono: " + (data.client?.phone || ""),30,70)

// TABLE
autoTable(doc,{
startY:90,

head:[
["Concepto","Cantidad","Precio (€)","Total (€)"]
],

body:[
["Puntos red",data.points,data.cable,data.points*data.cable]
],

theme:"grid",

tableWidth:150,

margin:{
left:30,
right:30
},

styles:{
fontSize:11,
cellPadding:6,
halign:"left"
},

headStyles:{
fillColor:[201,162,39],
textColor:255,
fontStyle:"bold"
},

columnStyles:{
0:{cellWidth:75},
1:{cellWidth:20, halign:"center"},
2:{cellWidth:25, halign:"center"},
3:{cellWidth:30, halign:"center"}
}

})

// TOTALS
let y = doc.lastAutoTable.finalY + 20

doc.setFontSize(12)

doc.text(`Subtotal: ${data.subtotal.toFixed(2)} €`,30,y)
doc.text(`IVA (21%): ${data.iva.toFixed(2)} €`,30,y+10)

doc.setFontSize(16)
doc.text(`Total: ${data.total.toFixed(2)} €`,30,y+25)

// GOLD LINE BOTTOM
doc.setDrawColor(201,162,39)
doc.line(30,y+35,180,y+35)

// FOOTER
doc.setFontSize(11)

doc.text("Validez del presupuesto: 15 días",30,y+50)
doc.text("Garantía: 3 meses sobre trabajos realizados.",30,y+60)

doc.text("Anton Shapoval",30,y+80)
doc.text("Badalona, Cataluña",30,y+90)

// SAVE
doc.save("presupuesto.pdf")

}
