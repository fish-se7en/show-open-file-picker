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
            Object.entries(type.accept ?? {}).forEach(([mimeType, extensions]) => {
                if (!/^[a-z]+\/[a-z0-9-.+*]+$/.test(mimeType)) {
                    throw TypeError("Any key string of the accept options of any item in types options can't parse a valid MIME type.")
                }
                extensions.forEach((extension) => {
                    if (!extension.startsWith(".") || extension.endsWith(".") || extension.length > 16) {
                        throw TypeError('Any value string(s) of the accept options of any item in types options is invalid.')
                    }
                })
                accept.push(...extensions)
            })
        })
        if (accept.length > 0) {
            input.setAttribute("accept", Array.from(new Set(accept)).join(","))
        }
        const change = (e: Event) => {
            const files = Array.from(((e.target as HTMLInputElement).files ?? []))
            resolve(files)
        }
        const focus = () => {
            window.removeEventListener("focus", focus)
            setTimeout(() => {
                if ((input.files ?? []).length === 0) {
                    throw new DOMException('The user dismisses the prompt without making a selection.')
                }
                input.removeEventListener("change", change)
                document.body.removeChild(input)
            }, 750)
        }
        input.addEventListener("change", change)
        window.addEventListener("focus", focus)
        document.body.appendChild(input)
        input.click()
    })
}
