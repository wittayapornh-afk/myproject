from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta
from .models import FlashSale, FlashSaleProduct, Tag, Product, Coupon, Order, OrderItem, UserCoupon
from decimal import Decimal

# ==========================================
# 📊 Flash Sale Analytics
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flash_sale_analytics_api(request, fs_id):
    """
    Get analytics for a specific Flash Sale
    """
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    try:
        flash_sale = FlashSale.objects.get(id=fs_id)
        
        # Get all products in this flash sale
        fs_products = FlashSaleProduct.objects.filter(flash_sale=flash_sale).select_related('product')
        
        # Calculate metrics
        total_products = fs_products.count()
        total_sold = fs_products.aggregate(total=Sum('sold_count'))['total'] or 0
        total_quota = fs_products.aggregate(total=Sum('quantity_limit'))['total'] or 0
        
        # Revenue calculation (sold products × sale_price)
        total_revenue = sum(
            Decimal(fp.sold_count) * Decimal(fp.sale_price)
            for fp in fs_products
        )
        
        # Sell-through rate
        sell_through_rate = (total_sold / total_quota * 100) if total_quota > 0 else 0
        
        # Top performing products
        top_products = fs_products.order_by('-sold_count')[:5]
        top_products_data = [{
            'product_id': fp.product.id,
            'product_name': fp.product.title,
            'sold': fp.sold_count,
            'quota': fp.quantity_limit,
            'revenue': float(fp.sold_count * fp.sale_price),
            'sell_rate': float((fp.sold_count / fp.quantity_limit * 100) if fp.quantity_limit > 0 else 0)
        } for fp in top_products]
        
        # Status
        now = timezone.now()
        status = 'ended' if now > flash_sale.end_time else ('live' if now >= flash_sale.start_time else 'upcoming')
        
        return Response({
            'flash_sale': {
                'id': flash_sale.id,
                'name': flash_sale.name,
                'status': status,
                'start_time': flash_sale.start_time,
                'end_time': flash_sale.end_time
            },
            'metrics': {
                'total_products': total_products,
                'total_sold': total_sold,
                'total_quota': total_quota,
                'total_revenue': float(total_revenue),
                'sell_through_rate': round(sell_through_rate, 2),
                'avg_price': float(total_revenue / total_sold) if total_sold > 0 else 0
            },
            'top_products': top_products_data
        })
    except FlashSale.DoesNotExist:
        return Response({"error": "Flash Sale not found"}, status=404)


# ==========================================
# 🏷️ Tag Analytics
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tag_analytics_api(request):
    """
    Get analytics for all tags - Optimized for TagManagement.jsx
    """
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    # Get all active tags with product counts
    tags = Tag.objects.filter(is_active=True).annotate(
        product_count_annotated=Count('products', filter=Q(products__is_active=True))
    ).order_by('-product_count_annotated')
    
    tag_performance = []
    total_revenue_accumulated = Decimal('0.00')
    total_tagged_products_set = set()
    
    for tag in tags:
        # Get products for this tag
        products = Product.objects.filter(tags=tag, is_active=True)
        tag_product_count = products.count()
        
        if tag_product_count > 0:
            for p in products:
                total_tagged_products_set.add(p.id)
        
        # Calculate revenue for this tag (via OrderItems)
        # Fix: use 'order_items' relationship instead of 'orderitem'
        tag_items = OrderItem.objects.filter(
            product__tags=tag,
            order__status__in=['Paid', 'Processing', 'Shipped', 'Completed']
        )
        
        # Calculate total revenue for this tag
        tag_revenue = sum(
            Decimal(item.price_at_purchase) * item.quantity 
            for item in tag_items
        )
        total_revenue_accumulated += tag_revenue
        
        # Reach simulation
        simulated_reach = (tag_product_count * 150) + (tag_items.count() * 12)
        
        # Conversion rate (%)
        sold_count = tag_items.values('product').distinct().count()
        conversion_rate = (sold_count / tag_product_count * 100) if tag_product_count > 0 else 0
        
        tag_performance.append({
            'id': tag.id,
            'name': tag.name,
            'color': tag.color,
            'product_count': tag_product_count,
            'revenue': float(tag_revenue),
            'reach': simulated_reach,
            'conversion_rate': round(conversion_rate, 2),
            'expires_at': tag.expiration_date
        })
    
    # Summary stats
    most_used_tag = tags[0].name if tags.exists() else "-"
    
    return Response({
        'total_tagged_products': len(total_tagged_products_set),
        'most_used_tag': most_used_tag,
        'total_revenue': float(total_revenue_accumulated),
        'tag_performance': tag_performance[:30]  # Limit to top 30
    })


# ==========================================
# 🎟️ Coupon Analytics
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coupon_analytics_api(request):
    """
    Get analytics for all coupons
    """
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    # Get all coupons
    coupons = Coupon.objects.all().order_by('-used_count')
    
    coupons_data = []
    for coupon in coupons:
        # Usage limit
        limit = max(coupon.total_supply, coupon.usage_limit) if hasattr(coupon, 'total_supply') else coupon.usage_limit
        
        # Redemption rate
        redemption_rate = (coupon.used_count / limit * 100) if limit > 0 else 0
        
        # Revenue impact (orders that used this coupon)
        orders = Order.objects.filter(coupon=coupon, status__in=['Paid', 'Processing', 'Shipped', 'Completed'])
        total_revenue = orders.aggregate(total=Sum('total_price'))['total'] or 0
        total_discount = orders.aggregate(total=Sum('discount_amount'))['total'] or 0
        
        # Collection count (how many users collected)
        collection_count = UserCoupon.objects.filter(coupon=coupon).count()
        
        coupons_data.append({
            'id': coupon.id,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'used_count': coupon.used_count,
            'usage_limit': limit,
            'redemption_rate': round(redemption_rate, 2),
            'total_revenue': float(total_revenue),
            'total_discount': float(total_discount),
            'collection_count': collection_count,
            'is_active': coupon.active,
            'start_date': coupon.start_date,
            'end_date': coupon.end_date
        })
    
    # Overall stats
    total_coupons = coupons.count()
    active_coupons = coupons.filter(active=True).count()
    total_redemptions = coupons.aggregate(total=Sum('used_count'))['total'] or 0
    
    # Calculate average redemption rate for summary
    avg_redemption = 0
    if total_coupons > 0:
        total_rate = sum(c['redemption_rate'] for c in coupons_data)
        avg_redemption = total_rate / len(coupons_data) if coupons_data else 0
    
    return Response({
        'summary': {
            'total_coupons': total_coupons,
            'active_coupons': active_coupons,
            'total_redemptions': total_redemptions,
            'avg_redemption_rate': round(avg_redemption, 2)
        },
        'coupons': coupons_data[:20]  # Top 20 by usage
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coupon_detail_analytics_api(request, coupon_id):
    """
    Get detailed analytics for a specific coupon
    """
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    try:
        coupon = Coupon.objects.get(id=coupon_id)
        
        # Orders using this coupon
        orders = Order.objects.filter(
            coupon=coupon,
            status__in=['Paid', 'Processing', 'Shipped', 'Completed']
        ).order_by('-created_at')
        
        # Day-by-day usage
        usage_by_day = []
        now = timezone.now()
        for i in range(7):
            date = (now - timedelta(days=i)).date()
            daily_usage = orders.filter(created_at__date=date).count()
            usage_by_day.append({
                'date': date.strftime('%Y-%m-%d'),
                'usage': daily_usage
            })
        
        return Response({
            'coupon': {
                'id': coupon.id,
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'discount_value': float(coupon.discount_value)
            },
            'daily_usage': list(reversed(usage_by_day)),
            'recent_orders_count': orders.count()
        })
    except Coupon.DoesNotExist:
        return Response({"error": "Coupon not found"}, status=404)
