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
| Framework | Anchor (0.30.x) |
| Program ID | `_pending Session A deployment_` |
| Deploy transaction | `_pending_` |
| Solana Playground project | `_pending_` |
| IDL | [`src/lib/classAnchorIdl.json`](../src/lib/classAnchorIdl.json) (pinned post-deploy) |

> **Note**: this file is updated in the same commit that flips
> `IS_ANCHOR_PROGRAM_LIVE` to `true` in
> [`src/lib/classAnchorProgram.js`](../src/lib/classAnchorProgram.js).

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
