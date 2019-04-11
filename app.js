const fs = require('fs');
const data = fs.readFileSync('accounts.json');
const accounts = JSON.parse(data);
console.log(accounts);

const express = require('express');
const app = express();

app.use(express.static('public'));

var config = require('./config.js');
var KEY = config.key;
var SECRET = config.secret;
var OAuth = require('oauth')

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true}));

var hbs = require("hbs");

app.set('view engine', 'hbs');

var oauth = new OAuth.OAuth(
	'http://api.thenounproject.com',
	'http://api.thenounproject.com',
	KEY,
	SECRET,
	'1.0',
	null,
	'HMAC-SHA1'
)

app.get('/', function (req, res) {
	res.render('index');

})

app.post('/', function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  if(username in accounts){
    console.log("user exists")
    res.render('index', {error:"User exits"});
  }else{
    accounts[username] = password;
    var data = JSON.stringify(accounts); 
    fs.writeFile('accounts.json', data, finished);
    function finished(err) {
      console.log('got the contact')
      res.redirect('/collection/' + username);
    }
  }

})

app.get('/login',function(req, res){
	res.render('login');
})

app.post('/login', function (req, res) {
	let user = req.body.username;
  let pass = req.body.password;
  console.log(accounts[user], pass);
  if (accounts[user] == pass){
    res.redirect('/collection/' + user);
  }else{
    res.render('login', {error:"Incorrect password or account doesn't exist"})
  }
})
app.get('/collection/:username',function(req, res){
	res.render('collection', {name: req.params.username});
})

app.post('/collection/:username', function(req, res){
	const data = req.body.collectName;
	oauth.get(
	`http://api.thenounproject.com/collection/${data}/icons/?limit=5`,
	null,
	null,
	function (err, body){
		if(err){
			console.log(err);
			res.render('collection', {error: "Please try again",name: req.params.username})

		}else{
			let info = JSON.parse(body);
			// console.log(info.icons[0]);
			var list = [];
			for (var i = 0; i < info.icons.length; i++) {

				var element = {
					image: info.icons[i].preview_url,
					attri: info.icons[i].attribution
				}
				// console.log(element)
				list.push(element);
			}
			// console.log(list);
			// console.log(JSON.parse(body));
			res.render('collection', {list: list, name: req.params.username})
		}
	}
)
})


const server = app.listen(3000, listening);

function listening(){
	console.log('listening on port 3000');
}





  // app.get('/icon',function(req, res){
// 	res.render('icon');
// })

// app.post('/icon', function(req, res){
// 	const data = req.body.iconName;
// 	oauth.get(
// 	`http://api.thenounproject.com/icon/${data}`,
// 	null,
// 	null,
// 	function (err, body, respond){
// 		if(err){
// 			console.log(err);
// 			res.render('icon', {error: "Please try again"})
// 		}else{
// 			let info = JSON.parse(body);
// 			// console.log(JSON.parse(body));
// 			res.render('icon', {
// 			image: info.icon.preview_url,
// 			attri: info.icon.attribution
// 			})
			
// 		}
// 	}
// )
// })