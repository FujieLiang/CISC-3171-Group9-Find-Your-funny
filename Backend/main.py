from flask import request, jsonify, session,redirect,url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user,current_user, login_required, logout_user
from config import app, database
from models import *
from Location.routes import location_bp
from Location.geocoder import Geocoder

geocoder = Geocoder(api_key= "69cc5ed34ef27252477349axzad0499")


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
    
    newUser = User(username = username,firstName=firstName, lastName=lastName, email=email, passwordHash=hashedPassword,streetAddress=streetAddress,city=city,state=state,country=country,zipCode=zipCode,latitude=lat,longitude=lon)
    try:
        database.session.add(newUser)
        database.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New user created"}), 201

@app.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({"User": user.to_json()}), 200
    else:
        return jsonify({"message": "User not found."}), 404

@app.route("/user/<int:user_id>/update", methods=["PUT"])
@login_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    if user.id != current_user.id:
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

    return jsonify({"message": "User updated successfully."}), 200

# Login Behavior 

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get("username")
    password = request.json.get("password") 

    user = User.query.filter_by(username=username).first()   

    if user and user.password == password:
        login_user(user)
        return {"message": "Successful login!"}, 200
    
    return {"message": "Invalid user information."}, 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.clear()
    return redirect(url_for('login'))

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
@login_required
def create_event():
    user_account_id = current_user.id
    
    event_name = request.json.get("eventName")
    description = request.json.get("description")
    category_value = request.json.get("category")
    street_address = request.json.get("streetAddress")
    city = request.json.get("city")
    state = request.json.get("state")
    country = request.json.get("country")
    zip_code = request.json.get("zipCode")
    organizer = user_account_id
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
    
    return jsonify({"message": "New event created!"}), 201

@app.route("/events/<int:event_id>", methods= ["GET"])
def get_event_by_id(event_id):
    event = Events.query.get(event_id)
    if event:
        return jsonify({"Event": event.to_json()}), 200
    else:
        return jsonify({"message": "Event not found."}), 404
    
@app.route("/events/<int:event_id>", methods= ["DELETE"])
@login_required
def delete_event(event_id):
    event = Events.query.get(event_id)
    if event:
        if event.organizer == current_user.id:
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
@login_required
def update_event(event_id):
    event = Events.query.get(event_id)
    if event:
        if event.organizer == current_user.id:
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
                return jsonify({"message": "Event updated successfully."}), 200
            except Exception as e:
                return jsonify({"message": str(e)}), 400
        else:
            return jsonify({"message": "Unauthorized to update this event."}), 403
    else:
        return jsonify({"message": "Event not found."}), 404
    
@app.route("/events/<int:event_id>/register")
@login_required
def event_signup(event_id):
    event = Events.query.get(event_id)
    if event:
        user_account_id = current_user.id

        if not user_account_id:
            return jsonify({"message":"Incorrect user value. Please resubmit."}), 400
        
        new_entry = Event_Signup_List(comic_name = user_account_id, event= event_id)

        try:
            database.session.add(new_entry)
            database.session.commit()
        except Exception as e:
            return jsonify({"message": str(e)})
        
        return jsonify({"message": "Entry submitted successfully."}), 200

if __name__ == "__main__":
    with app.app_context():
        database.create_all()

    app.run(debug=True)
