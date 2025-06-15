from rest_framework import serializers
from workouts.models import Exercise


class ExerciseSimpleSerializer(serializers.ModelSerializer):
    """간단한 운동 정보 serializer"""
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'muscle_group']


class ExerciseSerializer(serializers.ModelSerializer):
    """운동 상세 정보 serializer"""
    class Meta:
        model = Exercise
        fields = '__all__'


class ExerciseCreateSerializer(serializers.ModelSerializer):
    """운동 생성용 serializer"""
    class Meta:
        model = Exercise
        exclude = ['created_at', 'updated_at']


class ExerciseUpdateSerializer(serializers.ModelSerializer):
    """운동 수정용 serializer"""
    class Meta:
        model = Exercise
        exclude = ['created_at', 'updated_at']
        
    def validate_name(self, value):
        """운동 이름 중복 검사"""
        if Exercise.objects.filter(name=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("이미 존재하는 운동 이름입니다.")
        return value


class ExerciseStatsSerializer(serializers.Serializer):
    """운동 통계 serializer"""
    exercise_id = serializers.IntegerField()
    exercise_name = serializers.CharField()
    total_sessions = serializers.IntegerField()
    total_volume = serializers.FloatField()
    average_weight = serializers.FloatField()
    max_weight = serializers.FloatField()
    last_performed = serializers.DateTimeField() 