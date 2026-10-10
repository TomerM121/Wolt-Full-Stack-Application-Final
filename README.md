# System Design Wolt

A food-ordering platform inspired by Wolt, built layer by layer: from a C++ recommendation server to a full stack with a web app, a mobile app and a MongoDB database.

Customers can browse restaurants, search for restaurants and products, build a cart and place orders. Restaurant owners get a dashboard to edit their restaurant and manage their products.

## Architecture

```
 React web app ─┐                                 ┌─ MongoDB
                ├── HTTP/JSON ──> Node.js API ────┤
 React Native ──┘   (Express)                     └─ C++ recommendation server (TCP)
```

| Component | Path | Tech |
|-----------|------|------|
| Recommendation server | [server/](server) | C++17, CMake, GoogleTest, TCP sockets |
| Python client for the C++ server | [client/](client) | Python |
| REST API | [web/](web) | Node.js, Express, Mongoose, JWT |
| Web app | [ui/web/](ui/web) | React, Vite |
| Mobile app | [ui/mobile/](ui/mobile) | React Native, Expo |
| Shared API layer for both apps | [ui/shared/](ui/shared) | JavaScript |

### How it was built

1. A C++ app that manages restaurants and products and runs a recommendation algorithm.
2. A Python client that talks to the C++ server over TCP.
3. A Node.js client and API on top of the C++ server.
4. A React web app that consumes the Node.js API over HTTP.
5. A React Native app, with all data moved into MongoDB.

Each layer was stable before the next one was added.

## Getting started

### Prerequisites

- [Docker](https://www.docker.com/) with Docker Compose
- Node.js and npm (mobile app only)
- An Android or iOS emulator (mobile app only)

### Web app and backend

From the repository root:

```bash
docker compose up -d --build
```

Then open <http://localhost:5173>.

This starts MongoDB, the C++ server, the Node.js API (port 3000) and the React frontend (port 5173).

The API signs tokens with the `JWT_SECRET` environment variable. `docker-compose.yml` falls back to a development-only default. Set your own for anything beyond local use:

```bash
JWT_SECRET=your-own-secret docker compose up -d --build
```

### Mobile app

```bash
cd ui/mobile
npm install
npx expo start -c
```

Wait for the QR code to appear in the terminal, then press `a` for an Android emulator or `i` for an iOS emulator. The emulator must already be running.

## Screenshots and walkthrough

See [wiki/INSTRUCTIONS.md](wiki/INSTRUCTIONS.md) for a screen-by-screen tour of the web and mobile apps.

## Team

This was a team project. I built it in full cooperation with:

- **Barak** — [@ChesssIL](https://github.com/ChesssIL)
- **Harel** — [@hapoel101](https://github.com/hapoel101)

## About this repository

This is not the full development repository. It contains only the final product, with the commit history removed for security and privacy reasons.

If you are interested in the full repository, feel free to contact me.
