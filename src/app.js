//<----- Importing all External Modules-----
//Importing Path Module to set Path of Various Folders in our Project
const path = require('path')
//Importing Express Module for Handling HTTP requests with ease
const express = require('express')
//Importing Handlebar Module for Template Rendering
const hbs = require('hbs')
//Importing Mongoose for Creating Model of Objects of MongoDB
const mongoose = require('mongoose')
//Importing Body Parser Module for Handling Requests using req.body property.
const bodyParser = require('body-parser');
//Importing Send Grid Module for Sending Automated Emails
const sgMail = require('@sendgrid/mail');
//</----- Importing all External Modules-----


//<----- Define paths for Express config-----
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
//</----- Define paths for Express config-----

// Creating Application using the Express Module
const app = express()

//<----- Setup handlebars engine and views location -----
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
//</----- Setup handlebars engine and views location -----


//<----- Setup static directory to serve -----
app.use(express.static(publicDirectoryPath))
//</----- Setup static directory to serve -----



//<----- MongoDB Configurations -----
//Establishing Connecting with MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ting-hiring-challenge', {
	useNewUrlParser: true,
	useCreateIndex: true
})

//Creating a Model in Database
const Player = mongoose.model('Player', {
	player_name: {
		type: String
	},
	player_gender: {
		type: String
	},
	player_mobile_no: {
		type: Number
	},
	player_email: {
		type: String
	},
	player_address: {
		type: String
	},
	player_retry: {
		type: Boolean
	},
	player_winning: {
		type: String
	},
})
//</----- MongoDB Configurations -----


//<----- Defining urlencodedParser for Handling POST Requests -----
var urlencodedParser = bodyParser.urlencoded({
	extended: false
})
//</----- Defining urlencodedParser for Handling POST Requests -----


//SendGrid API Key Configurations
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



//<----- URLs and their Responses -----
//Function for handling Home Page URL
app.get('', (req, res) => {
	res.render('index', {})
})

//Function for Spinning Wheel URL
app.post('/email_submit', urlencodedParser, (req, res) => {
    Player.exists({ player_email: req.body.player_email }, function(err, result) {
        if (err) {
          res.send(err);
        } else {
            if(result==true){
                res.render('index', {error_message:'User Exists'})
            }
            else {
                const me = new Player({
                    player_email: req.body.player_email,
                    player_name: "Blank",
                    player_gender: "Blank",
                    player_address: "Blank",
                    player_mobile_no: 0,
                    player_winning: "Blank",
                })
                me.save()
                const msg = {
                    to: req.body.player_email,
                    from: 'SohamThaker@tinghiringchallenge.com',
                    subject: 'Ting Hiring Challenge',
                    html: 'Greetings, Thank you Participating in Ting Hiring Challenge Spin The Wheel Game. Regards, <strong>Soham Thaker</strong>',
                  };
                sgMail.send(msg);
                res.render('spin_loose', {
                    player_id: me._id,
                    player_email: me.player_email
                })
            }
        }
      });
});

//Function for Winning Details Capture URL
app.post('/winning_details', urlencodedParser, (req, res) => {
	res.render('form', {
        player_id: req.body._id,
        player_email: req.body.player_email,
        player_winning: req.body.player_winning,
	})
});

//Function for Success on Player Form Submit URL
app.post('/success', urlencodedParser, (req, res) => {
	Player.update({
        _id: req.body._id
    }, {
        player_name: req.body.player_name,
        player_email: req.body.player_email,
        player_gender: req.body.player_gender,
        player_address: req.body.player_address,
        player_mobile_no: req.body.player_mobile_no,
        player_winning: req.body.player_winning
    },
    function (err, log) {
        console.log("Number of Records Effected" + log);
    });
    const msg = {
        to: req.body.player_email,
        from: 'SohamThaker@tinghiringchallenge.com',
        subject: 'Winner of Ting Hiring Challenge',
        html: 'Greetings '+req.body.player_name+', Congratulation on Winning <strong>Spin the Wheel Challenge</strong>. Our Team will get back to you on your Mobile '+req.body.player_mobile_no+'or on your Email '+req.body.player_email+' Thank you for Participating. Regards, <strong>Thaker Soham</strong>',
      };
      sgMail.send(msg);
	res.render('success_form', {
		player_email: req.body.player_email
	})
});


//Functions for handling Questions Page
app.post('/questions', urlencodedParser, (req, res) => {
	res.render('questions', {
        player_id: req.body._id,
		player_email: req.body.player_email,
	})
})

//Functions for handling Questions Page
app.post('/retry', urlencodedParser, (req, res) => {
    if(req.body.question1=='250+' && req.body.question2=='Delhi'){
        res.render('spin', {
            player_id: req.body._id,
            player_email: req.body.player_email
        })
    }
    else {
        res.render('failure', {})
    }
})

//Functions for Page NOT Found Request
app.get('*', (req, res) => {
	res.render('404', {
	})
})

//</----- URLs and their Responses -----


app.listen(8000, () => {
	console.log('Server is up on port 8000.')
})