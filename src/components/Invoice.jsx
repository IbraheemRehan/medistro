import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/Invoice.css';

const Invoice = ({ order }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById('invoice-to-print');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.displayId || order.id}.pdf`);
    });
  };

  const invoiceNumber = order.invoiceNumber || `INV-${order.id?.substring(0, 8).toUpperCase() || 'NEW'}`;
  // Format dates elegantly
  const invoiceDate = order.createdAt 
    ? (isNaN(Date.parse(order.createdAt)) ? order.createdAt : new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }))
    : new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const dist = order.distributorId || {};
  const pharm = order.pharmacyId || {};

  return (
    <div className="invoice-container">
      <div className="invoice-content" id="invoice-to-print">
        {/* Top Corporate Banner */}
        <div className="invoice-header-corporate">
          <div className="company-logo-block">
            <span className="logo-pill">💊 Medistro</span>
            <div className="logo-slogan">Secure Healthcare Logistics & Supply</div>
          </div>
          <div className="invoice-title-block">
            <h1 className="title-text">TAX INVOICE</h1>
            <div className="status-stamp stamp-paid">ORIGINAL RECEIPT</div>
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
            <span className="meta-value">{order.displayId || `ORD-${order.id?.substring(0,8).toUpperCase()}`}</span>
          </div>
          <div className="meta-box">
            <span className="meta-label">Payment Terms</span>
            <span className="meta-value">Direct Delivery</span>
          </div>
        </div>

        {/* B2B Parties Grid */}
        <div className="invoice-b2b-parties">
          {/* Supplier Info */}
          <div className="party-card supplier-card">
            <div className="card-heading-pill">SUPPLIER (DISTRIBUTOR)</div>
            <div className="card-body">
              <h3 className="company-title">{dist.companyName || 'Medistro Partner Hub'}</h3>
              
              <div className="detail-row">
                <span className="row-label">Drug License:</span>
                <span className="row-value">{dist.licenseNumber || 'LIC-DL-88291'}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">NTN / TAX ID:</span>
                <span className="row-value">{dist.NTN || 'NTN-9023812-7'}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Contact:</span>
                <span className="row-value">{dist.contactNumber || '+92 300 0000000'}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Address:</span>
                <span className="row-value address-value">{dist.address || 'Central Pharmacy Logistics Depot, Pakistan'}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="party-card customer-card">
            <div className="card-heading-pill">BILLED TO (PHARMACY)</div>
            <div className="card-body">
              <h3 className="company-title">{pharm.pharmacyName || 'Registered Medistro Client'}</h3>
              
              <div className="detail-row">
                <span className="row-label">Proprietor:</span>
                <span className="row-value">{pharm.ownerName || 'Licensed Pharmacy Proprietor'}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Drug License:</span>
                <span className="row-value">{pharm.licenseNumber || 'DL-PH-33491'}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Contact:</span>
                <span className="row-value">{pharm.contactNumber || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="row-label">Ship Address:</span>
                <span className="row-value address-value">{pharm.address || 'Registered Pharmacy Hub, Pakistan'}</span>
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
                <th className="col-rate text-right">Unit Price</th>
                <th className="col-total text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const batchCode = item.batchId 
                    ? `BCH-${item.batchId.toString().substring(16, 24).toUpperCase()}` 
                    : `BCH-${order.id?.substring(0,6).toUpperCase() || 'TEMP'}`;
                  
                  return (
                    <tr key={idx}>
                      <td className="col-index">{idx + 1}</td>
                      <td className="col-desc">
                        <span className="ledger-item-name">{item.medicineName || item.medicineId?.name}</span>
                        {item.medicineId?.genericName && (
                          <span className="ledger-item-sub">({item.medicineId.genericName})</span>
                        )}
                      </td>
                      <td className="col-batch">
                        <span className="batch-badge">{batchCode}</span>
                      </td>
                      <td className="col-qty text-center bold">{item.quantity}</td>
                      <td className="col-rate text-right">Rs. {parseFloat(item.salePrice || 0).toLocaleString()}</td>
                      <td className="col-total text-right bold text-highlight">Rs. {parseFloat(item.subtotal || 0).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '24px 0' }}>No items listed on this invoice</td>
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
              <li>This is an electronically generated Tax Invoice and does not require physical seals.</li>
              <li>Stock and expiry dates have been verified under standard distributor quality assurance protocols.</li>
              <li>Warranty: All medicines are guaranteed authentic and stored in controlled temperature hubs.</li>
            </ul>
          </div>

          <div className="calculation-ledger">
            <div className="calc-row">
              <span className="calc-label">Subtotal Gross:</span>
              <span className="calc-value">Rs. {parseFloat(order.totalAmount || 0).toLocaleString()}</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">Discounts / Allowances:</span>
              <span className="calc-value">Rs. 0</span>
            </div>
            <div className="calc-row">
              <span className="calc-label">GST / Sales Tax (0%):</span>
              <span className="calc-value">Rs. 0</span>
            </div>
            <div className="calc-row-total">
              <span className="calc-label-total">Total Net Payable:</span>
              <span className="calc-value-total">Rs. {parseFloat(order.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* B2B Signoff Stamps Area */}
        <div className="invoice-signoff-stamps">
          <div className="sign-block block-receiver">
            <div className="sign-line" />
            <span className="sign-title">Received By (Pharmacy Stamp & Signature)</span>
            <span className="sign-date">Date: ____/____/________</span>
          </div>
          <div className="sign-block block-issuer">
            <div className="stamp-box">MEDISTRO LOGISTICS HUB</div>
            <div className="sign-line" />
            <span className="sign-title">Authorized Signature (Medistro Logistics)</span>
            <span className="sign-date">System Verified</span>
          </div>
        </div>

        {/* Small Bottom Legals */}
        <div className="invoice-bottom-credits">
          <p>Thank you for your valuable business partnership with Medistro Pharmacy Distribution Network.</p>
          <p>Secure Care | Seamless Supply | MedDistro Technologies Ltd.</p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="invoice-actions">
        <button className="btn btn-primary btn-lg" onClick={handlePrint}>
          🖨️ Print Invoice
        </button>
        <button className="btn btn-secondary btn-lg" onClick={handleDownloadPDF}>
          💾 Download PDF Copy
        </button>
      </div>
    </div>
  );
};

export default Invoice;