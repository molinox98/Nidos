from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import CustomTokenObtainView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainView.as_view(), name='token-obtain-pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.species.urls')),
    path('api/', include('apps.nests.urls')),
    path('api/', include('apps.observations.urls')),
    path('api/', include('apps.events.urls')),
    path('api/', include('apps.mediafiles.urls')),
]
