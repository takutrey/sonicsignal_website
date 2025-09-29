const path = require("path");
const fs = require("fs");

const generateInvoiceData = (orderData) => {
  try {
    // Validate required orderData
    if (!orderData) {
      throw new Error("Order data is required");
    }

    if (!orderData.orderDate || !orderData.customer || !orderData.items) {
      throw new Error("Missing required order data fields");
    }

    const orderDate = new Date(orderData.orderDate);
    const dueDate = new Date(orderDate);
    dueDate.setDate(orderDate.getDate() + 7);

    // Ensure customer data is complete
    const customerName =
      orderData.customer.fullName ||
      `${orderData.customer.firstName || ""} ${
        orderData.customer.lastName || ""
      }`.trim();

    if (!customerName) {
      throw new Error("Customer name is required");
    }

    // Create invoices directory
    const invoicesDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const customInvoicePath = path.join(
      invoicesDir,
      `invoice-${orderData.customer.fullName}-${orderData.orderNumber}.pdf`
    );

    return {
      company: {
        name: "Sonicsignal Technologies",
        address: "60 Livingstone Avenue, Harare",
        phone: "078472992",
        website: "Web: https://sonicsignals.co.zw",
      },
      customer: {
        name: customerName,
        address: orderData.customer.email || orderData.customer.address || "",
        phone: orderData.customer.phone
          ? `Tel: ${orderData.customer.phone}`
          : "",
        email: orderData.customer.email
          ? `Mail: ${orderData.customer.email}`
          : "",
      },
      invoice: {
        number: orderData.orderNumber || `INV-${Date.now()}`,
        date: orderData.orderDate,
        dueDate: dueDate.toISOString().split("T")[0],
        status: "PAID",
        path: customInvoicePath,
      },
      items: (orderData.items || []).map((item) => ({
        name: item.name || "Unknown Item",
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0,
        tax: 8,
      })),
      qr: {
        data: "https://sonicsignals.co.zw",
        width: 100,
      },
      note: {
        text: "Thank you for purchasing at Sonicsignal Technologies. Please settle your invoice within the next 7 days. Thank You!!",
        italic: true,
      },
    };
  } catch (error) {
    console.error("Error generating invoice data:", error.message);
    throw error;
  }
};

module.exports = generateInvoiceData;
