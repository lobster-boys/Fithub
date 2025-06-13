from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ecommerce.models import Category
from api.serializers.ecommerce.category_serializers import CategorySerializer
from django.shortcuts import get_object_or_404

# Create your views here.
@api_view(["GET", "POST"])
def categories(request):
    if request.method == "GET":
        category = Category.objects.all()
        serializer = CategorySerializer(category, many=True)
        return Response(serializer.data)
    
    if request.method == "POST":
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
@api_view(["GET", "PUT", "DELETE"])
def category(request, id):
    category = get_object_or_404(Category, id=id)

    if request.method == "GET":
        serializer = CategorySerializer(category)

        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = CategorySerializer(category, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    elif request.method == "DELETE":
        category.delete()

        return Response(
            "SUCCESS", status=status.HTTP_204_NO_CONTENT
        )