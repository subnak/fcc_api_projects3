'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var shorturl = require('shorturl');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.render(path + '/public/helloWorld.ejs');
		});
		
	app.route('/:url')
		.get(shortenTheUrl,function(req,res){
			console.log("this should be req.baseUrl: "+req.params.url);
			console.log("this is the shortenedUrl: "+JSON.stringify(res.shortenedObject));
			res.render(path+'/public/solutionPage.ejs',{
				shortenedObject:res.shortenedObject
			});
		})

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		
		
		
	function shortenTheUrl(req,res,next){
		shorturl(req.params.url, function(result) {
			res.shortenedObject={originalUrl:req.params.url,shortenedUrl:result};
			res.shortenedUrl=result;
			next();
		});
		
	}
		
};
