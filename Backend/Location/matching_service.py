class MatchingService:
    def __init__(self,distance_service):
        self.distance_service = distance_service

    def find_nearby_events(self, user_lat, user_lon, events, radius_km = 10):
        matches =[]

        for event in events:
            distance = self.distance_service.haversine(user_lat,user_lon,event["lat"],event["lon"])

            if distance <= radius_km:
                matches.append({
                    "event_id": event["id"],
                    "distance_km": distance
                })
        
        return sorted(matches, key=lambda x: x["distance_km"])
