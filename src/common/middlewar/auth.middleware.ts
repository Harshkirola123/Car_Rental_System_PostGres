import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Renter } from "../../renters/renter.entity";
import { AppDataSource } from "../../config/postgres.connect";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Middleware to authenticate users using JWT tokens.
 *
 * This middleware extracts the JWT token from the Authorization header,
 * verifies the token, and retrieves the user from the database. If the
 * token is invalid or the user is not found, it returns an appropriate
 * error response.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware or route handler
 */
const UserAuthMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECURITY_ACCESS as string
      ) as JwtPayload;
      const renterRepository = AppDataSource.getRepository(Renter);
      const renter = await renterRepository.findOne({
        where: { _id: decoded.id },
        select: ["_id", "email", "role"], // Exclude sensitive fields like `password`
      });

      if (!renter) {
        res.status(401).json({ message: "Renter not found." });
        return;
      }

      req.user = renter;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token." });
      return;
    }
  }
);

export default UserAuthMiddleware;
