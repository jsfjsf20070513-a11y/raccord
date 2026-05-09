# class_anchor — Anchor program (Solana devnet)

A minimal Solana program written for Dev3pack 2026 to satisfy the
**Solana track Qualification Requirement**:

> Must be a unique Solana program written in Rust using any framework
> (Quasar/Anchor/Pinocchio/vanilla Rust) and deployed at least to devnet.

The program is the smallest meaningful piece of on-chain logic that
fits the project's "class collective memory" theme: every call mints
a new PDA owned by the signer that stores a bilingual statement
(≤ 200 chars), a wall-clock timestamp, and a caller-supplied nonce.

## Deployment

| Field | Value |
|---|---|
| Cluster | Solana **devnet** |
| Program name | `class_anchor` |
| Source | [`programs/class-anchor/src/lib.rs`](../programs/class-anchor/src/lib.rs) |
| Framework | **Anchor 0.29** (Rust) |
| **Program ID** | `Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu` |
| Latest deploy / IDL transaction | [`3t33ioCpWyHZ6uWGyZvaJBwejhANxs6DGFMnL2ucXSc7Tr8kxUhGe53AwL4BWMGfu3BLv4hhtch7fmVr6umgVXgo`](https://solscan.io/tx/3t33ioCpWyHZ6uWGyZvaJBwejhANxs6DGFMnL2ucXSc7Tr8kxUhGe53AwL4BWMGfu3BLv4hhtch7fmVr6umgVXgo?cluster=devnet) |
| Program account on Solscan | [`Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu`](https://solscan.io/account/Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu?cluster=devnet) |
| Solana Playground project | Built and deployed in [Solana Playground](https://beta.solpg.io) on 2026-05-09 |
| IDL | [`src/lib/classAnchor.idl.json`](../src/lib/classAnchor.idl.json) (Anchor 0.29 format — `isMut` / `isSigner` / `publicKey` field names) |

### Independent on-chain verification

```bash
solana account Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu \
  --url https://api.devnet.solana.com
```

Returns:

```
executable: true
owner:      BPFLoaderUpgradeab1e11111111111111111111111
type:       program
lamports:   1,398,960
```

The program is executable, owned by the upgradeable BPF loader,
and unique to this hackathon submission — meeting the Solana
track Qualification Requirement above.

### Demo entry point

The program has a dedicated demo page at
[`/witness`](https://www.rucmathclass.com/witness) (route in
[`src/App.jsx`](../src/App.jsx); component in
[`src/pages/SolanaWitness.jsx`](../src/pages/SolanaWitness.jsx)).
That page connects Phantom on devnet, calls
`anchor_statement(nonce, statement)` against the program, and
reads back every PDA owned by the connected wallet using
`program.account.classAnchor.all` filtered by author memcmp.

### First production-site `anchor_statement` call (2026-05-09)

| Field | Value |
|---|---|
| Wallet (signer) | `Fo7H3z7r47RSJs7jLLQGdgcShUrdC9o3yWx1fmrigHJQ` (the project's seed class wallet) |
| Statement | `2026 春季黑客松 — 第一笔从 production 站点写的 anchor` |
| Nonce | `1778311679695` (Unix-millis at submission time) |
| PDA | [`65RxSkm4UtE8tbAknGxRe9LCfDssJtGaAvZAmXDaC2G8`](https://solscan.io/account/65RxSkm4UtE8tbAknGxRe9LCfDssJtGaAvZAmXDaC2G8?cluster=devnet) |
| Transaction | [`TLYjToQB…m9vX`](https://solscan.io/tx/TLYjToQBbvDioD8NqByiBxhH6UqSgftss29NJ6LAxSZKTENLYdHFtfYrq27pEXRHZnJUY7H6y7PMjub2Qtmm9vX?cluster=devnet) |
| Verified by | A live `program.account.classAnchor.all([memcmp on author])` round-trip on `/witness §03` immediately after the write |

This is the project's first public proof that the deployed
program accepts external signers, mints a unique PDA per
`(signer, nonce)`, emits a `StatementAnchored` event, and is
read-back-verifiable end to end without a third-party indexer.

## Instruction

### `anchor_statement(nonce: u64, statement: String) -> Result<()>`

| Account | Mut | Signer | Description |
|---|---|---|---|
| `class_anchor` | ✅ | — | PDA seeded by `[b"class_anchor", signer, nonce_le_bytes]`, init-paid by signer |
| `signer` | ✅ | ✅ | The wallet anchoring its own statement |
| `system_program` | — | — | Standard System Program for the `init` |

`require!(statement.len() <= 200, StatementTooLong)` is the only
runtime check. The PDA seed includes a caller-supplied `nonce` so a
single wallet can anchor multiple statements without seed collision.

## Account state

```
ClassAnchor {
    author: Pubkey,    // 32 bytes — set to ctx.accounts.signer.key()
    statement: String, // 4 byte length + ≤ 200 utf-8 bytes
    timestamp: i64,    //  8 bytes — Clock::get()?.unix_timestamp at write time
    nonce: u64,        //  8 bytes — caller-supplied, used as PDA seed
    bump: u8,          //  1 byte
}

// Total init size: 8 (Anchor discriminator) + 32 + 4 + 200 + 8 + 8 + 1 = 261 bytes
```

## Reproducible build (Solana Playground)

1. Open https://beta.solpg.io.
2. Create a new Anchor project, name it `class_anchor`.
3. Replace the generated `src/lib.rs` with [`programs/class-anchor/src/lib.rs`](../programs/class-anchor/src/lib.rs).
4. Switch the cluster selector (bottom-left) to **Devnet**.
5. Top up the Playground wallet from https://faucet.solana.com (≈ 5 SOL).
6. Build → Deploy → record the program ID + the deploy tx signature.
7. Export the IDL JSON, save it as `src/lib/classAnchorIdl.json`.

## Reproducible build (local Anchor CLI)

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest
solana config set --url devnet
solana airdrop 2 && solana airdrop 2
anchor build
anchor keys list                # capture the program ID
# update declare_id!() in lib.rs and the address in Anchor.toml
anchor build                    # rebuild with the real ID
anchor deploy --provider.cluster devnet
```

## Front-end client

[`src/lib/classAnchorProgram.js`](../src/lib/classAnchorProgram.js)
hand-builds the borsh-encoded `anchor_statement` instruction so the
browser bundle does not need to import `@coral-xyz/anchor` at
runtime. The wallet signing flow reuses the same Phantom
`signAndSendTransaction` path as the SPL Memo button — see
[`src/lib/solanaMemo.js`](../src/lib/solanaMemo.js).

## License

MIT, same as the rest of the repository (see [`LICENSE`](../LICENSE)).
