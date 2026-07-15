from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.mediafiles.views import ImagenNidoViewSet

router = DefaultRouter()
router.register('imagenes', ImagenNidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
