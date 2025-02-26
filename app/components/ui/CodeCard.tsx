'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const pythonSnippets = [
  `# Data Analysis Example
import pandas as pd
import numpy as np

def analyze_data(df: pd.DataFrame) -> dict:
    results = {
        "mean": df.mean().to_dict(),
        "median": df.median().to_dict(),
        "std": df.std().to_dict()
    }
    return results`,

  `# Machine Learning Pipeline
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

class MLModel:
    def __init__(self):
        self.pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier())
        ])
    
    def train(self, X: np.ndarray, y: np.ndarray):
        self.pipeline.fit(X, y)
        return self.pipeline.score(X, y)`,

  `# API avec FastAPI
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    age: int
    email: str

@app.post("/users/")
async def create_user(user: User):
    try:
        # Save user to database
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400)`,

  `# Gestion de données avec asyncio
import asyncio
import aiohttp
from typing import List, Dict

async def fetch_all_data(urls: List[str]) -> List[Dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_data(session, url)
            for url in urls
        ]
        return await asyncio.gather(*tasks)

async def fetch_data(session, url: str) -> Dict:
    async with session.get(url) as response:
        return await response.json()`
]

const syntaxHighlighting = (code: string) => {
  return code
    .replace(
      /(#.*)|(".*?")|(from\s+[\w.]+\s+import\s+[\w.]+)|(import\s+[\w.]+)|(def\s+\w+)|(class\s+\w+)|(\w+\s*:)|(async\s+def)|(@\w+)|(\b(?:return|try|except|raise|as|for|in|if|else|await)\b)/g,
      (match) => {
        if (match.startsWith('#')) // Commentaires
          return `<span class="text-emerald-500">${match}</span>`
        if (match.startsWith('"')) // Strings
          return `<span class="text-amber-500">${match}</span>`
        if (match.startsWith('from') || match.startsWith('import')) // Imports
          return `<span class="text-cyan-500">${match}</span>`
        if (match.startsWith('def') || match.startsWith('class')) // Définitions
          return `<span class="text-purple-500">${match}</span>`
        if (match.includes(':')) // Types
          return `<span class="text-blue-500">${match}</span>`
        if (match.startsWith('async')) // Async
          return `<span class="text-purple-500">${match}</span>`
        if (match.startsWith('@')) // Decorators
          return `<span class="text-green-500">${match}</span>`
        // Keywords
        return `<span class="text-rose-500">${match}</span>`
      }
    )
}

const CodeCard = () => {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0)
  const [displayedCode, setDisplayedCode] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const animateCode = async () => {
      const currentSnippet = pythonSnippets[currentSnippetIndex]
      
      if (isTyping) {
        if (displayedCode.length < currentSnippet.length) {
          timeout = setTimeout(() => {
            setDisplayedCode(currentSnippet.slice(0, displayedCode.length + 1))
          }, 20)
        } else {
          setTimeout(() => setIsTyping(false), 1500)
        }
      } else {
        if (displayedCode.length > 0) {
          timeout = setTimeout(() => {
            setDisplayedCode(displayedCode.slice(0, -1))
          }, 15)
        } else {
          setCurrentSnippetIndex((prev) => (prev + 1) % pythonSnippets.length)
          setIsTyping(true)
        }
      }
    }
    
    animateCode()
    return () => clearTimeout(timeout)
  }, [displayedCode, isTyping, currentSnippetIndex])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[600px] rounded-xl overflow-hidden shadow-2xl bg-card border border-border"
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-sm text-muted-foreground ml-2">python</span>
      </div>
      
      <div className="p-6 font-mono text-sm">
        <AnimatePresence mode="wait">
          <motion.pre
            key={displayedCode}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="whitespace-pre-wrap break-words"
          >
            <motion.span 
              className="text-slate-200"
              dangerouslySetInnerHTML={{ 
                __html: syntaxHighlighting(displayedCode) 
              }}
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="inline-block w-2 h-4 bg-primary ml-1"
            />
          </motion.pre>
        </AnimatePresence>
      </div>
      
      <div className="px-4 py-3 bg-muted border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            KnowLedger Code Example
          </span>
          <span className="text-xs text-muted-foreground">
            Python {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default CodeCard
