const connectToDatabase = require("./db");
const sequelize = require('sequelize');
const { QueryTypes } = require("sequelize");

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.healthCheck = async () => {
  try {
    await connectToDatabase();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connection successful." }),
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
        error: err.message || "Connection is not successful.",
      }),
    };
  }
};
