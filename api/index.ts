import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import logger from "morgan";
import multer from "multer";
import * as path from "path";
// The following line sets up the environment variables before everything else.
dotenv.config();

import MongoStore from "connect-mongo";
import { Posting } from "../server/app";
import { connectDb } from "../server/db";
import { appRouter } from "../server/routes";

export const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: "temp/" });
app.use(logger("dev"));

app.use(cors()); // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

app.use(express.json()); // Enable parsing JSON in requests and responses.
app.use(express.urlencoded({ extended: false })); // Also enable URL encoded request and responses.

// Session allows us to store a cookie 🍪.
app.use(
  session({
    secret: process.env.SECRET || "Hello 6.1040",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_SRV,
      dbName: "mongo-sessions",
    }),
  }),
);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/api/", appRouter);

// Specifically upload video
app.post("/upload", upload.single("file"), async (req: any, res) => {
  // Process the uploaded file (req.file)
  console.log("file::::", req, req.file ?? "");
  const filePath = req.file.path;
  const filename = `${Date.now()}-${req.file.originalname}`;
  await Posting.posts.uploadVideo(filePath, filename);
  res.send("File uploaded successfully");
});

// For all unrecognized requests, return a not found message.
app.all("*", (req, res) => {
  res.status(404).json({
    msg: "Page not found",
  });
});

void connectDb().then(() => {
  app.listen(PORT, () => {
    console.log("Started listening on port", PORT);
  });
});

export default app;
