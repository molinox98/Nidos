from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.common.permissions import EsAdminOBander, SoloAdmin
from apps.events.models import EventoNido
from apps.events.serializers import EventoNidoSerializer


class EventoNidoViewSet(viewsets.ModelViewSet):
    queryset = EventoNido.objects.select_related(
        'nido', 'usuario',
    ).order_by('-fecha_evento')
    serializer_class = EventoNidoSerializer

    # PERMISOS POR ACCIÓN
    def get_permissions(self):
        if self.action == 'destroy':
            return [SoloAdmin()]
        if self.action in ('create', 'update', 'partial_update'):
            return [EsAdminOBander()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
