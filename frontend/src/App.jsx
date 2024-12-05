import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import L from "leaflet";
import "./App.css";

function App() {
  const [airplanes, setAirplanes] = useState([]);
  const [airplanePaths, setAirplanePaths] = useState({});

  // Lista de coordenadas de aeroportos, aeródromos, bases militares
  const airports = [
    { name: "Aeroporto de Lisboa", icao: "LPPT", iata: "LIS", type: "airport", lat: 38.7742, lon: -9.1349 },//certo
    { name: "Aeroporto do Porto", icao: "LPPR", iata: "OPO", type: "airport", lat: 41.2483, lon: -8.6815 },//certo
      { name: "Aeroporto de Faro", icao: "LPFR", iata: "FAO", type: "airport", lat: 37.0145, lon: -7.9655 },//certo
    { name: "Aeródromo de Cascais", icao: "LPCS", iata: "CAT", type: "aerodrome", lat: 38.72541, lon: -9.35537 },//corrigido
    { name: "Base Aérea de Monte Real (Nº5)", icao: "LPMR", iata: "LPMR", type: "military", lat: 39.82915, lon: -8.88871 }, //corrigido
    { name: "Base Aérea de Beja (Nº11)", icao: "LPBJ", iata: "BYJ", type: "military", lat: 38.07985, lon: -7.92715 },//corrigido
    { name: "Aeródromo Civil de Beja", icao: "", iata: "BEJ", type: "aerodrome", lat: 38.06082, lon: -7.87784 },//POR CONFIRMAR IATA ICAO
    { name: "Complexo Militar de Alverca", icao: "LPAR", iata: "❌", type: "military", lat: 38.88375, lon: -9.02973 },//corrigido
    { name: "Centro de Formação Militar e Técnica da Força Aérea", icao: "LPOA", iata: "OTA", type: "military", lat: 39.09095, lon: -8.96270 },//corrigido
    { name: "Aeródromo de Braga", icao: "LPBR", iata: "BGX", type: "aerodrome", lat: 41.58711, lon: -8.44492 },//corrigido
    { name: "Aeródromo de Évora", icao: "LPEV", iata: "EVR", type: "aerodrome", lat: 38.53251, lon: -7.88971 },//corrigido
    { name: "Aeródromo de Viseu", icao: "LPVZ", iata: "VSE", type: "aerodrome", lat: 40.72589, lon: -7.88906 },//corrigido
    { name: "Base Aérea de Sintra (Nº1)", icao: "LPSI", iata: "SNR", type: "military", lat: 38.83282, lon: -9.33877 },//corrigido
    { name: "Base Aérea de Montijo (Nº6)", icao: "LPMT", iata: "MTJ", type: "military", lat: 38.70851, lon: -9.02587 },//corrigido
    { name: "Base Aérea de Lisboa", icao: "LPMM", iata: "LIS", type: "military", lat: 38.7689, lon: -9.0917 },//
    { name: "Aeródromo de Portimão", icao: "LPPM", iata: "PRM", type: "aerodrome", lat: 37.14924, lon: -8.58393 },//corrigido
    { name: "Aeródromo de Lagos", icao: "LPLG", iata: "❌", type: "aerodrome", lat: 37.12176, lon: -8.67881 },//corrigido
    { name: "Aeródromo da Maia", icao: "LPVL", iata: "❌", type: "aerodrome", lat: 41.27892, lon: -8.51704 },//corrigido
  ];

  // Adicionar localizações de radares em Portugal
  const radars = [
    { name: "Radar de A1", lat: 38.7550, lon: -9.2333 },
    { name: "Radar de A2", lat: 38.6000, lon: -8.0000 },
    { name: "Radar de A3", lat: 41.2000, lon: -8.0000 },
    { name: "Radar de A4", lat: 40.8000, lon: -7.5000 },
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

  const airplaneIcon = () => {
  return L.icon({
    iconUrl: "/airplane-icon.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
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

        {/* aeroportos */}
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

        {/* aviões VER ISTO MELHOR POR CAUSA DAS LINHAS E DOS ICONES TORTOS QUANDO TEM LINHA */}
        {airplanes
          .map(
            (airplane) =>
              airplane.lat &&
              airplane.lon && (
                <Marker
                  key={airplane.hex}
                  position={[airplane.lat, airplane.lon]}
                  icon={airplaneIcon(airplane.alt_baro)}
                  rotationAngle={airplane.track || 0} //rotação do avião
                  rotationOrigin="center"
                >
                  <Popup>
                    <strong>Voo:</strong> {airplane.flight || "N/A"}
                    <br/>
                    <strong>Hex:</strong> {airplane.hex}
                    <br/>
                    <strong>Altitude:</strong> {airplane.alt_baro || "N/A"} ft
                    <br/>
                    <strong>Velocidade:</strong> {airplane.gs || "N/A"} nós
                    <br/>
                    <strong>RSSI:</strong> {airplane.rssi || "N/A"} dBFS
                    <br/>

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
