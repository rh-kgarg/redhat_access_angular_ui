export class UndoRedoLogger {
    name;
    record;
    recycle;

    constructor(name = 'undoredologger') {
        this.name = name;
        this.record = [];
        this.recycle = [];
    }

    updateRecord(value) {
        return this.record.push(value);
    };

    getRecord() {
        return this.record;
    };

    getLastRecord() {
        const length = this.record && this.record.length;
        return this.record[length - 1];
    }
    
    undo(callback) {
        // don't remove last item from the record.
        if (this.record.length === 0) {
            return;
        }
        const lastRecord = this.record.pop();
        this.recycle.push(lastRecord);
        typeof callback === 'function' && callback(this.getLastRecord());
    }

    redo(callback) {
        if (this.recycle.length > 0) {
          const history = this.recycle.pop();
          if (history === undefined) {
            return;
          }
          this.record.push(history);
          typeof callback === 'function' && callback(this.getLastRecord());
        }    
    }
    
    cleanRedoList(callback) {
        this.recycle = [];
        typeof callback === 'function' && callback();
    }
    cleanUndoList(callback) {
        this.record = [];
        typeof callback === 'function' && callback();
    }
};