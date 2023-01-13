# NFT Gated Website Solana

This project demonstrates how you can restrict content on your website to only those users who own an NFT from your collection.

We use an [NFT Drop](https://docs.web3sdks.com/pre-built-contracts/solana/nft-drop) contract to enable users to claim one of the NFTs, and serve users the restricted content if they have at least one of the NFTs claimed.

## Tools:

- [Solana SDK](https://docs.web3sdks.com/solana): To access the nft drop contract for claiming and checking the user's NFTs
- [Auth](https://docs.web3sdks.com/auth): To ask users to sign a message and verify they own the wallet they claim to be, while on the server-side.

## Using This Template

Create a project using this example:

```bash
npx web3sdks create --template nft-gated-website-solana
```

- Create an [NFT Drop](https://web3sdks.com/programs) contract on solana using the dashboard.
- Update the information in the [yourDetails.ts](./const/yourDetails.ts) file to use your contract address and auth domain name.
- Add your wallet's private key as an environment variable in a `.env.local` file called `PRIVATE_KEY`:

```text title=".env.local"
PRIVATE_KEY=your-wallet-private-key
```

## How It Works

Using [Auth](https://docs.web3sdks.com/auth), we can verify a user's identity on the server-side, by asking them to sign a message and verify they own the wallet they claim to be, and validating the signature.

When we verified the user's identity on the server-side, we check their wallet to see if they have an NFT from our collection. We can then serve different content and restrict what pages they can access based on their NFT balance.

```tsx
function MyApp({ Component, pageProps }) {
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
```

Next, we need to create a configuration file that contains our wallet's private key (used to generate messages for users to sign) and our site's domain name:

This file is called `auth.config.ts` and is at the root of the project.

```tsx
import { Web3sdksAuth } from "@web3sdks/auth/next/solana";
import { domainName } from "./const/yourDetails";

export const { Web3sdksAuthHandler, getUser } = Web3sdksAuth({
  privateKey: process.env.PRIVATE_KEY as string,
  domain: domainName,
});
```

Finally, we have a [catch-all API route](https://nextts.org/docs/api-routes/dynamic-api-routes#catch-all-api-routes) called `pages/api/auth/[...web3sdks].ts`, which exports the `Web3sdksAuthHandler` to manage all of the required auth endpoints like `login` and `logout`.

```tsx
import { Web3sdksAuthHandler } from "../../../auth.config";

export default Web3sdksAuthHandler();
```

## Restricting Access

To begin with, the user will reach the website with no authentication.

When they try to access the restricted page (the `/` route), we use [getServerSideProps](https://nextts.org/docs/basic-features/data-fetching/get-server-side-props) to check two things:

1. If the user is currently authenticated (using `getUser`).
2. If the user's wallet has at least one NFT from our collection.

If either of these checks is `false`, we redirect the user to the `/login` page before they are allowed to access the restricted page.

Let's break that down into steps:

### Setting Up the Auth SDK

Inside the [\_app.tsx](./pages/_app.tsx) file, we configure the Auth SDK in the `Web3sdksProvider` component that wraps our application, allowing us to use the hooks of the SDK throughout our application:

### Checking For Authentication Token

First, we check if this user has already been authenticated.

If this is the first time the user has visited the website, they will not have an `access_token` cookie.

```ts
// This gets called on every request
export async function getServerSideProps(context) {
  const user = await getUser(context.req);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // ...
}
```

If the user is not authenticated, then we don't check the user's wallet balance; we just immediately redirect them to the `/login` page.

If there _is_ a detected user from `getUser`, we can then check their balance.

### Checking Wallet Balance

Now we're ready to check the user's wallet balance.

```ts
const program = await sdk.getNFTDrop(programAddress);
const nfts = await program?.getAllClaimed();

const hasNFT = nfts?.some((nft) => nft.owner === user.address);
```

Here's our final check, if the user hasNFT is `false`, we redirect them to the `/login` page.

```ts
if (!hasNFT) {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
}
```

If the user gets past these checks, then we allow them to view the restricted page.

```ts
// Finally, return the props
return {
  props: {},
};
```

## Signing In

We've now successfully restricted access to our home page, now let's explore the `/login` page.

First, we ask the user to connect their wallet with the `WalletMultiButton`

```ts
const { publicKey } = useWallet();

{
  !publicKey && <WalletMultiButton />;
}
```

Once an `address` is detected from the `useAddress` hook, we show them the `Sign In` button:

```ts
const { user } = useUser();

{
  publicKey && !user && (
    <button className={styles.button} onClick={() => login()}>
      Login
    </button>
  );
}
```

The `Sign In` button calls the `login` function that we're importing from the Auth SDK:

```tsx
import { useLogin, useUser } from "@web3sdks/react/solana";

const login = useLogin();
```

Inside the [\_app.tsx](./page/_app.tsx) file, we configured the redirect users to the `/` route after they successfully sign in:

```tsx
function MyApp({ Component, pageProps }) {
  return (
    <Web3sdksProvider
      desiredChainId={activeChainId}
      authConfig={{
        domain: domainName,
        authUrl: "/api/auth",
        loginRedirect: "/", // redirect users to the home page after they successfully sign in
      }}
    >
      <Component {...pageProps} />
    </Web3sdksProvider>
  );
}

export default MyApp;
```

Once the user has authenticated (signed the message), they are redirected to the home page `/`, and the `getServersideProps` logic runs again. Checking to see if they have an NFT.

## Join our Discord!

For any questions, suggestions, join our discord at [https://discord.gg/KX2tsh9A](https://discord.gg/KX2tsh9A).
