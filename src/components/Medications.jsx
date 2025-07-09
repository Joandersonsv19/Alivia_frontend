import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Clock, 
  Plus, 
  Pill, 
  Bell,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react'

const Medications = ({ userId }) => {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('')
  const [times, setTimes] = useState([''])

  useEffect(() => {
    fetchMedications()
  }, [userId])

  const fetchMedications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/medications?user=...`)
      const data = await response.json()
      
      if (data.success) {
        setMedications(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Por favor, informe o nome do medicamento')
      return
    }
    
    try {
      setSaving(true)
      
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: name.trim(),
          dosage: dosage.trim(),
          frequency: frequency.trim(),
          times: times.filter(time => time.trim())
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Reset form
        setName('')
        setDosage('')
        setFrequency('')
        setTimes([''])
        setShowForm(false)
        
        // Refresh medications
        fetchMedications()
        
        alert('Medicamento adicionado com sucesso!')
      } else {
        alert('Erro ao adicionar medicamento: ' + data.message)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar medicamento')
    } finally {
      setSaving(false)
    }
  }

  const addTimeField = () => {
    setTimes([...times, ''])
  }

  const updateTime = (index, value) => {
    const newTimes = [...times]
    newTimes[index] = value
    setTimes(newTimes)
  }

  const removeTime = (index) => {
    if (times.length > 1) {
      const newTimes = times.filter((_, i) => i !== index)
      setTimes(newTimes)
    }
  }

  const getNextDose = (medicationTimes) => {
    if (!medicationTimes || medicationTimes.length === 0) return null
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    // Convert medication times to minutes
    const timesInMinutes = medicationTimes.map(time => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }).sort((a, b) => a - b)
    
    // Find next dose
    for (const time of timesInMinutes) {
      if (time > currentTime) {
        const hours = Math.floor(time / 60)
        const minutes = time % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
    }
    
    // If no time today, return first time tomorrow
    const firstTime = timesInMinutes[0]
    const hours = Math.floor(firstTime / 60)
    const minutes = firstTime % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} (amanhã)`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus medicamentos e lembretes</p>
        </div>
        
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Medicamento
        </Button>
      </div>

      {/* Add Medication Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Novo Medicamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Medicamento *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Paracetamol"
                    required
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosagem
                  </label>
                  <Input
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Ex: 500mg"
                    className="text-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência
                </label>
                <Input
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="Ex: A cada 8 horas, 2x ao dia"
                  className="text-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horários dos Lembretes
                </label>
                <div className="space-y-2">
                  {times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(index, e.target.value)}
                        className="flex-1"
                      />
                      {times.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTime(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTimeField}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Medicamento
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Medications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : medications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nenhum medicamento cadastrado</p>
              <p className="text-sm text-gray-400 mb-4">
                Adicione seus medicamentos para receber lembretes
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Medicamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          medications.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold">{medication.name}</h3>
                      {medication.active && (
                        <Badge className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      )}
                    </div>
                    
                    {medication.dosage && (
                      <p className="text-gray-600 mb-1">
                        <strong>Dosagem:</strong> {medication.dosage}
                      </p>
                    )}
                    
                    {medication.frequency && (
                      <p className="text-gray-600 mb-3">
                        <strong>Frequência:</strong> {medication.frequency}
                      </p>
                    )}
                    
                    {medication.times && medication.times.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Horários dos Lembretes:
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {medication.times.map((time, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              <Clock className="h-3 w-3 mr-1" />
                              {time}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Next Dose */}
                        {(() => {
                          const nextDose = getNextDose(medication.times)
                          return nextDose && (
                            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                              <Bell className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-800">
                                <strong>Próxima dose:</strong> {nextDose}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reminder Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Sobre os Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Os lembretes são calculados automaticamente baseados nos horários configurados</p>
            <p>• Para receber notificações no seu dispositivo, permita notificações do navegador</p>
            <p>• Você pode usar o Modo Voz para lembrar de tomar medicamentos</p>
            <p>• Sempre consulte seu médico antes de alterar medicamentos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Medications


