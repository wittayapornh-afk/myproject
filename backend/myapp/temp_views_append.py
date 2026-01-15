
# ==========================================
# 🎟️ Coupon & Flash Sale APIs
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_coupon_api(request):
    code = request.data.get('code')
    total_amount = request.data.get('total_amount', 0)
    
    try:
        coupon = Coupon.objects.get(code=code)
        if not coupon.is_valid(user=request.user):
            return Response({"error": "คูปองไม่ถูกต้อง หมดอายุ หรือใช้ครบสิทธิ์แล้ว"}, status=400)
            
        if float(total_amount) < float(coupon.min_spend):
            return Response({"error": f"ต้องมียอดซื้อขั้นต่ำ {coupon.min_spend} บาท"}, status=400)
            
        # Calculate discount preview
        discount = 0
        if coupon.discount_type == 'percent':
            discount = (float(total_amount) * float(coupon.discount_value)) / 100
        else:
            discount = float(coupon.discount_value)
            
        return Response({
            "valid": True,
            "discount_amount": discount,
            "code": coupon.code,
            "type": coupon.discount_type,
            "value": coupon.discount_value
        })
    except Coupon.DoesNotExist:
        return Response({"error": "คูปองไม่ถูกต้อง"}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_flash_sales_api(request):
    now = timezone.now()
    active_flash_sales = FlashSale.objects.filter(
        start_time__lte=now,
        end_time__gte=now,
        is_active=True
    )
    serializer = FlashSaleSerializer(active_flash_sales, many=True)
    return Response(serializer.data)

# --- Admin Coupon Management ---
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_coupon_api(request, coupon_id=None):
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response(status=403)
        
    if request.method == 'GET':
        if coupon_id:
            try:
                c = Coupon.objects.get(id=coupon_id)
                return Response(CouponSerializer(c).data)
            except Coupon.DoesNotExist:
                return Response(status=404)
        else:
            coupons = Coupon.objects.all().order_by('-id')
            return Response(CouponSerializer(coupons, many=True).data)
            
    elif request.method == 'POST':
        # Create or Update
        # If id provided in body, update
        cid = request.data.get('id')
        if cid:
             c = Coupon.objects.get(id=cid)
             s = CouponSerializer(c, data=request.data, partial=True)
        else:
             s = CouponSerializer(data=request.data)
             
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)
        
    elif request.method == 'DELETE':
        if not coupon_id: return Response(status=400)
        Coupon.objects.filter(id=coupon_id).delete()
        return Response({"message": "Delete success"})

# --- Admin Flash Sale Management ---
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_flash_sale_api(request, fs_id=None):
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response(status=403)
        
    if request.method == 'GET':
        if fs_id:
            try:
                fs = FlashSale.objects.get(id=fs_id)
                return Response(FlashSaleSerializer(fs).data)
            except FlashSale.DoesNotExist:
                return Response(status=404)
        else:
            fs = FlashSale.objects.all().order_by('-start_time')
            return Response(FlashSaleSerializer(fs, many=True).data)
            
    elif request.method == 'POST':
        # EXPECT JSON: { "name": "...", "start_time": "...", "end_time": "...", "products": [ {"product_id": 1, "sale_price": 99, "limit": 10}, ... ] }
        data = request.data
        fs_id_param = data.get('id')
        
        try:
            with transaction.atomic():
                if fs_id_param:
                    try:
                        fs = FlashSale.objects.get(id=fs_id_param)
                        fs.name = data.get('name', fs.name)
                        fs.start_time = data.get('start_time', fs.start_time)
                        fs.end_time = data.get('end_time', fs.end_time)
                        fs.is_active = data.get('is_active', fs.is_active)
                        fs.save()
                    except FlashSale.DoesNotExist:
                        return Response({"error": "Flash Sale not found"}, status=404)
                    
                    # Clear old products and re-add (Simple Strategy)
                    FlashSaleProduct.objects.filter(flash_sale=fs).delete()
                else:
                    fs = FlashSale.objects.create(
                        name=data['name'],
                        start_time=data['start_time'],
                        end_time=data['end_time'],
                        is_active=data.get('is_active', True)
                    )
                
                # Add Products
                products_data = data.get('products', [])
                for p_item in products_data:
                    FlashSaleProduct.objects.create(
                        flash_sale=fs,
                        product_id=p_item['product_id'],
                        sale_price=p_item['sale_price'],
                        quantity_limit=p_item.get('limit', 10)
                    )
                    
            return Response({"message": "Saved successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

    elif request.method == 'DELETE':
        if not fs_id: return Response(status=400)
        FlashSale.objects.filter(id=fs_id).delete()
        return Response({"message": "Deleted"})
