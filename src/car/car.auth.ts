// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import Admin from "../admin/admin.schema";
// import asyncHandler from "express-async-handler";

// interface JwtPayload {
//   id: string;
//   email: string;
//   role: string;
// }

// const authMiddleware = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     console.log(token);
//     if (!token) {
//       res.status(401).json({ message: "Access denied. No token provided." });
//       return;
//     }

//     try {
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECURITY_ACCESS as string
//       ) as JwtPayload;

//       const admin = await Admin.findById(decoded.id).select("-password");

//       if (!admin) {
//         res.status(401).json({ message: "Admin not found" });
//         return;
//       }

//       req.user = admin;
//       // console.log(admin);
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Invalid token." });
//       return;
//     }
//   }
// );

// export default authMiddleware;

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/postgres.connect"; // Import your data source
import { Admin } from "../admin/admin.entity"; // Import your Admin entity
import asyncHandler from "express-async-handler";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    try {
      // Decode the token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECURITY_ACCESS as string
      ) as JwtPayload;

      // Fetch the admin from the database using TypeORM
      const adminRepository = AppDataSource.getRepository(Admin);
      const admin = await adminRepository.findOne({
        where: { _id: decoded.id },
        select: ["_id", "email", "role"], // Exclude sensitive fields like `password`
      });

      if (!admin) {
        res.status(401).json({ message: "Admin not found." });
        return;
      }
      // console.log(admin);
      // Attach the admin to the request object
      req.user = admin;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token." });
    }
  }
);

export default authMiddleware;
