use anchor_lang::prelude::*;

// Deployed by Solana Playground on devnet (2026-05-09).
declare_id!("Cmv8pnxAaCfo8PtMZowcKTRv85Y5BvT7U2zYfspBC4fu");

/// `class_anchor` lets any signer permanently anchor a short statement
/// (up to 200 bytes of UTF-8) on Solana. Each call creates a fresh PDA
/// derived from the signer's pubkey and a caller-chosen nonce, so a single
/// user can anchor an unbounded number of statements without overwrites.
#[program]
pub mod class_anchor {
    use super::*;

    pub fn anchor_statement(
        ctx: Context<AnchorStatement>,
        nonce: u64,
        statement: String,
    ) -> Result<()> {
        require!(!statement.is_empty(), ClassAnchorError::StatementEmpty);
        require!(statement.len() <= 200, ClassAnchorError::StatementTooLong);

        let class_anchor = &mut ctx.accounts.class_anchor;
        class_anchor.author = ctx.accounts.signer.key();
        class_anchor.statement = statement;
        class_anchor.timestamp = Clock::get()?.unix_timestamp;
        class_anchor.nonce = nonce;
        class_anchor.bump = ctx.bumps.class_anchor;

        emit!(StatementAnchored {
            author: class_anchor.author,
            nonce: class_anchor.nonce,
            timestamp: class_anchor.timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nonce: u64, statement: String)]
pub struct AnchorStatement<'info> {
    #[account(
        init,
        payer = signer,
        space = ClassAnchor::SPACE,
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
    pub statement: String, // 4 + 200
    pub timestamp: i64,    // 8
    pub nonce: u64,        // 8
    pub bump: u8,          // 1
}

impl ClassAnchor {
    // 8 (discriminator) + 32 + (4 + 200) + 8 + 8 + 1 = 261 bytes.
    pub const SPACE: usize = 8 + 32 + 4 + 200 + 8 + 8 + 1;
}

#[event]
pub struct StatementAnchored {
    pub author: Pubkey,
    pub nonce: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ClassAnchorError {
    #[msg("Statement must not be empty")]
    StatementEmpty,
    #[msg("Statement exceeds 200 byte limit (~66 Chinese chars / 200 ASCII)")]
    StatementTooLong,
}
