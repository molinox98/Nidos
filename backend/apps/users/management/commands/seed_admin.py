import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


# CREAR O ACTUALIZAR EL USUARIO ADMIN INICIAL DESDE VARIABLES DE ENTORNO
class Command(BaseCommand):
    help = 'Crea o actualiza el usuario administrador inicial desde variables de entorno.'

    def handle(self, *args, **options):
        email = os.environ.get('SEED_ADMIN_EMAIL', '').strip()
        password = os.environ.get('SEED_ADMIN_PASSWORD', '')
        nombre = os.environ.get('SEED_ADMIN_NOMBRE', '').strip() or 'admin'

        if not email:
            raise CommandError('SEED_ADMIN_EMAIL es obligatorio para ejecutar seed_admin.')
        if not password:
            raise CommandError('SEED_ADMIN_PASSWORD es obligatorio para ejecutar seed_admin.')

        Usuario = get_user_model()
        usuario, creado = Usuario.objects.get_or_create(
            email=email,
            defaults={
                'nombre': nombre,
                'rol': 'admin',
                'activo': True,
                'is_staff': True,
                'is_superuser': True,
            },
        )

        if creado:
            usuario.set_password(password)
            usuario.save()
            self.stdout.write(self.style.SUCCESS(f'Usuario admin creado: {email}'))
        else:
            usuario.nombre = nombre
            usuario.rol = 'admin'
            usuario.activo = True
            usuario.is_staff = True
            usuario.is_superuser = True
            usuario.set_password(password)
            usuario.save()
            self.stdout.write(self.style.SUCCESS(f'Usuario admin actualizado: {email}'))
