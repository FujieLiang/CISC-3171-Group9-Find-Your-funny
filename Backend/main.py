from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, login_user,current_user, login_required
from config import app, database
from models import *

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

    hashedPassword = generate_password_hash(password,method='scrypt')

    if not username or not firstName or not lastName or not email or not hashedPassword or not streetAddress or not city or not state or not country or not zipCode:
        return(jsonify({"message":"Incorrect value in submission. Please resubmit."}), 400)
    
    newUser = User(username = username,firstName=firstName, lastName=lastName, email=email, passwordHash=hashedPassword,streetAddress=streetAddress,city=city,state=state,country=country,zipCode=zipCode)
    try:
        database.session.add(newUser)
        database.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New user created"}), 201

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
    zip_code = request.json.get("zipCode")
    organizer = user_account_id
    start_time = request.json.get("startTime")
    end_time = request.json.get("endTime")

    if not event_name or not description or not category_value or not street_address or not city or not state or not zip_code or not organizer or not start_time or not end_time:
        return jsonify({"message":"Incorrect value in submission. Please resubmit."}), 400
    
    new_event = Events(name= event_name, description= description, category= category_value,streetAddress= street_address, city= city, state= state, zipCode= zip_code,organizer=organizer, startTime= start_time,endTime = end_time)

    try:
        database.session.add(new_event)
        database.session.commit()

    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New event created!"}), 201



if __name__ == "__main__":
    with app.app_context():
        database.create_all()

    app.run(debug=True)

