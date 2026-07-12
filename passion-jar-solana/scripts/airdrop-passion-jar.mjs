import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const passionJarAddress = "DhvdgkuZEEJ7mL34pst3jr9ghAekcCejbWcjfBbDmscm";
const publicKey = new PublicKey(passionJarAddress);

try {
  console.log("Requesting 0.5 devnet SOL for:");
  console.log(passionJarAddress);

  const signature = await connection.requestAirdrop(
    publicKey,
    0.5 * LAMPORTS_PER_SOL,
  );

  console.log("Airdrop signature:");
  console.log(signature);

  console.log("Waiting for confirmation...");
  await connection.confirmTransaction(signature, "confirmed");

  const balance = await connection.getBalance(publicKey);

  console.log("Current balance:");
  console.log(`${balance / LAMPORTS_PER_SOL} SOL`);
} catch (error) {
  console.error("Airdrop failed.");

  if (error instanceof Error && error.message.includes("429")) {
    console.error(
      "You may have reached the Solana Devnet faucet limit. Try https://faucet.solana.com or wait and try again later.",
    );
  } else {
    console.error(error);
  }
}