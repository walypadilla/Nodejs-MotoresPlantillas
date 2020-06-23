const fs = require('fs');
const path = require('path');
const CartModel = require('./cart.model');

const p = path.join(
	path.dirname(process.mainModule.filename),
	'data',
	'products.json'
);

const getProductsFromFile = (cb) => {
	fs.readFile(p, (err, fileContent) => {
		if (err) {
			cb([]);
		} else {
			cb(JSON.parse(fileContent));
		}
	});
};

module.exports = class ProductModel {
	constructor(id, title, imageUrl, description, price) {
		this.id = id;
		this.title = title;
		this.imageUrl = imageUrl;
		this.description = description;
		this.price = price;
	}

	save() {
		getProductsFromFile((products) => {
			if (this.id) {
				const exitingProductIndex = products.findIndex(
					(prod) => prod.id === this.id
				);
				const updateProducts = [...products];
				updateProducts[exitingProductIndex] = this;
				fs.writeFile(p, JSON.stringify(updateProducts), (err) => {
					if (err) throw new Error(err);
				});
			} else {
				this.id = Math.random().toString();
				getProductsFromFile((products) => {
					products.push(this);
					fs.writeFile(p, JSON.stringify(products), (err) => {
						if (err) throw new Error(err);
					});
				});
			}
		});
	}

	static deleteById(id) {
		getProductsFromFile((products) => {
			const product = products.find((prod) => prod.id === id);
			const updateProducts = products.filter((prod) => prod.id !== id);
			fs.writeFile(p, JSON.stringify(updateProducts), (err) => {
				if (!err) {
					CartModel.deleteProduct(id, product.price);
				}
			});
		});
	}

	static fetchAll(cb) {
		getProductsFromFile(cb);
	}

	static findById(id, cb) {
		getProductsFromFile((products) => {
			const product = products.find((prod) => prod.id === id);
			cb(product);
		});
	}
};
