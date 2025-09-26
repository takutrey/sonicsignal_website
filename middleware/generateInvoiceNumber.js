// Backend function to generate next invoice number
const generateNextInvoiceNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Get the last order for this year & month
  const lastOrder = await Orders.findOne({
    where: Sequelize.where(
      Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
      `${year}-${month}`
    ),
    order: [["createdAt", "DESC"]], // get most recent
  });

  let lastSequence = 0;

  if (lastOrder && lastOrder.orderNumber) {
    // Example: orderNumber = "INV-202509002"
    const match = lastOrder.orderNumber.match(/INV-\d{6}(\d+)/);
    if (match) {
      lastSequence = parseInt(match[1], 10); // extract last sequence number
    }
  }

  const nextSequence = lastSequence + 1;
  const invoiceNumber = `INV-${year}${month}${String(nextSequence).padStart(
    3,
    "0"
  )}`;

  return invoiceNumber;
};

module.exports = { generateNextInvoiceNumber };
