/**
 * nyan< script Chrome Extension - Content Script
 * 全ページで<nyscript>タグを検出して自動実行
 */

(async function() {
    'use strict';
    
    // ページにnyan< script拡張が有効であることを通知
    window.__NYANSCRIPT_EXTENSION_LOADED__ = true;
    
    // カスタムイベントを発火（検出スクリプト用）
    window.dispatchEvent(new CustomEvent('nyanscript-extension-ready'));
    
    console.log('🐱 nyan< script extension loaded!');
    
    // <nyscript>タグを全て検出
    const nyscriptTags = document.querySelectorAll('nyscript');
    
    if (nyscriptTags.length === 0) {
        return;
    }
    
    console.log(`🐱 Found ${nyscriptTags.length} nyscript tag(s)`);
    
    // 各nyscriptタグを処理
    for (const tag of nyscriptTags) {
        try {
            let code = '';
            
            // src属性がある場合は外部ファイルを読み込み
            if (tag.hasAttribute('src')) {
                const src = tag.getAttribute('src');
                console.log(`🐱 Loading: ${src}`);
                
                try {
                    const response = await fetch(src);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${src}`);
                    }
                    code = await response.text();
                    console.log(`🐱 Loaded: ${src}`);
                } catch (error) {
                    console.error(`🐱 Error loading ${src}:`, error);
                    displayError(tag, `ファイル読み込みエラー: ${src}\n${error.message}`);
                    continue;
                }
            } else {
                // タグ内に直接書かれたコード
                code = tag.textContent;
            }
            
            if (!code.trim()) {
                continue;
            }
            
            // インタプリタで実行
            const interpreter = new NyanScriptInterpreter();
            const output = interpreter.run(code);
            
            // 出力を表示
            if (output) {
                displayOutput(tag, output);
            }
            
        } catch (error) {
            console.error('🐱 nyan< script execution error:', error);
            displayError(tag, error.message);
        }
    }
    
    /**
     * 出力を表示
     */
    function displayOutput(scriptTag, output) {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'nyanscript-output';
        outputDiv.style.cssText = `
            background: linear-gradient(135deg, #fff5f7 0%, #fff 100%);
            border-left: 4px solid #ff69b4;
            padding: 15px 20px;
            margin: 15px 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            white-space: pre-wrap;
            color: #333;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(255, 105, 180, 0.1);
        `;
        
        // HTMLエスケープ（セキュリティ対策）
        const escapeHTML = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        outputDiv.innerHTML = `
            <div style="font-weight: bold; color: #ff69b4; margin-bottom: 8px; font-size: 12px;">
                🐱 nyan&lt; script output
            </div>
            <pre style="margin: 0; font-family: inherit; font-size: 14px; line-height: 1.5;">${escapeHTML(output)}</pre>
        `;
        
        scriptTag.parentNode.insertBefore(outputDiv, scriptTag.nextSibling);
    }
    
    /**
     * エラーを表示
     */
    function displayError(scriptTag, errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'nyanscript-error';
        errorDiv.style.cssText = `
            background: #fff3cd;
            border-left: 4px solid #ff0000;
            padding: 15px 20px;
            margin: 15px 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            color: #856404;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(255, 0, 0, 0.1);
        `;
        
        const escapeHTML = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        errorDiv.innerHTML = `
            <div style="font-weight: bold; color: #ff0000; margin-bottom: 8px; font-size: 12px;">
                ⚠️ nyan&lt; script error
            </div>
            <pre style="margin: 0; font-family: inherit; font-size: 13px; line-height: 1.5;">${escapeHTML(errorMessage)}</pre>
        `;
        
        scriptTag.parentNode.insertBefore(errorDiv, scriptTag.nextSibling);
    }
    
})();
