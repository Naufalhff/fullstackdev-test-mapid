import "dotenv/config";
import express from "express";
import cors from "cors";
import { reportsRouter } from "./modules/reports/routes.js";
import { authRouter } from "./modules/auth/routes.js";
import { historyRouter } from "./modules/history/routes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/reports", reportsRouter);
app.use("/history", historyRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`api http://localhost:${port}`));
