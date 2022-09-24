export default class InlineFormats {
  constructor(defs) {

    this.defs = defs.reduce((result, def) => {
      result[def.token] = result[def.token]
        ? Object.assign(result[def.token], def)
        : def;
      return result;
    }, {});

    this.markTokens = defs.reduce((result, def) => {
      if (result.includes(def.markToken)) return result;
      return [...result, def.markToken];
    }, []);
  }

  get(type) {
    return this.defs[type];
  }

  exists(type) {
    return typeof this.defs[type] !== "undefined";
  }

  hasMark(type) {
    if (!this.exists(type)) return false;
    return typeof this.get(type).mark !== "undefined";
  }

  mark(type) {
    if (!this.exists(type)) return null;
    return this.get(type).mark;
  }

  markTokenExists(token) {
    return this.markTokens.includes(token);
  }
}
