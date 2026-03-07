import jsPDF from "jspdf"

export function generatePDF(data){

const {
client,
points,
cable,
installation,
regata,
corrugado,
canaleta,
rack,
switchInstall,
routerInstall,
config,
subtotal,
iva,
total
} = data

const doc = new jsPDF()

let y = 20

doc.setFontSize(22)
doc.text("CableCore",20,y)

y+=10

doc.setDrawColor(200,160,40)
doc.line(20,y,190,y)

y+=12

doc.setFontSize(11)

const presupuestoID = "CC-"+Date.now()

doc.text(`Presupuesto ID: ${presupuestoID}`,20,y)
y+=7

doc.text(`Cliente: ${client?.name || ""}`,20,y)
y+=7

doc.text(`Teléfono: ${client?.phone || ""}`,20,y)

y+=10


// TABLA

doc.setFillColor(200,160,40)

doc.rect(20,y,170,8,"F")

doc.setTextColor(255,255,255)

doc.text("Concepto",22,y+5)
doc.text("Cantidad",90,y+5)
doc.text("Precio",120,y+5)
doc.text("Total",160,y+5)

doc.setTextColor(0,0,0)

y+=10


// PUNTOS

doc.text(`Puntos ${cable}`,22,y)
doc.text(String(points),95,y)
doc.text("-",125,y)
doc.text(String(points*(cable==="Cat6"?95:cable==="Cat6A"?110:140)),160,y)

y+=8


// INSTALACION

doc.text("Instalación",22,y)
doc.text("-",95,y)
doc.text("-",125,y)
doc.text(String((subtotal*0.2).toFixed(0)),160,y)

y+=8


// RACK

if(rack){

doc.text("Rack",22,y)
doc.text("1",95,y)
doc.text(String(rack),125,y)
doc.text(String(rack),160,y)

y+=8

}


// EQUIPOS

if(switchInstall){

doc.text("Instalación switch",22,y)
doc.text("1",95,y)
doc.text("60",125,y)
doc.text("60",160,y)

y+=8

}

if(routerInstall){

doc.text("Instalación router",22,y)
doc.text("1",95,y)
doc.text("60",125,y)
doc.text("60",160,y)

y+=8

}

if(config){

doc.text("Configuración red",22,y)
doc.text("1",95,y)
doc.text("120",125,y)
doc.text("120",160,y)

y+=8

}


y+=5

doc.line(20,y,190,y)

y+=10


doc.text(`Subtotal: ${subtotal.toFixed(2)} €`,20,y)
y+=7

doc.text(`IVA (21%): ${iva.toFixed(2)} €`,20,y)
y+=10

doc.setFontSize(14)

doc.text(`Total: ${total.toFixed(2)} €`,20,y)


y+=15

doc.line(20,y,190,y)

y+=10

doc.setFontSize(10)

doc.text("Validez del presupuesto: 15 días",20,y)
y+=6

doc.text("Garantía: 3 meses sobre trabajos realizados.",20,y)

y+=12

doc.text("Anton Shapoval",20,y)
y+=6

doc.text("Badalona, Cataluña",20,y)


doc.save("presupuesto-cablecore.pdf")

}
