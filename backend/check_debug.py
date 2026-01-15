import os, sys, traceback
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
try:
    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'check'])
except Exception as e:
    traceback.print_exc()
    sys.exit(1)
