require('dotenv').config()
const jwt = require('jsonwebtoken')
const { HTTPError } = require("./rest/httpResp");
const connectToDatabase = require('./db')


module.exports.authorize = () => {
    return ({
        before: (handler, next) => {
            const { headers } = handler.event
            if (!headers || !headers['authorization']) {
                throw new HTTPError(
                    401,
                    `Unauthorized`
                );
            }
            jwt.verify(headers['authorization'], process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    throw new HTTPError(
                        403,
                        `Unauthorized`
                    );
                }
                handler.context.id = user;
                next();
            })
        }
    })
}

module.exports.authorizeAdmin = () => {
    return ({
        before: async (handler, next) => {
            const { headers } = handler.event;
            if (!headers || !headers['authorization']) {
                throw new HTTPError(401, `Unauthorized`);
            }

            try {
                const token = headers['authorization'];
                const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

                const { Users } = await connectToDatabase();

                const authuser = await Users.findOne({
                    where: { id: user.id, account_type: "admin" },
                });

                if (authuser) {
                    handler.context.user = authuser;
                } else {
                    throw new HTTPError(405, `Not an admin`);
                }

                next();
            } catch (error) {
                return error;
            }
        }
    });
};
