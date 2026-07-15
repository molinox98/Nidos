from rest_framework import viewsets

from apps.common.permissions import EsAdminOBander
from apps.events.models import EventoNido
from apps.events.serializers import EventoNidoSerializer


class EventoNidoViewSet(viewsets.ModelViewSet):
    queryset = EventoNido.objects.select_related(
        'nido', 'usuario',
    ).order_by('-fecha_evento')
    serializer_class = EventoNidoSerializer
    permission_classes = [EsAdminOBander]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
