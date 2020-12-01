var localVideo = document.getElementById('local_video');
var kaku = document.getElementById('kaku');
var addVideo = document.getElementById('stream-add');
var chat = document.getElementById('chat');
var peer = new Peer({key:'dd0d447c-2117-4c67-9df1-ff02cca9c355',debug: 3});
var userName;
var userData = {};
var userId = {};
var entrytiem = {};
var localStream;
var roomName;
var room;
var peerStream;
var peerId;

navigator.mediaDevices.getUserMedia({audio: true,video: true,}).then(function(stream){
  localVideo.srcObject = stream;
  localVideo.playsInline = true;
  localVideo.play().catch(console.error);
localStream = stream;
}).catch(console.error);

 function startVideo() {
    const time = new Date();
    roomName = document.getElementById('room-id').value;
    userName = document.getElementById('name').value;
    if (!roomName || !userName) {
        return;
    }

    room = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
    userData[`${userName}`] = peer.id;
    userId[`${peer.id}`] = userName;
    entrytiem[`${userName}`] = [`入室　${time.getHours()}時${time.getMinutes()}分`];

    room.on('open',function(){
      const data = ['name',userName,peer.id];
      room.send(data);
      chat.textContent += `ルーム　${roomName} に参加しました\n`;
    })

    room.on('peerJoin',function(id){
     setTimeout(function(){
       const data = [id,userName,peer.id,entrytiem,userData,userId];
       room.send(data);
     },300);
    })

    room.on('stream', function(stream){
      setTimeout(function(){
      peerStream = stream;
      peerId = stream.peerId;

      const peerName = userId[`${peerId}`]
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      newVideo.setAttribute('id', `${stream.peerId}`);
      newVideo.setAttribute('data-name',`${peerName}`);
      newVideo.setAttribute('onclick', `clicktest(this)`);
      newVideo.setAttribute('style',"width: 320px; height: 240px; border: 1px solid black;");
      addVideo.append(newVideo);
      newVideo.play().catch(console.error);
      kaku.innerText = Object.keys(entrytiem);
    },500);
    });

    room.on('peerLeave',function(peerid){
      const time = new Date();
      const remoteVideo = document.getElementById(`${peerid}`);
      const leaveName = remoteVideo.dataset.name;
      entrytiem[`${leaveName}`].push(`退室　${time.getHours()}時${time.getMinutes()}分`);
     remoteVideo.srcObject = null;
     remoteVideo.remove();
     kaku.innerText = entrytiem[`${leaveName}`][1];
  });

   room.on('data',function(data){
     const time = new Date();
     if(data.data[0] == 'chat'){
     chat.textContent += `${data.data[2]}:${data.data[1]}\n`;
   }else if(data.data[0] == `name`){
     if(!userData[`${data.data[1]}`]){
     userData[`${data.data[1]}`] = data.data[2];
     userId[`${data.data[2]}`] = data.data[1];
     entrytiem[`${data.data[1]}`] = [`入室　${time.getHours()}時${time.getMinutes()}分`];
     chat.textContent += `${data.data[1]} が参加しました\n`;
     }else{
     const oldid = userData[`${data.data[1]}`];
     userData[`${data.data[1]}`] = data.data[2];
     delete userId[`${oldid}`];
     userId[`${data.data[2]}`] = data.data[1];
     entrytiem[`${data.data[1]}`].push(`入室　${time.getHours()}時${time.getMinutes()}分`);
     chat.textContent += `${data.data[1]} が再参加しました\n`;
     }
   }else if(data.data[0] == peer.id){
     entrytiem = Object.assign({},data.data[3]);
     userData = Object.assign({},data.data[4]);
     userId = Object.assign({},data.data[5]);
   }
   });

}

function test(){
  if(!peerStream){
    kaku.innerText = `none`
    return;
  }
  const remoteVideo = document.getElementById(`${peerId}`);
  remoteVideo.srcObject = null;
  kaku.innerText = remoteVideo.srcObject;
  remoteVideo.srcObject = peerStream;
  remoteVideo.play().catch(console.error);
}

function chatroom(){
     if(!room){
       return;
     }
     const chatword = document.getElementById('chat-text');
     const date = ['chat',chatword.value,userName];
     room.send(date);
     chat.textContent += `${chatword.value}\n`;
     chatword.value = '';
}

      peer.on('open', function(){
        kaku.innerText = `${localVideo.id}`;
});

function clicktest(stream){
  var entry = entrytiem[`${stream.dataset.name}`]
  kaku.innerText = entry;
}
