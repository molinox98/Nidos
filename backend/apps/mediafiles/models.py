from django.db import models


def ruta_imagen_nido(instance, filename):
    return f'nidos/{instance.nido_id}/imagenes/{filename}'


class ImagenNido(models.Model):
    id = models.BigAutoField(primary_key=True)
    nido = models.ForeignKey(
        'nests.Nido',
        on_delete=models.CASCADE,
        related_name='imagenes',
    )
    observacion = models.ForeignKey(
        'observations.ObservacionNido',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='imagenes',
    )
    usuario = models.ForeignKey(
        'users.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='imagenes',
    )
    archivo = models.ImageField(upload_to=ruta_imagen_nido)
    descripcion = models.TextField(null=True, blank=True)
    es_principal = models.BooleanField(default=False)
    fecha_subida = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'imagenes_nido'
        verbose_name = 'Imagen de nido'
        verbose_name_plural = 'Imágenes de nidos'
        constraints = [
            models.UniqueConstraint(
                fields=['nido'],
                condition=models.Q(es_principal=True),
                name='unique_imagen_principal_por_nido',
            )
        ]

    def __str__(self):
        return f'Imagen {self.id} - Nido {self.nido_id}'