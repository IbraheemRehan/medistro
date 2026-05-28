import React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/Invoice.css";
import { calcTotalSavings } from "../utils/pricing";

const Invoice = ({ order }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("invoice-to-print");
    const container = input.parentElement;

    // Save original styles
    const originalWidth = input.style.width;
    const originalMaxWidth = input.style.maxWidth;
    const originalBoxShadow = input.style.boxShadow;
    const originalBorderRadius = input.style.borderRadius;
    const originalPadding = input.style.padding;
    const originalOverflow = input.style.overflow;
    const originalContainerMaxWidth = container ? container.style.maxWidth : "";

    // Save current scroll position and scroll to top to avoid html2canvas clipping
    const scrollPos = window.scrollY;
    window.scrollTo(0, 0);

    // Temporarily force wider, un-clipped styles for A3 rendering
    input.style.width = "1200px";
    input.style.maxWidth = "1200px";
    input.style.boxShadow = "none";
    input.style.borderRadius = "0px";
    input.style.overflow = "visible";
    if (container) {
      container.style.maxWidth = "1200px";
    }

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollY: 0,
      scrollX: 0,
    })
      .then((canvas) => {
        // Restore original styles and scroll position immediately
        input.style.width = originalWidth;
        input.style.maxWidth = originalMaxWidth;
        input.style.boxShadow = originalBoxShadow;
        input.style.borderRadius = originalBorderRadius;
        input.style.padding = originalPadding;
        input.style.overflow = originalOverflow;
        if (container) {
          container.style.maxWidth = originalContainerMaxWidth;
        }
        window.scrollTo(0, scrollPos);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a3"); // Set to A3 size (portrait, 297mm x 420mm)
        const imgProps = pdf.getImageProperties(imgData);

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 297mm
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        const pageHeight = pdf.internal.pageSize.getHeight(); // 420mm

        let heightLeft = pdfHeight;
        let position = 0;

        // Page 1
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        // Add pages if the content overflows a single A3 page
        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Invoice_${order.displayId || order.id}.pdf`);
      })
      .catch((err) => {
        console.error("Error generating PDF:", err);
        // Restore styles and scroll position in case of error
        input.style.width = originalWidth;
        input.style.maxWidth = originalMaxWidth;
        input.style.boxShadow = originalBoxShadow;
        input.style.borderRadius = originalBorderRadius;
        input.style.padding = originalPadding;
        input.style.overflow = originalOverflow;
        if (container) {
          container.style.maxWidth = originalContainerMaxWidth;
        }
        window.scrollTo(0, scrollPos);
      });
  };

  const invoiceNumber =
    order.invoiceNumber ||
    `INV-${order.id?.substring(0, 8).toUpperCase() || "NEW"}`;
  // Format dates elegantly
  const invoiceDate = order.createdAt
    ? isNaN(Date.parse(order.createdAt))
      ? order.createdAt
      : new Date(order.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
    : new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const dist = order.distributorId || {};
  const pharm = order.pharmacyId || {};
  const items = order.items || [];
  const totalSavings = calcTotalSavings(items);

  // Payment status comes from invoice workflow only.
  const paymentStatus = order.paymentStatus || "pending_payment";
  const isPaid = paymentStatus === "paid" || paymentStatus === "payment_verified";
  const paymentStatusLabel = {
    paid: "Paid",
    unpaid: "Unpaid",
    pending_payment: "Pending Payment",
    payment_verified: "Payment Verified",
  }[paymentStatus] || paymentStatus;
  const subtotalGross = items.reduce(
    (sum, item) =>
      sum + (Number(item.originalPrice ?? item.salePrice) || 0) * (item.quantity || 0),
    0
  );

  return (
    <div className="invoice-container">
      <div className="invoice-content" id="invoice-to-print">
        {/* Top Corporate Banner */}
        <div className="invoice-header-corporate">
          <div className="company-logo-block">
            <div
              className="logo-pill"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="8" fill="#1565C0" />
                <path
                  d="M16 8v16m-8-8h16"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <span>Medistro</span>
            </div>
            <div className="logo-slogan">
              Secure Healthcare Logistics & Supply
            </div>
          </div>
          <div className="invoice-title-block">
            <h1 className="title-text">TAX INVOICE</h1>
          <div className={`status-stamp ${isPaid ? 'stamp-paid' : 'stamp-pending'}`}>
            {isPaid ? 'PAID RECEIPT' : 'PENDING RECEIPT'}
          </div>
          </div>
        </div>

        {/* Invoice Metadata Dashboard */}
        <div className="invoice-metadata-grid">
          <div className="meta-box">
            <span className="meta-label">Invoice Number</span>
            <span className="meta-value value-highlight">{invoiceNumber}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Billing Date</span>
            <span className="meta-value">{invoiceDate}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Order Reference</span>
            <span className="meta-value">
              {order.displayId ||
                `ORD-${order.id?.substring(0, 8).toUpperCase()}`}
            </span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Payment Status</span>
            <span className="meta-value">{paymentStatusLabel}</span>
          </div>
        </div>

        {/* B2B Parties Grid */}
        <div className="invoice-b2b-parties">
          {/* Supplier Info */}
          <div className="party-card supplier-card">
            <div className="card-heading-pill">SUPPLIER (DISTRIBUTOR)</div>
            <div className="card-body">
              <h3 className="company-title">
                {dist.companyName || "Medistro Partner Hub"}
              </h3>

              <div className="detail-row">
                <span className="row-label">Drug License:</span>
                <span className="row-value">
                  {dist.licenseNumber || "LIC-DL-88291"}
                </span>
              </div>
              <div className="detail-row">
                <span className="row-label">NTN / TAX ID:</span>
                <span className="row-value">{dist.NTN || "NTN-9023812-7"}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Contact:</span>
                <span className="row-value">
                  {dist.contactNumber || "+92 300 0000000"}
                </span>
              </div>
              <div className="detail-row">
                <span className="row-label">Alternate:</span>
                <span className="row-value">{dist.alternateNumber || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Email:</span>
                <span className="row-value">{dist.businessEmail || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Address:</span>
                <span className="row-value address-value">
                  {dist.address || "Central Pharmacy Logistics Depot, Pakistan"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="party-card customer-card">
            <div className="card-heading-pill">BILLED TO (PHARMACY)</div>
            <div className="card-body">
              <h3 className="company-title">
                {pharm.pharmacyName || "Registered Medistro Client"}
              </h3>

              <div className="detail-row">
                <span className="row-label">Proprietor:</span>
                <span className="row-value">
                  {pharm.ownerName || "Licensed Pharmacy Proprietor"}
                </span>
              </div>
              <div className="detail-row">
                <span className="row-label">Drug License:</span>
                <span className="row-value">
                  {pharm.licenseNumber || "DL-PH-33491"}
                </span>
              </div>
              <div className="detail-row">
                <span className="row-label">Contact:</span>
                <span className="row-value">
                  {pharm.contactNumber || "N/A"}
                </span>
              </div>
              <div className="detail-row">
                <span className="row-label">Alternate:</span>
                <span className="row-value">{pharm.alternateNumber || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Email:</span>
                <span className="row-value">{pharm.businessEmail || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Ship Address:</span>
                <span className="row-value address-value">
                  {pharm.address || "Registered Pharmacy Hub, Pakistan"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Medicines Ledger Grid */}
        <div className="invoice-ledger-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th className="col-index">S.No</th>
                <th className="col-desc">Medicine Description</th>
                <th className="col-batch">Batch ID</th>
                <th className="col-qty text-center">Qty</th>
                <th className="col-rate text-right">Original</th>
                <th className="col-rate text-right">Discount</th>
                <th className="col-rate text-right">Unit Price</th>
                <th className="col-total text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const batchCode = item.batchId
                    ? `BCH-${item.batchId.toString().substring(16, 24).toUpperCase()}`
                    : `BCH-${order.id?.substring(0, 6).toUpperCase() || "TEMP"}`;
                  const original = Number(item.originalPrice ?? item.salePrice) || 0;
                  const final = Number(item.salePrice) || 0;
                  const pct = Number(item.discountPercent) || 0;

                  return (
                    <tr key={idx}>
                      <td className="col-index">{idx + 1}</td>
                      <td className="col-desc">
                        <span className="ledger-item-name">
                          {item.medicineName || item.medicineId?.name || "Medicine"}
                        </span>
                        {item.medicineId?.genericName && (
                          <span className="ledger-item-sub">
                            ({item.medicineId.genericName})
                          </span>
                        )}
                      </td>
                      <td className="col-batch">
                        <span className="batch-badge">{batchCode}</span>
                      </td>
                      <td className="col-qty text-center bold">
                        {item.quantity}
                      </td>
                      <td className="col-rate text-right">
                        Rs. {original.toLocaleString()}
                      </td>
                      <td className="col-rate text-right">
                        {pct > 0 ? `${pct}%` : "—"}
                      </td>
                      <td className="col-rate text-right">
                        Rs. {final.toLocaleString()}
                      </td>
                      <td className="col-total text-right bold text-highlight">
                        Rs. {parseFloat(item.subtotal || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center"
                    style={{ padding: "24px 0" }}
                  >
                    No items listed on this invoice
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Cost Breakdown Panel */}
        <div className="invoice-breakdown-panel">
          <div className="payment-notes">
            <h4>Commercial Terms & Declarations</h4>
            <ul>
              <li>
                This is an electronically generated Tax Invoice and does not
                require physical seals.
              </li>
              <li>
                Stock and expiry dates have been verified under standard
                distributor quality assurance protocols.
              </li>
              <li>
                Warranty: All medicines are guaranteed authentic and stored in
                controlled temperature hubs.
              </li>
            </ul>
          </div>

          <div className="calculation-ledger">
            <div className="calc-row">
              <span className="calc-label">Original Price</span>
              <span className="calc-value">
                Rs. {subtotalGross.toLocaleString()}
              </span>
            </div>
            <div className="calc-row">
              <span className="calc-label">Discount</span>
              <span className="calc-value" style={{ color: "#166534" }}>
                − Rs. {totalSavings.toLocaleString()}
              </span>
            </div>
            <div className="calc-row">
              <span className="calc-label">Total Savings</span>
              <span className="calc-value" style={{ color: "#166534" }}>
                Rs. {totalSavings.toLocaleString()}
              </span>
            </div>
            <div className="calc-row-total">
              <span className="calc-label-total">Final Price</span>
              <span className="calc-value-total">
                Rs. {parseFloat(order.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* B2B Signoff Stamps Area */}
        <div className="invoice-signoff-stamps">
          <div className="sign-block block-receiver">
            <div className="sign-line" />
            <span className="sign-title">
              Received By (Pharmacy Stamp & Signature)
            </span>
            <span className="sign-date">Date: ____/____/________</span>
          </div>
          <div className="sign-block block-issuer">
            <div className="stamp-box">MEDISTRO LOGISTICS HUB</div>
            <div className="sign-line" />
            <span className="sign-title">
              Authorized Signature (Medistro Logistics)
            </span>
            <span className="sign-date">System Verified</span>
          </div>
        </div>

        {/* Small Bottom Legals */}
        <div className="invoice-bottom-credits">
          <p>
            Thank you for your valuable business partnership with Medistro
            Pharmacy Distribution Network.
          </p>
          <p>Secure Care | Seamless Supply | MedDistro Technologies Ltd.</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="invoice-actions">
        <button className="btn btn-primary btn-lg" onClick={handlePrint}>
          🖨️ Print Invoice
        </button>
        <button
          className="btn btn-secondary btn-lg"
          onClick={handleDownloadPDF}
        >
          💾 Download PDF Copy
        </button>
      </div>
    </div>
  );
};

export default Invoice;
