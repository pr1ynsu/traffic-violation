# Integrate Backend Authentication with Frontend

## Tasks
- [x] Update Login.jsx to use real backend authentication
- [x] Update apiClient.js to make real API calls with token
- [x] Test login/signup flow

## Details
1. In Login.jsx: Set USE_MOCK=false, change endpoints to /api/auth/signup and /api/auth/login, fix payload keys (e.g., emailOrMobile -> email).
2. In apiClient.js: Replace localDB mocks with fetch calls to backend, add Authorization header.
3. Run backend server and test frontend login/signup.

# Integrate Forum Backend with Frontend

## Tasks
- [x] Install socket.io-client
- [x] Update apiClient.js with Socket.IO functions
- [x] Update Forum.jsx to use real backend via Socket.IO
- [x] Fix forum controller to return messages in correct format
- [x] Test forum chat functionality

## Details
1. Install socket.io-client in frontend.
2. Add initSocket, getSocket, apiGetForumMessages, apiSendForumMessage to apiClient.js.
3. In Forum.jsx: Import useAuth, initSocket, apiGetForumMessages; set USE_MOCK=false; initialize socket on mount; load messages via API; listen for 'message' events; emit messages via socket.
4. Fixed getAllPosts to transform data to match frontend expectation.
5. Tested API endpoints: signup, login, get messages, create message.
