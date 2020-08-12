const fs = require('fs');
const path = require('path');

exports.accessLogStream = fs.createWriteStream(
	path.join(__dirname, '../' + 'access.log'),
	{ flags: 'a' }
);
