from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.common.permissions import SoloAdmin
from apps.users.models import Usuario
from apps.users.serializers import CustomTokenObtainSerializer, UsuarioSerializer


# LOGIN PERSONALIZADO (EMAIL O NOMBRE + PASSWORD)
class CustomTokenObtainView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomTokenObtainSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })


class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)


# LISTADO DE USUARIOS (SOLO ADMIN)
class UsuarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.all().order_by('nombre')
    serializer_class = UsuarioSerializer
    permission_classes = [SoloAdmin]