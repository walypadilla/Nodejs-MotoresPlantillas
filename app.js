const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { NotFoundController } = require('./controllers/index.controller');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin.routes');
const shopRoutes = require('./routes/shop.routes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(NotFoundController.get404);

app.listen(3000);
