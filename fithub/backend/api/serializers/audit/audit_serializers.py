from rest_framework import serializers
from audit.models import ChangeLog

class ChangeLogSerializer(serializers.ModelSerializer):
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ChangeLog
        fields = [
            'id', 'user_username', 'content_type_name', 'object_id',
            'action', 'field_changes', 'previous_data', 'current_data',
            'timestamp', 'client_timestamp', 'sync_status', 'version'
        ]

# 클라이언트로부터 특정 변경 로그 복원 데이터를 입력받기 위한 용도
class RestoreDataSerializer(serializers.Serializer):
    change_log_id = serializers.IntegerField()
    confirm = serializers.BooleanField(default=False)

    def validate(self, data):
        change_log_id = data.get("change_log_id")
        confirm = data.get("confirm")

        # 복원 진행 동의 여부 검증
        if not confirm:
            raise serializers.ValidationError("복원을 진행하려면 confirm 값을 True로 설정해야 합니다.")

        # change_log_id로 실제 ChangeLog 존재 여부 체크
        try:
            change_log = ChangeLog.objects.get(id=change_log_id)
        except ChangeLog.DoesNotExist:
            raise serializers.ValidationError("존재하지 않는 변경 로그 ID입니다.")

        # 복원 가능한 조건 검증
        # 1. 생성 로그는 복원 불가능 (이전 데이터가 없으므로)
        if change_log.action == 'create':
            raise serializers.ValidationError("생성 로그 항목은 복원할 수 없습니다.")

        # 2. 이전 데이터가 없는 경우 복원 불가능
        if not change_log.previous_data:
            raise serializers.ValidationError("이 변경 로그에는 복원할 이전 데이터가 존재하지 않습니다.")

        # 3. 동기화 상태가 'synced'여야 복원 가능 
        if change_log.sync_status != 'synced':
            raise serializers.ValidationError("현재 변경 로그의 동기화 상태로 인해 복원이 불가능합니다.")

        data["change_log"] = change_log
        return data
