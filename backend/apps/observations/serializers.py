from rest_framework import serializers

from apps.observations.models import ObservacionNido


# SERIALIZADOR DE OBSERVACIONES
class ObservacionNidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.nombre', read_only=True, default=None,
    )
    especie_nombre = serializers.CharField(
        source='especie.nombre_comun', read_only=True, default=None,
    )

    class Meta:
        model = ObservacionNido
        fields = [
            'id', 'nido', 'especie', 'especie_nombre', 'usuario',
            'usuario_nombre', 'fecha_observacion', 'ocupado',
            'hay_huevos', 'cantidad_huevos', 'hay_polluelos',
            'cantidad_polluelos', 'notas', 'fecha_creacion',
        ]
        read_only_fields = ['id', 'usuario', 'fecha_creacion']
