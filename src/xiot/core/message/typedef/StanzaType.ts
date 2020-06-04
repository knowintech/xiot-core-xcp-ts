export enum StanzaType {
    UNDEFINED,
    IQ,
    MESSAGE,
}

const _StanzaTypeMapping: [StanzaType, string][] = [
    [StanzaType.IQ, 'iq'],
    [StanzaType.MESSAGE, 'message'],
];

export function StanzaTypeToString(type: StanzaType): string {
    for (const t of _StanzaTypeMapping) {
        if (t[0] === type) {
            return t[1];
        }
    }

    return 'none';
}

export function StanzaTypeFromString(type: string): StanzaType {
    for (const t of _StanzaTypeMapping) {
        if (t[1] === type) {
            return t[0];
        }
    }

    return StanzaType.UNDEFINED;
}
