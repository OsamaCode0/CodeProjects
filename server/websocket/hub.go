package websocket

import (
	"log"
	"sync"
)

type Hub struct {
	Clients    map[string]*Client  // Clients вместо clients
	Broadcast  chan *Message       // Broadcast вместо broadcast
	Register   chan *Client        // Register вместо register
	Unregister chan *Client        // Unregister вместо unregister
	mu         sync.RWMutex
}

type Message struct {
	Type      string                 `json:"type"`
	ChatID    string                 `json:"chat_id,omitempty"`
	MessageID string                 `json:"message_id,omitempty"`
	SenderID  string                 `json:"sender_id,omitempty"`
	Content   string                 `json:"content,omitempty"`
	CreatedAt string                 `json:"created_at,omitempty"`
	Data      map[string]interface{} `json:"data,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		Clients:    make(map[string]*Client),
		Broadcast:  make(chan *Message, 256),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.Clients[client.userID] = client
			h.mu.Unlock()
			log.Printf("Client connected: %s", client.userID)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Clients[client.userID]; ok {
				delete(h.Clients, client.userID)
				close(client.send)
				log.Printf("Client disconnected: %s", client.userID)
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.RLock()
			// Send to specific user if needed
			if message.Type == "new_message" && message.ChatID != "" {
				// This will be handled in SendToUsers
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) SendToUser(userID string, message *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	
	if client, ok := h.Clients[userID]; ok {
		select {
		case client.send <- message:
		default:
			log.Printf("Failed to send to user %s: channel full", userID)
		}
	}
}

func (h *Hub) SendToUsers(userIDs []string, message *Message) {
	for _, userID := range userIDs {
		h.SendToUser(userID, message)
	}
}

func (h *Hub) IsOnline(userID string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.Clients[userID]
	return ok
}