import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAvatars();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchAvatars = async () => {
    try {
      const response = await apiService.getAvatars();
      setAvatars(response.data);
      if (response.data.length > 0) {
        setSelectedAvatar(response.data[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load avatars",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAvatar || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiService.chatWithAvatar({
        avatar_id: selectedAvatar.id,
        message: userMessage
      });

      // Add avatar response to chat
      setMessages(prev => [...prev, { 
        type: "avatar", 
        content: response.data.response,
        avatarName: response.data.avatar_name
      }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setMessages([]);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Zeny AI
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chat with AI Avatars that speak on behalf of real people. Each avatar has unique personalities and knowledge.
          </p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin'}
              className="text-sm"
            >
              Admin Access
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Selection */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Available Avatars
                </CardTitle>
                <CardDescription>
                  Choose an avatar to start chatting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {avatars.map((avatar) => (
                      <Card 
                        key={avatar.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedAvatar?.id === avatar.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => selectAvatar(avatar)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                {avatar.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm">{avatar.name}</h3>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                {avatar.description}
                              </p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {avatar.personality.split(' ').slice(0, 2).join(' ')}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedAvatar && (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                          {selectedAvatar.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      Chat with {selectedAvatar.name}
                    </>
                  )}
                </CardTitle>
                {selectedAvatar && (
                  <CardDescription>
                    {selectedAvatar.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-col h-96">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 p-4">
                    {messages.length === 0 && selectedAvatar && (
                      <div className="text-center text-gray-500 py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Start a conversation with {selectedAvatar.name}!</p>
                        <p className="text-sm mt-2">{selectedAvatar.personality}</p>
                      </div>
                    )}
                    
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'avatar' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              {selectedAvatar?.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        {message.type === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-500 text-white text-xs">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                            {selectedAvatar?.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                {selectedAvatar && (
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedAvatar.name}...`}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;