import { useCallback, useMemo } from 'react';
import useBusTrackingStore from '../stores/busTrackingStore';
import { Marker, Polyline, Popup } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import { HiLocationMarker } from "react-icons/hi";
import ReactDOMServer from 'react-dom/server';

const CustomMarkerIcon = ({ color }: { color: string }) => (
    <div className='text-blue-500'>
        <HiLocationMarker color={color} size={30} />
    </div>
);

const RouteShapes = () => {
    const { data: { shapes } } = useBusTrackingStore(state => state)

    const markers = useMemo(() => {
        const result: { firstPos: LatLngTuple; lastPos: LatLngTuple } = { firstPos: [0, 0], lastPos: [0, 0] }
        if (shapes.length) {
            const firstPoint = shapes[0];
            result.firstPos = [firstPoint.shape_pt_lat, firstPoint.shape_pt_lon]
            const lastPoint = shapes[shapes.length - 1]
            result.lastPos = [lastPoint.shape_pt_lat, lastPoint.shape_pt_lon]
        }
        return result
    }, [shapes])

    const createCustomMarkerIcon = useCallback((color: string) => {
        const iconHtml = ReactDOMServer.renderToStaticMarkup(<CustomMarkerIcon color={color} />);
        return L.divIcon({
            html: iconHtml,
            className: "custom-marker",
            iconAnchor: [15, 15],
        });
    }, [])

    return (
        <>
            {
                shapes.length && (<>
                    <Polyline positions={shapes.map(shape => ([shape.shape_pt_lat, shape.shape_pt_lon]))} color="blue" weight={7}/>
                    <Marker position={markers.firstPos} icon={createCustomMarkerIcon('green')}>
                        <Popup>
                            Departure point
                        </Popup>
                    </Marker>
                    <Marker position={markers.lastPos} icon={createCustomMarkerIcon('red')}>
                        <Popup>
                            Arrival point
                        </Popup>
                    </Marker>
                </>)
            }
        </>
    );
}

export default RouteShapes;
