const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');

const { NotFoundController } = require('./controllers/index.controller');

const app = express();
//Expres HBS
hbs.registerPartials(__dirname + '/views/layouts');
app.set('view engine', 'hbs');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(NotFoundController.get404);

app.listen(3000);
