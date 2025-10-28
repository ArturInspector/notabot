use anchor_lang::prelude::*;
use crate::state::UserVerification;
use crate::errors::NotABotError;

pub const ORACLE_AUTHORITY: Pubkey = solana_program::pubkey!("11111111111111111111111111111111");

#[derive(Accounts)]
pub struct VerifyUser<'info> {
    #[account(
        mut,
        seeds = [b"verification", user.key().as_ref()],
        bump = verification.bump
    )]
    pub verification: Account<'info, UserVerification>,
    
    #[account(constraint = authority.key() == ORACLE_AUTHORITY @ NotABotError::Unauthorized)]
    pub authority: Signer<'info>,
    pub user: AccountInfo<'info>,
}
pub fn handler(
    ctx: Context<VerifyUser>,
    source: String,
    unique_id: String
) -> Result<()> {
    require!(source.len() <= UserVerification::MAX_SOURCE_LEN, NotABotError::SourceTooLong);
    require!(unique_id.len() <= UserVerification::MAX_UNIQUE_ID_LEN, NotABotError::UniqueIdTooLong);
    let verification = &mut ctx.accounts.verification;
    let clock = Clock::get()?;
    
    verification.is_verified = true;
    verification.source = source;
    verification.unique_id = unique_id;
    verification.timestamp = clock.unix_timestamp;
    verification.trust_score = 100;
    msg!("user verified: {}, source: {}", verification.user, verification.source);
    Ok(())
}

