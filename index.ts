// src/index.ts
import express, { Express, Request, Response } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import fileUpload from 'express-fileupload';
import swaggerUi from 'swagger-ui-express';
import YAML from "yamljs";
import bodyParser = require("body-parser");
import { InscriptionRouter } from "./src/routes/inscription.route";
import { FeeEstimateRoute } from "./src/routes/fee.estimate.route";
import { StatusNetworkRoute } from "./src/routes/status.network.route";
import { MultiInscriptionRouter } from "./src/routes/multi.inscription.route";
import http from "http";
import { WalletManageRoute } from "./src/routes/wallet.management.route";
const { Mutex } = require('async-mutex');

export const flagMutex = new Mutex();

const swaggerDocument = YAML.load('swagger.yaml');

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
export const app: Express = express();

app.locals.utxoflag = false;

const server = http.createServer(app);

const port = process.env.PORT || 8081;
app.use(fileUpload());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors())

app.use('/api/inscribe', InscriptionRouter)
app.use('/api/estimate', FeeEstimateRoute)
app.use('/api/status', StatusNetworkRoute)
app.use('/api/multi-inscribe', MultiInscriptionRouter)
app.use('/api/wallet', WalletManageRoute)

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);


/* Start the Express app and listen
 for incoming requests on the specified port */
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});