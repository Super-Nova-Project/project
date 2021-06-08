'use strict';
const peerObj = {};
let peerKeyArray = [];
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
myVideo.muted = true;
const shareScreenB = document.getElementById('shareScrean');






// eslint-disable-next-line no-undef
const socket = io('/');
// eslint-disable-next-line no-undef
const peer = new Peer();
// eslint-disable-next-line no-undef



peer.on('open', (id) => {
  // eslint-disable-next-line no-undef
  console.log('peer id ', id);
  peerKeyArray.push(id);
  // eslint-disable-next-line no-undef
  socket.emit('join-room', roomId, id);

});


// add video to your page
const addVideoStream = async(video, stream) => {
  video.srcObject = await stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};




async function callStream(stream) {
  addVideoStream(myVideo, stream);
  let x = await stream;

  peer.on('call', call => {
    call.answer(x);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
      console.log('CLOSED');
      video.remove();
    });
    // peerObj[userId] = call;
  });
  socket.on('user-connected', (userId) => {
    console.log('first time ');
    setTimeout(() => {
      connectToNewUser(userId, x);
    }, 5000);
  });
}
const myNavigator = navigator.mediaDevices.getUserMedia({ video: true, audio: true }) || navigator.mediaDevices.webkitGetUserMedia({ video: true, audio: true }) || navigator.mediaDevices.mozGetUserMedia({ video: true, audio: true }) || navigator.mediaDevices.msGetUserMedia({ video: true, audio: true });
callStream(myNavigator);


const connectToNewUser = async(userId, stream) => {
  let x = await stream;
  const call = peer.call(userId, x);

  const video = document.createElement('video');

  call.on('stream', function(userVideoStream) {
    console.log('I CALLED');

    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    console.log('CLOSED');
    video.remove();
  });
  ////////////////////////////////////////////


  peerObj[userId] = call;

};

// socket.client error handler 
socket.on('connect_error', err => {
  console.log(err instanceof Error); // true
  console.log(`connect_error due to ${err.message}`); // not authorized
  console.log(err.data); // { content: "Please retry later" }
});


// alert that a user joined to the browser       //////////////////////////////////////////////////////////////////////////
socket.on('userId-Joined', userid => {
  let name = prompt('give me ur name');
  if (name === null) {
    name = 'black guy from Connan';
  }
  appendMessage(`user :${name} has recently joined`);
  socket.emit('sendUserToServer', name);
});

// append the user name to message container
socket.on('sendBackUserToFrontEnd', name => {
  appendMessage(`user :${name} has recently joined`);
});


// when a user close the browser
socket.on('user-disconnected', (name, id) => {

  peerObj[id].close();
  appendMessage(`user:${name} has been disconnected`);
});


// APPENDING UR MESSAGE TO THE CONTAINER AND SENDING IT TO THE SERVER
messageForm.onsubmit = eventSubmit;

function eventSubmit(event) {
  event.preventDefault();
  const message = messageInput.value;
  if (message !== '') {
    appendMessage(`YOU:${message}`);
    socket.emit('sendMassageToServer', message);
    messageInput.value = '';
  }
}

// WRITE THE MESSAGE THAT CAME BACK FROM THE SERVER
socket.on('sendMassageBackToFrontEnd', (message, name) => {
  appendMessage(`${name}:${message}`);
});



// to append a message to the chat container
function appendMessage(message) {
  const messageElement = document.createElement('section');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}


//  share screen function 
let share;
async function shareScreen() {
  return await navigator.mediaDevices.getDisplayMedia({ video: true });
}

shareScreenB.addEventListener('click', function name(event) {
  event.preventDefault();
  const video = document.createElement('video');
  video.setAttribute('class', 'share');
  video.muted;
  share = shareScreen();
  addVideoStream(video, share);
  socket.emit('share');
});


socket.on('user-share', (userId) => {
  console.log('user-share', userId);
  connectNewShare(userId, share);
});


async function connectNewShare(userId, stream) {
  const call = peer.connect(userId, stream);
  const video = document.createElement('video');
  video.setAttribute('class', 'share');
  console.log('call', call);


  console.log('?');
  call.on('stream', function(userVideoStream) {
    console.log('gg');
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    console.log('CLOSED');
    video.remove();
  });
}