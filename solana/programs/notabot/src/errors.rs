use anchor_lang::prelude::*;

#[error_code]
pub enum NotABotError {
    #[msg("User is already verified")]
    AlreadyVerified,
    
    #[msg("Invalid verification proof")]
    InvalidProof,
    #[msg("Authority not authorized to verify users")]
    Unauthorized,
    #[msg("User not verified")]
    NotVerified,
    
    #[msg("Source string too long (max 32 characters)")]
    SourceTooLong,
    
    #[msg("Unique ID string too long (max 64 characters)")]
    UniqueIdTooLong,
    
    #[msg("Verification has expired")]
    VerificationExpired,
}

