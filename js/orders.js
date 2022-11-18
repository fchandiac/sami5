
const orders_promises = require('./promises/orders')
const orders_grid = require('./grids/orders')
const config = require('./config')
const utilities = require('./utilities')


var locale = Array.from(config.locale)
locale = locale[2]
locale = parseInt(locale)

const delete_past_orders_btn = document.getElementById('delete_past_orders_btn')
const delete_closes_orders_btn = document.getElementById('delete_closes_orders_btn')



delete_closes_orders_btn.addEventListener('click', () => {
    orders_promises.destroy_close_orders()
        .then(
            orders_grid.render()
        )
        .catch(err => {
            console.log(err)
        })
})

delete_past_orders_btn.addEventListener('click', () => {
    let today = moment(new Date()).format('yyyy-MM-DD')
    today = today + 'T00:00:00Z'
    today = moment(today).add(locale, 'hours')
    orders_promises.destroy_past_orders(today)
        .then(orders_grid.render())
        .catch(err => {
            console.log(err)
        })
})





