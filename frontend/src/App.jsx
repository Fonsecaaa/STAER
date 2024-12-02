import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet"; // Importando o Circle do Leaflet
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import L from "leaflet";
import "./App.css";

function App() {
  const [airplanes, setAirplanes] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [airplanePaths, setAirplanePaths] = useState({});

  // Lista de coordenadas de aeroportos, aeródromos, bases militares
  const airports = [
    { name: "Aeroporto de Lisboa", icao: "LPPT", iata: "LIS", type: "airport", lat: 38.7742, lon: -9.1349 },
    { name: "Aeroporto do Porto", icao: "LPPR", iata: "OPO", type: "airport", lat: 41.2483, lon: -8.6815 },
      { name: "Aeroporto de Faro", icao: "LPFR", iata: "FAO", type: "airport", lat: 37.0145, lon: -7.9655 },
    { name: "Aeródromo de Cascais", icao: "LPCS", iata: "CAT", type: "aerodrome", lat: 38.7333, lon: -9.4167 },
    { name: "Base Aérea de Monte Real", icao: "LPMR", iata: "LPMR", type: "military", lat: 39.9500, lon: -8.6667 },
    { name: "Aeródromo de Tires", icao: "LPTS", iata: "TIR", type: "aerodrome", lat: 38.7250, lon: -9.2900 },
    { name: "Base Aérea de Beja", icao: "LPBJ", iata: "BEJ", type: "military", lat: 38.0167, lon: -7.8650 },
    { name: "Aeroporto de Ponta Delgada (Açores)", icao: "LPPS", iata: "PDL", type: "airport", lat: 37.7416, lon: -25.6756 },
    { name: "Aeroporto de Madeira", icao: "LPMA", iata: "FNC", type: "airport", lat: 32.6974, lon: -16.7749 },
    { name: "Aeroporto de Terceira", icao: "LPLA", iata: "TER", type: "airport", lat: 38.7333, lon: -27.2206 },
    { name: "Aeroporto de Horta (Açores)", icao: "LPHR", iata: "HOR", type: "airport", lat: 38.5167, lon: -28.7028 },
    { name: "Aeroporto de Santa Maria (Açores)", icao: "LPSM", iata: "SMA", type: "airport", lat: 36.9701, lon: -25.1705 },
    { name: "Aeródromo de Alverca", icao: "LPAR", iata: "ALV", type: "aerodrome", lat: 38.9441, lon: -9.0844 },
    { name: "Aeródromo de Ota", icao: "LPOA", iata: "OTA", type: "aerodrome", lat: 39.0833, lon: -8.9833 },
    { name: "Aeródromo de Braga", icao: "LPBR", iata: "BGX", type: "aerodrome", lat: 41.5542, lon: -8.4150 },
    { name: "Aeródromo de Évora", icao: "LPEV", iata: "EVR", type: "aerodrome", lat: 38.5708, lon: -7.9186 },
    { name: "Aeródromo de Viseu", icao: "LPVZ", iata: "VSE", type: "aerodrome", lat: 40.6667, lon: -7.9167 },
    { name: "Base Aérea de Sintra", icao: "LPSI", iata: "SNR", type: "military", lat: 38.8000, lon: -9.3833 },
    { name: "Base Aérea de Montijo", icao: "LPMT", iata: "MTJ", type: "military", lat: 38.6944, lon: -8.9156 },
    { name: "Base Aérea de Lisboa", icao: "LPMM", iata: "LIS", type: "military", lat: 38.7689, lon: -9.0917 },
    { name: "Base Aérea de Figo Maduro", icao: "LPFM", iata: "FMO", type: "military", lat: 38.7850, lon: -9.2350 },
    // Adicione outros aeroportos aqui
  ];

  // Adicionar localizações de radares em Portugal
  const radars = [
    { name: "Radar de A1", lat: 38.7550, lon: -9.2333 },
    { name: "Radar de A2", lat: 38.6000, lon: -8.0000 },
    { name: "Radar de A3", lat: 41.2000, lon: -8.0000 },
    { name: "Radar de A4", lat: 40.8000, lon: -7.5000 },
    // Adicione outros radares aqui
  ];

  useEffect(() => {
    fetchAirplanes();
    const interval = setInterval(fetchAirplanes, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAirplanes = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/aircrafts");
      const data = await response.json();
      setAirplanes(data.airplanes);
      updateAirplanePaths(data.airplanes);
    } catch (error) {
      console.error("Erro ao buscar aviões:", error);
    }
  };

  const updateAirplanePaths = (airplanes) => {
    const paths = { ...airplanePaths };
    airplanes.forEach((airplane) => {
      if (airplane.lat && airplane.lon) {
        const hex = airplane.hex;
        if (!paths[hex]) {
          paths[hex] = [];
        }
        paths[hex].push([airplane.lat, airplane.lon]);
      }
    });
    setAirplanePaths(paths);
  };

  const airplaneIcon = (altitude) => {
    let color = "gray";
    if (altitude < 5000) color = "green";
    else if (altitude < 25000) color = "blue";
    else color = "red";

    return L.icon({
      iconUrl: "/airplane-icon.png",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      className: `airplane-icon ${color}`,
    });
  };

  const airportIcon = (type) => {
    let iconUrl;
    if (type === "airport") iconUrl = "/torre-de-aviao-e-aeroporto.png"; // Ícone para Aeroportos
    else if (type === "aerodrome") iconUrl = "/aerodromo.png"; // Ícone para Aeródromos
    else if (type === "military") iconUrl = "/base.png"; // Ícone para Bases Militares

    return L.icon({
      iconUrl: iconUrl,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const radarIcon = () => {
    return L.icon({
      iconUrl: "/radar.png", // Substitua com o caminho do ícone de radar
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  return (
    <div>
      <h1>STAER</h1>

      <select
        onChange={(e) => setFilterStatus(e.target.value)}
        value={filterStatus}
      >
        <option value="">Todos os Status</option>
        <option value="emergency">Emergência</option>
        <option value="normal">Normal</option>
      </select>

      <MapContainer
        center={[40, 0]}
        zoom={5}
        style={{ height: "100vh", width: "100vw" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Adicionando a antena com popup */}
        <Marker
          key="Antena Rua Nove de Abril"
          position={[41.171060, -8.616363]}
          icon={L.icon({
            iconUrl: "/signal-tower.png", // ícone da antena
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
          })}
        >
          <Popup>
            <strong>Antena</strong>
          </Popup>
        </Marker>

        {/* Circulos de 100, 150 e 200 nmi ao redor da antena */}
        <Circle
          center={[41.171060, -8.616363]}
          radius={100 * 1852} // 100 nmi em metros
          color="black"
          weight={2}
          opacity={0.3}
          fillColor="transparent" // Preenchimento transparente
          fillOpacity={0} // Preenchimento transparente
        />
        <Circle
          center={[41.171060, -8.616363]}
          radius={150 * 1852} // 150 nmi em metros
          color="black"
          weight={2}
          opacity={0.3}
          fillColor="transparent" // Preenchimento transparente
          fillOpacity={0} // Preenchimento transparente
        />
        <Circle
          center={[41.171060, -8.616363]}
          radius={200 * 1852} // 200 nmi em metros
          color="black"
          weight={2}
          opacity={0.3}
          fillColor="transparent" // Preenchimento transparente
          fillOpacity={0} // Preenchimento transparente
        />

        {/* Adicionando localizações de radares */}
        {radars.map((radar) => (
          <Marker
            key={radar.name}
            position={[radar.lat, radar.lon]}
            icon={radarIcon()}
          >
            <Popup>
              <strong>{radar.name}</strong><br />
              Localização de Radar
            </Popup>
          </Marker>
        ))}

        {/* Adicionando aeroportos */}
        {airports.map((airport) => (
          <Marker
            key={airport.name}
            position={[airport.lat, airport.lon]}
            icon={airportIcon(airport.type)}
          >
            <Popup>
              <strong>{airport.name}</strong><br />
              <strong>ICAO:</strong> {airport.icao} <br />
              <strong>IATA:</strong> {airport.iata} <br />
              <strong>Tipo:</strong> {airport.type === "airport" ? "Aeroporto" : airport.type === "aerodrome" ? "Aeródromo" : "Base Militar"}
            </Popup>
          </Marker>
        ))}

        {/* Adicionando aviões */}
        {airplanes
          .filter((airplane) => {
            if (filterStatus === "emergency") {
              return airplane.emergency === "emergency";
            } else if (filterStatus === "normal") {
              return !airplane.emergency || airplane.emergency === "normal";
            }
            return true;
          })
          .map(
            (airplane) =>
              airplane.lat &&
              airplane.lon && (
                <Marker
                  key={airplane.hex}
                  position={[airplane.lat, airplane.lon]}
                  icon={airplaneIcon(airplane.alt_baro)}
                  rotationAngle={airplane.track || 0} // Aplica a rotação do avião
                  rotationOrigin="center"
                >
                  <Popup>
                    <strong>Voo:</strong> {airplane.flight || "N/A"}
                    <br />
                    <strong>Hex:</strong> {airplane.hex}
                    <br />
                    <strong>Altitude:</strong> {airplane.alt_baro || "N/A"} ft
                    <br />
                    <strong>Velocidade:</strong> {airplane.gs || "N/A"} nós
                    <br />
                    <strong>Status:</strong>{" "}
                    {airplane.emergency ? "Emergência" : "Normal"}
                  </Popup>
                </Marker>
              )
          )}

        {Object.keys(airplanePaths).map((hex) => (
          <Polyline
            key={hex}
            positions={airplanePaths[hex]}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
