from rest_framework import viewsets

from apps.common.permissions import EsAdminOBander
from apps.observations.models import ObservacionNido
from apps.observations.serializers import ObservacionNidoSerializer


class ObservacionNidoViewSet(viewsets.ModelViewSet):
    queryset = ObservacionNido.objects.select_related(
        'nido', 'especie', 'usuario',
    ).order_by('-fecha_observacion')
    serializer_class = ObservacionNidoSerializer
    permission_classes = [EsAdminOBander]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
