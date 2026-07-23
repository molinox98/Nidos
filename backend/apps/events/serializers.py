from rest_framework import serializers

from apps.events.models import EventoNido


# SERIALIZADOR DE EVENTOS
class EventoNidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.nombre', read_only=True, default=None,
    )

    class Meta:
        model = EventoNido
        fields = [
            'id', 'nido', 'usuario', 'usuario_nombre', 'fecha_evento',
            'tipo_evento', 'descripcion', 'estado_anterior', 'estado_nuevo',
        ]
        read_only_fields = ['id', 'usuario']
