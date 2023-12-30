const connectToDatabase = require("../../db");
const uuid = require("uuid");
const { HTTPError } = require("../httpResp");
const { QueryTypes } = require('sequelize');
const jwt = require('jsonwebtoken')
const { authorize } = require('../../validator')
const middy = require('middy')
require('dotenv').config()

module.exports.createUser = async (event) => {
    try {
        const input = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { Users } = await connectToDatabase();
        const dataObject = Object.assign(
            input,
            { id: uuid.v4() },
        );

        const userObject = await Users.findOne({
            where: {
                email: dataObject.email,
            },
        });
        if (userObject)
            throw new HTTPError(
                400,
                `User with email id: ${dataObject.email} already exist`
            );
        const userModel = await Users.create(dataObject);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(userModel),
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
}

module.exports.login = async (event) => {
    try {
        const input = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const { Users } = await connectToDatabase();

        const user = await Users.findAll({
            where: {
                email: input.email,
            }
        });
        const id = { id: user[0].id }
        const passwordMatch = input.pass_hash === user[0].pass_hash
        const accessToken = jwt.sign(id, process.env.ACCESS_TOKEN_SECRET)
        if (user.length > 0 && passwordMatch) {
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify({ accessToken: accessToken }),
            };

        } else {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
                body: JSON.stringify(user, {
                    error: "User not found.",
                    paswordhash: input.password_hash,
                    username: input.login_id,
                    input: input,
                }),
            };
        }
    } catch (err) {
        return {
            statusCode: err.statusCode || 500,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify({
                error: err.message || "Could not find the user.",
            }),
        };
    }
};

module.exports.getAllUsers = middy(async (event) => {
    try {
        const { Users } = await connectToDatabase();
        const userObj = await Users.findAll();
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(userObj),
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
                error: err.message || "Could not fetch the users.",
            }),
        };
    }
}).use(authorize())