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
        host: process.env.RDS_HOSTNAME || 'awseb-e-2yqbexrbpp-stack-awsebrdsdatabase-hzp1prwvk5tc.cwvjinzpnj0e.us-east-2.rds.amazonaws.com',
        user: process.env.RDS_USERNAME || 'postgres',
        password: process.env.RDS_PASSWORD || 'kalm2023',
        database: process.env.RDS_BD_NAME || 'ebdb',
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
        // Fetch data from the database
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
                // Render the admin_data view with the fetched data
                res.render('admin_data', { mytable: user_info });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                res.status(500).send('Internal Server Error');
            });
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

// survey post to post data to the database
// app.post("/survey", (req, res) => {
//     // Assuming req.body.affiliatedOrganizations is not an array but individual fields
//     const affiliatedOrganizations = ['na', 'private', 'school', 'university', 'company', 'government']
//         .map(org => req.body[org] === "on" ? "Y" : "N");

//     const surveyData = {
//         // user_info table
//         age: req.body.age,
//         gender: req.body.gender === "other" ? req.body.otherGender : req.body.gender,
//         relationshipStatus: req.body.relationshipStatus,
//         occupationStatus: req.body.occupationStatus,
//         location: "Provo", // hardcoded as default

//         // sm_usage table
//         usesm: req.body.useSocialMedia === "yes" ? "Y" : "N",
//         facebook: req.body.facebook === "on" ? "Y" : "N",
//         twitter: req.body.twitter === "on" ? "Y" : "N",
//         instagram: req.body.instagram === "on" ? "Y" : "N",
//         youtube: req.body.youtube === "on" ? "Y" : "N",
//         snapchat: req.body.snapchat === "on" ? "Y" : "N",
//         pintrest: req.body.pintrest === "on" ? "Y" : "N",
//         discord: req.body.discord === "on" ? "Y" : "N",
//         reddit: req.body.reddit === "on" ? "Y" : "N",
//         tiktok: req.body.tiktok === "on" ? "Y" : "N",

//         // org_affill table
//         affiliatedOrganizations: affiliatedOrganizations,

//         // question_resp table
//         avgTimeOnSocialMedia: req.body.avgTimeOnSocialMedia,
//         purposelessSocialMedia: req.body.purposelessSocialMedia,
//         distractedBySocialMedia: req.body.distractedBySocialMedia,
//         restlessWithoutSocialMedia: req.body.restlessWithoutSocialMedia,
//         easilyDistracted: req.body.easilyDistracted,
//         botheredByWorries: req.body.botheredByWorries,
//         difficultyConcentrating: req.body.difficultyConcentrating,
//         socialMediaComparisons: req.body.socialMediaComparisons,
//         feelingsAboutComparisons: req.body.feelingsAboutComparisons,
//         seekValidation: req.body.seekValidation,
//         feelingsOfDepression: req.body.feelingsOfDepression,
//         fluctuate: req.body.fluctuate,
//         sleep: req.body.sleep
//     };

//     // Insert data into the database
//     knex.transaction(async (trx) => {
//         // Insert into user_info table
//         const [surveyId] = await trx('user_info').insert({
//             timestamp: knex.fn.now(),
//             age: surveyData.age,
//             gender: surveyData.gender,
//             relationshipstatus: surveyData.relationshipStatus,
//             occupationstatus: surveyData.occupationStatus,
//             location: surveyData.location,
//         }).returning('surveyid');

//         // Insert into org_affill table - use the array index to match 'Y' or 'N' value
//         await trx('org_affill').insert({
//             surveyid: surveyId,
//             na: surveyData.affiliatedOrganizations[0],
//             private: surveyData.affiliatedOrganizations[1],
//             school: surveyData.affiliatedOrganizations[2],
//             university: surveyData.affiliatedOrganizations[3],
//             company: surveyData.affiliatedOrganizations[4],
//             government: surveyData.affiliatedOrganizations[5],
//         });

//         // Insert into sm_usage table
//         await trx('sm_usage').insert({
//             surveyid: surveyId,
//             usesm: surveyData.usesm,
//             facebook: surveyData.facebook,
//             twitter: surveyData.twitter,
//             instagram: surveyData.instagram,
//             youtube: surveyData.youtube,
//             discord: surveyData.discord,
//             reddit: surveyData.reddit,
//             pinterest: surveyData.pintrest, // Corrected typo in property name
//             tiktok: surveyData.tiktok,
//             snapchat: surveyData.snapchat,
//         });

//         // Insert into question_resp table
//         await trx('question_resp').insert({
//             surveyid: surveyId,
//             q8: surveyData.avgTimeOnSocialMedia,
//             q9: surveyData.purposelessSocialMedia,
//             q10: surveyData.distractedBySocialMedia,
//             q11: surveyData.restlessWithoutSocialMedia,
//             q12: surveyData.easilyDistracted,
//             q13: surveyData.botheredByWorries,
//             q14: surveyData.difficultyConcentrating,
//             q15: surveyData.socialMediaComparisons,
//             q16: surveyData.feelingsAboutComparisons,
//             q17

// : surveyData.seekValidation,
//             q18: surveyData.feelingsOfDepression,
//             q19: surveyData.fluctuate,
//             q20: surveyData.sleep,
//         });
//     })
//     .then(() => {
//         console.log('Transaction complete');
//         // Send a response if needed
//         res.status(200).send('Survey data successfully inserted.');
//     })
//     .catch((error) => {
//         console.error('Transaction error:', error);
//         // Handle errors and send an appropriate response
//         res.status(500).send('Internal Server Error');
//     });
// });
app.post("/survey", async (req, res) => {
    const affiliatedOrganizations = ['na', 'private', 'school', 'university', 'company', 'government']
        .map(org => req.body[org] === "on" ? "Y" : "N");

    const surveyData = {
        // user_info table
        age: req.body.age,
        gender: req.body.gender === "other" ? req.body.otherGender : req.body.gender,
        relationshipStatus: req.body.relationshipStatus,
        occupationStatus: req.body.occupationStatus,
        location: "Provo", // hardcoded as default

        // sm_usage table
        usesm: req.body.useSocialMedia === "yes" ? "Y" : "N",
        facebook: req.body.facebook === "on" ? "Y" : "N",
        twitter: req.body.twitter === "on" ? "Y" : "N",
        instagram: req.body.instagram === "on" ? "Y" : "N",
        youtube: req.body.youtube === "on" ? "Y" : "N",
        snapchat: req.body.snapchat === "on" ? "Y" : "N",
        pinterest: req.body.pintrest === "on" ? "Y" : "N",
        discord: req.body.discord === "on" ? "Y" : "N",
        reddit: req.body.reddit === "on" ? "Y" : "N",
        tiktok: req.body.tiktok === "on" ? "Y" : "N",

        // org_affill table
        affiliatedOrganizations: affiliatedOrganizations,

        // question_resp table
        avgTimeOnSocialMedia: req.body.avgTimeOnSocialMedia,
        purposelessSocialMedia: req.body.purposelessSocialMedia,
        distractedBySocialMedia: req.body.distractedBySocialMedia,
        restlessWithoutSocialMedia: req.body.restlessWithoutSocialMedia,
        easilyDistracted: req.body.easilyDistracted,
        botheredByWorries: req.body.botheredByWorries,
        difficultyConcentrating: req.body.difficultyConcentrating,
        socialMediaComparisons: req.body.socialMediaComparisons,
        feelingsAboutComparisons: req.body.feelingsAboutComparisons,
        seekValidation: req.body.seekValidation,
        feelingsOfDepression: req.body.feelingsOfDepression,
        fluctuate: req.body.fluctuate,
        sleep: req.body.sleep
    };

    try {
        // Insert into user_info table
        const [surveyId] = await knex('user_info').insert({
            timestamp: knex.fn.now(),
            age: surveyData.age,
            gender: surveyData.gender,
            relationshipstatus: surveyData.relationshipStatus,
            occupationstatus: surveyData.occupationStatus,
            location: surveyData.location,
        }).returning('surveyid');

        // Insert into org_affill table - use the array index to match 'Y' or 'N' value
        await knex('org_affill').insert({
            surveyid: surveyId,
            na: surveyData.affiliatedOrganizations[0],
            private: surveyData.affiliatedOrganizations[1],
            school: surveyData.affiliatedOrganizations[2],
            university: surveyData.affiliatedOrganizations[3],
            company: surveyData.affiliatedOrganizations[4],
            government: surveyData.affiliatedOrganizations[5],
        });

        // Insert into sm_usage table
        await knex('sm_usage').insert({
            surveyid: surveyId,
            usesm: surveyData.usesm,
            facebook: surveyData.facebook,
            twitter: surveyData.twitter,
            instagram: surveyData.instagram,
            youtube: surveyData.youtube,
            discord: surveyData.discord,
            reddit: surveyData.reddit,
            pinterest: surveyData.pinterest, // Corrected typo in property name
            tiktok: surveyData.tiktok,
            snapchat: surveyData.snapchat,
        });

        // Insert into question_resp table
        await knex('question_resp').insert({
            surveyid: surveyId,
            q8: surveyData.avgTimeOnSocialMedia,
            q9: surveyData.purposelessSocialMedia,
            q10: surveyData.distractedBySocialMedia,
            q11: surveyData.restlessWithoutSocialMedia,
            q12: surveyData.easilyDistracted,
            q13: surveyData.botheredByWorries,
            q14: surveyData.difficultyConcentrating,
            q15: surveyData.socialMediaComparisons,
            q16: surveyData.feelingsAboutComparisons,
            q17: surveyData.seekValidation,
            q18: surveyData.feelingsOfDepression,
            q19: surveyData.fluctuate,
            q20: surveyData.sleep,
        });

        console.log('Survey data successfully inserted.');
        res.status(200).send('Survey data successfully inserted.');
    } catch (error) {
        console.error('Error inserting survey data:', error);
        res.status(500).send('Internal Server Error');
    }
});


//show the data for admins
app.get("/admin_data", (req, res) => {
    // Fetch data from the database
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
            // Render the admin_data view with the fetched data
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