import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const PASSION_JAR_ADDRESS =
  "DhvdgkuZEEJ7mL34pst3jr9ghAekcCejbWcjfBbDmscm";

export async function getSolBalance(address: string): Promise<number> {
  const publicKey = new PublicKey(address);
  const lamports = await connection.getBalance(publicKey);
  return lamports / LAMPORTS_PER_SOL;
}

export async function getRecentTransactions(address: string) {
  const publicKey = new PublicKey(address);

  return connection.getSignaturesForAddress(publicKey, {
    limit: 5,
  });
}

export function getExplorerUrl(
  value: string,
  type: "address" | "tx",
): string {
  return `https://explorer.solana.com/${type}/${value}?cluster=devnet`;
}