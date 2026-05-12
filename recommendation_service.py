from config import database
from models import UserHumorProfile, HUMOR_CATEGORIES, follows


def average_vectors(vectors):
    if not vectors:
        return None

    keys = vectors[0].keys()
    total = {k: 0 for k in keys}
    for vector in vectors:
        for k in keys:
            total[k] += vector.get(k, 0)

    count = len(vectors)
    return {k: v / count for k, v in total.items()}


def default_vector(value=5.0):
    return {k: value for k in HUMOR_CATEGORIES}


def save_quiz_vector(user_id, quiz_vector, skipped=False):
    profile = UserHumorProfile.query.filter_by(user_id=user_id).first()

    if profile:
        profile.quiz_vector = quiz_vector
        profile.final_vector = quiz_vector
        profile.skipped_onboarding = skipped
    else:
        profile = UserHumorProfile(
            user_id=user_id,
            quiz_vector=quiz_vector,
            final_vector=quiz_vector,
            skipped_onboarding=skipped,
        )
        database.session.add(profile)

    database.session.commit()
    return profile.final_vector


def recompute_final_vector(user_id):
    profile = UserHumorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return None

    quiz_vector = profile.quiz_vector

    followed_ids = [row[0] for row in database.session.query(follows.c.following_id)
        .filter(follows.c.follower_id == user_id)
        .all()]

    if not followed_ids:
        profile.final_vector = quiz_vector
        database.session.commit()
        return profile.final_vector

    followed_profiles = UserHumorProfile.query.filter(
        UserHumorProfile.user_id.in_(followed_ids)
    ).all()

    social_vectors = [p.final_vector for p in followed_profiles if p.final_vector]
    social_vector = average_vectors(social_vectors)

    if not social_vector:
        profile.final_vector = quiz_vector
        database.session.commit()
        return profile.final_vector

    final_vector = {
        category: 0.7 * quiz_vector.get(category, 0) + 0.3 * social_vector.get(category, 0)
        for category in HUMOR_CATEGORIES
    }

    profile.final_vector = final_vector
    database.session.commit()
    return final_vector
