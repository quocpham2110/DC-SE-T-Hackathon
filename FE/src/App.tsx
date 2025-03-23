import './App.css'
import Alerts from './components/Alerts'
import LeafletMap from './components/LeafletMap'
import Sidebar from './components/Sidebar'

function App() {

  return (
    <div className='relative flex flex-row justify-end'>
      <Sidebar />
      <LeafletMap />
      <Alerts />
    </div>
  )
}

export default App
