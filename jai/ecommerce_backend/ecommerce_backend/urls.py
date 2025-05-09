from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static

def redirect_to_api(request):
    return redirect('/api/')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('products.urls')),  # Include product API URLs correctly
    path('', redirect_to_api, name='redirect-to-api'),  # Redirect base URL to /api/
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
