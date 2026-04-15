export class AttachmentData {
    public Files?:any[];
    public ToUpload?:any[];
    public ToDelete?:any[];

    constructor(){
        this.Files = [];
        this.ToUpload = [];
        this.ToDelete = [];
    }
}