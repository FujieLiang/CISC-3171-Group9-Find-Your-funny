import math

class DistanceService:
    EARTH_RADIUS_KM = 6371

    def haversine(self, lat1, lon1, lat2, lon2):
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dist_lat = lat2 - lat1
        dist_lon = lon2 - lon1
        a = math.sin(dist_lat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dist_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

        return self.EARTH_RADIUS_KM * c
    
