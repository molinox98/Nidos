import json

import boto3
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Asegura que el bucket de MinIO existe con acceso público de lectura'

    def handle(self, *args, **options):
        s3 = boto3.client(
            's3',
            endpoint_url=f'http://{settings.MINIO_ENDPOINT}',
            aws_access_key_id=settings.MINIO_ROOT_USER,
            aws_secret_access_key=settings.MINIO_ROOT_PASSWORD,
        )

        bucket_name = settings.MINIO_BUCKET_NAME

        try:
            s3.head_bucket(Bucket=bucket_name)
            self.stdout.write(self.style.SUCCESS(
                f'Bucket "{bucket_name}" ya existe.'
            ))
        except Exception:
            s3.create_bucket(Bucket=bucket_name)
            self.stdout.write(self.style.SUCCESS(
                f'Bucket "{bucket_name}" creado.'
            ))

        policy = {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Effect': 'Allow',
                    'Principal': {'AWS': ['*']},
                    'Action': ['s3:GetObject'],
                    'Resource': [f'arn:aws:s3:::{bucket_name}/*'],
                }
            ],
        }

        s3.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(policy),
        )

        self.stdout.write(self.style.SUCCESS(
            f'Política de acceso público de lectura aplicada a "{bucket_name}".'
        ))
