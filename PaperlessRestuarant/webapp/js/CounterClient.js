/**
 * CounterClient class. for interfacing with the server as a Counter view.
 */


class CounterClient {
    _current_tables = [];
    _socket = io("/counter");
    _update_callback = null;

    get socket() { return this._socket; }
    get tables() { return this._current_tables; }

    constructor() {
        this.update();
    }

    sync(timeout) {
        setInterval(() => this.update(), timeout);
    }

    update() {
        //gets only orders that are SERVED and ready to pay.
        this.socket.emit("get_tables");
        this.socket.off("get_tables_result");
        let client = this;
        this.socket.on("get_tables_result", function (response) {
            console.log(response)
            if (response.success) {
                client._update_tables(response.tables);
                if (client._update_callback) client._update_callback(client.tables);
            } else {
                alert("server responded with an error: " + response.reason);
            }
        });
    }
    billTable(tableNum) {
        this.socket.emit("bill_table", { table: tableNum });
        this.socket.off("bill_table_result");
        this.socket.on("bill_table_result", function (response) {
            if (response.success) {
                console.log("Successfully billed table " + tableNum);
            }
            else console.log(response.reason);
        });
    }
    cancelPending(tableNum) {
        //cancels all PENDING (status = 2 or 1) orders for this table. Allows for billing. 
        this.socket.emit("cancel_pending", { table: tableNum });
        this.socket.off("cancel_pending_result");
        this.socket.on("cancel_pending_result", function (response) {
            if (response.success) {
                console.log("Successfully cancelled " + response.ordersCancelled + " pending orders for table " + tableNum);
            }
            else console.log(response.reason);
        });
    }

    _update_tables(tables) {
        for (let table of tables) {
            for (let order of table.orders) {
                //order.status = Object.keys(tablestatus)[order.status - 1].toLowerCase();
                order.orderTime = new Date(order.orderTime);
            }
        }
        this._current_tables = tables;
        console.log(tables);
    }

    onUpdate(callback) {
        this._update_callback = callback;
    }
}