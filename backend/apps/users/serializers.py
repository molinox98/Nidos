from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.models import Usuario

User = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'email', 'rol', 'activo', 'is_staff', 'is_superuser']
        read_only_fields = fields


class CustomTokenObtainSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        if not identifier:
            raise serializers.ValidationError(
                {'username': 'Se requiere el campo username o email.'}
            )

        if '@' in identifier:
            users = User.objects.filter(email__iexact=identifier)
        else:
            users = User.objects.filter(nombre__iexact=identifier)

        if users.count() == 0:
            raise serializers.ValidationError(
                {'username': 'Credenciales incorrectas.'}
            )

        if users.count() > 1:
            raise serializers.ValidationError(
                {'username': 'Hay varios usuarios con ese nombre. Usa tu email.'}
            )

        user = users.first()

        if not user.check_password(password):
            raise serializers.ValidationError(
                {'username': 'Credenciales incorrectas.'}
            )

        if not user.activo:
            raise serializers.ValidationError(
                {'username': 'Este usuario está desactivado.'}
            )

        attrs['user'] = user
        return attrs