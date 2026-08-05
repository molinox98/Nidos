from rest_framework import viewsets, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.common.permissions import EsAdminOBander
from apps.species.models import Especie
from apps.species.serializers import EspecieSerializer


class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all().order_by('nombre_comun')
    serializer_class = EspecieSerializer
    permission_classes = [EsAdminOBander]

    # ELIMINACIÓN CONTROLADA: SOLO ADMIN Y SIN OBSERVACIONES
    def destroy(self, request, *args, **kwargs):
        if request.user.rol != 'admin':
            raise PermissionDenied('Solo un administrador puede eliminar especies.')
        especie = self.get_object()
        # ESPECIE USADA EN OBSERVACIONES
        if especie.observaciones.exists():
            return Response(
                {'detail': 'No se puede eliminar esta especie porque está asociada a observaciones.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)
