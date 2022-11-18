const { Grid, Cell, h, html, BaseComponent, PluginPosition } = require("gridjs")
const translate = require("./translate_grid")
const utilities = require('../utilities')
const config = require('../config')
const server_url = 'http://localhost:' + config.port
const moment = require('moment');




function render(products_sales, start, end) {
    let old_grid = document.getElementById('sales_pro_grid')
    old_grid.remove()
    let container_grid = document.getElementById('sales_pro_grid_container')
    container_grid.appendChild(utilities.grid_container('sales_pro_grid'))

    var grid = new Grid({

        search: true,
        sort: true,
        // pagination: true,
        language: translate.es_ES,
        columns: [
            { name: 'id', width: '8%' },
            { name: 'Producto', width: '30%' },
            { name: 'Categoría', width: '20%' },
            { name: 'Total Cantidad', width: '20%' },
            { name: 'Total $', width: '16%', },
            { name: 'total', width: '16%', hidden: true },
        ],
        data: products_sales.map(item => [item.ProductId, item.Product.name, item.Product.Category.name, item.quanty_sum, utilities.render_money_string(item.subtotal_sum), item.subtotal_sum])
    });


    grid.plugin.add({
        id: 'TitlePlugin',
        component: TitlePlugin,
        position: PluginPosition.Header,
    })

    grid.plugin.add({
        id: 'TitleReportPlugin',
        component: TitleReportPlugin,
        position: PluginPosition.Footer,
        props: { 'start': start, 'end':end }
    })

    grid.plugin.add({
        id: 'TotalQuantyPlugin',
        component: TotalQuantyPlugin,
        position: PluginPosition.Footer,

    })
    grid.plugin.add({
        id: 'TotalMoneyPlugin',
        component: TotalMoneyPlugin,
        position: PluginPosition.Footer,

    })

    grid.render(document.getElementById('sales_pro_grid'))



    let new_grid = document.getElementById('sales_pro_grid')
    let gridjs_container = new_grid.childNodes[0]
    gridjs_container.style.width = ''


}

class TitlePlugin extends BaseComponent {
    render() {
        return h('h5', {}, 'Ventas Por Producto');
    }
}

class TitleReportPlugin extends BaseComponent {

    constructor(...props) {
        super(...props);

        
    }

    render() {
        return h('h6', {}, 'Reporte del '+ this.props.start + ' al ' + this.props.end);
    }
}

class TotalQuantyPlugin extends BaseComponent {
    constructor(...props) {
        super(...props);

        this.state = {
            total: 0
        };
    }

    setTotal() {

        this.config.pipeline.process().then(data => {
            this.setState({
                //total: data.toArray().reduce((prev, row) => prev + row[5], 0)
                total: data.toArray().reduce((prev, row) => prev + row[3], 0)
            });
        });
    }

    componentDidMount() {
        this.setTotal();
        this.config.pipeline.on('updated', this.setTotal.bind(this));
    }

    render() {
        return h('b', {}, 'Total Cantidad Productos Vendidos: ' + this.state.total)
    }
}

class TotalMoneyPlugin extends BaseComponent {
    constructor(...props) {
        super(...props);

        this.state = {
            total: 0
        };
    }

    setTotal() {

        this.config.pipeline.process().then(data => {
            this.setState({
                //total: data.toArray().reduce((prev, row) => prev + row[5], 0)
                total: data.toArray().reduce((prev, row) => prev + row[5], 0)
            });
        });
    }

    componentDidMount() {
        this.setTotal();
        this.config.pipeline.on('updated', this.setTotal.bind(this));
    }

    render() {
        return [
            h('b', {}, html('<br>')),
            h('b', {}, 'Total Monetario Productos Vendidos: ' + utilities.render_money_string(this.state.total))]
    }
}





module.exports = { render }