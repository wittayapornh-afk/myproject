from rest_framework.exceptions import APIException
from rest_framework import status

class InlineValidationError(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_code = 'validation_error'

    def __init__(self, errors):
        self.detail = {
            "status": "error",
            "code": "VALIDATION_FAILED",
            "message": "ข้อมูลนำเข้าไม่ถูกต้อง กรุณาตรวจสอบ",
            "errors": errors
        }
