const express = require('express');
const mongoose = require('mongoose')
const connectDB = require('./config/db');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const methodOverride = require('method-override');
require('dotenv').config();

//load expreess (always first)
const app = express()

//load Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

//Method override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

//load config
const PORT = process.env.PORT || 3000;
connectDB();

//load & config passport
require('./config/passport')(passport)

//load morgan for logging in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
};

//handlebars helpers
const { formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

//load & config handlebars
app.engine('.hbs', exphbs({
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  }, 
  defaultLayout  : 'main',
  extname:'hbs' }))
app.set('view engine', '.hbs');

//load & config session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized:false,
  store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

//load static folder
app.use(express.static(path.join(__dirname, 'public')))

//load Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/diaries', require('./routes/diaries'));



//load server
app.listen(PORT, console.log(`Server running in =>${process.env.NODE_ENV} mode<= on port "${PORT}"...`))