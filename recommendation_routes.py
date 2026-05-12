from models import UserHumorProfile,Comedian,signup_List
from Recommend.humor_profile_service import average_vectors
from Recommend.comedian_service import comedian_raw_vector
from Recommend.similarity import cosine_similarity


def event_audience_vector(event_id):
    user_ids = [row.name for row in signup_List.query.filter_by(event=event_id).all()]
    if not user_ids:
        return None, 0

    profiles = UserHumorProfile.query.filter(
        UserHumorProfile.user_id.in_(user_ids)
    ).all()
    vectors = [p.final_vector for p in profiles if p.final_vector]
    return average_vectors(vectors), len(vectors)


def event_audience_payload(event_id, top_n_comedians=5):
    vector, sample_size = event_audience_vector(event_id)
    if not vector:
        return {
            "eventId": event_id,
            "sampleSize": 0,
            "vector": None,
            "topTraits": [],
            "recommendedComedians": [],
        }

    top_traits = [
        k for k, _ in sorted(vector.items(), key=lambda kv: kv[1], reverse=True)[:5]
    ]

    scored = []
    for c in Comedian.query.all():
        score = cosine_similarity(vector, comedian_raw_vector(c))
        scored.append((score, c))
    scored.sort(key=lambda s: s[0], reverse=True)

    return {
        "eventId": event_id,
        "sampleSize": sample_size,
        "vector": vector,
        "topTraits": top_traits,
        "recommendedComedians": [
            {"id": c.id, "name": c.name, "score": round(score, 4)}
            for score, c in scored[:top_n_comedians]
        ],
    }


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
            "score": round(cosine_similarity(user_vector, audience), 4),
            "sampleSize": len(vectors),
        }

    return scores
