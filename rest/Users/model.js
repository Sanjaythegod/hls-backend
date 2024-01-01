module.exports = (sequelize, type) => {
    const User = sequelize.define('Users', {
        id: {
            type: type.STRING,
            primaryKey: true,
        },
        first_name: type.STRING,
        last_name: type.STRING,
        email: type.STRING,
        pass_hash: type.STRING,
        account_type: type.STRING,
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return User;
};
