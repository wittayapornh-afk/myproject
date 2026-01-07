@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_api(request):
    """
    Allow resetting password directly via email.
    WARNING: In production, this should use a secure token sent to email.
    For this specific user request/environment, we are allowing direct reset by checking email.
    """
    email = request.data.get('email')
    new_password = request.data.get('new_password')

    if not email or not new_password:
        return Response({"error": "Email and new password are required"}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"})
    except User.DoesNotExist:
        return Response({"error": "User with this email not found"}, status=404)
