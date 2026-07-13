from django.db import models


class EventoNido(models.Model):
    TIPO_EVENTO_CHOICES = [
        ('cambio_estado', 'Cambio de estado'),
        ('revision', 'Revisión'),
        ('incidencia', 'Incidencia'),
        ('mantenimiento', 'Mantenimiento'),
        ('otro', 'Otro'),
    ]

    id = models.BigAutoField(primary_key=True)
    nido = models.ForeignKey(
        'nests.Nido',
        on_delete=models.CASCADE,
        related_name='eventos',
    )
    usuario = models.ForeignKey(
        'users.Usuario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='eventos',
    )
    fecha_evento = models.DateTimeField()
    tipo_evento = models.CharField(max_length=50, choices=TIPO_EVENTO_CHOICES)
    descripcion = models.TextField(null=True, blank=True)
    estado_anterior = models.CharField(max_length=20, null=True, blank=True)
    estado_nuevo = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        db_table = 'eventos_nido'
        verbose_name = 'Evento de nido'
        verbose_name_plural = 'Eventos de nidos'

    def __str__(self):
        return f'Evento {self.id} - Nido {self.nido_id}'