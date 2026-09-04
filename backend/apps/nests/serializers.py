from rest_framework import serializers

from apps.nests.models import GrupoNido, Nido


# SERIALIZADOR DE GRUPO DE NIDOS
class GrupoNidoSerializer(serializers.ModelSerializer):
    nidos_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = GrupoNido
        fields = [
            'id', 'nombre', 'latitud', 'longitud', 'descripcion',
            'tipo_ubicacion', 'fecha_creacion', 'fecha_actualizacion',
            'nidos_count',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion']


class NidoSerializer(serializers.ModelSerializer):
    grupo_nombre = serializers.CharField(
        source='grupo_nido.nombre', read_only=True, default=None,
    )

    class Meta:
        model = Nido
        fields = [
            'id', 'grupo_nido', 'grupo_nombre', 'nombre', 'codigo_en_grupo',
            'posicion_en_grupo', 'latitud', 'longitud', 'descripcion',
            'fecha_descubrimiento', 'estado', 'fecha_estado', 'motivo_estado',
            'metodo_ubicacion', 'creado_por', 'actualizado_por',
            'fecha_creacion', 'fecha_actualizacion',
        ]
        read_only_fields = [
            'id', 'creado_por', 'actualizado_por',
            'fecha_creacion', 'fecha_actualizacion',
        ]


# SERIALIZADOR COMPACTO PARA EL MAPA (TODOS LOS CAMPOS DERIVADOS)
class NidoMapaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    latitud = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitud = serializers.DecimalField(max_digits=9, decimal_places=6)
    estado = serializers.CharField()
    grupo_nido = serializers.IntegerField(
        source='grupo_nido_id', default=None,
    )
    grupo_nombre = serializers.SerializerMethodField()
    grupo_total_nidos = serializers.SerializerMethodField()
    codigo_en_grupo = serializers.CharField(default=None)
    posicion_en_grupo = serializers.CharField(default=None)
    ultima_observacion = serializers.SerializerMethodField()
    especie_ultima_observacion = serializers.SerializerMethodField()
    ocupado = serializers.SerializerMethodField()
    hay_huevos = serializers.SerializerMethodField()
    cantidad_huevos = serializers.SerializerMethodField()
    hay_polluelos = serializers.SerializerMethodField()
    cantidad_polluelos = serializers.SerializerMethodField()
    foto_principal = serializers.SerializerMethodField()

    def get_grupo_nombre(self, obj):
        if obj.grupo_nido:
            return obj.grupo_nido.nombre
        return None

    def get_grupo_total_nidos(self, obj):
        if obj.grupo_nido:
            return obj.grupo_nido.nidos.count()
        return None

    def _get_ultima_obs(self, obj):
        obs = obj.observaciones.order_by(
            '-fecha_observacion', '-id',
        ).first()
        return obs

    def get_ultima_observacion(self, obj):
        obs = self._get_ultima_obs(obj)
        if not obs:
            return None
        return {
            'id': obs.id,
            'fecha_observacion': obs.fecha_observacion,
            'especie': obs.especie.nombre_comun if obs.especie else None,
            'ocupado': obs.ocupado,
            'hay_huevos': obs.hay_huevos,
            'cantidad_huevos': obs.cantidad_huevos,
            'hay_polluelos': obs.hay_polluelos,
            'cantidad_polluelos': obs.cantidad_polluelos,
            'notas': obs.notas or '',
        }

    def get_especie_ultima_observacion(self, obj):
        obs = self._get_ultima_obs(obj)
        if obs and obs.especie:
            return obs.especie.nombre_comun
        return None

    def get_ocupado(self, obj):
        obs = self._get_ultima_obs(obj)
        return obs.ocupado if obs else None

    def get_hay_huevos(self, obj):
        obs = self._get_ultima_obs(obj)
        return obs.hay_huevos if obs else None

    def get_cantidad_huevos(self, obj):
        obs = self._get_ultima_obs(obj)
        return obs.cantidad_huevos if obs else None

    def get_hay_polluelos(self, obj):
        obs = self._get_ultima_obs(obj)
        return obs.hay_polluelos if obs else None

    def get_cantidad_polluelos(self, obj):
        obs = self._get_ultima_obs(obj)
        return obs.cantidad_polluelos if obs else None

    def get_foto_principal(self, obj):
        img = obj.imagenes.filter(es_principal=True).first()
        if img and img.archivo:
            return img.archivo.url
        return None
