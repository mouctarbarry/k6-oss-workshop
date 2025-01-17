// import { WebSocket } from 'k6/ws'
import { WebSocket } from 'k6/experimental/websockets'
import { setInterval } from 'k6/timers';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.5.0/index.js';



const BASE_URL = __ENV.BASE_URL || "ws://localhost:3333";

export default function () {
    const ws = new WebSocket(`${BASE_URL}/ws`);
    ws.addEventListener(`open`, ()=>{
        // new recommandation every 2-8s
        const t = setInterval ( () => {
            ws.send(JSON.stringify({user: `VU ${__VU}`, msg: "new pizza"}));
        }, randomIntBetween(2000, 8000));

        // listen for messages/errors and log them into console
        ws.addEventListener('message', (e)=>{
            const msg = JSON.parse(e.data);
            console.log(`VU ${__VU} received: ${msg.user} msg: ${msg.msg}`)
        })
    })
}