import { Keypair } from "@solana/web3.js";
import fs from "node:fs";

const keypair = Keypair.generate();

const publicKey = keypair.publicKey.toBase58();
const secretKey = Array.from(keypair.secretKey);

fs.writeFileSync(
  "passion-jar-keypair.json",
  JSON.stringify(secretKey, null, 2),
);

console.log("Passion Jar public address:");
console.log(publicKey);
console.log("");
console.log("Secret key saved to passion-jar-keypair.json");
console.log("Do not commit this file to GitHub.");