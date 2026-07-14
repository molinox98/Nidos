from django.urls import path

from apps.users.views import UsuarioActualView

urlpatterns = [
    path('me/', UsuarioActualView.as_view(), name='usuario-actual'),
]