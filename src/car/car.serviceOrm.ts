// import { getRepository } from "typeorm";
import { AppDataSource } from "../config/postgres.connect";
import { Car } from "./car.entity";
import { Admin } from "../admin/admin.entity";

// Register a new car (Admin only)
export const registerCarService = async (
  name: string,
  description: string,
  pricePerDay: number,
  available: boolean = true,
  adminId: string | undefined
) => {
  try {
    const adminRepository = AppDataSource.getRepository(Admin);
    const carRepository = AppDataSource.getRepository(Car);

    const admin = await adminRepository.findOne({ where: { _id: adminId } });
    if (!admin) {
      return { status: 400, data: { message: "Admin not found" } };
    }

    const car = carRepository.create({
      name,
      description,
      pricePerDay,
      available,
      admin,
    });

    await carRepository.save(car);

    return {
      status: 201,
      data: { message: "Car created successfully", car },
    };
  } catch (error) {
    console.error("Error creating car:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

// Get all cars for the admin
export const getCarsService = async (adminId: string) => {
  try {
    const carRepository = AppDataSource.getRepository(Car);
    const cars = await carRepository.find({
      where: { admin: { _id: adminId } },
    });

    return {
      status: 200,
      data: { cars },
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

// Update car details (Admin only)
export const updateCarService = async (
  carId: string,
  name: string,
  description: string,
  pricePerDay: number,
  available: boolean,
  adminId: string
) => {
  try {
    const carRepository = AppDataSource.getRepository(Car);
    // const car = await carRepository.findOne(carId, { relations: ["admin"] });
    const car = await carRepository.findOne({
      where: { id: carId },
      relations: ["admin"],
    });

    if (!car) {
      return { status: 404, data: { message: "Car not found" } };
    }

    if (car.admin._id !== adminId) {
      return {
        status: 403,
        data: { message: "You are not authorized to update this car" },
      };
    }

    // Update car details
    car.name = name ?? car.name;
    car.description = description ?? car.description;
    car.pricePerDay = pricePerDay ?? car.pricePerDay;
    car.available = available ?? car.available;

    await carRepository.save(car);

    return {
      status: 200,
      data: { message: "Car updated successfully", car },
    };
  } catch (error) {
    console.error("Error updating car:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

// Delete car (Admin only)
export const deleteCarService = async (carId: string, adminId: string) => {
  try {
    const carRepository = AppDataSource.getRepository(Car);
    // const car = await carRepository.findOne(carId, { relations: ["admin"] });
    const car = await carRepository.findOne({
      where: { id: carId },
      relations: ["admin"],
    });

    if (!car) {
      return { status: 404, data: { message: "Car not found" } };
    }

    if (car.admin._id !== adminId) {
      return {
        status: 403,
        data: { message: "You are not authorized to delete this car" },
      };
    }

    await carRepository.delete(carId);

    return {
      status: 200,
      data: { message: "Car deleted successfully" },
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

// Get available cars (For all users)
export const getAvailableCarsService = async () => {
  try {
    const carRepository = AppDataSource.getRepository(Car);
    const availableCars = await carRepository.find({
      where: { available: true },
      relations: ["admin"],
      select: {
        createdAt: false,
        updatedAt: false,
        admin: {
          name: true,
          email: true,
          role: true,
        },
      },
    });

    if (availableCars.length === 0) {
      return {
        status: 404,
        data: { message: "No cars available at the moment" },
      };
    }

    return {
      status: 200,
      data: {
        message: "Available cars fetched successfully",
        cars: availableCars,
      },
    };
  } catch (error) {
    console.error("Error fetching available cars:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};
