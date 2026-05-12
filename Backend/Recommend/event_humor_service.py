from models import UserHumorProfile, signup_List
from Recommend.humor_profile_service import average_vectors
from Recommend.similarity import pearson_correlation


def match_scores_for_user(user_id):
    profile = UserHumorProfile.query.filter_by(user_id=user_id).first()
    if not profile or not profile.final_vector:
        return {}

    user_vector = profile.final_vector

    signups_by_event = {}
    for row in signup_List.query.all():
        signups_by_event.setdefault(row.event, []).append(row.name)

    all_user_ids = {uid for ids in signups_by_event.values() for uid in ids}
    if not all_user_ids:
        return {}

    profiles_by_user = {
        p.user_id: p.final_vector
        for p in UserHumorProfile.query.filter(
            UserHumorProfile.user_id.in_(all_user_ids)
        ).all()
        if p.final_vector
    }

    scores = {}
    for event_id, user_ids in signups_by_event.items():
        vectors = [profiles_by_user[uid] for uid in user_ids if uid in profiles_by_user]
        if not vectors:
            continue
        audience = average_vectors(vectors)
        scores[event_id] = {
            "score": round(pearson_correlation(user_vector, audience), 4),
            "sampleSize": len(vectors),
        }

    return scores
