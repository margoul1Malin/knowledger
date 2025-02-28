'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ContactForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    content: ''
  })
  const [errors, setErrors] = useState({
    subject: '',
    content: ''
  })

  const validateForm = () => {
    const newErrors = {
      subject: '',
      content: ''
    }
    let isValid = true

    if (formData.subject.length < 3) {
      newErrors.subject = 'Le sujet doit contenir au moins 3 caractères'
      isValid = false
    }

    if (formData.content.length < 10) {
      newErrors.content = 'Le message doit contenir au moins 10 caractères'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setShowSuccess(false)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      setShowSuccess(true)
      toast({
        title: "Message envoyé avec succès !",
        description: (
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Nous vous répondrons dans les plus brefs délais.</span>
          </div>
        ),
      })

      setFormData({ subject: '', content: '' })
      router.refresh()

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      toast({
        title: "Erreur",
        description: (
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Une erreur est survenue lors de l'envoi du message.</span>
          </div>
        ),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Votre message a été envoyé avec succès !</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        onSubmit={onSubmit} 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Sujet
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`w-full p-3 rounded-md border transition-colors duration-200 
              ${errors.subject ? 'border-red-500 bg-red-50/10' : 'border-input bg-background'}
              focus:border-primary focus:ring-1 focus:ring-primary`}
            placeholder="Le sujet de votre message"
          />
          {errors.subject && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mt-1 text-sm text-red-500 flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.subject}
            </motion.p>
          )}
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className={`w-full p-3 rounded-md border transition-colors duration-200
              ${errors.content ? 'border-red-500 bg-red-50/10' : 'border-input bg-background'}
              focus:border-primary focus:ring-1 focus:ring-primary resize-none`}
            placeholder="Votre message..."
          />
          {errors.content && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="mt-1 text-sm text-red-500 flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.content}
            </motion.p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Envoi en cours...
              </span>
            ) : "Envoyer le message"}
          </Button>
        </motion.div>
      </motion.form>
    </>
  )
} 