import { DataSource } from "typeorm";

import { loadConfig } from "./config.env";
import { Car } from "../car/car.entity";
import { Admin } from "../admin/admin.entity";
import { Renter } from "../renters/renter.entity";
import { Rental, RentalHistoryEntry } from "../rentalCar/rental.entity";
import path from "path";
loadConfig();
console.log(path.join(__dirname + "/../migrations/*.{ts,js}"));

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "car_rental_system",
  synchronize: false,
  logging: false,
  entities: [Car, Admin, Renter, Rental, RentalHistoryEntry],
  migrations: [path.join(__dirname + "/../migration/*.{ts,js}")],
});
export const dbConnection = () => {
  AppDataSource.initialize()
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.error("Database connection failed", err);
    });
};
