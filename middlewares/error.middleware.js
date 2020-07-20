let errorMiddleware = (error, req, res, next) => {
	// res.status(error.httpStatusCode).render(...);
	// res.redirect('/500');
	res.status(500).render('500', {
		pageTitle: 'Error!',
		path: '/500',
		isAuthenticated: req.session.isLoggedIn,
	});
};

module.exports = errorMiddleware;
