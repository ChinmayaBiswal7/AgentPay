import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowUp,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Laptop,
  Headphones,
  Monitor,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from './ProductCard';
import ComparisonView from './ComparisonView';

const QUICK_PROMPTS = [
  {
    icon: Laptop,
    title: 'Programming Laptop',
    desc: 'Under $700, 16GB RAM & good battery',
    prompt: 'Find me a laptop for programming under $700 with at least 16 GB RAM and good battery life.',
  },
  {
    icon: Headphones,
    title: 'Focus Headphones',
    desc: 'Noise-cancelling under $250',
    prompt: 'Best wireless noise-cancelling headphones under $250 for focus',
  },
  {
    icon: Monitor,
    title: 'Coding Monitor',
    desc: '4K with USB-C Hub & docking',
    prompt: 'Compare 4K monitors with USB-C docking for developer desk',
  },
  {
    icon: Keyboard,
    title: 'Ergonomic Desk',
    desc: 'Mechanical keyboard & mouse under $120',
    prompt: 'Show me mechanical keyboards and ergonomic accessories under $120',
  },
];

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onSelectOrder,
  onToggleCompare,
  comparedIds,
}) {
  const [inputValue, setInputValue] = useState('');
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text to Speech (Voice Output)
  const toggleSpeech = (text, index) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for natural voice reading
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Voice Input)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handlePromptClick = (promptText) => {
    if (isLoading) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    onSendMessage(promptText);
  };

  const isInitialState = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto px-4 py-4 sm:px-6">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        {/* Sleek Minimalist Hero (Only on Initial State) */}
        {isInitialState && (
          <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-xl shadow-blue-500/20 text-white">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What are you shopping for?
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Describe your requirements or talk naturally with voice. AgentPay searches live products, compares specs, and prepares PayPal checkout.
              </p>
            </div>

            {/* Quick Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left pt-2">
              {QUICK_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(item.prompt)}
                    disabled={isLoading}
                    className="p-3.5 rounded-2xl bg-[#111622]/90 hover:bg-[#161D2E] border border-slate-800/80 hover:border-blue-500/40 text-left transition-all duration-200 group flex items-start space-x-3 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="p-2 rounded-xl bg-slate-800/80 group-hover:bg-blue-600/20 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {!isInitialState && (
          <div className="space-y-6 pt-2">
            {messages.slice(1).map((msg, index) => (
              <div key={index} className="space-y-3 animate-in fade-in duration-200">
                {/* User Message */}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-md sm:max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-blue-600 text-white text-sm shadow-md leading-relaxed font-medium">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {msg.role === 'assistant' && (
                  <div className="flex items-start space-x-3 text-sm group">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-3 max-w-full">
                      {/* Assistant Text with clean markdown rendering */}
                      <div className="text-slate-200 leading-relaxed space-y-2 prose-sm prose-invert">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 leading-relaxed text-slate-300">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                            ul: ({ children }) => <ul className="space-y-1 list-disc pl-4 text-slate-300">{children}</ul>,
                            li: ({ children }) => <li className="text-slate-300">{children}</li>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Text to Speech Read Aloud Button */}
                      <div className="flex items-center space-x-2 pt-0.5">
                        <button
                          onClick={() => toggleSpeech(msg.content, index)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            speakingIndex === index
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                          title={speakingIndex === index ? 'Stop speaking' : 'Read aloud with voice'}
                        >
                          {speakingIndex === index ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Recommended Products Grid */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="space-y-2.5 pt-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
                              Top Live Matches ({msg.recommendedProducts.length})
                            </span>
                            <span className="text-[11px] text-sky-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Grounded & verified</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {msg.recommendedProducts.map((p) => (
                              <ProductCard
                                key={p.id}
                                product={p}
                                onSelectOrder={onSelectOrder}
                                onToggleCompare={onToggleCompare}
                                isCompared={comparedIds?.includes(p.id)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comparison Table */}
                      {msg.comparison && (
                        <ComparisonView
                          comparison={msg.comparison}
                          onSelectOrder={onSelectOrder}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching live Google Shopping, filtering constraints & comparing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Modern Prompt Input with Voice Mic */}
      <div className="pt-2">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-[#111622] border border-slate-800 focus-within:border-blue-500/80 rounded-2xl shadow-xl transition-all p-1.5"
        >
          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all mr-1 ${
              isListening
                ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to talk / speech-to-text'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? 'Listening to your voice...' : 'Ask anything or talk with voice, e.g. Find me running shoes...'}
            disabled={isLoading}
            className="flex-1 bg-transparent px-2.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0"
            title="Send"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 mt-1.5">
          <span>Voice enabled • Live Google Shopping • PayPal Sandbox Orders v2</span>
          <span>USD Currency</span>
        </div>
      </div>
    </div>
  );
}
