from django.db import models
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import EsAdminOBander
from apps.nests.models import GrupoNido, Nido
from apps.nests.serializers import (
    GrupoNidoSerializer,
    NidoSerializer,
    NidoMapaSerializer,
)


# CRUD DE GRUPOS DE NIDOS (SOLO ADMIN/BANDER)
class GrupoNidoViewSet(viewsets.ModelViewSet):
    serializer_class = GrupoNidoSerializer
    permission_classes = [EsAdminOBander]

    def get_queryset(self):
        return GrupoNido.objects.annotate(
            nidos_count=models.Count('nidos'),
        ).order_by('nombre')


# CRUD DE NIDOS (SOLO ADMIN/BANDER)
class NidoViewSet(viewsets.ModelViewSet):
    queryset = Nido.objects.select_related('grupo_nido').order_by('nombre')
    serializer_class = NidoSerializer
    permission_classes = [EsAdminOBander]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    def perform_update(self, serializer):
        serializer.save(actualizado_por=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mapa_nidos(request):
    # ENDPOINT CON DATOS COMPACTOS DE NIDOS PARA EL MAPA
    nidos = Nido.objects.select_related('grupo_nido').prefetch_related(
        'observaciones__especie',
    ).all()
    serializer = NidoMapaSerializer(nidos, many=True)
    return Response(serializer.data)
