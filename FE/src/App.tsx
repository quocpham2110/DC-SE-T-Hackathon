import './App.css'
import LeafletMap from './components/LeafletMap'
import Sidebar from './components/Sidebar'

function App() {

  return (
    <div className='relative flex flex-row justify-end'>
      <Sidebar />
      <LeafletMap />
    </div>
  )
}

export default App
