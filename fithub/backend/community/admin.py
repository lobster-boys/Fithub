from django.contrib import admin
from .models import Post, Comment, Routine, RoutineSharePermission

# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Routine)
admin.site.register(RoutineSharePermission)
