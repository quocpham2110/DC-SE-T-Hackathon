import { Control, DomEvent, DomUtil, LatLngTuple, LocationEvent } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { MdMyLocation } from 'react-icons/md';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';

// User can get your current location that will be shown as a marker on the map
// User must grant permission for browser!
const CurrentLocation = () => {
    const map = useMap()
    const controlDivRef = useRef(null);
    const [currentLocation, setCurrentLocation] = useState<LatLngTuple>([0, 0])

    // This hook listen the event that users get their location
    // and the map will navigate to the location 
    useMapEvents({
        locationfound(data: LocationEvent) {
            const position = [data.latlng.lat, data.latlng.lng] as LatLngTuple
            map.flyTo(position, 16)

            // Set the location to show the marker
            setCurrentLocation(position)
        },
    });

    // Add a control component into the map
    useEffect(() => {
        const div = DomUtil.create("div") as HTMLDivElement;
        DomEvent.disableClickPropagation(controlDivRef.current || div);
        DomEvent.disableScrollPropagation(controlDivRef.current || div);

        // create Control component that 
        const control = new Control({ position: "topleft" });
        control.onAdd = () => controlDivRef.current || div;

        // Add the control element into map
        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map, controlDivRef])

    // Get the user's location
    const onClick = () => {
        map.locate();
    }

    return (
        <>
            <div ref={controlDivRef}>
                <button className='ml-0.5 mt-1 p-2  cursor-pointer bg-white rounded-full outline outline-map-secondary
                hover:bg-map-primary duration-200 hover:scale-120'
                    onClick={onClick}
                >
                    <MdMyLocation size={16} />
                </button>
            </div>

            {/* This part show the marker on the mark if {currentLocation} exists */}
            {(currentLocation[0] + currentLocation[1] !== 0) &&
                <Marker position={currentLocation}>
                    <Popup>
                        Your location
                    </Popup>
                </Marker>}
        </>
    );
}

export default CurrentLocation;
