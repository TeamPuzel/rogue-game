window.addEventListener("load", main)

function consumeUnownedString(instance, pointer) {
    let count = 0
    const slice = new BigUint64Array(instance.exports.memory.buffer, pointer, 1)
    count = new Number(slice[0])

    const string = new Uint8Array(instance.exports.memory.buffer, pointer + 8, count)
    const ret = new TextDecoder().decode(string)

    instance.exports.deallocUnowned(pointer) // Consume the UnownedString
    return ret
}

/**
* An instance of a canvas plugin
*/
class Instance extends HTMLElement {
    /** @type WebAssembly.WebAssemblyInstantiatedSource */
    wasm
    /** @type HTMLCanvasElement */
    canvas
    /** @type CanvasRenderingContext2D */
    context
    mouseX = 0
    mouseY = 0
    mouseLeft = false
    mouseRight = false
    mouseVisible = false
    keys = new Set()
    audio = new AudioContext({ sampleRate: 48000 })
    audioOffset = 0
    buffer = new Float32Array(4800)

    // scale = devicePixelRatio
    // scale = 0.25
    // scale = 1
    scale

    constructor(scale = devicePixelRatio) {
        super()
        this.scale = scale

        this.scriptProcessorNode = this.audio.createScriptProcessor(4096, 0, 1) // buffer size of 4096
        this.scriptProcessorNode.onaudioprocess = this.onAudioProcess.bind(this)
        this.scriptProcessorNode.connect(this.audio.destination)
    }

    onAudioProcess(event) {
        const output = event.outputBuffer.getChannelData(0)

        for (let i = 0; i < output.length; i++) {
            if (this.readIndex < this.buffer.length) {
                output[i] = this.buffer[this.readIndex]
            } else {
                output[i] = output[i] * 0.98 // Simulating fade out
            }
            this.readIndex += 1
            this.audioOffset += 1
        }
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" })

        const canvas = document.createElement("canvas")
        canvas.style.height = "100%"
        canvas.style.width = "100%"
        canvas.style.flexShrink = "1"
        canvas.style.cursor = "none"
        // canvas.style.backgroundColor = "var(--pal-dark)"
        if (this.scale != devicePixelRatio) canvas.style.imageRendering = "pixelated"

        shadow.appendChild(canvas)

        this.canvas = canvas
        this.context = canvas.getContext("2d")
        this.update()
        this.frame()

        // Events
        canvas.addEventListener("mousemove", (event) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
            this.mouseVisible = true // ???
        })

        canvas.addEventListener("mouseout", (event) => {
            this.mouseVisible = false
            this.mouseLeft = false
            this.mouseRight = false
        })

        canvas.addEventListener("mouseover", (event) => {
            this.mouseVisible = true
        })

        canvas.addEventListener("mousedown", (event) => {
            switch (event.button) {
                case 0: this.mouseLeft = true; break
                case 2: this.mouseRight = true; break
            }
        })

        canvas.addEventListener("mouseup", (event) => {
            switch (event.button) {
                case 0: this.mouseLeft = false; break
                case 2: this.mouseRight = false; break
            }
        })

        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault()
            event.stopPropagation()
        })

        document.addEventListener("keydown", (event) => {
            this.keys.add(event.code)
            if (event.code == "F10") canvas.requestFullscreen()
        });

        document.addEventListener("keyup", (event) => {
            this.keys.delete(event.code);
        });
    }

    timestamp() { return performance.now() }
    getAvailableWidth() { return this.canvas.width }
    getAvailableHeight() { return this.canvas.height }
    getMouseX() { return this.mouseX * this.scale }
    getMouseY() { return this.mouseY * this.scale }
    getMouseLeft() { return this.mouseLeft }
    getMouseRight() { return this.mouseRight }
    getMouseVisible() { return this.mouseVisible }
    random() { return Math.random() }
    draw(offset) {
        const width = this.canvas.width
        const height = this.canvas.height

        const array = new Uint8ClampedArray(
            this.wasm.instance.exports.memory.buffer,
            offset, width * height * 4
        )

        const imageData = new ImageData(array, width, height)

        this.context.putImageData(imageData, 0, 0)
    }
    getDarkTheme() { return window.matchMedia("(prefers-color-scheme: dark)").matches ? true : false }

    stdout = ""
    /** This is the only dependency of Swift's debug print function. */
    putchar(char) {
        if (char == 10 /* \n */) {
            console.log(this.stdout)
            this.stdout = ""
        } else {
            this.stdout += String.fromCharCode(char)
        }
    }

    getKey(id) {
        switch (id) {
            case Instance.KEY_A: return this.keys.has("KeyA")
            case Instance.KEY_B: return this.keys.has("KeyB")
            case Instance.KEY_C: return this.keys.has("KeyC")
            case Instance.KEY_D: return this.keys.has("KeyD")
            case Instance.KEY_E: return this.keys.has("KeyE")
            case Instance.KEY_F: return this.keys.has("KeyF")
            case Instance.KEY_G: return this.keys.has("KeyG")
            case Instance.KEY_H: return this.keys.has("KeyH")
            case Instance.KEY_I: return this.keys.has("KeyI")
            case Instance.KEY_J: return this.keys.has("KeyJ")
            case Instance.KEY_K: return this.keys.has("KeyK")
            case Instance.KEY_L: return this.keys.has("KeyL")
            case Instance.KEY_M: return this.keys.has("KeyM")
            case Instance.KEY_N: return this.keys.has("KeyN")
            case Instance.KEY_O: return this.keys.has("KeyO")
            case Instance.KEY_P: return this.keys.has("KeyP")
            case Instance.KEY_Q: return this.keys.has("KeyQ")
            case Instance.KEY_R: return this.keys.has("KeyR")
            case Instance.KEY_S: return this.keys.has("KeyS")
            case Instance.KEY_T: return this.keys.has("KeyT")
            case Instance.KEY_U: return this.keys.has("KeyU")
            case Instance.KEY_V: return this.keys.has("KeyV")
            case Instance.KEY_W: return this.keys.has("KeyW")
            case Instance.KEY_X: return this.keys.has("KeyX")
            case Instance.KEY_Y: return this.keys.has("KeyY")
            case Instance.KEY_Z: return this.keys.has("KeyZ")
            case Instance.KEY_BACKSPACE: return this.keys.has("Backspace")
            case Instance.KEY_LEFT: return this.keys.has("ArrowLeft")
            case Instance.KEY_RIGHT: return this.keys.has("ArrowRight")
            case Instance.KEY_UP: return this.keys.has("ArrowUp")
            case Instance.KEY_DOWN: return this.keys.has("ArrowDown")
            case Instance.KEY_N0: return this.keys.has("Digit0")
            case Instance.KEY_N1: return this.keys.has("Digit1")
            case Instance.KEY_N2: return this.keys.has("Digit2")
            case Instance.KEY_N3: return this.keys.has("Digit3")
            case Instance.KEY_N4: return this.keys.has("Digit4")
            case Instance.KEY_N5: return this.keys.has("Digit5")
            case Instance.KEY_N6: return this.keys.has("Digit6")
            case Instance.KEY_N7: return this.keys.has("Digit7")
            case Instance.KEY_N8: return this.keys.has("Digit8")
            case Instance.KEY_N9: return this.keys.has("Digit9")
            case Instance.KEY_COMMA: return this.keys.has("Comma")
            case Instance.KEY_PERIOD: return this.keys.has("Period")
            case Instance.KEY_SLASH: return this.keys.has("Slash")
            case Instance.KEY_BACKSLASH: return this.keys.has("Backslash")
            case Instance.KEY_BACKQUOTE: return this.keys.has("Backquote")
            case Instance.KEY_EQUALS: return this.keys.has("Equal")
            case Instance.KEY_DASH: return this.keys.has("Minus")
            case Instance.KEY_BRACKET_LEFT: return this.keys.has("BracketLeft")
            case Instance.KEY_BRACKET_RIGHT: return this.keys.has("BracketRight")
            case Instance.KEY_SEMICOLON: return this.keys.has("Semicolon")
            case Instance.KEY_QUOTE: return this.keys.has("Quote")
            case Instance.KEY_SHIFT: return this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")
            case Instance.KEY_META: return this.keys.has("MetaLeft") || this.keys.has("MetaRight")
            case Instance.KEY_CONTROL: return this.keys.has("ControlLeft") || this.keys.has("ControlRight")
            case Instance.KEY_OPTION: return this.keys.has("AltLeft") || this.keys.has("AltRight")
            case Instance.KEY_FUNCTION: return false
            case Instance.KEY_TAB: return this.keys.has("Tab")
            case Instance.KEY_ENTER: return this.keys.has("Enter")
            case Instance.KEY_ESCAPE: return this.keys.has("Escape")
            default: return false
        }
    }

    streamWave(ptr) {
        const data = new Float32Array(this.wasm.instance.exports.memory.buffer, ptr, 4800)
        this.buffer.set(data)
        this.readIndex = 0
        this.audio.resume()
    }

    getAudioOffset() { return this.audioOffset }

    static invoke(object, selector, ...args) { return object[selector](args) }
    static objectNew() { return {} }

    get api() {
        return {
            timestamp: this.timestamp.bind(this),
            getAvailableWidth: this.getAvailableWidth.bind(this),
            getAvailableHeight: this.getAvailableHeight.bind(this),
            getMouseX: this.getMouseX.bind(this),
            getMouseY: this.getMouseY.bind(this),
            getMouseLeft: this.getMouseLeft.bind(this),
            getMouseRight: this.getMouseRight.bind(this),
            getMouseVisible: this.getMouseVisible.bind(this),
            random: this.random.bind(this),
            draw: this.draw.bind(this),
            getDarkTheme: this.getDarkTheme.bind(this),
            sin: Math.sin,
            sinf: Math.sin,
            cos: Math.cos,
            cosf: Math.cos,
            pow: Math.pow,
            powf: Math.powf,
            putchar: this.putchar.bind(this),
            getKey: this.getKey.bind(this),
            streamWave: this.streamWave.bind(this),
            audioOffset: this.getAudioOffset.bind(this)
        }
    }

    update() {
        // this.wasm.instance.exports.resume(false)
        // setTimeout(this.update.bind(this), 1)
    }

    frame() {
        this.canvas.setAttribute("width", Math.floor(this.canvas.getBoundingClientRect().width * this.scale))
        this.canvas.setAttribute("height", Math.floor(this.canvas.getBoundingClientRect().height * this.scale))
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.wasm.instance.exports.resume(true)

        this.canvas.style.width = "100vw"
        this.canvas.style.height = "100vh"

        window.requestAnimationFrame(this.frame.bind(this))
    }

    // CRITICAL: Keep in sync with Core.Input.Key
    static KEY_A = 0
    static KEY_B = 1
    static KEY_C = 2
    static KEY_D = 3
    static KEY_E = 4
    static KEY_F = 5
    static KEY_G = 6
    static KEY_H = 7
    static KEY_I = 8
    static KEY_J = 9
    static KEY_K = 10
    static KEY_L = 11
    static KEY_M = 12
    static KEY_N = 13
    static KEY_O = 14
    static KEY_P = 15
    static KEY_Q = 16
    static KEY_R = 17
    static KEY_S = 18
    static KEY_T = 19
    static KEY_U = 20
    static KEY_V = 21
    static KEY_W = 22
    static KEY_X = 23
    static KEY_Y = 24
    static KEY_Z = 25

    static KEY_BACKSPACE = 26

    static KEY_LEFT = 27
    static KEY_RIGHT = 28
    static KEY_UP = 29
    static KEY_DOWN = 30

    static KEY_N0 = 31
    static KEY_N1 = 32
    static KEY_N2 = 33
    static KEY_N3 = 34
    static KEY_N4 = 35
    static KEY_N5 = 36
    static KEY_N6 = 37
    static KEY_N7 = 38
    static KEY_N8 = 39
    static KEY_N9 = 40

    static KEY_COMMA = 41
    static KEY_PERIOD = 42
    static KEY_SLASH = 43

    static KEY_BACKSLASH = 44
    static KEY_BACKQUOTE = 45
    static KEY_EQUALS = 46
    static KEY_DASH = 47
    static KEY_BRACKET_LEFT = 48
    static KEY_BRACKET_RIGHT = 49
    static KEY_SEMICOLON = 50
    static KEY_QUOTE = 51
    static KEY_SHIFT = 52
    static KEY_META = 53
    static KEY_CONTROL = 54
    static KEY_OPTION = 55
    static KEY_FUNCTION = 56
    static KEY_TAB = 57
    static KEY_ENTER = 58
    static KEY_ESCAPE = 59
}

customElements.define("pz-instance", Instance)

async function main() {
    const container = document.getElementById("container")

    const instance = new Instance(0.25)
    instance.wasm = await WebAssembly.instantiateStreaming(
        fetch("main.wasm"),
        { env: instance.api }
    )

    container.appendChild(instance)
}
