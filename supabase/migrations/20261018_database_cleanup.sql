BEGIN;

-- Payment webhook idempotency.
CREATE UNIQUE INDEX IF NOT EXISTS idx_treasury_transactions_payment_ref
  ON public.treasury_transactions (payment_ref);

-- Vault/API-key storage was removed from the application. Keep membership exit
-- independent from those legacy schemas.
CREATE OR REPLACE FUNCTION public.request_membership_exit(
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_member public.members%ROWTYPE;
  v_policy jsonb;
  v_min_days integer;
  v_earliest timestamptz;
  v_now timestamptz := now();
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  PERFORM set_config('app.membership_lifecycle_rpc', 'on', true);

  SELECT * INTO v_member FROM public.members WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Member profile not found'; END IF;
  IF v_member.membership_status <> 'active' OR v_member.reapply_blocked OR v_member.registration_status <> 'approved' THEN
    RAISE EXCEPTION 'Membership is not eligible for exit';
  END IF;
  IF v_member.membership_started_at IS NULL THEN
    RAISE EXCEPTION 'Membership start date is not recorded; exit requires maintainer processing';
  END IF;

  SELECT value INTO v_policy FROM public.community_settings WHERE key = 'membership_intake';
  IF v_policy IS NULL THEN RAISE EXCEPTION 'Membership policy is not configured'; END IF;
  v_min_days := (v_policy->>'minimum_active_days_before_exit')::integer;
  IF v_min_days IS NULL OR v_min_days < 0 THEN RAISE EXCEPTION 'Membership policy is misconfigured'; END IF;
  v_earliest := v_member.membership_started_at + make_interval(days => v_min_days);
  IF v_now < v_earliest THEN RAISE EXCEPTION 'Exit is available after %', v_earliest; END IF;

  UPDATE public.members
  SET membership_status = 'exited', is_active = false, reapply_blocked = true,
      exited_at = v_now, exit_reason = NULLIF(left(trim(coalesce(p_reason, '')), 500), ''), updated_at = v_now
  WHERE id = v_user_id AND membership_status = 'active' AND reapply_blocked = false;

  RETURN jsonb_build_object('exited_at', v_now, 'earliest_exit_at', v_earliest);
END;
$$;

REVOKE ALL ON FUNCTION public.request_membership_exit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_membership_exit(text) TO authenticated;

-- Remove the obsolete legacy key table after removing its foreign key dependency.
ALTER TABLE IF EXISTS public.members DROP CONSTRAINT IF EXISTS api_keys_user_id_fkey;
DROP TABLE IF EXISTS ubsi_api.api_keys;

COMMIT;
