# Workouts serializers
from .workouts import *

# Ecommerce serializers  
from .ecommerce import *

# Diet serializers
from .diet import *

# Users serializers
from .users import *

# Community serializers
from .community import *

# Audit serializers
from .audit import *

# Challenge serializers (통합됨)
from .challenge_serializers import *
from .challenge_ranking_serializer import *

# Recommendation serializers (standalone)
from .recommendation_serializers import *

__all__ = [
    # 각 앱별 serializer들은 해당 앱의 __init__.py에서 관리
    # 이 파일은 전체 프로젝트의 serializer 진입점 역할
] 