// src/shims-xml2js.d.ts
declare module 'xml2js' {
    import { Parser } from 'xml2js';
    const parseString: Parser['parseString'];
    export { parseString };
}
