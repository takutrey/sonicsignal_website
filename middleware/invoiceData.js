const easyInvoice = require('easyinvoice'); 

   
const generateInvoiceData = (orderData) => {
    const orderDate = new Date(orderData.orderDate);
    const dueDate = new Date(orderDate);
    dueDate.setDate(orderDate.getDate() + 7);

    return {
        api: "free",
        mode: "development",
        images: {
            // The logo on top of your invoice
            logo: "https://sonicsignals.co.zw/wp-content/uploads/2023/05/sonicsignal-logo-1.png"
            
        },
        sender: {
            company: "Sonicsignal Technologies",
            address: "60 Livingstone Avenue",
            city: "Harare",
            country: "Zimbabwe",
        }, 
        client: {
            company: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
            address: orderData.customer.address,
            city: orderData.customer.city,
            country: orderData.customer.country
        },
        information: {
            number: orderData.orderNumber,
            date: orderData.orderDate,
            dueDate: dueDate,
        },
        products: orderData.items.map(item => ({
            quantity: item.quantity, 
            description: item.name,
            price: item.price,
            taxRate: 8
        })),
        bottomNotice: "Thank you for purchasing at Sonicsignal Technologies. Please settle your invoice within the next 7 days. Thank You!!",
        settings: {
            currency: "USD", 
            format: "A4",
            orientation: "portrait",
            tax: {
                method: 'percentage',
                value: 8
            }
        }
    
    } 

}



module.exports = generateInvoiceData;