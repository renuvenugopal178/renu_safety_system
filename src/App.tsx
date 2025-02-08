import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Mic, MicOff, Bell, Settings, Volume2, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';

// List of trigger words that will activate the alert
const TRIGGER_WORDS = ['help', 'danger', 'emergency'];

// EmailJS configuration
emailjs.init("sOrSscoNK1zqYDgrB"); // Replace with your EmailJS public key

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [alert, setAlert] = useState(false);
  const [permission, setPermission] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        setPermission(perm === 'granted');
      });
    }
  }, []);

  const sendEmergencyEmail = async (triggerWord: string) => {
    setEmailStatus('sending');
    try {
      await emailjs.send(
        "service_86k7lb9", // Replace with your EmailJS service ID
        "template_d3iqsl7", // Replace with your EmailJS template ID
        {
          trigger_word: triggerWord,
          timestamp: new Date().toLocaleString(),
          location: "User's location would be here in production",
          message: `Emergency alert triggered by voice command: "${triggerWord}"`,
          to_email: "renukavenugopal08@gmail.com" // Replace with recipient email
        }
      );
      setEmailStatus('sent');
    } catch (error) {
      console.error('Failed to send email:', error);
      setEmailStatus('error');
    }
  };

  const handleAlert = useCallback((triggerWord: string) => {
    setAlert(true);
    if (permission) {
      new Notification('Emergency Alert Triggered', {
        body: 'Emergency services would be notified in a real deployment.',
        icon: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=64&h=64&fit=crop'
      });
    }
    sendEmergencyEmail(triggerWord);
    // Reset alert after 5 seconds
    setTimeout(() => {
      setAlert(false);
      setEmailStatus('idle');
    }, 5000);
  }, [permission]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      setTranscript(transcript.toLowerCase());
      
      // Check for trigger words
      const foundTriggerWord = TRIGGER_WORDS.find(word => 
        transcript.toLowerCase().includes(word)
      );
      if (foundTriggerWord) {
        handleAlert(foundTriggerWord);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognition.start();
    setIsListening(true);
  }, [isListening, handleAlert]);

  const stopListening = () => {
    setIsListening(false);
    setTranscript('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">
            AI Personal Safety Alert System
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your voice-activated emergency response system. Speak trigger words like "help", "danger", or "emergency" to activate alerts.
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className={`p-8 rounded-2xl shadow-lg ${alert ? 'bg-red-50 animate-pulse' : 'bg-white'} transition-all duration-300`}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                {alert ? (
                  <AlertCircle className="w-8 h-8 text-red-500 animate-bounce" />
                ) : (
                  <Volume2 className="w-8 h-8 text-indigo-500" />
                )}
                <span className={`text-xl font-semibold ${alert ? 'text-red-500' : 'text-indigo-500'}`}>
                  {alert ? 'Alert Triggered!' : 'System Status'}
                </span>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                title="Settings"
              >
                <Settings className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-6 rounded-full transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'bg-indigo-100 hover:bg-indigo-200'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-12 h-12 text-red-500" />
                  ) : (
                    <Mic className="w-12 h-12 text-indigo-500" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  {isListening ? 'Listening...' : 'Click the microphone to start'}
                </p>
                {transcript && (
                  <p className="mt-2 text-sm text-gray-500">
                    Heard: "{transcript}"
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-medium text-gray-700">System Status</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    Voice Recognition: {isListening ? 'Active' : 'Inactive'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${permission ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    Notifications: {permission ? 'Enabled' : 'Disabled'}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      emailStatus === 'sent' ? 'bg-green-500' : 
                      emailStatus === 'sending' ? 'bg-yellow-500' :
                      emailStatus === 'error' ? 'bg-red-500' : 
                      'bg-gray-300'
                    }`}></span>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Alerts: {
                        emailStatus === 'sent' ? 'Alert Sent' :
                        emailStatus === 'sending' ? 'Sending Alert...' :
                        emailStatus === 'error' ? 'Failed to Send' :
                        'Ready'
                      }
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>This is a prototype. In a real deployment, this would connect to emergency services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;