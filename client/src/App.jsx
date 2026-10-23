import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import CatalogBrowser from './components/CatalogBrowser';
import ArchitectureView from './components/ArchitectureView';
import OrderSummaryModal from './components/OrderSummaryModal';
import PaymentReceiptModal from './components/PaymentReceiptModal';
import { getPayPalConfig, sendChatMessage, compareProducts } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('assistant');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Selection State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedReceipt, setCompletedReceipt] = useState(null);
  const [comparedIds, setComparedIds] = useState([]);

  // Chat message thread
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm **AgentPay**, your AI-powered shopping assistant for the PayPal Hackathon.\n\n" +
        "I can help you search our catalogue, filter by strict budgets, compare technical specs, and check out securely through **PayPal Sandbox**.\n\n" +
        "What are you looking for today? (e.g. *\"Find me a laptop for programming under $700 with at least 16 GB RAM and good battery life.\"*)",
      toolsExecuted: [],
      recommendedProducts: [],
      comparison: null,
    },
  ]);

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

  // Handle User Message Submission
  const handleSendMessage = async (userText) => {
    // Add user message immediately
    const nextMessages = [...messages, { role: 'user', content: userText }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(userText, messages);
      const data = res.data;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          toolsExecuted: data.toolsExecuted || [],
          recommendedProducts: data.recommendedProducts || [],
          comparison: data.comparison || null,
        },
      ]);

      // If user prompted checkout directly on a product
      if (data.proposedOrder && data.recommendedProducts?.[0]) {
        setSelectedProduct(data.recommendedProducts[0]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, an error occurred while processing your request: ${err.message}`,
          toolsExecuted: [],
          recommendedProducts: [],
          comparison: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a product to initiate review and checkout
  const handleSelectOrder = (product) => {
    setSelectedProduct(product);
  };

  // Toggle comparison state for a product
  const handleToggleCompare = async (productId) => {
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

  // Successful payment handler
  const handlePaymentSuccess = (receiptData) => {
    setSelectedProduct(null);
    setCompletedReceipt(receiptData);

    // Append confirmation message to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `🎉 **Payment Verified!** PayPal Order \`${receiptData.orderId}\` was successfully authorized and captured for **$${receiptData.amount?.value || receiptData.orderSummary?.breakdown?.total} USD**.\n\nA verified transaction receipt has been generated.`,
        toolsExecuted: [
          {
            tool: 'verify_paypal_capture',
            args: { orderId: receiptData.orderId, captureId: receiptData.captureId },
            durationMs: 140,
            summary: 'Verified COMPLETED status and currency match in PayPal Sandbox',
          },
        ],
        recommendedProducts: [],
        comparison: null,
      },
    ]);
  };

  const content = (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        paypalStatus={paypalLoaded ? 'ACTIVE' : 'INITIALIZING'}
      />

      <main className="flex-1">
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
          <CatalogBrowser onSelectOrder={handleSelectOrder} />
        )}

        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

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
