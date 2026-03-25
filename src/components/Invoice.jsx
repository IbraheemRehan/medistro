import React from 'react';
import '../styles/Invoice.css';

const Invoice = ({ order }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${Date.now()}`;
  const invoiceDate = new Date().toLocaleDateString();

  return (
    <div className="invoice-container">
      <div className="invoice-content">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-info">
            <h1>💊 MedDistro</h1>
            <p>Pharmacy Distribution Management System</p>
          </div>
          <div className="invoice-title">
            <h2>INVOICE</h2>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="invoice-details-row">
          <div className="invoice-detail">
            <p className="label">Invoice Number:</p>
            <p className="value">{invoiceNumber}</p>
          </div>
          <div className="invoice-detail">
            <p className="label">Invoice Date:</p>
            <p className="value">{invoiceDate}</p>
          </div>
          <div className="invoice-detail">
            <p className="label">Order ID:</p>
            <p className="value">{order.id}</p>
          </div>
        </div>

        {/* Bill To / From */}
        <div className="invoice-parties">
          <div className="party bill-from">
            <h3>From</h3>
            <p className="company-name">{order.distributorName || 'Prime Distributor'}</p>
            <p>License: LIC-2021-001</p>
            <p>Address: 100 Industrial Area, Okara</p>
            <p>Phone: 03001111111</p>
          </div>
          <div className="party bill-to">
            <h3>Bill To</h3>
            <p className="company-name">Pharmacy Name</p>
            <p>License: LIC-PHARM-001</p>
            <p>Address: Okara, Punjab</p>
            <p>Phone: 0300XXXXXXX</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-items">
          <table className="items-table">
            <thead>
              <tr>
                <th className="item-col">Item Description</th>
                <th className="qty-col">Qty</th>
                <th className="price-col">Unit Price</th>
                <th className="total-col">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="item-col">
                    <p className="item-name">{item.medicineName}</p>
                    <p className="item-batch">Batch: {item.batchId}</p>
                  </td>
                  <td className="qty-col text-center">{item.quantity}</td>
                  <td className="price-col text-right">Rs. {item.salePrice}</td>
                  <td className="total-col text-right">Rs. {item.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="invoice-summary">
          <div className="summary-item">
            <span>Subtotal</span>
            <span>Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span>Tax (0%)</span>
            <span>Rs. 0</span>
          </div>
          <div className="summary-item">
            <span>Discount</span>
            <span>Rs. 0</span>
          </div>
          <div className="summary-total">
            <span>Total Amount Due</span>
            <span>Rs. {order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="invoice-terms">
          <h4>Payment Terms</h4>
          <ul>
            <li>Payment due within 30 days of invoice</li>
            <li>Please reference invoice number with payment</li>
            <li>Thank you for your business!</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>This is an electronically generated invoice. Valid without signature.</p>
          <p>MedDistro &copy; 2024 | www.medistro.com</p>
        </div>
      </div>

      {/* Print Button */}
      <div className="invoice-actions">
        <button className="btn-print" onClick={handlePrint}>
          🖨️ Print Invoice
        </button>
        <button className="btn-download">
          💾 Download PDF
        </button>
      </div>
    </div>
  );
};

export default Invoice;