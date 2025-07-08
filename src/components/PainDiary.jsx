import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { 
  Calendar, 
  MapPin, 
  Save, 
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react'

const PainDiary = ({ userId }) => {
  const [painEntries, setPainEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [intensity, setIntensity] = useState([5])
  const [location, setLocation] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchPainEntries()
  }, [userId])

  const fetchPainEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pain-entries?user_id=${userId}&days=30`)
      const data = await response.json()
      
      if (data.success) {
        setPainEntries(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const response = await fetch('/api/pain-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          intensity: intensity[0],
          location: location.split(',').map(l => l.trim()).filter(l => l),
          symptoms,
          notes,
          timestamp: new Date().toISOString()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Reset form
        setIntensity([5])
        setLocation('')
        setSymptoms('')
        setNotes('')
        
        // Refresh entries
        fetchPainEntries()
        
        alert('Registro salvo com sucesso!')
      } else {
        alert('Erro ao salvar registro: ' + data.message)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar registro')
    } finally {
      setSaving(false)
    }
  }

  const getPainColor = (intensity) => {
    if (intensity <= 3) return 'bg-green-100 text-green-800'
    if (intensity <= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPainLabel = (intensity) => {
    if (intensity <= 3) return 'Leve'
    if (intensity <= 6) return 'Moderada'
    return 'Intensa'
  }

  const getIntensityColor = (value) => {
    if (value <= 3) return 'text-green-600'
    if (value <= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Diário da Dor</h1>
        <p className="text-gray-600 mt-1">Registre e acompanhe sua dor diariamente</p>
      </div>

      {/* New Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Novo Registro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pain Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Intensidade da Dor: <span className={`text-2xl font-bold ${getIntensityColor(intensity[0])}`}>{intensity[0]}/10</span>
              </label>
              <div className="px-3">
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0 - Sem dor</span>
                  <span>5 - Moderada</span>
                  <span>10 - Insuportável</span>
                </div>
              </div>
            </div>

            {/* Pain Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização da Dor
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: cabeça, costas, joelho direito..."
                className="text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separe múltiplas localizações com vírgula
              </p>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sintomas Associados
              </label>
              <Input
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ex: náusea, tontura, formigamento..."
                className="text-lg"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva como se sente, o que pode ter causado a dor, etc."
                rows={3}
                className="text-lg"
              />
            </div>

            <Button 
              type="submit" 
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
            >
              {saving ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Registro
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Registros Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : painEntries.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum registro encontrado</p>
              <p className="text-sm text-gray-400">Faça seu primeiro registro acima</p>
            </div>
          ) : (
            <div className="space-y-4">
              {painEntries.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getPainColor(entry.intensity)}>
                          {entry.intensity}/10 - {getPainLabel(entry.intensity)}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(entry.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      
                      {entry.location && entry.location.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {entry.location.join(', ')}
                        </div>
                      )}
                      
                      {entry.symptoms && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Sintomas:</strong> {entry.symptoms}
                        </p>
                      )}
                      
                      {entry.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>Observações:</strong> {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default PainDiary

