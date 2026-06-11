# Message Auto-Refresh Fix

## Problem
Messages were not automatically appearing in real-time. Users had to manually refresh the page to see new messages from other team members.

## Root Cause Analysis
1. **Unreliable Socket Connection**: The Socket.io connection was not auto-connecting and could disconnect without proper reconnection logic
2. **No Fallback Mechanism**: If the socket wasn't connected, there was no polling to fetch new messages
3. **Socket Event Listener Issues**: The message listener wasn't properly set up or was missing dependency array updates

## Solution Implemented

### 1. **Frontend: Enhanced Socket Configuration** (`frontend/src/lib/socket.ts`)
- **Auto-connect enabled**: Socket now auto-connects on module load instead of requiring manual connection
- **Reconnection settings**: Added auto-reconnection with exponential backoff (1s → 5s delays, max 5 attempts)
- **Reduced connection overhead**: Socket connects once globally and is reused across components

```typescript
{
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
}
```

### 2. **Frontend: Improved Socket Connection Management** (`frontend/src/components/ui/chatOption.jsx`)
- Added explicit connection checks before joining task rooms
- Added `reconnect` event handler to re-join task room when socket reconnects
- Proper cleanup of all socket listeners on unmount

**Key changes:**
- Ensures socket is connected before emitting `join-task`
- Re-joins task room automatically on reconnection
- Properly typed taskId as `Number(id)` for consistency

### 3. **Frontend: Automatic Message Polling** (Fallback Mechanism)
- Added 2-second polling interval that automatically fetches messages even if socket is disconnected
- Polling continues running in the background and updates messages every 2 seconds
- Fallback ensures users always see new messages, even if socket connection fails

```javascript
const pollInterval = setInterval(async () => {
  // Fetch messages every 2 seconds
  const messagesRes = await getTaskMessagesApi(id);
  // Update local state
}, 2000);
```

### 4. **Backend: Improved Message Broadcasting** (`backend/src/lib/chat.socket.ts`)
- Fixed message payload structure to include properly formatted sender information
- Enhanced `replyTo` object structure with sender details
- Ensures all connected clients in the task room receive new messages (including the sender)
- Added comprehensive logging for debugging

**New message payload structure:**
```javascript
{
  id: savedMessage.id,
  senderId: savedMessage.senderId,
  senderName: "First Last",
  sender: { first_name, last_name, ... },
  message: "message text",
  taskId: taskId,
  createdAt: timestamp,
  replyTo: { ... },
  clientMessageId: "temp-xxxxx"  // For matching sent messages
}
```

### 5. **Frontend: Robust Message Listener** 
- Improved sender name extraction from both `sender` object and fallback `senderName`
- Better handling of reply-to message author names
- Proper status tracking (pending → sent) when message is acknowledged by backend
- Dependency array now includes `user?.id` for proper updates

## How It Works Now

### Real-time (Socket-based):
1. User opens chat for a task
2. Socket auto-connects and joins the task room
3. When a user sends a message:
   - Message is temporarily added to UI with "pending" status
   - Message is sent via socket to backend
   - Backend saves to database and broadcasts to all users in task room
   - All connected users receive the message via `receive-message` event
   - Temp message is replaced with confirmed message and marked "sent"

### Fallback (Polling-based):
- If socket is not connected or goes down, polling still fetches new messages every 2 seconds
- Users always see new messages even without real-time socket connection
- Duplicate detection prevents showing the same message twice

### Reconnection:
- If socket disconnects, it automatically attempts to reconnect
- When reconnection succeeds, the component automatically re-joins the task room
- New messages continue flowing in via socket

## Testing Checklist

- [ ] Open chat in one browser/tab
- [ ] Open same task in another browser/tab
- [ ] Send message from one side
- [ ] Verify it appears immediately on the other side
- [ ] Close one browser completely (socket disconnects)
- [ ] Send message from the still-open browser
- [ ] Reopen the closed browser
- [ ] Verify the message appears via polling
- [ ] Refresh page and verify socket reconnects automatically
- [ ] Send another message and verify socket delivers it in real-time

## Performance Notes

- **Polling overhead**: 2-second interval = 30 requests/minute per open chat
  - Can be increased to 3-5 seconds if needed (trade-off: slightly slower message delivery)
  - Can be disabled if socket connection is guaranteed stable
  
- **Socket efficiency**: Much lower bandwidth than polling once connected
  - Recommended: Keep polling as safety net, rely on socket for primary delivery

## Future Improvements

1. **Configurable polling interval**: Add environment variable or setting for poll rate
2. **Stop polling when socket connected**: Disable polling when socket is confirmed active
3. **Unread message indicator**: Track unread messages across tasks
4. **Typing indicators**: Show when other users are typing
5. **Message seen indicators**: Track who has read which messages
