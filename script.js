/*==========================================================
    MINECRAFT INVITATION
    PARTE 1
===========================================================*/

"use strict";

/*==========================================================
    ESTADO DEL JUEGO
===========================================================*/

const Game = {

    level: 27,

    xp: 72,

    maxXP: 100,

    hearts: 10,

    hunger: 10,

    inventoryOpened: false,

    portalActive: false,

    audioEnabled: true,

    sounds: {},

    particles: [],

    achievements: [],

    chestsOpened: 0

};


/*==========================================================
    ELEMENTOS DEL DOM
===========================================================*/

const UI = {

    invitation: document.querySelector(".invitacion"),

    xpBar: document.querySelector(".xp-bar-fill"),

    level: document.querySelector(".level"),

    message: document.querySelector(".cofre-mensaje"),

    button: document.querySelector(".boton-minecraft"),

    qr1: document.querySelector("#qrBox1"),

    qr2: document.querySelector("#qrBox2"),

    particles: document.querySelector(".xp-particles"),

    chat: document.querySelector(".chat-box")

};


/*==========================================================
    AUDIO
===========================================================*/

const AudioSystem = {

    context: null,

    enabled: true,

    files: {

        click: "audio/click.mp3",

        chest: "audio/chest.mp3",

        xp: "audio/xp.mp3",

        portal: "audio/portal.mp3",

        levelup: "audio/levelup.mp3"

    },

    async init(){

        if(this.context) return;

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        this.context = new AudioContext();

    },

    async play(name){

        if(!this.enabled) return;

        if(!this.context)
            await this.init();

        try{

            const response =
                await fetch(this.files[name]);

            const buffer =
                await response.arrayBuffer();

            const audio =
                await this.context.decodeAudioData(buffer);

            const source =
                this.context.createBufferSource();

            source.buffer = audio;

            source.connect(
                this.context.destination
            );

            source.start();

        }

        catch(e){

            console.log("No se pudo reproducir:",name);

        }

    }

};


/*==========================================================
    CHAT DEL JUEGO
===========================================================*/

function chat(text,type="normal"){

    if(!UI.chat) return;

    const line=document.createElement("div");

    line.className="chat-line";

    if(type!=="normal")
        line.classList.add(type);

    line.textContent="> "+text;

    UI.chat.appendChild(line);

    UI.chat.scrollTop=
        UI.chat.scrollHeight;

}


/*==========================================================
    MENSAJE CENTRAL
===========================================================*/

function message(text,color="#FFFF55"){

    if(!UI.message) return;

    UI.message.textContent=text;

    UI.message.style.color=color;

    UI.message.animate(

        [

            {

                transform:"scale(.9)",

                opacity:.4

            },

            {

                transform:"scale(1.1)",

                opacity:1

            },

            {

                transform:"scale(1)",

                opacity:1

            }

        ],

        {

            duration:350

        }

    );

}


/*==========================================================
    XP
===========================================================*/

function updateXP(){

    if(UI.level){

        UI.level.textContent=Game.level;

    }

    if(UI.xpBar){

        UI.xpBar.style.width=
            Game.xp+"%";

    }

}


/*==========================================================
    VIDA
===========================================================*/

function updateHearts(){

    const hearts=document.querySelectorAll(".heart");

    hearts.forEach((heart,index)=>{

        if(index<Game.hearts){

            heart.style.opacity="1";

        }

        else{

            heart.style.opacity=".2";

        }

    });

}


/*==========================================================
    HAMBRE
===========================================================*/

function updateFood(){

    const food=document.querySelectorAll(".food");

    food.forEach((item,index)=>{

        if(index<Game.hunger){

            item.style.opacity="1";

        }

        else{

            item.style.opacity=".2";

        }

    });

}


/*==========================================================
    LOGROS
===========================================================*/

function unlockAchievement(title){

    if(Game.achievements.includes(title))
        return;

    Game.achievements.push(title);

    chat("Logro desbloqueado: "+title,"success");

    message("🏆 "+title,"#55FF55");

    AudioSystem.play("levelup");

}


/*==========================================================
    EFECTO DE SACUDIDA
===========================================================*/

function shake(element){

    if(!element) return;

    element.animate(

        [

            {transform:"translateX(-6px)"},

            {transform:"translateX(6px)"},

            {transform:"translateX(-4px)"},

            {transform:"translateX(4px)"},

            {transform:"translateX(0px)"}

        ],

        {

            duration:250

        }

    );

}


/*==========================================================
    INICIO
===========================================================*/

function startGame(){

    updateXP();

    updateHearts();

    updateFood();

    chat("Carlos se ha unido al mundo.","success");

    chat("Rodrigo obtuvo el logro: Primaria completada.","system");

    chat("Nueva misión disponible.","warning");

    message("Haz clic en un cofre para comenzar");

}


/*==========================================================
    EVENTO LOAD
===========================================================*/

window.addEventListener("load",()=>{

    startGame();

});

/*==========================================================
    MINECRAFT INVITATION
    PARTE 2
    Partículas + Cofres + Portal
===========================================================*/


/*==========================================================
    PARTÍCULAS XP
===========================================================*/

function createXPParticle(x, y){

    if(!UI.particles) return;

    const xp=document.createElement("div");

    xp.className="xp";

    xp.style.left=x+"px";

    xp.style.top=y+"px";

    xp.style.background=[
        "#7CFC00",
        "#B8FF4D",
        "#AAFF00"
    ][Math.floor(Math.random()*3)];

    xp.style.animationDuration=
        (2+Math.random()*2)+"s";

    UI.particles.appendChild(xp);

    setTimeout(()=>{

        xp.remove();

    },4000);

}


/*==========================================================
    LLUVIA XP
===========================================================*/

function rainXP(amount=25){

    for(let i=0;i<amount;i++){

        setTimeout(()=>{

            createXPParticle(

                Math.random()*window.innerWidth,

                window.innerHeight+40

            );

        },i*60);

    }

}


/*==========================================================
    EXPLOSIÓN XP
===========================================================*/

function explodeXP(x,y){

    for(let i=0;i<35;i++){

        setTimeout(()=>{

            createXPParticle(

                x+(Math.random()*120-60),

                y+(Math.random()*120-60)

            );

        },i*15);

    }

}


/*==========================================================
    ABRIR COFRE
===========================================================*/

function openChest(chest,code,name){

    if(chest.dataset.opened==="true"){

        message("Ese cofre ya fue abierto");

        AudioSystem.play("click");

        return;

    }

    chest.dataset.opened="true";

    Game.chestsOpened++;

    AudioSystem.play("chest");

    shake(chest);

    chest.classList.add("opened");

    message(code,"#FFFF55");

    chat("Abriste el "+name,"success");

    unlockAchievement(name);

    const rect=chest.getBoundingClientRect();

    explodeXP(

        rect.left+rect.width/2,

        rect.top+rect.height/2

    );

    // Verificar si ambos cofres están abiertos
    if(Game.chestsOpened === 2){

        setTimeout(()=>{

            message("¡Has abierto ambos cofres! ¡Misión completada!","#55FF55");
            chat("¡Misión completada! Activa el portal para continuar.","success");
            unlockAchievement("¡Misión Legendaria!");

        },800);

    }

}


/*==========================================================
    COFRES
===========================================================*/

function setupChests(){

    if(UI.qr1){

        UI.qr1.addEventListener("click",()=>{

            openChest(

                UI.qr1,

                "9D9YMJR2YH554WTCWMTC",

                "Cofre del Nether"

            );

        });

    }

    if(UI.qr2){

        UI.qr2.addEventListener("click",()=>{

            openChest(

                UI.qr2,

                "MFYEDTWHCKTDWT3CHK5Y",

                "Cofre del End"

            );

        });

    }

}


/*==========================================================
    PORTAL DEL NETHER
===========================================================*/

function activatePortal(){

    if(Game.portalActive){

        message("El portal ya está activo");

        return;

    }

    if(Game.chestsOpened < 2){

        message("¡Abre los dos cofres primero!","#FF5555");
        chat("Necesitas abrir ambos cofres para activar el portal.","warning");
        shake(UI.button);
        return;

    }

    Game.portalActive=true;

    AudioSystem.play("portal");

    UI.invitation.classList.add("portal-mode");

    rainXP(40);

    message("Portal del Nether activado","#AA55FF");

    chat("El portal se ha abierto.","warning");

    unlockAchievement("¡Portal Activado!");

}


/*==========================================================
    BOTÓN
===========================================================*/

function setupButton(){

    if(!UI.button) return;

    UI.button.addEventListener("click",()=>{

        AudioSystem.play("click");

        activatePortal();

    });

}


/*==========================================================
    SUBIR NIVEL
===========================================================*/

function addXP(points){

    Game.xp+=points;

    if(Game.xp>=100){

        Game.xp=0;

        Game.level++;

        unlockAchievement("¡Subiste de nivel!");

        AudioSystem.play("levelup");

    }

    updateXP();

}


/*==========================================================
    DOBLE CLICK
===========================================================*/

if(UI.invitation){

    UI.invitation.addEventListener("dblclick",(e)=>{

        explodeXP(

            e.clientX,

            e.clientY

        );

        addXP(10);

        message("+10 XP","#55FF55");

    });

}


/*==========================================================
    CLICK DERECHO
===========================================================*/

window.addEventListener("contextmenu",(e)=>{

    e.preventDefault();

    AudioSystem.play("click");

    message("Bloque roto","#AAAAAA");

    explodeXP(

        e.clientX,

        e.clientY

    );

});

/*==========================================================
    MODO NETHER - ACTIVAR PORTAL
===========================================================*/

function activateNetherMode() {
    // Agregar clase al body para el fondo Nether
    document.body.classList.add('portal-active');
    
    // Crear capa de lava
    const lava = document.createElement('div');
    lava.className = 'nether-lava';
    document.body.appendChild(lava);
    
    // Crear partículas de ceniza
    const ashContainer = document.createElement('div');
    ashContainer.className = 'nether-ash';
    document.body.appendChild(ashContainer);
    
    // Generar partículas de ceniza
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const ash = document.createElement('div');
            ash.className = 'ash-particle';
            ash.style.left = Math.random() * 100 + '%';
            ash.style.width = (2 + Math.random() * 4) + 'px';
            ash.style.height = ash.style.width;
            ash.style.animationDuration = (5 + Math.random() * 10) + 's';
            ash.style.animationDelay = (Math.random() * 5) + 's';
            ashContainer.appendChild(ash);
        }, i * 100);
    }
}

/*==========================================================
    MODIFICAR LA FUNCIÓN activatePortal
===========================================================*/

// Reemplaza la función activatePortal existente con esta:
function activatePortal() {
    if (Game.portalActive) {
        message("El portal ya está activo");
        return;
    }

    if (Game.chestsOpened < 2) {
        message("¡Abre los dos cofres primero!", "#FF5555");
        chat("Necesitas abrir ambos cofres para activar el portal.", "warning");
        shake(UI.button);
        return;
    }

    Game.portalActive = true;
    
    AudioSystem.play("portal");
    
    // Activar modo Nether
    activateNetherMode();
    
    UI.invitation.classList.add("portal-mode");
    
    // Lluvia de XP
    rainXP(50);
    
    message("🔥 Portal del Nether activado", "#FF6600");
    chat("El portal se ha abierto. ¡Bienvenido al Nether!", "warning");
    
    unlockAchievement("¡Portal Activado!");
}

/*==========================================================
    MÚSICA DE FONDO
===========================================================*/

const BackgroundMusic = {
    audio: null,
    enabled: true,
    volume: 0.3,
    
    init() {
        try {
            this.audio = new Audio('audio/background.mp3');
            this.audio.loop = true;
            this.audio.volume = this.volume;
            this.audio.preload = 'auto';
        } catch (e) {
            console.log('No se pudo cargar la música de fondo');
        }
    },
    
    play() {
        if (!this.audio || !this.enabled) return;
        
        // Intentar reproducir (puede ser bloqueado por el navegador)
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // El navegador bloqueó la reproducción automática
                console.log('Reproducción automática bloqueada. Esperando interacción...');
                
                // Reproducir cuando el usuario haga clic en cualquier lugar
                const resumeAudio = () => {
                    this.audio.play().catch(() => {});
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                };
                
                document.addEventListener('click', resumeAudio);
                document.addEventListener('keydown', resumeAudio);
            });
        }
    },
    
    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    },
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.audio) {
            this.audio.volume = this.volume;
        }
    }
};

/*==========================================================
    INICIALIZAR MÚSICA
===========================================================*/

// Iniciar música cuando la página cargue
window.addEventListener('load', () => {
    BackgroundMusic.init();
    BackgroundMusic.play();
});

// Si el usuario hace clic en cualquier parte, asegurar que la música suene
document.addEventListener('click', () => {
    if (BackgroundMusic.audio && BackgroundMusic.audio.paused) {
        BackgroundMusic.play();
    }
});

// Detener música en modo portal (si quieres que se detenga)
// Modificar la función activatePortal para detener la música
const originalActivatePortal = activatePortal;

activatePortal = function() {
    if (Game.portalActive) {
        message("El portal ya está activo");
        return;
    }

    if (Game.chestsOpened < 2) {
        message("¡Abre los dos cofres primero!", "#FF5555");
        chat("Necesitas abrir ambos cofres para activar el portal.", "warning");
        shake(UI.button);
        return;
    }

    Game.portalActive = true;
    
    // Detener música de fondo al activar el portal
    BackgroundMusic.stop();
    
    AudioSystem.play("portal");
    activateNetherMode();
    UI.invitation.classList.add("portal-mode");
    rainXP(50);
    message("🔥 Portal del Nether activado", "#FF6600");
    chat("El portal se ha abierto. ¡Bienvenido al Nether!", "warning");
    unlockAchievement("¡Portal Activado!");
};


/*==========================================================
    EFECTO ENTRADA
===========================================================*/

setTimeout(()=>{

    rainXP(30);

},800);


/*==========================================================
    INICIALIZAR
===========================================================*/

setupButton();

setupChests();

