require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const bcrypt = require('bcryptjs')

require('./db/conn');
const Register = require('./models/registers')

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set('views', template_path);
hbs.registerPartials(partials_path)

// console.log(process.env.SECRET_KEY);

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/register', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })
            console.log("the success part" + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log('the token part' + token);

            const registered = await registerEmployee.save();
            res.status(201).render("index")

        } else {
            res.send('passwords are not matched')
        }

    } catch (error) {
        res.status(400).send(error);
        console.log('the error part page');
    }
})



app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password,useremail.password);

        const token = await useremail.generateAuthToken();
        console.log('the token part' + token);

        if(isMatch){
            res.status(201).render('index')
        }else{
            res.send("invalid password details")
        }

    } catch (error) {
        res.status(400).send('invalid login details')
    }
})




const securePassword = async(password)=>{
    const passwordHash = await bcrypt.hash(password,10);
    console.log(passwordHash);

    const passwordmatch = await bcrypt.compare(password,passwordHash);
    console.log(passwordmatch);
}

securePassword('nidhi@123')



const jwt = require('jsonwebtoken');

const createToken = async()=>{
    const token = await jwt.sign({_id:"64997fa1929d6f86266142db"},"mynameisnidhikhuntmyfathernameissha");
    console.log(token);

    const userVer = await jwt.verify(token,"mynameisnidhikhuntmyfathernameissha");
    console.log(userVer);
}
createToken();



app.listen(port, () => {
    console.log(`server is running at port no. ${port}`);
})