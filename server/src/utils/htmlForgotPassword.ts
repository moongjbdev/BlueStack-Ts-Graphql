export const htmlTemplateForgotPassword = (resetLink: string) => {
  return `
    <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; 
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }
          .header { color: #333333; font-size: 20px; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007BFF;
                    color: white; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #666666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="header">Reset Your Password</h2>
          <p>Click the button below to create a new password:</p>
          <a href="${resetLink}" class="button">🔑 Click here to change password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p class="footer">© 2024 Your Company. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
};
