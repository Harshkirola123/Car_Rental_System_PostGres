import { Request, Response } from "express";
import {
  registerCarService,
  getCarsService,
  updateCarService,
  deleteCarService,
  getAvailableCarsService,
} from "./car.serviceOrm";
import asyncHandler from "express-async-handler";

// Register a new car (Admin only)
export const registerCar = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, pricePerDay, available } = req.body;
  const adminId = req.user?._id || "";
  console.log(adminId);

  const result = await registerCarService(
    name,
    description,
    pricePerDay,
    available,
    adminId
  );

  res.status(result.status).json(result.data);
});

// Get all cars for the admin
export const getCars = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user?._id || "";

  const result = await getCarsService(adminId);

  res.status(result.status).json(result.data);
});

// Update car details (Admin only)
export const updateCar = asyncHandler(async (req: Request, res: Response) => {
  const { carId } = req.params;
  const { name, description, pricePerDay, available } = req.body;
  const adminId = req.user?._id || "";

  const result = await updateCarService(
    carId,
    name,
    description,
    pricePerDay,
    available,
    adminId
  );

  res.status(result.status).json(result.data);
});

// Delete car (Admin only)
export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
  const { carId } = req.params;
  const adminId = req.user?._id || "";

  const result = await deleteCarService(carId, adminId);

  res.status(result.status).json(result.data);
});

// Get available cars (For all users)
export const getAvailableCars = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getAvailableCarsService();

    res.status(result.status).json(result.data);
  }
);
