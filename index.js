const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// set up express

const app = express();
//middlewares (stuff which runs always whenever we try to interact with any route)
app.use(express.json()); //json body parser so that we can read json objects from the requests that we send to express
app.use(cors());

const PORT = process.env.POST || 5000;

app.listen(PORT, () => console.log('Server up'));

// set up mongoose

//mongoose will connect for us to mongoDB
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser: true, //some formality
    useUnifiedTopology: true, //stuff needed to avoid some warnings
    useCreateIndex: true,
  },
  err => {
    if (err) throw err;
    console.log('MongoDB connection established');
  }
);

//set up routes
app.use('/users', require('./routes/userRouter'));
