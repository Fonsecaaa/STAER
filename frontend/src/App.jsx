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

function App() {
  const [airplanes, setAirplanes] = useState([]);
  const [airplanePaths, setAirplanePaths] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Estado para o loader
  const [sidebarWidth, setSidebarWidth] = useState(300); // Estado para largura do sidebar
  const [selectedAirplane, setSelectedAirplane] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Para controlar a visibilidade da sidebar


  const ResizeButtonComponent = ({ handleMouseDown }) => {
  return (
    <ResizeImage onMouseDown={handleMouseDown}>
      <img src="/toggle-sidebar-width.png" alt="sidebarToggle" />
    </ResizeImage>
  );
};

  const handleAirplaneClick = (airplane) => {
    setSelectedAirplane(airplane);
    setSidebarOpen(true);
  };

  // Função para fechar a sidebar
const closeSidebar = () => {
  setSidebarOpen(false);
};

// Função para abrir a sidebar e definir o avião selecionado
const openSidebar = (airplane) => {
  setSelectedAirplane(airplane);
  setSidebarOpen(true);
};

  useEffect(() => {
    // Mostra o loader
    const timeout = setTimeout(() => setIsLoading(false), 1000);

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

  // Função para determinar a cor baseada na altitude
  const getColorByAltitude = (altitude) => {
    if (!altitude) return '#808080'; // Cinza para altitude desconhecida
    altitude = Number(altitude);


    if (altitude <= -350) return '#808080';
    if (altitude <= 0) return '#FF4500';
    if (altitude <= 500) return '#FF4500';
    if (altitude <= 1000) return '#FF8C00';
    if (altitude <= 2000) return '#FFD700';
    if (altitude <= 4000) return '#ADFF2F';
    if (altitude <= 6000) return '#32CD32';
    if (altitude <= 8000) return '#008000';
    if (altitude <= 10000) return '#20B2AA';
    if (altitude <= 20000) return '#00BFFF';
    if (altitude <= 30000) return '#0000FF';
    if (altitude <= 40000) return '#8A2BE2';
    if (altitude > 40000) return '#FF00FF';
    return '#808080';
  };

  const updateAirplanePaths = (newAirplanes) => {
    setAirplanePaths(prevPaths => {
      const updatedPaths = { ...prevPaths };

      newAirplanes.forEach((airplane) => {
        if (airplane.lat && airplane.lon) {
          const hex = airplane.hex;

          if (!updatedPaths[hex]) {
            updatedPaths[hex] = [];
          }

          const newPosition = {
            position: [airplane.lat, airplane.lon],
            altitude: airplane.alt_baro
          };

          const lastPosition = updatedPaths[hex][updatedPaths[hex].length - 1];

          if (!lastPosition ||
              lastPosition.position[0] !== newPosition.position[0] ||
              lastPosition.position[1] !== newPosition.position[1]) {
            updatedPaths[hex].push(newPosition);
          }

          if (updatedPaths[hex].length > 2000) {
            updatedPaths[hex] = updatedPaths[hex].slice(-2000);
          }
        }
      });

      return updatedPaths;
    });
  };

const airplaneIcon = (altitude, category, track) => {
  const getIconUrl = (category) => {
    const validCategories = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B0', 'B1'];
    return validCategories.includes(category)
      ? `/${category}.png`
      : '/A3.png';
  };

  return L.divIcon({
    html: `<img src="${getIconUrl(category)}" style="width: 30px; height: 30px; transform: rotate(${track || 0}deg);">`,
    className: 'airplane-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
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

  const getBaroRateIcon = (baroRate) => {
    if (baroRate > 0) {
      return '▲';
    } else if (baroRate < 0) {
      return '▼';
    }
    return '';
  };

  if (isLoading) {
    // Mostra o loader enquanto o estado isLoading for true
    return <Loader />;
  }

  if (isLoading) {
    // Mostra o loader enquanto o estado isLoading for true
    return <Loader />;
  }

  const handleMouseDown = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX);
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
        width: '200px',
        height: '100%',
        backgroundColor: '#313131',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.3)',
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
            top: '10px',
            right: '15px',
            cursor: 'pointer',
            width: '20px',
            height: '20px',
            filter: 'invert(33%) sepia(69%) saturate(4683%) hue-rotate(24deg) brightness(97%) contrast(91%)' // Filtro para a cor #f1c496
          }}
        />

        {selectedAirplane && (
            <div>
              <p style={{textAlign: 'left'}}><strong>Callsign:</strong> {selectedAirplane.flight || "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>Hex:</strong> {selectedAirplane.hex}</p>
              <p style={{textAlign: 'left'}}><strong>Altitude:</strong> {selectedAirplane.alt_baro || "N/A"} ft</p>
              <p style={{textAlign: 'left'}}><strong>Velocidade:</strong> {selectedAirplane.gs || "N/A"} nós</p>
              {/*<p style={{textAlign: 'left'}}><strong>ICAO:</strong> {selectedAirplane.icao || "N/A"} </p>*/}

              <h3 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                marginBottom: '10px'
              }}>SPATIAL</h3>
              <p style={{textAlign: 'left'}}><strong>Groundspeed:</strong> {selectedAirplane.gs || "N/A"} kt</p>
              <p style={{textAlign: 'left'}}><strong>Baro.altitude:</strong> {selectedAirplane.alt_baro || "N/A"} ft <span>{getBaroRateIcon(selectedAirplane.baro_rate)}</span></p>
              <p style={{textAlign: 'left'}}><strong>Vert.Rate:</strong> {selectedAirplane.baro_rate || "N/A"} ft/min</p>
              <p style={{textAlign: 'left'}}><strong>Track:</strong> {selectedAirplane.track || "N/A"}º</p>
              <p style={{textAlign: 'left'}}><strong>Pos.:</strong> {selectedAirplane.lat && selectedAirplane.lon
                  ? `Latitude: ${selectedAirplane.lat.toFixed(2)}º, Longitude: ${selectedAirplane.lon.toFixed(2)}º`
                  : "N/A"
              } </p>
              <p><strong>Distance:</strong> {selectedAirplane.modea || "N/A"}</p>

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                marginBottom: '10px'
              }}>SIGNAL</h2>
              <p style={{textAlign: 'left'}}><strong>Source:</strong> {selectedAirplane.modec ? "ADS-B" : "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>RSSI:</strong> {selectedAirplane.rssi || "N/A"} dBFS</p>
              <p style={{textAlign: 'left'}}><strong>Msg. Rate:</strong> {selectedAirplane.messages || "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>Messages:</strong> {selectedAirplane.messages || "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>Last Pos.:</strong> {selectedAirplane.seen_pos || "N/A"} s</p>
              <p style={{textAlign: 'left'}}><strong>Last Seen.:</strong> {selectedAirplane.seen || "N/A"} s</p>

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                width: '100%',
                marginBottom: '10px'
              }}>FMS SEL</h2>
              <p style={{textAlign: 'left'}}><strong>Sel. Alt.:</strong> {selectedAirplane.nav_altitude_mcp || "N/A"} ft</p>
              <p style={{textAlign: 'left'}}><strong>Sel. Head.:</strong> {selectedAirplane.mag_heading || "N/A"}º</p>

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                width: '100%',
                marginBottom: '10px'
              }}>WIND</h2>
              <p style={{textAlign: 'left'}}><strong>Speed:</strong> {selectedAirplane.gs || "N/A"} kt</p>
              <p style={{textAlign: 'left'}}><strong>Direction (from):</strong> {selectedAirplane.track || "N/A"}º</p>
              <p style={{textAlign: 'left'}}><strong>TAT / OAT:</strong> {selectedAirplane.messages || "N/A"}</p> {/* Not available in provided JSON, replaced with 'messages' for now */}

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                width: '100%',
                marginBottom: '10px'
              }}>Speed</h2>
              <p style={{textAlign: 'left'}}><strong>Ground:</strong> {selectedAirplane.gs || "N/A"} kt</p>
              <p style={{textAlign: 'left'}}><strong>True:</strong> {selectedAirplane.tas || "N/A"} kt</p>
              <p style={{textAlign: 'left'}}><strong>Indicated:</strong> {selectedAirplane.ias || "N/A"} kt</p>
              <p style={{textAlign: 'left'}}><strong>Mach:</strong> {selectedAirplane.mach || "N/A"}</p>

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                width: '100%',
                marginBottom: '10px'
              }}>Altitude</h2>
              <p style={{textAlign: 'left'}}><strong>Barometric:</strong> {selectedAirplane.alt_baro || "N/A"} ft <span>{getBaroRateIcon(selectedAirplane.baro_rate)}</span></p>
              <p style={{textAlign: 'left'}}><strong>Baro.Rate:</strong> {selectedAirplane.baro_rate || "N/A"} ft/min</p>
              <p style={{textAlign: 'left'}}><strong>Geom.WGS84:</strong> {selectedAirplane.alt_geom || "N/A"} ft <span>{getBaroRateIcon(selectedAirplane.baro_rate)}</span></p>
              <p style={{textAlign: 'left'}}><strong>Geom.Rate:</strong> {selectedAirplane.geom_rate || "N/A"} ft/min</p>
              <p style={{textAlign: 'left'}}><strong>QNH:</strong> {selectedAirplane.nav_qnh || "N/A"} hPa</p>

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                width: '100%',
                marginBottom: '10px'
              }}>Direction</h2>
              <p style={{textAlign: 'left'}}><strong>Ground Track:</strong> {selectedAirplane.track || "N/A"}º</p>
              <p style={{textAlign: 'left'}}><strong>True Heading:</strong> {selectedAirplane.true_heading || "N/A"}º</p>
              <p style={{textAlign: 'left'}}><strong>Magnetic Heading:</strong> {selectedAirplane.mag_heading || "N/A"}º</p>
              <p style={{textAlign: 'left'}}><strong>Magnetic Decl.:</strong> {selectedAirplane.mag_declination || "N/A"}º</p>
              <p style={{textAlign: 'left'}}><strong>Track Rate:</strong> {selectedAirplane.track_rate || "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>Roll:</strong> {selectedAirplane.roll || "N/A"}</p>

              <h2 style={{
                backgroundColor: '#003f4b',
                color: 'white',
                width: '100%',
                marginBottom: '10px'
              }}>Stuff</h2>
              <p style={{textAlign: 'left'}}><strong>Nav. Modes:</strong> {selectedAirplane.modec ? "ADS-B" : "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>ADS-B Ver.:</strong> {selectedAirplane.version || "N/A"}</p>
              <p style={{textAlign: 'left'}}><strong>Category:</strong> {selectedAirplane.category || "N/A"}</p>

            </div>
        )}
      </div>
    )}

    {/* Sidebar com informações da tabela ao colocar o zIndex superior ao da imagem da alt
    temos uma sidebar que passa por cima da imagem*/}
    <Sidebar width={sidebarWidth} style={{zIndex: 1500}}>
      <ResizeButtonComponent handleMouseDown={handleMouseDown}/>

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
          const {country, flag} = getCountryByHex(airplane.hex);
          return (
              <tr key={airplane.hex} onClick={() => openSidebar(airplane)}>
                <td>
                  {flag ? <img src={flag} alt={country} style={{width: "20px", height: "15px"}}/> : "N/A"}
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
        style={{height: "100vh", width: "100vw"}}
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
              <strong>{radar.name}</strong><br/>
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

      {/* aviões no mapa */}
      {airplanes.map((airplane) => (
          airplane.lat && airplane.lon && (
              <Marker
                  key={airplane.hex}
                  position={[airplane.lat, airplane.lon]}
                  icon={airplaneIcon(airplane.alt_baro, airplane.category, airplane.track)}
                  eventHandlers={{
                    click: () => handleAirplaneClick(airplane), // Ao clicar no avião, abre a leftSidebar
                  }}
              >
                <Popup>
                  <strong>Voo:</strong> {airplane.flight || "N/A"}<br/>
                  <strong>Hex:</strong> {airplane.hex}<br/>
                  <strong>Altitude:</strong> {airplane.alt_baro || "N/A"} ft <br/>
                  <strong>Velocidade:</strong> {airplane.gs || "N/A"} nós<br/>
                  <strong>RSSI:</strong> {airplane.rssi || "N/A"} dBFS<br/>
                  <strong>Last Pos.:</strong> {airplane.seen_pos || "N/A"}s<br/>
                  <strong>Last Seen.:</strong> {airplane.seen || "N/A"}s<br/>
                </Popup>
              </Marker>
          )
      ))}

      {/* Traçado das rotas com cores baseadas na altitude */}
        {Object.entries(airplanePaths).map(([hex, path]) => {
          if (path.length < 2) return null;

          // Criar segmentos de linha para cada par de pontos
          return path.slice(1).map((point, index) => {
            const prevPoint = path[index];
            const positions = [
              prevPoint.position,
              point.position
            ];

            return (
              <Polyline
                key={`${hex}-${index}`}
                positions={positions}
                color={getColorByAltitude(point.altitude)}
                weight={selectedAirplane?.hex === hex ? 3 : 2} //mudar isto para o tamanho da linha
                opacity={selectedAirplane?.hex === hex ? 1.0 : 0.7} //mudar isto para a cor ficar mais escura ou mais clara
              />
            );
          });
        })}
    </MapContainer>
    {/* Imagem da altitude que está no rodapé */}
      <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex:1200, marginLeft: '-50px'
    }}>
      <img src="/Altitude.svg" alt="Altitude Image" style={{ width: '800px', height: 'auto', pointerEvents: 'none'}} />
    </div>
  </div>
  );
}


export default App;
