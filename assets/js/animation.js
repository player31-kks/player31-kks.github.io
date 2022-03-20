const blink = document.querySelector('.blinking__txt');

const typing = function(_, counter = 0) {
    
    const txt = `This is kkyo's Blog`;
  
    setInterval(() => {
      if (txt.length === counter) {
        counter = 0
        blink.textContent=""
        sleep(1500)
      };
      blink.textContent += txt[counter];
      counter++;
    }, 80);
}

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

  
window.addEventListener('load', typing);