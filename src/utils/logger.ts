/* eslint-disable no-console */
/**
 * Minimal logger wrapper used to centralize console output.
 * Keeping console usage isolated allows the rest of the codebase
 * to remain free of direct console statements.
 */
export const logger = {
        info: (...messages: unknown[]): void => {
                console.info(...messages);
        },
        warn: (...messages: unknown[]): void => {
                console.warn(...messages);
        },
        error: (...messages: unknown[]): void => {
                console.error(...messages);
        },
        debug: (...messages: unknown[]): void => {
                if (process.env.DEBUG) {
                        console.debug(...messages);
                }
        },
};
