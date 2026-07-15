from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.users.views import UsuarioActualView, UsuarioViewSet

router = DefaultRouter()
router.register('usuarios', UsuarioViewSet)

urlpatterns = [
    path('me/', UsuarioActualView.as_view(), name='usuario-actual'),
    path('', include(router.urls)),
]
