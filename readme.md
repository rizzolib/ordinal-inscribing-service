# Ordinal Inscribing service

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Overview](#overview)
  - [Base URLs](#base-urls)
  - [Available Endpoints](#available-endpoints)
    - [Status](#status)
      - [Get Current Bitcoin Price](#get-current-bitcoin-price)
      - [Last 15 Blocks Average Fee Rate](#last-15-blocks-average-fee-rate)
      - [Recommended Block Fee Rate](#recommended-block-fee-rate) 
      - [Split Large UTXO of Admin Wallet](#split-large-utxo-of-admin-wallet)
    - [Inscribe](#inscribe)
      - [Create New Text Inscription](#create-new-text-inscription)
      - [Create New File Inscription](#create-new-file-inscription)
      - [Create New Delegate Inscription](#create-new-delegate-inscription)
      - [Get New Sending Ordinals PSBT](#get-new-sending-ordinals-psbt)
    - [Estimate](#estimate)
      - [Estimate Text Inscription](#estimate-text-inscription)
      - [Estimate File Inscription](#estimate-file-inscription)
      - [Estimate Delegate Inscription](#estimate-delegate-inscription)
- [Schema Definitions](#schema-definitions)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Introduction

A brief introduction to the Luminex Ordinal/Iscription Express Backend, highlighting its purpose and significance within the bitcoin ecosystem.

## Features

A section detailing the core features of the backend service, including parent/child provenance inscription minting, reinscription, delegate inscription, and metadata/metaprotocol integration Batch Inscription (Bulk text inscribing).

## Getting Started

Instructions on how to get started with the project, including installation, configuration, and running the application.

### Installation

Steps to clone the repository and install dependencies.

### Configuration

Guidelines on setting up environment variables and configuring the application for both development and production environments.

### Running the Application

Commands to start the application and access the server.

## API Documentation

An overview of the API documentation, including base URLs and available endpoints categorized by functionality.

### Overview

A high-level description of what the API does and who it's for.

### Base URLs

Information on the base URLs for accessing the API in different environments.

### Available Endpoints

Detailed descriptions of each endpoint, including method, endpoint path, description, request body (if applicable), and expected response.

#### Status

Endpoints related to fetching status information about the system, such as Bitcoin prices and fee rates.

##### Get Current Bitcoin Price

Details on the endpoint for retrieving the current Bitcoin price.

##### Last 15 Blocks Average Fee Rate

Details on the endpoint for fetching the average fee rate of the last 15 blocks.

##### Recommended Block Fee Rate

Details on the endpoint for getting a recommendation for the optimal block fee rate.

##### Split Large UTXO of Admin Wallet

Details on the endpoint for splitting a large UTXO from the admin wallet.

#### Inscribe

Endpoints for creating new inscriptions, including text, file, and delegate inscriptions, and generating sending ordinals PSBTs.

##### Create New Text Inscription

Details on the endpoint for creating a new text inscription.

##### Create New File Inscription

Details on the endpoint for creating a new file inscription.

##### Create New Delegate Inscription

Details on the endpoint for creating a new delegate inscription.

##### Get New Sending Ordinals PSBT

Details on the endpoint for generating a new Bitcoin transaction PSBT for sending ordinals.

#### Estimate

Endpoints for estimating the costs associated with creating inscriptions.

##### Estimate Text Inscription

Details on the endpoint for estimating the cost of creating a text inscription.

##### Estimate File Inscription

Details on the endpoint for estimating the cost of creating a file inscription.

##### Estimate Delegate Inscription

Details on the endpoint for estimating the cost of creating a delegate inscription.

## Schema Definitions

Descriptions of the schemas used in the API, including `TextInscription`, `FileInscription`, `DelegateInscription`, and `SendingOrdialBtcPsbt`.



## Contact Info
I have provided the project structure and rune token deploy, mint, tranfer code part in the README to keep security and the NDA sign. For further technical support and development inquiries, please contact me here.  


- **Twiter:**  https://x.com/rez_cats/
- **Discord:** https://discord.com/users/190208149569929217/ (@rezzecup89)
