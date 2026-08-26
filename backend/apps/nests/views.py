from django.db import models, transaction
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import EsAdminOBander, SoloAdmin
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


# CRUD DE NIDOS (SOLO ADMIN/BANDER, DELETE SOLO ADMIN)
class NidoViewSet(viewsets.ModelViewSet):
    queryset = Nido.objects.select_related('grupo_nido').order_by('nombre')
    serializer_class = NidoSerializer

    def get_permissions(self):
        if self.action == 'destroy':
            return [SoloAdmin()]
        return [EsAdminOBander()]

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    def perform_update(self, serializer):
        serializer.save(actualizado_por=self.request.user)

    # ELIMINACIÓN CONTROLADA DE NIDOS
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        nido = self.get_object()

        if nido.estado not in ('destruido', 'retirado'):
            return Response(
                {'detail': 'Solo se pueden eliminar nidos destruidos o retirados.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if nido.observaciones.exists():
            return Response(
                {'detail': 'No se puede eliminar un nido con observaciones asociadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if nido.imagenes.exists():
            return Response(
                {'detail': 'No se puede eliminar un nido con imágenes asociadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ELIMINACIÓN EN CASCADE DE GRUPO VACÍO
        grupo = nido.grupo_nido
        nido.delete()

        if grupo and not grupo.nidos.exists():
            grupo.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mapa_nidos(request):
    # ENDPOINT CON DATOS COMPACTOS DE NIDOS PARA EL MAPA
    nidos = Nido.objects.select_related('grupo_nido').prefetch_related(
        'observaciones__especie',
    ).all()
    serializer = NidoMapaSerializer(nidos, many=True)
    return Response(serializer.data)
