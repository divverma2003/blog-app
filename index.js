import './server/config/config.js'; // Load env variables

import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import main from './server/routes/main.js';
import admin from './server/routes/admin.js';
import connectDB from './server/config/db.js';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import isActiveRoute from './server/helpers/routeHelpers.js';
import methodOverride from 'method-override';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
  secret: 'keyboard cat',
  resave: 'false',
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  })
}));

// Templating engine setup
app.use(expressEjsLayouts);
app.use(express.static('public'));
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;
// Route handlers (main.js)
// app.use('/', admin);
app.use('/', admin); 
app.use('/', main);

// Server Start
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}.`);
});