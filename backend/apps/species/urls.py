from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.species.views import EspecieViewSet

router = DefaultRouter()
router.register('especies', EspecieViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
