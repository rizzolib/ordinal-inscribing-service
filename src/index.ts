// src/index.ts
import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import fileUpload from'express-fileupload';

import bodyParser = require("body-parser");
import { InscriptionRouter } from "./routes/inscriptionRouter";

/*
 * Load up and parse configuration details from
 * the `.env` file to the `process.env`
 * object of Node.js
 */
dotenv.config();

/*
 * Create an Express application and get the
 * value of the PORT environment variable
 * from the `process.env`
 */
const app: Express = express();
const port = process.env.PORT || 8081;
app.use(fileUpload());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors())

app.use('/api', InscriptionRouter)

// Upload Endpoint
app.post('/upload', (req: Request, res: Response) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  const file = req.files?.file;
  console.log(file)
});

/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
