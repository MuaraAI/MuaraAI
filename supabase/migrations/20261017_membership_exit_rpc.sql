BEGIN;

CREATE OR REPLACE FUNCTION public.request_membership_exit(
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, ai, ubsi_api
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_member public.members%ROWTYPE;
  v_policy jsonb;
  v_min_days integer;
  v_earliest timestamptz;
  v_now timestamptz := now();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_member
  FROM public.members
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member profile not found';
  END IF;

  IF v_member.membership_status <> 'active'
     OR v_member.reapply_blocked
     OR v_member.registration_status <> 'approved' THEN
    RAISE EXCEPTION 'Membership is not eligible for exit';
  END IF;

  IF v_member.hierarchy = 'maintainer' AND v_member.membership_started_at IS NULL THEN
    RAISE EXCEPTION 'Historical Founder/Maintainer exit requires maintainer processing';
  END IF;

  SELECT value INTO v_policy
  FROM public.community_settings
  WHERE key = 'membership_intake';

  IF v_policy IS NULL THEN
    RAISE EXCEPTION 'Membership policy is not configured';
  END IF;

  v_min_days := (v_policy->>'minimum_active_days_before_exit')::integer;
  v_earliest := v_member.membership_started_at + make_interval(days => v_min_days);

  IF v_now < v_earliest THEN
    RAISE EXCEPTION 'Exit is available after %', v_earliest;
  END IF;

  UPDATE public.members
  SET membership_status = 'exited',
      is_active = false,
      reapply_blocked = true,
      exited_at = v_now,
      exit_reason = NULLIF(left(trim(coalesce(p_reason, '')), 500), ''),
      updated_at = v_now
  WHERE id = v_user_id
    AND membership_status = 'active'
    AND reapply_blocked = false;

  UPDATE ai.api_keys SET is_active = false WHERE user_id = v_user_id;
  UPDATE ubsi_api.api_keys SET is_active = false WHERE user_id = v_user_id;

  RETURN jsonb_build_object('exited_at', v_now, 'earliest_exit_at', v_earliest);
END;
$$;

REVOKE ALL ON FUNCTION public.request_membership_exit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_membership_exit(text) TO authenticated;

COMMIT;
