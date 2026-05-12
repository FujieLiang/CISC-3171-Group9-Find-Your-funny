from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Events
from Recommend.event_humor_service import event_audience_payload, match_scores_for_user

event_humor_bp = Blueprint("event_humor", __name__)


@event_humor_bp.route("/<int:event_id>/audience-profile", methods=["GET"])
@jwt_required()
def audience_profile(event_id):
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"detail": "Event not found."}), 404
    return jsonify(event_audience_payload(event_id))


@event_humor_bp.route("/recommendations/me", methods=["GET"])
@jwt_required()
def my_event_recommendations():
    user_id = int(get_jwt_identity())
    return jsonify({"scores": match_scores_for_user(user_id)})
