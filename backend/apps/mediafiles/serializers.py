from rest_framework import serializers

from apps.mediafiles.models import ImagenNido


# SERIALIZADOR DE IMÁGENES CON URL DEL ARCHIVO
class ImagenNidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.nombre', read_only=True, default=None,
    )
    archivo = serializers.SerializerMethodField()
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = ImagenNido
        fields = [
            'id', 'nido', 'observacion', 'usuario', 'usuario_nombre',
            'archivo', 'archivo_url', 'descripcion', 'es_principal',
            'fecha_subida',
        ]
        read_only_fields = ['id', 'usuario', 'fecha_subida']

    def get_archivo(self, obj):
        if obj.archivo:
            return obj.archivo.name
        return None

    def get_archivo_url(self, obj):
        if obj.archivo:
            return obj.archivo.url
        return None
