import os, sys, traceback
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
    import myapp.views as v
    print('Import success')
    print('has_change_password_api:', hasattr(v, 'change_password_api'))
except Exception as e:
    traceback.print_exc()
    sys.exit(1)
