from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from diet.models import MealPlan
from ...serializers.diet.mealplan_serializers import MealPlanDetailSerializer, MealPlanWriteSerializer

class MealPlanListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 현재 사용자에 해당하는 MealPlan들을 조회
        meal_plans = MealPlan.objects.filter(user=request.user)
        serializer = MealPlanDetailSerializer(meal_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MealPlanWriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            meal_plan = serializer.save()
            # 생성 후 상세 정보를 응답에 포함시키도록 DetailSerializer 사용
            output_serializer = MealPlanDetailSerializer(meal_plan)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MealPlanDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        # current user가 소유한 MealPlan만 접근할 수 있음
        return get_object_or_404(MealPlan, pk=pk, user=self.request.user)

    def get(self, request, pk):
        meal_plan = self.get_object(pk)
        serializer = MealPlanDetailSerializer(meal_plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        meal_plan = self.get_object(pk)
        serializer = MealPlanWriteSerializer(
            meal_plan, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            updated_meal_plan = serializer.save()
            output_serializer = MealPlanDetailSerializer(updated_meal_plan)
            return Response(output_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        meal_plan = self.get_object(pk)
        meal_plan.delete()
        return Response(
            {"detail": "식단 계획이 삭제되었습니다."},
            status=status.HTTP_204_NO_CONTENT
        )