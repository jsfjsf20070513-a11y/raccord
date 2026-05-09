/**
 * class_anchor program client — Math Class Website hackathon submission.
 *
 * Talks to the on-chain `class_anchor` Anchor program deployed on devnet.
 * Lets a Phantom-connected user permanently anchor a short statement
 * (≤ 200 UTF-8 bytes) and read back what they (or anyone) has anchored.
 *
 * Setup checklist:
 *   1. `npm install @solana/web3.js @coral-xyz/anchor bn.js`
 *   2. Drop the IDL JSON exported from Solana Playground at
 *      `src/lib/classAnchor.idl.json`. (This file imports it.)
 *   3. Make sure Phantom is installed in the browser and the user has
 *      switched it to **Devnet** before calling `anchorStatement`.
 */

import { Buffer } from 'buffer';
import {
  Connection,
  PublicKey,
  SystemProgram,
  clusterApiUrl,
} from '@solana/web3.js';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';

import idlJson from './classAnchor.idl.json';

export const PROGRAM_ID = new PublicKey(
  'Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu'
);

export const CLUSTER = 'devnet';
export const RPC_ENDPOINT = clusterApiUrl(CLUSTER);

const SEED_PREFIX = new TextEncoder().encode('class_anchor');

const u64LeBytes = (value) => {
  const bn = BN.isBN(value) ? value : new BN(value);
  return bn.toArrayLike(Buffer, 'le', 8);
};

export const deriveAnchorPda = (author, nonce) => {
  const authorKey = author instanceof PublicKey ? author : new PublicKey(author);
  return PublicKey.findProgramAddressSync(
    [SEED_PREFIX, authorKey.toBuffer(), u64LeBytes(nonce)],
    PROGRAM_ID
  );
};

export const getConnection = () =>
  new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });

const phantomWallet = () => {
  const provider = typeof window !== 'undefined' && window.solana;
  if (!provider || !provider.isPhantom) {
    throw new Error(
      'Phantom wallet not found. Install Phantom and switch it to Devnet.'
    );
  }
  return provider;
};

const ensureConnected = async (wallet) => {
  if (wallet.publicKey) return wallet.publicKey;
  const { publicKey } = await wallet.connect();
  return publicKey;
};

const buildProgram = (wallet, connection) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
  // Anchor 0.29 constructor: (idl, programId, provider). The Playground-exported
  // IDL is in 0.29 format (isMut/isSigner/publicKey), so we pin the SDK to
  // 0.29.x and pass programId explicitly.
  return new Program(idlJson, PROGRAM_ID, provider);
};

const utf8ByteLength = (s) => new TextEncoder().encode(s).length;

/**
 * Anchor a statement on-chain. Returns the tx signature, the PDA, the nonce,
 * and a Solscan link for convenience.
 */
export const anchorStatement = async (statement) => {
  if (!statement || statement.length === 0) {
    throw new Error('Statement must not be empty');
  }
  const byteLength = utf8ByteLength(statement);
  if (byteLength > 200) {
    throw new Error(
      `Statement is ${byteLength} bytes; the program rejects anything over 200`
    );
  }

  const wallet = phantomWallet();
  const publicKey = await ensureConnected(wallet);
  const connection = getConnection();
  const program = buildProgram(wallet, connection);

  const nonce = new BN(Date.now());
  const [pda] = deriveAnchorPda(publicKey, nonce);

  const signature = await program.methods
    .anchorStatement(nonce, statement)
    .accounts({
      classAnchor: pda,
      signer: publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return {
    signature,
    pda,
    nonce: nonce.toString(),
    explorerTx: `https://solscan.io/tx/${signature}?cluster=${CLUSTER}`,
    explorerAccount: `https://solscan.io/account/${pda.toBase58()}?cluster=${CLUSTER}`,
  };
};

/** Fetch every anchor for a given author pubkey (read-only, no wallet needed). */
export const fetchAnchorsByAuthor = async (authorPubkey) => {
  const author =
    authorPubkey instanceof PublicKey
      ? authorPubkey
      : new PublicKey(authorPubkey);

  const connection = getConnection();
  const readOnlyWallet = {
    publicKey: author,
    signTransaction: async () => {
      throw new Error('Read-only wallet cannot sign');
    },
    signAllTransactions: async () => {
      throw new Error('Read-only wallet cannot sign');
    },
  };
  const program = buildProgram(readOnlyWallet, connection);

  const accounts = await program.account.classAnchor.all([
    {
      memcmp: {
        offset: 8,
        bytes: author.toBase58(),
      },
    },
  ]);

  return accounts
    .map(({ publicKey, account }) => ({
      pda: publicKey.toBase58(),
      author: account.author.toBase58(),
      statement: account.statement,
      timestamp: account.timestamp.toNumber(),
      nonce: account.nonce.toString(),
      bump: account.bump,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const programExplorerLink = () =>
  `https://solscan.io/account/${PROGRAM_ID.toBase58()}?cluster=${CLUSTER}`;
