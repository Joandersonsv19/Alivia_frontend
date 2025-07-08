import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  MessageCircle,
  Activity,
  Calendar,
  Heart,
  Clock
} from 'lucide-react'

const VoiceMode = ({ userId, onNavigate }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversation, setConversation] = useState([])
  const [speechSupported, setSpeechSupported] = useState(false)
  
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true)
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'pt-BR'
      
      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1]
        if (lastResult.isFinal) {
          const spokenText = lastResult[0].transcript
          setTranscript(spokenText)
          processVoiceCommand(spokenText)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setResponse('Desculpe, não consegui entender. Tente novamente.')
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
    
    // Add welcome message
    setConversation([{
      type: 'assistant',
      message: 'Olá! Eu sou a AlivIA. Você pode falar comigo sobre sua dor, medicamentos ou terapias. Como posso ajudar?',
      timestamp: new Date()
    }])
    
    // Speak welcome message
    speakText('Olá! Eu sou a AlivIA. Como posso ajudar você hoje?')
  }, [])

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true)
      setTranscript('')
      setResponse('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const speakText = (text) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      utterance.pitch = 1
      
      synthRef.current.speak(utterance)
    }
  }

  const processVoiceCommand = async (command) => {
    setIsProcessing(true)
    
    // Add user message to conversation
    const userMessage = {
      type: 'user',
      message: command,
      timestamp: new Date()
    }
    setConversation(prev => [...prev, userMessage])
    
    try {
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command,
          user_id: userId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResponse(data.message)
        speakText(data.message)
        
        // Add assistant response to conversation
        const assistantMessage = {
          type: 'assistant',
          message: data.message,
          action: data.action,
          timestamp: new Date()
        }
        setConversation(prev => [...prev, assistantMessage])
        
        // Handle navigation based on action
        if (data.action === 'medication_reminder') {
          setTimeout(() => onNavigate('medications'), 2000)
        } else if (data.action === 'therapy_suggestion') {
          setTimeout(() => onNavigate('therapies'), 2000)
        }
      } else {
        const errorMessage = 'Desculpe, não consegui processar seu comando.'
        setResponse(errorMessage)
        speakText(errorMessage)
      }
    } catch (error) {
      console.error('Erro ao processar comando:', error)
      const errorMessage = 'Desculpe, ocorreu um erro. Tente novamente.'
      setResponse(errorMessage)
      speakText(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const quickCommands = [
    { text: 'Estou com dor forte', icon: Activity },
    { text: 'Lembrar medicamento', icon: Clock },
    { text: 'Quero fazer terapia', icon: Heart },
    { text: 'Ver meu histórico', icon: Calendar }
  ]

  const handleQuickCommand = (commandText) => {
    setTranscript(commandText)
    processVoiceCommand(commandText)
  }

  if (!speechSupported) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <MicOff className="h-5 w-5 mr-2" />
              Modo Voz Não Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Seu navegador não suporta reconhecimento de voz. 
              Tente usar o Chrome ou Edge para uma melhor experiência.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Modo Voz</h1>
        <p className="text-gray-600 mt-1">Fale comigo sobre sua dor e bem-estar</p>
      </div>

      {/* Voice Control */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${
              isListening ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
            }`}>
              {isListening ? (
                <Mic className="h-12 w-12 text-red-600" />
              ) : (
                <Mic className="h-12 w-12 text-blue-600" />
              )}
            </div>
            
            <div>
              {isListening ? (
                <Button 
                  onClick={stopListening}
                  className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                >
                  <MicOff className="h-5 w-5 mr-2" />
                  Parar de Escutar
                </Button>
              ) : (
                <Button 
                  onClick={startListening}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processando...' : 'Falar com AlivIA'}
                </Button>
              )}
            </div>
            
            {isListening && (
              <div className="text-center">
                <Badge variant="outline" className="text-red-600 border-red-600">
                  🔴 Escutando...
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  Fale agora. Diga algo como "Estou com dor forte" ou "Lembrar medicamento"
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comandos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickCommands.map((command, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleQuickCommand(command.text)}
                disabled={isProcessing || isListening}
                className="justify-start text-left h-auto py-3 px-4"
              >
                <command.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>{command.text}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="h-5 w-5 mr-2" />
            Conversa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">AlivIA está pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar o Modo Voz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Clique em "Falar com AlivIA" e aguarde o microfone ficar vermelho</p>
            <p>• Fale claramente sobre sua dor, medicamentos ou terapias</p>
            <p>• Exemplos: "Estou com dor forte", "Lembrar medicamento", "Quero fazer terapia"</p>
            <p>• A AlivIA irá responder por voz e pode navegar para outras seções</p>
            <p>• Use os comandos rápidos se preferir não falar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VoiceMode

