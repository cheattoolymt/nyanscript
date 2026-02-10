/**
 * nyan< script Interpreter v1.0
 * 高速・安心安全・セキュリティ万全
 */

class NyanScriptInterpreter {
    constructor() {
        this.variables = {};
        this.functions = {};
        this.output = [];
    }

    // エスケープ処理（セキュリティ対策）
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // トークナイザー（コメント除去）
    tokenize(code) {
        code = code.replace(/#"[^"]*"#/g, '');
        return code;
    }

    // 式の評価
    evaluate(expr, localVars = {}) {
        expr = expr.trim();
        
        // 文字列リテラル
        if (expr.startsWith('"') && expr.endsWith('"')) {
            let str = expr.slice(1, -1);
            str = str.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
            return str;
        }
        
        // 数値リテラル
        if (/^-?\d+\.?\d*$/.test(expr)) {
            return parseFloat(expr);
        }
        
        // 配列リテラル
        if (expr.startsWith('[') && expr.endsWith(']')) {
            const content = expr.slice(1, -1);
            if (!content.trim()) return [];
            return content.split(',').map(item => this.evaluate(item.trim(), localVars));
        }
        
        // オブジェクトリテラル
        if (expr.startsWith('{') && expr.endsWith('}')) {
            const content = expr.slice(1, -1);
            const obj = {};
            if (content.trim()) {
                const pairs = content.split(',');
                pairs.forEach(pair => {
                    const colonIndex = pair.indexOf(':');
                    if (colonIndex !== -1) {
                        const key = pair.substring(0, colonIndex).trim();
                        const value = pair.substring(colonIndex + 1).trim();
                        obj[key] = this.evaluate(value, localVars);
                    }
                });
            }
            return obj;
        }
        
        // 配列アクセス arr[0]
        const arrayAccess = expr.match(/^(\w+)\[(.+)\]$/);
        if (arrayAccess) {
            const arrayName = arrayAccess[1];
            const index = this.evaluate(arrayAccess[2], localVars);
            const array = localVars[arrayName] || this.variables[arrayName];
            return array ? array[index] : undefined;
        }
        
        // オブジェクトアクセス obj.name
        const objAccess = expr.match(/^(\w+)\.(\w+)$/);
        if (objAccess) {
            const objName = objAccess[1];
            const propName = objAccess[2];
            const obj = localVars[objName] || this.variables[objName];
            return obj ? obj[propName] : undefined;
        }
        
        // 変数参照
        if (/^\w+$/.test(expr)) {
            return localVars[expr] !== undefined ? localVars[expr] : this.variables[expr];
        }
        
        // 算術演算（+）
        if (expr.includes('+')) {
            const parts = expr.split('+').map(p => p.trim());
            return parts.reduce((acc, part) => {
                const val = this.evaluate(part, localVars);
                return typeof acc === 'string' || typeof val === 'string' 
                    ? String(acc) + String(val) 
                    : acc + val;
            });
        }
        
        // 比較演算（==）
        if (expr.includes('==')) {
            const [left, right] = expr.split('==').map(p => p.trim());
            return this.evaluate(left, localVars) == this.evaluate(right, localVars);
        }
        
        return expr;
    }

    // console.outputx
    outputx(text) {
        this.output.push(String(text));
        if (typeof console !== 'undefined') {
            console.log(text);
        }
    }

    // console.inputx（ブラウザ環境）
    inputx(prompt, varName, localVars = {}) {
        const input = typeof window !== 'undefined' ? window.prompt(prompt) : '';
        if (varName) {
            if (Object.keys(localVars).length > 0) {
                localVars[varName] = input;
            } else {
                this.variables[varName] = input;
            }
        }
        return input;
    }

    // console.error
    errorOutput(message) {
        this.output.push(`ERROR: ${message}`);
        if (typeof console !== 'undefined') {
            console.error(message);
        }
    }

    // repeat文の実行
    executeRepeat(varName, count, body, localVars = {}) {
        const iterations = this.evaluate(count, localVars);
        for (let i = 0; i < iterations; i++) {
            const loopVars = {...localVars, [varName]: i};
            this.executeBlock(body, loopVars);
        }
    }

    // if文の実行
    executeIf(code, localVars = {}) {
        const ifMatch = code.match(/if\s+(.+?)\s+then\s*\{([^}]*)\}/);
        if (!ifMatch) return;
        
        const condition = ifMatch[1];
        const thenBlock = ifMatch[2];
        
        if (this.evaluate(condition, localVars)) {
            this.executeBlock(thenBlock, localVars);
            return;
        }
        
        // elif処理
        const elifMatches = code.matchAll(/elif\s+(.+?)\s+then\s*\{([^}]*)\}/g);
        for (const elifMatch of elifMatches) {
            const elifCondition = elifMatch[1];
            const elifBlock = elifMatch[2];
            if (this.evaluate(elifCondition, localVars)) {
                this.executeBlock(elifBlock, localVars);
                return;
            }
        }
        
        // else処理
        const elseMatch = code.match(/else\s*\{([^}]*)\}/);
        if (elseMatch) {
            this.executeBlock(elseMatch[1], localVars);
        }
    }

    // コードブロックの実行
    executeBlock(code, localVars = {}) {
        const lines = code.split('\n').map(l => l.trim()).filter(l => l);
        
        for (const line of lines) {
            this.executeLine(line, localVars);
        }
    }

    // 1行の実行
    executeLine(line, localVars = {}) {
        line = line.replace(/;$/, '').trim();
        if (!line) return;
        
        // 変数代入
        const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
        if (assignMatch) {
            const varName = assignMatch[1];
            const value = this.evaluate(assignMatch[2], localVars);
            if (Object.keys(localVars).length > 0) {
                localVars[varName] = value;
            } else {
                this.variables[varName] = value;
            }
            return;
        }
        
        // console.outputx
        const outputMatch = line.match(/console\.outputx\((.+)\)/);
        if (outputMatch) {
            const value = this.evaluate(outputMatch[1], localVars);
            this.outputx(value);
            return;
        }
        
        // console.inputx
        const inputMatch = line.match(/console\.inputx\("([^"]+)",\s*(\w+)\)/);
        if (inputMatch) {
            const prompt = inputMatch[1];
            const varName = inputMatch[2];
            this.inputx(prompt, varName, localVars);
            return;
        }
        
        // console.error
        const errorMatch = line.match(/console\.error\((.+)\)/);
        if (errorMatch) {
            const value = this.evaluate(errorMatch[1], localVars);
            this.errorOutput(value);
            return;
        }
    }

    // プログラム全体の実行
    run(code) {
        this.output = [];
        code = this.tokenize(code);
        
        // $pull処理（簡易版）
        code = code.replace(/\$pull\s+<[^>]+>/g, '');
        
        // 関数定義の抽出
        const funcMatches = code.matchAll(/def\s+(\w+)\(([^)]*)\)\s*\{([^}]+)\}/g);
        for (const match of funcMatches) {
            const funcName = match[1];
            const params = match[2].split(',').map(p => p.trim()).filter(p => p);
            const body = match[3];
            this.functions[funcName] = {params, body};
        }
        
        // 関数定義を除去
        code = code.replace(/def\s+\w+\([^)]*\)\s*\{[^}]+\}/g, '');
        
        // repeat文の処理
        const repeatMatches = [...code.matchAll(/repeat\s+(\w+)\s+(\d+)\s*\{([^}]+)\}/g)];
        for (const match of repeatMatches) {
            this.executeRepeat(match[1], match[2], match[3]);
        }
        code = code.replace(/repeat\s+\w+\s+\d+\s*\{[^}]+\}/g, '');
        
        // if文の処理
        const ifPattern = /if\s+.+?\s+then\s*\{[^}]*\}(?:\s*elif\s+.+?\s+then\s*\{[^}]*\})*(?:\s*else\s*\{[^}]*\})?/g;
        const ifMatches = [...code.matchAll(ifPattern)];
        for (const match of ifMatches) {
            this.executeIf(match[0]);
        }
        code = code.replace(ifPattern, '');
        
        // 残りのコードを実行
        this.executeBlock(code);
        
        return this.output.join('');
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.NyanScriptInterpreter = NyanScriptInterpreter;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NyanScriptInterpreter;
}
