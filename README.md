# BankPro - Microservices Banking System

A modern banking simulation with Microservices architecture.

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend Services**:
  - `auth-service`: Authentication & User Management (Python FastAPI)
  - `core-banking-service`: Ledger, Transfers & Money Printer (Python FastAPI)
  - `gateway-service`: API Gateway (Nginx)
- **Database**: PostgreSQL
- **Infrastructure**: Docker Compose

## Quick Start

1.  **Start the System**:
    ```bash
    docker-compose up --build
    ```
2.  **Access the Application**:
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - API Gateway: [http://localhost:8080](http://localhost:8080)

## Features

### 1. User Accounts
- Register a new account.
- Login to view dashboard.
- **Credit Card Visualization**: Real-time balance updates.
- **Dark Mode**: Automatically enabled.

### 2. Money Printer (Admin Only)
This feature allows administrators to inject unlimited funds into accounts for testing.

**How to use:**
1.  **Register/Login**: create an account (e.g., `admin@bank.com`).
    - *Note*: The system currently makes the first registered user an Admin or you can update the DB manually.
    - *Hack*: Use the registration endpoint to set `is_admin=true` if you use curl, or update the database.
    - *Default*: Regular users cannot print money.
2.  **Access Admin Panel**:
    - On the Home screen, scroll to the bottom footer.
    - Click the discrete `[ ADMIN ACCESS ]` button.
3.  **Inject Funds**:
    - Enter the **User ID** (e.g., `1`).
    - Enter **Amount** (e.g., `1000000`).
    - Click **INJECT FUNDS**.
4.  **Verify**:
    - Go back to Dashboard.
    - Your card balance should reflect the new amount!

## Architecture

- **Frontend** talks to **Gateway** (`/auth/*`, `/core/*`).
- **Gateway** routes to **Auth Service** and **Core Banking Service**.
- **Core Banking Service** manages the ledger and "Money Printer" logic.
- **Auth Service** issues JWT tokens.

## Development

- **Frontend**: Located in `/frontend-client`.
- **Backend**: `/auth-service`, `/core-banking-service`.
- **Gateway**: `/gateway-service`.

Enjoy your infinite money glitch! 💸
