-- Close the Pakasir webhook idempotency race: a UNIQUE index on payment_ref
-- makes duplicate concurrent deliveries fail at insert time (23505) instead of
-- double-crediting dues between the existence check and the insert.
-- Existing NULL payment_refs (manual treasury entries) are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS idx_treasury_transactions_payment_ref
  ON public.treasury_transactions (payment_ref);
