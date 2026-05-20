import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// .env.local (Vercel dev) wins, then fallback to .env
config({ path: ".env.local", override: true });
config({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
