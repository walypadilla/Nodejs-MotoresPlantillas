const express = require('express');
const bodyParse = require('body-parser');
const path = require('path');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

const { adminRoutes } = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');
const { render } = require('pug');

app.use(bodyParse.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
	res.status(404).render('404', { pageTitle: 'Page not found' });
});

app.listen(3000);
