import { Request, Response } from "express";
// import { getRepository } from "typeorm";
import { Rental } from "./rental.entity";
import { Car } from "../car/car.entity";
import { AppDataSource } from "../config/postgres.connect";

/**
 * Processes a payment for a rental.
 * @param {Request} req The Express Request object.
 * @param {Response} res The Express Response object.
 * @returns {Promise<void>}
 */
export const processPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const renterId = req.user?._id; // Assuming user details are added to the request object
  const { rentalId } = req.body;

  try {
    const rentalRepository = AppDataSource.getRepository(Rental);
    const carRepository = AppDataSource.getRepository(Car);

    // Find the rental by ID and join with the car and user entities
    const rental = await rentalRepository.findOne({
      where: { id: rentalId },
      relations: ["car", "user"],
    });

    if (!rental) {
      res.status(404).json({ message: "Rental not found" });
      return;
    }

    // Check if the logged-in user is the same as the rental user
    if (renterId?.toString() !== rental.user._id.toString()) {
      res.status(403).json({
        message: "You are not authorized to make the payment for this rental",
      });
      return;
    }

    // Check if the rental is already paid
    if (rental.paymentStatus === "paid") {
      res.status(400).json({ message: "Rental has already been paid" });
      return;
    }

    // Simulate a successful payment process
    const paymentSuccessful = true;

    if (paymentSuccessful) {
      // Update rental payment status and status
      rental.paymentStatus = "paid";
      rental.status = "active";
      await rentalRepository.save(rental);

      // Update car availability
      if (rental.car) {
        rental.car.available = false;
        await carRepository.save(rental.car);
      }

      res
        .status(200)
        .json({ message: "Payment successful, car is now rented", rental });
    } else {
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
