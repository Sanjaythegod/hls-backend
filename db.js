const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//models
const UsersModel = require('./rest/Users/model')
const ProductsModel = require('./rest/Products/model')
const OrdersModel = require('./rest/Orders/model')


const sequelize = new Sequelize(
    'hls_products',
    'sanjay',
    'Smarathe!00',
    {
        dialect: 'mysql',
        host: 'hls-products.cpxfz0aupufi.us-east-1.rds.amazonaws.com',
        port: '3306',
        define: {
            timestamps: false,
        },
        dialectOptions: { decimalNumbers: true },
        logging: console.log,
    }
);

const Users = UsersModel(sequelize, Sequelize);
const Products = ProductsModel(sequelize, Sequelize);
const Orders = OrdersModel(sequelize, Sequelize);


const Models = {
    Op,
    Users,
    Products,
    Orders,
    sequelize
};

const connection = {};



//handler for sequelize
module.exports = async () => {
    if (connection.isConnected) {
        console.log('\x1b[32m%s\x1b[0m', '=> Using existing connection.');
        return Models;
    }
    await sequelize.sync();
    await sequelize.authenticate();
    connection.isConnected = true;
    console.log('\x1b[34m%s\x1b[0m', '=> Created a new connection.');
    return Models;
};

