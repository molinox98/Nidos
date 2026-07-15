from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.events.views import EventoNidoViewSet

router = DefaultRouter()
router.register('eventos', EventoNidoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
