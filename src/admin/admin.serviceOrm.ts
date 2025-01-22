import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { Admin } from "./admin.entity";
import {
  createAccessToken,
  createRefreshToken,
} from "../common/helper/token.helper";
import { AppDataSource } from "../config/postgres.connect"; // Ensure the correct DataSource

// Admin repository
const adminRepository: Repository<Admin> = AppDataSource.getRepository(Admin);

/**
 * Signup admin service
 *
 * @param {string} name - Admin name
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @param {string} [role=ADMIN] - Admin role
 * @returns {Promise<object>}
 */
export const signupAdminService = async (
  name: string,
  email: string,
  password: string,
  role: string = "ADMIN"
) => {
  try {
    // Check if admin already exists
    const existingAdmin = await adminRepository.findOne({ where: { email } });
    if (existingAdmin) {
      return { status: 400, data: { message: "Admin already exists" } };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = adminRepository.create({
      name,
      email,
      password: hashedPassword,
      active: true,
    });

    // Save the admin to the database
    await adminRepository.save(admin);

    // Generate tokens
    const accessToken = createAccessToken(admin);
    const refreshToken = createRefreshToken(admin);

    return {
      status: 201,
      token: refreshToken,
      data: {
        message:
          "Admin created successfully. Please complete your KYC to use other functionality.",
        token: accessToken,
        refreshToken: refreshToken,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
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
export const loginAdminService = async (email: string, password: string) => {
  try {
    // Find admin by email
    const admin = await adminRepository.findOne({ where: { email } });
    if (!admin) {
      return { status: 400, data: { message: "Invalid credentials" } };
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return { status: 400, data: { message: "Invalid credentials" } };
    }

    // Generate tokens
    const accessToken = createAccessToken(admin);
    const refreshToken = createRefreshToken(admin);

    return {
      status: 200,
      token: refreshToken,
      data: {
        message: "Login successful",
        accessToken,
        refreshToken: refreshToken,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          kycStatus: admin.kycCompleted,
        },
      },
    };
  } catch (error) {
    console.error("Error logging in admin:", error);
    return { status: 500, data: { message: "Server error" } };
  }
};
