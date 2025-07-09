import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Heart, 
  Play, 
  Pause, 
  RotateCcw,
  Star,
  Clock,
  CheckCircle,
  Wind,
  Flame,
  Brain
} from 'lucide-react'

const Therapies = ({ userId }) => {
  const [therapies, setTherapies] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTherapy, setActiveTherapy] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [effectiveness, setEffectiveness] = useState(5)
  const [notes, setNotes] = useState('')

  const therapyTypes = [
    {
      id: 'breathing',
      name: 'Exercícios de Respiração',
      icon: Wind,
      description: 'Técnicas de respiração profunda para relaxamento e alívio da dor',
      duration: 5,
      instructions: [
        'Sente-se confortavelmente com as costas retas',
        'Coloque uma mão no peito e outra no abdômen',
        'Inspire lentamente pelo nariz por 4 segundos',
        'Segure a respiração por 4 segundos',
        'Expire lentamente pela boca por 6 segundos',
        'Repita o ciclo durante o tempo indicado'
      ]
    },
    {
      id: 'relaxation',
      name: 'Relaxamento Muscular',
      icon: Brain,
      description: 'Técnica de relaxamento progressivo dos músculos',
      duration: 10,
      instructions: [
        'Deite-se ou sente-se confortavelmente',
        'Comece pelos pés: contraia por 5 segundos, depois relaxe',
        'Suba pelas pernas, contraindo e relaxando cada grupo muscular',
        'Continue pelo abdômen, braços, ombros e rosto',
        'Mantenha a respiração calma durante todo o processo',
        'Termine com todo o corpo relaxado'
      ]
    },
    {
      id: 'heat',
      name: 'Aplicação de Calor',
      icon: Flame,
      description: 'Orientações para aplicação segura de calor terapêutico',
      duration: 15,
      instructions: [
        'Use uma bolsa de água morna ou compressa térmica',
        'Verifique se a temperatura está confortável (não muito quente)',
        'Aplique na área dolorida por 15-20 minutos',
        'Mantenha uma toalha entre a pele e a fonte de calor',
        'Não durma com a compressa aplicada',
        'Interrompa se sentir desconforto'
      ]
    }
  ]

  useEffect(() => {
    fetchTherapies()
  }, [userId])

  useEffect(() => {
    let interval = null
    if (isRunning && activeTherapy) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1)
      }, 1000)
    } else if (!isRunning) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, activeTherapy])

  const fetchTherapies = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/therapies?user=...`)
      const data = await response.json()
      
      if (data.success) {
        setTherapies(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar terapias:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTherapy = (therapy) => {
    setActiveTherapy(therapy)
    setTimer(0)
    setIsRunning(true)
    setShowFeedback(false)
  }

  const pauseTherapy = () => {
    setIsRunning(false)
  }

  const resumeTherapy = () => {
    setIsRunning(true)
  }

  const stopTherapy = () => {
    setIsRunning(false)
    setShowFeedback(true)
  }

  const resetTherapy = () => {
    setIsRunning(false)
    setTimer(0)
    setActiveTherapy(null)
    setShowFeedback(false)
    setNotes('')
    setEffectiveness(5)
  }

  const submitFeedback = async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/therapies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          type: activeTherapy.id,
          duration: Math.floor(timer / 60),
          effectiveness: effectiveness,
          notes: notes
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Terapia registrada com sucesso!')
        fetchTherapies()
        resetTherapy()
      } else {
        alert('Erro ao registrar terapia: ' + data.message)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar terapia')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTherapyIcon = (type) => {
    const therapy = therapyTypes.find(t => t.id === type)
    return therapy ? therapy.icon : Heart
  }

  const getTherapyName = (type) => {
    const therapy = therapyTypes.find(t => t.id === type)
    return therapy ? therapy.name : type
  }

  if (activeTherapy) {
    return (
      <div className="space-y-6">
        {/* Active Therapy Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{activeTherapy.name}</h1>
          <p className="text-gray-600 mt-1">{activeTherapy.description}</p>
        </div>

        {/* Timer */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-blue-600">
                {formatTime(timer)}
              </div>
              
              <div className="text-lg text-gray-600">
                Duração recomendada: {activeTherapy.duration} minutos
              </div>
              
              <div className="flex justify-center space-x-4">
                {!isRunning ? (
                  <Button 
                    onClick={resumeTherapy}
                    className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {timer === 0 ? 'Iniciar' : 'Continuar'}
                  </Button>
                ) : (
                  <Button 
                    onClick={pauseTherapy}
                    className="bg-yellow-600 hover:bg-yellow-700 text-lg px-8 py-3"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pausar
                  </Button>
                )}
                
                <Button 
                  onClick={stopTherapy}
                  variant="outline"
                  className="text-lg px-8 py-3"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Finalizar
                </Button>
                
                <Button 
                  onClick={resetTherapy}
                  variant="outline"
                  className="text-lg px-8 py-3"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {activeTherapy.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        {showFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Como foi a terapia?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Efetividade (1-5 estrelas)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setEffectiveness(star)}
                      className={`p-1 ${star <= effectiveness ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="h-8 w-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Como se sentiu? A terapia ajudou com a dor?"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={submitFeedback}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Salvar Sessão
                </Button>
                <Button 
                  onClick={resetTherapy}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Terapias Guiadas</h1>
        <p className="text-gray-600 mt-1">Técnicas não medicamentosas para alívio da dor</p>
      </div>

      {/* Available Therapies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapyTypes.map((therapy) => {
          const IconComponent = therapy.icon
          return (
            <Card key={therapy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconComponent className="h-6 w-6 mr-2 text-blue-600" />
                  {therapy.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{therapy.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {therapy.duration} min
                  </Badge>
                </div>
                
                <Button 
                  onClick={() => startTherapy(therapy)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Terapia
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Sessões Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : therapies.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma sessão registrada</p>
              <p className="text-sm text-gray-400">Comece uma terapia acima para ver seu histórico</p>
            </div>
          ) : (
            <div className="space-y-3">
              {therapies.map((therapy) => {
                const IconComponent = getTherapyIcon(therapy.type)
                return (
                  <div key={therapy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{getTherapyName(therapy.type)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(therapy.completed_at).toLocaleDateString('pt-BR')} • {therapy.duration} min
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {therapy.effectiveness && (
                        <div className="flex items-center">
                          {[...Array(therapy.effectiveness)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Melhores Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Encontre um local calmo e confortável para praticar</p>
            <p>• Use roupas confortáveis que não restrinjam os movimentos</p>
            <p>• Pratique regularmente, mesmo quando não estiver com dor</p>
            <p>• Seja paciente - os benefícios podem levar tempo para aparecer</p>
            <p>• Combine diferentes técnicas para melhores resultados</p>
            <p>• Consulte seu médico se a dor persistir ou piorar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Therapies


