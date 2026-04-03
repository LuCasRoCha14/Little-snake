const canvas = document.querySelector('canvas') // Seleciona o canvas e o contexto 2D onde o jogo será desenhado
const ctx = canvas.getContext("2d")

const score = document.querySelector(".score--value") // Elementos da interfac
const FinalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

const audio = new Audio('../assents/audio.mp3') // Áudio quando a cobra come a comida

const jumpscareVideo = document.createElement('video') // Cria o vídeo do jumpscare

jumpscareVideo.src = '../assents/nemesius.mp4' // Estilização do vídeo para ocupar a tela toda
jumpscareVideo.style.display = 'none'
jumpscareVideo.style.position = 'fixed'
jumpscareVideo.style.top = '0'
jumpscareVideo.style.left = '0'
jumpscareVideo.style.width = '100vw'
jumpscareVideo.style.height = '100vh'
jumpscareVideo.style.objectFit = 'cover'
jumpscareVideo.style.zIndex = '9999'
document.body.appendChild(jumpscareVideo) // Adiciona o vídeo no body do HTML

// Tamanho de cada bloco da cobra e comida
const size = 30 

// Posição inicial da cobra
const initialPosition = { x: 270, y: 240 } 
// Array que representa a cobra
let snake = [{ x: 270, y: 240 }] 
// // Controle de game over
let isGameOver = false 


// Gera número aleatório entre min e max
const incrementScore = () => {  // Função que aumenta o score
    score.innerText = parseInt(score.innerText) + 10
}

/// Gera número aleatório entre min e max
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

// Gera posição aleatória baseada na grade do jogo
const randomPosition = () => {
    const number =  randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30

}

// Gera cor aleatória para a comida
const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const   blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

// Objeto da comida
const food = {
    x:randomPosition(),
    y:randomPosition(),
    color: randomColor()
}

// Direção da cobra e ID do loop
let direction, loopId

// desenha da comida
const drawFood = () => {

    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 6
    ctx.fillStyle = food.color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

// desenha a cobra
const  drawSnake = () => {
    ctx.fillStyle = "#006400"
    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "green"
        }
        ctx.fillRect(position.x, position.y, size, size)
    } )
}

// movimentação da cobra
const moveSnake = () => {
    if (!direction) return
    
    const head = snake[snake.length - 1]
    
    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }
    
    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }
    
    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size })
    }

    snake.shift()
}

// desenha a grade do jogo
const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }

    
    

}

// verifica se a cobra comeu a comdia
const chackEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        snake.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()
        
         // Evita nascer comida em cima da cobra
        while (snake.find((position) => position.x == x && position.y == y)) {
        x = randomPosition()
        y = randomPosition()

        }

        food.x = x
        food.y = y
        food.color = randomColor() 
    }

}

// Verifica colisão com parede ou com a própria cobra
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2
    
    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || selfCollision ) {
        gameOver()
    }
}

// função do gamer over
const gameOver = () => {
    direction = undefined

    menu.style.display =  "flex" 
    FinalScore.innerText = score.innerText
    canvas.style.filter = "blur(2px)"

    if (isGameOver) return //isso aqui que garante que o vídeo fique repetindo
    isGameOver = true

    jumpscareVideo.style.display = "block"
jumpscareVideo.play()

jumpscareVideo.onended = () => {
        jumpscareVideo.style.display = "none"
        menu.style.display =  "flex" 
        FinalScore.innerText = score.innerText
        canvas.style.filter = "blur(2px)"
}

}

// Loop principal do jogo
const gameloop = () => {
    clearInterval(loopId)
    
    ctx.clearRect(0, 0, 600, 600)
    drawGrid()
    drawFood()
    moveSnake()
    drawSnake()
    chackEat()
    checkCollision()

    loopId = setTimeout(() => {
        gameloop()
    }, 300)
}

// Inicia o jogo
gameloop()

// Controles do teclado
document.addEventListener("keydown", ({ key }) => {
    if (key == "d" && direction != "left") {
        direction = "right"
    }

    if (key == "a" && direction != "right") {
        direction = "left"
    }

    if (key == "s" && direction != "up") {
        direction = "down"
    }

    if (key == "w" && direction != "down") {
        direction = "up"
    }

    if (isGameOver) return
    
})

// Botão de jogar novamente
buttonPlay.addEventListener("click", () => {
    score.innerText = "00"
    menu.style.display = "none"
    canvas.style.filter = "none"
    snake = [{ x: 270, y: 240 }]
    isGameOver = false
})
