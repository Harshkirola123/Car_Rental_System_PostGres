import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Admin } from "../../admin/admin.entity";
import { AppDataSource } from "../../config/postgres.connect";
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * This middleware checks if the user making the request is an admin and if so, attaches the User object to the request.
 * If the user is not an admin, it returns a 403 Forbidden status.
 * If the token is invalid, it returns a 401 Unauthorized status.
 * If the token is valid but the user is not an admin, it returns a 403 Forbidden status.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware or route handler
 */
const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }
  // console.log(token);
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECURITY_ACCESS as string
    ) as JwtPayload;

    const adminRepository = AppDataSource.getRepository(Admin);

    const admin = await adminRepository.findOne({
      where: { _id: decoded.id },
      select: ["_id", "email", "role"], // Exclude sensitive fields like `password`
    });

    if (!admin) {
      res.status(401).json({ message: "Admin not found." });
      return;
    }

    // Attach the admin to the request object
    req.user = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
    return;
  }
};

export default adminOnly;
