import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Activity, 
  Calendar, 
  Clock, 
  Heart, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Mic
} from 'lucide-react'

const Dashboard = ({ userId, onNavigate }) => {
  const [todayPain, setTodayPain] = useState(null)
  const [weeklyAverage, setWeeklyAverage] = useState(0)
  const [nextMedication, setNextMedication] = useState(null)
  const [recentTherapies, setRecentTherapies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch recent pain entries
      const painResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pain-entries`)
      const painData = await painResponse.json()
      
      if (painData.success) {
        const today = new Date().toISOString().split('T')[0]
        const todayEntries = painData.data.filter(entry => 
          entry.timestamp.split('T')[0] === today
        )
        
        if (todayEntries.length > 0) {
          const latestEntry = todayEntries[0]
          setTodayPain(latestEntry)
const painResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/pain-entries`)
const painData = await painResponse.json()        }
        
        // Calculate weekly average
        if (painData.data.length > 0) {
          const average = painData.data.reduce((sum, entry) => sum + entry.intensity, 0) / painData.data.length
          setWeeklyAverage(Math.round(average * 10) / 10)
        }
      }
      
      // Fetch medications
      const medResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/medications`)
      const medData = await medResponse.json()
      
      if (medData.success && medData.data.length > 0) {
        // Simulate next medication time
        const now = new Date()
        const nextHour = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
        setNextMedication({
          name: medData.data[0].name,
          time: nextHour.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })
      }
      
      // Fetch recent therapies
      const therapyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/therapies`)
      const therapyData = await therapyResponse.json()
      
      if (therapyData.success) {
        setRecentTherapies(therapyData.data.slice(0, 3))
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPainColor = (intensity) => {
    if (intensity <= 3) return 'text-green-600 bg-green-100'
    if (intensity <= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getPainLabel = (intensity) => {
    if (intensity <= 3) return 'Leve'
    if (intensity <= 6) return 'Moderada'
    return 'Intensa'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Olá! Como você está hoje?</h1>
          <p className="text-gray-600 mt-1">Aqui está um resumo do seu bem-estar</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button 
            onClick={() => onNavigate('voice')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mic className="h-4 w-4 mr-2" />
            Falar com AlivIA
          </Button>
          <Button 
            onClick={() => onNavigate('diary')}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Dor
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Pain */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dor de Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {todayPain ? (
              <div>
                <div className="text-2xl font-bold">{todayPain.intensity}/10</div>
                <Badge className={`mt-2 ${getPainColor(todayPain.intensity)}`}>
                  {getPainLabel(todayPain.intensity)}
                </Badge>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400">--</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Nenhum registro hoje
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Average */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyAverage}/10</div>
            <p className="text-xs text-muted-foreground mt-2">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        {/* Next Medication */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Remédio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextMedication ? (
              <div>
                <div className="text-2xl font-bold">{nextMedication.time}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {nextMedication.name}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-gray-400">--</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Nenhum medicamento
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Therapies This Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terapias na Semana</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentTherapies.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Sessões realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Pain Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Registro Rápido de Dor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Como está sua dor agora? Clique para registrar rapidamente.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => onNavigate('diary')}
              >
                Leve (1-3)
              </Button>
              <Button 
                variant="outline" 
                className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                onClick={() => onNavigate('diary')}
              >
                Moderada (4-6)
              </Button>
              <Button 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => onNavigate('diary')}
              >
                Intensa (7-10)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Therapies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Terapias Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Baseado no seu histórico, estas terapias podem ajudar:
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('therapies')}
              >
                🫁 Exercícios de Respiração
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('therapies')}
              >
                🧘 Relaxamento Muscular
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onNavigate('therapies')}
              >
                🔥 Aplicação de Calor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentTherapies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTherapies.map((therapy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium capitalize">{therapy.type}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(therapy.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {therapy.effectiveness && (
                    <Badge variant="outline">
                      {therapy.effectiveness}/5 ⭐
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard

