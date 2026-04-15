export class Notificacion {
    public AsuntoCorreo: string;
    public CuerpoCorreo: string;
    
    constructor() {
        this.AsuntoCorreo = '';
        this.CuerpoCorreo = '';
    }
}

export class TagNotificacion {
    public Key: string;
    public Value: string;
    
    constructor() {
        this.Key = '';
        this.Value = '';
    }
}