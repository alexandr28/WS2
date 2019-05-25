let ws = null,
    thechart = null
const dataChart = [5, 15, 12]
const systemMessage = document.getElementById('systemMessage')
const usrName = document.getElementById('usrName')
const password = document.getElementById('password')
const btnLogin = document.getElementById('btnLogin')
const txtmsg = document.getElementById('txtmsg')
const btnsendMessage = document.getElementById('btnsendMessage')
const product = document.getElementById('product')
const quantity = document.getElementById('quantity')
const btnSale = document.getElementById('btnSale')
const content = document.getElementById('content')
const myChart = document.getElementById('myChart')


const setSystemMessage = data => {
    systemMessage.textContent = data
}
const login = async () => {
    const user = {
        name: usrName.value,
        password: password.value,
    }
    const header = new Headers()
    header.append('content-type', 'application/json')
    const options = {
        method: 'POST',
        headers: header,
        body: JSON.stringify(user)
    }
    let data = {}
    const response = await fetch('/login', options)
    switch (response.status) {
        case 200:
            data = await response.json()
            connectWS(data)
            setSystemMessage('conectado correctamente')
            loadChart()
            break;
        case 401:
            setSystemMessage('Usuario o contraseña no valido')
            break;
        default:
            setSystemMessage('Estado no esperando: ' + response.status)
            break;
    }
}
btnLogin.addEventListener('click', e => {
    e.preventDefault()
    login()
})

const connectWS = data => {
    ws = new WebSocket(`ws://localhost:9999/ws?uname=${usrName.value}&token=${data.token}`)
    ws.onopen = e => {
        setSystemMessage("conectado al websocket correctamente")
    }
    ws.onerror = e => {
        setSystemMessage(e)
    }
    ws.onmessage = e => {
        const data = JSON.parse(e.data)
        switch (data.type) {
            case 'message':
                content.insertAdjacentHTML('beforeend', `<div>De: ${data.data_response.name}, Mensaje: ${data.data_response.message} </div>`)
                break;
            case 'sale':
                dataChart[data.data_sale.product] += data.data_sale.quantity
                thechart.update()
                break;
            case 'pong':
                console.log('sigo conectado')
                break;
            default:
                setSystemMessage('Recibí un tipo de mensaje desconocido')
        }
    }
    // ping para que no se corte la conexion del websocket
    setInterval(() => {
        ws.send(JSON.stringify({
            type: 'ping'
        }))
    }, 60000)
}

btnsendMessage.addEventListener('click', e => {
    e.preventDefault()
    //TODO validar que el mensaje no este vacio
    const data = {
        type: "message",
        message: txtmsg.value
    }
    ws.send(JSON.stringify(data))
})

btnSale.addEventListener('click', e => {
    e.preventDefault()
    //TODO validar la cantidad mayor a cero
    const data = {
        type: 'sale',
        product: parseInt(product.value, 10),
        quantity: parseInt(quantity.value, 10)
    }
    ws.send(JSON.stringify(data))
})

const loadChart = () => {
    const ctx = myChart.getContext('2d')
    myChart.width = 400
    myChart.height = 400
    thechart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Zapatos', 'Camisas', 'Billtereas'],
            datasets: [{
                label: 'Sales',
                data: dataChart,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
}