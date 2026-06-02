import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";
import { hashpassword, compareHashedPassword } from "../utils/hashedPassword";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { sendMail } from "../utils/sendMail";
import crypto from "crypto";
import { hashToken, compareToken } from "../utils/token";

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const userRepository = AppDataSource.getRepository(User);
const frontendResetUrl = process.env.FRONTEND_RESET_URL
console.log("frontendResetUrl", frontendResetUrl)

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

/* REGISTER*/
export const UserRegisterService = async (data: CreateUserData) => {
  const existinguser = await userRepository.findOneBy({ email: data.email });
  if (existinguser) throw new Error("User already exists");

  const hashedPassword = await hashpassword(data.password);
  const user = userRepository.create({ ...data, password: hashedPassword });
  console.log(user)
  await userRepository.save(user);
  return user;
};

/* LOGIN */
export const UserLoginService = async (email: string, password: string) => {
  const user = await userRepository.findOneBy({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await compareHashedPassword(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  console.log("frontendResetUrl", frontendResetUrl)

  const accessToken = generateAccessToken(user.id,user.role);
  const refreshToken = generateRefreshToken(user.id);

  const hashedRefreshToken = await hashToken(refreshToken);

  user.refreshTokenHash = hashedRefreshToken;
  await userRepository.save(user);

  return { accessToken, refreshToken, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role } };
};

/* REFRESH ACCESS TOKEN */
export const UserRefreshTokenService = async (refreshToken: string) => {
  let decoded: { userId: number };

  try {
    decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { userId: number };
  } catch {
    throw new Error("Invalid refresh token");
  }

  const user = await userRepository.findOneBy({ id: decoded.userId });

  if (!user?.refreshTokenHash) {
    throw new Error("Invalid refresh token");
  }

  const isValid = await compareToken(refreshToken, user.refreshTokenHash);
  if (!isValid) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);

  user.refreshTokenHash = await hashToken(newRefreshToken);
  await userRepository.save(user);

  return { accessToken, refreshToken: newRefreshToken };
};
/* FORGOT PASSWORD*/
export const UserForgotPasswordService = async (email: string) => {
  const user = await userRepository.findOneBy({ email });
  if (!user) return { message: "If your email is registered, reset link will be sent." };
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await userRepository.save(user);

  // const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  const resetUrl = `${frontendResetUrl}/reset-password/${resetToken}`;

  await sendMail({
    to: user.email,
    subject: "Reset Your Password",
    html: `<h2>Password Reset</h2><p>Click here: <a href="${resetUrl}">${resetUrl}</a></p><p>Valid for 15 minutes.</p>`,
  });

  return { message: "Reset link sent" };
};

/* RESET PASSWORD */
export const UserResetPasswordService = async (token: string, password: string) => {
  if (!token) throw new Error("Token is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userRepository
    .createQueryBuilder("user")
    .where("user.resetPasswordToken = :hashedToken", { hashedToken })
    .andWhere("user.resetPasswordExpires > :now", { now: new Date() })
    .getOne();

  if (!user) throw new Error("Invalid or expired token");

  const hashedPassword = await hashpassword(password);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await userRepository.save(user);
  return { message: "Password reset successful" };
};

export const UserProfileService = async (userId: number) => {
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) throw new Error("User not found");
  return { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role };
}