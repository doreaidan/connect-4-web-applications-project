let users = require("./users.json"); //loads users object
let games = require("./games.json"); //loads users object
const fs = require("fs");
const assert = require("assert");

/*
creates new user objects and initializes values
in: newUser - object with username and password
Out: new user object
*/
function createUser(newUser){
  //Check the object is valid
  var userObj
  if(!newUser.username || !newUser.password){
    return null;
  }

  if(users.hasOwnProperty(newUser.username)){//if username already exists
    return null;
  }
  //Set initial values
  newUser.numofGames = [0,0];
  newUser.last5Games = [];
  newUser.winPercent = 0;
  newUser.friends = [];
  newUser.friendRequest = [];
  newUser.currentGame = [];
  newUser.profileVis = 0;
  newUser.onlineStat=0
  users[newUser.username] = newUser;
  
  var obj = users;
  fs.writeFile ("users.json", JSON.stringify(obj), function(err) {
    if (err) throw err;
    }

  );
  return users[newUser.username];
}

function changePass(user, newPass){
  var obj = users;
  obj[user].password = newPass;
  fs.writeFile ("users.json", JSON.stringify(obj), function(err) {
    if (err) throw err;
    console.log('complete');
    }
  );
}

/*
Allows somebody to search all users in the system and get an array of users they can see. We are assuming a user will be logged in to do this. We will assume a requesting user can access themself and any of their friends. Other users should not be returned in the result.

Inputs:
requestingUser - the object representing the user making the request (we use this to decide whether the request should be successful or not)
searchTerm - a string the user is searching for

Outputs:
An array of users that match the search term and are accessible by the requesting user.
*/
function searchUsers(searchTerm){
  let results = [];
  
  for(username in users){
    console.log("b");
    let user = users[username];
    //If this user matches the search term
    if(searchTerm == "" && user.profileVis == 0){
      results.push(user);
    }else if(user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0){
      //If the requesting user is allowed to access the matching user
      if(user.profileVis == 0){
        results.push(user);
        console.log("c");
      }
    }

  }
  //Test for searching users
  console.log(results);
  return results;
}


//used for login in
function getUserpass(userID){//searches using userid not username like it should
  //var count = Object.keys(users).length;

  if(!users.hasOwnProperty(userID)){//check if users exist
    return;
  }
  if(users[userID].username == userID){
    let result = [users[userID].username, users[userID].password];
    return result;
  }
  
  return null;
}


function getUser(requestingUser, userID){
  //If the requested userID exists and the requesting user is allowed to access it, return the user
  if(users.hasOwnProperty(userID) && users[userID].profileVis == 0){
    return "username: "+users[userID].username+", number of games played(wins/losses): "+users[userID].numofGames+", win rate: "+users[userID].winPercent+"%, last 5 games(1 for win, 0 for loss): game 1: "
    +users[userID].last5Games[0]+": "+users[userID].last5Games[1]+", "+users[userID].last5Games[2]+": "+users[userID].last5Games[3]+", "+users[userID].last5Games[4]+": "+users[userID].last5Games[5]
    +", "+users[userID].last5Games[6]+": "+users[userID].last5Games[7]+", "+users[userID].last5Games[8]+": "+users[userID].last5Games[9];
  }

  return null;
}

function getGames(player, active, detail){
  var result=[];
  if(player == null && active == null){
    for(opponent1 in games){
      let gameTemp = games[opponent1];
      result.push(gameTemp);
    }
	}else if(player !== null && active == null){
    for(opponent1 in games){
      let gameTemp = games[opponent1];
      if(gameTemp.opponent1 == player){
        result.push(gameTemp);
      }
    }
    for(opponent2 in games){
      let gameTemp = games[opponent2];
      if(gameTemp.opponent2 == player){
        result.push(gameTemp);
      }
    }
	}else if(player == null && active !== null){
    for(opponent1 in games){
      let gameTemp = games[opponent1];
      if(parseInt(gameTemp.status) == parseInt(active)){
        result.push(gameTemp);
      }
    }
  }else if(player !== null && active !== null){
    for(opponent1 in games){
      let gameTemp = games[opponent1];
      if(parseInt(gameTemp.status) == parseInt(active) && gameTemp.opponent1 == player){
        result.push(gameTemp);
      }
    }
    for(opponent2 in games){
      let gameTemp = games[opponent2];
      if(parseInt(gameTemp.status) == parseInt(active) && gameTemp.opponent2 == player){
        result.push(gameTemp);
      }
    }
  }
  
  var finalString;
  var finalArray = [];
  for(i=0;i<result.length;i++){
    if(detail == "summary" || detail == "null"){
      if(parseInt(result[i].status) == 1){//finished game
        finalString = "First player: "+result[i].opponent1+", Second player: "+result[i].opponent2+", Game status(1 for finish, 0 for in progress): "+result[i].status+", Winner: "+result[i].winner+", Number of Turns: "+result[i].numofTurns+", Forfeited(1 for yes, 0 for no): "+result[i].forfeitStatus;
      }else{//not finished
        finalString = "First player: "+result[i].opponent1+", Second player: "+result[i].opponent2+", Game status(1 for finish, 0 for in progress): "+result[i].status;
      }
    
    }else if(detail == "full"){
      if(parseInt(result[i].status) == 1){//finished game
        finalString = "First player: "+result[i].opponent1+", Second player: "+result[i].opponent2+", Game status(1 for finish, 0 for in progress): "+result[i].status+", Winner: "+result[i].winner+", Number of Turns: "+result[i].numofTurns+", Forfeited(1 for yes, 0 for no): "+result[i].forfeitStatus+", Turn breakdown:"+result[i].turnOrder;
      }else{
        finalString = "First player: "+result[i].opponent1+", Second player: "+result[i].opponent2+", Game status(1 for finish, 0 for in progress): "+result[i].status;
      }
    }
    finalArray.push(finalString);
    console.log(finalArray);
  }
  return finalString;
}

function displayUserProfile(currentUser){
  let userArray = [];
  if(!users.hasOwnProperty(currentUser)){//check if users exist
    return null;
  }
  for(username in users){
    let user = users[username];
   if(user.username.toLowerCase().indexOf(currentUser.toLowerCase()) >= 0){
      //If the requesting user is allowed to access the matching user
      userArray.push(user);
    }
  }
  let finalArray = [userArray[0].username, userArray[0].numofGames, userArray[0].last5Games, userArray[0].winPercent, userArray[0].friends, userArray[0].currentGame, userArray[0].profileVis];
  return finalArray;
}

/*
add users to eachother friendslist if they both currently have a friend request for eachother
Inputs:
userA/userB - two user IDs
*/
function makeFriends(userA, userB){
  if(!users.hasOwnProperty(userA) && !users.hasOwnProperty(userB)){//check if users exist
    return;
  }
  if(users[userA].friends.includes(userB)){//checks if already friends
    return;
  }else{
    if(users[userA].friendRequest.includes(userB) && users[userB].friendRequest.includes(userA)){//if they both have friend requests for eachother
      users[userA].friends.push(userB);
      users[userB].friends.push(userA);
      for (var i = users[userA].friendRequest.length - 1; i >= 0; i--) {//removes friend request after becoming friends
        if (users[userA].friendRequest[i] === userB){
          users[userA].friendRequest.splice(i, 1);
        }
      }
      for (var i = users[userB].friendRequest.length - 1; i >= 0; i--) {
        if (users[userB].friendRequest[i] === userA){
          users[userB].friendRequest.splice(i, 1);
        }
      }
    }else{
      return;
    }
  }
}
/*
removes userB from userA's friends list
Inputs:
userA/userB - two user IDs
*/
function unFriend(userA, userB){//function to unfriend other friends
  //checs if user ids exist
  if(!users.hasOwnProperty(userA) && !users.hasOwnProperty(userB)){
    return;
  }
  if(users[userA].friends.includes(userB)){//if friends list both include users
    for (var i = users[userA].friends.length - 1; i >= 0; i--) {//traverses friends list
      if (users[userA].friends[i] === userB){
        users[userA].friends.splice(i, 1);
      }
    }
    for (var i = users[userB].friends.length - 1; i >= 0; i--) {//removes from both friends list if one user clicks unfriend
      if (users[userB].friends[i] === userA){
        users[userB].friends.splice(i, 1);
      }
    }
  }else{
    return;
  }
}

/*
adds a recipient to request's friends list and if they both have each in there then call makeFriends()
Inputs:
request/recipient - two user IDs
*/
function sendFriendRequest(request, recipient){//
  if(!users.hasOwnProperty(request) && !users.hasOwnProperty(recipient)){//check if users exist
    return;
  }
  if(users[request].friends.includes(recipient)){//checks if already friends
    return;
  }else{
    users[request].friendRequest.push(recipient);
    if(users[request].friendRequest.includes(recipient) && users[recipient].friendRequest.includes(request)){
      //if they both have friend requests for eachother, the second friend request is the same as accepting a friend request
      makeFriends(request, recipient);
    }else{
      return;
    }
  }
}
/*
updates profile visabillity settings of a user
Inputs:
user/vis - user id and a settings value 
*/
function updateSettings(user, vis){
  var obj = users;
  if(!users.hasOwnProperty(user)){ //checks if user exists
    return "User not found.";
  }
  obj[user].profileVis = vis;
  fs.writeFile ("users.json", JSON.stringify(obj), function(err) {
    if (err) throw err;
    console.log('complete');
    }
  );
  return;
}
/*
updates both users settings after a game, 5 recent game, win percent, game totals
Inputs:
userA/userB/userAResult - users ids and a game result value
*/
function updateGameStats(userA, userB,userAResult){
  //passes user to update stats for and an array gameResults that hold the last games result(0)(1:win0:loss) and username you played against(1)
  if(!users.hasOwnProperty(userA)){//checks if users exist
    return"User A not found";
  }else if (!users.hasOwnProperty(userB)){
    return "User B not found";
  }
  
  if(userAResult == 1){
    var userBResult = 0;
  }else if (userAResult == 0){
    var userBResult = 1;
  }
  
  var arrayUserA=[userAResult,userB,users[userA].last5Games[0],users[userA].last5Games[1],users[userA].last5Games[2], users[userA].last5Games[3],users[userA].last5Games[4],users[userA].last5Games[5],users[userA].last5Games[6],users[userA].last5Games[7]];
  var arrayUserB=[userBResult,userA,users[userB].last5Games[0],users[userB].last5Games[1],users[userB].last5Games[2], users[userB].last5Games[3],users[userB].last5Games[4],users[userB].last5Games[5],users[userB].last5Games[6],users[userB].last5Games[7]];
  users[userA].last5Games = arrayUserA; //updates the last 5 games with the newly won games
  users[userB].last5Games = arrayUserB;
  if(userAResult==0){//updates num of games which hold number of wins and losses
    users[userA].numofGames[1] = users[userA].numofGames[1]+1;//index 0 for wins and index 1 for losses
    users[userB].numofGames[0] = users[userB].numofGames[0]+1;
  }else if(userAResult==1){
    users[userA].numofGames[0] = users[userA].numofGames[0]+1;
    users[userB].numofGames[1] = users[userB].numofGames[1]+1;
  }
  users[userA].winPercent=(users[userA].numofGames[0]/(users[userA].numofGames[0]+users[userA].numofGames[1]))*100;
  users[userB].winPercent=(users[userB].numofGames[0]/(users[userB].numofGames[0]+users[userB].numofGames[1]))*100;
}


function updateOnlineStat(userA){//call when loging in and out to update online status depending on profile visabillity
  if(users[userA].onlineStat == 0){
    users[userA].onlineStat = 1;
  }else{
    users[userA].onlineStat = 0;
  }

}


module.exports = {
  users,
  createUser,
  getUserpass,
  searchUsers,
  changePass,
  getUser, 
  getGames,
  displayUserProfile,
  updateSettings,
  makeFriends
}