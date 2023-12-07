const express = require('express');

let app = express();

let path = require('path');

const users = [
    { username: 'admin', password: 'pass123' }
];

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.RDS_HOSTNAME || 'localhost',
        user: process.env.RDS_USERNAME || 'postgres',
        password: process.env.RDS_PASSWORD || 'Aliese0921',
        database: process.env.RDS_BD_NAME || 'user_survey',
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    }
});

app.use(express.static('public'));

//home path
app.get('/', (req, res) => {
    // to test if ejs is working
    const name = 'John';
    res.render('home', { name });
});

//login path
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// login functionality
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Simple array check for username and password
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.render('admin_data', { mytable : user_info});
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

// create username functionality
app.post('/create_account', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        res.render('create_account', { successMessage: null, error: 'Username already exists. Please choose another username.' });
    } else {
        // Add the new user to the array
        users.push({ username, password });

        // Introduce a delay of 2 seconds (adjust as needed)
        setTimeout(() => {
            // Redirect to the home page after the delay with a success message
            res.render('create_account', { successMessage: 'Account created successfully!', error: null });
        }, 1000);
    }
});

//create an account path
app.get("/create_account", (req, res) => {
    res.render("create_account");
});

// survey path
app.get("/survey", (req, res) => {
    res.render("survey");
});

// survey post


//show the data for admins
app.get("/admin_data", (req, res) => {
    res.render("admin_data");
});

// knex sql statement to get full table
app.get('/admin_data', (req, res) => {
    knex.select(
        'ui.surveyid', 'ui.timestamp', 'ui.age', 'ui.gender', 'ui.relationshipstatus', 'ui.occupationstatus', 'ui.location',
        'oa.na', 'oa.private', 'oa.school', 'oa.university', 'oa.company', 'oa.government',
        'sm.usesm', 'sm.facebook', 'sm.twitter', 'sm.instagram', 'sm.youtube', 'sm.discord', 'sm.reddit', 'sm.pinterest', 'sm.tiktok', 'sm.snapchat',
        'qr.q8', 'qr.q9', 'qr.q10', 'qr.q11', 'qr.q12', 'qr.q13', 'qr.q14', 'qr.q15', 'qr.q16', 'qr.q17', 'qr.q18', 'qr.q19', 'qr.q20'
    )
    .from('user_info as ui')
    .join('org_affill as oa', 'ui.surveyid', 'oa.surveyid')
    .join('sm_usage as sm', 'oa.surveyid', 'sm.surveyid')
    .join('question_resp as qr', 'sm.surveyid', 'qr.surveyid')
    .then(user_info => {
        console.log('Data fetched successfully:', user_info);
        res.render('admin_data', { mytable: user_info });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    });
});


// edit user path
app.get("/edit", (req, res) => {
    res.render("edit");
});

// handle user update
app.post("/edit", (req, res) => {
    const { oldUsername, oldPassword, newUsername, newPassword } = req.body;

    // Find the user with oldUsername and oldPassword in the array
    const userIndex = users.findIndex(u => u.username === oldUsername && u.password === oldPassword);

    if (userIndex !== -1) {
        // Update the user information
        users[userIndex] = { username: newUsername, password: newPassword };
        res.redirect("/admin_data"); // Redirect to the admin_data page after updating
    } else {
        res.render("edit", { error: 'Invalid old username or password' });
    }
});

//listen on the port specified above
app.listen(port, () => {
    console.log('Server is listening')
});