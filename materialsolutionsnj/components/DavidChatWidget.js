import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DavidAvatar from './DavidAvatar'

const CHAT_RESPONSES = {
  hello: "Hey there! 👋 I'm David. How can I help you find the perfect forklift today?",
  pricing: "Our forklifts range from $8,000 to $45,000 depending on capacity and condition. What's your budget range? I can show you the best options.",
  inventory: "We have 50+ forklifts in stock! We specialize in Raymond, Toyota, and Crown. What capacity do you need?",
  financing: "We offer flexible financing options! Up to 60 months with competitive rates. Want me to run some numbers for you?",
  service: "Full service and repair available! OSHA certified technicians, same-day emergency service. Need maintenance on your existing fleet?",
  default: "I'm here to help! Ask me about our inventory, pricing, financing, or any forklift needs. What are you looking for today?"
}

function getResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('hi') || lower.includes('hey') || lower.includes('hello')) return CHAT_RESPONSES.hello
  if (lower.includes('price') || lower.includes('cost') || lower.includes('cost')) return CHAT_RESPONSES.pricing
  if (lower.includes('inventory') || lower.includes('stock') || lower.includes('available')) return CHAT_RESPONSES.inventory
  if (lower.includes('finance') || lower.includes('payment') || lower.includes('lease')) return CHAT_RESPONSES.financing
  if (lower.includes('service') || lower.includes('repair') || lower.includes('maintenance')) return CHAT_RESPONSES.service
  return CHAT_RESPONSES.default
}

export default function DavidChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'david', text: CHAT_RESPONSES.hello }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = { role: 'david', text: getResponse(input) }
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <>
      {/* Chat button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 8px 32px rgba(245, 158, 11, 0.4)',
            '0 8px 48px rgba(245, 158, 11, 0.6)',
            '0 8px 32px rgba(245, 158, 11, 0.4)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="relative">
          <DavidAvatar size="small" />
          {/* Notification dot */}
          {!isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(8, 11, 16, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 158, 11, 0.1)'
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.1))',
                borderBottom: '1px solid rgba(245, 158, 11, 0.2)'
              }}
            >
              <DavidAvatar size="small" />
              <div>
                <div className="font-bold text-amber-400">David AI</div>
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Online now
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'david' && (
                    <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 overflow-hidden">
                      <DavidAvatar size="small" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-black rounded-br-md'
                        : 'bg-gray-800 text-white rounded-bl-md'
                    }`}
                    style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #F59E0B, #EA580C)' } : {}}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full mr-2 flex-shrink-0 overflow-hidden">
                    <DavidAvatar size="small" />
                  </div>
                  <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4" style={{ borderTop: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask David anything..."
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 rounded-xl font-semibold text-black transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
