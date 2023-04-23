const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
var moment = require('moment');

// GET: display all products
router.get('/', async (req, res) => {
  const successMsg = req.flash('success')[0];
  const errorMsg = req.flash('error')[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const sort = req.query.sort || '-createdAt';
  try {
    const products = await Product.find({})
      .sort(sort)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('category');

    const count = await Product.count();

    let queryParams = Object.entries(req.query)
      .filter((entry) => entry[0] !== 'page')
      .map((entry) => entry.join('='))
      .join('&');

    if (queryParams) queryParams += '&';

    res.render('shop/index', {
      sort,
      pageName: 'All Products',
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: '/products/?' + queryParams,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// GET: search box
router.get('/search', async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const successMsg = req.flash('success')[0];
  const errorMsg = req.flash('error')[0];
  const sort = req.query.sort || '-createdAt';
  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: 'i' },
    })
      .sort(sort)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('category')
      .exec();
    const count = await Product.count({
      title: { $regex: req.query.search, $options: 'i' },
    });

    let queryParams = Object.entries(req.query)
      .filter((entry) => entry[0] !== 'page')
      .map((entry) => entry.join('='))
      .join('&');

    if (queryParams) queryParams += '&';

    res.render('shop/index', {
      sort,
      pageName: 'Search Results',
      products,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: '/products/search?' + queryParams,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

//GET: get a certain category by its slug (this is used for the categories navbar)
router.get('/:slug', async (req, res) => {
  const successMsg = req.flash('success')[0];
  const errorMsg = req.flash('error')[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const sort = req.query.sort || '-createdAt';
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allProducts = await Product.find({ category: foundCategory.id })
      .sort(sort)
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate('category');

    const count = await Product.count({ category: foundCategory.id });

    let queryParams = Object.entries(req.query)
      .filter((entry) => entry[0] !== 'page')
      .map((entry) => entry.join('='))
      .join('&');

    if (queryParams) queryParams += '&';

    const bc = req.breadcrumbs.map((b) => {
      return { ...b, name: b.name.split('?')[0] };
    });

    res.render('shop/index', {
      sort,
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      products: allProducts,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: bc,
      home: '/products/' + req.params.slug.toString() + '/?' + queryParams,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
});

// GET: display a certain product by its id
router.get('/:slug/:id', async (req, res) => {
  const successMsg = req.flash('success')[0];
  const errorMsg = req.flash('error')[0];
  try {
    const product = await Product.findById(req.params.id).populate('category');
    res.render('shop/product', {
      pageName: product.title,
      product,
      successMsg,
      errorMsg,
      moment: moment,
    });
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
});

module.exports = router;
