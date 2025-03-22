import { LatLngTuple } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import CurrentLocation from './CurrentLocation';

// This component show the OpenStreetMap
const LeafletMap = () => {
    // Show the Durham college location on screen for demo
    const dcPosition = [43.943665390915875, -78.89697807407433] as LatLngTuple;

    return (
        <div id='map'>
            <MapContainer center={dcPosition} zoom={13} scrollWheelZoom={true}>
                <TileLayer
                    attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={dcPosition}>
                    <Popup>
                        Durham college
                    </Popup>
                </Marker>
                <CurrentLocation />
            </MapContainer>
        </div>
    );
}

export default LeafletMap
