/**
 * Development-only logging.
 *
 * The release branches used to call `console.warn` / `console.error`, which land in logcat and
 * Console.app. `ErrorHandler` passed request headers and response bodies through here, so one
 * failed request published a live `Authorization: Bearer …` to a log any other process on the
 * device can read. Nothing is emitted outside `__DEV__` now.
 *
 * A crash reporter belongs on the release branch — one call site, deliberately left empty
 * rather than pulling in a reporter this project does not use yet.
 */
class Logger {
    static error(tag: string, message: unknown, ...args: unknown[]): void {
        if (!__DEV__) {
            // TODO: forward to a crash reporter here (redacted: no headers, no payloads).
            return;
        }
        console.error(`[${tag}]`, message, ...args);
    }

    static info(tag: string, message: unknown, ...args: unknown[]): void {
        if (!__DEV__) return;
        // Previously console.error — info-level records were being reported as errors.
        console.info(`[${tag}]`, message, ...args);
    }
}

export default Logger;
