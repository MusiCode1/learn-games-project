
const enableLogger = true;

function log(...args) {

    if(enableLogger) {
        console.log(...args)
    }
}

export default {
    log
}