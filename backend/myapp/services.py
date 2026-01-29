from django.utils import timezone
from django.db.models import F, Sum
from decimal import Decimal
from .models import Coupon, UserCoupon, FlashSale, FlashSaleProduct, Order, Product, PromotionSchedule, PromoUsageLog

class FlashSaleService:
    @staticmethod
    def get_active_flash_sale(product):
        """
        Get the currently active Flash Sale for a product.
        Returns FlashSaleProduct or None.
        """
        now = timezone.now()
        
        # Find active campaign logic V2 (Using PromotionSchedule for faster lookup could be future opt)
        flash_sales = FlashSale.objects.filter(
            is_active=True,
            start_time__lte=now,
            end_time__gte=now
        ).order_by('-priority', 'end_time') # Higher priority first
        
        if not flash_sales.exists():
            return None
            
        # Check if product is in this flash sale
        for sale in flash_sales:
            # Check Rounds V2
            if sale.rounds:
                current_time_str = now.strftime('%H:%M')
                is_in_round = False
                for r in sale.rounds:
                    if r['start'] <= current_time_str <= r['end']:
                        is_in_round = True
                        break
                if not is_in_round:
                    continue

            try:
                fs_product = FlashSaleProduct.objects.get(flash_sale=sale, product=product)
                if fs_product.is_available():
                    return fs_product
            except FlashSaleProduct.DoesNotExist:
                continue
                
        return None

    @staticmethod
    def validate_user_limit(flash_sale, user):
        """
        V2: Check campaign-level user limit
        """
        if not user or not user.is_authenticated:
            return True # Guest? Maybe block or allow based on policy. Let's allow view, but buy needs auth.

        # Count total items bought in this flash sale
        # This requires querying OrderItems linked to this Flash Sale
        # Simplified: Check usage log
        usage_count = PromoUsageLog.objects.filter(
            user=user, 
            promo_type='flash', 
            promo_id=flash_sale.id
        ).count()
        
        return usage_count < flash_sale.limit_per_user_total

class CouponService:
    @staticmethod
    def validate_coupon(user, coupon_code, cart_total, cart_items=None):
        """
        Validate coupon for a specific cart context.
        Returns (is_valid, message, coupon_obj)
        """
        now = timezone.now()
        
        try:
            coupon = Coupon.objects.get(code=coupon_code)
        except Coupon.DoesNotExist:
            return False, "ไม่พบรหัสคูปองนี้", None
            
        # 1. Basic Status
        if not coupon.active:
            return False, "ขออภัย คูปองนี้ถูกยกเลิกหรือหมดอายุการใช้งานแล้วครับ", None
        
        if not (coupon.start_date <= now <= coupon.end_date):
            return False, "คูปองนี้ยังไม่เปิดให้ใช้งาน หรือหมดเขตไปแล้วครับ", None
            
        # V2: Total Supply Check
        global_limit = max(coupon.total_supply, coupon.usage_limit)
        if coupon.used_count >= global_limit:
            return False, "เสียใจด้วยครับ สิทธิ์ของคูปองนี้ถูกใช้จองเต็มหมดแล้ว (Fully Redeemed)", None
            
        # 2. User Quota
        if user and user.is_authenticated:
            # Check Role (V2 target_user_roles)
            allowed_roles = coupon.target_user_roles or coupon.allowed_roles
            if allowed_roles:
                user_role = getattr(user, 'role', 'customer')
                if user_role not in allowed_roles:
                     # Friendly Message for New User
                     if 'new_user' in allowed_roles:
                         return False, "ขออภัยครับ คูปองนี้สำหรับสมาชิกใหม่เท่านั้น", None
                     return False, "ขออภัย คุณไม่ได้รับสิทธิ์ในการใช้คูปองนี้", None

            # V2: Daily Limit
            if coupon.limit_per_user_per_day > 0:
                daily_usage = PromoUsageLog.objects.filter(
                    user=user, 
                    promo_type='coupon', 
                    promo_id=coupon.id,
                    timestamp__date=now.date()
                ).count()
                if daily_usage >= coupon.limit_per_user_per_day:
                    return False, f"คุณใช้สิทธิ์ครบโควต้าต่อวันแล้ว ({coupon.limit_per_user_per_day} สิทธิ์)", None

            # V2: Campaign Limit (Check Wallet first)
            wallet_exists = UserCoupon.objects.filter(user=user, coupon=coupon).exists()
            if not wallet_exists:
                 # Logic for "Public Coupon" that user types in without collecting
                 # Check usage history
                 lifetime_usage = PromoUsageLog.objects.filter(user=user, promo_type='coupon', promo_id=coupon.id).count()
                 if lifetime_usage >= coupon.limit_per_user:
                     return False, "คุณใช้สิทธิ์ครบตามจำนวนที่กำหนดแล้ว", None

        # 3. Min Spend
        if cart_total < coupon.min_spend:
            return False, f"ยอดซื้อไม่ถึงขั้นต่ำ ({coupon.min_spend:,.2f} บาท)", None
            
        # 4. JSON Conditions (Exclude Categories/Products)
        if cart_items and coupon.conditions:
            exclude_cats = coupon.conditions.get('exclude_categories', [])
            exclude_products = coupon.conditions.get('exclude_products', [])
            
            valid_items_total = 0
            for item in cart_items:
                product = item.get('product') if isinstance(item, dict) else item.product
                
                # ✅ V2 Fix: Resolve Product from ID if missing (API Payload uses 'id')
                if not product and isinstance(item, dict):
                    p_id = item.get('id')
                    if not p_id: 
                        continue # Add check to avoid id=None query
                        
                    try:
                        product = Product.objects.get(id=p_id)
                    except (Product.DoesNotExist, ValueError): # Catch ValueError too
                        continue # Skip invalid item

                if not product: continue # Safety check

                price = item.get('price', product.price) # Handle dict or obj
                qty = item.get('quantity', 1)
                
                if product.category_id in exclude_cats or product.id in exclude_products:
                    continue # Skip this item for min_spend calc? Or fail? 
                    # Usually we just don't count it towards min_spend
                
                valid_items_total += price * qty
            
            if valid_items_total < coupon.min_spend:
                 return False, f"ยอดซื้อสินค้าที่ร่วมรายการไม่ถึงขั้นต่ำ ({coupon.min_spend:,.2f} บาท)", None

        return True, "คูปองใช้ได้", coupon

    @staticmethod
    def calculate_discount(coupon, original_price, shipping_cost=0):
        """
        Calculate discount amount based on type.
        Supports V2 Tiered Logic.
        """
        discount = Decimal(0)
        price = Decimal(original_price)
        shipping = Decimal(shipping_cost)
        
        # V2: Tiered Discount Logic
        if coupon.discount_type == 'tiered':
            # Rules example: [{'min': 3000, 'disc': 500}, {'min': 1000, 'disc': 100}]
            # Sort by min desc
            rules = sorted(coupon.tiered_rules, key=lambda x: x.get('min', 0), reverse=True)
            for rule in rules:
                if price >= Decimal(rule.get('min', 0)):
                    # Check if disc is fixed or percent? Assume fixed for now basic tiered
                    # Or check rule structure. Let's assume 'disc' is fixed amount.
                    discount = Decimal(rule.get('disc', 0))
                    break # Apply highest tier only
                    
        elif coupon.discount_type == 'fixed':
            discount = coupon.discount_value
        elif coupon.discount_type == 'percent' or coupon.discount_type == 'capped_percent':
            raw_discount = (price * coupon.discount_value) / Decimal(100)
            # Apply Cap if exists (Universal for percent & capped_percent)
            if coupon.max_discount_amount and raw_discount > coupon.max_discount_amount:
                discount = coupon.max_discount_amount
            else:
                discount = raw_discount
        elif coupon.discount_type == 'free_shipping':
            discount = shipping # Discount equals shipping cost
            return discount # Return immediately, do not cap at price (price usually exclude shipping)
            
        # Cap at price
        return min(discount, price)

class PriceCalculator:
    """
    The Brain: Compares and selects the best deal.
    """
    @staticmethod
    def calculate_best_item_price(product, user, quantity=1, applied_coupon=None):
        """
        Determine the best price for a single item type.
        Returns: {
            'final_price': Decimal,
            'source_type': 'normal' | 'flash_sale' | 'coupon',
            'ref_id': int | None,
            'discount_amount': Decimal
        }
        """
        base_price = product.price
        best_deal = {
            'final_price': base_price,
            'source_type': 'normal',
            'ref_id': None,
            'discount_amount': Decimal(0)
        }
        
        # 1. Check Flash Sale
        fs_product = FlashSaleService.get_active_flash_sale(product)
        if fs_product:
            flash_price = fs_product.sale_price
            if flash_price < best_deal['final_price']:
                best_deal = {
                    'final_price': flash_price,
                    'source_type': 'flash_sale',
                    'ref_id': fs_product.id,
                    'discount_amount': base_price - flash_price
                }
        
        # 2. Check Coupon (If applied)
        if applied_coupon:
            # Check Stackability
            is_flash_active = (best_deal['source_type'] == 'flash_sale')
            if is_flash_active and not applied_coupon.is_stackable_with_flash_sale:
                 # Conflict! Compare prices.
                 
                 # Coupon Value for this item
                 coupon_discount = CouponService.calculate_discount(applied_coupon, base_price)
                 coupon_price = base_price - coupon_discount
                 
                 # Logic: "Best Deal Wins"
                 if coupon_price < best_deal['final_price']:
                     # Coupon is cheaper -> Override Flash Sale
                     best_deal = {
                        'final_price': coupon_price,
                        'source_type': 'coupon_prorate',
                        'ref_id': applied_coupon.id,
                        'discount_amount': coupon_discount
                     }
                 else:
                     # Flash Sale is cheaper (or equal) -> Stick with Flash Sale
                     pass
            
            else:
                # No conflict (e.g. Normal item OR Stackable Coupon)
                # Calculate Coupon on top of current best price?
                # Usually Stackable means: Base -> Flash -> Coupon
                
                target_price = best_deal['final_price']
                coupon_discount = CouponService.calculate_discount(applied_coupon, target_price)
                
                # Update Best Deal (reduce price further)
                best_deal['final_price'] -= coupon_discount
                best_deal['discount_amount'] += coupon_discount
                if best_deal['source_type'] == 'normal':
                    best_deal['source_type'] = 'coupon_prorate'
                    best_deal['ref_id'] = applied_coupon.id
                # If Flash Sale, source stays 'flash_sale' but price drops? 
                # Or 'flash_sale_plus_coupon'? Let's keep formatted simple.
                
        return best_deal
