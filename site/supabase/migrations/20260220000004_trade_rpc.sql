-- site/supabase/migrations/20260220000004_trade_rpc.sql

CREATE OR REPLACE FUNCTION execute_trade(
  p_user_id UUID,
  p_symbol TEXT,
  p_quantity NUMERIC,
  p_type TEXT,
  p_price NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_total_cost NUMERIC;
  v_current_balance NUMERIC;
  v_existing_quantity NUMERIC;
  v_existing_avg_price NUMERIC;
  v_new_quantity NUMERIC;
  v_new_avg_price NUMERIC;
  v_position_id UUID;
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;
  
  IF p_type NOT IN ('buy', 'sell') THEN
    RAISE EXCEPTION 'Invalid trade type';
  END IF;

  v_total_cost := p_quantity * p_price;

  -- Lock the user profile for update to prevent concurrent modifications
  SELECT paper_balance INTO v_current_balance
  FROM user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Lock the portfolio position if it exists
  SELECT id, quantity, average_price INTO v_position_id, v_existing_quantity, v_existing_avg_price
  FROM portfolio
  WHERE user_id = p_user_id AND symbol = p_symbol
  FOR UPDATE;

  IF p_type = 'buy' THEN
    IF v_current_balance < v_total_cost THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Deduct balance
    UPDATE user_profiles
    SET paper_balance = paper_balance - v_total_cost
    WHERE id = p_user_id;

    -- Update or insert position
    IF v_position_id IS NOT NULL THEN
      v_new_quantity := v_existing_quantity + p_quantity;
      v_new_avg_price := ((v_existing_quantity * v_existing_avg_price) + v_total_cost) / v_new_quantity;
      
      UPDATE portfolio
      SET quantity = v_new_quantity, average_price = v_new_avg_price
      WHERE id = v_position_id;
    ELSE
      INSERT INTO portfolio (user_id, symbol, quantity, average_price)
      VALUES (p_user_id, p_symbol, p_quantity, p_price);
    END IF;

  ELSIF p_type = 'sell' THEN
    IF v_position_id IS NULL OR v_existing_quantity < p_quantity THEN
      RAISE EXCEPTION 'Insufficient position quantity';
    END IF;

    -- Add to balance
    UPDATE user_profiles
    SET paper_balance = paper_balance + v_total_cost
    WHERE id = p_user_id;

    v_new_quantity := v_existing_quantity - p_quantity;
    
    IF v_new_quantity = 0 THEN
      DELETE FROM portfolio WHERE id = v_position_id;
    ELSE
      UPDATE portfolio
      SET quantity = v_new_quantity
      WHERE id = v_position_id;
    END IF;
  END IF;

  -- Record transaction
  INSERT INTO transactions (user_id, symbol, type, quantity, price, total)
  VALUES (p_user_id, p_symbol, p_type, p_quantity, p_price, v_total_cost);

  RETURN jsonb_build_object(
    'success', true,
    'message', format('Successfully executed %s order for %s %s', p_type, p_quantity, p_symbol)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
