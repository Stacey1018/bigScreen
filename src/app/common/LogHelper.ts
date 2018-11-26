export class LogHelper {
    private static outputLevel = 7;

    public static log(tag: string, msg: any) {
        console.log('%c' + tag + ': ' + msg + '', 'color:blank');
    }

    public static error(tag: string, msg: any) {
        console.log('%c' + tag + ': ' + msg + '', 'color:red');
    }

    public static warning(tag: string, msg: any) {
        console.log('%c' + tag + ': ' + msg + '', 'color:yellow');
    }
}
