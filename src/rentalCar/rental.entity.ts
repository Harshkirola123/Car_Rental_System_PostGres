import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Renter } from "../renters/renter.entity"; // Ensure Renter entity is defined
import { Car } from "../car/car.entity"; // Ensure Car entity is defined

@Entity("rentals")
export class Rental {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Renter, (renter) => renter.rentals, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user!: Renter;

  @ManyToOne(() => Car, (car) => car.id, {
    nullable: false,
    onDelete: "CASCADE",
  })
  car!: Car;

  @Column({ type: "timestamp", nullable: false })
  startDate!: Date;

  @Column({ type: "timestamp", nullable: false })
  endDate!: Date;

  @Column({
    type: "enum",
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  })
  status!: "pending" | "active" | "completed" | "cancelled";

  @Column({
    type: "enum",
    enum: ["paid", "pending"],
    default: "pending",
  })
  paymentStatus!: "paid" | "pending";

  @Column({ type: "float", default: 0 })
  totalAmount!: number;

  @OneToMany(() => RentalHistoryEntry, (entry) => entry.id, {
    cascade: true,
  })
  rentalHistory!: RentalHistoryEntry[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}

/**
 * RentalHistoryEntry Entity
 */
@Entity("rental_history_entries")
export class RentalHistoryEntry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "timestamp", nullable: false })
  startDate!: Date;

  @Column({ type: "timestamp", nullable: false })
  endDate!: Date;

  @Column({ type: "float", nullable: false })
  totalAmount!: number;
}
