const path = require('path');

const express = require('express');
const bodyParse = require('body-parser');
const expressHbs = require('hbs');

const app = express();

//Expres HBS
expressHbs.registerPartials(__dirname + '/views/layouts');
app.set('view engine', 'hbs');

const { adminRoutes } = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.use(bodyParse.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
	res.status(404).render('404', { pageTitle: 'Page Not Found' });
});

app.listen(3000);
