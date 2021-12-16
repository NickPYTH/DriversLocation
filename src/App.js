import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
import { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const getLocation = () =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      return resolve({ lat: coords.latitude, lng: coords.longitude });
    }, reject)
  );

const distanceBetweenLocations = ([x1, y1], [x2, y2]) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  let R = 6371.071;
  let rlat1 = toRadians(x1);
  let rlat2 = toRadians(x2);
  let difflat = rlat2 - rlat1;
  let difflon = toRadians(y2 - y1);
  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(difflat / 2) * Math.sin(difflat / 2) +
          Math.cos(rlat1) *
            Math.cos(rlat2) *
            Math.sin(difflon / 2) *
            Math.sin(difflon / 2)
      )
    )
  );
};

function App(props) {
  const londonCoords = { lat: 51.5049375, lng: -0.0964509 };
  const singaporeCoords = { lat: 1.285194, lng: 103.8522982 };
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState();
  const [countDrivers, setCountDrivers] = useState(1);
  const [drivers, setDrivers] = useState([
    {
      driver_id: "0-ka4cs6abapf",
      location: {
        latitude: 51.5049375,
        longitude: -0.0914509,
        bearing: 296,
      },
    },
    {
      driver_id: "1-6qnnawdioov",
      location: {
        latitude: 51.5049375,
        longitude: -0.0777509,
        bearing: 50,
      },
    },
    {
      driver_id: "2-lnzq6emmydd",
      location: {
        latitude: 51.5049375,
        longitude: -0.0994509,
        bearing: 10,
      },
    },
  ]);

  useEffect(() => {
    getLocation().then((loc) => {
      if (
        distanceBetweenLocations(
          [loc.lat, loc.lng],
          [londonCoords.lat, londonCoords.lng]
        ) <
        distanceBetweenLocations(
          [loc.lat, loc.lng],
          [singaporeCoords.lat, singaporeCoords.lng]
        )
      ) {
        setLocation(londonCoords);
        setLocationName("london");
      } else {
        setLocation(singaporeCoords);
        setLocationName("singapore");
      }
    });
  }, []);

  useEffect(() => {
    if (location) {
      const interval = setInterval(
        () => {
          console.log(location)
          fetch(`https://secret-ocean-49799.herokuapp.com/https://qa-interview-test.splytech.dev/api/drivers?latitude=${Number(location.lat)}&longitude=${Number(location.lng)}&count=${countDrivers}`, {
            method: "GET",
            redirect: "follow",
          })
              .then((res) => res.json())
              .then((data) => {
                console.log(data)
                let tmp = [];
                data.drivers.map((el) => {
                  tmp.push({
                    location: {
                      latitude: el.location.latitude,
                      longitude: el.location.longitude,
                      bearing: el.location.bearing,
                    },
                  });
                });
                setDrivers(tmp);
              })
        },
        5000
      )
      return () => clearInterval(interval);
    }
  }, [location, countDrivers]);
  return (
    <div>
      {location && (
        <div>
          <Map
            google={props.google}
            zoom={14}
            initialCenter={location}
            center={location}
          >
            {drivers.map((driver) => (
              <Marker
                position={{
                  lat: driver.location.latitude,
                  lng: driver.location.longitude,
                }}
              />
            ))}
          </Map>
          <div style={styles.buttons}>
            <div>
              <Slider
                min={1}
                max={20}
                style={{ width: 210, margin: 15 }}
                value={countDrivers}
                onChange={(val) => {
                  setCountDrivers(val);
                }}
              />
              <div
                style={styles.btn}
                onClick={() => {
                  if (locationName === "london") {
                    setLocation(singaporeCoords);
                    setLocationName("singapore");
                  } else {
                    setLocation(londonCoords);
                    setLocationName("london");
                  }
                }}
              >
                Previous
              </div>
              <div
                style={styles.btn}
                onClick={() => {
                  if (
                    distanceBetweenLocations(
                      [location.lat, location.lng],
                      [londonCoords.lat, londonCoords.lng]
                    ) >
                    distanceBetweenLocations(
                      [location.lat, location.lng],
                      [singaporeCoords.lat, singaporeCoords.lng]
                    )
                  ) {
                    setLocation(singaporeCoords);
                    setLocationName("singapore");
                  } else {
                    setLocation(londonCoords);
                    setLocationName("london");
                  }
                }}
              >
                Nearest
              </div>
              <div
                style={styles.btn}
                onClick={() => {
                  if (locationName === "london") {
                    setLocation(singaporeCoords);
                    setLocationName("singapore");
                  } else {
                    setLocation(londonCoords);
                    setLocationName("london");
                  }
                }}
              >
                Next
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyDIY3CBQDomVFUoM8CcWZXbSGQdL0ijEm0",
})(App);

const styles = {
  buttons: {
    position: "absolute",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 40
  },
  btn: {
    padding: 5,
    color: "white",
    border: "2px solid white",
    borderRadius: 5,
    margin: 5,
    cursor: "pointer",
  },
};
