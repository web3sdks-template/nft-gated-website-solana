import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Web3sdksProvider } from "@web3sdks/react/solana";
import { Network } from "@web3sdks/sdk/solana";
import type { AppProps } from "next/app";
import { domainName } from "../const/yourDetails";
import "../styles/globals.css";
require("@solana/wallet-adapter-react-ui/styles.css");

const network: Network = "devnet";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3sdksProvider
      authConfig={{
        authUrl: "/api/auth",
        domain: domainName,
        loginRedirect: "/",
      }}
      network={network}
    >
      <WalletModalProvider>
        <Component {...pageProps} />
      </WalletModalProvider>
    </Web3sdksProvider>
  );
}

export default MyApp;
