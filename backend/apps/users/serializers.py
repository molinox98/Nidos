from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.users.models import Usuario

User = get_user_model()


# SERIALIZADOR BÁSICO DE USUARIO (LECTURA)
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'nombre', 'email', 'rol', 'activo',
            'is_staff', 'is_superuser', 'fecha_creacion', 'fecha_actualizacion',
        ]
        read_only_fields = fields


# SERIALIZADOR DE ESCRITURA PARA CREAR O EDITAR USUARIOS
class UsuarioWriteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'email', 'rol', 'activo', 'password', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'is_staff', 'is_superuser']

    def validate(self, attrs):
        # PASSWORD OBLIGATORIA AL CREAR
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria al crear el usuario.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        return Usuario.objects.create_user(
            email=validated_data.pop('email'),
            nombre=validated_data.pop('nombre'),
            password=password,
            **validated_data,
        )

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        # CONTRASEÑA VACÍA MANTIENE LA ACTUAL
        if password:
            instance.set_password(password)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# LOGIN POR EMAIL O NOMBRE CON VALIDACIÓN
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