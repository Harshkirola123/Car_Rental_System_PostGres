import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Admin } from "../admin/admin.entity"; // Ensure the Admin entity is defined

@Entity("cars") // Table name in the database
export class Car {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  name!: string;

  @Column({ type: "text", nullable: false })
  description!: string;

  @Column({ type: "float", nullable: false })
  pricePerDay!: number;

  @Column({ type: "boolean", default: true })
  available!: boolean;

  @ManyToOne(() => Admin, (admin) => admin.carsManaged, {
    nullable: true,
    onDelete: "SET NULL",
  })
  admin!: Admin;

  @Column({ type: "text" })
  color!: string;
  @Column({ type: "float", nullable: false, default: 20 })
  cancellationFee!: number;

  @Column({ type: "int", nullable: false, default: 24 })
  minCancelTime!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;
}
