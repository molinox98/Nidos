from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.observations.views import ObservacionNidoViewSet

router = DefaultRouter()
router.register('observaciones', ObservacionNidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
