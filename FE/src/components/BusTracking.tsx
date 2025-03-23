import { FaBus } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L, { LatLngTuple } from 'leaflet';
import { Marker, Popup, useMap } from 'react-leaflet';
import { VscTriangleDown } from "react-icons/vsc";
import { IoMdRefresh } from 'react-icons/io';
import useBusTrackingStore from '../stores/busTrackingStore';

const BusIcon = ({ color }: { color: string }) => (
    <div className={`relative`}>
        <FaBus color={color} size={30} />
        <div className='absolute top-full left-0 translate-x-[2px]'>
            <VscTriangleDown color="#FF6347" size={24} />
        </div>
    </div>
);


const BusTracking = () => {
    const { data: { info }, setData } = useBusTrackingStore(state => state)
    const map = useMap();

    const busPosition: LatLngTuple = useMemo(() => {
        if (info.vehicle_id) {
            return [info.position.latitude, info.position.longitude]
        } else {
            return [0, 0]
        }
    }, [info])

    const busRef = useRef<L.Marker | null>(null)

    useEffect(() => {
        if (busPosition[0] + busPosition[1] !== 0 && busRef.current) {
            busRef.current?.openPopup()
        }
    }, [busPosition, busRef])

    useEffect(() => {
        if (info.vehicle_id) {
            map.flyTo(busPosition, 16)
        }
    }, [busPosition, info, map])

    useEffect(() => {
        if (info?.crowd_color) {
            setCrowdColor(info?.crowd_color)
        }
    }, [info])

    const [crowdColor, setCrowdColor] = useState<string>("")

    const busIcon = useMemo(() => {
        const iconHtml = ReactDOMServer.renderToStaticMarkup(<BusIcon color={crowdColor} />)

        return L.divIcon({
            html: iconHtml,
            className: "custom-marker",
            iconAnchor: [10, 40],
            popupAnchor: [0, -40]
        })
    }, [crowdColor]);

    const occupancyStatus = useMemo(() => ({
        Blue: 'N/A',
        Green: 'low',
        Yellow: 'medium',
        Red: 'full'
    }), [])

    const [isRefresh, setIsRefresh] = useState<boolean>(false)

    const refreshBusTracking = useCallback(() => {
        if (isRefresh) {
            return;
        }

        if (info) {
            setIsRefresh(true)
            const body = JSON.stringify({
                trip_id: info.trip_id,
                vehicle_id: info.vehicle_id
            })
            fetch('http://localhost:8000/api/v1/transit/track-bus', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body
            })
                .then(res => res.json())
                .then(data => {
                    console.log(`Bus data: `, data)
                    setData({
                        info: {
                            position: {
                                latitude: data[0].latitude,
                                longitude: data[0].longitude,
                            },
                            timestamp: data[0].timestamp,
                            trip_id: data[0].trip_id,
                            vehicle_id: data[0].vehicle_id,
                            trip_headsign: data[0].trip_headsign,
                            direction_name: data[0].direction_name,
                            route_id: data[0].route_id,
                            crowd_color: data[3].crowd_color
                        },
                        shapes: data[1],
                    })
                })
                .finally(() => {
                    setIsRefresh(false)
                })
        }

    }, [info, setData, setIsRefresh, isRefresh])

    const timerRef = useRef(0)
    const [timeGap, setTimeGap] = useState('')

    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }

        timerRef.current = setInterval(() => {
            const gap = (new Date().getTime() - (+info.timestamp * 1000)) / 1000
            if (gap > 60) {
                setTimeGap(`${Math.round(gap / 60)} minutes ${Math.round(gap % 60)} seconds ago`)
            } else {
                setTimeGap(`${Math.round(gap)} seconds ago`)
            }
        }, 1)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [info])

    return (
        <>
            {
                busPosition[0] + busPosition[1] !== 0 &&
                < Marker position={busPosition} icon={busIcon} ref={busRef}>
                    <Popup autoPan={true} closeButton={false}>
                        <div className='text-xl font-bold flex flex-row items-center justify-between mb-4'>
                            <span className='text-map-primary'>🚌 Bus {info.route_id}</span>
                            <button className='cursor-pointer text-map-secondary rounded-full
                                hover:text-map-primary hover:shadow-md'
                                disabled={isRefresh}
                                onClick={refreshBusTracking}
                            >
                                <IoMdRefresh />
                            </button>
                        </div>
                        <div className='my-3 text-[16px]'>
                            <span className=''>
                                ⛕ {info.direction_name} - {info.trip_headsign}
                            </span>
                        </div>
                        <div className='my-3 text-[16px]'>
                            <span className=''>
                                🕒 Updated: {timeGap}
                            </span>
                        </div>
                        <div className='my-3 text-[16px]'>
                            <span className=''>
                                👨‍👨‍👧‍👧 Occupancy: {occupancyStatus[(info.crowd_color as keyof typeof occupancyStatus) || "Blue"]}
                            </span>
                        </div>
                    </Popup>
                </Marker >
            }
        </>
    );
}

export default BusTracking;
