
// Attach handler for Event 1 button when DOM is ready
import { AnalyticalLogger, STATUS, EVENT } from './definition.js';


document.addEventListener('DOMContentLoaded', () => {
let logger = new AnalyticalLogger();
registerStatusListener(logger);


  const btn1 = document.getElementById('event1Btn');
  const btn2 = document.getElementById('event2Btn');

  if (!btn1 || !btn2 ) return;

  registerBtn1Handler(btn1, logger);
  registerBtn2Handler(btn2, logger);
});

function registerBtn1Handler(btn, logger) {
    btn.addEventListener('click', () => {
    logger.logEvent(EVENT.CTA_CLICK, { buttonId: 'event1Btn' });
    const display = document.getElementById('displayPlaceholder');
    if (display) {
      display.textContent = 'Event 1 clicked at ' + new Date().toLocaleTimeString();
    }
   });
}

function registerBtn2Handler(btn, logger) {
    btn.addEventListener('click', () => {
    logger.logEvent(EVENT.CTA_CLICK, { buttonId: 'event2Btn' });
    const display = document.getElementById('displayPlaceholder');
    if (display) {
      display.textContent = 'Event 2 clicked at ' + new Date().toLocaleTimeString();
    }
   });
}

function registerStatusListener(logger) {
   logger.registerStatusListener((status, payload) => {
        const statusEl = document.getElementById('displayPlaceholder');
        if (!statusEl) return;
        switch(status){
            case STATUS.IDLE:
                statusEl.textContent = 'Status: Idle';
                break;
            case STATUS.COUNTDOWN:
                statusEl.textContent = `Status: Uploading in ${Math.ceil(payload.timeLeft / 1000)}s`;
                break;
            case STATUS.UPLOADED:
                statusEl.textContent = `Status: Uploaded ${payload.uploadedCount} event(s)`;
                break;

            case STATUS.UPLOADING:
                statusEl.textContent = 'Status: Uploading Events...';
                break;
            default:
                statusEl.textContent = 'Status: Unknown';
        }
    });
}