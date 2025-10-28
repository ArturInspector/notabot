use anchor_lang::prelude::*;

// Program modules
pub mod instructions;
pub mod state;
pub mod errors;

// Re-exports
use instructions::*;
use state::*;
use errors::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod notabot {
    use super::*;

    /// Initialize verification PDA for a user
    pub fn initialize_verification(
        ctx: Context<InitializeVerification>
    ) -> Result<()> {
        instructions::initialize_verification::handler(ctx)
    }

    /// Verify user with proof from backend oracle
    pub fn verify_user(
        ctx: Context<VerifyUser>,
        source: String,
        unique_id: String,
    ) -> Result<()> {
        instructions::verify_user::handler(ctx, source, unique_id)
    }

    /// Check if user is verified (read-only)
    pub fn is_verified(
        ctx: Context<CheckVerified>
    ) -> Result<bool> {
        instructions::is_verified::handler(ctx)
    }

    /// Get user's trust score
    pub fn get_trust_score(
        ctx: Context<CheckVerified>
    ) -> Result<u64> {
        instructions::get_trust_score::handler(ctx)
    }
}

