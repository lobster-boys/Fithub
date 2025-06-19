from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from diet.models import MealPlan
from ...serializers.diet.mealplan_serializers import MealPlanDetailSerializer, MealPlanWriteSerializer
from ...permissions import PublicReadOnly

class MealPlanListView(APIView):
    permission_classes = [PublicReadOnly]

    def get(self, request):
        # 인증된 사용자의 경우 해당 사용자의 MealPlan들을 조회
        # 인증되지 않은 사용자의 경우 빈 목록 반환
        if request.user and request.user.is_authenticated:
            meal_plans = MealPlan.objects.filter(user=request.user)
        else:
            meal_plans = MealPlan.objects.none()
        
        serializer = MealPlanDetailSerializer(meal_plans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # POST는 여전히 인증 필요
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        serializer = MealPlanWriteSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            meal_plan = serializer.save()
            # 생성 후 상세 정보를 응답에 포함시키도록 DetailSerializer 사용
            output_serializer = MealPlanDetailSerializer(meal_plan)
            return Response(output_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MealPlanDetailView(APIView):
    permission_classes = [PublicReadOnly]

    def get_object(self, pk):
        # 인증된 사용자의 경우 자신의 MealPlan만 접근
        # 인증되지 않은 사용자의 경우 404 반환
        if self.request.user and self.request.user.is_authenticated:
            return get_object_or_404(MealPlan, pk=pk, user=self.request.user)
        else:
            # 인증되지 않은 사용자는 MealPlan에 접근할 수 없음
            from django.http import Http404
            raise Http404("MealPlan matching query does not exist.")

    def get(self, request, pk):
        meal_plan = self.get_object(pk)
        serializer = MealPlanDetailSerializer(meal_plan)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        # PATCH는 인증 필요
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
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
        # DELETE는 인증 필요
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        meal_plan = self.get_object(pk)
        meal_plan.delete()
        return Response(
            {"detail": "식단 계획이 삭제되었습니다."},
            status=status.HTTP_204_NO_CONTENT
        )