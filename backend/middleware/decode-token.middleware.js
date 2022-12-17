const jwt = require('jsonwebtoken');
class Middleware {
	async decodeToken(req, res, next) {
		const authHeader = req.headers.authorization;
		try {
            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7, authHeader.length);
                const decodeValue = await jwt.decode(token);
                if (decodeValue) {
                    req.user = decodeValue['id'];
                    return next();
                }
            }
			return res.json({ message: 'Un authorize' });
		} catch (e) {
			return res.json({ message: 'Internal Error' });
		}
	}
}

module.exports = new Middleware();