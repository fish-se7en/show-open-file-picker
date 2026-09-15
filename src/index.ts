// https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker
type Options = {
    excludeAcceptAllOption?: boolean;
    id?: string;
    multiple?: boolean;
    startIn?: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
    types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
    }>;
}

export const showOpenFilePicker = ({
    excludeAcceptAllOption = false,
    id,
    multiple = false,
    startIn,
    types = [],
}: Options = {}): Promise<File[]> => {
    if (types.length === 0 && excludeAcceptAllOption) {
        throw TypeError("The types options is empty and the excludeAcceptAllOption options is true.")
    }
    return new Promise((resolve, reject) => {
        const input = document.createElement("input")
        input.setAttribute("type", "file")
        input.style.display = 'none'
        if (multiple) {
            input.setAttribute("multiple", 'multiple')
        }
        const accept: string[] = []
        types.forEach((type) => {
            Object.entries(type.accept).forEach(([mimeType, extensions]) => {
                extensions.forEach((extension) => {
                    if (!extension.startsWith(".")) {
                        throw TypeError("It does not start with .")
                    }
                    if (extension.endsWith(".")) {
                        throw TypeError("It does end with .")
                    }
                    if (extension.length > 16) {
                        throw TypeError("Its length is more than 16.")
                    }
                })
                accept.push(...extensions)
            })
        })
        if (accept.length > 0) {
            input.setAttribute("accept", accept.join(","))
        }
        const change = (e: Event) => {
            const files = Array.from(((e.target as HTMLInputElement).files ?? []))
            resolve(files)
        }
        const error = () => {
            
        }
        const focus = () => {
            window.removeEventListener("focus", focus)
            setTimeout(() => {
                input.removeEventListener("change", change)
                input.removeEventListener("error", error)
                document.body.removeChild(input)
            }, 750)
        }
        input.addEventListener("change", change)
        input.addEventListener("error", error)
        window.addEventListener("focus", focus)
        document.body.appendChild(input)
        input.click()
    })
}
