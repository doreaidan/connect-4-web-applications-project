const http = require('http');
const fs = require("fs");
var express = require('express');
const app = express();
const pug = require("pug");
app.set('view engine', 'pug')


const session = require('express-session');
app.use(session({ secret: 'some secret here'}))

let path = require('path');
let users = require("./users.json"); //loads users object
/*
let users = [];
fs.readFile('./users.json', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
	console.log(users.user0.username); //prints all the movies from json file
	console.log(data);
	
});*/

//const mongo = require('mongodb');
//const mongoClient = mongo.MongoClient;


const model = require("./businessLogic.js");


app.use(express.static('/public'));
app.get('/', function(req,res){
    res.sendFile(__dirname + "/html/logIn.html");
});
app.get('/html/logIn.html', function(req,res){
    res.sendFile(__dirname + "/html/logIn.html");
});
app.get('/index.html', function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/html", express.static(__dirname + "/html"));





app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/admin", auth, admin); // you need to be authorised to access admin function 
app.post("/logIn", logIn);      // send POST request to /login to login
app.get("/logout", logout);     // send GET request to /logout to logout
app.get("/userProfile", displayUserProfile)
app.post("/submitSearch", searchUsers)
app.post("/createAccount", createAccount); 
app.post("/changePass", changePass);
app.post("/updateProfileVis", updateProfileVis);
app.post("/makeFriends/:user?", makeFriends);
//restful api
app.get("/users/:user?", getUsers);
app.get("/userinfo/:user", getUserInfo);
app.get("/games/:player?/:active?/:detail?", getGames);
// /games?player=" "&active=" "&detail=" "
function auth(req, res, next) {
	if(!req.session.loggedin){
		res.status(401).send("Unauthorized");
		return;
	}
	next();
}

function admin(req, res, next){
	res.status(200).send("Welcome to the admin page, " + req.session.username);
	return;
}

function displayUserProfile(req, res, next){
	var currentUser = req.session.username;
	let userArray = model.displayUserProfile(currentUser)	
	console.log(userArray[0])
	let data = pug.renderFile("./views/userProfile.pug", {userName: userArray[0], numOfGames: userArray[1], last5Games: userArray[2], winPercent: userArray[3], friends: userArray[4], currentGame: userArray[5], profileVis: userArray[6]});
	res.end(data);
	return;
}


function searchUsers(req, res, next){
	let searchTerm = req.body.search;
	console.log(searchTerm);
	let userArray = model.displayUserProfile(searchTerm)	
	if (userArray == null || searchTerm == req.session.username){
		res.sendFile(__dirname + "/html/userNotFound.html");
		return;
	}
	console.log(userArray);
	let data = pug.renderFile("./views/otherProfile.pug", {userName: userArray[0], numOfGames: userArray[1], last5Games: userArray[2], winPercent: userArray[3], friends: userArray[4], currentGame: userArray[5], profileVis: userArray[6]});
	res.end(data);
	return;
}


function updateProfileVis(req, res, next){
	let visSetting = req.body.visability; // extract username
	console.log(visSetting);
	if(visSetting == "on"){
		visSetting = 1;
	}else if(visSetting == "off"){
		visSetting = 0;
	}
	console.log(visSetting);
	model.updateSettings(req.session.username, visSetting);
	console.log(users[req.session.username].profileVis);
	return;
	
}

function makeFriends(req, res, next){
	let request = req.query.user;
	model.makeFriends(req.session.username, request)
}

function logIn(req, res, next){
	// check if the user is already logged in
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}

	let username = req.body.username; // extract username
	let password = req.body.password; // extract password

	let getUser = model.getUserpass(username);	
	if(getUser){
		if(getUser[1] == password){
			req.session.loggedin = true;
			req.session.username = username;
			res.sendFile(__dirname + "/index.html");
		}else{
			//res.status(401).send("Not authorized. Invalid password.");
			res.sendFile(__dirname + "/html/wrongLogIn.html");
		}
	}else{
		//res.status(401).send("Not authorized. Invalid username.");
		res.sendFile(__dirname + "/html/wrongLogIn.html");
		return;
	}
}

function logout(req, res, next){
	if(req.session.loggedin){
		req.session.loggedin = false;
		res.sendFile(__dirname + "/html/logIn.html");
	}else{
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

function createAccount(req, res, next){
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	let username = req.body.username; // extract username
	let password = req.body.password;
	let passwordConfirm = req.body.passwordconfirm;
	let getUser = model.getUserpass(username);
	if (password == passwordConfirm){
		if(getUser == null){
			let newUser = model.createUser({username: username, password: password})
			res.sendFile(__dirname + "/html/logIn.html");
		}else{
			res.status(200).send("Username already exists.");
			return;
		}
	}

	return;
}

function changePass(req, res, next){
	
	let username = req.session.username; // extract username
	let password = req.body.password;
	let passwordConfirm = req.body.passwordconfirm;

	if (password == passwordConfirm){
		model.changePass(username, password);
		res.sendFile(__dirname + "/index.html");
	}else{
		res.status(200).send("Passwords do not match.");
		return;
	}

}
//rest api
function getUsers(req, res, next){
	if(req.params.user == null){
		res.status(200).json(users);
		return;
	}
	let result = model.searchUsers(req.params.user);
	res.status(200).json(result);
}

function getUserInfo(req, res, next){
	let result = model.getUser(req.session.username, req.params.user);
  	if(result == null){
    	res.status(404).send("Unknown user")
  	}else{
    	res.status(200).json(result);
  	}
}

function getGames(req, res, next){
	let result = model.getGames(req.query.player, req.query.active, req.query.detail);
	
  	if(result == null){
    	res.status(404).send("Unknown Game")
  	}else{
    	res.status(200).json(result);//not sending whole array
  	}
}

function send404(response){
	response.statusCode = 404;
	response.write("Unknown resource.");
	response.end();
}

function send500(response){
	response.statusCode = 500;
	response.write("Server error.");
	response.end();
}


app.listen(3000);
console.log('Server at http://127.0.0.1:3000/');
//npm start to start server

