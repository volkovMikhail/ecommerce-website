const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/product');
const Category = require('../models/category');
const mongoose = require('mongoose');
const faker = require('faker');
const connectDB = require('./../config/db');
connectDB();

async function seedDB() {
  faker.seed(0);

  async function seedProducts(titlesArr, imgsArr, categStr) {
    try {
      const categ = await Category.findOne({ title: categStr });
      for (let i = 0; i < titlesArr.length; i++) {
        let prod = new Product({
          productCode: faker.helpers.replaceSymbolWithNumber('####-##########'),
          title: titlesArr[i],
          imagePath: imgsArr[i],
          description: faker.lorem.paragraph(),
          price: faker.random.number({ min: 10, max: 50 }),
          manufacturer: faker.company.companyName(0),
          available: true,
          category: categ._id,
        });
        await prod.save();
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log('CLOSING CONNECTION');
    await mongoose.disconnect();
  }

  await seedProducts('totes_titles', '', '');

  await closeDB();
}

seedDB();
