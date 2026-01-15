import re
from django.core.exceptions import ValidationError
from .exceptions import InlineValidationError

def validate_product_name(value):
    """
    Validates that the product name contains only allowed characters.
    """
    forbidden_pattern = r"[`<>{}\[\]|^~;?@\\*]"
    
    if re.search(forbidden_pattern, value):
        found = re.findall(forbidden_pattern, value)
        unique_found = sorted(list(set(found)))
        raise ValidationError(
            f"ชื่อสินค้ามีอักขระต้องห้าม: {' '.join(unique_found)} (ห้ามใช้: ` < > {{ }} [ ] | ^ ~ ; ? @ \ *)"
        )
    return value

def validate_order_data(data):
    """
    Validates order data before creation.
    Raises InlineValidationError if any checks fail.
    """
    errors = []
    
    # 1. Check Customer Name
    if not data.get('name'):
        errors.append({
            "field": "name",
            "code": "REQUIRED",
            "message": "กรุณากรอกชื่อผู้รับ"
        })

    # 2. Check Phone Number (Thai Format)
    tel = data.get('tel', '')
    if not tel:
         errors.append({
            "field": "tel",
            "code": "REQUIRED",
            "message": "กรุณากรอกเบอร์โทรศัพท์"
        })
    elif not re.match(r'^0\d{9}$', tel.replace('-', '').replace(' ', '')):
        errors.append({
            "field": "tel",
            "code": "INVALID_FORMAT",
            "message": "เบอร์โทรศัพท์ต้องเริ่มต้นด้วย 0 และมี 10 หลัก",
            "value": tel
        })

    # 3. Check Address
    if not data.get('address'):
        errors.append({
            "field": "address",
            "code": "REQUIRED",
            "message": "กรุณากรอกที่อยู่จัดส่ง"
        })
        
    # 4. Check Province
    if not data.get('province'):
        errors.append({
            "field": "province",
            "code": "REQUIRED",
            "message": "กรุณาเลือกจังหวัด"
        })

    # 5. Check Items
    items = data.get('items', [])
    if not items:
        errors.append({
            "field": "cart",
            "code": "EMPTY_CART",
            "message": "ตะกร้าสินค้าว่างเปล่า"
        })
    
    # If any error found, throw exception immediately (Fail Fast)
    if errors:
        raise InlineValidationError(errors)
