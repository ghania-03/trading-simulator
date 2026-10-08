# Trading Simulator

A browser-based application for exploring a simulated crypto-asset market, placing virtual trades, and tracking portfolio performance.

## Overview

Trading Simulator lets users sign in, browse assets, and place simulated buy and sell orders. It is a client-rendered React application that generates changing prices in the browser and manages portfolio state on the client. 

User, asset, and transaction records are accessed through a JSON REST API configured with `VITE_API_URL`; the repository includes JSON Server and sample data for local development.

## Live Demo

**Live Demo:** [View Live Demo](https://trading-simulator-snowy-rho.vercel.app/)

## Features

- Sign-in and protected application routes
- Asset market with search, sorting, price-change indicators, and sparklines
- Asset detail views with price charts and simulated buy and sell orders
- Portfolio holdings, transaction history, and realized/unrealized profit and loss
- Price alerts with in-app notifications
- Leaderboard based on realized profit and loss from transaction records
- Light and dark themes

## Tech Stack

- React 19
- JavaScript
- Vite 8
- React Router 7
- TanStack Query 5
- Zustand 5
- Recharts 3
- React Hook Form 7
- Tailwind CSS 4
- JSON Server for local API development
- ESLint 10


# Run Locally
### 1. Getting Started
Requirements: Node.js and npm.

```sh
git clone https://github.com/ghania-03/trading-simulator.git
cd trading-simulator
npm install
```

### 2. Configure the API

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Start the local API

The project includes JSON Server and sample data in `db.json`.

```sh
npm run server
```

The API runs at `http://localhost:3001`.

### 4. Start the application

In a separate terminal, run:

```sh
npm run dev
```

Vite will provide the local development URL, typically `http://localhost:5173`.

## Build

Create a production build with:

```sh
npm run build
```

To preview the production build locally:

```sh
npm run preview
```

## Current Limitations

- Market prices are simulated and are not live exchange data. This project does not include a production backend.
- JSON Server is included for local API development.
- The project does not connect to a real cryptocurrency exchange or brokerage.
- No real-money trading or transactions are performed.
