var fs = require('fs');
const uuidv4 = require('uuid/v4');

/*
    Since this is just a test
    We'll use user.json as our user database
    And create login session stored in-memory for validation
    There will be no session management
*/

// In-memory storage for technical test
var inviteToken = [];

var appRouter = function (app) {

    app.post("/login", function(req, res) {

        const body = req.body;
        var username = body.username;
        var password = body.password;
        console.log("Login with username: "+username+ " and password "+password);

        if(!username || !password){
            res.status(400).send({
                errorMsg: "Incomplete Input"
            });
        }
        else{
            const file = fs.readFileSync('./data/user.json', 'utf8')
            var userData = JSON.parse(file);

            var user = userData.filter(user => user.username == username)[0];
            console.log("User : " + JSON.stringify(user));

            if(!user){
                res.status(400).send({
                    errorMsg: "No User Found"
                });
            }
            else{
                if(user.password != password){
                    console.log(user.password + " compare with " +password);
                    res.status(400).send({
                        errorMsg: "Invalid Password"
                    });
                }
                else{
                    res.status(200).send({
                        responseMsg: "Login Successful!",
                        userId: user.id
                    });
                }
            }
        }
    });

    app.get("/getAllToken", function(req, res) {
        res.status(200).send({
            tokenList: inviteToken
        });
    });

    app.post("/genToken", function(req, res) {
        // Generate 6-12 alphanumeric tokens
        var token = uuidv4(); // Get a UUID
        var tokenLength = 6 + Math.ceil((Math.random() * 6)); // Random a length between 6 to 12
        token = token.substring(token.length-tokenLength,token.length); // Cut the UUID according to token length

        var tokenDT = new Date();
        inviteToken.push({token:token, tokenDT:tokenDT})
        res.status(200).send({
            responseMsg: "Token Generated!",
            token: token,
            tokenDT: tokenDT
        });
    });

    app.post("/validateToken", function(req, res) {
        var token = inviteToken.filter(token => token.token == req.body.token)[0];
        console.log("Token = "+JSON.stringify(token));
        if(!token){
            res.status(400).send({
                errorMsg: "Invalid Token"
            });
        }
        else{
            var now = new Date();
            var then = token.tokenDT;
            var timeDiff = Math.abs(now.getTime() - then.getTime());

            // If more than 7 days, token becomes invalid
            if(timeDiff > (1000 * 3600 * 7)){
                res.status(400).send({
                    errorMsg: "Token Expired"
                });
            }
            else{
                res.status(200).send({
                    responseMsg: "Validate Successful!",
                    token: token.token
                });
            }
        }
    });

    app.post("/killToken", function(req, res) {
        inviteToken = inviteToken.filter(token => token.token != req.body.token)
        res.status(200).send({
            responseMsg: "Token Killed Successfully",
            tokenKilled: req.body.token
        });
    });
}

module.exports = appRouter;