declare interface IGlobalStrings {
    MensajeErrorSinRol: string;
}

declare module "GlobalStrings" {
    const strings: GlobalStrings;
    export = strings;
}