import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProfileModal from './components/ProfileModal';
import ChatInterface from './components/ChatInterface';
import CatalogBrowser from './components/CatalogBrowser';
import ArchitectureView from './components/ArchitectureView';
import OrderSummaryModal from './components/OrderSummaryModal';
import PaymentReceiptModal from './components/PaymentReceiptModal';
import { getPayPalConfig, sendChatMessage } from './services/api';

const DEFAULT_WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hello! I'm **AgentPay**, your AI shopping assistant.\n\n" +
    "Describe what you're looking for, or try one of the suggestions below. I'll search real products, compare specs, and prepare your PayPal checkout.",
  toolsExecuted: [],
  recommendedProducts: [],
  comparison: null,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sidebar & Profile Modal State
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('agentpay_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Save sidebar preference
  useEffect(() => {
    try {
      localStorage.setItem('agentpay_sidebar_open', JSON.stringify(isSidebarOpen));
    } catch (e) {
      console.error(e);
    }
  }, [isSidebarOpen]);

  // Chat Sessions History (persisted in localStorage)
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('agentpay_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return `session_${Date.now()}`;
  });

  // Current chat messages thread
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);

  // Buyer Purchase History (persisted in localStorage)
  const [purchaseHistory, setPurchaseHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('agentpay_purchases');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Selection State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [comparedIds, setComparedIds] = useState([]);

  // Load PayPal Public Client ID on startup
  useEffect(() => {
    async function initPayPal() {
      try {
        const config = await getPayPalConfig();
        if (config && config.clientId) {
          setPaypalClientId(config.clientId);
          setPaypalLoaded(true);
        }
      } catch (err) {
        console.error('Failed to load PayPal config:', err);
      }
    }
    initPayPal();
  }, []);

  // Save sessions to localStorage whenever sessions state changes
  useEffect(() => {
    try {
      localStorage.setItem('agentpay_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  // Save purchase history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agentpay_purchases', JSON.stringify(purchaseHistory));
    } catch (e) {
      console.error(e);
    }
  }, [purchaseHistory]);

  // Handle New Chat Session
  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    setActiveSessionId(newId);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setActiveTab('assistant');
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // Switch to a previous session
  const handleSelectSession = (sessionId) => {
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setActiveSessionId(sessionId);
      setMessages(found.messages || [DEFAULT_WELCOME_MESSAGE]);
      setActiveTab('assistant');
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  // Delete a previous session
  const handleDeleteSession = (sessionId) => {
    const nextSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(nextSessions);
    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  // Handle User Message Submission
  const handleSendMessage = async (userText) => {
    const nextMessages = [...messages, { role: 'user', content: userText }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(userText, messages);
      const data = res.data;

      const assistantMsg = {
        role: 'assistant',
        content: data.message,
        toolsExecuted: data.toolsExecuted || [],
        recommendedProducts: data.recommendedProducts || [],
        comparison: data.comparison || null,
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);

      // Auto-save or update session in sessions history
      setSessions((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === activeSessionId);
        const title = userText.slice(0, 32) + (userText.length > 32 ? '...' : '');

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            title: updated[existingIdx].title || title,
            messages: finalMessages,
            updatedAt: Date.now(),
          };
          return updated;
        } else {
          return [
            {
              id: activeSessionId,
              title,
              messages: finalMessages,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...prev,
          ];
        }
      });

      // If checkout proposed
      if (data.proposedOrder && data.recommendedProducts?.[0]) {
        setSelectedProduct(data.recommendedProducts[0]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, an error occurred while searching: ${err.message}`,
          toolsExecuted: [],
          recommendedProducts: [],
          comparison: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrder = (product) => {
    setSelectedProduct(product);
  };

  const handleToggleCompare = (productId) => {
    let next;
    if (comparedIds.includes(productId)) {
      next = comparedIds.filter((id) => id !== productId);
    } else {
      if (comparedIds.length >= 3) {
        alert('You can compare up to 3 products simultaneously.');
        return;
      }
      next = [...comparedIds, productId];
    }
    setComparedIds(next);
  };

  // Successful payment handler: saves to verified purchase history
  const handlePaymentSuccess = (receiptData) => {
    setSelectedProduct(null);
    setCompletedReceipt(receiptData);

    // Save to purchase history
    setPurchaseHistory((prev) => [receiptData, ...prev]);

    // Append confirmation to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `🎉 **Order Confirmed & Verified!**\n\nYour payment for **$${receiptData.amount?.value || receiptData.orderSummary?.breakdown?.total} USD** was successfully captured by PayPal Sandbox.\n\n• **PayPal Order ID:** \`${receiptData.orderId}\`\n• **Capture ID:** \`${receiptData.captureId || 'N/A'}\`\n\nThis order has been saved to your **Profile & Order History**.`,
        toolsExecuted: [],
        recommendedProducts: [],
        comparison: null,
      },
    ]);
  };

  const content = (
    <div className="flex h-screen bg-[#090D14] overflow-hidden text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onOpenProfile={() => setIsProfileOpen(true)}
        orderCount={purchaseHistory.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onOpenProfile={() => setIsProfileOpen(true)}
          orderCount={purchaseHistory.length}
        />

        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'assistant' && (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onSelectOrder={handleSelectOrder}
              onToggleCompare={handleToggleCompare}
              comparedIds={comparedIds}
            />
          )}

          {activeTab === 'catalog' && (
            <div className="h-full overflow-y-auto">
              <CatalogBrowser onSelectOrder={handleSelectOrder} />
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="h-full overflow-y-auto">
              <ArchitectureView />
            </div>
          )}
        </main>
      </div>

      {/* Buyer Profile & Order History Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        purchaseHistory={purchaseHistory}
        onViewReceipt={(order) => setCompletedReceipt(order)}
      />

      {/* Order Review & PayPal Checkout Modal */}
      {selectedProduct && (
        <OrderSummaryModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Verified Payment Receipt Modal */}
      {completedReceipt && (
        <PaymentReceiptModal
          receipt={completedReceipt}
          onClose={() => setCompletedReceipt(null)}
        />
      )}
    </div>
  );

  if (!paypalClientId) {
    return content;
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': paypalClientId,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      {content}
    </PayPalScriptProvider>
  );
}
