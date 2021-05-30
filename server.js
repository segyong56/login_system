const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const app = express();
const port = 5000;

mongoose.connect('mongodb://localhost:27017/login_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex : true
}).then(() => {
    console.log('mongodb Database connected')
})

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const auth = require('./routes/auth')

app.use('/api', auth)

app.listen(port, (req, res) => {
    console.log(`server is running at ${port}`)
})