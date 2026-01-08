from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = 'django-insecure-change-me-please'
DEBUG = True
ALLOWED_HOSTS = ['*', 'shop-backend', 'shop_backend', 'localhost', '127.0.0.1'] # ✅ อนุญาตทุก Host เพื่อไม่ให้ติดปัญหาใน Docker

STRIPE_PUBLIC_KEY = 'pk_test_...' # ใส่ Public Key ของคุณ
STRIPE_SECRET_KEY = 'sk_test_...' # ใส่ Secret Key ของคุณ
FRONTEND_URL = 'http://localhost:3000'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # ✅ เพิ่ม Apps ที่จำเป็น
    'rest_framework',
    'rest_framework.authtoken', # สำคัญมากสำหรับ Login
    'corsheaders',              # สำคัญมากสำหรับเชื่อมต่อ Frontend
    'myapp',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # ✅ ต้องอยู่ก่อน CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myproject.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DATABASE_NAME', 'django_db'),
        'USER': os.environ.get('DATABASE_USER', 'django_user'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', 'django_password'),
        'HOST': os.environ.get('DATABASE_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DATABASE_PORT', '3306'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Bangkok' # ✅ ปรับเวลาเป็นไทย
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# ✅ ตั้งค่า Media (สำหรับรูปโปรไฟล์และสินค้า)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ✅ ตั้งค่า CORS (ให้ Frontend ยิง API ได้)
CORS_ALLOW_ALL_ORIGINS = True 

# ✅ ตั้งค่า Authentication (แก้ Error 403 Forbidden)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    # ✅ [ระบบ Error ใหม่] เปิดใช้ Custom Exception Handler
    'EXCEPTION_HANDLER': 'myapp.exception_handler.custom_exception_handler',
}

# ✅ [ระบบ Error ใหม่] ตั้งค่า Logging (แสดงผลทาง Console เท่านั้น ไม่บันทึกไฟล์)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '\n🔴 ERROR at {asctime}\n📂 File: {pathname}\n🔢 Line: {lineno}\n🔧 Func: {funcName}\n💬 Msg: {message}\n',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': True,
        },
        'myapp': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Custom User Model
AUTH_USER_MODEL = 'myapp.User'