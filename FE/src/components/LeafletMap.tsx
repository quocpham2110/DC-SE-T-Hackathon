import { LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import CurrentLocation from './CurrentLocation';
import BusTracking from './BusTracking';
import RouteShapes from './RouteShapes';

// This component show the OpenStreetMap
const LeafletMap = () => {
    // Show the Durham College position as center
    const dcPosition = [43.943665390915875, -78.89697807407433] as LatLngTuple;

    return (
        <div id='map'>
            <MapContainer center={dcPosition} zoom={13} scrollWheelZoom={true}>
                <TileLayer
                    attribution='<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CurrentLocation />
                <BusTracking />
                <RouteShapes />
            </MapContainer>
        </div>
    );
}

export default LeafletMap
