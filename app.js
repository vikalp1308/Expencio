var express           =  require("express"),
app                   =  express(),
bodyParser            =  require("body-parser"),
mongoose              =  require("mongoose"),
passport              = require("passport"),
User                  = require("./models/user"),
Expenses              = require("./models/expenses"),
passport              = require("passport"),
LocalStrategy         = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
methodOverride        = require("method-override"),
flash                 = require("connect-flash");

//mongoose.connect('mongodb://localhost:27017/image_gallary', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb+srv://Username:Password@cluster0-dujwe.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static("public"));

app.use(methodOverride("_method"));
app.use(flash())
app.locals.moment = require('moment');
//Passport Configuration

app.use(require("express-session")({
	secret: "I'm the best man in the world",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.get("/",function(req,res){
	res.render("home");
})

app.get("/About",function(req,res){
	res.render("about");
})

app.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//Handle Sign Up Logic
app.post("/register",function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
    		console.log(err);
    		return res.render("register", {error: err.message});
        }
		passport.authenticate("local")(req,res,function(){
			req.flash("success", "Welcome to Expensio " + user.username);
			res.redirect("/expenses");
		})
	})
});

//show login form
app.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

// Handle Login Logic
app.post("/login", passport.authenticate("local",{
	successRedirect: "/expenses",
	failureRedirect: "/login",
}),function(req,res){
	
});


//LogOut Route
app.get("/logout",function(req,res){
	req.logout();
	req.flash("success","You Logged Out!");
	res.redirect("/");
});



app.get("/expenses",isLoggedIn,  function(req, res){
    // Get all campgrounds from DB
    Expenses.find({}, function(err, allExpenses){
       if(err){
           console.log(err);
       } else {
          res.render("expenses",{expenses: allExpenses, page: 'expenses'});
       }
    });
});

//NEW - Show Form To Create New Campground
app.get("/expenses/new",isLoggedIn,function(req,res){
	Expenses.findById(req.params.id,function(err,foundExpenses){
		if(err){
			res.redirect("/expenses")
		}else{
			res.render("newExpenses", {expenses: foundExpenses});
		}
	})	
});

//CREATE - Add New Comment To DB
app.post("/expenses",isLoggedIn,function(req,res){
	var title = req.body.title;
	var price =req.body.price;
	var desc = req.body.description;
	var author= {
		id: req.user._id,
		username: req.user.username
	}
	var newExpenses = {title: title , price: price,  description: desc, author:author}
	Expenses.create(newExpenses, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			req.flash("success", "Successfully added Expense");
			console.log(newlyCreated);
			res.redirect("/expenses")
		}
	});
});


//EDIT Campground
app.get("/expenses/:id/edit", function(req,res){
	Expenses.findById(req.params.id,function(err, foundExpenses){
		res.render("editExpenses",{expenses: foundExpenses});
	});
});

//UPDATE Campground
app.put("/expenses/:id", function(req,res){
	Expenses.findByIdAndUpdate(req.params.id, req.body.expenses,function(err, updateExpenses){
		if(err){
			res.redirect("/expenses");
		}else{
			req.flash("success", "Expense Edited");
			res.redirect("/expenses");
		}
	});
});

//DELETE Campground
app.delete("/expenses/:id", function(req,res){
	Expenses.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/expenses");
		}else{
			req.flash("success", "Expense deleted");
			res.redirect("/expenses");
		}
	});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

	
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Server Has Started!");
});

