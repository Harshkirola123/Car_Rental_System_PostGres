import { Request, Response, NextFunction } from "express";
import { Renter } from "../../renters/renter.entity";
import { Admin } from "../../admin/admin.entity";
import { AppDataSource } from "../../config/postgres.connect";

/**
 * Middleware to check if the user has completed KYC or not.
 *
 * This middleware is used to check if the user has completed KYC before
 * allowing them to perform certain actions.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next middleware or route handler
 *
 * @throws {Response} If the user is not found, it will return a 404 response.
 * @throws {Response} If the user has not completed KYC, it will return a 403 response.
 * @throws {Response} If there is an error, it will return a 500 response.
 */
export const checkKYC = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id;
  const userRole = req.user?.role;
  const userRepository = AppDataSource.getRepository(Renter);
  const adminRepository = AppDataSource.getRepository(Admin);

  let userEntity;

  if (userRole === "USER") {
    userEntity = await userRepository.findOne({ where: { _id: userId } });
  } else if (userRole === "ADMIN") {
    userEntity = await adminRepository.findOne({ where: { _id: userId } });
  }

  if (!userEntity) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (!userEntity.kycCompleted) {
    res.status(403).json({
      message:
        "KYC is not completed. Please complete KYC to proceed with this action.",
    });
    return;
  }
  next();
};
