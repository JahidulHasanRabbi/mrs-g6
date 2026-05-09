import { API_OPTIONS } from './apiOptions';

export function formatTokens(tokens) {
  return parseFloat(tokens).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function mapMemberInfoToProfileCard(apiResponse) {
  return {
    name: apiResponse.username,
    totalTokens: formatTokens(apiResponse.current_tokens),
    currentLevel: apiResponse.tier,
    tierId: apiResponse.tier_id,
    totalDeposit: apiResponse.total_deposit
  };
}

export function mapProfileDataToForm(apiResponse) {
  // Helper function to find the key for a given value in API_OPTIONS
  const findOptionKey = (optionType, stringValue) => {
    if (!stringValue) return '';
    const options = API_OPTIONS[optionType];
    if (!options) return '';
    
    // Find the key where the value matches (case-insensitive)
    const entry = Object.entries(options).find(
      ([key, value]) => value.toLowerCase() === stringValue.toLowerCase()
    );
    
    return entry ? parseInt(entry[0], 10) : '';
  };
  
  return {
    full_name: apiResponse.full_name || '',
    email: apiResponse.email || '',
    date_of_birth: apiResponse.date_of_birth || '',
    gender: typeof apiResponse.gender === 'number' 
      ? apiResponse.gender 
      : findOptionKey('GENDER', apiResponse.gender),
    hobby: typeof apiResponse.hobby === 'number'
      ? apiResponse.hobby
      : findOptionKey('HOBBY', apiResponse.hobby),
    free_token_flag: apiResponse.free_token_flag
  };
}

export function mapFormDataToProfileUpdate(formData) {
  const payload = {};
  // Only include fields with values
  if (formData.full_name) payload.full_name = formData.full_name;
  if (formData.email) payload.email = formData.email;
  if (formData.date_of_birth) payload.date_of_birth = formData.date_of_birth;
  
  // Convert gender and hobby to integer enums
  if (formData.gender) payload.gender = parseInt(formData.gender, 10);
  if (formData.hobby) payload.hobby = parseInt(formData.hobby, 10);
  
  return payload;
}

export function mapLuckySpinSequences(apiResponse) {
  return apiResponse.map(seq => ({
    uuid: seq.uuid,
    item_order: seq.item_order,
    item_name: seq.item_name,
    item_uuid: seq.item_uuid
  }));
}

export function mapLuckySpinItems(apiResponse) {
  return apiResponse.map(item => ({
    uuid: item.uuid,
    reward_name: item.reward_name,
    image: item.image,
    item_type: item.item_type,
    min_withdraw: item.min_withdraw,
    max_withdraw: item.max_withdraw,
    token_amount: item.token_amount,
    quantity: item.quantity,
    unlimited: item.unlimited
  }));
}

export function mapRedemptionItems(apiResponse) {
  return apiResponse.map(item => {
    const originalPrice = item.tokens_needed;
    // Promotion is the actual discount price, not a percentage
    const promotionPrice = parseFloat(item.promotion) || 0;
    
    // If promotion exists (> 0), use it as discount price
    // Otherwise, use the original price
    const discountPrice = promotionPrice > 0 ? promotionPrice : originalPrice;
    
    const rawCategory = (item.category || item.tier_required || item.tier || "")
      .toString()
      .trim()
      .toLowerCase();
    const category = ["starter", "premium", "exclusive", "vip"].includes(rawCategory)
      ? rawCategory
      : "starter";

    return {
      uuid: item.uuid,
      title: item.name,
      coins: item.tokens_needed,
      originalPrice: promotionPrice > 0 ? originalPrice : null, // Show original only if there's promotion
      discountPrice: discountPrice,
      image: item.image,
      quantity_available: item.quantity_available,
      start_date: item.start_date,
      end_date: item.end_date,
      prize_type: item.prize_type,
      credit_amount: item.credit_amount,
      promotion: promotionPrice,
      category
    };
  });
}

export function mapVipTiers(apiResponse) {
  return apiResponse.map(tier => ({
    name: tier.name,
    lifetime_deposit_required: tier.lifetime_deposit_required,
    monthly_deposit: tier.monthly_deposit,
    check_in_token: tier.check_in_token,
    upgrade_free_token: tier.upgrade_free_token,
    upgrade_bonus: tier.upgrade_bonus,
    monthly_loyalty_bonus: tier.monthly_loyalty_bonus,
    birthday_bonus: tier.birthday_bonus
  }));
}

export function mapSpinResults(apiResponse) {
  // Handle different response structures
  let results;
  
  if (Array.isArray(apiResponse)) {
    // Already an array (ten-spin, fifty-spin, etc.)
    results = apiResponse;
  } else if (apiResponse && typeof apiResponse === 'object') {
    // Single object (one-spin) - wrap in array
    if (apiResponse.uuid && apiResponse.reward_name !== undefined) {
      results = [apiResponse];
    } else {
      // Check for nested data
      results = apiResponse.results || apiResponse.data || [];
    }
  } else {
    results = [];
  }
  
  if (!Array.isArray(results)) {
    console.error('Unexpected spin response format:', apiResponse);
    return [];
  }
  
  return results.map(result => ({
    uuid: result.uuid,
    reward_name: result.reward_name,
    image: result.image,
    credit_amount: result.credit_amount || null
  }));
}
