var  peer = new Peer({key:'dd0d447c-2117-4c67-9df1-ff02cca9c355',debug: 3});
var localVideo = document.getElementById('local_video');
var kaku = document.getElementById('kaku');
var addVideo = document.getElementById('stream-add')
var chat = document.getElementById('chat')
var localStream;
var roomName;
var room;

navigator.mediaDevices.getUserMedia({audio: true,video: true,}).then(function(stream){
  localVideo.srcObject = stream;
  localVideo.playsInline = true;
  localVideo.play().catch(console.error);
localStream = stream;
}).catch(console.error);

 function startVideo() {
    roomName = document.getElementById('room-id').value;
    if (!roomName) {
        return;
    }

    room = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
    room.on('stream', function(stream){
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      newVideo.setAttribute('id', `${stream.peerId}`);
      newVideo.setAttribute('style',"width: 320px; height: 240px; border: 1px solid black;");
      addVideo.append(newVideo);
      newVideo.play().catch(console.error);
    });

    room.on('peerLeave',function(peerid){
      const remoteVideo = document.getElementById(`${peerid}`);
     remoteVideo.srcObject = null;
     remoteVideo.remove();
  });

   room.on('data',function(data){
     chat.textContent += `${data.data}\n`;
   });
}

function chatroom(){
     if(!room){
       return;
     }
     const chatword = document.getElementById('chat-text');
     room.send(chatword.value);
     chat.textContent += `${chatword.value}\n`;
     chatword.value = '';
}

      peer.on('open', function(){
        kaku.innerText = kaku.value;
});
