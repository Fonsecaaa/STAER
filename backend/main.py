import requests
from config import app, db, scheduler
from models import Aircraft
from flask import jsonify
from datetime import datetime, timedelta


@app.route('/api/aircrafts', methods=['GET'])
def get_aircrafts():
    with app.app_context():
        aircrafts = Aircraft.query.all()
        return jsonify({"airplanes": [aircraft.to_json() for aircraft in aircrafts]})

# Função para remover aviões inativos que não têm código hex e flight
def remove_inactive_aircrafts():
    X = 5  # O limite de tempo (em segundos)
    now = datetime.now()  # Hora atual

    with app.app_context():
        # Encontre aviões com status 'N/A', inativos por mais de X segundos e sem código hex ou flight
        inactive_aircrafts = Aircraft.query.filter(
            Aircraft.seen == 'N/A',  # Filtra aviões com status 'N/A'
            Aircraft.seen_pos < (now - timedelta(seconds=X)).timestamp(),  # Inativos por mais de X segundos
            (Aircraft.hex_code == 'N/A') | (Aircraft.hex_code == ''),  # Sem código hex
            (Aircraft.flight == 'N/A') | (Aircraft.flight == '')  # Sem número de voo (flight)
        ).all()

        # Remover os aviões encontrados
        for aircraft in inactive_aircrafts:
            db.session.delete(aircraft)

        db.session.commit()
        print(f"Removidos {len(inactive_aircrafts)} aviões inativos.")


def fetch_and_update_aircraft_data():
    url = "https://ads-b.tail76af06.ts.net/data/aircraft.json"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        with app.app_context():
            for aircraft_data in data.get("aircraft", []):
                # Funções auxiliares para validar e converter dados
                def safe_float(value):
                    try:
                        return float(value)
                    except (ValueError, TypeError):
                        return None

                def parse_altitude(value):
                    return 0.0 if value == "ground" else safe_float(value)

                # Limpar os dados antes de usar
                alt_baro = parse_altitude(aircraft_data.get("alt_baro"))
                alt_geom = safe_float(aircraft_data.get("alt_geom"))
                gs = safe_float(aircraft_data.get("gs"))
                ias = safe_float(aircraft_data.get("ias"))
                tas = safe_float(aircraft_data.get("tas"))
                mach = safe_float(aircraft_data.get("mach"))
                track = safe_float(aircraft_data.get("track"))
                roll = safe_float(aircraft_data.get("roll"))
                lat = safe_float(aircraft_data.get("lat"))
                lon = safe_float(aircraft_data.get("lon"))
                rssi = safe_float(aircraft_data.get("rssi"))
                seen = safe_float(aircraft_data.get("seen"))
                seen_pos = safe_float(aircraft_data.get("seen_pos"))


                # Verificar se a aeronave já existe no banco de dados
                existing_aircraft = Aircraft.query.filter_by(hex_code=aircraft_data.get("hex")).first()

                if existing_aircraft is None:
                    # Inserir nova aeronave
                    new_aircraft = Aircraft(
                        hex_code=aircraft_data.get("hex"),
                        flight=aircraft_data.get("flight"),
                        alt_baro=alt_baro,
                        alt_geom=alt_geom,
                        gs=gs,
                        ias=ias,
                        tas=tas,
                        mach=mach,
                        track=track,
                        roll=roll,
                        lat=lat,
                        lon=lon,
                        squawk=aircraft_data.get("squawk"),
                        category=aircraft_data.get("category"),
                        emergency=aircraft_data.get("emergency"),
                        messages=aircraft_data.get("messages"),
                        seen=seen,
                        rssi=rssi,
                        seen_pos=seen_pos
                    )
                    db.session.add(new_aircraft)
                else:

                    # Atualizar registro existente
                    existing_aircraft.flight = aircraft_data.get("flight")
                    existing_aircraft.alt_baro = alt_baro
                    existing_aircraft.alt_geom = alt_geom
                    existing_aircraft.gs = gs
                    existing_aircraft.ias = ias
                    existing_aircraft.tas = tas
                    existing_aircraft.mach = mach
                    existing_aircraft.track = track
                    existing_aircraft.roll = roll
                    existing_aircraft.lat = lat
                    existing_aircraft.lon = lon
                    existing_aircraft.squawk = aircraft_data.get("squawk")
                    existing_aircraft.category = aircraft_data.get("category")
                    existing_aircraft.emergency = aircraft_data.get("emergency")
                    existing_aircraft.messages = aircraft_data.get("messages")
                    existing_aircraft.seen = seen
                    existing_aircraft.rssi = rssi
                    existing_aircraft.seen_pos = seen_pos  # Atualizar a posição do último visto

            db.session.commit()
        print("Dados de aeronaves atualizados com sucesso!")
    except Exception as e:
        print(f"Erro ao buscar ou processar os dados: {e}")

if __name__ == '__main__':
    with app.app_context():
        #se apagarem a base de dados e estiver a dar erro façam este comando para criar a DB
        #db.create_all()
        #depois de fazer isso uma vez pode-se voltar a meter em comment

        db.session.query(Aircraft).delete()
        db.session.commit()

        # Cria todas as tabelas definidas no modelo
        db.create_all()

    # Agendar a tarefa para rodar a cada 2 segundos
    scheduler.add_job(fetch_and_update_aircraft_data, 'interval', seconds=2)

    # Agendar a tarefa de limpeza a cada 5 segundos
    scheduler.add_job(remove_inactive_aircrafts, 'interval', seconds=5)

    app.run(debug=True, port=5002)