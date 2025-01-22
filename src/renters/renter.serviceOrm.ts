import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { Renter } from "./renter.entity";
import {
  createAccessToken,
  createRefreshToken,
} from "../common/helper/token.helper";
import { AppDataSource } from "../config/postgres.connect"; // Ensure the correct DataSource

// Admin repository
const renterRepository: Repository<Renter> =
  AppDataSource.getRepository(Renter);

/**
 * Signup admin service
 *
 * @param {string} name - Admin name
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} [role=ADMIN] - Admin role
 * @returns {Promise<object>}
 */
export const renterSignupService = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    // Check if admin already exists
    const existingRenter = await renterRepository.findOne({ where: { email } });
    if (existingRenter) {
      return { status: 400, data: { message: "Admin already exists" } };
    }

    // Create new admin
    const renter = renterRepository.create({
      name,
      email,
      password,
      active: true,
    });

    // Save the admin to the database
    await renterRepository.save(renter);

    // Generate tokens
    const accessToken = createAccessToken(renter);
    const refreshToken = createRefreshToken(renter);

    return {
      status: 201,
      token: refreshToken,
      data: {
        message:
          "Admin created successfully. Please complete your KYC to use other functionality.",
        token: accessToken,
        refreshToken: refreshToken,
        admin: {
          id: renter._id,
          name: renter.name,
          email: renter.email,
          role: renter.role,
        },
      },
    };
  } catch (error) {
    console.error("Error signing up admin:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};

/**
 * Login admin service
 *
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<object>}
 */
export const renterLoginService = async (email: string, password: string) => {
  try {
    // Find admin by email
    const renter = await renterRepository.findOne({ where: { email } });
    if (!renter) {
      return { status: 400, data: { message: "Invalid credentials" } };
    }
    // console.log(renter);
    // Compare the password
    const isMatch = await bcrypt.compare(password, renter.password);
    // console.log(typeof renter.password);
    if (!isMatch) {
      return { status: 400, data: { message: "Invalid credentials" } };
    }

    // Generate tokens
    const accessToken = createAccessToken(renter);
    const refreshToken = createRefreshToken(renter);

    return {
      status: 200,
      token: refreshToken,
      data: {
        message: "Login successful",
        accessToken,
        refreshToken: refreshToken,
        renter: {
          id: renter._id,
          name: renter.name,
          email: renter.email,
          role: renter.role,
          kycStatus: renter.kycCompleted,
        },
      },
    };
  } catch (error) {
    console.error("Error logging in admin:", error);
    throw new Error("Server error");
  }
};
