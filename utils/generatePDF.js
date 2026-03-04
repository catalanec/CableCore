import jsPDF from "jspdf"

export default function generatePDF(data) {

const doc = new jsPDF()

// COLORS
const gold = [212,175,55]
const dark = [7,27,47]

// BACKGROUND HEADER
doc.setFillColor(...dark)
doc.rect(0,0,210,30,"F")

// LOGO TEXT
doc.setFont("helvetica","bold")
doc.setTextColor(255,255,255)
doc.setFontSize(20)
doc.text("CableCore",20,18)

// TAGLINE
doc.setFontSize(10)
doc.setTextColor(...gold)
doc.text("Network Infrastructure",20,24)

// LINE
doc.setDrawColor(...gold)
doc.setLineWidth(0.8)
doc.line(20,35,190,35)


// CLIENT INFO

doc.setTextColor(0,0,0)
doc.setFontSize(11)

doc.text(`Presupuesto ID: ${data.id}`,20,50)
doc.text(`Cliente: ${data.client}`,20,58)
doc.text(`Email: ${data.email}`,20,66)


// TABLE HEADER

doc.setFillColor(...gold)
doc.rect(20,80,170,10,"F")

doc.setTextColor(255,255,255)
doc.text("Concepto",22,87)
doc.text("Cantidad",90,87)
doc.text("Precio",120,87)
doc.text("Total",160,87)


// TABLE ROW

doc.setTextColor(0,0,0)

doc.text("Puntos de red",22,100)
doc.text(String(data.points),95,100)
doc.text(`${data.price}€`,125,100)
doc.text(`${data.points * data.price}€`,165,100)


// TOTALS

doc.setFont("helvetica","bold")

doc.text(`Subtotal: ${data.subtotal}€`,20,140)
doc.text(`IVA (21%): ${data.iva}€`,20,148)
doc.text(`TOTAL: ${data.total}€`,20,160)


// FOOTER

doc.setDrawColor(...gold)
doc.line(20,170,190,170)

doc.setFontSize(10)

doc.text("Validez del presupuesto: 15 dias",20,180)
doc.text("Garantia: 3 meses sobre trabajos realizados.",20,186)

doc.text("CableCore",20,200)
doc.text("Badalona, Cataluña",20,206)

doc.save(`CableCore-${data.id}.pdf`)

}
