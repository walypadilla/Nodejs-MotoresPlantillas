// ============================================
//  Session csrfToken
// ============================================
let csrfTokenMiddleware = (req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
};

module.exports = csrfTokenMiddleware;
