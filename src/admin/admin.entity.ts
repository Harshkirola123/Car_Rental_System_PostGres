import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Car } from "../car/car.entity"; // Ensure Car entity is defined

@Entity("admins") // Table name in the database
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  email!: string;

  @Column({ type: "varchar", nullable: false })
  password!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @Column({
    type: "enum",
    enum: ["USER", "ADMIN"],
    default: "ADMIN",
  })
  role!: "USER" | "ADMIN";

  @Column({ type: "boolean", default: false })
  kycCompleted!: boolean;

  @Column({ type: "varchar", nullable: true })
  kycPhoto!: string;

  @OneToMany(() => Car, (car) => car.admin, { cascade: true })
  carsManaged!: Car[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
