export type EditorFile = {
    name: string;
    handle: FileSystemFileHandle | undefined;
    content: string;
};
console.log(32);
export async function openFile(): Promise<EditorFile | undefined> {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [
                {
                    description: "Typescript Files",
                    accept: {
                        "text/plain": [".ts"],
                    },
                },
            ],
            multiple: false, // Set to true for selecting multiple files
        });

        const file = await fileHandle.getFile();
        const reader = new FileReader();

        return new Promise((resolve) => {
            reader.onerror = () => {
                console.error("File could not be read.");
            };
            reader.onload = (event) => {
                resolve({
                    name: file.name,
                    handle: fileHandle,
                    content: event.target!.result as string,
                });
            };

            reader.readAsText(file); // Read file as text
        });
    } catch (e) {
        console.info(e);
        return undefined;
    }
}

export async function writeFile(file: EditorFile) {
    if (file.handle) {
        const writable = await file.handle.createWritable();
        try {
            await writable.write(file.content);
        } finally {
            await writable.close();
        }
    }
}
