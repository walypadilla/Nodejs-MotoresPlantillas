const multer = require('multer');
const express = require('express');

const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'images');
	},
	filename: (req, file, callback) => {
		callback(
			null,
			new Date().toISOString().slice(0, 10) + '-' + file.originalname
		);
	},
});
const fileFilter = (req, file, callback) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		callback(null, true);
	} else {
		callback(null, false);
	}
};

app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

module.exports = app;
