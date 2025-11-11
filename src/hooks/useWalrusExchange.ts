// useWalrusExchange.ts

// Frontend-safe version of your SuiToWalConverter logic,
// using Mysten dapp-kit for account + signing.

import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useMemo } from "react";

// Use the inner coin type for balance queries (not the Coin<T> wrapper)
const WAL_TOKEN_TYPE =
  "0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL";

// hardcoded protocol addresses from your backend sample
// TESTNET addresses - replace with mainnet IDs when provided
const STAKING_POOL_ID =
  "0x20266a17b4f1a216727f3eef5772f8d486a9e3b5e319af80a5b75809c035561d"; // (not actually used in tx below but keeping for context)

const EXCHANGE_PACKAGE_ID =
  "0x82593828ed3fcb8c6a235eac9abd0adbe9c5f9bbffa9b1e7a45cdd884481ef9f";

const EXCHANGE_OBJECT_ID =
  "0x19825121c52080bb1073662231cfea5c0e4d905fd13e95f21e9a018f2ef41862";

export function useWalrusExchange() {
  // Grab the connected wallet account
  const account = useCurrentAccount();

  // Client for reads (balances, etc.)
  const suiClient = useMemo(() => {
    return new SuiClient({
      url: getFullnodeUrl("testnet"),
    });
  }, []);

  // Hook that will ask the wallet to sign+execute
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  /**
   * Convert SUI -> WAL by calling wal_exchange::exchange_all_for_wal
   * amount should be in MIST (1 SUI = 1_000_000_000 MIST)
   */
  const convertSuiToWal = useCallback(
    async (amount: bigint | number) => {
      if (!account?.address) {
        throw new Error("No wallet connected.");
      }

      // tx assembly
      const txb = new Transaction();

      // sender is the connected wallet
      txb.setSender(account.address);

      // split `amount` out of gas coin to use as input SUI
      const coin = txb.splitCoins(txb.gas, [txb.pure.u64(amount)]);

      // call the Move function
      const walCoin = txb.moveCall({
        target: `${EXCHANGE_PACKAGE_ID}::wal_exchange::exchange_all_for_wal`,
        arguments: [txb.object(EXCHANGE_OBJECT_ID), coin],
      });

      // send resulting WAL coin back to the caller
      txb.transferObjects([walCoin], txb.pure.address(account.address));

      // IMPORTANT:
      // frontend does NOT sign directly.
      // we ask the wallet via dapp-kit:
      const res = await signAndExecute({
        transaction: txb,
        chain: "sui:testnet",
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      return res; // res.digest etc.
    },
    [account?.address, signAndExecute],
  );

  /**
   * Read WAL balance for the connected wallet (or any address)
   */
  const getWalBalance = useCallback(
    async (address?: string) => {
      const owner = address ?? account?.address;
      if (!owner) {
        throw new Error("No wallet connected.");
      }

      try {
        const balance = await suiClient.getBalance({
          owner,
          coinType: WAL_TOKEN_TYPE,
        });

        // balance.totalBalance is a string, return 0 if not found
        return BigInt(balance.totalBalance || "0");
      } catch (error) {
        // If coin type doesn't exist or other error, return 0
        console.warn("Error fetching WAL balance:", error);
        return BigInt(0);
      }
    },
    [account?.address, suiClient],
  );

  /**
   * Read SUI balance for the connected wallet (or any address)
   */
  const getSuiBalance = useCallback(
    async (address?: string) => {
      const owner = address ?? account?.address;
      if (!owner) {
        throw new Error("No wallet connected.");
      }

      const balance = await suiClient.getBalance({
        owner,
        coinType: "0x2::sui::SUI",
      });

      return BigInt(balance.totalBalance); // in MIST
    },
    [account?.address, suiClient],
  );

  return {
    address: account?.address ?? null,
    connected: !!account?.address,
    convertSuiToWal,
    getWalBalance,
    getSuiBalance,
  };
}

