# Passion Jar Solana

A local Solana Devnet app built for the DEV Weekend Challenge: Passion Edition.

Passion Jar Solana helps people turn passion into visible progress. Users can name a passion, track small actions toward it, and view a Solana Devnet jar with balance and recent transaction activity.

## Built For

- DEV Weekend Challenge: Passion Edition
- Prize Category: Best Use of Solana

## Features

- Name a personal passion jar
- View a dedicated Solana Devnet address
- Read Devnet SOL balance
- View recent Solana transactions
- Add, complete, and delete passion actions
- Save actions locally with localStorage

## Tech Stack

- React
- TypeScript
- Vite
- Solana Devnet
- @solana/web3.js
- localStorage

## Run Locally

```bash
npm install
npm run dev
```

#### Open:
```bash
http://localhost:5173
```

## Devnet Jar Address
```bash
DhvdgkuZEEJ7mL34pst3jr9ghAekcCejbWcjfBbDmscm
```

## Notes

This project uses Solana Devnet only. No real SOL is used.

The local keypair file is ignored and should not be committed:

```bash
passion-jar-keypair.json
```