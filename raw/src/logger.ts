class Logger {
    public log(message: string){
        console.log(message)
    }

    public error(message: string) {
        console.log(message)
    }
}

export const logger = new Logger();