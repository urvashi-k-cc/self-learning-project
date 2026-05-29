import bcrypt from "bcryptjs";

export const hashToken = async (token: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

export const compareToken = async (token: string, hashedToken: string) => {
  return bcrypt.compare(token, hashedToken);
};