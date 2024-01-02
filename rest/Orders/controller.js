require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const middy = require('middy')
const { authorize, authorizeAdmin } = require('../../validator')
const connectToDatabase = require("../../db");
const uuid = require("uuid");
const { HTTPError } = require("../httpResp");



module.exports.checkout = middy(async (event) => {
    const input = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { Products } = await connectToDatabase();
    const productObj = await Products.findAll();

    // Create a new Map based on the data from the database
    const storeItems = new Map(productObj.map(product => [product.id, { priceInCents: product.price * 100, name: product.name }]));



    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: 'http://localhost:3001/success',
            cancel_url: 'http://localhost:3001/cancel',
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

module.exports.createOrder = middy(async (event, context) => {
    try {
        const input = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { Orders, Users, Products } = await connectToDatabase();

        const user = await Users.findOne({
            where: { id: context.id.id },
        });

        const product = await Products.findOne({
            where: { id: input.product_id },
        });

        const dataObject = Object.assign(
            input,
            {
                id: uuid.v4(),
                user_id: context.id.id,
                user_name: `${user.first_name + " "+ user.last_name}`,
                user_email: user.email,
                product_name: product.name,
                product_price: product.price
            },
        );

        const orderModel = await Orders.create(dataObject);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(orderModel),
        }
    } catch (error) {
        return {
            statusCode: error.statusCode || 500,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: error.message || "Could not create the user.",
            }),
        };
    }
}).use(authorize())

module.exports.getAllOrders = middy(async (event, context) => {
    const { Orders } = await connectToDatabase()
    const orderObj = await Orders.findAll();

    try {
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(orderObj),
        }
    } catch (error) {
        return {
            statusCode: error.statusCode || 500,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: error.message || "Could not execute the function",
            }),
        };
    }
}).use(authorizeAdmin())
