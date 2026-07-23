from django.db import models


class GrupoNido(models.Model):
    # GRUPO DE NIDOS (UBICACIÓN FÍSICA)
    TIPO_UBICACION_CHOICES = [
        ('roca', 'Roca'),
        ('arbol', 'Árbol'),
        ('edificio', 'Edificio'),
        ('poste', 'Poste'),
        ('acantilado', 'Acantilado'),
        ('otro', 'Otro'),
    ]

    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    descripcion = models.TextField(null=True, blank=True)
    tipo_ubicacion = models.CharField(max_length=30, choices=TIPO_UBICACION_CHOICES)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grupos_nidos'
        verbose_name = 'Grupo de nidos'
        verbose_name_plural = 'Grupos de nidos'

    def __str__(self):
        return self.nombre


class Nido(models.Model):
    # NIDO INDIVIDUAL
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('destruido', 'Destruido'),
        ('retirado', 'Retirado'),
    ]
    # ESTADOS DEL CICLO DE VIDA DEL NIDO

    METODO_UBICACION_CHOICES = [
        ('manual_mapa', 'Manual mapa'),
        ('gps_movil', 'GPS móvil'),
        ('importado', 'Importado'),
    ]

    id = models.BigAutoField(primary_key=True)
    grupo_nido = models.ForeignKey(
        GrupoNido,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nidos',
    )
    nombre = models.CharField(max_length=150)
    codigo_en_grupo = models.CharField(max_length=50, null=True, blank=True)
    posicion_en_grupo = models.CharField(max_length=150, null=True, blank=True)
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    descripcion = models.TextField(null=True, blank=True)
    fecha_descubrimiento = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    fecha_estado = models.DateField(null=True, blank=True)
    motivo_estado = models.TextField(null=True, blank=True)
    metodo_ubicacion = models.CharField(
        max_length=30,
        choices=METODO_UBICACION_CHOICES,
        default='manual_mapa',
    )
    creado_por = models.ForeignKey(
        'users.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nidos_creados',
    )
    actualizado_por = models.ForeignKey(
        'users.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nidos_actualizados',
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'nidos'
        verbose_name = 'Nido'
        verbose_name_plural = 'Nidos'

    def __str__(self):
        return self.nombre