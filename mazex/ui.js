class UI {
    constructor() {
        this.screens = {
            menu: document.getElementById('screen-menu'),
            levels: document.getElementById('screen-levels'),
            pause: document.getElementById('screen-pause'),
            complete: document.getElementById('screen-level-complete')
        };
        this.hud = document.getElementById('hud');
        this.mobile = document.getElementById('mobile-controls');
        
        // Detect mobile
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            this.mobile.classList.remove('hidden');
        }
    }
    
    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        if(name === 'hud') {
            this.hud.classList.remove('hidden');
        } else if(this.screens[name]) {
            this.hud.classList.add('hidden');
            this.screens[name].classList.remove('hidden');
        }
    }
    
    updateHUD(health, energyMax, energyCur, level, score) {
        document.getElementById('hud-health').innerText = `❤️ ${health}`;
        document.getElementById('hud-energy').innerText = `🔋 ${energyCur}/${energyMax}`;
        document.getElementById('hud-level').innerText = `LEVEL ${level.toString().padStart(2, '0')}`;
        document.getElementById('hud-score-val').innerText = score;
    }
}
