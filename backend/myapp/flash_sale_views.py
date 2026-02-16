from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import FlashSale, FlashSaleCampaign, AdminLog
from .serializers import FlashSaleSerializer, FlashSaleCampaignSerializer

# ==========================================
# 🔥 Flash Sale APIs
# ==========================================

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_flash_sale_api(request, fs_id=None):
    """
    Flash Sale Management API
    GET: List all flash sales
    POST: Create new flash sale
    PUT/DELETE: Update/Delete specific flash sale (requires fs_id)
    """
    # Check admin permissions
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    # GET: List all flash sales
    if request.method == 'GET':
        if fs_id:
            # Get specific flash sale
            try:
                fs = FlashSale.objects.get(id=fs_id)
                serializer = FlashSaleSerializer(fs)
                return Response(serializer.data)
            except FlashSale.DoesNotExist:
                return Response({"error": "Flash sale not found"}, status=404)
        else:
            # List all flash sales with filters
            flash_sales = FlashSale.objects.all().order_by('-start_time')
            
            # Filter by status
            status_filter = request.GET.get('status')
            if status_filter and status_filter != 'all':
                now = timezone.now()
                if status_filter == 'live':
                    flash_sales = flash_sales.filter(
                        is_active=True,
                        start_time__lte=now,
                        end_time__gte=now
                    )
                elif status_filter == 'upcoming':
                    flash_sales = flash_sales.filter(start_time__gt=now)
                elif status_filter == 'ended':
                    flash_sales = flash_sales.filter(end_time__lt=now)
            
            # Prefetch products for performance
            flash_sales = flash_sales.prefetch_related('products__product')
            
            serializer = FlashSaleSerializer(flash_sales, many=True)
            return Response(serializer.data)
    
    # POST: Create new flash sale
    elif request.method == 'POST':
        serializer = FlashSaleSerializer(data=request.data)
        if serializer.is_valid():
            # Validation
            start_time = serializer.validated_data.get('start_time')
            end_time = serializer.validated_data.get('end_time')
            
            if start_time and end_time and start_time >= end_time:
                return Response({
                    "error": "เวลาเริ่มต้องมาก่อนเวลาสิ้นสุด (Start time must be before end time)"
                }, status=400)
            
            serializer.save()
            AdminLog.objects.create(
                admin=request.user,
                action=f"Created Flash Sale: {serializer.data.get('name')}"
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    # PUT: Update flash sale
    elif request.method == 'PUT':
        if not fs_id:
            return Response({"error": "Flash sale ID required"}, status=400)
        
        try:
            fs = FlashSale.objects.get(id=fs_id)
            serializer = FlashSaleSerializer(fs, data=request.data, partial=True)
            
            if serializer.is_valid():
                # Validation
                start_time = serializer.validated_data.get('start_time', fs.start_time)
                end_time = serializer.validated_data.get('end_time', fs.end_time)
                
                if start_time >= end_time:
                    return Response({
                        "error": "เวลาเริ่มต้องมาก่อนเวลาสิ้นสุด"
                    }, status=400)
                
                serializer.save()
                AdminLog.objects.create(
                    admin=request.user,
                    action=f"Updated Flash Sale: {fs.name}"
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except FlashSale.DoesNotExist:
            return Response({"error": "Flash sale not found"}, status=404)
    
    # DELETE: Delete flash sale
    elif request.method == 'DELETE':
        if not fs_id:
            return Response({"error": "Flash sale ID required"}, status=400)
        
        try:
            fs = FlashSale.objects.get(id=fs_id)
            fs_name = fs.name
            fs.delete()
            AdminLog.objects.create(
                admin=request.user,
                action=f"Deleted Flash Sale: {fs_name}"
            )
            return Response({"message": "Flash sale deleted successfully"}, status=204)
        except FlashSale.DoesNotExist:
            return Response({"error": "Flash sale not found"}, status=404)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_flash_sales_api(request):
    """
    Public API: Get all currently active flash sales
    Used by frontend to display live flash sales
    """
    now = timezone.now()
    active_flash_sales = FlashSale.objects.filter(
        is_active=True,
        start_time__lte=now,
        end_time__gte=now
    ).prefetch_related('products__product').order_by('-priority', 'start_time')
    
    serializer = FlashSaleSerializer(active_flash_sales, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_campaign_api(request, campaign_id=None):
    """
    Flash Sale Campaign Management API
    GET: List all campaigns
    POST: Create new campaign
    PUT/DELETE: Update/Delete specific campaign (requires campaign_id)
    """
    # Check admin permissions
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    # GET: List all campaigns
    if request.method == 'GET':
        if campaign_id:
            # Get specific campaign
            try:
                campaign = FlashSaleCampaign.objects.get(id=campaign_id)
                serializer = FlashSaleCampaignSerializer(campaign)
                return Response(serializer.data)
            except FlashSaleCampaign.DoesNotExist:
                return Response({"error": "Campaign not found"}, status=404)
        else:
            # List all campaigns
            campaigns = FlashSaleCampaign.objects.all().order_by('-campaign_start')
            
            # Filter by status
            status_filter = request.GET.get('status')
            if status_filter and status_filter != 'all':
                now = timezone.now()
                if status_filter == 'active':
                    campaigns = campaigns.filter(
                        is_active=True,
                        campaign_start__lte=now,
                        campaign_end__gte=now
                    )
                elif status_filter == 'upcoming':
                    campaigns = campaigns.filter(campaign_start__gt=now)
                elif status_filter == 'ended':
                    campaigns = campaigns.filter(campaign_end__lt=now)
            
            serializer = FlashSaleCampaignSerializer(campaigns, many=True)
            return Response(serializer.data)
    
    # POST: Create new campaign
    elif request.method == 'POST':
        serializer = FlashSaleCampaignSerializer(data=request.data)
        if serializer.is_valid():
            # Validation
            campaign_start = serializer.validated_data.get('campaign_start')
            campaign_end = serializer.validated_data.get('campaign_end')
            
            if campaign_start and campaign_end and campaign_start >= campaign_end:
                return Response({
                    "error": "วันเริ่มต้นต้องมาก่อนวันสิ้นสุด (Start date must be before end date)"
                }, status=400)
            
            serializer.save()
            AdminLog.objects.create(
                admin=request.user,
                action=f"Created Campaign: {serializer.data.get('name')}"
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    # PUT: Update campaign
    elif request.method == 'PUT':
        if not campaign_id:
            return Response({"error": "Campaign ID required"}, status=400)
        
        try:
            campaign = FlashSaleCampaign.objects.get(id=campaign_id)
            serializer = FlashSaleCampaignSerializer(campaign, data=request.data, partial=True)
            
            if serializer.is_valid():
                # Validation
                campaign_start = serializer.validated_data.get('campaign_start', campaign.campaign_start)
                campaign_end = serializer.validated_data.get('campaign_end', campaign.campaign_end)
                
                if campaign_start >= campaign_end:
                    return Response({
                        "error": "วันเริ่มต้นต้องมาก่อนวันสิ้นสุด"
                    }, status=400)
                
                serializer.save()
                AdminLog.objects.create(
                    admin=request.user,
                    action=f"Updated Campaign: {campaign.name}"
                )
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except FlashSaleCampaign.DoesNotExist:
            return Response({"error": "Campaign not found"}, status=404)
    
    # DELETE: Delete campaign
    elif request.method == 'DELETE':
        if not campaign_id:
            return Response({"error": "Campaign ID required"}, status=400)
        
        try:
            campaign = FlashSaleCampaign.objects.get(id=campaign_id)
            campaign_name = campaign.name
            campaign.delete()
            AdminLog.objects.create(
                admin=request.user,
                action=f"Deleted Campaign: {campaign_name}"
            )
            return Response({"message": "Campaign deleted successfully"}, status=204)
        except FlashSaleCampaign.DoesNotExist:
            return Response({"error": "Campaign not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_campaign_flash_sales(request, campaign_id):
    """
    Get all flash sales belonging to a specific campaign
    """
    if request.user.role not in ['admin', 'super_admin', 'seller']:
        return Response({"error": "Unauthorized"}, status=403)
    
    try:
        campaign = FlashSaleCampaign.objects.get(id=campaign_id)
        flash_sales = campaign.flash_sales.all().order_by('start_time')
        serializer = FlashSaleSerializer(flash_sales, many=True)
        return Response(serializer.data)
    except FlashSaleCampaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=404)
