from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from ...serializers.diet.food_serializers import FoodSerializer, FoodCreateSerializer, FoodUpdateSerializer
from diet.models import Food


class FoodListView(APIView):
    """
    GET  /api/diet/foods/
    POST /api/diet/foods/
    """
    def get(self, request, *args, **kwargs):
        foods = Food.objects.all()
        serializer = FoodSerializer(foods, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = FoodCreateSerializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            food = serializer.save()
            output_serializer = FoodSerializer(food)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FoodDetailView(APIView):
    """
    GET /api/diet/foods/<int:pk>/ : 특정 음식 조회
    PATCH /api/diet/foods/<int:pk>/ : 음식 수정
    DELETE /api/diet/foods/<int:pk>/ : 음식 삭제
    """
    def get_object(self, pk):
        return get_object_or_404(Food, pk=pk)
    
    def get(self, request, pk, *args, **kwargs):
        food = self.get_object(pk)
        serializer = FoodSerializer(food)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request, pk, *args, **kwargs):
        food = self.get_object(pk)
        serializer = FoodUpdateSerializer(food, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_food = serializer.save()
            output_serializer = FoodSerializer(updated_food)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):
        food = self.get_object(pk)

        if food.user != request.user:
            return Response(
                {"error": "자신이 추가한 음식만 삭제할 수 있습니다."},
                status=status.HTTP_403_FORBIDDEN
            )
        food.delete()
        return Response(
            {'detail': '음식이 삭제되었습니다.'},
            status=status.HTTP_204_NO_CONTENT
        )
