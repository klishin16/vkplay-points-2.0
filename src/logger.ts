class Logger {
    public log(message: string, ...optionalParams: any[]){
        console.log(message, ...optionalParams)
    }

    public error(message: string) {
        console.log(message)
    }
}

export const logger = new Logger();
