declare module 'libreoffice-convert' {
    interface LibreOfficeConvert {
        convert(input: Buffer, outputFormat: string, filter?: string): Promise<Buffer>;
    }

    const libre: LibreOfficeConvert;
    export = libre;
}
