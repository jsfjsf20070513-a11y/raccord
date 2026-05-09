// `class_anchor` — a minimal Anchor program for Dev3pack 2026.
//
// Each call creates a new `ClassAnchor` PDA owned by the signer that
// stores a short bilingual statement (≤ 200 chars), the wall-clock
// timestamp, and a caller-supplied `nonce` so the same wallet can
// anchor multiple times without seed collision.
//
// Designed to be the smallest meaningful Solana program that satisfies
// the Solana track's Qualification Requirement:
//   "Must be a unique Solana program written in Rust using any
//    framework (Quasar/Anchor/Pinocchio/vanilla Rust) and deployed
//    at least to devnet."
//
// Deployed to Solana **devnet** during the hackathon. The deployed
// program ID and the deploy transaction signature are recorded in
// docs/anchor-program.md.

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111"); // Replace post-deploy.

#[program]
pub mod class_anchor {
    use super::*;

    /// Anchor a short bilingual statement on-chain. Each call creates
    /// a new `ClassAnchor` PDA owned by the signer; `nonce` lets the
    /// same wallet anchor multiple times without seed collision.
    pub fn anchor_statement(
        ctx: Context<AnchorStatement>,
        nonce: u64,
        statement: String,
    ) -> Result<()> {
        require!(
            statement.len() <= 200,
            ClassAnchorError::StatementTooLong
        );

        let class_anchor = &mut ctx.accounts.class_anchor;
        class_anchor.author = ctx.accounts.signer.key();
        class_anchor.statement = statement;
        class_anchor.timestamp = Clock::get()?.unix_timestamp;
        class_anchor.nonce = nonce;
        class_anchor.bump = ctx.bumps.class_anchor;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nonce: u64, statement: String)]
pub struct AnchorStatement<'info> {
    #[account(
        init,
        payer = signer,
        // 8 (Anchor discriminator)
        // + 32 (author: Pubkey)
        // + 4 + 200 (statement: String — borsh prefix + max bytes)
        // + 8 (timestamp: i64)
        // + 8 (nonce: u64)
        // + 1 (bump: u8)
        // = 261
        space = 8 + 32 + 4 + 200 + 8 + 8 + 1,
        seeds = [b"class_anchor", signer.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub class_anchor: Account<'info, ClassAnchor>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ClassAnchor {
    pub author: Pubkey,    // 32
    pub statement: String, // 4 + ≤ 200
    pub timestamp: i64,    // 8
    pub nonce: u64,        // 8
    pub bump: u8,          // 1
}

#[error_code]
pub enum ClassAnchorError {
    #[msg("Statement exceeds 200 character limit")]
    StatementTooLong,
}
