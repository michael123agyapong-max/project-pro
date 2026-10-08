import { jsPDF } from 'jspdf'

const BUSINESS = { name: 'Project Pro', phone: '0593812227' }

const fmt = n => 'GHS ' + Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })

function receiptNumber(payment) {
  const d = new Date(payment.date || payment.created_at)
  const datePart = isNaN(d) ? '' : d.toISOString().slice(0, 10).replace(/-/g, '')
  const idPart = String(payment.id).replace(/-/g, '').slice(-6).toUpperCase()
  return `PP-${datePart}-${idPart}`
}

/**
 * paymentsSoFar: all payments for this client that were made on or before `payment`,
 * payment included.
 */
export function buildReceiptPDF(client, payment, paymentsSoFar) {
  const paidToDate = paymentsSoFar.reduce((a, p) => a + Number(p.amount), 0)
  const total = Number(client.total || 0)
  const remaining = Math.max(0, total - paidToDate)
  const fullyPaid = total > 0 && remaining <= 0

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 50
  let y = 60

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(20, 20, 20)
  doc.text(BUSINESS.name, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Tel: ${BUSINESS.phone}`, margin, y + 16)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(20, 20, 20)
  doc.text('RECEIPT', pageWidth - margin, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(receiptNumber(payment), pageWidth - margin, y + 16, { align: 'right' })
  doc.text(`Date: ${payment.date}`, pageWidth - margin, y + 30, { align: 'right' })

  y += 55
  doc.setDrawColor(210, 210, 210)
  doc.line(margin, y, pageWidth - margin, y)
  y += 28

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(130, 130, 130)
  doc.text('BILLED TO', margin, y)
  y += 16
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(20, 20, 20)
  doc.text(client.name, margin, y)
  if (client.phone) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(client.phone, margin, y + 15)
  }

  y += 40
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(130, 130, 130)
  doc.text('PROJECT', margin, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(20, 20, 20)
  const topicLines = doc.splitTextToSize(client.topic || '-', pageWidth - margin * 2)
  doc.text(topicLines, margin, y)
  y += topicLines.length * 14 + 4
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(client.type || '', margin, y)

  y += 35
  doc.setFillColor(246, 246, 246)
  doc.roundedRect(margin, y, pageWidth - margin * 2, 70, 6, 6, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('AMOUNT RECEIVED', margin + 20, y + 24)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(40, 130, 90)
  doc.text(fmt(payment.amount), margin + 20, y + 50)
  if (payment.note) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(payment.note, pageWidth - margin - 20, y + 24, { align: 'right' })
  }

  y += 100
  const rows = [
    ['Total Project Fee', fmt(total)],
    ['Total Paid to Date', fmt(paidToDate)],
    ['Balance Remaining', fmt(remaining)],
  ]
  rows.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += 22
    if (i < rows.length - 1) {
      doc.setDrawColor(235, 235, 235)
      doc.line(margin, y - 10, pageWidth - margin, y - 10)
    }
  })

  y += 15
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(fullyPaid ? 40 : 200, fullyPaid ? 130 : 90, fullyPaid ? 90 : 60)
  doc.text(fullyPaid ? 'PAID IN FULL' : 'PARTIAL PAYMENT', margin, y)

  y += 50
  doc.setDrawColor(210, 210, 210)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(150, 150, 150)
  doc.text('Thank you for your business.', margin, y)
  doc.text('This is a computer-generated receipt.', margin, y + 13)

  return doc
}

export function downloadReceipt(client, payment, paymentsSoFar) {
  const doc = buildReceiptPDF(client, payment, paymentsSoFar)
  const filename = `Receipt-${client.name.replace(/\s+/g, '_')}-${payment.date}.pdf`
  doc.save(filename)
}

export async function shareReceipt(client, payment, paymentsSoFar) {
  const doc = buildReceiptPDF(client, payment, paymentsSoFar)
  const filename = `Receipt-${client.name.replace(/\s+/g, '_')}-${payment.date}.pdf`
  const blob = doc.output('blob')
  const file = new File([blob], filename, { type: 'application/pdf' })

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Payment Receipt',
        text: `Receipt for ${client.name} — ${fmt(payment.amount)}`,
      })
      return
    } catch {
      // user cancelled or share failed — fall back to download
    }
  }
  doc.save(filename)
}
