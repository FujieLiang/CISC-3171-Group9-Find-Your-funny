from models import User, UserHumorProfile, follows
from Recommend.similarity import cosine_similarity
from config import database


def recommend_users_for(user_id, limit=6):
    target_profile = UserHumorProfile.query.filter_by(user_id=user_id).first()
    if not target_profile or not target_profile.final_vector:
        return []

    target_vector = target_profile.final_vector

    followed_ids = {
        row[0] for row in database.session.query(follows.c.following_id)
        .filter(follows.c.follower_id == user_id)
        .all()
    }

    rows = (
        database.session.query(User, UserHumorProfile)
        .join(UserHumorProfile, User.id == UserHumorProfile.user_id)
        .filter(User.id != user_id)
        .all()
    )

    scored = []
    for user, profile in rows:
        if user.id in followed_ids or not profile.final_vector:
            continue

        similarity = cosine_similarity(target_vector, profile.final_vector)
        scored.append({
            "id": user.id,
            "username": user.username,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "similarity": round(similarity, 4),
        })

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:limit]
