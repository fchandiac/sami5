const { Grid, Cell, h, html, BaseComponent, PluginPosition } = require("gridjs")
const translate = require("./translate_grid")
const utilities = require('../utilities')
const config = require('../config')
const server_url = 'http://localhost:' + config.port
const orders = require('../promises/orders')
const printer = require('../printer')




function render(order, order_id) {
    let items_per_page = parseInt(((window.screen.availHeight * 0.52) / 55))
    let old_grid = document.getElementById('order_detail_grid')
    old_grid.remove()
    let container_grid = document.getElementById('order_detail_grid_container')
    container_grid.appendChild(utilities.grid_container('order_detail_grid'))

    var grid = new Grid({
        search: false,
        sort: true,
        // pagination: { limit: items_per_page },
        language: translate.es_ES,
        columns: [
            { name: 'Id', width: '0%', hidden: true },//0
            { name: 'Producto', width: '40%' },// 1
            { name: 'Precio', width: '25%' },// 2
            { name: 'Cantidad', width: '20%' },// 3
            { name: 'subtotal', width: '15%' }, // 4

        ],
        data: order.map(item => [
            item.product_id,
            item.Product.name,
            utilities.render_money_string(item.Product.Price.sale),
            item.quanty,
            utilities.render_money_string((item.Product.Price.sale * item.quanty)),

        ])
    });

    grid.plugin.add({
        id: 'TotalOrderPlugin',
        component: TotalOrderPlugin,
        position: PluginPosition.Header,
        props: { 'order': order_id }

    })

   

    grid.plugin.add({
        id: 'ShowStatePugin',
        component: ShowStatePugin,
        position: PluginPosition.Footer,
        props: { 'order': order_id }

    })

    grid.plugin.add({
        id: 'PrintOrder',
        component: PrintOrder,
        position: PluginPosition.Footer,
        props: { 'order': order, 'order_id':order_id }

    })

    grid.render(document.getElementById('order_detail_grid'))
    let new_grid = document.getElementById('order_detail_grid')
    let gridjs_container = new_grid.childNodes[0]

    gridjs_container.style.width = ''
}

class PrintOrder extends BaseComponent {
    constructor(...props) {
        super(...props);
    }

    print() {
        if (printer.print_test_conn() == 'err') {
            utilities.show_alert('Error de conexión con la impresora.', 'err')
        } else {
            printer.print_order(this.props.order, this.props.order_id)
        }
        
       //console.log(this.props.order)
    }

    render() {
        return [
            // h('h1', {}, 'Hello World!'),
            h('button',{onClick: () => this.print(), className:'btn btn-secondary btn-grid-background'}, (html('<i class="bi bi-printer"></i>')))
        ]
      }
}

class ShowStatePugin extends BaseComponent {
    constructor(...props) {
        super(...props);
        this.state = {
            state: '',
        };
    }
    setInfo() {
        orders.find_one_by_id(this.props.order)
            .then(order => {
                // console.log(order)
                if (order.state == true) {
                    this.setState({ state: 'Cerrado' })
                } else if (order.state == false) {
                    this.setState({ state: 'Pendiente' })
                }
            })
    }

    componentDidMount() {
        // initial setState
        this.setInfo();
        this.config.pipeline.on('updated', this.setInfo.bind(this));
    }

    render() {
        return [
            // h('b', {}, html('<br>')),
            h('text', {}, 'Estado: ' + this.state.state + ''),
        ]
    }


}

class TotalOrderPlugin extends BaseComponent {
    constructor(...props) {
        super(...props);
        this.state = {
            total: 0,
        };
    }
    setInfo() {
        // console.log(this.props)

        this.config.pipeline.process().then(data => {
            this.setState({
                total: data.toArray().reduce((prev, row) => prev + utilities.input_money_to_int(row[4]), 0)
            });
        });
    }

    componentDidMount() {
        // initial setState
        this.setInfo();
        this.config.pipeline.on('updated', this.setInfo.bind(this));
    }

    render() {
        return [
            h('h4',{className:'mrgn-bottom'}, 'Pedido: ' + this.props.order),
            h('h6',{className:'mrgn-bottom'}, 'Total: ' + utilities.render_money_string(this.state.total)),
            //h('b', {}, 'Total: ' + utilities.render_money_string(this.state.total)),
            // h('b',{},html('<br>')),
            // h('b', {}, 'Estado: ' + this.state.state)
        ]
    }
}


module.exports = { render }