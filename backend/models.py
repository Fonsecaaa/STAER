from config import db
from datetime import datetime

class Aircraft(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hex_code = db.Column(db.String(6), nullable=False)  # Código hexadecimal único
    flight = db.Column(db.String(10), nullable=True)  # Código de voo
    alt_baro = db.Column(db.Float, nullable=True)  # Altitude barométrica
    alt_geom = db.Column(db.Float, nullable=True)  # Altitude geométrica
    gs = db.Column(db.Float, nullable=True)  # Ground Speed (Velocidade de solo)
    ias = db.Column(db.Float, nullable=True)  # Indicated Airspeed (Velocidade indicada)
    tas = db.Column(db.Float, nullable=True)  # True Airspeed (Velocidade verdadeira)
    mach = db.Column(db.Float, nullable=True)  # Mach number
    track = db.Column(db.Float, nullable=True)  # Rumo (heading)
    roll = db.Column(db.Float, nullable=True)  # Ângulo de inclinação
    lat = db.Column(db.Float, nullable=True)  # Latitude
    lon = db.Column(db.Float, nullable=True)  # Longitude
    squawk = db.Column(db.String(4), nullable=True)  # Squawk code
    category = db.Column(db.String(2), nullable=True)  # Categoria de aeronave
    emergency = db.Column(db.String(10), nullable=True)  # Estado de emergência
    messages = db.Column(db.Integer, nullable=True)  # Contagem de mensagens
    seen = db.Column(db.Float, nullable=True)  # Tempo desde a última atualização
    rssi = db.Column(db.Float, nullable=True)  # Intensidade do sinal
    seen_pos = db.Column(db.Float, nullable=True)  # Tempo desde a última posição

    def to_json(self):
        return {
            "id": self.id,
            "hex": self.hex_code,
            "flight": self.flight,
            "alt_baro": self.alt_baro,
            "alt_geom": self.alt_geom,
            "gs": self.gs,
            "ias": self.ias,
            "tas": self.tas,
            "mach": self.mach,
            "track": self.track,
            "roll": self.roll,
            "lat": self.lat,
            "lon": self.lon,
            "squawk": self.squawk,
            "category": self.category,
            "emergency": self.emergency,
            "messages": self.messages,
            "seen": self.seen,
            "rssi": self.rssi,
            "seen_pos": self.seen_pos,  # Incluindo o campo seen_pos
        }