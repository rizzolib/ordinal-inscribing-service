# Luminex Ordinal/Iscription Express Backend

Luminex Ordinal/Iscription Express Backend is a robust and feature-rich backend service designed to facilitate operations related to ordinal/inscription management within the bitcoin ecosystem. This project includes functionalities such as parent/child provenance inscription minting, reinscription, delegate inscription, and options for metadata/metaprotocol integration.

## Features

- **Parent/Child Provenance Inscription Minting**: Enables the creation of inscriptions that can be traced through generations, ensuring traceability and authenticity.
- **Reinscription**: Allows for the updating or reissuing of inscriptions, accommodating changes or corrections as needed.
- **Delegate Inscription**: Facilitates the delegation of inscription rights to another entity, enhancing flexibility and collaboration.
- **Metadata/Metaprotocol Integration**: Offers options for integrating metadata and metaprotocols, enabling richer data handling and interoperability.

## Getting Started

To get started with the Luminex Ordinal/Iscription Express Backend, follow these steps:

### Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/atst4/luminex-inscription-service-backend.git
```

Navigate to the project directory:

```bash
cd luminex-inscription-service-backend
```

Install the dependencies:

```bash
yarn install
```

### Configuration

Before running the application, ensure you have set up your environment variables correctly. The `.env` file should contain the necessary configurations, including the network type (`NETWORKTYPE`) and the port number (`PORT`). For development purposes, you can use the default values provided in the `.env.example` file.

### Running the Application

Start the application by running:

```bash
yarn start
```

This command will start the server, and you should see a message indicating that the server is running at `http://localhost:<port>`.

## API Documentation

The project uses Swagger UI for API documentation. Once the server is running, navigate to `/api-docs` in your web browser to access the interactive API documentation.

# Luminex Inscription Service API Documentation

Welcome to the Luminex Inscription Service API documentation. This document outlines the available endpoints, request/response formats, and other essential information for interacting with our service.

## Overview

The Luminex Inscription Service is designed to manage various aspects of inscriptions within the blockchain ecosystem. It supports operations like fetching current Bitcoin prices, estimating fees, managing wallet UTXOs, creating text and file inscriptions, delegating inscriptions, and generating sending ordinals PSBTs.

## Base URLs

The base URL for the production environment is `https://luminex-backend-production.up.railway.app/api`, while the development environment runs locally at `http://localhost:8081/api`.

## Available Endpoints

### Status

- **Get Current Bitcoin Price**

  - Method: `GET`
  - Endpoint: `/status/price`
  - Description: Retrieves the current Bitcoin price.
  - Response: A JSON object containing the current Bitcoin price.

- **Last 15 Blocks Average Fee Rate**

  - Method: `GET`
  - Endpoint: `/status/avgFeeRate`
  - Description: Fetches the average fee rate of the last 15 blocks.
  - Response: A JSON object with the average fee rate.

- **Recommended Block Fee Rate**

  - Method: `GET`
  - Endpoint: `/status/recommendFeeRate`
  - Description: Provides a recommendation for the optimal block fee rate.
  - Response: A JSON object with the recommended fee rate.

- **Split Large UTXO of Admin Wallet**
  - Method: `GET`
  - Endpoint: `/wallet/utxo-split`
  - Description: Splits a large UTXO from the admin wallet.
  - Response: A JSON object indicating success or failure of the operation.

### Inscribe

- **Create New Text Inscription**

  - Method: `POST`
  - Endpoint: `/inscribe/text`
  - Description: Creates a new text inscription.
  - Request Body: A multipart form-data payload containing the inscription details.
  - Response: A JSON object indicating the success or failure of the inscription creation.

- **Create New File Inscription**

  - Method: `POST`
  - Endpoint: `/inscribe/file`
  - Description: Creates a new file inscription.
  - Request Body: A multipart form-data payload containing the file and inscription details.
  - Response: A JSON object indicating the success or failure of the inscription creation.

- **Create New Delegate Inscription**

  - Method: `POST`
  - Endpoint: `/inscribe/delegate`
  - Description: Creates a new delegate inscription.
  - Request Body: A multipart form-data payload containing the delegate details.
  - Response: A JSON object indicating the success or failure of the inscription creation.

- **Get New Sending Ordinals PSBT**
  - Method: `POST`
  - Endpoint: `/sendOrdinal/getSendingOrdinalBtcPsbt`
  - Description: Generates a new Bitcoin transaction PSBT for sending ordinals.
  - Request Body: A multipart form-data payload containing the transaction details.
  - Response: A JSON object indicating the success or failure of the PSBT generation.

### Estimate

- **Estimate Text Inscription**

  - Method: `POST`
  - Endpoint: `/estimate/text`
  - Description: Estimates the cost of creating a text inscription.
  - Request Body: A multipart form-data payload containing the inscription details.
  - Response: A JSON object indicating the estimated cost.

- **Estimate File Inscription**

  - Method: `POST`
  - Endpoint: `/estimate/file`
  - Description: Estimates the cost of creating a file inscription.
  - Request Body: A multipart form-data payload containing the file and inscription details.
  - Response: A JSON object indicating the estimated cost.

- **Estimate Delegate Inscription**
  - Method: `POST`
  - Endpoint: `/estimate/delegate`
  - Description: Estimates the cost of creating a delegate inscription.
  - Request Body: A multipart form-data payload containing the delegate details.
  - Response: A JSON object indicating the estimated cost.

## Schema Definitions

The API uses several schemas to define the structure of the request and response bodies. These schemas are defined under the `components/schemas` section of the OpenAPI specification. They include `TextInscription`, `FileInscription`, `DelegateInscription`, and `SendingOrdialBtcPsbt`.

## Error Handling

All API calls return a JSON object with a status code and a message. Successful operations typically return a `200 OK` status, while errors return appropriate HTTP error codes (e.g., `400 Bad Request`).

## Contributing

Contributions are welcome Please feel free to submit a pull request or open an issue if you encounter any problems or have suggestions for improvements.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
