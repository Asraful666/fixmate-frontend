"use client";

import { jsPDF } from "jspdf";

import { formatDate } from "./format";

const money = (value) =>
  `$${(Number.isFinite(Number(value)) ? Number(value) : 0).toFixed(2)}`;

// Builds a clean, dependency-light A4 invoice for a paid job.
export const downloadInvoice = ({ booking = {}, payment = {} }) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const paidAt = payment.paidAt || booking.updatedAt || new Date();
  const invoiceNumber = `FM-${String(
    payment._id || payment.stripeSessionId || booking._id || ""
  )
    .slice(-8)
    .toUpperCase()}`;

  // Header band
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 110, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("FixMate", 48, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Trusted device & home appliance repair", 48, 72);
  doc.text("support@fixmate.app  |  +880 1700-000000", 48, 88);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", pageWidth - 48, 52, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoiceNumber, pageWidth - 48, 72, { align: "right" });
  doc.text(formatDate(paidAt), pageWidth - 48, 88, { align: "right" });

  // Billed parties
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text("BILLED TO", 48, 150);
  doc.text("SERVICE PROVIDER", pageWidth / 2 + 20, 150);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(booking.customerName || payment.customerName || "FixMate customer", 48, 170);
  doc.text(
    booking.technicianName || payment.technicianName || "FixMate technician",
    pageWidth / 2 + 20,
    170
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(booking.customerEmail || payment.customerEmail || "", 48, 187);

  if (booking.customerPhone) {
    doc.text(booking.customerPhone, 48, 201);
  }

  if (booking.address) {
    const addressLines = doc.splitTextToSize(booking.address, pageWidth / 2 - 80);
    doc.text(addressLines, 48, 215);
  }

  doc.text(booking.technicianEmail || payment.technicianEmail || "", pageWidth / 2 + 20, 187);

  // Line items
  const tableTop = 270;

  doc.setFillColor(241, 245, 249);
  doc.rect(48, tableTop, pageWidth - 96, 30, "F");

  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DESCRIPTION", 60, tableTop + 19);
  doc.text("AMOUNT", pageWidth - 60, tableTop + 19, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(
    booking.serviceTitle || payment.serviceTitle || "Repair service",
    60,
    tableTop + 60
  );
  doc.text(
    money(payment.amount ?? booking.finalAmount ?? booking.basePrice),
    pageWidth - 60,
    tableTop + 60,
    { align: "right" }
  );

  // Payment meta
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Booking: ${booking._id || payment.bookingId || "—"}`,
    60,
    tableTop + 82
  );
  doc.text(
    `Transaction: ${payment.transactionId || payment.stripeSessionId || "—"}`,
    60,
    tableTop + 96
  );
  doc.text(
    `Status: ${payment.paymentStatus || booking.paymentStatus || "paid"}`,
    60,
    tableTop + 110
  );

  // Total box
  const totalY = tableTop + 150;

  doc.setDrawColor(226, 232, 240);
  doc.line(48, totalY, pageWidth - 48, totalY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Total paid", 60, totalY + 28);
  doc.setFontSize(18);
  doc.setTextColor(4, 120, 87);
  doc.text(
    money(payment.amount ?? booking.finalAmount ?? booking.basePrice),
    pageWidth - 60,
    totalY + 30,
    { align: "right" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for choosing FixMate. This invoice confirms a completed Stripe payment.",
    48,
    totalY + 80
  );

  doc.save(`${invoiceNumber}.pdf`);
};
