import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def config(key, default=None, cast=str):
    """Fetches environment variables with type conversion support"""
    value = os.getenv(key, default)
    if value is None:
        raise ValueError(f"Environment variable '{key}' is not set")
    return cast(value)

# 🔐 SECURITY SETTINGS
SECRET_KEY = config("SECRET_KEY", default="your-secret-key")
DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="*", cast=lambda x: x.split(","))

# 📂 BASE DIRECTORY
BASE_DIR = Path(__file__).resolve().parent.parent

# 🔌 INSTALLED APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'products',  # Your custom app
]

# 🛡️ MIDDLEWARE
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# 🌍 CORS CONFIGURATION
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL", default=True, cast=bool)

# 🔗 URL CONFIG
ROOT_URLCONF = 'ecommerce_backend.urls'

# 🚀 WSGI APPLICATION
WSGI_APPLICATION = 'ecommerce_backend.wsgi.application'

# 🛢️ DATABASE CONFIG (MySQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='ecommerce_db'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default='Nithish@12'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}

# 🔑 AUTHENTICATION CONFIG
AUTH_USER_MODEL = 'products.User'

# 🔒 PASSWORD VALIDATORS
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# 🌍 INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# 📂 STATIC & MEDIA FILES
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# 🔧 DEFAULT AUTO FIELD
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST FRAMEWORK SETTINGS
# settings.py

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],  # No global authentication
    'DEFAULT_PERMISSION_CLASSES': [],      # No global permissions
}
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # Optional: Add a templates folder
        'APP_DIRS': True,  # Enables template loading from installed apps
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