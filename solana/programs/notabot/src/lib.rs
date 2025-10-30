use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;
use state::*;
use errors::*;

declare_id!("B2SGdLXWxVssPDBHB8WwKwhwdP9CLWDvBfXr1EtYZtye");

#[program]
pub mod notabot {
    use super::*;

    pub fn initialize_verification(
        ctx: Context<InitializeVerification>
    ) -> Result<()> {
        instructions::initialize_verification::handler(ctx)
    }

    pub fn verify_user(
        ctx: Context<VerifyUser>,
        source: String,
        unique_id: String,
    ) -> Result<()> {
        instructions::verify_user::handler(ctx, source, unique_id)
    }
    pub fn is_verified(
        ctx: Context<CheckVerified>
    ) -> Result<bool> {
        instructions::is_verified::handler(ctx)
    }
    pub fn get_trust_score(
        ctx: Context<CheckVerified>
    ) -> Result<u64> {
        instructions::get_trust_score::handler(ctx)
    }
}

