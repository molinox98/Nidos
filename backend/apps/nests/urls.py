from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.nests.views import GrupoNidoViewSet, NidoViewSet, mapa_nidos

router = DefaultRouter()
router.register('grupos-nidos', GrupoNidoViewSet, basename='gruponido')
router.register('nidos', NidoViewSet)

urlpatterns = [
    path('mapa/nidos/', mapa_nidos, name='mapa-nidos'),
    path('', include(router.urls)),
]
