var localVideo = document.getElementById('local_video');
var kaku = document.getElementById('kaku');
var addVideo = document.getElementById('stream-add');
var participant = document.getElementById('participant');
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

navigator.mediaDevices.getUserMedia({audio: true,video: true,}).then(function(stream){//自分のstreamをとるための処理
  localVideo.srcObject = stream;
  localVideo.playsInline = true;
  localVideo.play().catch(console.error);
localStream = stream;
}).catch(console.error);

 function startVideo() {//ユーザー名とルーム名を入力して会議に参加する
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
    const newuser = document.createElement('a');
    newuser.setAttribute(`id`,`${userName}`);
    newuser.setAttribute(`href`,`#`);
    newuser.setAttribute(`class`,`participant_name`);
    newuser.setAttribute('onclick', `Time(this)`);
    newuser.innerText = userName + "(自分)";
    participant.append(newuser);


    room.on('open',function(){//ルームに参加したときに実行される処理
      const data = ['name',userName,peer.id];
      room.send(data);
      chat.textContent += `ルーム　${roomName} に参加しました\n`;
    })

    room.on('peerJoin',function(id){//他のユーザーがルームに参加したときに実行される処理
     setTimeout(function(){
       const data = [id,userName,peer.id,entrytiem,userData,userId];
       room.send(data);
     },300);
    })

    room.on('stream', function(stream){//他のユーザーからstreamが送られてきたときに実行される処理
      setTimeout(function(){
        peerStream = stream;
        peerId = stream.peerId;
        const peerName = userId[`${peerId}`]
        const newVideo = document.createElement('video');
        const check = document.getElementById(`${peerName}`);
        newVideo.srcObject = stream;
        newVideo.playsInline = true;
        newVideo.setAttribute('id', `${stream.peerId}`);
        newVideo.setAttribute('data-name',`${peerName}`);
        newVideo.setAttribute('onclick', `clicktest(this)`);
        newVideo.setAttribute('style',"width: 320px; height: 240px; border: 1px solid black;");
        addVideo.append(newVideo);
        newVideo.play().catch(console.error);
        for(const name in userData){
          const check = document.getElementById(`${name}`)
          if(!userData[name] && !check){
            const exituser = document.createElement('p');
            exituser.setAttribute(`id`,`${peerName}`);
            exituser.setAttribute(`class`,`participant_name`);
            exituser.setAttribute('onclick', `Time(this)`);
            exituser.innerText = name;
            exituser.style.backgroundColor = "silver";
            participant.append(exituser);
          }
        }
        if(!check){
        const newuser = document.createElement('p');
        newuser.setAttribute(`id`,`${peerName}`);
        newuser.setAttribute(`class`,`participant_name`);
        newuser.setAttribute('onclick', `Time(this)`);
        newuser.innerText = peerName;
        participant.append(newuser);
      }else{
        check.style.backgroundColor = "white";
      }
        kaku.innerText = Object.keys(entrytiem);
      },500);
    });

    room.on('peerLeave',function(peerid){//他のユーザーがルームから退出したときに実行される処理
      const time = new Date();
      const remoteVideo = document.getElementById(`${peerid}`);
      const leaveName = remoteVideo.dataset.name;
      const exit = document.getElementById(`${leaveName}`)
    　entrytiem[`${leaveName}`].push(`退室　${time.getHours()}時${time.getMinutes()}分`);
      userData[`${leaveName}`] = null;
      delete userId[`${peerId}`];
    　chat.textContent += `${leaveName}が退出しました\n`;
      exit.style.backgroundColor = "silver";
    　remoteVideo.srcObject = null;
    　remoteVideo.remove();
    　kaku.innerText = entrytiem[`${leaveName}`][1];
  });

   room.on('data',function(data){//他のユーザーからデータが送られてきた時に実行される処理
     const time = new Date();
     if(data.data[0] == 'chat'){//チャットデータが送られてきた時
     　chat.textContent += `${data.data[2]}:${data.data[1]}\n`;
   }else if(data.data[0] == `name`){//他のユーザーのデータが送られてきた時
     if(!(data.data[1] in userData)){//新規で参加してきたユーザー
     　userData[`${data.data[1]}`] = data.data[2];
     　userId[`${data.data[2]}`] = data.data[1];
     　entrytiem[`${data.data[1]}`] = [`入室　${time.getHours()}時${time.getMinutes()}分`];
     　chat.textContent += `${data.data[1]} が参加しました\n`;
   　}else{//前に参加していたユーザー
     　　userData[`${data.data[1]}`] = data.data[2];
     　　userId[`${data.data[2]}`] = data.data[1];
     　　entrytiem[`${data.data[1]}`].push(`入室　${time.getHours()}時${time.getMinutes()}分`);
     　　chat.textContent += `${data.data[1]} が再参加しました\n`;
     　　}
   }else if(data.data[0] == peer.id){//個別で送られてきたデータ
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

function chatroom(){//チャットに書き込むための処理
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
  const entry = entrytiem[`${stream.dataset.name}`]
  kaku.innerText = entry;
}

function Time(name){
  const entry = entrytiem[`${name.id}`];
  const entrytext = document.getElementById("entrytext");
  entrytext.innerText = `${entry}\n`;

}
