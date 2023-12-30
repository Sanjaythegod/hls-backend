module.exports = (sequelize, type) => {
    const Product = sequelize.define('Products', {
        id: {
            type: type.STRING,
            primaryKey: true,
        },
        name: type.STRING,
        description: type.TEXT,
        price: type.STRING,
        stock_quantity: type.STRING,
        rating: type.STRING,
        featured: type.INTEGER

    }, {

        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    return Product;
};

