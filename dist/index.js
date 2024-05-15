"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const bodyParser = require("body-parser");
const inscription_route_1 = require("./src/routes/inscription.route");
const fee_estimate_route_1 = require("./src/routes/fee.estimate.route");
const status_network_route_1 = require("./src/routes/status.network.route");
const http_1 = __importDefault(require("http"));
const swaggerDocument = yamljs_1.default.load('swagger.yaml');
/*
 * Load up and parse configuration details from
 * the `.env` file to the `process.env`
 * object of Node.js
 */
dotenv_1.default.config();
/*
 * Create an Express application and get the
 * value of the PORT environment variable
 * from the `process.env`
 */
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = process.env.PORT || 8081;
app.use((0, express_fileupload_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cors_1.default)());
app.use('/api/inscribe', inscription_route_1.InscriptionRouter);
app.use('/api/estimate', fee_estimate_route_1.FeeEstimateRoute);
app.use('/api/status', status_network_route_1.StatusNetworkRoute);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, { explorer: true }));
/* Start the Express app and listen
 for incoming requests on the specified port */
server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
