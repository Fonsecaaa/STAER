import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import L from "leaflet";
import "./App.css";
import { airports } from './airportsData';  // Importa os aeroportos
import { radars } from './radarsData';      // Importa os radares
import { Sidebar, ResizeImage, Table } from './rightSidebar.jsx';  // rightSidebar

// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Loader } from './Loader.jsx';
import { getCountryByHex } from './icaoCountry.jsx';

const ResizeButtonComponent = ({ handleMouseDown }) => {
  return (
    <ResizeImage onMouseDown={handleMouseDown}>
      <img src="/toggle-sidebar-width.png" alt="sidebarToggle" />
    </ResizeImage>
  );
};

function App() {
  const [airplanes, setAirplanes] = useState([]);
  const [airplanePaths, setAirplanePaths] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Estado para o loader
  const [sidebarWidth, setSidebarWidth] = useState(300); // Estado para largura do sidebar
  const [selectedAirplane, setSelectedAirplane] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Para controlar a visibilidade da sidebar

  // Função para fechar a sidebar
const closeSidebar = () => {
  setSidebarOpen(false);
};

// Função para abrir a sidebar e definir o avião selecionado
const openSidebar = (airplane) => {
  setSelectedAirplane(airplane);
  setSidebarOpen(true);
};

 // Atualiza os dados do avião selecionado a cada mudança na lista de aviões
  useEffect(() => {
    if (selectedAirplane) {
      const updatedAirplane = airplanes.find(
        (airplane) => airplane.hex === selectedAirplane.hex
      );
      setSelectedAirplane(updatedAirplane || null);
    }
  }, [airplanes]);

  useEffect(() => {
    // Mostra o loader
    const timeout = setTimeout(() => setIsLoading(false), 2000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchAirplanes();
    const interval = setInterval(fetchAirplanes, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAirplanes = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5002/api/aircrafts");
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
      iconUrl: "/radar.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  if (isLoading) {
    // Mostra o loader enquanto o estado isLoading for true
    return <Loader />;
  }

  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX); // Invertendo a lógica
      if (newWidth > 300) {
        setSidebarWidth(newWidth); // Atualiza a largura do sidebar
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Evitar que a imagem se mova ao clicar
    e.preventDefault();
  };

  return (
  <div>
    {/* Left Sidebar */}
    {sidebarOpen && (
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '300px',
        height: '100%',
        backgroundColor: '#313131',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.3)',
        padding: '20px',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        {/* Imagem para fechar a sidebar */}
        <img
          src="/close-settings.png"
          alt="Fechar Sidebar"
          onClick={closeSidebar}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            cursor: 'pointer',
            width: '30px',
            height: '30px',
            filter: 'invert(33%) sepia(69%) saturate(4683%) hue-rotate(24deg) brightness(97%) contrast(91%)' // Filtro para a cor #f1c496
          }}
        />

        {selectedAirplane && (
            <div>
              <p><strong>Callsign:</strong> {selectedAirplane.flight || "N/A"}</p>
              <p><strong>Hex:</strong> {selectedAirplane.hex}</p>
              <p><strong>Altitude:</strong> {selectedAirplane.alt_baro || "N/A"} ft</p>
               <p><strong>Velocidade:</strong> {selectedAirplane.gs || "N/A"} nós</p>

            <h2> SPATIAL </h2>
            <p><strong>Groundspeed:</strong> {selectedAirplane.gs || "N/A"} kt</p>
            <p><strong>Baro. altitude:</strong> {selectedAirplane.alt_baro || "N/A"} ft</p>
            <p><strong>Vert. Rate:</strong> {selectedAirplane.baro_rate || "N/A"} ft/min</p>
            <p><strong>Track:</strong> {selectedAirplane.track || "N/A"}</p>
            <p><strong>Pos.:</strong> {selectedAirplane.lat && selectedAirplane.lon
              ? `Latitude: ${selectedAirplane.lat.toFixed(2)}º, Longitude: ${selectedAirplane.lon.toFixed(2)}º`
              : "N/A"
            } </p>
            <p><strong>Distance:</strong> {selectedAirplane.modea || "N/A"}</p>

            <h2> SIGNAL </h2>
            <p><strong>Source:</strong> {selectedAirplane.modec ? "ADS-B" : "N/A"}</p> {/* Corrected: 'modec' determines if ADS-B is used */}
            <p><strong>RSSI:</strong> {selectedAirplane.rssi || "N/A"} dBFS</p>
            <p><strong>Msg. Rate:</strong> {selectedAirplane.messages || "N/A"}</p> {/* Corrected: 'messages' shows number of messages */}
            <p><strong>Messages:</strong> {selectedAirplane.messages || "N/A"}</p>
            <p><strong>Last Pos.:</strong> {selectedAirplane.seen_pos || "N/A"} s</p> {/* Corrected: 'seen_pos' is the last position update time */}
            <p><strong>Last Seen.:</strong> {selectedAirplane.seen || "N/A"} s</p>

            <h2>FMS SEL</h2>
            <p><strong>Sel. Alt.:</strong> {selectedAirplane.nav_altitude_mcp || "N/A"} ft</p> {/* Corrected: 'nav_altitude_mcp' is selected altitude */}
            <p><strong>Sel. Head.:</strong> {selectedAirplane.mag_heading || "N/A"}</p> {/* Corrected: 'mag_heading' is the selected heading */}

            <h2>WIND</h2>
            <p><strong>Speed:</strong> {selectedAirplane.gs || "N/A"} kt</p> {/* Ground speed, use 'gs' */}
            <p><strong>Direction (from):</strong> {selectedAirplane.track || "N/A"}º</p> {/* Track direction */}
            <p><strong>TAT / OAT:</strong> {selectedAirplane.messages || "N/A"}</p> {/* Not available in provided JSON, replaced with 'messages' for now */}

            <h2>Speed</h2>
            <p><strong>Ground:</strong> {selectedAirplane.gs || "N/A"} kt</p>
            <p><strong>True:</strong> {selectedAirplane.tas || "N/A"} kt</p>
            <p><strong>Indicated:</strong> {selectedAirplane.ias || "N/A"} kt</p>
            <p><strong>Mach:</strong> {selectedAirplane.mach || "N/A"}</p>

            <h2>Altitude</h2>
            <p><strong>Barometric:</strong> {selectedAirplane.alt_baro || "N/A"} ft</p>
            <p><strong>Baro. Rate:</strong> {selectedAirplane.baro_rate || "N/A"} ft/min</p>
            <p><strong>Geom. WGS84:</strong> {selectedAirplane.alt_geom || "N/A"} ft</p> {/* Corrected: 'alt_geom' for geometric altitude */}
            <p><strong>Geom. Rate:</strong> {selectedAirplane.geom_rate || "N/A"} ft/min</p>
            <p><strong>QNH:</strong> {selectedAirplane.nav_qnh || "N/A"} hPa</p>

            <h2>Direction</h2>
            <p><strong>Ground Track:</strong> {selectedAirplane.track || "N/A"}</p>
            <p><strong>True Heading:</strong> {selectedAirplane.true_heading || "N/A"}</p> {/* Corrected: 'true_heading' for true heading */}
            <p><strong>Magnetic Heading:</strong> {selectedAirplane.mag_heading || "N/A"}</p>
            <p><strong>Magnetic Decl.:</strong> {selectedAirplane.mag_declination || "N/A"}</p> {/* Corrected: 'mag_declination' for magnetic declination */}
            <p><strong>Track Rate:</strong> {selectedAirplane.track_rate || "N/A"}</p>
            <p><strong>Roll:</strong> {selectedAirplane.roll || "N/A"}</p>

            <h2>Stuff</h2>
            <p><strong>Nav. Modes:</strong> {selectedAirplane.modec ? "ADS-B" : "N/A"}</p>
            <p><strong>ADS-B Ver.:</strong> {selectedAirplane.version || "N/A"}</p>
            <p><strong>Category:</strong> {selectedAirplane.category || "N/A"}</p>

            <h2>Accuracy</h2>
            <p><strong>NACP:</strong> {selectedAirplane.nac_p || "N/A"}</p>
            <p><strong>SIL:</strong> {selectedAirplane.sil || "N/A"}</p>
            <p><strong>NACV:</strong> {selectedAirplane.nac_v || "N/A"}</p> {/* Corrected: 'nac_v' for navigation accuracy velocity */}
            <p><strong>NICBARO:</strong> {selectedAirplane.nic_baro || "N/A"}</p> {/* Corrected: 'nic_baro' for barometric navigation integrity */}
            <p><strong>RC:</strong> {selectedAirplane.rc || "N/A"}</p> {/* Corrected: 'rc' for reliability coefficient */}

              <p>Learn more about Mode S data type by hovering over each data label. </p>




            </div>
        )}
      </div>
    )}

    {/* Sidebar com informações da tabela */}
    <Sidebar width={sidebarWidth}>
      <ResizeButtonComponent handleMouseDown={handleMouseDown} />

      <h2>Informações dos Aviões</h2>
      <Table>
        <thead>
          <tr>
            <th></th>
            <th>Callsign</th>
            <th>Alt.(ft)</th>
            <th>Spd.(kt)</th>
            <th>Coordenadas</th>
          </tr>
        </thead>
        <tbody>
          {airplanes.map((airplane) => {
            const { country, flag } = getCountryByHex(airplane.hex);
            return (
              <tr key={airplane.hex} onClick={() => openSidebar(airplane)}>
                <td>
                  {flag ? <img src={flag} alt={country} style={{ width: "20px", height: "15px" }} /> : "N/A"}
                </td>
                <td>{airplane.flight || "N/A"}</td>
                <td>{airplane.alt_baro || "N/A"}</td>
                <td>{airplane.gs || "N/A"}</td>
                <td>
                  {airplane.lat && airplane.lon
                    ? `Latitude: ${airplane.lat.toFixed(2)}º, Longitude: ${airplane.lon.toFixed(2)}º`
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Sidebar>

    <MapContainer
      center={[40, -5]}
      zoom={6}
      style={{ height: "100vh", width: "100vw" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
        fillColor="transparent"
        fillOpacity={0}
      />
      <Circle
        center={[41.171060, -8.616363]}
        radius={150 * 1852} // 150 nmi em metros
        color="black"
        weight={2}
        opacity={0.3}
        fillColor="transparent"
        fillOpacity={0}
      />
      <Circle
        center={[41.171060, -8.616363]}
        radius={200 * 1852} // 200 nmi em metros
        color="black"
        weight={2}
        opacity={0.3}
        fillColor="transparent"
        fillOpacity={0}
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
                  <strong>{airport.name}</strong><br/>
                  <strong>ICAO:</strong> {airport.icao} <br/>
                  <strong>IATA:</strong> {airport.iata} <br/>
                  <strong>Tipo:</strong> {airport.type === "airport" ? "Aeroporto" : airport.type === "aerodrome" ? "Aeródromo" : "Base Militar"}
                </Popup>
              </Marker>
          ))}

      {/* Adicionando aviões no mapa */}
      {airplanes.map((airplane) => (
        airplane.lat && airplane.lon && (
          <Marker
            key={airplane.hex}
            position={[airplane.lat, airplane.lon]}
            icon={airplaneIcon(airplane.alt_baro)}
            rotationAngle={airplane.track || 0}
            rotationOrigin="center"
            eventHandlers={{
              click: () => openSidebar(airplane), // Ao clicar no avião, abre a leftSidebar
            }}
          >
            <Popup>
              <strong>Voo:</strong> {airplane.flight || "N/A"}<br />
              <strong>Hex:</strong> {airplane.hex}<br />
              <strong>Altitude:</strong> {airplane.alt_baro || "N/A"} ft<br />
              <strong>Velocidade:</strong> {airplane.gs || "N/A"} nós<br />
              <strong>RSSI:</strong> {airplane.rssi || "N/A"} dBFS<br />
            </Popup>
          </Marker>
        )
      ))}

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
