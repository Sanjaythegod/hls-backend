require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const middy = require('middy')
const { authorize } = require('../../validator')
const connectToDatabase = require("../../db");

const tempItems = new Map([
    [1, { priceInCents: 50, name: 'Red' }],
    [2, { priceInCents: 100, name: 'Blue' }]

])

module.exports.checkout = middy(async (event) => {
    const input = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { Products } = await connectToDatabase();
    const productObj = await Products.findAll();

    // Create a new Map based on the data from the database
    const storeItems = new Map(productObj.map(product => [product.id, { priceInCents: product.price*100, name: product.name }]));



    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: 'http://localhost:3001/success',
            cancel_url: 'https://espn.com',
            line_items: input.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: storeItem.name,
                        },
                        unit_amount_decimal: storeItem.priceInCents, // Corrected parameter name
                    },
                    quantity: item.quantity,
                };
            }),


        })

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({ url: session.url }),
        };
    } catch (err) {
        return {
            statusCode: err.statusCode || 500,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: err.message || "Could not Checkout.",
            }),
        };
    }
}).use(authorize())
