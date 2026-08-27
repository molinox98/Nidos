from django.core.management.base import BaseCommand, CommandError

from apps.mediafiles.storage import ensure_minio_bucket


class Command(BaseCommand):
    help = 'Asegura que el bucket de MinIO existe con acceso público de lectura'

    def handle(self, *args, **options):
        try:
            resultado = ensure_minio_bucket()
        except Exception as e:
            raise CommandError(
                'No se pudo preparar el almacenamiento de imágenes de MinIO. '
                'Revisa la configuración y que el servicio MinIO esté disponible.'
            ) from e

        bucket_name = resultado['bucket_name']

        if resultado['created']:
            self.stdout.write(self.style.SUCCESS(
                f'Bucket de MinIO creado: {bucket_name}'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Bucket de MinIO ya existe: {bucket_name}'
            ))

        if resultado['policy_applied']:
            self.stdout.write(self.style.SUCCESS(
                f'Política pública aplicada al bucket: {bucket_name}'
            ))
