import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Heart,
  Activity,
  Clock,
  Download,
  Share
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const CaregiverMode = ({ userId }) => {
  const [painData, setPainData] = useState([])
  const [therapyData, setTherapyData] = useState([])
  const [medicationData, setMedicationData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)

  useEffect(() => {
    fetchCaregiverData()
  }, [userId, timeRange])

  const fetchCaregiverData = async () => {
    try {
      setLoading(true)
      
      // Fetch pain trends
      const painResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/pain-trends`)
      const painResult = await painResponse.json()
      
      if (painResult.success) {
        setPainData(painResult.data)
      }
      
      // Fetch therapies
      const therapyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/therapies`)
      const therapyResult = await therapyResponse.json()
      
      if (therapyResult.success) {
        setTherapyData(therapyResult.data)
      }
      
      // Fetch medications
      const medResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/medications`)
      const medResult = await medResponse.json()
      
      if (medResult.success) {
        setMedicationData(medResult.data)
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do cuidador:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAverageIntensity = () => {
    if (painData.length === 0) return 0
    const total = painData.reduce((sum, day) => sum + day.average_intensity, 0)
    return (total / painData.length).toFixed(1)
  }

  const getHighPainDays = () => {
    return painData.filter(day => day.average_intensity >= 7).length
  }

  const getTherapyFrequency = () => {
    const therapyTypes = {}
    therapyData.forEach(therapy => {
      therapyTypes[therapy.type] = (therapyTypes[therapy.type] || 0) + 1
    })
    
    return Object.entries(therapyTypes).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }))
  }

  const getRecentAlerts = () => {
    const alerts = []
    
    // High pain alerts
    const recentHighPain = painData.filter(day => 
      day.average_intensity >= 8 && 
      new Date(day.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    
    recentHighPain.forEach(day => {
      alerts.push({
        type: 'high_pain',
        message: `Dor intensa registrada (${day.average_intensity}/10)`,
        date: day.date,
        severity: 'high'
      })
    })
    
    // Low therapy activity
    const recentTherapies = therapyData.filter(therapy => 
      new Date(therapy.completed_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )
    
    if (recentTherapies.length < 3) {
      alerts.push({
        type: 'low_therapy',
        message: 'Poucas terapias realizadas esta semana',
        date: new Date().toISOString().split('T')[0],
        severity: 'medium'
      })
    }
    
    return alerts.slice(0, 5) // Limit to 5 most recent alerts
  }

  const generateReport = () => {
    const report = {
      period: `${timeRange} dias`,
      generated_at: new Date().toISOString(),
      patient_id: userId,
      summary: {
        average_pain: getAverageIntensity(),
        high_pain_days: getHighPainDays(),
        total_therapies: therapyData.length,
        active_medications: medicationData.filter(med => med.active).length
      },
      pain_data: painData,
      therapy_data: therapyData,
      medications: medicationData,
      alerts: getRecentAlerts()
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-alivia-${userId}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modo Cuidador</h1>
          <p className="text-gray-600 mt-1">Acompanhe o bem-estar do paciente</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          
          <Button 
            onClick={generateReport}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dor Média</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageIntensity()}/10</div>
            <p className="text-xs text-muted-foreground">
              Últimos {timeRange} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias de Dor Alta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getHighPainDays()}</div>
            <p className="text-xs text-muted-foreground">
              Intensidade ≥ 7
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terapias Realizadas</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{therapyData.length}</div>
            <p className="text-xs text-muted-foreground">
              Sessões completas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicationData.filter(med => med.active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Em uso atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pain Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Tendência da Dor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {painData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={painData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                  formatter={(value, name) => [
                    `${value}/10`,
                    name === 'average_intensity' ? 'Dor Média' : 
                    name === 'max_intensity' ? 'Dor Máxima' : 'Dor Mínima'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="average_intensity" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="average_intensity"
                />
                <Line 
                  type="monotone" 
                  dataKey="max_intensity" 
                  stroke="#EF4444" 
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="max_intensity"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum dado de dor disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Therapy Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Frequência de Terapias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getTherapyFrequency().length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getTherapyFrequency()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma terapia registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentAlerts().length > 0 ? (
                getRecentAlerts().map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-500' : 
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        alert.severity === 'high' ? 'border-red-500 text-red-500' : 
                        alert.severity === 'medium' ? 'border-yellow-500 text-yellow-500' : 
                        'border-blue-500 text-blue-500'
                      }
                    >
                      {alert.severity === 'high' ? 'Alto' : 
                       alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum alerta recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Medicamentos Atuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicationData.filter(med => med.active).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicationData.filter(med => med.active).map((medication) => (
                <div key={medication.id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold">{medication.name}</h4>
                  {medication.dosage && (
                    <p className="text-sm text-gray-600">Dosagem: {medication.dosage}</p>
                  )}
                  {medication.frequency && (
                    <p className="text-sm text-gray-600">Frequência: {medication.frequency}</p>
                  )}
                  {medication.times && medication.times.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Horários:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medication.times.map((time, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Nenhum medicamento ativo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Informações para Cuidadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Este painel permite acompanhar o progresso e bem-estar do paciente</p>
            <p>• Fique atento a dias consecutivos com dor alta (≥7) - considere contato médico</p>
            <p>• Incentive a prática regular de terapias não medicamentosas</p>
            <p>• Monitore a adesão aos medicamentos através dos horários configurados</p>
            <p>• Use o relatório para compartilhar informações com profissionais de saúde</p>
            <p>• Em caso de emergência, procure atendimento médico imediatamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CaregiverMode


