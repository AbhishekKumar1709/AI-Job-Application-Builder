import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection; the app uses the
    // pooled DATABASE_URL at runtime via the adapter in lib/prisma.ts.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
