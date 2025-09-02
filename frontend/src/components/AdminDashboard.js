import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  MessageSquare, 
  Users,
  BarChart3,
  Settings
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [avatars, setAvatars] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personality: "",
    instructions: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
      return;
    }
    
    fetchAvatars();
    fetchChatHistory();
  }, [navigate]);

  const fetchAvatars = async () => {
    try {
      const response = await apiService.getAvatarsAdmin();
      setAvatars(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load avatars",
        variant: "destructive",
      });
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory();
      setChatHistory(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      personality: "",
      instructions: ""
    });
  };

  const handleCreateAvatar = async () => {
    setIsLoading(true);
    try {
      await apiService.createAvatar(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAvatars();
      toast({
        title: "Success",
        description: "Avatar created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create avatar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAvatar = async () => {
    setIsLoading(true);
    try {
      await apiService.updateAvatar(editingAvatar.id, formData);
      setIsEditDialogOpen(false);
      setEditingAvatar(null);
      resetForm();
      fetchAvatars();
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAvatar = async (avatarId) => {
    if (!window.confirm("Are you sure you want to delete this avatar?")) return;
    
    try {
      await apiService.deleteAvatar(avatarId);
      fetchAvatars();
      toast({
        title: "Success",
        description: "Avatar deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete avatar",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (avatar) => {
    setEditingAvatar(avatar);
    setFormData({
      name: avatar.name,
      description: avatar.description,
      personality: avatar.personality,
      instructions: avatar.instructions
    });
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage Zeny AI Avatars</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              View Chat
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Avatars</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avatars.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chatHistory.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(chatHistory.map(chat => chat.avatar_id)).size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="avatars" className="space-y-6">
          <TabsList>
            <TabsTrigger value="avatars">Avatar Management</TabsTrigger>
            <TabsTrigger value="chat-history">Chat History</TabsTrigger>
          </TabsList>

          <TabsContent value="avatars">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Avatars</CardTitle>
                    <CardDescription>Manage your AI avatars</CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Avatar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Avatar</DialogTitle>
                        <DialogDescription>
                          Fill in the details to create a new AI avatar.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="Avatar name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="personality">Personality</Label>
                            <Input
                              id="personality"
                              value={formData.personality}
                              onChange={(e) => setFormData({...formData, personality: e.target.value})}
                              placeholder="e.g., Friendly and helpful"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Brief description of the avatar"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea
                            id="instructions"
                            value={formData.instructions}
                            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                            placeholder="Detailed instructions for how the avatar should behave and respond"
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAvatar} disabled={isLoading}>
                          {isLoading ? "Creating..." : "Create Avatar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {avatars.map((avatar) => (
                    <Card key={avatar.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{avatar.name}</h3>
                              <Badge variant="outline">{avatar.personality}</Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{avatar.description}</p>
                            <div className="text-sm text-gray-500">
                              Created: {formatDate(avatar.created_at)}
                              {avatar.updated_at !== avatar.created_at && (
                                <span className="ml-4">Updated: {formatDate(avatar.updated_at)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(avatar)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteAvatar(avatar.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {avatars.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No avatars created yet.</p>
                      <p className="text-sm">Create your first avatar to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat-history">
            <Card>
              <CardHeader>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>Recent conversations with avatars</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {chatHistory.map((chat) => (
                      <Card key={chat.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{avatars.find(a => a.id === chat.avatar_id)?.name || 'Unknown Avatar'}</Badge>
                              <span className="text-xs text-gray-500">{formatDate(chat.timestamp)}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-700">User:</p>
                                <p className="text-sm">{chat.user_message}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">Avatar:</p>
                                <p className="text-sm">{chat.avatar_response}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {chatHistory.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No chat history yet.</p>
                        <p className="text-sm">Conversations will appear here as users chat with avatars.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Avatar</DialogTitle>
              <DialogDescription>
                Update the avatar details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Avatar name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-personality">Personality</Label>
                  <Input
                    id="edit-personality"
                    value={formData.personality}
                    onChange={(e) => setFormData({...formData, personality: e.target.value})}
                    placeholder="e.g., Friendly and helpful"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the avatar"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructions">Instructions</Label>
                <Textarea
                  id="edit-instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Detailed instructions for how the avatar should behave and respond"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAvatar} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Avatar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;