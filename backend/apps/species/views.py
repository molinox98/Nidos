from rest_framework import viewsets

from apps.common.permissions import EsAdminOBander
from apps.species.models import Especie
from apps.species.serializers import EspecieSerializer


class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all().order_by('nombre_comun')
    serializer_class = EspecieSerializer
    permission_classes = [EsAdminOBander]
