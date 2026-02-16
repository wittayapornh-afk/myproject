# Testing Guide for Flash Sale, Tag, and Coupon Systems

## Overview

This directory contains comprehensive tests for Flash Sale, Tag, and Coupon systems.

## Test Structure

```
tests/
├── __init__.py
├── test_flash_sale.py      # Flash Sale unit tests
├── test_tag.py             # Tag unit tests
├── test_coupon.py          # Coupon unit tests
└── test_integration.py     # Integration tests
```

## Running Tests

### Run All Tests

```bash
# Using Django test runner
python manage.py test myapp.tests

# Using pytest (recommended)
pytest myapp/tests/
```

### Run Specific Test Files

```bash
# Flash Sale tests only
pytest myapp/tests/test_flash_sale.py

# Tag tests only
pytest myapp/tests/test_tag.py

# Coupon tests only
pytest myapp/tests/test_coupon.py

# Integration tests only
pytest myapp/tests/test_integration.py
```

### Run Specific Test Classes

```bash
pytest myapp/tests/test_flash_sale.py::FlashSaleModelTest
pytest myapp/tests/test_coupon.py::CouponValidationTest
```

### Run with Coverage

```bash
pytest --cov=myapp --cov-report=html
# View coverage report at htmlcov/index.html
```

## Test Categories

### Unit Tests

- **Flash Sale**: Model validation, status detection, product availability
- **Tag**: Expiration, automation rules, product relationships
- **Coupon**: Validation, discount calculation, role restrictions

### Integration Tests

- Flash Sale + Coupon interaction
- Tag + Flash Sale integration
- End-to-end checkout flow
- Analytics with real data

## Test Data

### Flash Sale Tests

- Tests active, upcoming, and ended sales
- Tests product availability and stock limits
- Tests API authentication and permissions

### Tag Tests

- Tests tag expiration logic
- Tests automation rules (new arrival, last chance, out of stock)
- Tests tag-product relationships

### Coupon Tests

- Tests all discount types (fixed, percent, capped, tiered, free shipping)
- Tests validation rules (min spend, usage limits, roles)
- Tests coupon stacking with Flash Sales

## Common Test Patterns

### Creating Test Flash Sale

```python
now = timezone.now()
flash_sale = FlashSale.objects.create(
    name="Test Sale",
    start_time=now,
    end_time=now + timedelta(hours=2),
    is_active=True
)
```

### Creating Test Coupon

```python
coupon = Coupon.objects.create(
    code="TEST10",
    discount_type="percent",
    discount_value=Decimal('10.00'),
    start_date=timezone.now(),
    end_date=timezone.now() + timedelta(days=30),
    active=True
)
```

### Testing API Endpoints

```python
self.client.force_login(self.admin_user)
response = self.client.get('/api/admin/flash-sales/')
self.assertEqual(response.status_code, 200)
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/tests.yml
- name: Run Tests
  run: |
    python manage.py test
    pytest --cov=myapp --cov-fail-under=80
```

## Test Coverage Goals

- **Models**: 90%+
- **Services**: 85%+
- **APIs**: 80%+
- **Overall**: 80%+

## Troubleshooting

### Database Issues

```bash
# Reset test database
python manage.py flush --noinput
python manage.py migrate
```

### Import Errors

Ensure all dependencies are installed:

```bash
pip install -r requirements.txt
pip install pytest pytest-django pytest-cov
```

## Best Practices

1. Use `setUp()` to create common test data
2. Use `tearDown()` if cleanup is needed
3. Test both success and failure cases
4. Use descriptive test method names
5. Keep tests independent and isolated
6. Mock external dependencies when needed

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain coverage above 80%
4. Document new test utilities
