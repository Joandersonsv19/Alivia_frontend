import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Heart, 
  Mic, 
  Calendar, 
  Activity, 
  Users, 
  Settings,
  Plus,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react'
import './App.css'

// Components
import Dashboard from './components/Dashboard'
import PainDiary from './components/PainDiary'
import Medications from './components/Medications'
import Therapies from './components/Therapies'
import VoiceMode from './components/VoiceMode'
import CaregiverMode from './components/CaregiverMode'

function App() {
  const [currentUser] = useState('default_user')
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Navigation component
  const Navigation = () => (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-red-300" />
          <h1 className="text-2xl font-bold">AlivIA</h1>
        </div>
        
        <div className="hidden md:flex space-x-4">
          <Button 
            variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentPage('dashboard')}
            className="text-white hover:bg-blue-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Início
          </Button>
          <Button 
            variant={currentPage === 'diary' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentPage('diary')}
            className="text-white hover:bg-blue-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Diário da Dor
          </Button>
          <Button 
            variant={currentPage === 'medications' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentPage('medications')}
            className="text-white hover:bg-blue-700"
          >
            <Clock className="h-4 w-4 mr-2" />
            Medicamentos
          </Button>
          <Button 
            variant={currentPage === 'therapies' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentPage('therapies')}
            className="text-white hover:bg-blue-700"
          >
            <Heart className="h-4 w-4 mr-2" />
            Terapias
          </Button>
          <Button 
            variant={currentPage === 'voice' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentPage('voice')}
            className="text-white hover:bg-blue-700"
          >
            <Mic className="h-4 w-4 mr-2" />
            Modo Voz
          </Button>
          <Button 
            variant={currentPage === 'caregiver' ? 'secondary' : 'ghost'}
            onClick={() => setCurrentPage('caregiver')}
            className="text-white hover:bg-blue-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Cuidador
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          className="md:hidden text-white"
          onClick={() => setCurrentPage('voice')}
        >
          <Mic className="h-6 w-6" />
        </Button>
      </div>
    </nav>
  )

  // Mobile bottom navigation
  const MobileNavigation = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentPage('dashboard')}
          className={`flex flex-col items-center p-2 ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Activity className="h-5 w-5" />
          <span className="text-xs mt-1">Início</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentPage('diary')}
          className={`flex flex-col items-center p-2 ${currentPage === 'diary' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Diário</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentPage('medications')}
          className={`flex flex-col items-center p-2 ${currentPage === 'medications' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Clock className="h-5 w-5" />
          <span className="text-xs mt-1">Remédios</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentPage('therapies')}
          className={`flex flex-col items-center p-2 ${currentPage === 'therapies' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Terapias</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentPage('voice')}
          className={`flex flex-col items-center p-2 ${currentPage === 'voice' ? 'text-blue-600' : 'text-gray-600'}`}
        >
          <Mic className="h-5 w-5" />
          <span className="text-xs mt-1">Voz</span>
        </Button>
      </div>
    </div>
  )

  // Render current page
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard userId={currentUser} onNavigate={setCurrentPage} />
      case 'diary':
        return <PainDiary userId={currentUser} />
      case 'medications':
        return <Medications userId={currentUser} />
      case 'therapies':
        return <Therapies userId={currentUser} />
      case 'voice':
        return <VoiceMode userId={currentUser} onNavigate={setCurrentPage} />
      case 'caregiver':
        return <CaregiverMode userId={currentUser} />
      default:
        return <Dashboard userId={currentUser} onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto p-4 pb-20 md:pb-4">
        {renderCurrentPage()}
      </main>

      <MobileNavigation />
    </div>
  )
}

export default App

