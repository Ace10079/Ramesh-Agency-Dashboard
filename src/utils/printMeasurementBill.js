import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const printMeasurementBill = ({
  shop,
  order,
  measurements
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  let y = 10;

  /* ================= SHOP HEADER ================= */
  doc.setFontSize(16);
  doc.text(shop.name, 105, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.text(shop.address, 105, y, { align: "center" });
  y += 5;
  doc.text(`Phone: ${shop.phone}`, 105, y, { align: "center" });
  y += 10;

  /* ================= CUSTOMER ================= */
  doc.setFontSize(12);
  doc.text("Customer Details", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Name: ${order.customerId?.name}`, 14, y); y += 5;
  doc.text(`Mobile: ${order.customerId?.mobile}`, 14, y); y += 5;
  doc.text(`Address: ${order.customerId?.address}`, 14, y);
  y += 8;

  /* ================= ORDER INFO ================= */
  doc.text(`Order ID: ${order._id?.slice(-8).toUpperCase()}`, 14, y); y += 5;
  doc.text(
    `Order Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
    14,
    y
  );
  y += 8;

  /* ================= FLAT MEASUREMENT LIST ================= */
  const allMeasurements = Object.values(measurements).flat();

  let grandTotal = 0;

  const rows = allMeasurements.map((m, index) => {
    let qty = 1;

    if (m.totalMeters > 0) qty = m.totalMeters;
    else if (m.squareFeet > 0) qty = m.squareFeet;

    const unitPrice = m.productId?.price || 0;
    const totalPrice = unitPrice * qty;
    grandTotal += totalPrice;

    return [
      index + 1,
      m.productId?.name || m.subCategory,
      m.category,
      qty.toFixed(2),
      unitPrice.toFixed(2),
      totalPrice.toFixed(2)
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [[
      "#",
      "Product",
      "Category",
      "Qty",
      "Rate (₹)",
      "Amount (₹)"
    ]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 40] }
  });

  y = doc.lastAutoTable.finalY + 10;

  /* ================= GRAND TOTAL ================= */
  doc.setFontSize(12);
  doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, y);

  y += 10;

  /* ================= FOOTER ================= */
  doc.setFontSize(9);
  doc.text("Thank you for your business", 105, y, { align: "center" });
  y += 4;
  doc.text("Goods once sold will not be taken back", 105, y, { align: "center" });

  doc.save(`Bill_${order._id?.slice(-6)}.pdf`);
};
