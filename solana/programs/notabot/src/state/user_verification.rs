use anchor_lang::prelude::*;

#[account]
pub struct UserVerification {
    pub user: Pubkey,
    pub is_verified: bool,
    pub source: String,
    pub unique_id: String,
    pub timestamp: i64,
    pub trust_score: u64,
    pub bump: u8,
}

impl UserVerification {
    pub const MAX_SOURCE_LEN: usize = 32;
    pub const MAX_UNIQUE_ID_LEN: usize = 64;
    
    pub const SPACE: usize = 8 +
        32 +
        1 +
        4 + Self::MAX_SOURCE_LEN +
        4 + Self::MAX_UNIQUE_ID_LEN +
        8 +
        8 +
        1;
}

