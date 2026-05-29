import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (userId: number,role:string) => {
  return jwt.sign(
    { userId,role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (userId: number) => {
  return jwt.sign(
    { userId },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};
