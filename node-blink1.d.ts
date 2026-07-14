declare module 'node-blink1' {
    /**
     * blink(1) class definition
     */
    export = Blink1;

    /**
     * Get list of blink(1) devices connected
     */
    export function devices(): string[];
}

/**
 * Declaration for blink(1) LED positions. blink(1) mk2 and mk3
 * have support for independently addressable LED's
 *
 * 0 = All
 * 1 = Top
 * 2 = Bottom
 */
declare type LedIndex = 0 | 1 | 2;

/**
 * Typescript types declaration for node-blink1
 */
declare class Blink1 {

    /**
     * Create blink(1) object with serial number, to get list of serial numbers use Blink1.devices().
     * When no serial number is passed the first device will be used
     *
     * @param serial
     */
    constructor(serial?: string);

    /**
     * Get version of blink(1) device which will
     * be passed to the callback function
     *
     * @param callback
     */
    version(callback: (version: number) => void): void;

    /**
     * Fade to RGB color
     *
     * @param fadeMillis Time in ms the transition takes
     * @param r Red (0-255)
     * @param g Green (0-255)
     * @param b Blue (0-255)
     * @param index
     */
    fadeToRGB(fadeMillis: number, r: number, g: number, b: number, index?: LedIndex): void;

    /**
     * Fade to RGB color and execute callback function when transition
     * has completed
     *
     * @param fadeMillis Time in ms the transition takes
     * @param r Red (0-255)
     * @param g Green (0-255)
     * @param b Blue (0-255)
     * @param index
     * @param callback
     */
    fadeToRGB(fadeMillis: number, r: number, g: number, b: number, index: LedIndex, callback?: () => void): void;

    /**
     * Set to RGB color and optionally execute callback function
     * when transition has completed
     *
     * @param r Red (0-255)
     * @param g Green (0-255)
     * @param b Blue (0-255)
     * @param callback
     */
    setRGB(r, g, b, callback?: () => void): void;

    /**
     * Get current RGB values (mk2+ only) for a
     * specific LED index and pass them to the callback function
     *
     * @param index
     * @param callback
     */
    rgb(index: LedIndex, callback: (r, g, b) => void): void;

    /**
     * Get current RGB values (mk2+ only) and pass them
     * to the callback function. When no index is passed LedIndex.All
     * will be used
     *
     * @param callback
     */
    rgb(callback: (r, g, b) => void): void;

    /**
     * Turn blink(1) device off and call optional
     * callback function when device is off
     *
     * @param callback
     */
    off(callback?: () => void): void;

    /**
     * Disable/Enable gamma correction, default is true (enabled)
     */
    enableDegamma: boolean;

    /**
     * Set server down and call optional callback after millis ms
     *
     * @param millis
     * @param callback
     */
    enableServerDown(millis: number, callback?: () => void): void;

    /**
     * Disable server down and call optional callback after millis ms
     *
     * @param millis
     * @param callback
     */
    disableServerDown(millis: number, callback?: () => void): void;

    /**
     * Start playing the pattern lines at the specified position
     *
     * @param position
     * @param callback
     */
    play(position: number, callback?: () => void): void;

    /**
     * Start playing a subset of the pattern lines at specified
     * start and end positions
     *
     * @param startPosition
     * @param endPosition
     * @param count Specifying count = 0 will loop pattern forever
     * @param callback
     */
    playLoop(startPosition: number, endPosition: number, count: number, callback?: () => void): void;

    /**
     * Stop playing the pattern line
     *
     * @param callback
     */
    pause(callback?: () => void): void;

    /**
     * Set the parameters for a pattern line, at the specified position
     *
     * @param fadeMillis Time in ms the transition takes
     * @param r Red (0-255)
     * @param g Green (0-255)
     * @param b Blue (0-255)
     * @param position
     * @param callback
     */
    writePatternLine(fadeMillis: number, r: number, g: number, b: number, position: number, callback?: () => void): void;

    /**
     * Set 'LedN' Set which LED to address for writePatternLine()
     *
     * @param index
     */
    setLedN(index: LedIndex): void;

    /**
     * Save RAM pattern (to blink(1) non-volatile memory)
     * Note: This command may return an error, but the command did succeed.
     * This is because to save to its internal flash memory, the blink(1) must turn off USB for a moment
     *
     * @param callback
     */
    savePattern(callback?: () => void): void;

    /**
     * Read pattern line (at the position)
     *
     * @param position
     * @param callback
     */
    readPatternLine(position, callback?: ({r: number, g: number, b: number, fadeMillis: number}) => void): void;

    /**
     * Write user note (to blink(1) non-volatile memory)
     *
     * @param noteId
     * @param note
     * @param callback
     */
    writeNote(noteId: number, note: string, callback?: () => void): void;

    /**
     * Reads user note (from blink(1) non-volatile memory)
     *
     * @param noteId
     * @param asString
     * @param callback
     */
    readNote(noteId: number, asString: boolean, callback?: (note: string) => void): void;

    /**
     * Close the underlying HID device
     *
     * @param callback
     */
    close(callback?: () => void): void;
}
