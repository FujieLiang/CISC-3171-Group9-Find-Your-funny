import os
from datetime import datetime
from flask import request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, JWTManager
from blacklist import blacklist
from config import app, database
from models import *
from Location.routes import location_bp
from Location.geocoder import Geocoder
from Location.matching_service import MatchingService
from Location.distance_service import DistanceService
import requests

geocoder = Geocoder(api_key="your_api_key")
distance_service = DistanceService()
matcher = MatchingService(distance_service)
app.register_blueprint(location_bp, url_prefix="/location")
jwt = JWTManager(app)

# Serve the built React app (single origin with the API)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # Let API routes 404 naturally if not matched
    if path.startswith("api/") or path.startswith("location/"):
        return jsonify({"detail": "Not found"}), 404

    build_dir = app.template_folder
    if not build_dir:
        return jsonify({"detail": "Frontend build not configured"}), 500

    full_path = os.path.join(build_dir, path)
    if path and os.path.exists(full_path) and os.path.isfile(full_path):
        return send_from_directory(build_dir, path)
    return send_from_directory(build_dir, "index.html")

# ---- API compatibility layer for the React frontend ----

def _category_to_enum(value):
    if not value:
        return None
    v = str(value).upper()
    mapping = {
        "STANDUP": EventRole.STANDUP_SHOW,
        "STANDUP_SHOW": EventRole.STANDUP_SHOW,
        "IMPROV": EventRole.IMPROV_SHOW,
        "IMPROV_SHOW": EventRole.IMPROV_SHOW,
        "OPEN_MIC": EventRole.OPEN_MIC,
    }
    return mapping.get(v)


def _user_payload(user: User):
    if not user:
        return None
    return {
        "id": user.id,
        "role": int(user.role) if user.role is not None else None,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "streetAddress": user.streetAddress,
        "city": user.city,
        "state": user.state,
        "country": user.country,
        "zipCode": str(user.zipCode) if user.zipCode is not None else None,
        "latitude": user.latitude,
        "longitude": user.longitude,
    }


def _event_payload(event: Events):
    if not event:
        return None
    organizer = User.query.get(event.organizer)
    organizer_name = None
    if organizer:
        organizer_name = f"{organizer.firstName} {organizer.lastName}".strip()
    return {
        "id": str(event.id),
        "name": event.name,
        "description": event.description,
        "category": event.category.name.replace("_SHOW", "") if event.category else None,
        "streetAddress": event.streetAddress,
        "city": event.city,
        "state": event.state,
        "country": event.country,
        "zipCode": str(event.zipCode) if event.zipCode is not None else None,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "organizer": event.organizer,
        "organizerName": organizer_name,
        "startTime": event.startTime,
        "endTime": event.endTime,
        "createdAt": event.createdAt.isoformat() if getattr(event, "createdAt", None) else None,
        "signupCount": event.signupList.count() if event.signupList is not None else 0,
    }


@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.get_json() or {}

    # accept either {username} or legacy {userName}
    username = data.get("username") or data.get("userName")
    firstName = data.get("firstName")
    lastName = data.get("lastName")
    email = data.get("email")
    password = data.get("password")
    streetAddress = data.get("streetAddress")
    city = data.get("city")
    state = data.get("state")
    country = data.get("country") or "USA"
    zipCode = data.get("zipCode")

    if not username or not firstName or not lastName or not email or not password or not streetAddress or not city or not state or not country or not zipCode:
        return jsonify({"detail": "Incorrect value in submission. Please resubmit."}), 400

    full_address = f"{streetAddress}, {city}, {state} {zipCode}"
    hashedPassword = generate_password_hash(password, method="pbkdf2:sha256")

    try:
        lat, lon = geocoder.geocode(full_address)
    except Exception:
        # fall back: allow account creation even if geocoding fails
        lat, lon = 0.0, 0.0

    newUser = User(
        role=user_roles.STANDARD_USER,
        username=username,
        firstName=firstName,
        lastName=lastName,
        email=email,
        passwordHash=hashedPassword,
        streetAddress=streetAddress,
        city=city,
        state=state,
        country=country,
        zipCode=int(zipCode),
        latitude=float(lat),
        longitude=float(lon),
    )
    try:
        database.session.add(newUser)
        database.session.commit()
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

    token = create_access_token(identity=str(newUser.id))
    return jsonify({"token": token, "user": _user_payload(newUser)}), 201


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.passwordHash, password):
        token = create_access_token(identity=str(user.id))
        return jsonify({"token": token, "user": _user_payload(user)}), 200

    return jsonify({"detail": "Invalid user information."}), 401

@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def api_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"detail": "User not found."}), 404
    return jsonify(_user_payload(user)), 200

@app.route("/api/users/<int:user_id>", methods=["GET"])
def api_user_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"detail": "User not found"}), 404
    
    # Return public user information (exclude sensitive data like email)
    return jsonify({
        "id": user.id,
        "role": int(user.role) if user.role is not None else None,
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "city": user.city,
        "state": user.state,
        "country": user.country,
    }), 200

@app.route("/api/follow", methods=["POST"])
@jwt_required()
def api_follow():
    user_id = int(get_jwt_identity())
    target_id = (request.get_json() or {}).get("targetUserId")
    if not target_id or int(target_id) == user_id:
        return jsonify({"detail": "Invalid target."}), 400

    me = User.query.get(user_id)
    target = User.query.get(int(target_id))
    if not me or not target:
        return jsonify({"detail": "User not found."}), 404

    if target not in me.following:
        me.following.append(target)
        try:
            database.session.commit()
        except Exception as e:
            database.session.rollback()
            return jsonify({"detail": str(e)}), 400

    return jsonify({"following": True}), 200


@app.route("/api/follow", methods=["DELETE"])
@jwt_required()
def api_unfollow():
    user_id = int(get_jwt_identity())
    target_id = (request.get_json() or {}).get("targetUserId")
    if not target_id:
        return jsonify({"detail": "Invalid target."}), 400

    me = User.query.get(user_id)
    target = User.query.get(int(target_id))
    if not me or not target:
        return jsonify({"detail": "User not found."}), 404

    if target in me.following:
        me.following.remove(target)
        try:
            database.session.commit()
        except Exception as e:
            database.session.rollback()
            return jsonify({"detail": str(e)}), 400

    return jsonify({"following": False}), 200


@app.route("/api/users/<int:user_id>/follow-status", methods=["GET"])
@jwt_required()
def api_follow_status(user_id):
    viewer_id = int(get_jwt_identity())
    me = User.query.get(viewer_id)
    target = User.query.get(user_id)
    if not me or not target:
        return jsonify({"detail": "User not found."}), 404
    return jsonify({"following": target in me.following}), 200


def _follow_user_payload(u):
    return {
        "id": u.id,
        "username": u.username,
        "firstName": u.firstName,
        "lastName": u.lastName,
    }


@app.route("/api/users/<int:user_id>/followers", methods=["GET"])
def api_user_followers(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"detail": "User not found"}), 404
    return jsonify([_follow_user_payload(u) for u in user.followers]), 200


@app.route("/api/users/<int:user_id>/following", methods=["GET"])
def api_user_following(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"detail": "User not found"}), 404
    return jsonify([_follow_user_payload(u) for u in user.following]), 200


@app.route("/api/auth/logout", methods=["POST"])
@jwt_required()
def api_logout():
    jti = get_jwt()["jti"]
    blacklist.add(jti)
    return jsonify({"ok": True}), 200


@app.route("/api/geo/reverse", methods=["POST"])
def api_geo_reverse():
    body = request.get_json() or {}
    latitude = body.get("latitude")
    longitude = body.get("longitude")
    if latitude is None or longitude is None:
        return jsonify({"detail": "latitude and longitude are required"}), 400

    try:
        r = requests.get(
            "https://geocode.maps.co/reverse",
            params={"lat": latitude, "lon": longitude, "api_key": geocoder.api_key},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        addr = (data or {}).get("address") or {}
        return jsonify({
            "city": addr.get("city") or addr.get("town") or addr.get("village"),
            "state": addr.get("state"),
            "country": addr.get("country"),
            "zipCode": addr.get("postcode"),
            "raw": data,
        }), 200
    except Exception as e:
        return jsonify({"detail": f"Reverse geocoding failed: {e}"}), 400


@app.route("/api/events", methods=["GET"])
def api_events_list():
    q = (request.args.get("q") or "").strip().lower()
    city = (request.args.get("city") or "").strip().lower()
    category = _category_to_enum(request.args.get("category"))

    events = Events.query.all()
    out = []
    for e in events:
        if category and e.category != category:
            continue
        if city and (e.city or "").lower() != city:
            continue
        if q:
            hay = f"{e.name} {e.description} {e.city} {e.state}".lower()
            if q not in hay:
                continue
        out.append(_event_payload(e))

    # newest first (best-effort)
    def _sort_key(ev):
        try:
            return ev.get("createdAt") or ""
        except Exception:
            return ""

    out.sort(key=_sort_key, reverse=True)
    return jsonify(out), 200


@app.route("/api/events", methods=["POST"])
@jwt_required()
def api_events_create():
    user_id = int(get_jwt_identity())
    body = request.get_json() or {}

    event_name = body.get("eventName") or body.get("name")
    description = body.get("description")
    category_value = body.get("category")
    street_address = body.get("streetAddress")
    city = body.get("city")
    state = body.get("state")
    country = body.get("country") or "USA"
    zip_code = body.get("zipCode")
    start_time = body.get("startTime")
    end_time = body.get("endTime")

    if not event_name or not description or not category_value or not street_address or not city or not state or not zip_code or not start_time or not end_time:
        return jsonify({"detail": "Incorrect value in submission. Please resubmit."}), 400

    enum_category = _category_to_enum(category_value)
    if not enum_category:
        return jsonify({"detail": "Invalid category"}), 400

    venue = database.session.query(Venue).filter_by(
        streetAddress=street_address,
        city=city,
        state=state,
        zipCode=int(zip_code),
    ).first()

    if not venue:
        full_address = f"{street_address},{city}, {state} {zip_code}"
        try:
            lat, lon = geocoder.geocode(full_address)
        except Exception:
            lat, lon = 0.0, 0.0

        new_venue = Venue(
            streetAddress=street_address,
            city=city,
            state=state,
            country=country,
            zipCode=int(zip_code),
            latitude=float(lat),
            longitude=float(lon),
        )
        database.session.add(new_venue)
        event_lat, event_lon = new_venue.latitude, new_venue.longitude
    else:
        event_lat, event_lon = venue.latitude, venue.longitude

    new_event = Events(
        name=event_name,
        description=description,
        category=enum_category,
        streetAddress=street_address,
        city=city,
        state=state,
        country=country,
        zipCode=int(zip_code),
        latitude=float(event_lat),
        longitude=float(event_lon),
        organizer=user_id,
        startTime=start_time,
        endTime=end_time,
    )

    try:
        database.session.add(new_event)
        database.session.commit()
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

    return jsonify({"event": _event_payload(new_event)}), 201


@app.route("/api/events/<int:event_id>", methods=["GET"])
def api_event_get(event_id):
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"detail": "Event not found."}), 404
    return jsonify(_event_payload(event)), 200


@app.route("/api/events/<int:event_id>", methods=["DELETE"])
@jwt_required()
def api_event_delete(event_id):
    user_id = int(get_jwt_identity())
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"detail": "Event not found."}), 404
    if event.organizer != user_id:
        return jsonify({"detail": "Unauthorized to delete this event."}), 403
    try:
        database.session.delete(event)
        database.session.commit()
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    return jsonify({"ok": True}), 200


@app.route("/api/events/<int:event_id>", methods=["PUT"])
@jwt_required()
def api_event_update(event_id):
    user_id = int(get_jwt_identity())
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"detail": "Event not found."}), 404
    if event.organizer != user_id:
        return jsonify({"detail": "Unauthorized to update this event."}), 403

    body = request.get_json() or {}
    if "eventName" in body or "name" in body:
        event.name = body.get("eventName") or body.get("name") or event.name
    if "description" in body:
        event.description = body.get("description") or event.description
    if "category" in body:
        enum_category = _category_to_enum(body.get("category"))
        if enum_category:
            event.category = enum_category

    for k in ["streetAddress", "city", "state", "country", "zipCode", "startTime", "endTime"]:
        if k in body and body.get(k) is not None:
            setattr(event, k, body.get(k))

    try:
        database.session.commit()
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

    return jsonify({"event": _event_payload(event)}), 200


@app.route("/api/events/<int:event_id>/my-signup", methods=["GET"])
@jwt_required()
def api_event_my_signup(event_id):
    user_id = int(get_jwt_identity())
    exists = signup_List.query.filter_by(event=event_id, name=user_id).first() is not None
    return jsonify({"signedUp": bool(exists)}), 200


@app.route("/api/events/<int:event_id>/signups", methods=["GET"])
@jwt_required(optional=True)
def api_event_signups(event_id):
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"detail": "Event not found."}), 404
    
    identity = get_jwt_identity()
    viewer_id = int(identity) if identity is not None else None
    is_organizer = viewer_id == event.organizer

    entries = signup_List.query.filter_by(event=event_id).all()
    signups = []
    for entry in entries:
        u = User.query.get(entry.name)
        row = {
            "id": entry.id,
            "userId": u.id if u else None,
            "userName": u.username if u else None
        }
        if is_organizer:
            row["displayName"] = f"{u.firstName} {u.lastName}".strip() if u else None
            row["createdAt"] = None,
        signups.append(row)

    return jsonify({"signups": signups}), 200


@app.route("/api/events/<int:event_id>/signup", methods=["POST"])
@jwt_required()
def api_event_signup(event_id):
    user_id = int(get_jwt_identity())
    event = Events.query.get(event_id)
    if not event:
        return jsonify({"detail": "Event not found."}), 404

    existing = signup_List.query.filter_by(event=event_id, name=user_id).first()
    if existing:
        return jsonify({"ok": True}), 200

    try:
        user = User.query.get(user_id)
        if user:
            user.role = user_roles.COMIC
        database.session.add(signup_List(name=user_id, event=event_id))
        database.session.commit()
    except Exception as e:
        return jsonify({"detail": str(e)}), 400

    return jsonify({"ok": True}), 200


@app.route("/api/events/<int:event_id>/signup", methods=["DELETE"])
@jwt_required()
def api_event_cancel_signup(event_id):
    user_id = int(get_jwt_identity())
    entry = signup_List.query.filter_by(event=event_id, name=user_id).first()
    if not entry:
        return jsonify({"ok": True}), 200
    try:
        database.session.delete(entry)
        database.session.commit()
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    return jsonify({"ok": True}), 200


@app.route("/api/users/<int:user_id>/events/created", methods=["GET"])
def api_events_created(user_id):
    events = Events.query.filter_by(organizer=user_id).all()
    return jsonify([_event_payload(e) for e in events]), 200


@app.route("/api/users/<int:user_id>/events/signedup", methods=["GET"])
def api_events_signedupfor(user_id):
    entries = signup_List.query.filter_by(name=user_id).all()
    event_ids = [e.event for e in entries]
    if not event_ids:
        return jsonify([]), 200
    events = Events.query.filter(Events.id.in_(event_ids)).all()
    return jsonify([_event_payload(e) for e in events]), 200


@app.route("/api/events/nearby-public", methods=["GET"])
def api_nearby_public():
    try:
        lat = float(request.args.get("lat"))
        lon = float(request.args.get("lon"))
    except Exception:
        return jsonify({"detail": "lat and lon are required"}), 400
    limit = request.args.get("limit")
    try:
        limit = int(limit) if limit is not None else 40
    except Exception:
        limit = 40

    events = Events.query.all()
    event_dicts = [{"id": e.id, "lat": e.latitude, "lon": e.longitude} for e in events]
    matches = matcher.find_nearby_events(lat, lon, event_dicts)
    ids = [m["event_id"] for m in matches][:limit]
    by_id = {e.id: e for e in events}
    return jsonify([_event_payload(by_id[i]) for i in ids if i in by_id]), 200



@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    return jwt_payload["jti"] in blacklist


if __name__ == "__main__":
    with app.app_context():
        database.create_all()

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "5000")),
        debug=True,
        use_reloader=False,
    )
