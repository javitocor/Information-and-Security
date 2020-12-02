'use strict';
require('dotenv').config();
const fetch = require("node-fetch");
var expect = require('chai').expect;

const mongoose = require('mongoose')
var mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

var Schema = mongoose.Schema;
var StockSchema = new Schema(
  {
    code: { type: String },
    likes: { type: [String], default: [] }
  }
);
const Stock = mongoose.model("Stock", StockSchema)

async function stockSave(code, like, ip) {
  try {
    let stock = await Stock.findOne({ code: code })
    if (stock) {
      if (like && stock.likes.indexOf(ip) === -1) {
        await Stock.findByIdAndUpdate(stock._id, { $push: { likes: ip } }, { new: true }, function (err, stock) {
          if (err) {
            return console.log(err);
          }
          if (!stock) {
            res.send('no stock exists');
          } else {
            return stock
          }
        })
      }
      return stock
    } else {
      let newStock = new Stock({ code: code, likes: like ? [ip] : [] })
      await newStock.save(function (err) {
        if (err) return console.error(err);
        return newStock
      });
    }
  } catch (err) {
    console.error(err)
    res.status(500).json('Server erorr...')
  }
}

async function parsedData(codes) {
  try {
    let stockData = []
    let likes = []
    for(let i=0; i < codes.length; i++) {
      const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${codes[i].code}/quote`,  { mode: 'cors' });
      const data = await response.json();
      likes.push(codes[i].likes.length)
      let obj = { 
        stock : codes[i].code.toUpperCase(),
        price: data.latestPrice.toString()
      }
      stockData.push(obj)
    }
    if(codes.length == 1){
      stockData[0].likes = codes[0].likes.length;
      stockData = stockData[0]
    } else {
      stockData[0].rel_likes = likes[0] - likes[1]
      stockData[1].rel_likes = likes[1] - likes[0]
    }

    return stockData;
  } catch (err) {
    console.error(err)
  }
}


module.exports = function (app) {

  app.get('/api/testing', (req, res) => {
    console.log(req.connection)

    res.json({ IP: req.ip })
  })

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      try {
        let code = req.query.stock || ''
        if (!Array.isArray(code)) {
          code = [code]
        }
        let codes = []
        for (let i = 0; i < code.length; i++) {
          let a = await stockSave(code[i], req.query.like, req.ip)
          codes.push(a)
        }        
        let stockData = await parsedData(codes)
        res.json({ stockData })
      } catch (err) {
        console.error(err)
        res.status(500).json('Server erorr...')
      }
    });

};
