use anchor_lang::prelude::*;
use crate::state::UserVerification;

#[derive(Accounts)]
pub struct CheckVerified<'info> {
    #[account(
        seeds = [b"verification", user.key().as_ref()],
        bump = verification.bump
    )]
    pub verification: Account<'info, UserVerification>,
    pub user: AccountInfo<'info>,
}

pub fn handler(ctx: Context<CheckVerified>) -> Result<bool> {
    let verification = &ctx.accounts.verification;
    Ok(verification.is_verified)
}

