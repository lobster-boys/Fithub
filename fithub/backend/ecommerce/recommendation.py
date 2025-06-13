# 추천 시스템
class Recommandation:
    # 자카드 유사도
    def get_jaccard_similarity(user, other_user):
        '''
        사용자와 다른 사용자의 리스트를 받아서 자카드 유사도를 리턴한다.
        리스트 길이는 10개의 인덱스로 이루어져 있으며, 중복이 없어야 한다.
        float 형식으로 리턴한다.
        '''
        user = set(user)
        other_user = set(other_user)

        return float(len(user.intersection(other_user)) / len(user.union(other_user)))
    

