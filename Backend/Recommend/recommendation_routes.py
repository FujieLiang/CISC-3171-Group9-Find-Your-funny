from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import User
from Recommend.humor_profile_service import save_quiz_vector, recompute_final_vector
from Recommend.recommendation_service import recommend_users_for

recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/users", methods=["GET"])
@jwt_required()
def recommend_users():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        limit = int(request.args.get("limit", 6))
    except (TypeError, ValueError):
        limit = 6

    recommendations = recommend_users_for(user_id, limit=limit)

    return jsonify({
        "user_id": user_id,
        "count": len(recommendations),
        "recommendations": recommendations,
    })


