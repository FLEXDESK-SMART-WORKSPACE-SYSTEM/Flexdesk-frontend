# FLEXDESK Frontend

Frontend for the FLEXDESK smart workspace booking POC. It is a Vite single-page application connected to the FastAPI backend.

## Requirements

- Node.js 18+
- npm
- FLEXDESK backend running on port `8002`

## Install

From this directory:

```powershell
npm install
```

## Environment

The frontend `.env` points to the backend API:

```env
VITE_API_URL=http://127.0.0.1:8002/api/v1
```

Restart Vite after changing `.env` because Vite reads environment variables when it starts.

## Run the frontend

```powershell
cd "C:\Users\IpshitaDas\Desktop\MTECH Final Year\FlexDesk\Flexdesk-frontend"
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5174/`.

## Login

Sign in with your account email and password. The password field masks input.

Sign in with email and password or use the Microsoft button when Entra ID is configured in the backend.

## Frontend workflow

1. Sign in.
2. Start a new booking.
3. Select a location, floor, bay, and workspace type.
4. Select a date and workspace from the floor map.
5. Book the workspace.
6. Open My bookings to view booking history.

## Production build

```powershell
npm run build
```
