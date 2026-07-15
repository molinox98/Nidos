from rest_framework import serializers

from apps.species.models import Especie


class EspecieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especie
        fields = [
            'id', 'nombre_comun', 'nombre_cientifico', 'notas', 'fecha_creacion',
        ]
        read_only_fields = ['id', 'fecha_creacion']
