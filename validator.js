require('dotenv').config()
const jwt = require('jsonwebtoken')
const { HTTPError } = require("./rest/httpResp");


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
            jwt.verify(headers['authorization'],process.env.ACCESS_TOKEN_SECRET,(err, user) => {
                if(err){
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