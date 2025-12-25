
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;

const { execSync } = require(`child_process`);
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require(`fs`);
const { env } = require(`process`);

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

function wasm_bindgen__convert__closures_____invoke__h9ed329622efc412d(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h9ed329622efc412d(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h0d2643c9e9fdcb5b(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__h0d2643c9e9fdcb5b(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__h21af4bfb35f9aaf6(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h21af4bfb35f9aaf6(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const CallFnArgsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_callfnargs_free(ptr >>> 0, 1));

const ContractOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_contractoptions_free(ptr >>> 0, 1));

const DeployContractArgsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_deploycontractargs_free(ptr >>> 0, 1));

const SDKFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sdk_free(ptr >>> 0, 1));

const SDKOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sdkoptions_free(ptr >>> 0, 1));

const SessionReportFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sessionreport_free(ptr >>> 0, 1));

const TransactionResFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transactionres_free(ptr >>> 0, 1));

const TransferSTXArgsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_transferstxargs_free(ptr >>> 0, 1));

const TxArgsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_txargs_free(ptr >>> 0, 1));

class CallFnArgs {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CallFnArgsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_callfnargs_free(ptr, 0);
    }
    /**
     * @param {string} contract
     * @param {string} method
     * @param {Uint8Array[]} args
     * @param {string} sender
     */
    constructor(contract, method, args, sender) {
        const ptr0 = passStringToWasm0(contract, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(args, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(sender, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.callfnargs_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        this.__wbg_ptr = ret >>> 0;
        CallFnArgsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) CallFnArgs.prototype[Symbol.dispose] = CallFnArgs.prototype.free;
exports.CallFnArgs = CallFnArgs;

class ContractOptions {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ContractOptionsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_contractoptions_free(ptr, 0);
    }
    /**
     * @param {number | null} [clarity_version]
     */
    constructor(clarity_version) {
        const ret = wasm.contractoptions_new(isLikeNone(clarity_version) ? 0x100000001 : (clarity_version) >>> 0);
        this.__wbg_ptr = ret >>> 0;
        ContractOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) ContractOptions.prototype[Symbol.dispose] = ContractOptions.prototype.free;
exports.ContractOptions = ContractOptions;

class DeployContractArgs {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DeployContractArgsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_deploycontractargs_free(ptr, 0);
    }
    /**
     * @param {string} name
     * @param {string} content
     * @param {ContractOptions} options
     * @param {string} sender
     */
    constructor(name, content, options, sender) {
        const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(options, ContractOptions);
        var ptr2 = options.__destroy_into_raw();
        const ptr3 = passStringToWasm0(sender, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        const ret = wasm.deploycontractargs_new(ptr0, len0, ptr1, len1, ptr2, ptr3, len3);
        this.__wbg_ptr = ret >>> 0;
        DeployContractArgsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) DeployContractArgs.prototype[Symbol.dispose] = DeployContractArgs.prototype.free;
exports.DeployContractArgs = DeployContractArgs;

class SDK {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SDKFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sdk_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get deployer() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_sdk_deployer(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set deployer(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_sdk_deployer(this.__wbg_ptr, ptr0, len0);
    }
    clearCache() {
        wasm.sdk_clearCache(this.__wbg_ptr);
    }
    /**
     * @param {string} snippet
     * @returns {string}
     */
    runSnippet(snippet) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(snippet, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.sdk_runSnippet(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {number}
     */
    get blockHeight() {
        const ret = wasm.sdk_blockHeight(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {Map<string, string>}
     */
    getAccounts() {
        const ret = wasm.sdk_getAccounts(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} contract
     * @param {string} var_name
     * @returns {string}
     */
    getDataVar(contract, var_name) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(contract, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(var_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.sdk_getDataVar(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} cwd
     * @param {string} manifest_path
     * @returns {Promise<void>}
     */
    initSession(cwd, manifest_path) {
        const ptr0 = passStringToWasm0(cwd, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(manifest_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_initSession(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * @param {TransferSTXArgs} args
     * @returns {TransactionRes}
     */
    transferSTX(args) {
        _assertClass(args, TransferSTXArgs);
        const ret = wasm.sdk_transferSTX(this.__wbg_ptr, args.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TransactionRes.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    get currentEpoch() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.sdk_currentEpoch(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} contract
     * @param {string} map_name
     * @param {Uint8Array} map_key
     * @returns {string}
     */
    getMapEntry(contract, map_name, map_key) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(contract, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(map_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passArray8ToWasm0(map_key, wasm.__wbindgen_malloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.sdk_getMapEntry(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * @param {Array<any>} js_txs
     * @returns {any}
     */
    mineBlock(js_txs) {
        const ret = wasm.sdk_mineBlock(this.__wbg_ptr, js_txs);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {CallFnArgs} args
     * @returns {TransactionRes}
     */
    callPublicFn(args) {
        _assertClass(args, CallFnArgs);
        const ret = wasm.sdk_callPublicFn(this.__wbg_ptr, args.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TransactionRes.__wrap(ret[0]);
    }
    /**
     * @param {boolean} include_boot_contracts
     * @param {string} boot_contracts_path
     * @returns {SessionReport}
     */
    collectReport(include_boot_contracts, boot_contracts_path) {
        const ptr0 = passStringToWasm0(boot_contracts_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_collectReport(this.__wbg_ptr, include_boot_contracts, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return SessionReport.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    getBlockTime() {
        const ret = wasm.sdk_getBlockTime(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {CallFnArgs} args
     * @returns {TransactionRes}
     */
    callPrivateFn(args) {
        _assertClass(args, CallFnArgs);
        const ret = wasm.sdk_callPrivateFn(this.__wbg_ptr, args.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TransactionRes.__wrap(ret[0]);
    }
    /**
     * @param {DeployContractArgs} args
     * @returns {TransactionRes}
     */
    deployContract(args) {
        _assertClass(args, DeployContractArgs);
        const ret = wasm.sdk_deployContract(this.__wbg_ptr, args.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TransactionRes.__wrap(ret[0]);
    }
    /**
     * @param {string} snippet
     * @returns {string}
     */
    executeCommand(snippet) {
        let deferred2_0;
        let deferred2_1;
        try {
            const ptr0 = passStringToWasm0(snippet, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.sdk_executeCommand(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @returns {Map<string, Map<string, bigint>>}
     */
    getAssetsMap() {
        const ret = wasm.sdk_getAssetsMap(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} contract
     * @returns {IContractAST}
     */
    getContractAST(contract) {
        const ptr0 = passStringToWasm0(contract, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_getContractAST(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {number}
     */
    mineEmptyBlock() {
        const ret = wasm.sdk_mineEmptyBlock(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get burnBlockHeight() {
        const ret = wasm.sdk_burnBlockHeight(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {CallFnArgs} args
     * @returns {TransactionRes}
     */
    callReadOnlyFn(args) {
        _assertClass(args, CallFnArgs);
        const ret = wasm.sdk_callReadOnlyFn(this.__wbg_ptr, args.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TransactionRes.__wrap(ret[0]);
    }
    /**
     * @returns {EpochString}
     */
    static getDefaultEpoch() {
        const ret = wasm.sdk_getDefaultEpoch();
        return ret;
    }
    /**
     * @param {number | null} [count]
     * @returns {number}
     */
    mineEmptyBlocks(count) {
        const ret = wasm.sdk_mineEmptyBlocks(this.__wbg_ptr, isLikeNone(count) ? 0x100000001 : (count) >>> 0);
        return ret >>> 0;
    }
    /**
     * @param {string} cost_field
     */
    enablePerformance(cost_field) {
        const ptr0 = passStringToWasm0(cost_field, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_enablePerformance(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {any} remote_data_settings
     * @returns {Promise<void>}
     */
    initEmptySession(remote_data_settings) {
        const ret = wasm.sdk_initEmptySession(this.__wbg_ptr, remote_data_settings);
        return ret;
    }
    /**
     * @param {string[]} addresses
     */
    setLocalAccounts(addresses) {
        const ptr0 = passArrayJsValueToWasm0(addresses, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.sdk_setLocalAccounts(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} contract
     * @returns {string | undefined}
     */
    getContractSource(contract) {
        const ptr0 = passStringToWasm0(contract, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_getContractSource(this.__wbg_ptr, ptr0, len0);
        let v2;
        if (ret[0] !== 0) {
            v2 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v2;
    }
    /**
     * @returns {number}
     */
    get stacksBlockHeight() {
        const ret = wasm.sdk_blockHeight(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    mineEmptyBurnBlock() {
        const ret = wasm.sdk_mineEmptyBurnBlock(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {string} test_name
     */
    setCurrentTestName(test_name) {
        const ptr0 = passStringToWasm0(test_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.sdk_setCurrentTestName(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number | null} [count]
     * @returns {number}
     */
    mineEmptyBurnBlocks(count) {
        const ret = wasm.sdk_mineEmptyBurnBlocks(this.__wbg_ptr, isLikeNone(count) ? 0x100000001 : (count) >>> 0);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    mineEmptyStacksBlock() {
        const ret = wasm.sdk_mineEmptyStacksBlock(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {string} cwd
     * @param {string} manifest_path
     * @returns {Promise<void>}
     */
    generateDeploymentPlan(cwd, manifest_path) {
        const ptr0 = passStringToWasm0(cwd, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(manifest_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_generateDeploymentPlan(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * @returns {Map<string, IContractInterface>}
     */
    getContractsInterfaces() {
        const ret = wasm.sdk_getContractsInterfaces(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {number | null} [count]
     * @returns {number}
     */
    mineEmptyStacksBlocks(count) {
        const ret = wasm.sdk_mineEmptyStacksBlocks(this.__wbg_ptr, isLikeNone(count) ? 0x100000001 : (count) >>> 0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * Returns the last contract call trace as a string, if available.
     * @returns {string | undefined}
     */
    getLastContractCallTrace() {
        const ret = wasm.sdk_getLastContractCallTrace(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {Function} fs_request
     * @param {SDKOptions | null} [options]
     */
    constructor(fs_request, options) {
        let ptr0 = 0;
        if (!isLikeNone(options)) {
            _assertClass(options, SDKOptions);
            ptr0 = options.__destroy_into_raw();
        }
        const ret = wasm.sdk_new(fs_request, ptr0);
        this.__wbg_ptr = ret >>> 0;
        SDKFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {ClarityVersionString}
     */
    getDefaultClarityVersionForCurrentEpoch() {
        const ret = wasm.sdk_getDefaultClarityVersionForCurrentEpoch(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} snippet
     * @returns {TransactionRes}
     */
    execute(snippet) {
        const ptr0 = passStringToWasm0(snippet, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sdk_execute(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TransactionRes.__wrap(ret[0]);
    }
    /**
     * @param {string} token
     * @param {string} recipient
     * @param {bigint} amount
     * @returns {string}
     */
    mintFT(token, recipient, amount) {
        let deferred4_0;
        let deferred4_1;
        try {
            const ptr0 = passStringToWasm0(token, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.sdk_mintFT(this.__wbg_ptr, ptr0, len0, ptr1, len1, amount);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {string} recipient
     * @param {bigint} amount
     * @returns {string}
     */
    mintSTX(recipient, amount) {
        let deferred3_0;
        let deferred3_1;
        try {
            const ptr0 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.sdk_mintSTX(this.__wbg_ptr, ptr0, len0, amount);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @param {EpochString} epoch
     */
    setEpoch(epoch) {
        wasm.sdk_setEpoch(this.__wbg_ptr, epoch);
    }
}
if (Symbol.dispose) SDK.prototype[Symbol.dispose] = SDK.prototype.free;
exports.SDK = SDK;

class SDKOptions {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SDKOptionsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sdkoptions_free(ptr, 0);
    }
    /**
     * @param {boolean} track_costs
     * @param {boolean} track_coverage
     * @param {boolean | null} [track_performance]
     */
    constructor(track_costs, track_coverage, track_performance) {
        const ret = wasm.sdkoptions_new(track_costs, track_coverage, isLikeNone(track_performance) ? 0xFFFFFF : track_performance ? 1 : 0);
        this.__wbg_ptr = ret >>> 0;
        SDKOptionsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {boolean}
     */
    get trackCosts() {
        const ret = wasm.__wbg_get_sdkoptions_trackCosts(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set trackCosts(arg0) {
        wasm.__wbg_set_sdkoptions_trackCosts(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get trackCoverage() {
        const ret = wasm.__wbg_get_sdkoptions_trackCoverage(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set trackCoverage(arg0) {
        wasm.__wbg_set_sdkoptions_trackCoverage(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get trackPerformance() {
        const ret = wasm.__wbg_get_sdkoptions_trackPerformance(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set trackPerformance(arg0) {
        wasm.__wbg_set_sdkoptions_trackPerformance(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) SDKOptions.prototype[Symbol.dispose] = SDKOptions.prototype.free;
exports.SDKOptions = SDKOptions;

class SessionReport {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SessionReport.prototype);
        obj.__wbg_ptr = ptr;
        SessionReportFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SessionReportFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sessionreport_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get coverage() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_sessionreport_coverage(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set coverage(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_sessionreport_coverage(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get costs() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_sessionreport_costs(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set costs(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_sessionreport_costs(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) SessionReport.prototype[Symbol.dispose] = SessionReport.prototype.free;
exports.SessionReport = SessionReport;

class TransactionRes {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TransactionRes.prototype);
        obj.__wbg_ptr = ptr;
        TransactionResFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransactionResFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transactionres_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get result() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_transactionres_result(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set result(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_sessionreport_coverage(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get events() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_transactionres_events(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set events(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_sessionreport_costs(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string}
     */
    get costs() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.__wbg_get_transactionres_costs(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} arg0
     */
    set costs(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_transactionres_costs(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @returns {string | undefined}
     */
    get performance() {
        const ret = wasm.__wbg_get_transactionres_performance(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {string | null} [arg0]
     */
    set performance(arg0) {
        var ptr0 = isLikeNone(arg0) ? 0 : passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_transactionres_performance(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) TransactionRes.prototype[Symbol.dispose] = TransactionRes.prototype.free;
exports.TransactionRes = TransactionRes;

class TransferSTXArgs {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TransferSTXArgsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_transferstxargs_free(ptr, 0);
    }
    /**
     * @param {bigint} amount
     * @param {string} recipient
     * @param {string} sender
     */
    constructor(amount, recipient, sender) {
        const ptr0 = passStringToWasm0(recipient, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(sender, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.transferstxargs_new(amount, ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        TransferSTXArgsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) TransferSTXArgs.prototype[Symbol.dispose] = TransferSTXArgs.prototype.free;
exports.TransferSTXArgs = TransferSTXArgs;

class TxArgs {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TxArgsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txargs_free(ptr, 0);
    }
}
if (Symbol.dispose) TxArgs.prototype[Symbol.dispose] = TxArgs.prototype.free;
exports.TxArgs = TxArgs;

exports.__wbg_Error_52673b7de5a0ca89 = function(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

exports.__wbg_Number_2d1dcfcf4ec51736 = function(arg0) {
    const ret = Number(arg0);
    return ret;
};

exports.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg___wbindgen_boolean_get_dea25b33882b895b = function(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
};

exports.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg___wbindgen_in_0d3e1e8f0c669317 = function(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
};

exports.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
};

exports.__wbg___wbindgen_is_object_ce774f3490692386 = function(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

exports.__wbg___wbindgen_is_string_704ef9c8fc131030 = function(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
};

exports.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

exports.__wbg___wbindgen_jsval_loose_eq_766057600fdd1b0d = function(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
};

exports.__wbg___wbindgen_number_get_9619185a74197f95 = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

exports.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

exports.__wbg__wbg_cb_unref_87dfb5aaa0cbcea7 = function(arg0) {
    arg0._wbg_cb_unref();
};

exports.__wbg_abort_07646c894ebbf2bd = function(arg0) {
    arg0.abort();
};

exports.__wbg_abort_399ecbcfd6ef3c8e = function(arg0, arg1) {
    arg0.abort(arg1);
};

exports.__wbg_append_c5cbdf46455cc776 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
}, arguments) };

exports.__wbg_arrayBuffer_c04af4fce566092d = function() { return handleError(function (arg0) {
    const ret = arg0.arrayBuffer();
    return ret;
}, arguments) };

exports.__wbg_call_3020136f7a2d6e44 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments) };

exports.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

exports.__wbg_call_c8baa5c5e72d274e = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    const ret = arg0.call(arg1, arg2, arg3);
    return ret;
}, arguments) };

exports.__wbg_clearTimeout_3b6a9a13d4bde075 = function(arg0) {
    const ret = clearTimeout(arg0);
    return ret;
};

exports.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
    const ret = arg0.crypto;
    return ret;
};

exports.__wbg_done_62ea16af4ce34b24 = function(arg0) {
    const ret = arg0.done;
    return ret;
};

exports.__wbg_entries_83c79938054e065f = function(arg0) {
    const ret = Object.entries(arg0);
    return ret;
};

exports.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

exports.__wbg_error_7bc7d576a6aaf855 = function(arg0) {
    console.error(arg0);
};

exports.__wbg_execSync_b3745e3240c0a3f3 = function(arg0, arg1, arg2) {
    const ret = execSync(getStringFromWasm0(arg1, arg2));
    const ptr1 = passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg_existsSync_487f09fc5fb1e058 = function(arg0, arg1) {
    const ret = existsSync(getStringFromWasm0(arg0, arg1));
    return ret;
};

exports.__wbg_fetch_90447c28cc0b095e = function(arg0, arg1) {
    const ret = arg0.fetch(arg1);
    return ret;
};

exports.__wbg_fetch_df3fa17a5772dafb = function(arg0) {
    const ret = fetch(arg0);
    return ret;
};

exports.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
    arg0.getRandomValues(arg1);
}, arguments) };

exports.__wbg_getTime_ad1e9878a735af08 = function(arg0) {
    const ret = arg0.getTime();
    return ret;
};

exports.__wbg_getTimezoneOffset_45389e26d6f46823 = function(arg0) {
    const ret = arg0.getTimezoneOffset();
    return ret;
};

exports.__wbg_get_6b7bd52aca3f9671 = function(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
};

exports.__wbg_get_af9dab7e9603ea93 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments) };

exports.__wbg_get_with_ref_key_1dc361bd10053bfe = function(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
};

exports.__wbg_has_0e670569d65d3a45 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(arg0, arg1);
    return ret;
}, arguments) };

exports.__wbg_headers_654c30e1bcccc552 = function(arg0) {
    const ret = arg0.headers;
    return ret;
};

exports.__wbg_instanceof_ArrayBuffer_f3320d2419cd0355 = function(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

exports.__wbg_instanceof_Response_cd74d1c2ac92cb0b = function(arg0) {
    let result;
    try {
        result = arg0 instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

exports.__wbg_instanceof_Uint8Array_da54ccc9d3e09434 = function(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

exports.__wbg_isSafeInteger_ae7d3f054d55fa16 = function(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
};

exports.__wbg_iterator_27b7c8b35ab3e86b = function() {
    const ret = Symbol.iterator;
    return ret;
};

exports.__wbg_length_22ac23eaec9d8053 = function(arg0) {
    const ret = arg0.length;
    return ret;
};

exports.__wbg_length_d45040a40c570362 = function(arg0) {
    const ret = arg0.length;
    return ret;
};

exports.__wbg_log_1d990106d99dacb7 = function(arg0) {
    console.log(arg0);
};

exports.__wbg_mkdirSync_a35f53570c62b85e = function(arg0, arg1, arg2) {
    mkdirSync(getStringFromWasm0(arg0, arg1), arg2);
};

exports.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
    const ret = arg0.msCrypto;
    return ret;
};

exports.__wbg_new_0_23cedd11d9b40c9d = function() {
    const ret = new Date();
    return ret;
};

exports.__wbg_new_1ba21ce319a06297 = function() {
    const ret = new Object();
    return ret;
};

exports.__wbg_new_25f239778d6112b9 = function() {
    const ret = new Array();
    return ret;
};

exports.__wbg_new_3c79b3bb1b32b7d3 = function() { return handleError(function () {
    const ret = new Headers();
    return ret;
}, arguments) };

exports.__wbg_new_6421f6084cc5bc5a = function(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
};

exports.__wbg_new_881a222c65f168fc = function() { return handleError(function () {
    const ret = new AbortController();
    return ret;
}, arguments) };

exports.__wbg_new_8a6f238a6ece86ea = function() {
    const ret = new Error();
    return ret;
};

exports.__wbg_new_b2db8aa2650f793a = function(arg0) {
    const ret = new Date(arg0);
    return ret;
};

exports.__wbg_new_b546ae120718850e = function() {
    const ret = new Map();
    return ret;
};

exports.__wbg_new_ff12d2b041fb48f1 = function(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return wasm_bindgen__convert__closures_____invoke__h21af4bfb35f9aaf6(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return ret;
    } finally {
        state0.a = state0.b = 0;
    }
};

exports.__wbg_new_from_slice_f9c22b9153b26992 = function(arg0, arg1) {
    const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
    return ret;
};

exports.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
};

exports.__wbg_new_with_length_aa5eaf41d35235e5 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return ret;
};

exports.__wbg_new_with_str_and_init_c5748f76f5108934 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
    return ret;
}, arguments) };

exports.__wbg_next_138a17bbf04e926c = function(arg0) {
    const ret = arg0.next;
    return ret;
};

exports.__wbg_next_3cfe5c0fe2a4cc53 = function() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments) };

exports.__wbg_node_905d3e251edff8a2 = function(arg0) {
    const ret = arg0.node;
    return ret;
};

exports.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
    const ret = arg0.process;
    return ret;
};

exports.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
};

exports.__wbg_queueMicrotask_9b549dfce8865860 = function(arg0) {
    const ret = arg0.queueMicrotask;
    return ret;
};

exports.__wbg_queueMicrotask_fca69f5bfad613a5 = function(arg0) {
    queueMicrotask(arg0);
};

exports.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
    arg0.randomFillSync(arg1);
}, arguments) };

exports.__wbg_readFileSync_54692e4721ef9bed = function(arg0, arg1, arg2) {
    const ret = readFileSync(getStringFromWasm0(arg1, arg2));
    const ptr1 = passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
    const ret = module.require;
    return ret;
}, arguments) };

exports.__wbg_resolve_fd5bfbaa4ce36e1e = function(arg0) {
    const ret = Promise.resolve(arg0);
    return ret;
};

exports.__wbg_setTimeout_35a07631c669fbee = function(arg0, arg1) {
    const ret = setTimeout(arg0, arg1);
    return ret;
};

exports.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
};

exports.__wbg_set_781438a03c0c3c81 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(arg0, arg1, arg2);
    return ret;
}, arguments) };

exports.__wbg_set_7df433eea03a5c14 = function(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
};

exports.__wbg_set_body_8e743242d6076a4f = function(arg0, arg1) {
    arg0.body = arg1;
};

exports.__wbg_set_cache_0e437c7c8e838b9b = function(arg0, arg1) {
    arg0.cache = __wbindgen_enum_RequestCache[arg1];
};

exports.__wbg_set_credentials_55ae7c3c106fd5be = function(arg0, arg1) {
    arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
};

exports.__wbg_set_efaaf145b9377369 = function(arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2);
    return ret;
};

exports.__wbg_set_headers_5671cf088e114d2b = function(arg0, arg1) {
    arg0.headers = arg1;
};

exports.__wbg_set_method_76c69e41b3570627 = function(arg0, arg1, arg2) {
    arg0.method = getStringFromWasm0(arg1, arg2);
};

exports.__wbg_set_mode_611016a6818fc690 = function(arg0, arg1) {
    arg0.mode = __wbindgen_enum_RequestMode[arg1];
};

exports.__wbg_set_signal_e89be862d0091009 = function(arg0, arg1) {
    arg0.signal = arg1;
};

exports.__wbg_signal_3c14fbdc89694b39 = function(arg0) {
    const ret = arg0.signal;
    return ret;
};

exports.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg_static_accessor_ENV_5d0f4ff88e4babb9 = function() {
    const ret = env;
    return ret;
};

exports.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

exports.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

exports.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

exports.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
};

exports.__wbg_status_9bfc680efca4bdfd = function(arg0) {
    const ret = arg0.status;
    return ret;
};

exports.__wbg_stringify_655a6390e1f5eb6b = function() { return handleError(function (arg0) {
    const ret = JSON.stringify(arg0);
    return ret;
}, arguments) };

exports.__wbg_subarray_845f2f5bce7d061a = function(arg0, arg1, arg2) {
    const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
    return ret;
};

exports.__wbg_then_429f7caf1026411d = function(arg0, arg1, arg2) {
    const ret = arg0.then(arg1, arg2);
    return ret;
};

exports.__wbg_then_4f95312d68691235 = function(arg0, arg1) {
    const ret = arg0.then(arg1);
    return ret;
};

exports.__wbg_url_b6d11838a4f95198 = function(arg0, arg1) {
    const ret = arg1.url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

exports.__wbg_value_57b7b035e117f7ee = function(arg0) {
    const ret = arg0.value;
    return ret;
};

exports.__wbg_versions_c01dfd4722a88165 = function(arg0) {
    const ret = arg0.versions;
    return ret;
};

exports.__wbg_writeFileSync_fa9a4ee30d997011 = function(arg0, arg1, arg2, arg3) {
    writeFileSync(getStringFromWasm0(arg0, arg1), getArrayU8FromWasm0(arg2, arg3));
};

exports.__wbindgen_cast_14e57f16507b657b = function(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { dtor_idx: 632, function: Function { arguments: [Externref], shim_idx: 633, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__hbb3e147482ea61e2, wasm_bindgen__convert__closures_____invoke__h9ed329622efc412d);
    return ret;
};

exports.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

exports.__wbindgen_cast_2ddd8a25ff58642a = function(arg0, arg1) {
    // Cast intrinsic for `I128 -> Externref`.
    const ret = (BigInt.asUintN(64, arg0) | (arg1 << BigInt(64)));
    return ret;
};

exports.__wbindgen_cast_43e4292ee01a9b07 = function(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { dtor_idx: 426, function: Function { arguments: [], shim_idx: 427, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h9c039d0214d8894f, wasm_bindgen__convert__closures_____invoke__h0d2643c9e9fdcb5b);
    return ret;
};

exports.__wbindgen_cast_4625c577ab2ec9ee = function(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
};

exports.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
    // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
    const ret = getArrayU8FromWasm0(arg0, arg1);
    return ret;
};

exports.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
};

exports.__wbindgen_cast_e7b45dd881f38ce3 = function(arg0, arg1) {
    // Cast intrinsic for `U128 -> Externref`.
    const ret = (BigInt.asUintN(64, arg0) | (BigInt.asUintN(64, arg1) << BigInt(64)));
    return ret;
};

exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
};

const wasmPath = `${__dirname}/clarinet_sdk_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
const wasm = exports.__wasm = new WebAssembly.Instance(wasmModule, imports).exports;

wasm.__wbindgen_start();
