"use client";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar";

const ChatBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`p-4 rounded-2xl max-w-[80%] ${
          isUser
            ? "bg-gradient-to-r from-[#2F86A6] to-[#34BE82] text-white"
            : "bg-white/80 border border-[#3341551a] text-[#0F172A]"
        } shadow-lg`}
      >
        {isUser ? (
          <p>{message}</p>
        ) : (
          <div className="space-y-2">
            <p className="whitespace-pre-wrap">{message.answer}</p>
            
            {/* Display suggestions if available */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#3341551a]">
                <p className="text-sm font-medium mb-2 text-[#2F86A6]">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => window.dispatchEvent(new CustomEvent('suggest', { detail: suggestion }))}
                      className="text-xs bg-[#2F86A6]/10 hover:bg-[#2F86A6]/20 text-[#2F86A6] py-1 px-2 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show extracted category and month if available */}
            {message.extracted_details && (
              <div className="mt-3 text-xs text-[#64748B] italic">
                {message.extracted_details.category && (
                  <span className="mr-2">
                    Category: <span className="font-medium">{message.extracted_details.category}</span>
                  </span>
                )}
                {message.extracted_details.month && (
                  <span>
                    Month: <span className="font-medium">{message.extracted_details.month}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  // Default welcome message
  const welcomeMessage = {
    answer: "Hi there! I'm your expense assistant. You can ask me questions like:\n\n• How much did I spend on food this month?\n• Show me my transport expenses in July\n• What was my biggest healthcare expense?",
    suggestions: [
      "How much did I spend on food this month?",
      "What was my biggest expense in 2024?",
      "Show my transport costs"
    ]
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        // Add welcome message when user is authenticated
        if (messages.length === 0) {
          setMessages([
            { text: welcomeMessage, isUser: false }
          ]);
        }
      } else {
        setUserId(null);
        router.push('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Listen for suggestion clicks
  useEffect(() => {
    const handleSuggestion = (e) => {
      setInputValue(e.detail);
    };

    window.addEventListener('suggest', handleSuggestion);
    return () => {
      window.removeEventListener('suggest', handleSuggestion);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || !userId) return;
    
    const userQuestion = inputValue.trim();
    setMessages(prev => [...prev, { text: userQuestion, isUser: true }]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Set up timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Call the backend API
      const response = await fetch(
        `http://127.0.0.1:8000/chatbot/chat?question=${encodeURIComponent(userQuestion)}&user_id=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        }
      );
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Check if there's an error in the response
      if (data.detail) {
        throw new Error(data.detail);
      }
      setMessages(prev => [...prev, { text: data, isUser: false }]);
    } catch (error) {
      console.error("Error asking question:", error);
      
      let errorMessage = "Sorry, I couldn't process your question. Please try again.";
      
      if (error.name === 'AbortError') {
        errorMessage = "The request timed out. Please check your connection and try again.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = "Couldn't connect to the server. Please make sure the backend is running.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      setMessages(prev => [
        ...prev, 
        { 
          text: {
            answer: errorMessage,
            suggestions: [
              "How much did I spend on food this month?",
              "Show my transport costs this month",
              "What were my healthcare expenses?"
            ]
          }, 
          isUser: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-[#2F86A6] via-[#34BE82] to-[#2FDD92] bg-clip-text mb-2 tracking-tight">
          Expense Assistant
        </h1>
        <p className="text-lg text-[#334155] font-medium mb-2">
          Ask questions about your expenses and get insights
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setInputValue("How much did I spend on food this month?")}
            className="text-sm bg-[#2F86A6]/10 hover:bg-[#2F86A6]/20 text-[#2F86A6] py-1 px-3 rounded-full transition-colors"
          >
            Food expenses
          </button>
          <button 
            onClick={() => setInputValue("Show my transport costs this month")}
            className="text-sm bg-[#2F86A6]/10 hover:bg-[#2F86A6]/20 text-[#2F86A6] py-1 px-3 rounded-full transition-colors"
          >
            Transport costs
          </button>
          <button 
            onClick={() => setInputValue("What were my biggest expenses this month?")}
            className="text-sm bg-[#2F86A6]/10 hover:bg-[#2F86A6]/20 text-[#2F86A6] py-1 px-3 rounded-full transition-colors"
          >
            Biggest expenses
          </button>
        </div>
        
        {/* Chat container */}
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-[#3341551a] h-[60vh] flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message, index) => (
              <ChatBubble 
                key={index} 
                message={message.text} 
                isUser={message.isUser} 
              />
            ))}
            <div ref={messagesEndRef} />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white/80 border border-[#3341551a] p-4 rounded-2xl shadow-lg max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-[#2F86A6] animate-pulse"></div>
                    <div className="w-3 h-3 rounded-full bg-[#2F86A6] animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-3 h-3 rounded-full bg-[#2F86A6] animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <span className="text-sm text-[#64748B] ml-1">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t border-[#3341551a]">
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your expenses (e.g., How much did I spend on food this month?)"
                className="flex-1 p-4 rounded-l-xl border border-[#3341551a] focus:outline-none focus:ring-2 focus:ring-[#2F86A6]"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-[#2F86A6] to-[#34BE82] text-white p-4 rounded-r-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={isLoading || !inputValue.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        
        {/* Tips section */}
        <div className="mt-8 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-[#3341551a] p-6">
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Tips for better results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-[#2F86A6]">Try asking about:</h3>
              <ul className="list-disc pl-5 text-[#334155] space-y-1">
                <li>Spending in specific categories (food, transport, etc.)</li>
                <li>Expenses in a specific month or time period</li>
                <li>Comparing expenses between categories</li>
                <li>Your biggest expenses in a category</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-[#2F86A6]">Examples:</h3>
              <ul className="list-disc pl-5 text-[#334155] space-y-1">
                <li>"How much did I spend on food in July?"</li>
                <li>"What was my largest healthcare expense this month?"</li>
                <li>"Compare my transport and food expenses"</li>
                <li>"Show me all entertainment costs from last month"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}