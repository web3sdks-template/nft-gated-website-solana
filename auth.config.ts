import { Web3sdksAuth } from "@web3sdks/auth/next/solana";
import { domainName } from "./const/yourDetails";

export const { Web3sdksAuthHandler, getUser } = Web3sdksAuth({
  privateKey: process.env.PRIVATE_KEY as string,
  domain: domainName,
});
