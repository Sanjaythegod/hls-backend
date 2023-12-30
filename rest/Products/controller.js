const connectToDatabase = require("../../db");
const uuid = require("uuid");
const { HTTPError } = require("../httpResp");
const { authorize } = require('../../validator')
const middy = require('middy')


module.exports.getAllProducts = async (event) => {
    try {
        const { Products } = await connectToDatabase();
        const productObj = await Products.findAll();
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(productObj),
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
                error: err.message || "Could not fetch the products.",
            }),
        };
    }
}

module.exports.getOneProduct = async (event) => {
    try {
        const params = event.params || event.pathParameters;
        const { Products } = await connectToDatabase();
        const product = await Products.findOne({
            where: { id: params.id },
        });
        if (!product)
            throw new HTTPError(404, `Product with id: ${params.id} was not found`);
        const productObj = await product.get({ plain: true });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(productObj),
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
                error: err.message || "Could not fetch the Products.",
            }),
        };
    }
}