var  peer = new Peer({key:'dd0d447c-2117-4c67-9df1-ff02cca9c355',debug: 3});
var localVideo = document.getElementById('local_video');
var kaku = document.getElementById('kaku');
var localStream;
var roomName;

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

    const call = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
   /*({video: true, audio: true},
     function(stream) { // for success case
       console.log(stream);
       localVideo.srcObject = stream;
     },
     function(err) { // for error case
       console.log(err);
     });*/
	    }

      peer.on('open', function(){
        kaku.innerText = peer.id;
});
