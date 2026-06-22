const nodemailer = require("nodemailer");

async function sendResetEmail(toEmail, resetToken) {
  let transporter;

  // Use Gmail if configured, otherwise fallback to Ethereal test account
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password') {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Generate a test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  let info = await transporter.sendMail({
    from: '"TaskFlow Support" <support@taskflow.local>',
    to: toEmail,
    subject: "TaskFlow - Password Reset",
    text: `You requested a password reset. Click this link to reset it: ${resetUrl}`,
    html: `
      <div style="font-family: sans-serif; max-w-md; margin: auto;">
        <h2>Password Reset</h2>
        <p>We received a request to reset your TaskFlow password.</p>
        <a href="${resetUrl}" style="display:inline-block; padding: 10px 20px; background: #3525cd; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("-----------------------------------------");
  console.log("EMAIL SENT! View it in your browser here:");
  console.log(previewUrl);
  console.log("-----------------------------------------");
  
  return previewUrl;
}

async function sendDeadlineReminderEmail(toEmail, itemName, itemType, dueDate) {
  let transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'your_gmail_app_password') {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const loginUrl = `http://localhost:3000/login`;

  let info = await transporter.sendMail({
    from: '"TaskFlow Support" <support@taskflow.local>',
    to: toEmail,
    subject: `TaskFlow - Approaching Deadline for ${itemType}: ${itemName}`,
    text: `Your ${itemType} "${itemName}" is due on ${new Date(dueDate).toLocaleDateString()}. Please check your TaskFlow dashboard.`,
    html: `
      <div style="font-family: sans-serif; max-w-md; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background: #3525cd; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">TaskFlow Reminder</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hi there,</p>
          <p>This is a quick reminder that your <strong>${itemType}</strong> is approaching its deadline.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 5px 0;"><strong>Name:</strong> ${itemName}</p>
            <p style="margin: 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${loginUrl}" style="display:inline-block; padding: 12px 25px; background: #3525cd; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
        <div style="background: #fafafa; padding: 15px; text-align: center; font-size: 12px; color: #888;">
          <p style="margin: 0;">This is an automated reminder from TaskFlow.</p>
        </div>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("-----------------------------------------");
  console.log(`REMINDER EMAIL SENT TO ${toEmail}! View it here:`);
  console.log(previewUrl);
  console.log("-----------------------------------------");
  
  return previewUrl;
}

module.exports = { sendResetEmail, sendDeadlineReminderEmail };
