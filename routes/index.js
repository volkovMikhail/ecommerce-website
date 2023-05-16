const express = require('express');
const csrf = require('csurf');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const Product = require('../models/product');
const Category = require('../models/category');
const Cart = require('../models/cart');
const Order = require('../models/order');
const middleware = require('../middleware');
const router = express.Router();
const nodemailer = require('nodemailer');
const html_to_pdf = require('html-pdf-node');

const csrfProtection = csrf();
router.use(csrfProtection);

// GET: home page
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort('-createdAt').populate('category');
    res.render('shop/home', { pageName: 'Home', products });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

// GET: add a product to the shopping cart when "Add to cart" button is pressed
router.get('/add-to-cart/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if ((req.user && !user_cart && req.session.cart) || (!req.user && req.session.cart)) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if product exists in the cart, update the quantity
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = (cart.items[itemIndex].qty * product.price).toFixed(2);
      cart.totalQty++;
      cart.totalCost += product.price;
      cart.totalCost = cart.totalCost.toFixed(2);
    } else {
      // if product does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        qty: 1,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
      cart.totalCost = cart.totalCost.toFixed(2);
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    req.flash('success', 'Item added to the shopping cart');
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect('/');
  }
});

// GET: view shopping cart contents
router.get('/shopping-cart', async (req, res) => {
  try {
    // find the cart, whether in session or in db based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      return res.render('shop/shopping-cart', {
        cart: cart_user,
        pageName: 'Shopping Cart',
        products: await productsFromCart(cart_user),
        activeTab: 'cart',
      });
    }
    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.render('shop/shopping-cart', {
        cart: null,
        pageName: 'Shopping Cart',
        products: null,
        activeTab: 'cart',
      });
    }
    // otherwise, load the session's cart
    return res.render('shop/shopping-cart', {
      cart: req.session.cart,
      pageName: 'Shopping Cart',
      products: await productsFromCart(req.session.cart),
      activeTab: 'cart',
    });
  } catch (err) {
    console.log(err.message);
    res.redirect('/');
  }
});

// GET: reduce one from an item in the shopping cart
router.get('/reduce/:id', async function (req, res, next) {
  // if a user is logged in, reduce from the user's cart and save
  // else reduce from the session's cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }

    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found, reduce its qty
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the item's qty reaches 0, remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      //save the cart it only if user is logged in
      if (req.user) {
        await cart.save();
      }
      //delete cart if qty is 0
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect('/');
  }
});

// GET: remove all instances of a single product from the cart
router.get('/removeAll/:id', async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect('/');
  }
});

// GET: checkout form with csrf token
router.get('/checkout', middleware.isLoggedIn, async (req, res) => {
  const errorMsg = req.flash('error')[0];

  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  //load the cart with the session's cart's id from the db
  cart = await Cart.findById(req.session.cart._id);

  const errMsg = req.flash('error')[0];
  res.render('shop/checkout', {
    total: Number(cart.totalCost)?.toFixed(2),
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: 'Checkout',
  });
});

// POST: handle checkout logic and payment using Stripe
router.post('/checkout', middleware.isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const cart = await Cart.findById(req.session.cart._id);
  console.log(req.body);
  stripe.charges.create(
    {
      amount: (Number(cart.totalCost).toFixed(2) * 100).toFixed(0),
      currency: 'usd',
      source: req.body.stripeToken,
      description: 'Test charge',
    },
    function (err, charge) {
      if (err) {
        req.flash('error', err.message);
        console.log(err);
        return res.redirect('/checkout');
      }

      let orderId;
      let paymentId = charge.id;

      const order = new Order({
        user: req.user,
        cart: {
          totalQty: cart.totalQty,
          totalCost: Number(cart.totalCost)?.toFixed(2),
          items: cart.items,
        },
        address: req.body.address,
        paymentId: charge.id,
      });

      order.save(async (err, newOrder) => {
        if (err) {
          console.log(err);
          return res.redirect('/checkout');
        }
        await cart.save();
        await Cart.findByIdAndDelete(cart._id);
        orderId = newOrder._id;
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            // company's email and password
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        let htmlBody = '';
        htmlBody += `<h1>Pet Shop</h1>`;
        htmlBody += `<b>Номер телефона: ${req.user.phone || '-'}</b><br/>`;
        htmlBody += `<b>Адрес: ${req.body.address}</b><br/>`;
        htmlBody += `<b>Номер заказа: ${orderId || '-'}</b><br/>`;
        htmlBody += `<b>Оплата: ${paymentId || '-'}</b><br/>
                      <hr>`;

        htmlBody += `<ol type="1">`;

        for (let index = 0; index < cart.items.length; index++) {
          const item = cart.items[index];
          htmlBody += `<li>${item.title}(${item.productCode}) x ${item.qty} = <b>${item.price} BYN</b></li>`;
        }

        htmlBody += `</ol>`;

        htmlBody += `<hr>
                      <br/>
                      <h3>Сумма: ${cart.totalCost?.toFixed(2)}</h3>`;

        const file = { content: htmlBody };

        const options = { format: 'A4' };
        html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
          transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: req.user.email,
            subject: 'чек от "Petshop"',
            text: htmlBody,
            html: htmlBody,
            attachments: [
              {
                filename: `чек_${req.user.username}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
              },
            ],
          });
        });
      });

      req.flash('success', 'Successfully purchased');
      req.session.cart = null;
      res.redirect('/user/profile');
    }
  );
});

// create products array to store the info of each product in the cart
async function productsFromCart(cart) {
  let products = []; // array of objects
  for (const item of cart.items) {
    let foundProduct = (await Product.findById(item.productId).populate('category')).toObject();
    foundProduct['qty'] = item.qty;
    foundProduct['totalPrice'] = item.price;
    products.push(foundProduct);
  }
  return products;
}

module.exports = router;
