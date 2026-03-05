import jsPDF from "jspdf"

export function generatePDF(client, data) {

const doc = new jsPDF()

const primary = "#071a2c"
const gold = "#d4af37"

const pageWidth = doc.internal.pageSize.width

// HEADER
doc.setFillColor(primary)
doc.rect(0,0,pageWidth,30,"F")

doc.setTextColor(255,255,255)
doc.setFontSize(22)
doc.text("CableCore",15,18)

doc.setFontSize(11)
doc.text("Network Infrastructure",15,25)


// LINE
doc.setDrawColor(212,175,55)
doc.setLineWidth(0.6)
doc.line(15,35,pageWidth-15,35)


// CLIENT INFO
doc.setTextColor(0,0,0)
doc.setFontSize(11)

const presupuestoId = "CC-" + Date.now()

doc.text(`Presupuesto ID: ${presupuestoId}`,15,45)

doc.text(`Cliente: ${client?.name || "-"}`,15,52)

doc.text(`Teléfono: ${client?.phone || "-"}`,15,59)

doc.text(`Dirección: ${client?.address || "-"}`,15,66)


// TABLE HEADER
doc.setFillColor(212,175,55)
doc.rect(15,80,pageWidth-30,8,"F")

doc.setTextColor(255,255,255)
doc.setFontSize(10)

doc.text("Concepto",18,86)
doc.text("Cantidad",90,86)
doc.text("Precio",120,86)
doc.text("Total",160,86)


// TABLE DATA
doc.setTextColor(0,0,0)

doc.text("Instalación punto de red",18,100)
doc.text(String(data.points),90,100)
doc.text(`${data.price} €`,120,100)
doc.text(`${data.subtotal} €`,160,100)


// TOTALS
doc.setFontSize(11)

doc.text(`Subtotal: ${data.subtotal} €`,15,130)
doc.text(`IVA (21%): ${data.iva} €`,15,138)

doc.setFontSize(14)
doc.setTextColor(212,175,55)
doc.text(`TOTAL: ${data.total} €`,15,150)


// FOOTER LINE
doc.setDrawColor(212,175,55)
doc.line(15,160,pageWidth-15,160)

doc.setTextColor(0,0,0)
doc.setFontSize(10)

doc.text("Validez del presupuesto: 15 días",15,170)
doc.text("Garantía: 3 meses sobre trabajos realizados.",15,177)

doc.text("CableCore",15,190)
doc.text("Barcelona, Cataluña",15,197)


// SAVE
doc.save("presupuesto_cablecore.pdf")

}
