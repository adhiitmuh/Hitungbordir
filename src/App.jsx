import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import InputProduksi from './pages/InputProduksi'
import KalkulasiModal from './pages/KalkulasiModal'
import LaporanOperator from './pages/LaporanOperator'
import MasterData from './pages/MasterData'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/input" element={<InputProduksi />} />
        <Route path="/modal" element={<KalkulasiModal />} />
        <Route path="/laporan" element={<LaporanOperator />} />
        <Route path="/master" element={<MasterData />} />
      </Routes>
    </Layout>
  )
}
