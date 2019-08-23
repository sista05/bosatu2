'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: 'f8ec837928189acde224626a3f501281',
    channelAccessToken: 'J4zj8C8zZSR7sOQMSGjwCEYESqwh5wEFFQM1YlI9jCxVIdGJM5j7AbFMJomh1h/yQkVRRBERpforxLwTBLH/FzOFMBz0i/WqXYiWAMiTEwMY0NWFsIrG275DJD3H3Kj22MwrqaQnx3UL8TSexPHoYwdB04t89/1O/w1cDnyilFU='
};

const app = express();

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    //ここのif分はdeveloper consoleの"接続確認"用なので削除して問題ないです。
    if(req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff'){
        res.send('Hello LINE BOT!(POST)');
        console.log('疎通確認用');
        return;
    }

    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  let mes = '';
  console.log('---')
  console.log(event);
  if (event.type !== 'things') {
    return Promise.resolve(null);
  }

  if(event.type === 'things' && event.things.type === 'link'){
    mes = 'デバイスと接続しました。';
  }else if(event.type === 'things' && event.things.type === 'unlink'){
    mes = 'デバイスとの接続を解除しました。';
  }else{
    const thingsData = event.things.result;    
    if (!thingsData.bleNotificationPayload) return
    // bleNotificationPayloadにデータが来る
    const blePayload = thingsData.bleNotificationPayload;
    const buffer = new Buffer.from(blePayload, 'base64');
    const data = buffer.toString('hex');  //Base64をデコード
    console.log(buffer);
    console.log("Payload=" + parseInt(data,16));
    mes = `デバイスから${parseInt(data,16)}が送られてきたよ`;
    const msgObj = {
      type: 'text',
      text: mes //実際に返信の言葉を入れる箇所
    }

    return client.replyMessage(event.replyToken, msgObj);
  }
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
