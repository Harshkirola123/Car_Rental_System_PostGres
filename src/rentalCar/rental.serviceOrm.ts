import { Repository } from "typeorm";
import moment from "moment";
import { Rental, RentalHistoryEntry } from "./rental.entity";
import { Car } from "../car/car.entity";
import { Renter } from "../renters/renter.entity";
import { AppDataSource } from "../config/postgres.connect";

// Repositories
const carRepository: Repository<Car> = AppDataSource.getRepository(Car);
const renterRepository: Repository<Renter> =
  AppDataSource.getRepository(Renter);
const rentalRepository: Repository<Rental> =
  AppDataSource.getRepository(Rental);

/**
 * Rent a car service.
 */
export const rentCarService = async (
  renterId: string | undefined,
  carId: string,
  startDate: string,
  endDate: string
) => {
  try {
    // Check if the car exists and is available
    const car = await carRepository.findOne({ where: { id: carId } });
    if (!car) {
      return { status: 404, data: { message: "Car not found" } };
    }
    if (!car.available) {
      return {
        status: 400,
        data: { message: "Car is not available for rental" },
      };
    }

    // Check if the renter exists
    const renter = await renterRepository.findOne({ where: { _id: renterId } });
    if (!renter) {
      return { status: 404, data: { message: "Renter not found" } };
    }

    // Create a rental entry
    const rental = rentalRepository.create({
      user: renter,
      car: car,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "pending",
      paymentStatus: "pending",
      rentalHistory: [],
    });

    await rentalRepository.save(rental);

    // Update car availability
    car.available = false;
    await carRepository.save(car);

    return {
      status: 201,
      data: {
        message: `Car rented successfully. Please proceed to payment.`,
        rental,
      },
    };
  } catch (error) {
    console.error("Error renting car:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

/**
 * Get rental history service.
 */
export const getRentalHistoryService = async (renterId: string | undefined) => {
  try {
    // Fetch rental history for the renter
    const rentalHistory = await rentalRepository.find({
      where: { user: { _id: renterId } },
      relations: ["car", "user"],
    });

    if (rentalHistory.length === 0) {
      return { status: 404, data: { message: "No rental history found" } };
    }

    return {
      status: 200,
      data: {
        message: "Rental history fetched successfully",
        rentals: rentalHistory,
      },
    };
  } catch (error) {
    console.error("Error fetching rental history:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

/**
 * Admin return car service.
 */
export const adminReturnCarService = async (
  adminId: string | undefined,
  rentalId: string,
  returnDate: Date,
  paymentAmount: number
) => {
  try {
    // Fetch rental details
    const rental = await rentalRepository.findOne({
      where: { id: rentalId },
      relations: ["car", "user"],
    });
    if (!rental) {
      return { status: 404, data: { message: "Rental not found" } };
    }

    const car = rental.car;

    // Verify admin authorization
    if (car?.admin?._id !== adminId) {
      return {
        status: 403,
        data: { message: "You are not authorized to return this car" },
      };
    }

    // Calculate payment amount
    const returnMoment = moment(returnDate);
    const startMoment = moment(rental.startDate);
    const daysRented = returnMoment.diff(startMoment, "days") + 1;
    const pricePerDay = car.pricePerDay || 50;
    const totalAmount = daysRented * pricePerDay;

    if (paymentAmount !== totalAmount) {
      return {
        status: 400,
        data: { message: "Payment amount does not match calculated amount" },
      };
    }

    // Update rental and car details
    // rental.status = "completed";
    // rental.paymentStatus = "paid";
    // rental.rentalHistory.push({
    //   startDate: rental.startDate,
    //   endDate: returnDate,
    //   totalAmount,
    // });
    const rentalHistoryEntry = new RentalHistoryEntry();
    rentalHistoryEntry.startDate = rental.startDate;
    rentalHistoryEntry.endDate = returnDate;
    rentalHistoryEntry.totalAmount = totalAmount;
    rental.rentalHistory.push(rentalHistoryEntry);

    car.available = true;

    await rentalRepository.save(rental);
    await carRepository.save(car);

    return {
      status: 200,
      data: {
        message: "Car returned successfully. Payment processed.",
        totalAmount,
        rental,
      },
    };
  } catch (error) {
    console.error("Error returning car by admin:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};
