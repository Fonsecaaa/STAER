from config import db
from datetime import datetime

class Aircraft(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hex = db.Column(db.String(6), nullable=False)  # Código hexadecimal único
    flight = db.Column(db.String(10), nullable=True)  # Código de voo
    alt_baro = db.Column(db.String, nullable=True)  # Altitude barométrica
    alt_geom = db.Column(db.Float, nullable=True)  # Altitude geométrica
    gs = db.Column(db.Float, nullable=True)  # Ground Speed (Velocidade de solo)
    ias = db.Column(db.Float, nullable=True)  # Indicated Airspeed (Velocidade indicada)
    tas = db.Column(db.Float, nullable=True)  # True Airspeed (Velocidade verdadeira)
    mach = db.Column(db.Float, nullable=True)  # Mach number
    track = db.Column(db.Float, nullable=True)  # Rumo (heading)
    track_rate = db.Column(db.Float, nullable=True) # Taxa de variação do rumo (track rate)
    roll = db.Column(db.Float, nullable=True)  # Ângulo de inclinação
    mag_heading = db.Column(db.Float, nullable=True) # Rumo magnético
    baro_rate = db.Column(db.Float, nullable=True) # Taxa de variação da altitude barométrica
    geom_rate = db.Column(db.Float, nullable=True) # Taxa de variação da altitude geométrica
    squawk = db.Column(db.String(10), nullable=True) # Squawk code
    emergency = db.Column(db.String(15), nullable=True) # Código de emergência (se aplicável)
    category = db.Column(db.String(10), nullable=True) # Categoria de aeronave
    nav_qnh = db.Column(db.Float, nullable=True) # QNH de navegação (pressão local no nível do mar)
    nav_altitude_mcp = db.Column(db.Float, nullable=True)
    lat = db.Column(db.Float, nullable=True)  # Latitude
    lon = db.Column(db.Float, nullable=True)  # Longitude
    nic = db.Column(db.Float, nullable=True) # "Navigation Integrity Category" (categoria de integridade da navegação)
    rc = db.Column(db.Float, nullable=True) # "Reception Class" (classe de recepção)
    seen_pos = db.Column(db.Float, nullable=True)  # Tempo desde a última posição
    version =db.Column(db.Float, nullable=True)  # Versão do sistema
    nic_baro = db.Column(db.Float, nullable=True) # Categoria de integridade da navegação com base em altitude barométrica
    nac_p = db.Column(db.Float, nullable=True) # "Navigation Accuracy Category Position" (precisão da posição de navegação)
    nav_v = db.Column(db.Float, nullable=True) # Velocidade de navegação
    sil = db.Column(db.Float, nullable=True) # "Surveillance Integrity Level" (nível de integridade de vigilância)
    sil_type = db.Column(db.String(15), nullable=True) # Tipo de nível de integridade de vigilância (ex: "unknown", "perhour")
    gva = db.Column(db.Float, nullable=True) # "Ground Velocity Accuracy" (precisão da velocidade no solo)
    sda = db.Column(db.Float, nullable=True) # "Surveillance Data Age" (idade dos dados de vigilância)
    modea = db.Column(db.String(15), nullable=True) # Modo A do transponder (se aplicável)
    modec = db.Column(db.String(15), nullable=True) # Modo C do transponder (se aplicável)
    #faltam alguns aqui
    messages = db.Column(db.Integer, nullable=True)  # Contagem de mensagens
    seen = db.Column(db.Float, nullable=True)  # Tempo desde a última atualização
    rssi = db.Column(db.Float, nullable=True)  # Intensidade do sinal

    def to_json(self):
        return {
                "id": self.id,
                "hex": self.hex,
                "flight": self.flight,
                "alt_baro": self.alt_baro,
                "alt_geom": self.alt_geom,
                "gs": self.gs,
                "ias": self.ias,
                "tas": self.tas,
                "mach": self.mach,
                "track": self.track,
                "track_rate": self.track_rate,
                "roll": self.roll,
                "mag_heading": self.mag_heading,
                "baro_rate": self.baro_rate,
                "geom_rate": self.geom_rate,
                "squawk": self.squawk,
                "emergency": self.emergency,
                "category": self.category,
                "nav_qnh": self.nav_qnh,
                "nav_altitude_mcp": self.nav_altitude_mcp,
                "lat": self.lat,
                "lon": self.lon,
                "nic": self.nic,
                "rc": self.rc,
                "seen_pos": self.seen_pos,
                "version": self.version,
                "nic_baro": self.nic_baro,
                "nac_p": self.nac_p,
                "nav_v": self.nav_v,
                "sil": self.sil,
                "sil_type": self.sil_type,
                "gva": self.gva,
                "sda": self.sda,
                "modea": self.modea,
                "modec": self.modec,
                "messages": self.messages,
                "seen": self.seen,
                "rssi": self.rssi,
            }