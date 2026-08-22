from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import EsAdminOBander, SoloAdmin
from apps.observations.models import ObservacionNido
from apps.observations.serializers import ObservacionNidoSerializer


class ObservacionNidoViewSet(viewsets.ModelViewSet):
    queryset = ObservacionNido.objects.select_related(
        'nido', 'especie', 'usuario',
    ).order_by('-fecha_observacion')
    serializer_class = ObservacionNidoSerializer

    # PERMISOS POR ACCIÓN
    def get_permissions(self):
        if self.action == 'destroy':
            return [SoloAdmin()]
        if self.action in ('create', 'update', 'partial_update'):
            return [EsAdminOBander()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    # BORRADO EN CASCADA: ARCHIVOS ASOCIADOS ANTES DE ELIMINAR EL REGISTRO
    def perform_destroy(self, instancia):
        for img in instancia.imagenes.all():
            try:
                if img.archivo:
                    img.archivo.delete(save=False)
            except Exception:
                pass
        instancia.delete()
