from config import database
from datetime import datetime
from flask_login import UserMixin
import enum

HUMOR_CATEGORIES = [
    "aggressive", "alternative", "anecdotal", "anti_humor", "dark", "blue",
    "character", "cringe", "improv", "insult", "musical", "observational",
    "one_liner", "physical", "prank", "prop", "screwball", "shock", "sketch",
    "surreal", "topical", "ventriloquism", "wit",
]


class user_roles(enum.IntEnum):
    STANDARD_USER = 1
    COMIC = 2

follows = database.Table(
    'follows',
    database.Column('follower_id', database.Integer, database.ForeignKey('users.id')),
    database.Column('following_id', database.Integer, database.ForeignKey('users.id'))
)
class UserHumorProfile(database.Model):
    __tablename__ = 'user_humor_profile'
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), primary_key=True)
    quiz_vector = database.Column(database.JSON, nullable=False)   # seed from swipes (or default 5s)
    final_vector = database.Column(database.JSON, nullable=False)  # adjusted by follows
    skipped_onboarding = database.Column(database.Boolean, default=False, nullable=False)


class User(database.Model):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    role = database.Column(database.Enum(user_roles), nullable= False)
    username = database.Column(database.String(50),nullable = False,unique = True)
    passwordHash = database.Column(database.String(256), nullable = False)
    firstName = database.Column(database.String(50), nullable = False)
    lastName = database.Column(database.String(50), nullable = False)
    email = database.Column(database.String(50), unique = True, nullable = False)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)
    following = database.relationship(
        'User',
        secondary = follows,
        primaryjoin = id == follows.c.follower_id,
        secondaryjoin = id == follows.c.following_id,
        backref = 'followers'
    )

    def to_json(self):
        return{
            "username": self.username,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude
        }

class Comedian(database.Model):
    __tablename__ = 'comedians'

    id = database.Column(database.Integer, primary_key = True)
    name = database.Column(database.String(120), nullable = False)

    aggressive = database.Column(database.Integer, nullable = False)	
    alternative	= database.Column(database.Integer, nullable = False)
    anecdotal = database.Column(database.Integer, nullable = False)	
    anti_humor	= database.Column(database.Integer, nullable = False)
    dark = database.Column(database.Integer, nullable = False)
    blue = database.Column(database.Integer, nullable = False)
    character = database.Column(database.Integer, nullable = False)
    cringe = database.Column(database.Integer, nullable = False)
    improv = database.Column(database.Integer, nullable = False)
    insult = database.Column(database.Integer, nullable = False)
    musical	= database.Column(database.Integer, nullable = False)
    observational = database.Column(database.Integer, nullable = False)
    one_liner = database.Column(database.Integer, nullable = False)	
    physical = database.Column(database.Integer, nullable = False)	
    prank = database.Column(database.Integer, nullable = False)
    prop = database.Column(database.Integer, nullable = False)	
    screwball = database.Column(database.Integer, nullable = False)
    shock = database.Column(database.Integer, nullable = False)
    sketch = database.Column(database.Integer, nullable = False)
    surreal = database.Column(database.Integer, nullable = False)
    topical	= database.Column(database.Integer, nullable = False)
    ventriloquism = database.Column(database.Integer, nullable = False)
    wit = database.Column(database.Integer, nullable = False)



class Venue(database.Model):
    __tablename__ = 'venues'
    id = database.Column(database.Integer, primary_key=True)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)

    def to_json(self):
        return{
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude
        }

class EventRole(enum.IntEnum):
    STANDUP_SHOW = 1
    IMPROV_SHOW = 2
    OPEN_MIC = 3

class Events(database.Model):
    __tablename__ = 'events'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(50), nullable = False)
    description = database.Column(database.String(50), nullable = False)
    category = database.Column(database.Enum(EventRole), nullable = False)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)
    organizer = database.Column(database.Integer, database.ForeignKey('users.id'), nullable = False)
    startTime = database.Column(database.String(40), nullable = False)
    endTime = database.Column(database.String(40), nullable = False)
    createdAt = database.Column(database.DateTime, default=datetime.utcnow)
    signupList = database.relationship('signup_List', backref='signups', lazy='dynamic')

    def to_json(self):
        return{
            "name": self.name,
            "description": self.description,
            "category": self.category.name if self.category else None,
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "organizer": self.organizer,
            "startTime": self.startTime,
            "endTime": self.endTime
        }

class signup_List(database.Model):
    __tablename__ = 'signup_list'
    id = database.Column(database.Integer, primary_key= True)
    name = database.Column(database.Integer, database.ForeignKey('users.id'), nullable = False)
    event = database.Column(database.Integer, database.ForeignKey('events.id'), nullable = False)
        backref = 'followers'
    )

    def to_json(self):
        return{
            "username": self.username,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude
        }

class Venue(database.Model):
    __tablename__ = 'venues'
    id = database.Column(database.Integer, primary_key=True)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)

    def to_json(self):
        return{
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude
        }

class EventRole(enum.IntEnum):
    STANDUP_SHOW = 1
    IMPROV_SHOW = 2
    OPEN_MIC = 3

class Events(database.Model):
    __tablename__ = 'events'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String(50), nullable = False)
    description = database.Column(database.String(50), nullable = False)
    category = database.Column(database.Enum(EventRole), nullable = False)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)
    organizer = database.Column(database.Integer, database.ForeignKey('users.id'), nullable = False)
    startTime = database.Column(database.String(40), nullable = False)
    endTime = database.Column(database.String(40), nullable = False)
    createdAt = database.Column(database.DateTime, default=datetime.utcnow)
    signupList = database.relationship('signup_List', backref='signups', lazy='dynamic')

    def to_json(self):
        return{
            "name": self.name,
            "description": self.description,
            "category": self.category.name if self.category else None,
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "organizer": self.organizer,
            "startTime": self.startTime,
            "endTime": self.endTime
        }

class signup_List(database.Model):
    __tablename__ = 'signup_list'
    id = database.Column(database.Integer, primary_key= True)
    name = database.Column(database.Integer, database.ForeignKey('users.id'), nullable = False)
    event = database.Column(database.Integer, database.ForeignKey('events.id'), nullable = False)
