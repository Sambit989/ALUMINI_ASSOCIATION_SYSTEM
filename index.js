import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import path from "path";
import multer from 'multer'
import moment from "moment";
import { sendMailToAluminiWhenApproved, sendMailToStudent, sendMailToStudentWhenAccepted } from "./sendMail.js";
import { name } from "ejs";
const app = express();
app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 100,
    },
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});
const resume = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/resumes'); // Directory to save uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const res = multer({ storage: resume });
app.set("view engine", "ejs");
const upload = multer({ storage });
const port = 3000;
const saltRounds = 10;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Alimini_Association_System",
  password: "Sam@2004",
  port: 5432,
});
db.connect().then(() => {
  console.log("Database connected");
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.get("/", (req, res) => {
  res.render("landing/home");
});
app.get("/admin_login", (req, res) => {
  res.render("login/admin_login");
});
app.get('/Events', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from event')
    const event = result.rows;

    res.render('event/showEvent', { name: req.user.name, event: event })
  }
})
app.get('/EventsAlumni', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from event')
    const event = result.rows;

    res.render('common_pages/showEvent', { name: req.user.name, event: event })
  }
})
app.get('/adminDashboard', async (req, res) => {
  if (req.isAuthenticated()) {
    const event_count = await db.query("select count(*) from event");
    const eve_count = event_count.rows[0].count;
    const job_count = await db.query("select count(*) from job_post where current_status='Not evaluated by admin'")
    const acepted_job_count = await db.query("select count(*) from job_post where current_status = $1", ["Accepted"])
    const rejected_job_count = await db.query("select count(*) from job_post where current_status = $1", ["Rejected"])
    const alumni_count = await db.query("select count(*) from alumni where status=$1", ["Not evaluated"])



    res.render('admin/index', { name: req.user.name, eve_count: eve_count, job_count: job_count.rows[0].count, approved_job_count: acepted_job_count.rows[0].count, rejected_job_count: rejected_job_count.rows[0].count, alumni_count: alumni_count.rows[0].count })
  } else {
    res.redirect('/')
  }
})
app.get('/register', (req, res) => {
  res.render('login/register')

})
app.get('/showAllAlumni', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query("Select * from alumni where status=$1", ["Not evaluated"])
    res.render('verifyAlumni/showAllAlumni', { alumni: result.rows, name: req.user.name, message: "" })
  } else {
    res.redirect('/')
  }
})
app.get('/approveAlumni/:email', async (req, res) => {
  if (req.isAuthenticated()) {
    await db.query('update alumni set status = $1 where email=$2', ["Approved", req.params.email.substring(1)])
    const name = await db.query('select name from alumni where email=$1', [req.params.email.substring(1)])
    sendMailToAluminiWhenApproved(req.params.email.substring(1), name.rows[0].name)
    res.redirect('/showAllAlumni')
  } else {
    res.redirect('/')
  }
})
app.get('/rejectAlumni/:email', async (req, res) => {
  if (req.isAuthenticated()) {
    await db.query('update alumni set status = $1 where email=$2', ["Rejected", req.params.email.substring(1)])
    res.redirect('/showAllAlumni')

  } else {
    res.redirect('/')
  }
})
app.get('/addSuccessStory', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("successStory/addStory", { name: req.user.name })
  } else {
    res.redirect('/')
  }
})
app.get('/addEvent', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('event/addEvent', { event: {}, name: req.user.name })
  } else {
    res.redirect('/')
  }
})
app.get('/addEventAlumni', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('common_pages/addEvent', { event: {}, name: req.user.name })
  } else {
    res.redirect('/')
  }
})
app.get('/alumniDashboard', async (req, res) => {
  if (req.isAuthenticated()) {
    const event_count = await db.query("select count(*) from event");
    const eve_count = event_count.rows[0].count;
    res.render('alumini/index', { name: req.user.name, eve_count: eve_count, })
  } else {
    res.redirect('/')
  }
})
//Jobs get
app.get('/addJob', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('jobs/addJob', { name: req.user.name });
  } else {
    res.redirect('/')
  }
})
//show job
app.get('/showMyJobs', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from job_post where email=$1', [req.user.email])
    res.render('jobs/showJobs', { name: req.user.name, job: result.rows })
  }
})
app.get('/showSuccessStory', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query("select * from success_story")
    const Fstory = result.rows.map(story => {
      story.timeAgo = moment(story.created_at).fromNow(); // Assuming 'created_at' is the timestamp
      return story;
    });
    res.render("successStory/showStoryAlumni", { name: req.user.name, story: Fstory })
  }
})
app.get('/responces/:id', async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id.substring(1);
    console.log(id);
    const result = await db.query("select * from job_applications where job_id = $1 and hostemail=$2", [id, req.user.email])
    res.render('jobs/responces', { name: req.user.name, job: result.rows })
  } else {
    res.redirect('/')
  }
})
app.get('/showSuccessStoryAdmin', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query("select * from success_story")
    const Fstory = result.rows.map(story => {
      story.timeAgo = moment(story.created_at).fromNow(); // Assuming 'created_at' is the timestamp
      return story;
    });
    res.render("successStory/showStory", { name: req.user.name, story: Fstory })
  }
})
//verify jobs
app.get('/verifyJobs', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query("select * from job_post where current_status = 'Not evaluated by admin'");
    res.render('jobs/verifyJobs', { name: req.user.name, job: result.rows })
  } else {
    res.redirect('/')
  }
})
//student routes
app.get('/StudentDashboard', async (req, res) => {
  if (req.isAuthenticated) {
    const event = await db.query('select count(*) from event');
    const jobs = await db.query('select count(*) from job_post where current_status =$1', ['Accepted'])
    const eve_count = event.rows[0].count;
    const job_count = jobs.rows[0].count;
    res.render('student/index', { eve_count: eve_count, job_count: job_count, name: req.user.name })
  } else {
    res.redirect('/')
  }
})
app.get('/student_login', (req, res) => {
  res.render('login/student_login')
})
app.get('/studentRegister', (req, res) => {
  res.render('login/studentRegister')
})
app.post('/studentRegister', upload.single('pic'), async (req, res) => {
  const { fullname, collegeid, gender, batch, password, email } = req.body;
  try {
    const pic = req.file.filename;
    await db.query('insert into student(name,roll_no,password,profile_pic,gender,batch,email) values($1,$2,$3,$4,$5,$6,$7)', [fullname, collegeid, password, pic, gender, batch, email])
    res.redirect('/student_login')
  } catch (err) {
    res.send(err.detail)
  }
})
app.get('/EventStudent', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from event')
    res.render('event/eventStudent', { name: req.user.name, event: result.rows })
  } else {
    res.redirect('/')
  }
})
app.get('/showSuccessStoryStudent', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query("select * from success_story")
    const Fstory = result.rows.map(story => {
      story.timeAgo = moment(story.created_at).fromNow(); // Assuming 'created_at' is the timestamp
      return story;
    });
    res.render("successStory/showSuccessStoryStudent", { name: req.user.name, story: Fstory })
  } else {
    res.redirect('/')
  }
})
app.get('/showJobs', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from job_post')
    res.render('jobs/jobsStudent', { name: req.user.name, job: result.rows })
  } else {
    res.redirect('/')
  }
})
app.get('/apply/:id', async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id.substring(1);
    const jobs = await db.query('select * from job_post where id = $1', [id])
    res.render('jobs/applyjob', { name: req.user.name, user: req.user, job: jobs.rows[0] })
  } else {
    res.redirect('/')
  }
})
//acept/reject routes
app.get('/acept/:id/:app_Id', async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    const app_id = req.params.app_Id;

    try {
      console.log(id, app_id);

      await db.query("UPDATE job_applications SET status = $1 WHERE application_id = $2", ["Accepted", id]);
      const job_detail = await db.query("select * from job_post where id=$1", [app_id])
      const applicant = await db.query("select * from job_applications where application_id=$1", [id])
      const alumni = await db.query("select * from alumni where email=$1", [job_detail.rows[0].email])
      sendMailToStudentWhenAccepted(job_detail.rows[0], applicant.rows[0], alumni.rows[0])
      res.redirect(`/responces/:${app_id}`)

    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect('/');
  }
});
app.get('/reject/:id/:app_Id', async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    const app_id = req.params.app_Id;

    try {
      console.log(id, app_id);

      await db.query("UPDATE job_applications SET status = $1 WHERE application_id = $2", ["Rejected", id]);
      res.redirect(`/responces/:${app_id}`)

    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect('/');
  }
});


//Accept reject Job by admin
app.get('/acceptJob/:id/', async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    try {
      // Update the job status
      await db.query("UPDATE job_post SET current_status = $1 WHERE id = $2", ["Accepted", id]);

      // Fetch job details
      const result = await db.query('SELECT title, company_name, location FROM job_post WHERE id = $1', [id]);

      // Fetch student emails
      const studentMails = await db.query("SELECT email FROM student");

      // Extract email list
      const emailList = studentMails.rows.map(obj => obj.email);

      // Send email to students
      await sendMailToStudent(emailList, result.rows[0].title, result.rows[0].company_name, result.rows[0].location);

      // Redirect to verifyJobs
      res.redirect(`/verifyJobs`);

    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect('/');
  }
});

app.get('/rejectJob/:id/', async (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;

    try {
      await db.query("UPDATE job_post SET current_status = $1 WHERE id = $2", ["Rejected", id]);
      res.redirect(`/verifyJobs`)

    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect('/');
  }
});
//show accepted jobs to admin
app.get('/showAcceptedJobs', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from job_post where current_status = $1', ["Accepted"])
    res.render('jobs/showAcceptedJobs', { job: result.rows, name: req.user.name })
  } else {
    res.redirect('/')
  }
})
app.get('/showRejectedJobs', async (req, res) => {
  if (req.isAuthenticated()) {
    const result = await db.query('select * from job_post where current_status = $1', ["Rejected"])
    res.render('jobs/showAcceptedJobs', { job: result.rows, name: req.user.name })
  } else {
    res.redirect('/')
  }
})
//student post routes
app.post('/apply', res.single('resume'), async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const jobId = req.query.id;
      const hostEmail = req.query.email;
      // Access other form fields from req.body
      const linkedInProfile = req.body.linkedin;
      const gitHubProfile = req.body.github;
      const availability = req.body.availability;
      const answer = req.body.answer;
      const email = req.body.email;
      const resumeFile = req.file.filename;
      const insertApplicationQuery = `
            INSERT INTO job_applications (job_id, hostEmail, linkedin_profile, github_profile, availability, answer, resume,applicant_name,applicant_email)
            VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9)
        `;
      const values = [jobId, hostEmail, linkedInProfile, gitHubProfile, availability, answer, resumeFile, req.user.name, email];

      await db.query(insertApplicationQuery, values);

      res.redirect('/showJobs')
    } catch (error) {
      console.error('Error processing application:', error);
      res.status(500).send('An error occurred while processing your application.');
    }
  } else {
    res.redirect('/')
  }
});
app.get('/alumni_login', (req, res) => {
  res.render('login/alumini_login', { message: "" })
})
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
//post routes
app.post(
  "/createEvent",
  upload.single("eventImage"),
  async (req, res) => {
    try {
      const { title, location, host, Date, time, description } = req.body;
      const eventImage = req.file.filename;


      const result = await db.query(
        "INSERT INTO event (title, venue, host_name, event_time, event_description, event_pic,event_date) VALUES ($1, $2, $3, $4, $5, $6,$7)",
        [title, location, host, time, description, eventImage, Date]
      );
      res.redirect("/Events");
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).send("Internal Server Error");
    }
  }

);
app.post(
  "/createEventAlumni",
  upload.single("eventImage"),
  async (req, res) => {
    try {
      const { title, location, host, Date, time, description } = req.body;
      const eventImage = req.file.filename;


      const result = await db.query(
        "INSERT INTO event (title, venue, host_name, event_time, event_description, event_pic,event_date) VALUES ($1, $2, $3, $4, $5, $6,$7)",
        [title, location, host, time, description, eventImage, Date]
      );
      res.redirect("/EventsAlumni");
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).send("Internal Server Error");
    }
  }

);
app.post('/addSuccessStory', upload.single("storyImage"), async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const { title, description } = req.body;
      const storyImage = req.file ? req.file.filename : null; // Handle cases where no file is uploaded

      // Ensure all parameters are included in the query
      const result = await db.query(
        `INSERT INTO success_story (name, passout, story, success_story_image, email, title,profile_pic) VALUES ($1, $2, $3, $4, $5, $6,$7)`,
        [req.user.name, req.user.passout, description, storyImage, req.user.email, title, req.user.profile_pic]
      );

      res.redirect('/showSuccessStory');
    } catch (err) {
      console.error('Error adding success story:', err); // Log the error
      res.status(500).send('Internal Server Error'); // Send an error response
    }
  } else {
    res.redirect('/login'); // Redirect to login if not authenticated
  }
});
app.post('/addJob', async (req, res) => {
  if (req.isAuthenticated()) {
    const { jobTitle, companyName, location, vacancy, jobDescription, jobType } = req.body;
    const result = await db.query('insert into job_post(title,company_name,location,vacancy,description,job_type,email,posted_by) values($1,$2,$3,$4,$5,$6,$7,$8)',
      [jobTitle, companyName, location, vacancy, jobDescription, jobType, req.user.email, req.user.name]
    )
    res.redirect('/showMyJobs')
  } else {
    res.redirect('/')
  }
})
app.post('/register', upload.single('pic'), async (req, res) => {
  try {
    const { fullname, collegeid, gender, batch, companyname, email, password, about } = req.body;
    const pic = req.file ? req.file.filename : null;

    const result = await db.query('SELECT * FROM alumni WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      await db.query("INSERT INTO alumni (email, name, password, profile_pic, passout, current_job, about, gender,collegeid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)",
        [email, fullname, password, pic, batch, companyname, about, gender, collegeid]
      );
    }

    res.redirect('/alumni_login'); // Only one redirect call here

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.post(
  "/login",
  passport.authenticate("admin", {
    successRedirect: "/adminDashboard",
    failureRedirect: "/admin_login",
  })
);
// app.post("StudentDashboard/changepassword", (req,res)=>{
//   const password1=req.user.currentPassword;

// }

//);
app.post('/alu_login', (req, res, next) => {
  passport.authenticate('alumni', (err, user, info) => {
    if (err) {
      return next(err); // If there's an error, pass it to the next middleware
    }
    if (!user) {
      // If authentication fails, redirect to the login page with a message
      return res.render('login/alumini_login', { message: info.message })
    }
    // If authentication succeeds, log the user in
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // Redirect to the alumni dashboard on successful login
      return res.redirect('/alumniDashboard');
    });
  })(req, res, next);
});

app.post(
  "/student_login",
  passport.authenticate("student", {
    successRedirect: "/StudentDashboard",
    failureRedirect: "/student_login",
  })
);
passport.use(
  "admin",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query(
        "SELECT * FROM admin WHERE collegeid = $1 ",
        [username]
      );


      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        if (storedHashedPassword == password) return cb(null, user);
        else return cb(null, false);
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);
passport.use(
  "alumni",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query(
        "SELECT * FROM alumni WHERE email = $1 ",
        [username]
      );
      if (result.rows[0].status == 'Not evaluated') {
        return cb(null, false, { message: "You are not approved by Admin. Kindly contact admin@college.edu" });
      } else if (result.rows[0].status == "Rejected") {
        return cb(null, false, { message: "Your request was rejected by Admin. Kindly contact admin@college.edu" });

      }
      else {
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          if (storedHashedPassword == password) return cb(null, user);
          else return cb(null, false);
        } else {
          return cb("User not found");
        }
      }
    } catch (err) {
      console.log(err);
    }
  })
);
passport.use(
  "student",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query(
        "SELECT * FROM student WHERE roll_no = $1 ",
        [username]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        if (storedHashedPassword == password) return cb(null, user);
        else return cb(null, false);
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});
app.listen(port, () => {
  console.log("Server is running on port ", port);
});


app.get('/changePassword', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('login/changePassword', { name: req.user.name });
  } else {
    res.redirect('/');
  }
});




// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/changePassword', async (req, res) => {
  if (req.isAuthenticated()) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let tableName = '';

    try {
      // Check if the user exists in 'alumni' or 'student' table
      const result1 = await db.query('SELECT email FROM alumni WHERE email = $1', [req.user.email]);
      const result2 = await db.query('SELECT email FROM student WHERE email = $1', [req.user.email]);
      
      if (result1.rows.length > 0) {
        tableName = 'alumni';
      } else if (result2.rows.length > 0) {
        tableName = 'student';
      } else {
        return res.status(404).send('User not found');
      }

      // Fetch the stored password
      const result = await db.query(`SELECT password FROM ${tableName} WHERE email = $1`, [req.user.email]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).send('User not found');
      }

      console.log('User found:', user);
      console.log('Fetched password:', user.password);

      // Compare the old password (Plaintext comparison)
      if (currentPassword !== user.password) {
        return res.status(400).send('Incorrect old password');
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).send('New password and confirm password do not match');
      }

      // Update the password in the correct table
      await db.query(`UPDATE ${tableName} SET password = $1 WHERE email = $2`, [newPassword, req.user.email]);

      // Log out the user after password change
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });

    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).send('Internal server error');
    }
  } else {
    res.redirect('/');
  }
});
