/**
 * nyan< script Extension Detector
 * Webページに組み込んで拡張機能の有無を検出
 * 拡張機能がない場合はインストールを促す
 */

(function() {
    'use strict';
    
    // 拡張機能がロードされたかチェック
    let extensionDetected = false;
    
    // 拡張機能からのイベントを待つ
    window.addEventListener('nyanscript-extension-ready', function() {
        extensionDetected = true;
        console.log('✅ nyan< script extension detected');
    });
    
    // ページロード後、拡張機能の有無を確認
    window.addEventListener('DOMContentLoaded', function() {
        // 少し待ってから確認（拡張機能の読み込み待ち）
        setTimeout(function() {
            checkExtension();
        }, 500);
    });
    
    function checkExtension() {
        // グローバル変数でも確認
        if (window.__NYANSCRIPT_EXTENSION_LOADED__) {
            extensionDetected = true;
        }
        
        // nyscriptタグがあるかチェック
        const nyscriptTags = document.querySelectorAll('nyscript');
        
        if (nyscriptTags.length === 0) {
            // nyscriptタグがなければ何もしない
            return;
        }
        
        if (!extensionDetected) {
            // 拡張機能が見つからない場合
            console.warn('⚠️ nyan< script extension not found');
            showInstallPrompt(nyscriptTags.length);
        }
    }
    
    function showInstallPrompt(scriptCount) {
        // インストール促進バナーを表示
        const banner = document.createElement('div');
        banner.id = 'nyanscript-install-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 999999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideDown 0.3s ease-out;
        `;
        
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                <div style="font-size: 24px;">🐱</div>
                <div>
                    <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
                        nyan&lt; script拡張機能が必要です
                    </div>
                    <div style="font-size: 13px; opacity: 0.9;">
                        このページには${scriptCount}個のnyan&lt; scriptが含まれています。
                        拡張機能をインストールして実行してください。
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="nyanscript-install-btn" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                    transition: transform 0.2s;
                ">
                    インストール方法を見る
                </button>
                <button id="nyanscript-close-btn" style="
                    background: transparent;
                    color: white;
                    border: 2px solid white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.2s;
                ">
                    閉じる
                </button>
            </div>
        `;
        
        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            #nyanscript-install-btn:hover {
                transform: scale(1.05);
            }
            #nyanscript-close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
        
        document.body.insertBefore(banner, document.body.firstChild);
        
        // インストールボタンのクリックイベント
        document.getElementById('nyanscript-install-btn').addEventListener('click', function() {
            showInstallInstructions();
        });
        
        // 閉じるボタンのクリックイベント
        document.getElementById('nyanscript-close-btn').addEventListener('click', function() {
            banner.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(function() {
                banner.remove();
            }, 300);
        });
    }
    
    function showInstallInstructions() {
        // インストール手順のモーダルを表示
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease-out;
            ">
                <h2 style="
                    color: #667eea;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    🐱 nyan&lt; script拡張機能のインストール
                </h2>
                
                <div style="line-height: 1.8; color: #333;">
                    <h3 style="color: #764ba2; margin: 20px 0 10px 0;">📦 インストール手順</h3>
                    <ol style="padding-left: 20px;">
                        <li style="margin-bottom: 10px;">
                            拡張機能ファイル（manifest.json, content-script.js, nyanscript-interpreter.js）をダウンロード
                        </li>
                        <li style="margin-bottom: 10px;">
                            Chromeで <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">chrome://extensions/</code> を開く
                        </li>
                        <li style="margin-bottom: 10px;">
                            右上の「デベロッパーモード」をON
                        </li>
                        <li style="margin-bottom: 10px;">
                            「パッケージ化されていない拡張機能を読み込む」をクリック
                        </li>
                        <li style="margin-bottom: 10px;">
                            ダウンロードしたフォルダを選択
                        </li>
                    </ol>
                    
                    <div style="
                        background: #e7f3ff;
                        border-left: 4px solid #667eea;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    ">
                        <strong>✨ インストール後</strong><br>
                        ページを再読み込みすると、nyan&lt; scriptが自動的に実行されます！
                    </div>
                    
                    <h3 style="color: #764ba2; margin: 20px 0 10px 0;">📥 ダウンロード</h3>
                    <p>
                        拡張機能ファイルは、このページを提供しているサーバーからダウンロードできます。
                    </p>
                </div>
                
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 20px;
                    width: 100%;
                ">
                    閉じる
                </button>
            </div>
        `;
        
        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from {
                    transform: translateY(30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        // 背景クリックで閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
})();
