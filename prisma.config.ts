import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // DATABASE_URL can be set in .env or environment
    // For prisma generate, URL is not required in 7.2.0+
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});