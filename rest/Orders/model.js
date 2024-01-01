module.exports = (sequelize, type) => {
    const Order = sequelize.define('Orders', {
        id: {
            type: type.STRING,
            primaryKey: true,
        },
        product_id: type.STRING,
        user_id: type.STRING,
        quantity: type.INTEGER,
        line_1: type.STRING,
        line_2: type.STRING,
        city: type.STRING,
        state: type.STRING,
        country: type.STRING,
        is_fulfilled: type.STRING,


    }, {

        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    return Order;
};

