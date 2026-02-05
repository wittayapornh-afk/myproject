# ==========================================
# ❤️ Wishlist APIs
# ==========================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Wishlist, Product
from .serializers import WishlistSerializer
from django.db import IntegrityError

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist_api(request):
    """
    เพิ่มสินค้าเข้า Wishlist
    
    POST /api/wishlist/add/
    Body: { "product_id": 123 }
    
    Returns: Wishlist object หรือ error message
    """
    try:
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response({"error": "product_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # ตรวจสอบว่าสินค้ามีอยู่จริงหรือไม่
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # ตรวจสอบว่ามีในระบบอยู่แล้วหรือไม่ (unique_together)
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={
                'initial_price': product.price,
                'notify_on_drop': True
            }
        )
        
        if not created:
            # มีอยู่แล้ว
            return Response({
                "message": "สินค้านี้อยู่ในรายการโปรดอยู่แล้ว",
                "already_exists": True
            }, status=status.HTTP_200_OK)
        
        # เพิ่มสำเร็จ
        serializer = WishlistSerializer(wishlist_item, context={'request': request})
        return Response({
            "message": "เพิ่มสินค้าในรายการโปรดสำเร็จ",
            "wishlist": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_wishlist_api(request):
    """
    ดูรายการ Wishlist ของตัวเอง
    
    GET /api/wishlist/
    
    Returns: List of wishlist items
    """
    try:
        wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
        serializer = WishlistSerializer(wishlist_items, many=True, context={'request': request})
        
        return Response({
            "count": wishlist_items.count(),
            "wishlist": serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist_api(request, product_id):
    """
    ลบสินค้าออกจาก Wishlist
    
    DELETE /api/wishlist/remove/<product_id>/
    
    Returns: Success message
    """
    try:
        wishlist_item = Wishlist.objects.filter(user=request.user, product_id=product_id).first()
        
        if not wishlist_item:
            return Response({"error": "ไม่พบสินค้านี้ในรายการโปรด"}, status=status.HTTP_404_NOT_FOUND)
        
        product_name = wishlist_item.product.title
        wishlist_item.delete()
        
        return Response({
            "message": f"ลบ '{product_name}' ออกจากรายการโปรดแล้ว"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_in_wishlist_api(request, product_id):
    """
    ตรวจสอบว่าสินค้าอยู่ใน Wishlist หรือไม่
    
    GET /api/wishlist/check/<product_id>/
    
    Returns: { "in_wishlist": true/false }
    """
    try:
        in_wishlist = Wishlist.objects.filter(user=request.user, product_id=product_id).exists()
        
        return Response({
            "in_wishlist": in_wishlist
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
