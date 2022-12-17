var { expressjwt: jwt } = require("express-jwt");
const users = require("../model/users.model")
const refresh_token = require("../model/refresh_token.model")

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        jwt({ secret: 'asdfg][poi', algorithms: ['HS256'] }),

        async (req, res, next) => {
            const user = await users.findById(req.user);

            if (!user || (roles.length && !roles.includes(user.role))) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            req.user.role = user.role;
            const refreshTokens = await refresh_token.find({ user: user.id });
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}