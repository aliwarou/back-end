# 💬 Guide WebSocket - Messagerie Temps Réel

## 🚀 Connexion au serveur WebSocket

### URL de connexion

```
ws://localhost:3000/chat
```

### Authentification

Le token JWT doit être fourni lors de la connexion. Trois méthodes sont supportées :

#### **Méthode 1 : Query Parameter (Recommandée)**

```javascript
const socket = io('ws://localhost:3000/chat', {
  query: {
    token: 'votre-jwt-token',
  },
});
```

#### **Méthode 2 : Auth Handshake**

```javascript
const socket = io('ws://localhost:3000/chat', {
  auth: {
    token: 'votre-jwt-token',
  },
});
```

#### **Méthode 3 : Headers**

```javascript
const socket = io('ws://localhost:3000/chat', {
  extraHeaders: {
    Authorization: 'Bearer votre-jwt-token',
  },
});
```

---

## 📡 Événements disponibles

### 🔵 **Événements Client → Serveur** (emit)

#### 1. Rejoindre une conversation

```javascript
socket.emit(
  'conversation:join',
  {
    conversationId: 1,
  },
  (response) => {
    console.log(response); // { success: true, message: "..." }
  },
);
```

#### 2. Quitter une conversation

```javascript
socket.emit(
  'conversation:leave',
  {
    conversationId: 1,
  },
  (response) => {
    console.log(response);
  },
);
```

#### 3. Envoyer un message

```javascript
socket.emit(
  'message:send',
  {
    conversationId: 1,
    content: 'Bonjour, je souhaite prendre rendez-vous...',
    attachments: ['https://example.com/document.pdf'], // optionnel
  },
  (response) => {
    if (response.success) {
      console.log('Message envoyé:', response.message);
    }
  },
);
```

#### 4. Indicateur "en train d'écrire..."

```javascript
// Commence à écrire
socket.emit('message:typing', {
  conversationId: 1,
  isTyping: true,
});

// Arrête d'écrire
socket.emit('message:typing', {
  conversationId: 1,
  isTyping: false,
});
```

#### 5. Marquer un message comme lu

```javascript
socket.emit(
  'message:read',
  {
    messageId: 123,
  },
  (response) => {
    console.log(response);
  },
);
```

#### 6. Obtenir les utilisateurs en ligne

```javascript
socket.emit(
  'conversation:users:online',
  {
    conversationId: 1,
  },
  (response) => {
    console.log('Utilisateurs en ligne:', response.onlineUsers);
    // Exemple: [1, 5, 8]
  },
);
```

---

### 🟢 **Événements Serveur → Client** (on)

#### 1. Nouveau message reçu

```javascript
socket.on('message:new', (data) => {
  console.log('Nouveau message:', data.message);
  // {
  //   message: {
  //     id: 123,
  //     conversationId: 1,
  //     senderId: 5,
  //     content: "...",
  //     sentAt: "2025-10-23T..."
  //   },
  //   timestamp: "2025-10-23T..."
  // }
});
```

#### 2. Utilisateur en train d'écrire

```javascript
socket.on('user:typing', (data) => {
  if (data.isTyping) {
    console.log(`L'utilisateur ${data.userId} est en train d'écrire...`);
  } else {
    console.log(`L'utilisateur ${data.userId} a arrêté d'écrire`);
  }
});
```

#### 3. Message lu (accusé de lecture)

```javascript
socket.on('message:read:ack', (data) => {
  console.log(`Message ${data.messageId} lu par l'utilisateur ${data.readBy}`);
});
```

#### 4. Utilisateur en ligne

```javascript
socket.on('user:online', (data) => {
  console.log(`Utilisateur ${data.userId} est en ligne`);
});
```

#### 5. Utilisateur hors ligne

```javascript
socket.on('user:offline', (data) => {
  console.log(`Utilisateur ${data.userId} est hors ligne`);
});
```

#### 6. Notification générale

```javascript
socket.on('notification', (notification) => {
  console.log('Nouvelle notification:', notification);
});
```

---

## 💻 Exemple d'intégration Frontend

### React / Next.js

```typescript
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

function ChatComponent({ conversationId, token }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Connexion au WebSocket
  useEffect(() => {
    const newSocket = io('ws://localhost:3000/chat', {
      query: { token }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connecté au WebSocket');

      // Rejoindre la conversation
      newSocket.emit('conversation:join', { conversationId });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Déconnecté du WebSocket');
    });

    // Écouter les nouveaux messages
    newSocket.on('message:new', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // Écouter l'indicateur "typing"
    newSocket.on('user:typing', (data) => {
      setIsTyping(data.isTyping);
    });

    setSocket(newSocket);

    // Nettoyage à la déconnexion
    return () => {
      newSocket.emit('conversation:leave', { conversationId });
      newSocket.close();
    };
  }, [conversationId, token]);

  // Envoyer un message
  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit('message:send', {
        conversationId,
        content: message
      }, (response) => {
        if (response.success) {
          setMessage('');
        }
      });
    }
  };

  // Indicateur "typing"
  const handleTyping = (typing: boolean) => {
    if (socket) {
      socket.emit('message:typing', {
        conversationId,
        isTyping: typing
      });
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>User {msg.senderId}:</strong> {msg.content}
          </div>
        ))}
        {isTyping && <div>En train d'écrire...</div>}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => handleTyping(true)}
        onBlur={() => handleTyping(false)}
        placeholder="Votre message..."
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
}
```

---

### Vue.js

```vue
<template>
  <div class="chat">
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id">
        <strong>{{ msg.senderId }}:</strong> {{ msg.content }}
      </div>
      <div v-if="isTyping">En train d'écrire...</div>
    </div>

    <input
      v-model="message"
      @focus="handleTyping(true)"
      @blur="handleTyping(false)"
      placeholder="Votre message..."
    />
    <button @click="sendMessage">Envoyer</button>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  props: ['conversationId', 'token'],
  data() {
    return {
      socket: null,
      messages: [],
      message: '',
      isTyping: false,
    };
  },
  mounted() {
    this.socket = io('ws://localhost:3000/chat', {
      query: { token: this.token },
    });

    this.socket.on('connect', () => {
      this.socket.emit('conversation:join', {
        conversationId: this.conversationId,
      });
    });

    this.socket.on('message:new', (data) => {
      this.messages.push(data.message);
    });

    this.socket.on('user:typing', (data) => {
      this.isTyping = data.isTyping;
    });
  },
  beforeUnmount() {
    this.socket.emit('conversation:leave', {
      conversationId: this.conversationId,
    });
    this.socket.close();
  },
  methods: {
    sendMessage() {
      if (this.message.trim()) {
        this.socket.emit('message:send', {
          conversationId: this.conversationId,
          content: this.message,
        });
        this.message = '';
      }
    },
    handleTyping(typing) {
      this.socket.emit('message:typing', {
        conversationId: this.conversationId,
        isTyping: typing,
      });
    },
  },
};
</script>
```

---

## 🧪 Test avec Postman

Postman ne supporte pas WebSocket nativement, mais vous pouvez utiliser :

- **Postman WebSocket Request** (nouvelle fonctionnalité)
- **Socket.IO Client Tool** (extension)
- **Firecamp** (alternative à Postman)

---

## 🧪 Test avec un client simple (HTML/JS)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Test WebSocket Chat</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  </head>
  <body>
    <h1>Chat Test</h1>

    <div>
      <input id="token" placeholder="JWT Token" style="width: 400px" />
      <button onclick="connect()">Connexion</button>
    </div>

    <div>
      <input id="conversationId" placeholder="Conversation ID" type="number" />
      <button onclick="joinConversation()">Rejoindre</button>
    </div>

    <div>
      <input id="message" placeholder="Votre message..." />
      <button onclick="sendMessage()">Envoyer</button>
    </div>

    <div id="messages"></div>

    <script>
      let socket;

      function connect() {
        const token = document.getElementById('token').value;

        socket = io('ws://localhost:3000/chat', {
          query: { token },
        });

        socket.on('connect', () => {
          console.log('✅ Connecté');
          addMessage('Système', 'Connecté au serveur');
        });

        socket.on('message:new', (data) => {
          addMessage('User ' + data.message.senderId, data.message.content);
        });

        socket.on('user:typing', (data) => {
          if (data.isTyping) {
            addMessage(
              'Système',
              `User ${data.userId} est en train d'écrire...`,
            );
          }
        });
      }

      function joinConversation() {
        const conversationId = parseInt(
          document.getElementById('conversationId').value,
        );
        socket.emit('conversation:join', { conversationId }, (response) => {
          console.log(response);
          addMessage('Système', response.message);
        });
      }

      function sendMessage() {
        const conversationId = parseInt(
          document.getElementById('conversationId').value,
        );
        const content = document.getElementById('message').value;

        socket.emit(
          'message:send',
          {
            conversationId,
            content,
          },
          (response) => {
            if (response.success) {
              document.getElementById('message').value = '';
            }
          },
        );
      }

      function addMessage(sender, content) {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${sender}:</strong> ${content}`;
        document.getElementById('messages').appendChild(div);
      }
    </script>
  </body>
</html>
```

---

## ⚠️ Notes importantes

1. **Authentification obligatoire** : Un token JWT valide est requis pour se connecter
2. **Rooms automatiques** : Quand vous rejoignez une conversation, vous êtes automatiquement ajouté à la room `conversation:{id}`
3. **Persistance** : Les messages sont automatiquement sauvegardés en base de données
4. **Déconnexion** : N'oubliez pas de quitter les conversations avant de vous déconnecter

---

## 🔒 Sécurité

- ✅ Authentification JWT obligatoire
- ✅ Vérification des permissions (accès aux conversations)
- ✅ Validation des données entrantes
- ✅ CORS configuré (à adapter en production)

---

## 📊 Monitoring

Pour voir les utilisateurs connectés en temps réel, vous pouvez ajouter un endpoint admin pour monitorer l'état du serveur WebSocket.
