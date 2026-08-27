import json

import boto3
from botocore.config import Config
from django.conf import settings


def _endpoint_url():
    scheme = 'https' if settings.MINIO_USE_SSL else 'http'
    return f'{scheme}://{settings.MINIO_ENDPOINT}'


def _s3_client():
    return boto3.client(
        's3',
        endpoint_url=_endpoint_url(),
        aws_access_key_id=settings.MINIO_ROOT_USER,
        aws_secret_access_key=settings.MINIO_ROOT_PASSWORD,
        config=Config(
            connect_timeout=5,
            read_timeout=10,
            retries={'max_attempts': 2},
        ),
    )


def ensure_minio_bucket():
    """Asegura que el bucket de MinIO existe con política pública de lectura.

    Devuelve un dict con información útil:
      - bucket_name
      - created (True si se ha creado en esta llamada)
      - policy_applied (True si se ha aplicado la política)
    Es idempotente: si el bucket ya existe no se recrea.
    Lanza excepción si MinIO no está disponible o hay un error S3 real.
    """
    s3 = _s3_client()
    bucket_name = settings.MINIO_BUCKET_NAME

    created = False
    try:
        s3.head_bucket(Bucket=bucket_name)
        exists = True
    except Exception:
        exists = False

    if not exists:
        s3.create_bucket(Bucket=bucket_name)
        created = True

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

    return {
        'bucket_name': bucket_name,
        'created': created,
        'policy_applied': True,
    }
