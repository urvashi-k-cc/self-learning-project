const forgotPasswordTemplate = (
  name: string,
  resetLink: string
) => {
  return `
    <div>
      <h2>Hello ${name}</h2>

      <p>You requested a password reset.</p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>This link will expire in 10 minutes.</p>
    </div>
  `;
};

export default forgotPasswordTemplate;