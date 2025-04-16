"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { BookOpen, Sparkles, PenTool, BookText, Layers, Lightbulb } from "lucide-react"

interface WelcomeAnimationProps {
  onBegin: () => void
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onBegin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="relative w-full max-w-2xl mx-auto text-center px-6">
        {/* Floating papers animation - keeping this animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${6 + Math.random() * 10}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.1 + Math.random() * 0.2,
              }}
            >
              <div
                className="w-16 h-20 bg-purple-200 rounded-sm"
                style={{
                  transform: `rotate(${Math.random() * 30 - 15}deg)`,
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Main content - without animations */}
        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-600 blur-xl opacity-20"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-800 rounded-full 
                  flex items-center justify-center">
                <Layers className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
              from-purple-600 to-purple-800 mb-4">
            Welcome to Your Content Creation Journey
          </h1>

          <p className="text-gray-600 text-xl max-w-xl mx-auto mb-8">
            Transform your ideas into beautifully crafted content with our AI-powered platform
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <Lightbulb className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Ideate</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <PenTool className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Create</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Customize</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                <BookText className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium">Publish</span>
            </div>
          </div>

          <button
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 
              text-white px-8 py-6 h-auto text-lg rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-300"
            onClick={onBegin}
          >
            Let's Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeAnimation