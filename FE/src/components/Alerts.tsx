import { useEffect, useState } from 'react'
import { apiURL, endPoints } from '../config';

const Alerts = () => {
    const [alertMessages, setAlertMessages] = useState<string[]>([])
    const [togglePopup, setTogglePopup] = useState<boolean>(false)
    // const timer = useRef<number | null>(null)

    useEffect(() => {
        fetchingAlert();
    }, [])

    const fetchingAlert = () => {
        console.log('fetching alerts')
        fetch(`${apiURL}/${endPoints.alerts}`)
            .then(res => res.json())
            .then((alerts) => {
                setAlertMessages(alerts.alerts)
            })
    }

    useEffect(() => {
        if (alertMessages.length > 0) {
            setTogglePopup(true)
        }
    }, [alertMessages])

    return (
        <>
            {alertMessages.length > 0 && togglePopup && (
                <div className='absolute w-[500px] top-1/2 left-1/2 z-2000 px-6 py-5 rounded-xl
                -translate-1/2 bg-gray-400/80'>
                    <h3 className='text-2xl font-bold text-map-secondary text-center my-4'>DRT - Messages</h3>
                    <ul className=''>
                        {
                            alertMessages.map((alert: string, index: number) =>
                                <div className='text' key={index}>
                                    {alert}
                                </div >
                            )
                        }
                    </ul>
                    <div className='absolute top-2 right-2'>
                        <button className='cursor-pointer p-3 rounded-full hover:shadow-lg hover:bg-gray-600'
                            onClick={() => { setTogglePopup(false) }}
                        >
                            ❌
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Alerts