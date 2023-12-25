module.exports = (sequelize, type) => {
    const User = sequelize.define('Users', {
        id: {
            type: type.STRING,
            primaryKey: true,
        },
        pass_hash: type.STRING,
        first_name: type.STRING,
        last_name: type.STRING,
        email: type.STRING,


    }, {
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    return User;
};

