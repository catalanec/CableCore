import jsPDF from "jspdf";

export default function generatePDF(data) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // HEADER
  doc.setFillColor(12, 34, 56);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("CableCore", 20, 20);

  doc.setFontSize(11);
  doc.text("Network Infrastructure", 20, 28);

  // GOLD LINE
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(20, 40, pageWidth - 20, 40);

  // CLIENT INFO
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  doc.text(`Presupuesto ID: CC-${data.id}`, 20, 55);
  doc.text(`Cliente: ${data.client}`, 20, 65);
  doc.text(`Email: ${data.email}`, 20, 75);

  // TABLE HEADER
  const startY = 95;

  doc.setFillColor(212, 175, 55);
  doc.rect(20, startY, pageWidth - 40, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);

  doc.text("Concepto", 22, startY + 7);
  doc.text("Cantidad", 90, startY + 7);
  doc.text("Precio Unitario", 120, startY + 7);
  doc.text("Total", 170, startY + 7);

  // TABLE ROW
  const rowY = startY + 15;

  doc.setTextColor(0, 0, 0);

  doc.text("Instalación punto de red", 22, rowY);
  doc.text(String(data.points), 95, rowY);
  doc.text(`${data.price} €`, 125, rowY);
  doc.text(`${data.points * data.price} €`, 170, rowY);

  // TOTALS
  const totalsY = rowY + 25;

  doc.setFontSize(12);
  doc.text(`Subtotal: ${data.subtotal} €`, 20, totalsY);
  doc.text(`IVA (21%): ${data.iva} €`, 20, totalsY + 10);

  doc.setFontSize(16);
  doc.text(`TOTAL: ${data.total} €`, 20, totalsY + 25);

  // FOOTER LINE
  doc.setDrawColor(212, 175, 55);
  doc.line(20, totalsY + 40, pageWidth - 20, totalsY + 40);

  // FOOTER
  doc.setFontSize(10);

  doc.text("Validez del presupuesto: 15 días", 20, totalsY + 55);
  doc.text("Garantía: 3 meses sobre trabajos realizados.", 20, totalsY + 65);

  doc.text("CableCore", 20, totalsY + 85);
  doc.text("Badalona, Cataluña", 20, totalsY + 95);

  doc.save(`CableCore_Presupuesto_${data.id}.pdf`);
}
