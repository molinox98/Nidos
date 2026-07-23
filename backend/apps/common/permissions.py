from rest_framework.permissions import BasePermission


# PERMISO: ADMIN O BANDER PUEDEN CREAR/EDITAR; TODOS PUEDEN LEER
class EsAdminOBander(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol in ('admin', 'bander')
        )


# PERMISO: SOLO ADMIN PUEDE CREAR/EDITAR; TODOS PUEDEN LEER
class SoloAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol == 'admin'
        )
