use anchor_lang::prelude::*;
use crate::state::UserVerification;

#[derive(Accounts)]
pub struct InitializeVerification<'info> {
    #[account(
        init,
        seeds = [b"verification", user.key().as_ref()],
        bump,
        payer = payer,
        space = UserVerification::SPACE
    )]
    pub verification: Account<'info, UserVerification>,
    pub user: SystemAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeVerification>) -> Result<()> {
    let verification = &mut ctx.accounts.verification;
    let clock = Clock::get()?;
    
    verification.user = ctx.accounts.user.key();
    verification.is_verified = false;
    verification.source = String::new();
    verification.unique_id = String::new();
    verification.timestamp = clock.unix_timestamp;
    verification.trust_score = 0;
    verification.bump = ctx.bumps.verification;
    
    msg!("initialized verification PDA for user: {}", verification.user);
    
    Ok(())
}

