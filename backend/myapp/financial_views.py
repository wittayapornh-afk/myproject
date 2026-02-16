from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Avg, Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Order, User, Coupon
from decimal import Decimal

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_coupon_simulate_api(request):
    """
    Simulate financial impact of a coupon draft.
    """
    try:
        data = request.data
        discount_type = data.get('discount_type', 'fixed')
        discount_value = Decimal(str(data.get('discount_value', 0)))
        usage_limit = int(data.get('usage_limit', 100))
        min_spend = Decimal(str(data.get('min_spend', 0)))
        
        # 1. Calculate Average Order Value (AOV) - Last 90 Days
        last_90_days = timezone.now() - timedelta(days=90)
        aov_agg = Order.objects.filter(
            created_at__gte=last_90_days, 
            status__in=['paid', 'shipped', 'delivered']
        ).aggregate(avg_val=Avg('total_price'))
        
        avg_order_value = aov_agg['avg_val'] or Decimal('500.00') # Default fallback
        
        # 2. Calculate Max Liability (Budget Risk)
        max_liability = Decimal('0.00')
        if discount_type == 'fixed':
            max_liability = usage_limit * discount_value
        elif discount_type == 'percent':
            # Estimate: Based on AOV
            # Risk is capped by max_discount_amount if present, else AOV
            max_cap = Decimal(str(data.get('max_discount_amount') or 0))
            if max_cap > 0:
                 avg_discount = min(avg_order_value * discount_value / 100, max_cap)
            else:
                 avg_discount = avg_order_value * discount_value / 100
            
            max_liability = usage_limit * avg_discount
            
        # 3. Potential Reach (Active Users)
        active_users_count = User.objects.filter(is_active=True).count()
        
        # 4. Estimated Revenue (Gross)
        # Conservative: user spends just min_spend ? No, likely AOV.
        # But if min_spend > AOV, then use min_spend.
        revenue_per_order = max(avg_order_value, min_spend)
        est_revenue = usage_limit * revenue_per_order
        
        return Response({
            'avg_order_value': round(avg_order_value, 2),
            'max_liability': round(max_liability, 2),
            'potential_reach': active_users_count,
            'est_revenue': round(est_revenue, 2),
            'break_even_roas': round(est_revenue / max_liability, 2) if max_liability > 0 else 0
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
