const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class Add1737552428775 {
    name = 'Add1737552428775'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "admins" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "role" "public"."admins_role_enum" NOT NULL DEFAULT 'ADMIN', "kycCompleted" boolean NOT NULL DEFAULT false, "kycPhoto" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_8ee78b5594dd5b384afa3a17b1c" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`CREATE TABLE "cars" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "pricePerDay" double precision NOT NULL, "available" boolean NOT NULL DEFAULT true, "color" text NOT NULL, "cancellationFee" double precision NOT NULL DEFAULT '20', "minCancelTime" integer NOT NULL DEFAULT '24', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "admin_id" uuid, CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rentals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "status" "public"."rentals_status_enum" NOT NULL DEFAULT 'pending', "paymentStatus" "public"."rentals_paymentstatus_enum" NOT NULL DEFAULT 'pending', "totalAmount" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "carId" uuid NOT NULL, CONSTRAINT "PK_2b10d04c95a8bfe85b506ba52ba" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rental_history_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "totalAmount" double precision NOT NULL, CONSTRAINT "PK_1f2bfd6aa0d5eb78b2979eb9186" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "renters" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" text NOT NULL, "password" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "role" "public"."renters_role_enum" NOT NULL DEFAULT 'USER', "kycCompleted" boolean NOT NULL DEFAULT false, "kycPhoto" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_78931857cf20f84e434894b07ff" UNIQUE ("email"), CONSTRAINT "PK_9f93e2b58663ec8b845229da29d" PRIMARY KEY ("_id"))`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_9d7de15c19369566a60353c6dfb" FOREIGN KEY ("admin_id") REFERENCES "admins"("_id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD CONSTRAINT "FK_b13ac8580bd6a011f47a476fbad" FOREIGN KEY ("user_id") REFERENCES "renters"("_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD CONSTRAINT "FK_7e07037bddbd4c16a105cbd904f" FOREIGN KEY ("carId") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "rentals" DROP CONSTRAINT "FK_7e07037bddbd4c16a105cbd904f"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP CONSTRAINT "FK_b13ac8580bd6a011f47a476fbad"`);
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_9d7de15c19369566a60353c6dfb"`);
        await queryRunner.query(`DROP TABLE "renters"`);
        await queryRunner.query(`DROP TABLE "rental_history_entries"`);
        await queryRunner.query(`DROP TABLE "rentals"`);
        await queryRunner.query(`DROP TABLE "cars"`);
        await queryRunner.query(`DROP TABLE "admins"`);
    }
}
