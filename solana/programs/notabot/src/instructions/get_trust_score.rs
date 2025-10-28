use anchor_lang::prelude::*;
use crate::instructions::CheckVerified;

pub fn handler(ctx: Context<CheckVerified>) -> Result<u64> {
    let verification = &ctx.accounts.verification;
    Ok(verification.trust_score)
}

