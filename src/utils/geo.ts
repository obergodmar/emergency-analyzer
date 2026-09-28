const earthRadiusKm = 6371;
const radians = (degrees: number) => (degrees * Math.PI) / 180;
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const a =
    Math.sin(radians(lat2 - lat1) / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(Math.min(1, a)));
}
export function circleCoordinates(
  latitude: number,
  longitude: number,
  radiusKm: number,
): [number, number][] {
  const lat = radians(latitude),
    lon = radians(longitude),
    distance = radiusKm / earthRadiusKm;
  return Array.from({ length: 97 }, (_, i) => {
    const bearing = (2 * Math.PI * i) / 96;
    const targetLat = Math.asin(
      Math.sin(lat) * Math.cos(distance) + Math.cos(lat) * Math.sin(distance) * Math.cos(bearing),
    );
    const targetLon =
      lon +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distance) * Math.cos(lat),
        Math.cos(distance) - Math.sin(lat) * Math.sin(targetLat),
      );
    return [(targetLon * 180) / Math.PI, (targetLat * 180) / Math.PI];
  });
}
