import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles, LogOut, Lock } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isTyping?: boolean;
}

interface ApiResponse {
    success: boolean;
    response: string;
    request_id: string;
    timestamp: string;
    processing_time: number;
    agent: string;
    error?: string;
}

interface Credentials {
    userName: string;
    password: string;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        position: 'relative' as const,
        overflow: 'hidden',
    },
    backgroundPattern: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none' as const,
    },
    loginContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        position: 'relative' as const,
        zIndex: 1,
    },
    loginBox: {
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    },
    loginHeader: {
        textAlign: 'center' as const,
        marginBottom: '40px',
    },
    loginLogo: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
    },
    loginTitle: {
        color: 'white',
        fontSize: '28px',
        fontWeight: '700',
        margin: '0 0 8px 0',
        letterSpacing: '-0.02em',
    },
    loginSubtitle: {
        color: '#a5b4fc',
        fontSize: '14px',
        margin: 0,
    },
    loginForm: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
    },
    label: {
        color: '#e0e7ff',
        fontSize: '14px',
        fontWeight: '500',
    },
    loginInput: {
        background: 'rgba(30, 27, 75, 0.6)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '12px',
        padding: '14px 16px',
        color: 'white',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.3s ease',
    },
    loginInputFocused: {
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1)',
        background: 'rgba(30, 27, 75, 0.8)',
    },
    loginButton: (disabled: boolean) => ({
        background: disabled
            ? 'rgba(71, 85, 105, 0.5)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '14px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '10px',
        boxShadow: disabled
            ? 'none'
            : '0 4px 14px rgba(139, 92, 246, 0.4)',
    }),
    loginButtonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
    },
    errorMessage: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        color: '#fca5a5',
        fontSize: '14px',
        textAlign: 'center' as const,
    },
    header: {
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
        padding: '16px 20px',
        position: 'relative' as const,
        zIndex: 10,
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logoContainer: {
        position: 'relative' as const,
        width: '48px',
        height: '48px',
    },
    logo: {
        width: '48px',
        height: '48px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
        position: 'relative' as const,
        zIndex: 1,
    },
    logoGlow: {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
    },
    headerText: {
        flex: 1,
    },
    title: {
        color: 'white',
        fontSize: '20px',
        fontWeight: '700',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        color: '#a5b4fc',
        fontSize: '13px',
        margin: '2px 0 0 0',
        fontWeight: '400',
    },
    statusDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: '#10b981',
        boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
        animation: 'pulse 2s ease-in-out infinite',
    },
    logoutButton: {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '10px',
        padding: '8px 16px',
        color: '#fca5a5',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    logoutButtonHover: {
        background: 'rgba(239, 68, 68, 0.25)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        position: 'relative' as const,
        zIndex: 1,
    },
    messageRow: (isUser: boolean) => ({
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'slideIn 0.3s ease-out',
    }),
    messageContent: (isUser: boolean) => ({
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: isUser ? ('row-reverse' as const) : ('row' as const),
        gap: '12px',
        maxWidth: '85%',
    }),
    avatar: (isUser: boolean) => ({
        width: '40px',
        height: '40px',
        minWidth: '40px',
        borderRadius: '50%',
        background: isUser
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: isUser
            ? '0 4px 14px rgba(16, 185, 129, 0.4)'
            : '0 4px 14px rgba(139, 92, 246, 0.4)',
        border: '2px solid rgba(255, 255, 255, 0.1)',
    }),
    messageBubble: (isUser: boolean) => ({
        background: isUser
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: isUser
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : '1px solid rgba(139, 92, 246, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        padding: '14px 18px',
        color: isUser ? '#d1fae5' : '#e0e7ff',
        wordBreak: 'break-word' as const,
        whiteSpace: 'pre-wrap' as const,
        lineHeight: '1.6',
        fontSize: '15px',
        boxShadow: isUser
            ? '0 4px 20px rgba(16, 185, 129, 0.1)'
            : '0 4px 20px rgba(139, 92, 246, 0.1)',
        textAlign: 'start' as const,
    }),
    timestamp: {
        fontSize: '11px',
        color: '#64748b',
        marginTop: '6px',
    },
    loadingMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#a5b4fc',
    },
    inputContainer: {
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        padding: '16px 20px 20px',
        position: 'relative' as const,
        zIndex: 10,
    },
    inputWrapper: {
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
    },
    inputContainer2: {
        flex: 1,
        position: 'relative' as const,
    },
    input: {
        width: '100%',
        background: 'rgba(30, 27, 75, 0.6)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '16px',
        padding: '14px 18px',
        paddingRight: '18px',
        color: 'white',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.3s ease',
        resize: 'none' as const,
        fontFamily: 'inherit',
        lineHeight: '1.5',
        maxHeight: '120px',
        minHeight: '50px',
    },
    inputFocused: {
        borderColor: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.1), 0 4px 20px rgba(139, 92, 246, 0.2)',
        background: 'rgba(30, 27, 75, 0.8)',
    },
    sendButton: (disabled: boolean) => ({
        background: disabled
            ? 'rgba(71, 85, 105, 0.5)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        width: '50px',
        height: '50px',
        minWidth: '50px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        transform: 'scale(1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: disabled
            ? 'none'
            : '0 4px 14px rgba(139, 92, 246, 0.4)',
    }),
    sendButtonHover: {
        transform: 'scale(1.05) translateY(-2px)',
        boxShadow: '0 6px 20px rgba(139, 92, 246, 0.6)',
    },
    helpText: {
        textAlign: 'center' as const,
        color: '#64748b',
        fontSize: '12px',
        marginTop: '12px',
    },
    cursor: {
        display: 'inline-block',
        width: '2px',
        height: '16px',
        background: '#8b5cf6',
        animation: 'blink 1s infinite',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
    },
    welcomeContainer: {
        textAlign: 'center' as const,
        padding: '40px 20px',
        color: '#94a3b8',
    },
    welcomeTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
        marginBottom: '12px',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    welcomeText: {
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#a5b4fc',
    },
};

const ChatInterface: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [credentials, setCredentials] = useState<Credentials>({ userName: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [currentTypingId, setCurrentTypingId] = useState<string | null>(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isLogoutHovered, setIsLogoutHovered] = useState(false);
    const [loginInputFocus, setLoginInputFocus] = useState({ userName: false, password: false });
    const [isLoginButtonHovered, setIsLoginButtonHovered] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0; 
                    transform: translateY(10px);
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0);
                }
            }
            
            .spinning {
                animation: spin 1s linear infinite;
            }
            
            * {
                box-sizing: border-box;
            }
            
            body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            ::-webkit-scrollbar {
                width: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: rgba(30, 27, 75, 0.3);
            }
            
            ::-webkit-scrollbar-thumb {
                background: rgba(139, 92, 246, 0.5);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(139, 92, 246, 0.7);
            }

            @media (max-width: 768px) {
                .message-content {
                    max-width: 90% !important;
                }
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingText]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
        }
    }, [inputValue]);

    const handleLogin = () => {
        setLoginError('');
        setIsLoggingIn(true);

        if (!credentials.userName.trim() || !credentials.password.trim()) {
            setLoginError('Please enter both username and password');
            setIsLoggingIn(false);
            return;
        }

        if (credentials.userName === 'DotTech' && credentials.password === 'DotTech@2023') {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Invalid username or password');
        }

        setIsLoggingIn(false);
    };

    const handleLoginKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCredentials({ userName: '', password: '' });
        setMessages([]);
        setInputValue('');
        setLoginError('');
    };

    const typeMessage = (text: string, messageId: string) => {
        let index = 0;
        setCurrentTypingId(messageId);
        setTypingText('');

        const interval = setInterval(() => {
            if (index < text.length) {
                setTypingText(prev => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === messageId
                            ? { ...msg, text, isTyping: false }
                            : msg
                    )
                );
                setTypingText('');
                setCurrentTypingId(null);
            }
        }, 20);
    };

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat/accurai/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    userName: credentials.userName,
                    password: credentials.password,
                }),
            });

            const data: ApiResponse = await response.json();

            if (data.success) {
                const botMessageId = (Date.now() + 1).toString();
                const botMessage: Message = {
                    id: botMessageId,
                    text: '',
                    sender: 'bot',
                    timestamp: new Date(data.timestamp),
                    isTyping: true,
                };

                setMessages(prev => [...prev, botMessage]);
                typeMessage(data.response, botMessageId);
            } else {
                const errorMessage = data.error || 'API request failed';
                if (errorMessage === 'Invalid credentials') {
                    handleLogout();
                    alert('Your session has expired. Please login again.');
                } else {
                    throw new Error(errorMessage);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again later.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessageText = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!isAuthenticated) {
        return (
            <div style={styles.container}>
                <div style={styles.backgroundPattern} />
                <div style={styles.loginContainer}>
                    <div style={styles.loginBox}>
                        <div style={styles.loginHeader}>
                            <div style={styles.loginLogo}>
                                <Lock color="white" size={40} />
                            </div>
                            <h1 style={styles.loginTitle}>Login</h1>
                            <p style={styles.loginSubtitle}>Asset Pulse Bot – Intelligent Insights, Instant Answers</p>
                        </div>

                        <div style={styles.loginForm}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Username</label>
                                <input
                                    type="text"
                                    value={credentials.userName}
                                    onChange={(e) => setCredentials({ ...credentials, userName: e.target.value })}
                                    onKeyPress={handleLoginKeyPress}
                                    onFocus={() => setLoginInputFocus({ ...loginInputFocus, userName: true })}
                                    onBlur={() => setLoginInputFocus({ ...loginInputFocus, userName: false })}
                                    placeholder="Enter your username"
                                    style={{
                                        ...styles.loginInput,
                                        ...(loginInputFocus.userName ? styles.loginInputFocused : {}),
                                    }}
                                    disabled={isLoggingIn}
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Password</label>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    onKeyPress={handleLoginKeyPress}
                                    onFocus={() => setLoginInputFocus({ ...loginInputFocus, password: true })}
                                    onBlur={() => setLoginInputFocus({ ...loginInputFocus, password: false })}
                                    placeholder="Enter your password"
                                    style={{
                                        ...styles.loginInput,
                                        ...(loginInputFocus.password ? styles.loginInputFocused : {}),
                                    }}
                                    disabled={isLoggingIn}
                                />
                            </div>

                            {loginError && (
                                <div style={styles.errorMessage}>
                                    {loginError}
                                </div>
                            )}

                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn || !credentials.userName.trim() || !credentials.password.trim()}
                                onMouseEnter={() => setIsLoginButtonHovered(true)}
                                onMouseLeave={() => setIsLoginButtonHovered(false)}
                                style={{
                                    ...styles.loginButton(isLoggingIn || !credentials.userName.trim() || !credentials.password.trim()),
                                    ...(isLoginButtonHovered && credentials.userName.trim() && credentials.password.trim() && !isLoggingIn
                                        ? styles.loginButtonHover
                                        : {}),
                                }}
                            >
                                {isLoggingIn ? (
                                    <>
                                        <Loader2 size={16} className="spinning" style={{ marginRight: '8px' }} />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.backgroundPattern} />

            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logoGlow} />
                        <div style={styles.logo}>
                            <Sparkles color="white" size={24} />
                        </div>
                    </div>
                    <div style={styles.headerText}>
                        <h1 style={styles.title}>
                            AssetPulse AI Assistant
                            <div style={styles.statusDot} />
                        </h1>
                        <p style={styles.subtitle}>Asset Pulse Bot – Intelligent Insights, Instant Answers</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        onMouseEnter={() => setIsLogoutHovered(true)}
                        onMouseLeave={() => setIsLogoutHovered(false)}
                        style={{
                            ...styles.logoutButton,
                            ...(isLogoutHovered ? styles.logoutButtonHover : {}),
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.messagesContainer}>
                {messages.length === 0 && (
                    <div style={styles.welcomeContainer}>
                        <h2 style={styles.welcomeTitle}>Welcome to Asset Pulse AI – Your Intelligent Asset Performance Partner!</h2>
                        <p style={styles.welcomeText}>
                            Asset Pulse AI is an advanced, AI-powered chatbot designed to revolutionize asset performance management. By harnessing the power of artificial intelligence, Asset Pulse delivers real-time insights, predictive analytics, and automated recommendations to help you optimize asset utilization, reduce downtime, and extend asset lifecycles. Whether you’re tracking maintenance schedules, monitoring asset health, or seeking actionable intelligence, Asset Pulse AI acts as your 24/7 digital assistant, turning complex data into clear, actionable guidance. With Asset Pulse AI, you’re not just managing assets—you’re unlocking their full potential through intelligent automation and proactive support.                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} style={styles.messageRow(message.sender === 'user')}>
                        <div style={styles.messageContent(message.sender === 'user')} className="message-content">
                            <div style={styles.avatar(message.sender === 'user')}>
                                {message.sender === 'user' ? (
                                    <User color="white" size={20} />
                                ) : (
                                    <Bot color="white" size={20} />
                                )}
                            </div>
                            <div>
                                <div style={styles.messageBubble(message.sender === 'user')} dir="auto">
                                    {message.isTyping && currentTypingId === message.id ? (
                                        <>
                                            <span dangerouslySetInnerHTML={{ __html: formatMessageText(typingText) }} />
                                            <span style={styles.cursor} />
                                        </>
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
                                    )}
                                </div>
                                <div style={styles.timestamp} dir="ltr">{formatTime(message.timestamp)}</div>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={styles.messageRow(false)}>
                        <div style={styles.messageContent(false)} className="message-content">
                            <div style={styles.avatar(false)}>
                                <Bot color="white" size={20} />
                            </div>
                            <div>
                                <div style={styles.messageBubble(false)}>
                                    <div style={styles.loadingMessage}>
                                        <Loader2 size={16} className="spinning" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputContainer}>
                <div style={styles.inputWrapper}>
                    <div style={styles.inputContainer2}>
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onFocus={() => setIsInputFocused(true)}
                            onBlur={() => setIsInputFocused(false)}
                            placeholder="Type your message..."
                            style={{
                                ...styles.input,
                                ...(isInputFocused ? styles.inputFocused : {}),
                            }}
                            disabled={isLoading}
                            rows={1}
                            dir="auto"
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                        style={{
                            ...styles.sendButton(!inputValue.trim() || isLoading),
                            ...(isButtonHovered && inputValue.trim() && !isLoading ? styles.sendButtonHover : {}),
                        }}
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div style={styles.helpText} dir="ltr">
                    Press Enter to send • Shift+Enter for new line
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;