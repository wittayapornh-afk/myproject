import promptpay
print("Valid Attributes:", dir(promptpay))

try:
    from promptpay import qrcode
    print("QRCode module found:", dir(qrcode))
    payload = qrcode.generate_payload("0987654321", 100.00)
    print("Payload (via promptpay.qrcode):", payload)
except ImportError:
    print("promptpay.qrcode not found")
except Exception as e:
    print("Error:", e)
