const boom = new Audio("./sounds/boom.wav")
const gameover = new Audio("./sounds/gameover.wav")
const bgm = new Audio("./sounds/bg.mp3")
boom.volume = 0.3
gameover.volume = 0.5
bgm.volume = 0.35
const canvas = document.querySelector('canvas') //to select canvas tag in hrml
const contxt = canvas.getContext('2d') // specifing dimensions and invoke canvas api
const scorebox = document.querySelector('#track') //displaying increased score
const highscore = document.querySelector('#trackhigh')

canvas.width = innerWidth //to acquire full width of browser
canvas.height = innerHeight // similar
const a = canvas.width / 2
const b = canvas.height / 2

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    paint() {        //to draw instance over screen
        contxt.beginPath()
        contxt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        contxt.fillStyle = this.color
        contxt.strokeStyle = "#f75c03"; //outline
        contxt.fill()
        contxt.stroke()
    }
}

class Projectile {                                  //new instances of projectile
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    paint() {        //to draw instance over screen
        contxt.beginPath()
        contxt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        contxt.fillStyle = this.color
        contxt.fill()
    }

    update() {
        this.paint()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}

class Enemy {                                  //new instances of enemy
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    paint() {        //to draw instance over screen
        contxt.beginPath()
        contxt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        contxt.fillStyle = this.color
        contxt.fill()
    }

    update() {
        this.paint()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99 //for slowing down exploded particles

class Particle {                                  //new instances of particles
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }
    paint() {        //to draw instance over screen
        contxt.save()
        contxt.globalAlpha = this.alpha
        contxt.beginPath()
        contxt.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        contxt.fillStyle = this.color
        contxt.fill()
        contxt.restore()
    }

    update() {
        this.paint()
        this.velocity.x *= friction     //exploded particles slowed down every frame due to friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01              //fading and disappearing of particles
    }
}

let soundImage = document.getElementById("soundImage");
let button1 = document.getElementById("button1");

function changeIcon() {

    if (soundImage.getAttribute('src') === "./images/mute.png") {
        soundImage.setAttribute('src', "./images/volume.png");
        bgm.play()

    }
    else {
        soundImage.setAttribute('src', "./images/mute.png");
        bgm.pause()
    }
}

button1.addEventListener("click", changeIcon);

//variable initialisation

let player = new Player(a, b, 15, 'white')
let projectiles = []
let enemies = []
let particles = []
let spawntime = 1100
let frame_id
let score = 0






function enemyspawn() {

    setInterval(() => {

        const radius = Math.random() * (65 - 5) + 5
        let x
        let y
        //randomising spawn positions
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
            x = Math.random() * canvas.width
        }

        //randomising spawn color
        const color = `hsl(${Math.random() * 360},100%,50%)`

        const angle = Math.atan2(canvas.height / 2 - y,
            canvas.width / 2 - x)

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, spawntime)
}

function animate() {
    frame_id = requestAnimationFrame(animate)
    contxt.fillStyle = 'rgba(0,0,0,0.15)'  //opacity attribute used to witness tail fading of projectile
    contxt.fillRect(0, 0, canvas.width, canvas.height)
    player.paint()
    particles.forEach((particle, particle_index) => {
        //removal of faded particle
        if (particle.alpha <= 0) {
            particles.splice(particle_index, 1)
        }
        else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()

        //if projectile reaches out of the screen remove them
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, e_index) => {
        enemy.update()

        const pdistance = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        //when enemy colliodes core
        if (pdistance - enemy.radius - player.radius < 1) {
            gameover.play()
            cancelAnimationFrame(frame_id) //stops at that frame
            bgm.pause()
            scorebox.innerHTML = score
            alert("Game Over!!   Your Score is  " + score + "\npress space to restart! ");

        }

        projectiles.forEach((projectile, p_index) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            //when player projectile hits enemy
            if (distance - enemy.radius - projectile.radius < 1) {

                //explosion part
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(projectile.x + projectile.radius * 2, projectile.y + projectile.radius * 2, Math.random() * 3, enemy.color, {
                            x: (Math.random() - 0.5) * (Math.random() * 7),
                            y: (Math.random() - 0.5) * (Math.random() * 7)
                        })
                    )

                }
                //shrinking part
                if (enemy.radius - 10 > 5) {
                    //increase score

                    score += 100
                    scorebox.innerHTML = score
                    if (score > hiscoreval) {
                        hiscoreval = score;
                        localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
                        highscore.innerHTML = hiscoreval;
                    }

                    //gsap library is used to improve shrinking effect
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(p_index, 1)
                    }, 0)

                }
                else {
                    //increase score
                    score += 300
                    scorebox.innerHTML = score
                    if (score > hiscoreval) {
                        hiscoreval = score;
                        localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
                        highscore.innerHTML = hiscoreval;
                    }
                    setTimeout(() => {
                        boom.play()
                        enemies.splice(e_index, 1)
                        projectiles.splice(p_index, 1)
                    }, 0)
                }


            }
        })
    })



}

addEventListener('click', (event) => {
    //determining direction of projectile to mouse click
    const angle = Math.atan2(event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2)

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))

})

//game loop
let hiscore = localStorage.getItem("hiscore");
if (hiscore === null) {
    hiscoreval = 0;
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval))
}
else {
    hiscoreval = JSON.parse(hiscore);
    highscore.innerHTML = hiscore;
}

animate()
enemyspawn()


//if on key press of space game is restarted
document.body.onkeyup = function (e) {
    if (e.keyCode == 32) {
        location.reload()
    }
}
