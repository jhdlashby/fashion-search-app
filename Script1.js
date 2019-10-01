const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const path = require('path');
const router = express.Router();
const readline = require('readline');
const fs = require('fs');

app.use(express.static(__dirname + '/public'));

router.get('/', function (req, res) { //start page
    res.sendFile(path.join(__dirname + '/HTMLPage1.html'));
});

var search_returns = [];
var first_load_flag = true;

router.post('/search', (req, res) => { //retrieves the search term(s) then finds the matching data
    search_returns = []; //if a new search is started the array must be cleared
    first_load_flag = false;

    var search_words = req.body.search_data.split(" ");
    console.log(search_words);

    let rl = readline.createInterface({
        input: fs.createReadStream('garment_items.jl')
    });

    rl.on('line', function (line) {
        let jsondata = JSON.parse(line);
        jsondata.number_of_matches = 0; //creates a new attribute in json to count how many words from .product_title and .brand match the search terms
        let product = jsondata.product_title.toLowerCase(); //sets everything to lowercase as .includes() is case sensitive
        let brand = jsondata.brand.toLowerCase();
        for (var i = 0; i < search_words.length; i++) { //compares .product_title and .brand against every search term
            if (product.includes(search_words[i].toLowerCase())) {
                jsondata.number_of_matches++; //if a search term is found in the .product_title it increments the number of matches
            };
            if (brand.includes(search_words[i].toLowerCase())) {
                jsondata.number_of_matches++;
            };
        };
        if (jsondata.number_of_matches >= search_words.length) { //ensures every search term appears either in the .product_title or the .brand
            search_returns.push(jsondata);
        };
    });

    rl.on('close', function (line) {
        res.redirect('/'); //redirects back to the homepage once every json has been checked
    });
});

router.get('/json', function (req, res) { //sends the matching search terms back to homepage
    if (search_returns.length == 0) { //no results, either because there were no matches to the search terms or there hasn't been a search yet
        res.json([{ first_load: first_load_flag }]);
    } else {
        res.json(search_returns);
    };
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');