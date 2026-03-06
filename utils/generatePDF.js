import jsPDF from "jspdf"

export function generatePDF(data){

const doc = new jsPDF()

const {
client,
points,
cable,
installation,
corrugado,
regata,
canaleta,
rack,
switchInstall,
routerInstall,
config,
subtotal,
iva,
total
} = data


let y = 20

doc.setFontSize(22)
doc.text("CableCore",20,y)

y+=10

doc.setFontSize(12)

doc.text(`Cliente: ${client?.name || ""}`,20,y)
y+=7

doc.text(`Dirección: ${client?.address || ""}`,20,y)
y+=7

doc.text(`Teléfono: ${client?.phone || ""}`,20,y)

y+=15

doc.line(20,y,190,y)

y+=10

doc.text(`Puntos de red: ${points}`,20,y)
y+=7

doc.text(`Cable: ${cable}`,20,y)
y+=7

doc.text(`Instalación: ${installation}`,20,y)
y+=7


if(corrugado){
doc.text(`Corrugado: ${corrugado} m`,20,y)
y+=7
}

if(regata){
doc.text(`Regata: ${regata} m`,20,y)
y+=7
}

if(canaleta){
doc.text(`Canaleta: ${canaleta} m`,20,y)
y+=7
}

if(rack){
doc.text(`Rack: ${rack} €`,20,y)
y+=7
}


if(switchInstall || routerInstall || config){

y+=5

doc.text("Equipos:",20,y)
y+=7

if(switchInstall){
doc.text("- Instalación switch",20,y)
y+=7
}

if(routerInstall){
doc.text("- Instalación router",20,y)
y+=7
}

if(config){
doc.text("- Configuración red",20,y)
y+=7
}

}

y+=10

doc.line(20,y,190,y)

y+=10

doc.text(`Subtotal: ${subtotal.toFixed(2)} €`,20,y)
y+=7

doc.text(`IVA (21%): ${iva.toFixed(2)} €`,20,y)
y+=10

doc.setFontSize(16)

doc.text(`TOTAL: ${total.toFixed(2)} €`,20,y)

doc.save("presupuesto-cablecore.pdf")

}
