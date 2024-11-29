type File = {
    path: string;
    handle: FileSystemFileHandle;
    content: string;
};
export async function openFile(): Promise<File | undefined> {
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
                    path: "fuck",
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
