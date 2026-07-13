from django.db import models


class ObservacionNido(models.Model):
    id = models.BigAutoField(primary_key=True)
    nido = models.ForeignKey(
        'nests.Nido',
        on_delete=models.CASCADE,
        related_name='observaciones',
    )
    especie = models.ForeignKey(
        'species.Especie',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='observaciones',
    )
    usuario = models.ForeignKey(
        'users.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='observaciones',
    )
    fecha_observacion = models.DateField()
    ocupado = models.BooleanField(default=False)
    hay_huevos = models.BooleanField(default=False)
    cantidad_huevos = models.PositiveIntegerField(default=0)
    hay_polluelos = models.BooleanField(default=False)
    cantidad_polluelos = models.PositiveIntegerField(default=0)
    notas = models.TextField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'observaciones_nido'
        verbose_name = 'Observación de nido'
        verbose_name_plural = 'Observaciones de nidos'

    def __str__(self):
        return f'Observación {self.id} - Nido {self.nido_id}'