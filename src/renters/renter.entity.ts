import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";
import { IUser } from "../common/dto/user.dto";
import { Rental } from "../rentalCar/rental.entity";

@Entity("renters") // Table name in the database
export class Renter implements IUser {
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({
    type: "text",
    nullable: false,
    unique: true,
  })
  email!: string;

  @Column({ type: "varchar", nullable: false })
  password!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @Column({
    type: "enum",
    enum: ["USER", "ADMIN"],
    default: "USER",
  })
  role!: "USER" | "ADMIN";

  @Column({ type: "boolean", default: false })
  kycCompleted!: boolean;

  @Column({ type: "varchar", nullable: true })
  kycPhoto!: string;

  @OneToMany(() => Rental, (rental) => rental.user)
  rentals!: Rental[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
