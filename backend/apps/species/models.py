from django.db import models


class Especie(models.Model):
    # MODELO DE ESPECIE DE AVE
    id = models.BigAutoField(primary_key=True)
    nombre_comun = models.CharField(max_length=150)
    nombre_cientifico = models.CharField(max_length=150, null=True, blank=True)
    notas = models.TextField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'especies'
        verbose_name = 'Especie'
        verbose_name_plural = 'Especies'

    def __str__(self):
        return self.nombre_comun