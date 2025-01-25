import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();


function sendMailToAluminiWhenApproved(email, name) {
  const mailPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome to the Alumni Association Platform!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .email-container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
            font-size: 24px;
        }
        p {
            line-height: 1.6;
        }
        .cta-button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Welcome to the Alumni Association Platform!</h1>

        <p>Dear ${name},</p>

        <p>Congratulations! Your registration has been approved, and you are now a member of the [College Name] Alumni Association.</p>

        <p>You can now log in to the alumni platform using your registered email and explore various features, including:</p>

        <ul>
            <li>Connecting with fellow alumni</li>
            <li>Updating your profile</li>
            <li>Participating in events</li>
            <li>Contributing through the donation portal</li>
        </ul>

        <p>Visit the platform here: <a href="[Platform URL]" class="cta-button">Access Alumni Platform</a></p>

        <p>We look forward to your active participation!</p>

        <p>Best regards,<br>
        <br>
        Alumni Association Team<br>
        <div class="footer">
            <p>If you have any questions, please contact us at [Contact Information].</p>
        </div>
    </div>
</body>
</html>`
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "",
      pass: "",
    },
  });
  const mailOptions = {
    from: {
      name: "Alumni Association System",
      address: "",
    },
    to: [
      email,
    ], // list of receivers
    subject: "Regarding Mail Approval by Admin", // Subject line
    text: "", // plain text body
    html: mailPage,
  };
  sendMail(transporter, mailOptions);
}
function sendMailToStudent(email, jobTitle, companyName, location) {
  const mailPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Job Alert: Explore Latest Opportunities</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .email-container {
            background-color: #ffffff;
            padding: 25px;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #ddd;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #1a1a1a;
            font-size: 20px;
            margin-bottom: 15px;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 10px;
        }
        p {
            line-height: 1.5;
            margin-bottom: 15px;
        }
        ul {
            margin: 0;
            padding: 0;
            list-style-type: none;
        }
        ul li {
            margin-bottom: 10px;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 25px;
            margin-top: 20px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>New Job Alert: Explore Latest Opportunities</h1>

        <p>Dear Student,</p>

        <p>We are pleased to announce a new job alert that has been posted on our website. This is a great opportunity for you to advance your career.</p>

        <p><strong>Details of the New Job Posting:</strong></p>
        <ul>
            <li><strong>Job Title:</strong> ${jobTitle}</li>
            <li><strong>Company:</strong> ${companyName}</li>
            <li><strong>Location:</strong> ${location}</li>
        </ul>

        <p>To view this opportunity and explore other available positions, please visit our job portal. Act quickly to make the most of this chance!</p>

        <p><a href="[Job Portal URL]" class="cta-button">Visit the Job Portal</a></p>

        <p>If you have any questions or need assistance with your application, do not hesitate to contact us.</p>

        <p>Best regards,<br>
        <p>Alumini Association System</p>

        <div class="footer">
            <p>If you need further assistance, please reach out to us at [Your Contact Information].</p>
        </div>
    </div>
</body>
</html>`
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "",
      pass: "",
    },
  });
  const mailOptions = {
    from: {
      name: "Alumni Association System",
      address: "",
    },
    to: [
      email,
    ], // list of receivers
    subject: "Regarding new Job post Alert", // Subject line
    text: "", // plain text body
    html: mailPage,
  };
  sendMail(transporter, mailOptions);
}
function sendMailToStudentWhenAccepted(job, applicant, alumni) {
  const mailPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e0e0e0;
            overflow: hidden;
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            border-bottom: 4px solid #0056b3;
        }
        .content {
            padding: 20px;
            color: #333333;
            line-height: 1.6;
        }
        .content p {
            margin: 0 0 15px;
        }
        .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #ddd;
            margin-top: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            background-color: #f4f4f7;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #555555;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
    <title>Your Details Have Been Verified</title>
</head>
<body>
    <div class="email-container">
        <div class="header">
            Your Details Have Been Verified by an Alumnus
        </div>
        <div class="content">
            <p>Dear ${applicant.applicant_name},</p>
            
            <p>I hope this message finds you well.</p>

            <p>I am pleased to inform you that your details have been successfully verified for job role ${job.title}. This verification process confirms the accuracy of the academic records, achievements, and references you provided.</p>
            
            <p>If you need any further assistance or additional information regarding the verification process, please feel free to reach out directly to the alumnus who facilitated this verification. They are available to assist you with any queries or provide further support as needed.</p>
            
            <p>Thank you for your patience throughout this process, and congratulations on successfully completing this important step.</p>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p>${alumni.name}</p>
            <p>${alumni.current_job}</p>
        </div>
    </div>
</body>
</html>`
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "",
      pass: "",
    },
  });
  const mailOptions = {
    from: {
      name: "Alumni Association System",
      address: "",
    },
    to: [
      applicant.applicant_email,
    ], // list of receivers
    subject: `Congratulation Your Request is Accepted for Job role ${job.title} in ${alumni.current_job} `, // Subject line
    text: "", // plain text body
    html: mailPage,
  };
  sendMail(transporter, mailOptions);
}
const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

export { sendMailToAluminiWhenApproved, sendMailToStudent, sendMailToStudentWhenAccepted }