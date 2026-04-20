from flask import request, jsonify, session,redirect,url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, JWTManager
from blacklist import blacklist
from config import app, database
from models import *
from Location.routes import location_bp
from Location.geocoder import Geocoder
from Location.distance_service import DistanceService

geocoder = Geocoder(api_key= "69cc5ed34ef27252477349axzad0499")
app.register_blueprint(location_bp, url_prefix="/location")
jwt = JWTManager(app)

# Account Creation Behavior

@app.route("/create-account", methods=["POST"])
def create_account():
    username = request.json.get("userName")
    firstName = request.json.get("firstName")
    lastName = request.json.get("lastName")
    email = request.json.get("email")
    password = request.json.get("password")
    streetAddress = request.json.get("streetAddress")
    city = request.json.get("city")
    state = request.json.get("state")
    country = request.json.get("country")
    zipCode = request.json.get("zipCode")


    if not username or not firstName or not lastName or not email or not password or not streetAddress or not city or not state or not country or not zipCode:
        return(jsonify({"message":"Incorrect value in submission. Please resubmit."}), 400)
    

    full_address = f"{streetAddress}, {city}, {state} {zipCode}"
    hashedPassword = generate_password_hash(password,method='scrypt')

    lat, lon = geocoder.geocode(full_address)
    
    newUser = User(role = 1,username = username,firstName=firstName, lastName=lastName, email=email, passwordHash=hashedPassword,streetAddress=streetAddress,city=city,state=state,country=country,zipCode=zipCode,latitude=lat,longitude=lon)
    try:
        database.session.add(newUser)
        database.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    token = create_access_token(identity= newUser.id)
    return jsonify({"message": "New user created",
                    "token": token,
                    "new_user_id": newUser.id}), 201

@app.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify({"User": user.to_json()}), 200
    else:
        return jsonify({"message": "User not found."}), 404

@app.route("/user/<int:user_id>/update", methods=["PUT"])
@jwt_required
def update_user(user_id):
    user_id= get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    if user.id != user_id:
        return jsonify({"message": "You are not authorized to update this user."}), 403

    data = request.get_json()
    user.firstName = data.get("firstName", user.firstName)
    user.lastName = data.get("lastName", user.lastName)
    user.email = data.get("email", user.email)
    user.streetAddress = data.get("streetAddress", user.streetAddress)
    user.city = data.get("city", user.city)
    user.state = data.get("state", user.state)
    user.country = data.get("country", user.country)
    user.zipCode = data.get("zipCode", user.zipCode)

    new_address = f"{user.streetAddress}, {user.city},{user.state} {user.zipCode}"
    new_lat,new_lon = geocoder.geocode(new_address)
    
    user.latitude = new_lat
    user.longitude = new_lon

    try:
        database.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User updated successfully.",
                    "user_id": user.id}), 200

# Login Behavior 

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get("username")
    password = request.json.get("password") 

    user = User.query.filter_by(username=username).first()   

    if user and check_password_hash(user.passwordHash,password):
        token  = create_access_token(identity=user.id)
        return jsonify({"token": token,
                       "user_id": user.id}), 200
    
    return {"message": "Invalid user information."}, 401

# Logout Behavior

@app.route('/logout', methods=["POST"])
@jwt_required
def logout():
    jti = get_jwt()["jti"]
    blacklist.add(jti)
    return {"message": "Successfully logged out."}, 200 

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header,jwt_payload):
    return jwt_payload["jti"] in blacklist

#Venue Retrieval Behavior 

@app.route("/venues", methods=["GET"])
def get_venues():
    venues = Venue.query.all()
    jsonVenues = list(map(lambda x: x.to_json(), venues))
    return jsonify({"Venues":jsonVenues})


#Event behavior

@app.route("/events", methods=["GET"])
def get_events():
    events = Events.query.all()
    json_events = list(map(lambda x: x.to_json(), events))
    return jsonify({"Events":json_events})
    
@app.route("/create-event", methods=["POST"])
@jwt_required
def create_event():
    user_id = get_jwt_identity()
    
    event_name = request.json.get("eventName")
    description = request.json.get("description")
    category_value = request.json.get("category")
    street_address = request.json.get("streetAddress")
    city = request.json.get("city")
    state = request.json.get("state")
    country = request.json.get("country")
    zip_code = request.json.get("zipCode")
    organizer = user_id
    start_time = request.json.get("startTime")
    end_time = request.json.get("endTime")

    if not event_name or not description or not category_value or not street_address or not city or not state or not zip_code or not organizer or not start_time or not end_time:
        return jsonify({"message":"Incorrect value in submission. Please resubmit."}), 400
    
    venue = session.query(Venue).filter_by(
        street_address= street_address,
        city = city,
        state = state,
        zip_code = zip_code
    ).first()

    if not venue:
        full_address = f"{street_address},{city}, {state} {zip_code}"
        lon,lat = geocoder.geocode(full_address)
        new_venue = Venue(streetAddress = street_address, city = city, state = state, country = country, zipCode = zip_code,latitude = lat, longitude = lon)
        new_event = Events(name= event_name, description= description, category= category_value,streetAddress= street_address, city= city, state= state, country = country, zipCode= zip_code, latitude = lat, longitude = lon, organizer=organizer, startTime= start_time, endTime = end_time)

    else:
        new_venue = None
        new_event = Events(name= event_name, description= description, category= category_value,streetAddress= street_address, city= city, state= state, country = country, zipCode= zip_code, latitude = venue.latitude, longitude = venue.logitude, organizer=organizer, startTime= start_time, endTime = end_time)

    try:
        database.session.add(new_venue)
        database.session.add(new_event)
        database.session.commit()

    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New event created!",
                    "event_id" : new_event.id}), 201

@app.route("/events/nearby")
@jwt_required
def nearby_events():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.latitude or not user.longitude:
        return jsonify({"error": "User location not set"}), 400
    
    latitude, longitude = user.latitude, user.longitude
    events = Events.query.all()
    matches = DistanceService.find_nearby_events(latitude,longitude,events)
    
    return jsonify(matches)

@app.route("/events/<int:event_id>", methods= ["GET"])
def get_event_by_id(event_id):
    event = Events.query.get(event_id)
    if event:
        return jsonify({"Event": event.to_json()}), 200
    else:
        return jsonify({"message": "Event not found."}), 404
    
@app.route("/events/<int:event_id>", methods= ["DELETE"])
@jwt_required
def delete_event(event_id):
    user_id = get_jwt_identity()
    event = Events.query.get(event_id)
    if event:
        if event.organizer == user_id:
            try:
                database.session.delete(event)
                database.session.commit()
                return jsonify({"message": "Event deleted successfully."}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
        else:
            return jsonify({"message": "Unauthorized to delete this event."}), 403
    else:
        return jsonify({"message": "Event not found."}), 404

@app.route("/events/<int:event_id>/update", methods= ["PUT"])
@jwt_required
def update_event(event_id):
    user_id = get_jwt_identity()

    event = Events.query.get(event_id)
    if event:
        if event.organizer == user_id:
            event.name = request.json.get("eventName", event.name)
            event.description = request.json.get("description", event.description)
            event.category = request.json.get("category", event.category)
            event.streetAddress = request.json.get("streetAddress", event.streetAddress)
            event.city = request.json.get("city", event.city)
            event.state = request.json.get("state", event.state)
            event.zipCode = request.json.get("zipCode", event.zipCode)
            event.startTime = request.json.get("startTime", event.startTime)
            event.endTime = request.json.get("endTime", event.endTime)

            new_address = f"{event.streetAddress}, {event.city},{event.state} {event.zipCode}"
            new_lat,new_lon = geocoder.geocode(new_address)
    
            event.latitude = new_lat
            event.longitude = new_lon

            
            try:
                database.session.commit()
                return jsonify({"message": "Event updated successfully.",
                                "event_id": event.id}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
        else:
            return jsonify({"message": "Unauthorized to update this event."}), 403
    else:
        return jsonify({"message": "Event not found."}), 404
    
@app.route("/events/<int:event_id>/register", methods=["POST","PUT"])
@jwt_required
def event_signup(event_id):
    event = Events.query.get(event_id)
    if event:
        user_id = get_jwt_identity()

        if not user_id:
            return jsonify({"message":"Incorrect user value. Please resubmit."}), 400
        
        user = User.query.get(user_id)
        user.role = 2

        new_entry = signup_List(comic_name = user_id, event= event_id)
        
        try:
            database.session.add(new_entry)
            database.session.commit()
        except Exception as e:
            return jsonify({"message": str(e)})
        
        return jsonify({"message": "Entry submitted successfully.",
                        "event_id": event.id}), 200


@app.route("/events/<int:event_id>/get-list", methods=["GET"])
@jwt_required
def get_event_list(event_id):
    event = Events.query.get(event_id)
    if event:
        user_id = get_jwt_identity()

        if not user_id:
            return jsonify({"message":"Incorret user value. PLease resubmit."}), 400

        if user_id == event.organizer:
            return jsonify({
                "event_id": event.id,
                "event_name": event.name,
                "signup_list": fetch_signup_list(event)
            }), 200

        return jsonify({"message": "Not authorized to view this list."}), 403

    return jsonify({"message": "Event not found."}), 404


def fetch_signup_list(event):
    entries = signup_List.query.filter_by(event=event.id).all()
    return [
        {
            "id": entry.id,
            "user_id": entry.name,
            "event_id": entry.event,
        }
        for entry in entries
    ]


if __name__ == "__main__":
    with app.app_context():
        database.create_all()

    app.run(debug=True)
