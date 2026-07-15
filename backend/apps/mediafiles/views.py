from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import EsAdminOBander, SoloAdmin
from apps.mediafiles.models import ImagenNido
from apps.mediafiles.serializers import ImagenNidoSerializer


class ImagenNidoViewSet(viewsets.ModelViewSet):
    queryset = ImagenNido.objects.select_related(
        'nido', 'observacion', 'usuario',
    ).order_by('-fecha_subida')
    serializer_class = ImagenNidoSerializer

    def get_permissions(self):
        if self.action == 'destroy':
            return [SoloAdmin()]
        if self.action in ('create', 'update', 'partial_update', 'marcar_principal'):
            return [EsAdminOBander()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        observacion = serializer.validated_data.get('observacion')
        nido = serializer.validated_data['nido']

        if observacion and observacion.nido_id != nido.id:
            return Response(
                {'observacion': 'La observación no pertenece al nido indicado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        es_principal = serializer.validated_data.get('es_principal', False)

        if es_principal:
            with transaction.atomic():
                ImagenNido.objects.filter(
                    nido=nido, es_principal=True,
                ).update(es_principal=False)
                serializer.save(usuario=request.user)
        else:
            serializer.save(usuario=request.user)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='marcar-principal')
    def marcar_principal(self, request, pk=None):
        try:
            imagen = self.get_object()
        except ImagenNido.DoesNotExist:
            return Response(
                {'detail': 'Imagen no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        with transaction.atomic():
            ImagenNido.objects.filter(
                nido=imagen.nido, es_principal=True,
            ).update(es_principal=False)
            imagen.es_principal = True
            imagen.save(update_fields=['es_principal'])

        serializer = self.get_serializer(imagen)
        return Response(serializer.data)
